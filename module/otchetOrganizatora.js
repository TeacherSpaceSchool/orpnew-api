const OtchetOrganizatora = require('../models/otchetOrganizatora');
const OtchetRealizatora = require('../models/otchetRealizatora');
const NakladnayaNaVecherniyVozvrat = require('../models/nakladnayaNaVecherniyVozvrat');
const NakladnayaSklad1 = require('../models/nakladnayaSklad1');
const NakladnayaSklad2 = require('../models/nakladnayaSklad2');
const {checkInt, checkDate} = require('../module/const');

const createOtchetOrganizatora = async (organizator, region, guidOrganizator, guidRegion) => {
    let object = new OtchetOrganizatora({
        dataTable: JSON.stringify({
            'p': {
                'i': 0,
                'm': {'v': 0, 'o': 0, 's': 0, 'pl': 0, 'ktt': 0, 'kd': 0, 'ps': 0},
                'ch': {'v': 0, 'o': 0, 's': 0, 'pl': 0, 'ktt': 0, 'kd': 0, 'ps': 0},
                'k': {'v': 0, 'o': 0, 's': 0, 'pl': 0, 'ktt': 0, 'kd': 0, 'ps': 0},
                'sl': {'v': 0, 'o': 0, 's': 0, 'pl': 0, 'ktt': 0, 'kd': 0, 'ps': 0},
                's02': {'v': 0, 'o': 0, 's': 0, 'pl': 0, 'ktt': 0, 'kd': 0, 'ps': 0},
                's04': {'v': 0, 'o': 0, 's': 0, 'pl': 0, 'ktt': 0, 'kd': 0, 'ps': 0},
                'b': {'v': 0, 'o': 0, 's': 0, 'pl': 0, 'ktt': 0, 'kd': 0, 'ps': 0},
            },
            'r': {
                'otr': 0,
                'oo': 200,
                'ntp': 0,
                'att': 0,
                'at': '',
                'vs': '',
                'inc': 0
            },
            'a': {
                'n': '',
                'r': '',
                'd1': '',
                'd2': '',
                'd3': '',
                's': '',
                'lkm': '',
            },
            'i': -200
        }),
        organizator,
        region,
        guidOrganizator,
        guidRegion,
        disabled: false,
    });
    object = await OtchetOrganizatora.create(object)
    return object
}

module.exports.calculateOtchetOrganizatora = async ({region, guidRegion, organizator, guidOrganizator, date}) => {
    let dateStart, dateEnd, tomorrowDateStart, tomorrowDateEnd
    dateStart = checkDate(date)
    dateStart.setHours(0, 0, 0, 0)
    dateEnd = new Date(dateStart)
    dateEnd.setDate(dateEnd.getDate() + 1)

    tomorrowDateStart = new Date(dateStart)
    tomorrowDateStart.setDate(tomorrowDateStart.getDate() + 1)
    tomorrowDateStart.setHours(0, 0, 0, 0)
    tomorrowDateEnd = new Date(tomorrowDateStart)
    tomorrowDateEnd.setDate(tomorrowDateEnd.getDate() + 1)

    let findOtchetOrganizatora = await OtchetOrganizatora.findOne({
        $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}}],
        region
    })
    if(findOtchetOrganizatora===null)
        findOtchetOrganizatora = await createOtchetOrganizatora(organizator, region)

    let findOtchetRealizators = await OtchetRealizatora.find({
        $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}}],
        region
    }).lean()

    let findNakladnayaNaVecherniyVozvrat = await NakladnayaNaVecherniyVozvrat.findOne({
        $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}}],
        region
    })
    let findDataNakladnayaNaVecherniyVozvrat
    if(!findNakladnayaNaVecherniyVozvrat){
        findNakladnayaNaVecherniyVozvrat = new NakladnayaNaVecherniyVozvrat({
            dataTable: JSON.stringify({
                'm': {'all': 0, 'data': []},
                'k': {'all': 0, 'data': []},
            }),
            organizator,
            region,
            guidOrganizator,
            guidRegion
        });
        findNakladnayaNaVecherniyVozvrat = await NakladnayaNaVecherniyVozvrat.create(findNakladnayaNaVecherniyVozvrat)
    }
    findDataNakladnayaNaVecherniyVozvrat = JSON.parse(findNakladnayaNaVecherniyVozvrat.dataTable)
    findDataNakladnayaNaVecherniyVozvrat['m']['data'] = []
    findDataNakladnayaNaVecherniyVozvrat['k']['data'] = []
    findDataNakladnayaNaVecherniyVozvrat['m']['all'] = 0
    findDataNakladnayaNaVecherniyVozvrat['k']['all'] = 0
    for(let i = 0; i<findOtchetRealizators.length; i++){
        let addDataTable = JSON.parse(findOtchetRealizators[i].dataTable)
        if(checkInt(addDataTable.vozvrat.v.ml)>0) {
            findDataNakladnayaNaVecherniyVozvrat['m']['data'].push({
                'l': addDataTable.vozvrat.v.ml
            })
            findDataNakladnayaNaVecherniyVozvrat['m']['all'] += checkInt(addDataTable.vozvrat.v.ml)
        }
        if(checkInt(addDataTable.vozvrat.v.kl)>0) {
            findDataNakladnayaNaVecherniyVozvrat['k']['data'].push({
                'l': addDataTable.vozvrat.v.kl
            })
            findDataNakladnayaNaVecherniyVozvrat['k']['all'] += checkInt(addDataTable.vozvrat.v.kl)
        }
    }
    findNakladnayaNaVecherniyVozvrat.dataTable = JSON.stringify(findDataNakladnayaNaVecherniyVozvrat)
    await findNakladnayaNaVecherniyVozvrat.save()

    let findNakladnayaSklad1 = await NakladnayaSklad1.findOne({
        $and: [{date: {$gte: tomorrowDateStart}}, {date: {$lt: tomorrowDateEnd}}],
        region
    })
    if(!findNakladnayaSklad1){
        findNakladnayaSklad1 = new NakladnayaSklad1({
            date: tomorrowDateStart,
            dataTable: JSON.stringify({
                'vydano': {
                    'n':
                        {'m25':'', 'ml':'', 'ch25':'', 'ch10':'', 'chl':'', 'k25':'', 'k10':'', 'kl':''},
                    'r':
                        {'m25':'', 'ml':'', 'ch25':'', 'ch10':'', 'chl':'', 'k25':'', 'k10':'', 'kl':''},
                    'd1':
                        {'m25':'', 'ml':'', 'ch25':'', 'ch10':'', 'chl':'', 'k25':'', 'k10':'', 'kl':''},
                    'd2':
                        {'m25':'', 'ml':'', 'ch25':'', 'ch10':'', 'chl':'', 'k25':'', 'k10':'', 'kl':''},
                    'd3':
                        {'m25':'', 'ml':'', 'ch25':'', 'ch10':'', 'chl':'', 'k25':'', 'k10':'', 'kl':''},
                    'i':
                        {'m25':'', 'ml':'', 'ch25':'', 'ch10':'', 'chl':'', 'k25':'', 'k10':'', 'kl':''},
                },
                'vozvrat': {
                    'n':
                        {'m25':'', 'ml':'', 'ch25':'', 'ch10':'', 'chl':'', 'k25':'', 'k10':'', 'kl':''},
                    'r':
                        {'m25':'', 'ml':'', 'ch25':'', 'ch10':'', 'chl':'', 'k25':'', 'k10':'', 'kl':''},
                    'd1':
                        {'m25':'', 'ml':'', 'ch25':'', 'ch10':'', 'chl':'', 'k25':'', 'k10':'', 'kl':''},
                    'd2':
                        {'m25':'', 'ml':'', 'ch25':'', 'ch10':'', 'chl':'', 'k25':'', 'k10':'', 'kl':''},
                    'd3':
                        {'m25':'', 'ml':'', 'ch25':'', 'ch10':'', 'chl':'', 'k25':'', 'k10':'', 'kl':''},
                    's':
                        {'m25':'', 'ml':'', 'ch25':'', 'ch10':'', 'chl':'', 'k25':'', 'k10':'', 'kl':''},
                    'i':
                        {'m25':'', 'ml':'', 'ch25':'', 'ch10':'', 'chl':'', 'k25':'', 'k10':'', 'kl':''},
                },
            }),
            organizator,
            region,
            guidOrganizator,
            guidRegion
        });
        findNakladnayaSklad1 = await NakladnayaSklad1.create(findNakladnayaSklad1)
    }
    let findDataNakladnayaSklad1 = JSON.parse(findNakladnayaSklad1.dataTable)
    findDataNakladnayaSklad1['vydano']['n']['ch25'] = 0
    findDataNakladnayaSklad1['vydano']['n']['ch10'] = 0
    findDataNakladnayaSklad1['vydano']['n']['chl'] = 0
    for(let i = 0; i<findOtchetRealizators.length; i++){
        let addDataTable = JSON.parse(findOtchetRealizators[i].dataTable)
        if(checkInt(addDataTable.vozvrat.v.chl)>0){
            findDataNakladnayaSklad1['vydano']['n']['chl'] += checkInt(addDataTable.vozvrat.v.chl)
            findDataNakladnayaSklad1['vydano']['n']['ch25'] += 1
        }
    }
    findDataNakladnayaSklad1['vydano']['i']['chl'] = checkInt(findDataNakladnayaSklad1['vydano']['n']['chl']) + checkInt(findDataNakladnayaSklad1['vydano']['r']['chl']) + checkInt(findDataNakladnayaSklad1['vydano']['d1']['chl']) + checkInt(findDataNakladnayaSklad1['vydano']['d2']['chl']) + checkInt(findDataNakladnayaSklad1['vydano']['d3']['chl'])
    findDataNakladnayaSklad1['vydano']['i']['ch10'] = checkInt(findDataNakladnayaSklad1['vydano']['n']['ch10']) + checkInt(findDataNakladnayaSklad1['vydano']['r']['ch10']) + checkInt(findDataNakladnayaSklad1['vydano']['d1']['ch10']) + checkInt(findDataNakladnayaSklad1['vydano']['d2']['ch10']) + checkInt(findDataNakladnayaSklad1['vydano']['d3']['ch10'])
    findDataNakladnayaSklad1['vydano']['i']['ch25'] = checkInt(findDataNakladnayaSklad1['vydano']['n']['ch25']) + checkInt(findDataNakladnayaSklad1['vydano']['r']['ch25']) + checkInt(findDataNakladnayaSklad1['vydano']['d1']['ch25']) + checkInt(findDataNakladnayaSklad1['vydano']['d2']['ch25']) + checkInt(findDataNakladnayaSklad1['vydano']['d3']['ch25'])
    findNakladnayaSklad1.dataTable = JSON.stringify(findDataNakladnayaSklad1)
    await findNakladnayaSklad1.save()

    findNakladnayaSklad1 = await NakladnayaSklad1.findOne({
        $and: [{date: {$gte: dateStart}}, {date: {$lt: dateEnd}}],
        region
    })
    if(!findNakladnayaSklad1){
        findNakladnayaSklad1 = new NakladnayaSklad1({
            date: new Date(),
            dataTable: JSON.stringify({
                'vydano': {
                    'n':
                        {'m25':'', 'ml':'', 'ch25':'', 'ch10':'', 'chl':'', 'k25':'', 'k10':'', 'kl':''},
                    'r':
                        {'m25':'', 'ml':'', 'ch25':'', 'ch10':'', 'chl':'', 'k25':'', 'k10':'', 'kl':''},
                    'd1':
                        {'m25':'', 'ml':'', 'ch25':'', 'ch10':'', 'chl':'', 'k25':'', 'k10':'', 'kl':''},
                    'd2':
                        {'m25':'', 'ml':'', 'ch25':'', 'ch10':'', 'chl':'', 'k25':'', 'k10':'', 'kl':''},
                    'd3':
                        {'m25':'', 'ml':'', 'ch25':'', 'ch10':'', 'chl':'', 'k25':'', 'k10':'', 'kl':''},
                    'i':
                        {'m25':'', 'ml':'', 'ch25':'', 'ch10':'', 'chl':'', 'k25':'', 'k10':'', 'kl':''},
                },
                'vozvrat': {
                    'n':
                        {'m25':'', 'ml':'', 'ch25':'', 'ch10':'', 'chl':'', 'k25':'', 'k10':'', 'kl':''},
                    'r':
                        {'m25':'', 'ml':'', 'ch25':'', 'ch10':'', 'chl':'', 'k25':'', 'k10':'', 'kl':''},
                    'd1':
                        {'m25':'', 'ml':'', 'ch25':'', 'ch10':'', 'chl':'', 'k25':'', 'k10':'', 'kl':''},
                    'd2':
                        {'m25':'', 'ml':'', 'ch25':'', 'ch10':'', 'chl':'', 'k25':'', 'k10':'', 'kl':''},
                    'd3':
                        {'m25':'', 'ml':'', 'ch25':'', 'ch10':'', 'chl':'', 'k25':'', 'k10':'', 'kl':''},
                    's':
                        {'m25':'', 'ml':'', 'ch25':'', 'ch10':'', 'chl':'', 'k25':'', 'k10':'', 'kl':''},
                    'i':
                        {'m25':'', 'ml':'', 'ch25':'', 'ch10':'', 'chl':'', 'k25':'', 'k10':'', 'kl':''},
                },
            }),
            organizator,
            region,
            guidOrganizator,
            guidRegion
        });
        findNakladnayaSklad1 = await NakladnayaSklad1.create(findNakladnayaSklad1)
    }
    findDataNakladnayaSklad1 = JSON.parse(findNakladnayaSklad1.dataTable)
    findDataNakladnayaSklad1['vydano']['r']['ml'] = 0
    findDataNakladnayaSklad1['vydano']['r']['chl'] = 0
    findDataNakladnayaSklad1['vydano']['r']['kl'] = 0
    findDataNakladnayaSklad1['vydano']['d1']['ml'] = 0
    findDataNakladnayaSklad1['vydano']['d1']['chl'] = 0
    findDataNakladnayaSklad1['vydano']['d1']['kl'] = 0
    findDataNakladnayaSklad1['vydano']['d2']['ml'] = 0
    findDataNakladnayaSklad1['vydano']['d2']['chl'] = 0
    findDataNakladnayaSklad1['vydano']['d2']['kl'] = 0
    findDataNakladnayaSklad1['vydano']['d3']['ml'] = 0
    findDataNakladnayaSklad1['vydano']['d3']['chl'] = 0
    findDataNakladnayaSklad1['vydano']['d3']['kl'] = 0
    findDataNakladnayaSklad1['vozvrat']['n']['ch25'] = 0
    findDataNakladnayaSklad1['vozvrat']['n']['ch10'] = 0
    findDataNakladnayaSklad1['vozvrat']['n']['chl'] = 0
    findDataNakladnayaSklad1['vozvrat']['s']['ml'] = 0
    findDataNakladnayaSklad1['vozvrat']['s']['chl'] = 0
    findDataNakladnayaSklad1['vozvrat']['s']['kl'] = 0
    findDataNakladnayaSklad1['vozvrat']['s']['m25'] = 0
    findDataNakladnayaSklad1['vozvrat']['s']['ch25'] = 0
    findDataNakladnayaSklad1['vozvrat']['s']['ch10'] = 0
    findDataNakladnayaSklad1['vozvrat']['s']['k10'] = 0
    for(let i = 0; i<findOtchetRealizators.length; i++){
        let addDataTable = JSON.parse(findOtchetRealizators[i].dataTable)
        if(checkInt(addDataTable.vozvrat.v.chl)>0){
            findDataNakladnayaSklad1['vozvrat']['s']['chl'] += checkInt(addDataTable.vozvrat.v.chl)
            findDataNakladnayaSklad1['vozvrat']['n']['chl'] += checkInt(addDataTable.vozvrat.v.chl)
            findDataNakladnayaSklad1['vozvrat']['n']['ch25'] += 1
            findDataNakladnayaSklad1['vozvrat']['s']['ch25'] += 1
        }
        if(checkInt(addDataTable.vozvrat.v.ml)>0) {
            findDataNakladnayaSklad1['vozvrat']['s']['ml'] += checkInt(addDataTable.vozvrat.v.ml)
            findDataNakladnayaSklad1['vozvrat']['s']['m25'] += 1
        }
        if(checkInt(addDataTable.vozvrat.v.kl)>0) {
            findDataNakladnayaSklad1['vozvrat']['s']['kl'] += checkInt(addDataTable.vozvrat.v.kl)
            findDataNakladnayaSklad1['vozvrat']['s']['k10'] += 1
        }

        if(checkInt(addDataTable.vydano.r.ml)>0)
            findDataNakladnayaSklad1['vydano']['r']['ml'] += checkInt(addDataTable.vydano.r.ml)
        if(checkInt(addDataTable.vydano.r.chl)>0)
            findDataNakladnayaSklad1['vydano']['r']['chl'] += checkInt(addDataTable.vydano.r.chl)
        if(checkInt(addDataTable.vydano.r.kl)>0)
            findDataNakladnayaSklad1['vydano']['r']['kl'] += checkInt(addDataTable.vydano.r.kl)
        if(checkInt(addDataTable.vydano.d1.ml)>0)

            findDataNakladnayaSklad1['vydano']['d1']['ml'] += checkInt(addDataTable.vydano.d1.ml)
        if(checkInt(addDataTable.vydano.d1.chl)>0)
            findDataNakladnayaSklad1['vydano']['d1']['chl'] += checkInt(addDataTable.vydano.d1.chl)
        if(checkInt(addDataTable.vydano.d1.kl)>0)
            findDataNakladnayaSklad1['vydano']['d1']['kl'] += checkInt(addDataTable.vydano.d1.kl)
        if(checkInt(addDataTable.vydano.d2.ml)>0)

            findDataNakladnayaSklad1['vydano']['d2']['ml'] += checkInt(addDataTable.vydano.d2.ml)
        if(checkInt(addDataTable.vydano.d2.chl)>0)
            findDataNakladnayaSklad1['vydano']['d2']['chl'] += checkInt(addDataTable.vydano.d2.chl)
        if(checkInt(addDataTable.vydano.d2.kl)>0)
            findDataNakladnayaSklad1['vydano']['d2']['kl'] += checkInt(addDataTable.vydano.d2.kl)
        if(checkInt(addDataTable.vydano.d3.ml)>0)

            findDataNakladnayaSklad1['vydano']['d3']['ml'] += checkInt(addDataTable.vydano.d3.ml)
        if(checkInt(addDataTable.vydano.d3.chl)>0)
            findDataNakladnayaSklad1['vydano']['d3']['chl'] += checkInt(addDataTable.vydano.d3.chl)
        if(checkInt(addDataTable.vydano.d3.kl)>0)
            findDataNakladnayaSklad1['vydano']['d3']['kl'] += checkInt(addDataTable.vydano.d3.kl)
    }

    findDataNakladnayaSklad1['vydano']['i']['ml'] = checkInt(findDataNakladnayaSklad1['vydano']['n']['ml']) + checkInt(findDataNakladnayaSklad1['vydano']['r']['ml']) + checkInt(findDataNakladnayaSklad1['vydano']['d1']['ml']) + checkInt(findDataNakladnayaSklad1['vydano']['d2']['ml']) + checkInt(findDataNakladnayaSklad1['vydano']['d3']['ml'])
    findDataNakladnayaSklad1['vydano']['i']['kl'] = checkInt(findDataNakladnayaSklad1['vydano']['n']['kl']) + checkInt(findDataNakladnayaSklad1['vydano']['r']['kl']) + checkInt(findDataNakladnayaSklad1['vydano']['d1']['kl']) + checkInt(findDataNakladnayaSklad1['vydano']['d2']['kl']) + checkInt(findDataNakladnayaSklad1['vydano']['d3']['kl'])
    findDataNakladnayaSklad1['vydano']['i']['chl'] = checkInt(findDataNakladnayaSklad1['vydano']['n']['chl']) + checkInt(findDataNakladnayaSklad1['vydano']['r']['chl']) + checkInt(findDataNakladnayaSklad1['vydano']['d1']['chl']) + checkInt(findDataNakladnayaSklad1['vydano']['d2']['chl']) + checkInt(findDataNakladnayaSklad1['vydano']['d3']['chl'])

    findDataNakladnayaSklad1['vozvrat']['i']['ml'] = checkInt(findDataNakladnayaSklad1['vozvrat']['s']['ml']) + checkInt(findDataNakladnayaSklad1['vozvrat']['r']['ml']) + checkInt(findDataNakladnayaSklad1['vozvrat']['d1']['ml']) + checkInt(findDataNakladnayaSklad1['vozvrat']['d2']['ml']) + checkInt(findDataNakladnayaSklad1['vozvrat']['d3']['ml'])
    findDataNakladnayaSklad1['vozvrat']['i']['m25'] = checkInt(findDataNakladnayaSklad1['vozvrat']['s']['m25']) + checkInt(findDataNakladnayaSklad1['vozvrat']['r']['m25']) + checkInt(findDataNakladnayaSklad1['vozvrat']['d1']['m25']) + checkInt(findDataNakladnayaSklad1['vozvrat']['d2']['m25']) + checkInt(findDataNakladnayaSklad1['vozvrat']['d3']['m25'])
    findDataNakladnayaSklad1['vozvrat']['i']['m25'] = checkInt(findDataNakladnayaSklad1['vozvrat']['r']['m25']) + checkInt(findDataNakladnayaSklad1['vozvrat']['d1']['m25']) + checkInt(findDataNakladnayaSklad1['vozvrat']['d2']['m25']) + checkInt(findDataNakladnayaSklad1['vozvrat']['d3']['m25']) + checkInt(findDataNakladnayaSklad1['vozvrat']['s']['m25'])

    findDataNakladnayaSklad1['vozvrat']['i']['kl'] = checkInt(findDataNakladnayaSklad1['vozvrat']['s']['kl']) + checkInt(findDataNakladnayaSklad1['vozvrat']['r']['kl']) + checkInt(findDataNakladnayaSklad1['vozvrat']['d1']['kl']) + checkInt(findDataNakladnayaSklad1['vozvrat']['d2']['kl']) + checkInt(findDataNakladnayaSklad1['vozvrat']['d3']['kl'])
    findDataNakladnayaSklad1['vozvrat']['i']['k10'] = checkInt(findDataNakladnayaSklad1['vozvrat']['s']['k10']) + checkInt(findDataNakladnayaSklad1['vozvrat']['r']['k10']) + checkInt(findDataNakladnayaSklad1['vozvrat']['d1']['k10']) + checkInt(findDataNakladnayaSklad1['vozvrat']['d2']['k10']) + checkInt(findDataNakladnayaSklad1['vozvrat']['d3']['k10'])
    findDataNakladnayaSklad1['vozvrat']['i']['k10'] = checkInt(findDataNakladnayaSklad1['vozvrat']['r']['k10']) + checkInt(findDataNakladnayaSklad1['vozvrat']['d1']['k10']) + checkInt(findDataNakladnayaSklad1['vozvrat']['d2']['k10']) + checkInt(findDataNakladnayaSklad1['vozvrat']['d3']['k10']) + checkInt(findDataNakladnayaSklad1['vozvrat']['s']['k10'])

    findDataNakladnayaSklad1['vozvrat']['i']['chl'] = checkInt(findDataNakladnayaSklad1['vozvrat']['s']['chl']) + checkInt(findDataNakladnayaSklad1['vozvrat']['r']['chl']) + checkInt(findDataNakladnayaSklad1['vozvrat']['d1']['chl']) + checkInt(findDataNakladnayaSklad1['vozvrat']['d2']['chl']) + checkInt(findDataNakladnayaSklad1['vozvrat']['d3']['chl'])
    findDataNakladnayaSklad1['vozvrat']['i']['ch10'] = checkInt(findDataNakladnayaSklad1['vozvrat']['s']['ch10']) + checkInt(findDataNakladnayaSklad1['vozvrat']['r']['ch10']) + checkInt(findDataNakladnayaSklad1['vozvrat']['d1']['ch10']) + checkInt(findDataNakladnayaSklad1['vozvrat']['d2']['ch10']) + checkInt(findDataNakladnayaSklad1['vozvrat']['d3']['ch10'])
    findDataNakladnayaSklad1['vozvrat']['i']['ch25'] = checkInt(findDataNakladnayaSklad1['vozvrat']['s']['ch25']) + checkInt(findDataNakladnayaSklad1['vozvrat']['r']['ch25']) + checkInt(findDataNakladnayaSklad1['vozvrat']['d1']['ch25']) + checkInt(findDataNakladnayaSklad1['vozvrat']['d2']['ch25']) + checkInt(findDataNakladnayaSklad1['vozvrat']['d3']['ch25'])

    findNakladnayaSklad1.dataTable = JSON.stringify(findDataNakladnayaSklad1)
    await findNakladnayaSklad1.save()

    let findNakladnayaSklad2 = await NakladnayaSklad2.findOne({
        $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}}],
        region
    })
    if(!findNakladnayaSklad2){
        findNakladnayaSklad2 = new NakladnayaSklad2({
            dataTable: JSON.stringify({
                'vydano': {
                    'r':
                        {'s02':'', 'sh02':'', 's04':'', 'sh04':'', 'l':'', 'b':'', 'pm':'', 'pv':''},
                    'd1':
                        {'s02':'', 'sh02':'', 's04':'', 'sh04':'', 'l':'', 'b':'', 'pm':'', 'pv':''},
                    'd2':
                        {'s02':'', 'sh02':'', 's04':'', 'sh04':'', 'l':'', 'b':'', 'pm':'', 'pv':''},
                    'd3':
                        {'s02':'', 'sh02':'', 's04':'', 'sh04':'', 'l':'', 'b':'', 'pm':'', 'pv':''},
                    'i':
                        {'s02':'', 'sh02':'', 's04':'', 'sh04':'', 'l':'', 'b':'', 'pm':'', 'pv':''},
                },
                'vozvrat': {
                    'r':
                        {'s02':'', 'sh02':'', 's04':'', 'sh04':'', 'l':'', 'b':'', 'pm':'', 'pv':''},
                    'd1':
                        {'s02':'', 'sh02':'', 's04':'', 'sh04':'', 'l':'', 'b':'', 'pm':'', 'pv':''},
                    'd2':
                        {'s02':'', 'sh02':'', 's04':'', 'sh04':'', 'l':'', 'b':'', 'pm':'', 'pv':''},
                    'd3':
                        {'s02':'', 'sh02':'', 's04':'', 'sh04':'', 'l':'', 'b':'', 'pm':'', 'pv':''},
                    'i':
                        {'s02':'', 'sh02':'', 's04':'', 'sh04':'', 'l':'', 'b':'', 'pm':'', 'pv':''},
                    'v':
                        {'s02':'', 'sh02':'', 's04':'', 'sh04':'', 'l':'', 'b':'', 'pm':'', 'pv':''},
                    's':
                        {'s02':'', 's0502':'', 'sh02':'', 's04':'', 's0504':'', 'sh04':'', 'l':'', 'b':'', 'pm':'', 'pv':''},
                    'iv':
                        {'s02':'', 'sh02':'', 's04':'', 'sh04':'', 'l':'', 'b':'', 'pm':'', 'pv':''},
                }
            }),
            organizator,
            region,
            guidOrganizator,
            guidRegion
        });
        findNakladnayaSklad2 = await NakladnayaSklad2.create(findNakladnayaSklad2)
    }
    let findDataNakladnayaSklad2 = JSON.parse(findNakladnayaSklad2.dataTable)
    findDataNakladnayaSklad2['vydano']['r']['sh02'] = 0
    findDataNakladnayaSklad2['vydano']['r']['sh04'] = 0
    findDataNakladnayaSklad2['vydano']['r']['l'] = 0
    findDataNakladnayaSklad2['vydano']['r']['b'] = 0
    findDataNakladnayaSklad2['vydano']['d1']['sh02'] = 0
    findDataNakladnayaSklad2['vydano']['d1']['sh04'] = 0
    findDataNakladnayaSklad2['vydano']['d1']['l'] = 0
    findDataNakladnayaSklad2['vydano']['d1']['b'] = 0
    findDataNakladnayaSklad2['vydano']['d2']['sh02'] = 0
    findDataNakladnayaSklad2['vydano']['d2']['sh04'] = 0
    findDataNakladnayaSklad2['vydano']['d2']['l'] = 0
    findDataNakladnayaSklad2['vydano']['d2']['b'] = 0
    findDataNakladnayaSklad2['vydano']['d3']['sh02'] = 0
    findDataNakladnayaSklad2['vydano']['d3']['sh04'] = 0
    findDataNakladnayaSklad2['vydano']['d3']['l'] = 0
    findDataNakladnayaSklad2['vydano']['d3']['b'] = 0
    findDataNakladnayaSklad2['vozvrat']['s']['sh02'] = 0
    findDataNakladnayaSklad2['vozvrat']['s']['sh04'] = 0
    findDataNakladnayaSklad2['vozvrat']['s']['l'] = 0
    findDataNakladnayaSklad2['vozvrat']['s']['b'] = 0
    for(let i = 0; i<findOtchetRealizators.length; i++){
        let addDataTable = JSON.parse(findOtchetRealizators[i].dataTable)
        if(checkInt(addDataTable.vozvrat.v.s02)>0)
            findDataNakladnayaSklad2['vozvrat']['s']['sh02'] += checkInt(addDataTable.vozvrat.v.s02)
        if(checkInt(addDataTable.vozvrat.v.s04)>0)
            findDataNakladnayaSklad2['vozvrat']['s']['sh04'] += checkInt(addDataTable.vozvrat.v.s04)
        if(checkInt(addDataTable.vozvrat.v.sl)>0)
            findDataNakladnayaSklad2['vozvrat']['s']['l'] += checkInt(addDataTable.vozvrat.v.sl)
        if(checkInt(addDataTable.vozvrat.v.b)>0)
            findDataNakladnayaSklad2['vozvrat']['s']['b'] += checkInt(addDataTable.vozvrat.v.b)
        if(checkInt(addDataTable.vydano.r.s02)>0)
            findDataNakladnayaSklad2['vydano']['r']['sh02'] += checkInt(addDataTable.vydano.r.s02)
        if(checkInt(addDataTable.vydano.r.s04)>0)
            findDataNakladnayaSklad2['vydano']['r']['sh04'] += checkInt(addDataTable.vydano.r.s04)
        if(checkInt(addDataTable.vydano.r.sl)>0)
            findDataNakladnayaSklad2['vydano']['r']['l'] += checkInt(addDataTable.vydano.r.sl)
        if(checkInt(addDataTable.vydano.r.b)>0)
            findDataNakladnayaSklad2['vydano']['r']['b'] += checkInt(addDataTable.vydano.r.b)
        if(checkInt(addDataTable.vydano.d1.s02)>0)
            findDataNakladnayaSklad2['vydano']['d1']['sh02'] += checkInt(addDataTable.vydano.d1.s02)
        if(checkInt(addDataTable.vydano.d1.s04)>0)
            findDataNakladnayaSklad2['vydano']['d1']['sh04'] += checkInt(addDataTable.vydano.d1.s04)
        if(checkInt(addDataTable.vydano.d1.sl)>0)
            findDataNakladnayaSklad2['vydano']['d1']['l'] += checkInt(addDataTable.vydano.d1.sl)
        if(checkInt(addDataTable.vydano.d1.b)>0)
            findDataNakladnayaSklad2['vydano']['d1']['b'] += checkInt(addDataTable.vydano.d1.b)
        if(checkInt(addDataTable.vydano.d2.s02)>0)
            findDataNakladnayaSklad2['vydano']['d2']['sh02'] += checkInt(addDataTable.vydano.d2.s02)
        if(checkInt(addDataTable.vydano.d2.s04)>0)
            findDataNakladnayaSklad2['vydano']['d2']['sh04'] += checkInt(addDataTable.vydano.d2.s04)
        if(checkInt(addDataTable.vydano.d2.sl)>0)
            findDataNakladnayaSklad2['vydano']['d2']['l'] += checkInt(addDataTable.vydano.d2.sl)
        if(checkInt(addDataTable.vydano.d2.b)>0)
            findDataNakladnayaSklad2['vydano']['d2']['b'] += checkInt(addDataTable.vydano.d2.b)
        if(checkInt(addDataTable.vydano.d3.s02)>0)
            findDataNakladnayaSklad2['vydano']['d3']['sh02'] += checkInt(addDataTable.vydano.d3.s02)
        if(checkInt(addDataTable.vydano.d3.s04)>0)
            findDataNakladnayaSklad2['vydano']['d3']['sh04'] += checkInt(addDataTable.vydano.d3.s04)
        if(checkInt(addDataTable.vydano.d3.sl)>0)
            findDataNakladnayaSklad2['vydano']['d3']['l'] += checkInt(addDataTable.vydano.d3.sl)
        if(checkInt(addDataTable.vydano.d3.b)>0)
            findDataNakladnayaSklad2['vydano']['d3']['b'] += checkInt(addDataTable.vydano.d3.b)
    }
    findDataNakladnayaSklad2['vydano']['i']['sh02'] = checkInt(findDataNakladnayaSklad2['vydano']['r']['sh02']) + checkInt(findDataNakladnayaSklad2['vydano']['d1']['sh02']) + checkInt(findDataNakladnayaSklad2['vydano']['d2']['sh02']) + checkInt(findDataNakladnayaSklad2['vydano']['d3']['sh02'])
    findDataNakladnayaSklad2['vydano']['i']['sh04'] = checkInt(findDataNakladnayaSklad2['vydano']['r']['sh04']) + checkInt(findDataNakladnayaSklad2['vydano']['d1']['sh04']) + checkInt(findDataNakladnayaSklad2['vydano']['d2']['sh04']) + checkInt(findDataNakladnayaSklad2['vydano']['d3']['sh04'])
    findDataNakladnayaSklad2['vydano']['i']['l'] = checkInt(findDataNakladnayaSklad2['vydano']['r']['l']) + checkInt(findDataNakladnayaSklad2['vydano']['d1']['l']) + checkInt(findDataNakladnayaSklad2['vydano']['d2']['l']) + checkInt(findDataNakladnayaSklad2['vydano']['d3']['l'])
    findDataNakladnayaSklad2['vydano']['i']['b'] = checkInt(findDataNakladnayaSklad2['vydano']['r']['b']) + checkInt(findDataNakladnayaSklad2['vydano']['d1']['b']) + checkInt(findDataNakladnayaSklad2['vydano']['d2']['b']) + checkInt(findDataNakladnayaSklad2['vydano']['d3']['b'])
    findDataNakladnayaSklad2['vozvrat']['iv']['sh02'] = checkInt(findDataNakladnayaSklad2['vozvrat']['i']['sh02']) + checkInt(findDataNakladnayaSklad2['vozvrat']['v']['sh02']) + checkInt(findDataNakladnayaSklad2['vozvrat']['s']['sh02'])
    findDataNakladnayaSklad2['vozvrat']['iv']['sh04'] = checkInt(findDataNakladnayaSklad2['vozvrat']['i']['sh04']) + checkInt(findDataNakladnayaSklad2['vozvrat']['v']['sh04']) + checkInt(findDataNakladnayaSklad2['vozvrat']['s']['sh04'])
    findDataNakladnayaSklad2['vozvrat']['iv']['l'] = checkInt(findDataNakladnayaSklad2['vozvrat']['i']['l']) + checkInt(findDataNakladnayaSklad2['vozvrat']['v']['l']) + checkInt(findDataNakladnayaSklad2['vozvrat']['s']['l'])
    findDataNakladnayaSklad2['vozvrat']['iv']['b'] = checkInt(findDataNakladnayaSklad2['vozvrat']['i']['b']) + checkInt(findDataNakladnayaSklad2['vozvrat']['v']['b']) + checkInt(findDataNakladnayaSklad2['vozvrat']['s']['b'])
    findNakladnayaSklad2.dataTable = JSON.stringify(findDataNakladnayaSklad2)
    await findNakladnayaSklad2.save();

    let findDataTable = JSON.parse(findOtchetOrganizatora.dataTable)
    findDataTable.p.m.v = 0
    findDataTable.p.ch.v = 0
    findDataTable.p.k.v = 0
    findDataTable.p.sl.v = 0
    findDataTable.p.s02.v = 0
    findDataTable.p.s04.v = 0
    findDataTable.p.b.v = 0
    findDataTable.p.m.o = 0
    findDataTable.p.ch.o = 0
    findDataTable.p.k.o = 0
    findDataTable.p.sl.o = 0
    findDataTable.p.s02.o = 0
    findDataTable.p.s04.o = 0
    findDataTable.p.b.o = 0
    findDataTable.p.m.s = 0
    findDataTable.p.ch.s = 0
    findDataTable.p.k.s = 0
    findDataTable.p.sl.s = 0
    findDataTable.p.s02.s = 0
    findDataTable.p.s04.s = 0
    findDataTable.p.b.s = 0
    findDataTable.p.m.pl = 0
    findDataTable.p.ch.pl = 0
    findDataTable.p.k.pl = 0
    findDataTable.p.sl.pl = 0
    findDataTable.p.s02.pl = 0
    findDataTable.p.s04.pl = 0
    findDataTable.p.b.pl = 0
    findDataTable.p.m.ps = 0
    findDataTable.p.ch.ps = 0
    findDataTable.p.k.ps = 0
    findDataTable.p.sl.ps = 0
    findDataTable.p.s02.ps = 0
    findDataTable.p.s04.ps = 0
    findDataTable.p.b.ps = 0
    findDataTable.p.m.ktt = findOtchetRealizators.length
    findDataTable.p.ch.ktt = findOtchetRealizators.length
    findDataTable.p.k.ktt = findOtchetRealizators.length
    findDataTable.p.sl.ktt = findOtchetRealizators.length
    findDataTable.p.s02.ktt = findOtchetRealizators.length
    findDataTable.p.s04.ktt = findOtchetRealizators.length
    findDataTable.p.b.ktt = findOtchetRealizators.length
    findDataTable.r.otr = findOtchetRealizators.length*100
    findDataTable.r.ntp = 0
    findDataTable.r.att = 0
    findDataTable.r.inc = 0
    findDataTable['p']['i'] = 0
    findDataTable['i'] = 0
    let dolivkiM = [], dolivkiCh = [], dolivkiK = [], dolivkiSl = [], dolivkiS02 = [], dolivkiS04 = [], dolivkiB = []
    if(findDataTable['time']===undefined){
        findDataTable['time'] = {
            'r': '',
            'd1': '',
            'd2': '',
            'd3': '',
            's': '',
        }
    }
    for(let i = 0; i<findOtchetRealizators.length; i++){
        let addDataTable = JSON.parse(findOtchetRealizators[i].dataTable)
        if(findDataTable['time']['r'].length===0&&addDataTable.vydano.r.time.length>0){
            findDataTable['time']['r'] = addDataTable.vydano.r.time
        }
        if(findDataTable['time']['d1'].length===0&&addDataTable.vydano.d1.time.length>0){
            findDataTable['time']['d1'] = addDataTable.vydano.d1.time
        }
        if(findDataTable['time']['d2'].length===0&&addDataTable.vydano.d2.time.length>0){
            findDataTable['time']['d2'] = addDataTable.vydano.d2.time
        }
        if(findDataTable['time']['d3'].length===0&&addDataTable.vydano.d3.time.length>0){
            findDataTable['time']['d3'] = addDataTable.vydano.d3.time
        }
        if(findDataTable['time']['s'].length===0&&addDataTable.vozvrat.v.time.length>0){
            findDataTable['time']['s'] = addDataTable.vozvrat.v.time
        }
        if(addDataTable.vydano.d3.ml.length>0){
            dolivkiM[i]=3
        }
        else if(addDataTable.vydano.d2.ml.length>0){
            dolivkiM[i]=2
        }
        else if(addDataTable.vydano.d1.ml.length>0){
            dolivkiM[i]=1
        }
        else {
            dolivkiM[i]=0
        }
        if(addDataTable.vydano.d3.kl.length>0){
            dolivkiK[i]=3
        }
        else if(addDataTable.vydano.d2.kl.length>0){
            dolivkiK[i]=2
        }
        else if(addDataTable.vydano.d1.kl.length>0){
            dolivkiK[i]=1
        }
        else {
            dolivkiK[i]=0
        }
        if(addDataTable.vydano.d3.chl.length>0){
            dolivkiCh[i]=3
        }
        else if(addDataTable.vydano.d2.chl.length>0){
            dolivkiCh[i]=2
        }
        else if(addDataTable.vydano.d1.chl.length>0){
            dolivkiCh[i]=1
        }
        else {
            dolivkiCh[i]=0
        }
        if(addDataTable.vydano.d3.sl.length>0){
            dolivkiSl[i]=3
        }
        else if(addDataTable.vydano.d2.sl.length>0){
            dolivkiSl[i]=2
        }
        else if(addDataTable.vydano.d1.sl.length>0){
            dolivkiSl[i]=1
        }
        else {
            dolivkiSl[i]=0
        }
        if(addDataTable.vydano.d3.s02.length>0){
            dolivkiS02[i]=3
        }
        else if(addDataTable.vydano.d2.s02.length>0){
            dolivkiS02[i]=2
        }
        else if(addDataTable.vydano.d1.s02.length>0){
            dolivkiS02[i]=1
        }
        else {
            dolivkiS02[i]=0
        }
        if(addDataTable.vydano.d3.s04.length>0){
            dolivkiS04[i]=3
        }
        else if(addDataTable.vydano.d2.s04.length>0){
            dolivkiS04[i]=2
        }
        else if(addDataTable.vydano.d1.s04.length>0){
            dolivkiS04[i]=1
        }
        else {
            dolivkiS04[i]=0
        }
        if(addDataTable.vydano.d3.b!==0){
            dolivkiB[i]=3
        }
        if(addDataTable.vydano.d1.b){
            dolivkiB[i]=1
        }
        if(addDataTable.vydano.d2.b!==0){
            dolivkiB[i]=2
        }
        findDataTable.p.m.v += checkInt(addDataTable.vydano.i.ml)
        findDataTable.p.ch.v += checkInt(addDataTable.vydano.i.chl)
        findDataTable.p.k.v += checkInt(addDataTable.vydano.i.kl)
        findDataTable.p.sl.v += checkInt(addDataTable.vydano.i.sl)
        findDataTable.p.s02.v += checkInt(addDataTable.vydano.i.s02)
        findDataTable.p.s04.v += checkInt(addDataTable.vydano.i.s04)
        findDataTable.p.b.v += checkInt(addDataTable.vydano.i.b)

        findDataTable.p.m.o += checkInt(addDataTable.vozvrat.v.ml)
        findDataTable.p.ch.o += checkInt(addDataTable.vozvrat.v.chl)
        findDataTable.p.k.o += checkInt(addDataTable.vozvrat.v.kl)
        findDataTable.p.sl.o += checkInt(addDataTable.vozvrat.v.sl)
        findDataTable.p.s02.o += checkInt(addDataTable.vozvrat.v.s02)
        findDataTable.p.s04.o += checkInt(addDataTable.vozvrat.v.s04)
        findDataTable.p.b.o += checkInt(addDataTable.vozvrat.v.b)

        findDataTable.p.m.s += checkInt(addDataTable.vozvrat.s.ml)
        findDataTable.p.ch.s += checkInt(addDataTable.vozvrat.s.chl)
        findDataTable.p.k.s += checkInt(addDataTable.vozvrat.s.kl)
        findDataTable.p.sl.s += checkInt(addDataTable.vozvrat.s.sl)
        findDataTable.p.s02.s += checkInt(addDataTable.vozvrat.s.s02)
        findDataTable.p.s04.s += checkInt(addDataTable.vozvrat.s.s04)
        findDataTable.p.b.s += checkInt(addDataTable.vozvrat.s.b)

        findDataTable.p.m.pl += checkInt(addDataTable.vozvrat.p.ml)
        findDataTable.p.ch.pl += checkInt(addDataTable.vozvrat.p.chl)
        findDataTable.p.k.pl += checkInt(addDataTable.vozvrat.p.kl)
        findDataTable.p.sl.pl += checkInt(addDataTable.vozvrat.p.sl)
        findDataTable.p.s02.pl += checkInt(addDataTable.vozvrat.p.s02)
        findDataTable.p.s04.pl += checkInt(addDataTable.vozvrat.p.s04)
        findDataTable.p.b.pl += checkInt(addDataTable.vozvrat.p.b)

        findDataTable.p.m.ps += checkInt(addDataTable.vozvrat.virychka.ml)
        findDataTable.p.ch.ps += checkInt(addDataTable.vozvrat.virychka.chl)
        findDataTable.p.k.ps += checkInt(addDataTable.vozvrat.virychka.kl)
        findDataTable.p.sl.ps += checkInt(addDataTable.vozvrat.virychka.sl)
        findDataTable.p.s02.ps += checkInt(addDataTable.vozvrat.virychka.s02)
        findDataTable.p.s04.ps += checkInt(addDataTable.vozvrat.virychka.s04)
        findDataTable.p.b.ps += checkInt(addDataTable.vozvrat.virychka.b)

        findDataTable.r.ntp += checkInt(addDataTable.i.n)
        findDataTable.r.att += checkInt(addDataTable.i.m)
        findDataTable.r.inc += checkInt(addDataTable.i.inc)
    }
    findDataTable.p.m.kd = dolivkiM.length>0?Math.max.apply(Math, dolivkiM):0;
    findDataTable.p.k.kd = dolivkiK.length>0?Math.max.apply(Math, dolivkiK):0;
    findDataTable.p.ch.kd = dolivkiCh.length>0?Math.max.apply(Math, dolivkiCh):0;
    findDataTable.p.sl.kd = dolivkiSl.length>0?Math.max.apply(Math, dolivkiSl):0;
    findDataTable.p.s02.kd = dolivkiM.length>0?Math.max.apply(Math, dolivkiS02):0;
    findDataTable.p.s04.kd = dolivkiK.length>0?Math.max.apply(Math, dolivkiS04):0;
    findDataTable.p.b.kd = dolivkiCh.length>0?Math.max.apply(Math, dolivkiB):0;
    findDataTable['p']['i'] = checkInt(findDataTable['p']['m']['ps']) + checkInt(findDataTable['p']['ch']['ps']) + checkInt(findDataTable['p']['k']['ps']) + checkInt(findDataTable['p']['sl']['ps'])
    findDataTable['i'] = checkInt(findDataTable['p']['i']) - checkInt(findDataTable['r']['otr']) - checkInt(findDataTable['r']['oo']) - checkInt(findDataTable['r']['inc']) - checkInt(findDataTable['r']['ntp']) - checkInt(findDataTable['r']['att']) - checkInt(findDataTable['r']['at']) - checkInt(findDataTable['r']['vs'])
    findOtchetOrganizatora.dataTable = JSON.stringify(findDataTable)
    await findOtchetOrganizatora.save();
}