let express = require('express');
let router = express.Router();
const Point = require('../models/point');
const Region = require('../models/region');
const Organizator = require('../models/organizator');
const NakladnayaSklad1 = require('../models/nakladnayaSklad1');
const NakladnayaSklad2 = require('../models/nakladnayaSklad2');
const OutXML = require('../models/outXML');
const Price = require('../models/price');
const Tara = require('../models/tara');
const Realizator = require('../models/realizator');
const User = require('../models/user');
const { checkInt } = require('../module/const');
const { generateXML } = require('../module/outXML');
const randomstring = require('randomstring');
const ModelsError = require('../models/error');

/* GET home page. */
router.post('/put', async (req, res) => {
    try{
        let reservePoint = await Point.findOne({guid: 'lol'}).select('_id').lean()
        let reserveRegion = await Region.findOne({guid: 'lol'}).select('_id').lean()
        if(req.body.elements[0].attributes.mode==='manager'){
            for(let i = 0; i<req.body.elements[0].elements.length; i++) {
                if(req.body.elements[0].elements[i].attributes.del!=='1') {
                    let find = await Organizator.findOne({guid: req.body.elements[0].elements[i].attributes.guid});
                    if (!find) {
                        let _user = new User({
                            login: randomstring.generate({length: 20, charset: 'alphanumeric'}),
                            role: 'организатор',
                            status: 'active',
                            password: '12345678',
                        });
                        let _object = new Organizator({
                            name: req.body.elements[0].elements[i].elements[0].text,
                            phone: '',
                            region: reserveRegion._id,
                            user: _user._id,
                            guidRegion: 'lol',
                            guid: req.body.elements[0].elements[i].attributes.guid
                        });
                        await User.create(_user);
                        await Organizator.create(_object);
                    }
                    else if (find.name !== req.body.elements[0].elements[i].elements[0].text||find.del) {
                        find.del = false
                        find.name = req.body.elements[0].elements[i].elements[0].text
                        await find.save()
                    }
                } else {
                    let object = await Organizator.findOne({guid: req.body.elements[0].elements[i].attributes.guid})
                    if(object!==null){
                        object.del = true
                        object.login = randomstring.generate({length: 20, charset: 'alphanumeric'})
                        object.region = reserveRegion._id
                        object.guidRegion = 'lol'
                        await object.save()
                    }
                }
            }
        }
        else if(req.body.elements[0].attributes.mode==='seller'){
            for(let i = 0; i<req.body.elements[0].elements.length; i++) {
                //guid   req.body.elements[0].elements[i].attributes.guid
                //del   req.body.elements[0].elements[i].attributes.del
                //name   req.body.elements[0].elements[i].elements[0].text
                if(req.body.elements[0].elements[i].attributes.del!=='1') {
                    let find = await Realizator.findOne({guid: req.body.elements[0].elements[i].attributes.guid});
                    if (!find) {
                        let _user = new User({
                            login: randomstring.generate({length: 20, charset: 'alphanumeric'}),
                            role: 'реализатор',
                            status: 'active',
                            password: '12345678',
                        });
                        let _object = new Realizator({
                            name: req.body.elements[0].elements[i].elements[0].text,
                            phone: '',
                            region: reserveRegion._id,
                            point: reservePoint._id,
                            user: _user._id,
                            guidRegion: 'lol',
                            guidPoint: 'lol',
                            guid: req.body.elements[0].elements[i].attributes.guid
                        });
                        await User.create(_user);
                        await Realizator.create(_object);
                    }
                    else if (find.name !== req.body.elements[0].elements[i].elements[0].text||find.del) {
                        find.del = false
                        find.name = req.body.elements[0].elements[i].elements[0].text
                        await find.save()
                    }
                } else {
                    let object = await Realizator.findOne({guid: req.body.elements[0].elements[i].attributes.guid})
                    if(object!==null){
                        object.del = true
                        object.login = randomstring.generate({length: 20, charset: 'alphanumeric'})
                        object.region = reserveRegion._id
                        object.guidRegion = 'lol'
                        object.point = reservePoint._id
                        object.guidPoint = 'lol'
                        await object.save()
                    }
                }
            }
        }
        else if(req.body.elements[0].attributes.mode==='place'){
            for(let i = 0; i<req.body.elements[0].elements.length; i++){
                if(req.body.elements[0].elements[i].attributes.del!=='1') {
                    let region = await Region.findOne({guid: req.body.elements[0].elements[i].attributes.guid}), point
                    if (region == null) {
                        region = new Region({
                            name: req.body.elements[0].elements[i].elements[0].text,
                            guid: req.body.elements[0].elements[i].attributes.guid
                        });
                        await Region.create(region);
                        point = new Point({
                            name: 'Резерв',
                            guid: 'lol',
                            region: region._id,
                            guidRegion: req.body.elements[0].elements[i].attributes.guid
                        });
                        await Point.create(point);
                    }
                    else if (region.name !== req.body.elements[0].elements[i].elements[0].text||region.del) {
                        region.del = false
                        region.name = req.body.elements[0].elements[i].elements[0].text;
                        await region.save()
                    }
                    for (let i1 = 1; i1 < req.body.elements[0].elements[i].elements.length; i1++) {
                        if(req.body.elements[0].elements[i].elements[i1].attributes.del!=='1') {
                            point = await Point.findOne({guid: req.body.elements[0].elements[i].elements[i1].attributes.guid});
                            if (point == null) {
                                point = new Point({
                                    name: req.body.elements[0].elements[i].elements[i1].elements[0].text,
                                    guid: req.body.elements[0].elements[i].elements[i1].attributes.guid,
                                    region: region._id,
                                    guidRegion: req.body.elements[0].elements[i].attributes.guid
                                });
                                await Point.create(point);
                            }
                            else if (point.name !== req.body.elements[0].elements[i].elements[0].text||point.del) {
                                point.del = false
                                point.name = req.body.elements[0].elements[i].elements[i1].elements[0].text
                                await point.save()
                            }
                        } else {
                            let object = await Point.findOne({guid: req.body.elements[0].elements[i].elements[i1].attributes.guid})
                            if(object!==null){
                                object.del = true
                                await object.save()
                                await Realizator.updateMany({point: object._id}, {$set: {point: reservePoint._id, guidPoint: 'lol'}});
                            }
                        }
                    }
                }
                else {
                    let object = await Region.findOne({guid: req.body.elements[0].elements[i].attributes.guid})
                    if(object!==null){
                        object.del = true
                        await object.save()
                        await Point.updateMany({region: object._id}, {del: true})
                        await Organizator.updateMany({region: object._id}, {$set: {region: reserveRegion._id, guidRegion: 'lol'}});
                        await Realizator.updateMany({region: object._id}, {$set: {region: reserveRegion._id, guidRegion: 'lol', point: reservePoint._id,guidPoint: 'lol'}});
                    }
                 }
            }
        }
        else if(req.body.elements[0].attributes.mode==='product'){
            let date = req.body.elements[0].attributes.date.split('.')
            date = new Date(date[1]+'.'+date[0]+'.'+date[2])
            let find = await Price.findOne().select('date').lean();
            let find1 = await Tara.findOne().select('date').lean();
            if(find===null||find1===null||find.date===undefined||date>find.date||find1.date===undefined||date>find1.date){
                await Price.deleteMany();
                await Tara.deleteMany();
                for(let i = 0; i<req.body.elements[0].elements.length; i++) {
                    if(req.body.elements[0].elements[i].name==='item'){
                        let name = ''
                        let price = ''
                        if(req.body.elements[0].elements[i].elements[0].text.includes('Максым')) name = 'Максым'
                        else if(req.body.elements[0].elements[i].elements[0].text.includes('Чалап')) name = 'Чалап'
                        else if(req.body.elements[0].elements[i].elements[0].text.includes('Квас')) name = 'Квас'
                        else name = 'Стакан Легенда'
                        for(let i1 = 0; i1<req.body.elements[0].elements[i].elements.length; i1++) {
                            if(req.body.elements[0].elements[i].elements[i1].name==='price')
                                price = req.body.elements[0].elements[i].elements[i1].elements[0].text
                        }
                        let _object = new Price({
                            name: name,
                            price: price,
                            date: date,
                            guid: req.body.elements[0].elements[i].attributes.guid
                        });
                        await Price.create(_object);
                    } else if(req.body.elements[0].elements[i].name==='tare') {
                        let _object = new Tara({
                            name: req.body.elements[0].elements[i].elements[0].text,
                            size: req.body.elements[0].elements[i].attributes.size,
                            date: date,
                            guid: req.body.elements[0].elements[i].attributes.guid
                        });
                        await Tara.create(_object);
                    }
                }
            }
        }
        /*else if(req.body.elements[0].attributes.mode==='motion'){
            let date = req.body.elements[0].attributes.date.split('.')
            date = new Date(date[1]+'.'+date[0]+'.'+date[2])
            let dateStart = new Date(date)
            dateStart.setHours(0, 0, 0, 0)
            let dateEnd = new Date(dateStart)
            dateEnd.setDate(dateEnd.getDate() + 1)
            let organizator = await Organizator.findOne({guid: req.body.elements[0].attributes.to}).lean()
            if(req.body.elements[0].attributes.type==='Выдача'){
                if(organizator) {
                    for (let i = 0; i < req.body.elements[0].elements.length; i++) {
                        let item = await Price.findOne({guid: req.body.elements[0].elements[i].attributes.guid}).lean()
                        if (item !== null && item.name !== 'Стакан Легенда') {
                            let findNakladnayaSklad1 = await NakladnayaSklad1.findOne({
                                $and: [{date: {$gte: dateStart}}, {date: {$lt: dateEnd}}],
                                guidRegion: organizator.guidRegion
                            })
                            if (findNakladnayaSklad1 === null) {
                                let _object = new NakladnayaSklad1({
                                    dataTable: '{"vydano":{"n":{"m25":"","ml":"","ch25":0,"ch10":0,"chl":0,"k25":"","k10":"","kl":"","o":false,"p":false},"r":{"m25":"","ml":"","ch25":"","ch10":"","chl":"","k25":"","k10":"","kl":"","o":false,"p":false},"d1":{"m25":"","ml":"","ch25":"","ch10":"","chl":"","k25":"","k10":"","kl":"","o":false,"p":false},"d2":{"m25":"","ml":"","ch25":"","ch10":"","chl":"","k25":"","k10":"","kl":"","o":false,"p":false},"d3":{"m25":"","ml":"","ch25":"","ch10":"","chl":"","k25":"","k10":"","kl":"","o":false,"p":false},"i":{"m25":"","ml":"","ch25":0,"ch10":0,"chl":0,"k25":"","k10":"","kl":"","o":false,"p":false}},"vozvrat":{"n":{"m25":"","ml":"","ch25":0,"ch10":0,"chl":0,"k25":"","k10":"","kl":"","o":false,"p":false},"r":{"m25":"","ml":"","ch25":"","ch10":"","chl":"","k25":"","k10":"","kl":"","o":false,"p":false},"d1":{"m25":"","ml":"","ch25":"","ch10":"","chl":"","k25":"","k10":"","kl":"","o":false,"p":false},"d2":{"m25":"","ml":"","ch25":"","ch10":"","chl":"","k25":"","k10":"","kl":"","o":false,"p":false},"d3":{"m25":"","ml":"","ch25":"","ch10":"","chl":"","k25":"","k10":"","kl":"","o":false,"p":false},"s":{"m25":"","ml":"","ch25":"","ch10":"","chl":"","k25":"","k10":"","kl":"","o":false,"p":false},"i":{"m25":"","ml":"","ch25":0,"ch10":0,"chl":0,"k25":"","k10":"","kl":"","o":false,"p":false}}}',
                                    data: date,
                                    organizator: organizator.name,
                                    region: organizator.region,
                                    disabled: false,
                                    guidRegion: organizator.guidRegion,
                                    guidOrganizator: organizator.guid,
                                });
                                findNakladnayaSklad1 = await NakladnayaSklad1.create(_object);
                            }
                            let findDataNakladnayaSklad1 = JSON.parse(findNakladnayaSklad1.dataTable)
                            if (item.name === 'Максым') {
                                findDataNakladnayaSklad1['vydano']['r']['ml'] = req.body.elements[0].attributes.del === '1' ? 0 : checkInt(req.body.elements[0].elements[i].attributes.qty)
                                findDataNakladnayaSklad1['vydano']['i']['ml'] = checkInt(findDataNakladnayaSklad1['vydano']['n']['ml']) + checkInt(findDataNakladnayaSklad1['vydano']['r']['ml']) + checkInt(findDataNakladnayaSklad1['vydano']['d1']['ml']) + checkInt(findDataNakladnayaSklad1['vydano']['d2']['ml']) + checkInt(findDataNakladnayaSklad1['vydano']['d3']['ml'])
                            }
                            else if (item.name === 'Чалап') {
                                findDataNakladnayaSklad1['vydano']['r']['chl'] = req.body.elements[0].attributes.del === '1' ? 0 : checkInt(req.body.elements[0].elements[i].attributes.qty)
                                findDataNakladnayaSklad1['vydano']['i']['chl'] = checkInt(findDataNakladnayaSklad1['vydano']['n']['chl']) + checkInt(findDataNakladnayaSklad1['vydano']['r']['chl']) + checkInt(findDataNakladnayaSklad1['vydano']['d1']['chl']) + checkInt(findDataNakladnayaSklad1['vydano']['d2']['chl']) + checkInt(findDataNakladnayaSklad1['vydano']['d3']['chl'])
                            }
                            else if (item.name === 'Квас') {
                                findDataNakladnayaSklad1['vydano']['r']['kl'] = req.body.elements[0].attributes.del === '1' ? 0 : checkInt(req.body.elements[0].elements[i].attributes.qty)
                                findDataNakladnayaSklad1['vydano']['i']['kl'] = checkInt(findDataNakladnayaSklad1['vydano']['n']['kl']) + checkInt(findDataNakladnayaSklad1['vydano']['r']['kl']) + checkInt(findDataNakladnayaSklad1['vydano']['d1']['kl']) + checkInt(findDataNakladnayaSklad1['vydano']['d2']['kl']) + checkInt(findDataNakladnayaSklad1['vydano']['d3']['kl'])
                            }
                            findNakladnayaSklad1.dataTable = JSON.stringify(findDataNakladnayaSklad1)
                            await findNakladnayaSklad1.save()
                        }
                        else {
                            if (item === null)
                                item = await Tara.findOne({guid: req.body.elements[0].elements[i].attributes.guid}).lean()
                            if (item !== null) {
                                let findNakladnayaSklad2 = await NakladnayaSklad2.findOne({
                                    $and: [{date: {$gte: dateStart}}, {date: {$lt: dateEnd}}],
                                    guidRegion: organizator.guidRegion
                                })
                                if (findNakladnayaSklad2 === null) {
                                    let _object = new NakladnayaSklad2({
                                        dataTable: '{"vydano":{"r":{"s02":"","sh02":"","s04":"","sh04":"","l":"","b":"","pm":"","pv":"","o":false,"p":false},"d1":{"s02":"","sh02":"","s04":"","sh04":"","l":"","b":"","pm":"","pv":"","o":false,"p":false},"d2":{"s02":"","sh02":"","s04":"","sh04":"","l":"","b":"","pm":"","pv":"","o":false,"p":false},"d3":{"s02":"","sh02":"","s04":"","sh04":"","l":"","b":"","pm":"","pv":"","o":false,"p":false},"i":{"s02":"","sh02":"","s04":"","sh04":"","l":"","b":"","pm":"","pv":"","o":false,"p":false}},"vozvrat":{"r":{"s02":"","sh02":"","s04":"","sh04":"","l":"","b":"","pm":"","pv":"","o":false,"p":false},"d1":{"s02":"","sh02":"","s04":"","sh04":"","l":"","b":"","pm":"","pv":"","o":false,"p":false},"d2":{"s02":"","sh02":"","s04":"","sh04":"","l":"","b":"","pm":"","pv":"","o":false,"p":false},"d3":{"s02":"","sh02":"","s04":"","sh04":"","l":"","b":"","pm":"","pv":"","o":false,"p":false},"i":{"s02":"","sh02":"","s04":"","sh04":"","l":"","b":"","pm":"","pv":"","o":false,"p":false},"v":{"s02":"","sh02":"","s04":"","sh04":"","l":"","b":"","pm":"","pv":"","o":false,"p":false},"s":{"s02":"","s0502":"","sh02":"","s04":"","s0504":"","sh04":"","l":"","b":"","pm":"","pv":"","o":false,"p":false},"iv":{"s02":"","sh02":"","s04":"","sh04":"","l":"","b":"","pm":"","pv":"","o":false,"p":false}}}',
                                        data: date,
                                        organizator: organizator.name,
                                        region: organizator.region,
                                        disabled: false,
                                        guidRegion: organizator.guidRegion,
                                        guidOrganizator: organizator.guid,
                                    });
                                    findNakladnayaSklad2 = await NakladnayaSklad2.create(_object);
                                }
                                let findDataNakladnayaSklad2 = JSON.parse(findNakladnayaSklad2.dataTable)
                                if (item.name === 'Стакан Легенда') {
                                    findDataNakladnayaSklad2['vydano']['r']['l'] = req.body.elements[0].attributes.del === '1' ? 0 : checkInt(req.body.elements[0].elements[i].attributes.qty)
                                    findDataNakladnayaSklad2['vydano']['i']['l'] = checkInt(findDataNakladnayaSklad2['vydano']['r']['l']) + checkInt(findDataNakladnayaSklad2['vydano']['d1']['l']) + checkInt(findDataNakladnayaSklad2['vydano']['d2']['l']) + checkInt(findDataNakladnayaSklad2['vydano']['d3']['l'])
                                }
                                else if (item.size === '0.20') {
                                    findDataNakladnayaSklad2['vydano']['r']['sh02'] = req.body.elements[0].attributes.del === '1' ? 0 : checkInt(req.body.elements[0].elements[i].attributes.qty)
                                    findDataNakladnayaSklad2['vydano']['i']['sh02'] = checkInt(findDataNakladnayaSklad2['vydano']['r']['sh02']) + checkInt(findDataNakladnayaSklad2['vydano']['d1']['sh02']) + checkInt(findDataNakladnayaSklad2['vydano']['d2']['sh02']) + checkInt(findDataNakladnayaSklad2['vydano']['d3']['sh02'])
                                }
                                else if (item.size === '0.40') {
                                    findDataNakladnayaSklad2['vydano']['r']['sh04'] = req.body.elements[0].attributes.del === '1' ? 0 : checkInt(req.body.elements[0].elements[i].attributes.qty)
                                    findDataNakladnayaSklad2['vydano']['i']['sh04'] = checkInt(findDataNakladnayaSklad2['vydano']['r']['sh04']) + checkInt(findDataNakladnayaSklad2['vydano']['d1']['sh04']) + checkInt(findDataNakladnayaSklad2['vydano']['d2']['sh04']) + checkInt(findDataNakladnayaSklad2['vydano']['d3']['sh04'])
                                }
                                else if (item.size === '1.00') {
                                    findDataNakladnayaSklad2['vydano']['r']['b'] = req.body.elements[0].attributes.del === '1' ? 0 : checkInt(req.body.elements[0].elements[i].attributes.qty)
                                    findDataNakladnayaSklad2['vydano']['i']['b'] = checkInt(findDataNakladnayaSklad2['vydano']['r']['b']) + checkInt(findDataNakladnayaSklad2['vydano']['d1']['b']) + checkInt(findDataNakladnayaSklad2['vydano']['d2']['b']) + checkInt(findDataNakladnayaSklad2['vydano']['d3']['b'])
                                }
                                findNakladnayaSklad2.dataTable = JSON.stringify(findDataNakladnayaSklad2)
                                await findNakladnayaSklad2.save();
                            }
                        }
                    }
                }
            }
            else if(req.body.elements[0].attributes.type==='Доливка 1'){
                if(organizator!==null) {
                    for (let i = 0; i < req.body.elements[0].elements.length; i++) {
                        let item = await Price.findOne({guid: req.body.elements[0].elements[i].attributes.guid}).lean()
                        if (item !== null && item.name !== 'Стакан Легенда') {
                            let findNakladnayaSklad1 = await NakladnayaSklad1.findOne({
                                $and: [{date: {$gte: dateStart}}, {date: {$lt: dateEnd}}],
                                guidRegion: organizator.guidRegion
                            })
                            if (findNakladnayaSklad1 === null) {
                                let _object = new NakladnayaSklad1({
                                    dataTable: '{"vydano":{"n":{"m25":"","ml":"","ch25":0,"ch10":0,"chl":0,"k25":"","k10":"","kl":"","o":false,"p":false},"r":{"m25":"","ml":"","ch25":"","ch10":"","chl":"","k25":"","k10":"","kl":"","o":false,"p":false},"d1":{"m25":"","ml":"","ch25":"","ch10":"","chl":"","k25":"","k10":"","kl":"","o":false,"p":false},"d2":{"m25":"","ml":"","ch25":"","ch10":"","chl":"","k25":"","k10":"","kl":"","o":false,"p":false},"d3":{"m25":"","ml":"","ch25":"","ch10":"","chl":"","k25":"","k10":"","kl":"","o":false,"p":false},"i":{"m25":"","ml":"","ch25":0,"ch10":0,"chl":0,"k25":"","k10":"","kl":"","o":false,"p":false}},"vozvrat":{"n":{"m25":"","ml":"","ch25":0,"ch10":0,"chl":0,"k25":"","k10":"","kl":"","o":false,"p":false},"r":{"m25":"","ml":"","ch25":"","ch10":"","chl":"","k25":"","k10":"","kl":"","o":false,"p":false},"d1":{"m25":"","ml":"","ch25":"","ch10":"","chl":"","k25":"","k10":"","kl":"","o":false,"p":false},"d2":{"m25":"","ml":"","ch25":"","ch10":"","chl":"","k25":"","k10":"","kl":"","o":false,"p":false},"d3":{"m25":"","ml":"","ch25":"","ch10":"","chl":"","k25":"","k10":"","kl":"","o":false,"p":false},"s":{"m25":"","ml":"","ch25":"","ch10":"","chl":"","k25":"","k10":"","kl":"","o":false,"p":false},"i":{"m25":"","ml":"","ch25":0,"ch10":0,"chl":0,"k25":"","k10":"","kl":"","o":false,"p":false}}}',
                                    data: date,
                                    organizator: organizator.name,
                                    region: organizator.region,
                                    disabled: false,
                                    guidRegion: organizator.guidRegion,
                                    guidOrganizator: organizator.guid,
                                });
                                findNakladnayaSklad1 = await NakladnayaSklad1.create(_object);
                            }
                            let findDataNakladnayaSklad1 = JSON.parse(findNakladnayaSklad1.dataTable)
                            if (item.name === 'Максым') {
                                findDataNakladnayaSklad1['vydano']['d1']['ml'] = req.body.elements[0].attributes.del === '1' ? 0 : checkInt(req.body.elements[0].elements[i].attributes.qty)
                                findDataNakladnayaSklad1['vydano']['i']['ml'] = checkInt(findDataNakladnayaSklad1['vydano']['n']['ml']) + checkInt(findDataNakladnayaSklad1['vydano']['r']['ml']) + checkInt(findDataNakladnayaSklad1['vydano']['d1']['ml']) + checkInt(findDataNakladnayaSklad1['vydano']['d2']['ml']) + checkInt(findDataNakladnayaSklad1['vydano']['d3']['ml'])
                            }
                            else if (item.name === 'Чалап') {
                                findDataNakladnayaSklad1['vydano']['d1']['chl'] = req.body.elements[0].attributes.del === '1' ? 0 : checkInt(req.body.elements[0].elements[i].attributes.qty)
                                findDataNakladnayaSklad1['vydano']['i']['chl'] = checkInt(findDataNakladnayaSklad1['vydano']['n']['chl']) + checkInt(findDataNakladnayaSklad1['vydano']['r']['chl']) + checkInt(findDataNakladnayaSklad1['vydano']['d1']['chl']) + checkInt(findDataNakladnayaSklad1['vydano']['d2']['chl']) + checkInt(findDataNakladnayaSklad1['vydano']['d3']['chl'])
                            }
                            else if (item.name === 'Квас') {
                                findDataNakladnayaSklad1['vydano']['d1']['kl'] = req.body.elements[0].attributes.del === '1' ? 0 : checkInt(req.body.elements[0].elements[i].attributes.qty)
                                findDataNakladnayaSklad1['vydano']['i']['kl'] = checkInt(findDataNakladnayaSklad1['vydano']['n']['kl']) + checkInt(findDataNakladnayaSklad1['vydano']['r']['kl']) + checkInt(findDataNakladnayaSklad1['vydano']['d1']['kl']) + checkInt(findDataNakladnayaSklad1['vydano']['d2']['kl']) + checkInt(findDataNakladnayaSklad1['vydano']['d3']['kl'])
                            }
                            findNakladnayaSklad1.dataTable = JSON.stringify(findDataNakladnayaSklad1)
                            await findNakladnayaSklad1.save();
                        } else {
                            if (item === null)
                                item = await Tara.findOne({guid: req.body.elements[0].elements[i].attributes.guid}).lean()
                            if (item !== null) {
                                let findNakladnayaSklad2 = await NakladnayaSklad2.findOne({
                                    $and: [{date: {$gte: dateStart}}, {date: {$lt: dateEnd}}],
                                    guidRegion: organizator.guidRegion
                                })
                                if (findNakladnayaSklad2 === null) {
                                    let _object = new NakladnayaSklad2({
                                        dataTable: '{"vydano":{"r":{"s02":"","sh02":"","s04":"","sh04":"","l":"","b":"","pm":"","pv":"","o":false,"p":false},"d1":{"s02":"","sh02":"","s04":"","sh04":"","l":"","b":"","pm":"","pv":"","o":false,"p":false},"d2":{"s02":"","sh02":"","s04":"","sh04":"","l":"","b":"","pm":"","pv":"","o":false,"p":false},"d3":{"s02":"","sh02":"","s04":"","sh04":"","l":"","b":"","pm":"","pv":"","o":false,"p":false},"i":{"s02":"","sh02":"","s04":"","sh04":"","l":"","b":"","pm":"","pv":"","o":false,"p":false}},"vozvrat":{"r":{"s02":"","sh02":"","s04":"","sh04":"","l":"","b":"","pm":"","pv":"","o":false,"p":false},"d1":{"s02":"","sh02":"","s04":"","sh04":"","l":"","b":"","pm":"","pv":"","o":false,"p":false},"d2":{"s02":"","sh02":"","s04":"","sh04":"","l":"","b":"","pm":"","pv":"","o":false,"p":false},"d3":{"s02":"","sh02":"","s04":"","sh04":"","l":"","b":"","pm":"","pv":"","o":false,"p":false},"i":{"s02":"","sh02":"","s04":"","sh04":"","l":"","b":"","pm":"","pv":"","o":false,"p":false},"v":{"s02":"","sh02":"","s04":"","sh04":"","l":"","b":"","pm":"","pv":"","o":false,"p":false},"s":{"s02":"","s0502":"","sh02":"","s04":"","s0504":"","sh04":"","l":"","b":"","pm":"","pv":"","o":false,"p":false},"iv":{"s02":"","sh02":"","s04":"","sh04":"","l":"","b":"","pm":"","pv":"","o":false,"p":false}}}',
                                        data: date,
                                        organizator: organizator.name,
                                        region: organizator.region,
                                        disabled: false,
                                        guidRegion: organizator.guidRegion,
                                        guidOrganizator: organizator.guid,
                                    });
                                    findNakladnayaSklad2 = await NakladnayaSklad2.create(_object);
                                }
                                let findDataNakladnayaSklad2 = JSON.parse(findNakladnayaSklad2.dataTable)
                                if (item.name === 'Стакан Легенда') {
                                    findDataNakladnayaSklad2['vydano']['d1']['l'] = req.body.elements[0].attributes.del === '1' ? 0 : checkInt(req.body.elements[0].elements[i].attributes.qty)
                                    findDataNakladnayaSklad2['vydano']['i']['l'] = checkInt(findDataNakladnayaSklad2['vydano']['r']['l']) + checkInt(findDataNakladnayaSklad2['vydano']['d1']['l']) + checkInt(findDataNakladnayaSklad2['vydano']['d2']['l']) + checkInt(findDataNakladnayaSklad2['vydano']['d3']['l'])
                                }
                                else if (item.size === '0.20') {
                                    findDataNakladnayaSklad2['vydano']['d1']['sh02'] = req.body.elements[0].attributes.del === '1' ? 0 : checkInt(req.body.elements[0].elements[i].attributes.qty)
                                    findDataNakladnayaSklad2['vydano']['i']['sh02'] = checkInt(findDataNakladnayaSklad2['vydano']['r']['sh02']) + checkInt(findDataNakladnayaSklad2['vydano']['d1']['sh02']) + checkInt(findDataNakladnayaSklad2['vydano']['d2']['sh02']) + checkInt(findDataNakladnayaSklad2['vydano']['d3']['sh02'])
                                }
                                else if (item.size === '0.40') {
                                    findDataNakladnayaSklad2['vydano']['d1']['sh04'] = req.body.elements[0].attributes.del === '1' ? 0 : checkInt(req.body.elements[0].elements[i].attributes.qty)
                                    findDataNakladnayaSklad2['vydano']['i']['sh04'] = checkInt(findDataNakladnayaSklad2['vydano']['r']['sh04']) + checkInt(findDataNakladnayaSklad2['vydano']['d1']['sh04']) + checkInt(findDataNakladnayaSklad2['vydano']['d2']['sh04']) + checkInt(findDataNakladnayaSklad2['vydano']['d3']['sh04'])
                                }
                                else if (item.size === '1.00') {
                                    findDataNakladnayaSklad2['vydano']['d1']['b'] = req.body.elements[0].attributes.del === '1' ? 0 : checkInt(req.body.elements[0].elements[i].attributes.qty)
                                    findDataNakladnayaSklad2['vydano']['i']['b'] = checkInt(findDataNakladnayaSklad2['vydano']['r']['b']) + checkInt(findDataNakladnayaSklad2['vydano']['d1']['b']) + checkInt(findDataNakladnayaSklad2['vydano']['d2']['b']) + checkInt(findDataNakladnayaSklad2['vydano']['d3']['b'])
                                }
                                findNakladnayaSklad2.dataTable = JSON.stringify(findDataNakladnayaSklad2)
                                await findNakladnayaSklad2.save();
                            }
                        }
                    }
                }
            }
            else if(req.body.elements[0].attributes.type==='Доливка 2'){
                if(organizator!==null) {
                    for (let i = 0; i < req.body.elements[0].elements.length; i++) {
                        let item = await Price.findOne({guid: req.body.elements[0].elements[i].attributes.guid}).lean()
                        if (item !== null && item.name !== 'Стакан Легенда') {
                            let findNakladnayaSklad1 = await NakladnayaSklad1.findOne({
                                $and: [{date: {$gte: dateStart}}, {date: {$lt: dateEnd}}],
                                guidRegion: organizator.guidRegion
                            })
                            if (findNakladnayaSklad1 === null) {
                                let _object = new NakladnayaSklad1({
                                    dataTable: '{"vydano":{"n":{"m25":"","ml":"","ch25":0,"ch10":0,"chl":0,"k25":"","k10":"","kl":"","o":false,"p":false},"r":{"m25":"","ml":"","ch25":"","ch10":"","chl":"","k25":"","k10":"","kl":"","o":false,"p":false},"d1":{"m25":"","ml":"","ch25":"","ch10":"","chl":"","k25":"","k10":"","kl":"","o":false,"p":false},"d2":{"m25":"","ml":"","ch25":"","ch10":"","chl":"","k25":"","k10":"","kl":"","o":false,"p":false},"d3":{"m25":"","ml":"","ch25":"","ch10":"","chl":"","k25":"","k10":"","kl":"","o":false,"p":false},"i":{"m25":"","ml":"","ch25":0,"ch10":0,"chl":0,"k25":"","k10":"","kl":"","o":false,"p":false}},"vozvrat":{"n":{"m25":"","ml":"","ch25":0,"ch10":0,"chl":0,"k25":"","k10":"","kl":"","o":false,"p":false},"r":{"m25":"","ml":"","ch25":"","ch10":"","chl":"","k25":"","k10":"","kl":"","o":false,"p":false},"d1":{"m25":"","ml":"","ch25":"","ch10":"","chl":"","k25":"","k10":"","kl":"","o":false,"p":false},"d2":{"m25":"","ml":"","ch25":"","ch10":"","chl":"","k25":"","k10":"","kl":"","o":false,"p":false},"d3":{"m25":"","ml":"","ch25":"","ch10":"","chl":"","k25":"","k10":"","kl":"","o":false,"p":false},"s":{"m25":"","ml":"","ch25":"","ch10":"","chl":"","k25":"","k10":"","kl":"","o":false,"p":false},"i":{"m25":"","ml":"","ch25":0,"ch10":0,"chl":0,"k25":"","k10":"","kl":"","o":false,"p":false}}}',
                                    data: date,
                                    organizator: organizator.name,
                                    region: organizator.region,
                                    disabled: false,
                                    guidRegion: organizator.guidRegion,
                                    guidOrganizator: organizator.guid,
                                });
                                findNakladnayaSklad1 = await NakladnayaSklad1.create(_object);
                            }
                            let findDataNakladnayaSklad1 = JSON.parse(findNakladnayaSklad1.dataTable)
                            if (item.name === 'Максым') {
                                findDataNakladnayaSklad1['vydano']['d2']['ml'] = req.body.elements[0].attributes.del === '1' ? 0 : checkInt(req.body.elements[0].elements[i].attributes.qty)
                                findDataNakladnayaSklad1['vydano']['i']['ml'] = checkInt(findDataNakladnayaSklad1['vydano']['n']['ml']) + checkInt(findDataNakladnayaSklad1['vydano']['r']['ml']) + checkInt(findDataNakladnayaSklad1['vydano']['d1']['ml']) + checkInt(findDataNakladnayaSklad1['vydano']['d2']['ml']) + checkInt(findDataNakladnayaSklad1['vydano']['d3']['ml'])
                            }
                            else if (item.name === 'Чалап') {
                                findDataNakladnayaSklad1['vydano']['d2']['chl'] = req.body.elements[0].attributes.del === '1' ? 0 : checkInt(req.body.elements[0].elements[i].attributes.qty)
                                findDataNakladnayaSklad1['vydano']['i']['chl'] = checkInt(findDataNakladnayaSklad1['vydano']['n']['chl']) + checkInt(findDataNakladnayaSklad1['vydano']['r']['chl']) + checkInt(findDataNakladnayaSklad1['vydano']['d1']['chl']) + checkInt(findDataNakladnayaSklad1['vydano']['d2']['chl']) + checkInt(findDataNakladnayaSklad1['vydano']['d3']['chl'])
                            }
                            else if (item.name === 'Квас') {
                                findDataNakladnayaSklad1['vydano']['d2']['kl'] = req.body.elements[0].attributes.del === '1' ? 0 : checkInt(req.body.elements[0].elements[i].attributes.qty)
                                findDataNakladnayaSklad1['vydano']['i']['kl'] = checkInt(findDataNakladnayaSklad1['vydano']['n']['kl']) + checkInt(findDataNakladnayaSklad1['vydano']['r']['kl']) + checkInt(findDataNakladnayaSklad1['vydano']['d1']['kl']) + checkInt(findDataNakladnayaSklad1['vydano']['d2']['kl']) + checkInt(findDataNakladnayaSklad1['vydano']['d3']['kl'])
                            }
                            findNakladnayaSklad1.dataTable = JSON.stringify(findDataNakladnayaSklad1)
                            await findNakladnayaSklad1.save();
                        } else {
                            if (item === null)
                                item = await Tara.findOne({guid: req.body.elements[0].elements[i].attributes.guid}).lean()
                            if (item !== null) {
                                let findNakladnayaSklad2 = await NakladnayaSklad2.findOne({
                                    $and: [{date: {$gte: dateStart}}, {date: {$lt: dateEnd}}],
                                    guidRegion: organizator.guidRegion
                                })
                                if (findNakladnayaSklad2 === null) {
                                    let _object = new NakladnayaSklad2({
                                        dataTable: '{"vydano":{"r":{"s02":"","sh02":"","s04":"","sh04":"","l":"","b":"","pm":"","pv":"","o":false,"p":false},"d1":{"s02":"","sh02":"","s04":"","sh04":"","l":"","b":"","pm":"","pv":"","o":false,"p":false},"d2":{"s02":"","sh02":"","s04":"","sh04":"","l":"","b":"","pm":"","pv":"","o":false,"p":false},"d3":{"s02":"","sh02":"","s04":"","sh04":"","l":"","b":"","pm":"","pv":"","o":false,"p":false},"i":{"s02":"","sh02":"","s04":"","sh04":"","l":"","b":"","pm":"","pv":"","o":false,"p":false}},"vozvrat":{"r":{"s02":"","sh02":"","s04":"","sh04":"","l":"","b":"","pm":"","pv":"","o":false,"p":false},"d1":{"s02":"","sh02":"","s04":"","sh04":"","l":"","b":"","pm":"","pv":"","o":false,"p":false},"d2":{"s02":"","sh02":"","s04":"","sh04":"","l":"","b":"","pm":"","pv":"","o":false,"p":false},"d3":{"s02":"","sh02":"","s04":"","sh04":"","l":"","b":"","pm":"","pv":"","o":false,"p":false},"i":{"s02":"","sh02":"","s04":"","sh04":"","l":"","b":"","pm":"","pv":"","o":false,"p":false},"v":{"s02":"","sh02":"","s04":"","sh04":"","l":"","b":"","pm":"","pv":"","o":false,"p":false},"s":{"s02":"","s0502":"","sh02":"","s04":"","s0504":"","sh04":"","l":"","b":"","pm":"","pv":"","o":false,"p":false},"iv":{"s02":"","sh02":"","s04":"","sh04":"","l":"","b":"","pm":"","pv":"","o":false,"p":false}}}',
                                        data: date,
                                        organizator: organizator.name,
                                        region: organizator.region,
                                        disabled: false,
                                        guidRegion: organizator.guidRegion,
                                        guidOrganizator: organizator.guid,
                                    });
                                    findNakladnayaSklad2 = await NakladnayaSklad2.create(_object);
                                }
                                let findDataNakladnayaSklad2 = JSON.parse(findNakladnayaSklad2.dataTable)
                                if (item.name === 'Стакан Легенда') {
                                    findDataNakladnayaSklad2['vydano']['d2']['l'] = req.body.elements[0].attributes.del === '1' ? 0 : checkInt(req.body.elements[0].elements[i].attributes.qty)
                                    findDataNakladnayaSklad2['vydano']['i']['l'] = checkInt(findDataNakladnayaSklad2['vydano']['r']['l']) + checkInt(findDataNakladnayaSklad2['vydano']['d1']['l']) + checkInt(findDataNakladnayaSklad2['vydano']['d2']['l']) + checkInt(findDataNakladnayaSklad2['vydano']['d3']['l'])
                                }
                                else if (item.size === '0.20') {
                                    findDataNakladnayaSklad2['vydano']['d2']['sh02'] = req.body.elements[0].attributes.del === '1' ? 0 : checkInt(req.body.elements[0].elements[i].attributes.qty)
                                    findDataNakladnayaSklad2['vydano']['i']['sh02'] = checkInt(findDataNakladnayaSklad2['vydano']['r']['sh02']) + checkInt(findDataNakladnayaSklad2['vydano']['d1']['sh02']) + checkInt(findDataNakladnayaSklad2['vydano']['d2']['sh02']) + checkInt(findDataNakladnayaSklad2['vydano']['d3']['sh02'])
                                }
                                else if (item.size === '0.40') {
                                    findDataNakladnayaSklad2['vydano']['d2']['sh04'] = req.body.elements[0].attributes.del === '1' ? 0 : checkInt(req.body.elements[0].elements[i].attributes.qty)
                                    findDataNakladnayaSklad2['vydano']['i']['sh04'] = checkInt(findDataNakladnayaSklad2['vydano']['r']['sh04']) + checkInt(findDataNakladnayaSklad2['vydano']['d1']['sh04']) + checkInt(findDataNakladnayaSklad2['vydano']['d2']['sh04']) + checkInt(findDataNakladnayaSklad2['vydano']['d3']['sh04'])
                                }
                                else if (item.size === '1.00') {
                                    findDataNakladnayaSklad2['vydano']['d2']['b'] = req.body.elements[0].attributes.del === '1' ? 0 : checkInt(req.body.elements[0].elements[i].attributes.qty)
                                    findDataNakladnayaSklad2['vydano']['i']['b'] = checkInt(findDataNakladnayaSklad2['vydano']['r']['b']) + checkInt(findDataNakladnayaSklad2['vydano']['d1']['b']) + checkInt(findDataNakladnayaSklad2['vydano']['d2']['b']) + checkInt(findDataNakladnayaSklad2['vydano']['d3']['b'])
                                }
                                findNakladnayaSklad2.dataTable = JSON.stringify(findDataNakladnayaSklad2)
                                await findNakladnayaSklad2.save();
                            }
                        }
                    }
                }
            }
            else if(req.body.elements[0].attributes.type==='Доливка 3'){
                if(organizator!==null) {
                    for (let i = 0; i < req.body.elements[0].elements.length; i++) {
                        let item = await Price.findOne({guid: req.body.elements[0].elements[i].attributes.guid}).lean()
                        if (item !== null && item.name !== 'Стакан Легенда') {
                            let findNakladnayaSklad1 = await NakladnayaSklad1.findOne({
                                $and: [{date: {$gte: dateStart}}, {date: {$lt: dateEnd}}],
                                guidRegion: organizator.guidRegion
                            })
                            if (findNakladnayaSklad1 === null) {
                                let _object = new NakladnayaSklad1({
                                    dataTable: '{"vydano":{"n":{"m25":"","ml":"","ch25":0,"ch10":0,"chl":0,"k25":"","k10":"","kl":"","o":false,"p":false},"r":{"m25":"","ml":"","ch25":"","ch10":"","chl":"","k25":"","k10":"","kl":"","o":false,"p":false},"d1":{"m25":"","ml":"","ch25":"","ch10":"","chl":"","k25":"","k10":"","kl":"","o":false,"p":false},"d2":{"m25":"","ml":"","ch25":"","ch10":"","chl":"","k25":"","k10":"","kl":"","o":false,"p":false},"d3":{"m25":"","ml":"","ch25":"","ch10":"","chl":"","k25":"","k10":"","kl":"","o":false,"p":false},"i":{"m25":"","ml":"","ch25":0,"ch10":0,"chl":0,"k25":"","k10":"","kl":"","o":false,"p":false}},"vozvrat":{"n":{"m25":"","ml":"","ch25":0,"ch10":0,"chl":0,"k25":"","k10":"","kl":"","o":false,"p":false},"r":{"m25":"","ml":"","ch25":"","ch10":"","chl":"","k25":"","k10":"","kl":"","o":false,"p":false},"d1":{"m25":"","ml":"","ch25":"","ch10":"","chl":"","k25":"","k10":"","kl":"","o":false,"p":false},"d2":{"m25":"","ml":"","ch25":"","ch10":"","chl":"","k25":"","k10":"","kl":"","o":false,"p":false},"d3":{"m25":"","ml":"","ch25":"","ch10":"","chl":"","k25":"","k10":"","kl":"","o":false,"p":false},"s":{"m25":"","ml":"","ch25":"","ch10":"","chl":"","k25":"","k10":"","kl":"","o":false,"p":false},"i":{"m25":"","ml":"","ch25":0,"ch10":0,"chl":0,"k25":"","k10":"","kl":"","o":false,"p":false}}}',
                                    data: date,
                                    organizator: organizator.name,
                                    region: organizator.region,
                                    disabled: false,
                                    guidRegion: organizator.guidRegion,
                                    guidOrganizator: organizator.guid,
                                });
                                findNakladnayaSklad1 = await NakladnayaSklad1.create(_object);
                            }
                            let findDataNakladnayaSklad1 = JSON.parse(findNakladnayaSklad1.dataTable)
                            if (item.name === 'Максым') {
                                findDataNakladnayaSklad1['vydano']['d3']['ml'] = req.body.elements[0].attributes.del === '1' ? 0 : checkInt(req.body.elements[0].elements[i].attributes.qty)
                                findDataNakladnayaSklad1['vydano']['i']['ml'] = checkInt(findDataNakladnayaSklad1['vydano']['n']['ml']) + checkInt(findDataNakladnayaSklad1['vydano']['r']['ml']) + checkInt(findDataNakladnayaSklad1['vydano']['d1']['ml']) + checkInt(findDataNakladnayaSklad1['vydano']['d2']['ml']) + checkInt(findDataNakladnayaSklad1['vydano']['d3']['ml'])
                            }
                            else if (item.name === 'Чалап') {
                                findDataNakladnayaSklad1['vydano']['d3']['chl'] = req.body.elements[0].attributes.del === '1' ? 0 : checkInt(req.body.elements[0].elements[i].attributes.qty)
                                findDataNakladnayaSklad1['vydano']['i']['chl'] = checkInt(findDataNakladnayaSklad1['vydano']['n']['chl']) + checkInt(findDataNakladnayaSklad1['vydano']['r']['chl']) + checkInt(findDataNakladnayaSklad1['vydano']['d1']['chl']) + checkInt(findDataNakladnayaSklad1['vydano']['d2']['chl']) + checkInt(findDataNakladnayaSklad1['vydano']['d3']['chl'])
                            }
                            else if (item.name === 'Квас') {
                                findDataNakladnayaSklad1['vydano']['d3']['kl'] = req.body.elements[0].attributes.del === '1' ? 0 : checkInt(req.body.elements[0].elements[i].attributes.qty)
                                findDataNakladnayaSklad1['vydano']['i']['kl'] = checkInt(findDataNakladnayaSklad1['vydano']['n']['kl']) + checkInt(findDataNakladnayaSklad1['vydano']['r']['kl']) + checkInt(findDataNakladnayaSklad1['vydano']['d1']['kl']) + checkInt(findDataNakladnayaSklad1['vydano']['d2']['kl']) + checkInt(findDataNakladnayaSklad1['vydano']['d3']['kl'])
                            }
                            findNakladnayaSklad1.dataTable = JSON.stringify(findDataNakladnayaSklad1)
                            await findNakladnayaSklad1.save();
                        } else {
                            if (item === null)
                                item = await Tara.findOne({guid: req.body.elements[0].elements[i].attributes.guid}).lean()
                            if (item !== null) {
                                let findNakladnayaSklad2 = await NakladnayaSklad2.findOne({
                                    $and: [{date: {$gte: dateStart}}, {date: {$lt: dateEnd}}],
                                    guidRegion: organizator.guidRegion
                                })
                                if (findNakladnayaSklad2 === null) {
                                    let _object = new NakladnayaSklad2({
                                        dataTable: '{"vydano":{"r":{"s02":"","sh02":"","s04":"","sh04":"","l":"","b":"","pm":"","pv":"","o":false,"p":false},"d1":{"s02":"","sh02":"","s04":"","sh04":"","l":"","b":"","pm":"","pv":"","o":false,"p":false},"d2":{"s02":"","sh02":"","s04":"","sh04":"","l":"","b":"","pm":"","pv":"","o":false,"p":false},"d3":{"s02":"","sh02":"","s04":"","sh04":"","l":"","b":"","pm":"","pv":"","o":false,"p":false},"i":{"s02":"","sh02":"","s04":"","sh04":"","l":"","b":"","pm":"","pv":"","o":false,"p":false}},"vozvrat":{"r":{"s02":"","sh02":"","s04":"","sh04":"","l":"","b":"","pm":"","pv":"","o":false,"p":false},"d1":{"s02":"","sh02":"","s04":"","sh04":"","l":"","b":"","pm":"","pv":"","o":false,"p":false},"d2":{"s02":"","sh02":"","s04":"","sh04":"","l":"","b":"","pm":"","pv":"","o":false,"p":false},"d3":{"s02":"","sh02":"","s04":"","sh04":"","l":"","b":"","pm":"","pv":"","o":false,"p":false},"i":{"s02":"","sh02":"","s04":"","sh04":"","l":"","b":"","pm":"","pv":"","o":false,"p":false},"v":{"s02":"","sh02":"","s04":"","sh04":"","l":"","b":"","pm":"","pv":"","o":false,"p":false},"s":{"s02":"","s0502":"","sh02":"","s04":"","s0504":"","sh04":"","l":"","b":"","pm":"","pv":"","o":false,"p":false},"iv":{"s02":"","sh02":"","s04":"","sh04":"","l":"","b":"","pm":"","pv":"","o":false,"p":false}}}',
                                        data: date,
                                        organizator: organizator.name,
                                        region: organizator.region,
                                        disabled: false,
                                        guidRegion: organizator.guidRegion,
                                        guidOrganizator: organizator.guid,
                                    });
                                    findNakladnayaSklad2 = await NakladnayaSklad2.create(_object);
                                }
                                let findDataNakladnayaSklad2 = JSON.parse(findNakladnayaSklad2.dataTable)
                                if (item.name === 'Стакан Легенда') {
                                    findDataNakladnayaSklad2['vydano']['d3']['l'] = req.body.elements[0].attributes.del === '1' ? 0 : checkInt(req.body.elements[0].elements[i].attributes.qty)
                                    findDataNakladnayaSklad2['vydano']['i']['l'] = checkInt(findDataNakladnayaSklad2['vydano']['r']['l']) + checkInt(findDataNakladnayaSklad2['vydano']['d1']['l']) + checkInt(findDataNakladnayaSklad2['vydano']['d2']['l']) + checkInt(findDataNakladnayaSklad2['vydano']['d3']['l'])
                                }
                                else if (item.size === '0.20') {
                                    findDataNakladnayaSklad2['vydano']['d3']['sh02'] = req.body.elements[0].attributes.del === '1' ? 0 : checkInt(req.body.elements[0].elements[i].attributes.qty)
                                    findDataNakladnayaSklad2['vydano']['i']['sh02'] = checkInt(findDataNakladnayaSklad2['vydano']['r']['sh02']) + checkInt(findDataNakladnayaSklad2['vydano']['d1']['sh02']) + checkInt(findDataNakladnayaSklad2['vydano']['d2']['sh02']) + checkInt(findDataNakladnayaSklad2['vydano']['d3']['sh02'])
                                }
                                else if (item.size === '0.40') {
                                    findDataNakladnayaSklad2['vydano']['d3']['sh04'] = req.body.elements[0].attributes.del === '1' ? 0 : checkInt(req.body.elements[0].elements[i].attributes.qty)
                                    findDataNakladnayaSklad2['vydano']['i']['sh04'] = checkInt(findDataNakladnayaSklad2['vydano']['r']['sh04']) + checkInt(findDataNakladnayaSklad2['vydano']['d1']['sh04']) + checkInt(findDataNakladnayaSklad2['vydano']['d2']['sh04']) + checkInt(findDataNakladnayaSklad2['vydano']['d3']['sh04'])
                                }
                                else if (item.size === '1.00') {
                                    findDataNakladnayaSklad2['vydano']['d3']['b'] = req.body.elements[0].attributes.del === '1' ? 0 : checkInt(req.body.elements[0].elements[i].attributes.qty)
                                    findDataNakladnayaSklad2['vydano']['i']['b'] = checkInt(findDataNakladnayaSklad2['vydano']['r']['b']) + checkInt(findDataNakladnayaSklad2['vydano']['d1']['b']) + checkInt(findDataNakladnayaSklad2['vydano']['d2']['b']) + checkInt(findDataNakladnayaSklad2['vydano']['d3']['b'])
                                }
                                findNakladnayaSklad2.dataTable = JSON.stringify(findDataNakladnayaSklad2)
                                await findNakladnayaSklad2.save();
                            }
                        }
                    }
                }
            }
            else if(req.body.elements[0].attributes.type==='Съем'){
                if(organizator!==null){
                    for(let i = 0; i<req.body.elements[0].elements.length; i++) {
                        let item = await Price.findOne({guid: req.body.elements[0].elements[i].attributes.guid}).lean()
                        if(item!==null&&item.name !== 'Стакан Легенда'){
                            let findNakladnayaSklad1 = await NakladnayaSklad1.findOne({
                                $and: [{date: {$gte: dateStart}}, {date: {$lt: dateEnd}}],
                                guidRegion: organizator.guidRegion
                            })
                            if(findNakladnayaSklad1===null){
                                let _object = new NakladnayaSklad1({
                                    dataTable: '{"vydano":{"n":{"m25":"","ml":"","ch25":0,"ch10":0,"chl":0,"k25":"","k10":"","kl":"","o":false,"p":false},"r":{"m25":"","ml":"","ch25":"","ch10":"","chl":"","k25":"","k10":"","kl":"","o":false,"p":false},"d1":{"m25":"","ml":"","ch25":"","ch10":"","chl":"","k25":"","k10":"","kl":"","o":false,"p":false},"d2":{"m25":"","ml":"","ch25":"","ch10":"","chl":"","k25":"","k10":"","kl":"","o":false,"p":false},"d3":{"m25":"","ml":"","ch25":"","ch10":"","chl":"","k25":"","k10":"","kl":"","o":false,"p":false},"i":{"m25":"","ml":"","ch25":0,"ch10":0,"chl":0,"k25":"","k10":"","kl":"","o":false,"p":false}},"vozvrat":{"n":{"m25":"","ml":"","ch25":0,"ch10":0,"chl":0,"k25":"","k10":"","kl":"","o":false,"p":false},"r":{"m25":"","ml":"","ch25":"","ch10":"","chl":"","k25":"","k10":"","kl":"","o":false,"p":false},"d1":{"m25":"","ml":"","ch25":"","ch10":"","chl":"","k25":"","k10":"","kl":"","o":false,"p":false},"d2":{"m25":"","ml":"","ch25":"","ch10":"","chl":"","k25":"","k10":"","kl":"","o":false,"p":false},"d3":{"m25":"","ml":"","ch25":"","ch10":"","chl":"","k25":"","k10":"","kl":"","o":false,"p":false},"s":{"m25":"","ml":"","ch25":"","ch10":"","chl":"","k25":"","k10":"","kl":"","o":false,"p":false},"i":{"m25":"","ml":"","ch25":0,"ch10":0,"chl":0,"k25":"","k10":"","kl":"","o":false,"p":false}}}',
                                    data: date,
                                    organizator: organizator.name,
                                    region: organizator.region,
                                    disabled: false,
                                    guidRegion: organizator.guidRegion,
                                    guidOrganizator: organizator.guid,
                                });
                                findNakladnayaSklad1 = await NakladnayaSklad1.create(_object);
                            }
                            let findDataNakladnayaSklad1 = JSON.parse(findNakladnayaSklad1.dataTable)
                            if(item.name === 'Максым'){
                                findDataNakladnayaSklad1['vozvrat']['s']['ml'] = req.body.elements[0].attributes.del==='1'?0:checkInt(req.body.elements[0].elements[i].attributes.qty)
                                findDataNakladnayaSklad1['vozvrat']['i']['ml'] = checkInt(findDataNakladnayaSklad1['vozvrat']['n']['ml']) + checkInt(findDataNakladnayaSklad1['vozvrat']['r']['ml']) + checkInt(findDataNakladnayaSklad1['vozvrat']['d1']['ml']) + checkInt(findDataNakladnayaSklad1['vozvrat']['d2']['ml']) + checkInt(findDataNakladnayaSklad1['vozvrat']['d3']['ml']) + checkInt(findDataNakladnayaSklad1['vozvrat']['s']['ml'])
                            }
                            else if(item.name === 'Чалап'){
                                findDataNakladnayaSklad1['vozvrat']['s']['chl'] = req.body.elements[0].attributes.del==='1'?0:checkInt(req.body.elements[0].elements[i].attributes.qty)
                                findDataNakladnayaSklad1['vozvrat']['i']['chl'] = checkInt(findDataNakladnayaSklad1['vozvrat']['n']['chl']) + checkInt(findDataNakladnayaSklad1['vozvrat']['r']['chl']) + checkInt(findDataNakladnayaSklad1['vozvrat']['d1']['chl']) + checkInt(findDataNakladnayaSklad1['vozvrat']['d2']['chl']) + checkInt(findDataNakladnayaSklad1['vozvrat']['d3']['chl']) + checkInt(findDataNakladnayaSklad1['vozvrat']['d3']['chl']) + checkInt(findDataNakladnayaSklad1['vozvrat']['s']['chl'])
                            }
                            else if(item.name === 'Квас'){
                                findDataNakladnayaSklad1['vozvrat']['s']['kl'] = req.body.elements[0].attributes.del==='1'?0:checkInt(req.body.elements[0].elements[i].attributes.qty)
                                findDataNakladnayaSklad1['vozvrat']['i']['kl'] = checkInt(findDataNakladnayaSklad1['vozvrat']['n']['kl']) + checkInt(findDataNakladnayaSklad1['vozvrat']['r']['kl']) + checkInt(findDataNakladnayaSklad1['vozvrat']['d1']['kl']) + checkInt(findDataNakladnayaSklad1['vozvrat']['d2']['kl']) + checkInt(findDataNakladnayaSklad1['vozvrat']['d3']['kl']) + checkInt(findDataNakladnayaSklad1['vozvrat']['d3']['kl']) + checkInt(findDataNakladnayaSklad1['vozvrat']['s']['kl'])
                            }
                            findNakladnayaSklad1.dataTable = JSON.stringify(findDataNakladnayaSklad1)
                            await findNakladnayaSklad1.save();
                        } else {
                            if(item === null)
                                item = await Tara.findOne({guid: req.body.elements[0].elements[i].attributes.guid}).lean()
                            if(item!==null) {
                                let findNakladnayaSklad2 = await NakladnayaSklad2.findOne({
                                    $and: [{date: {$gte: dateStart}}, {date: {$lt: dateEnd}}],
                                    guidRegion: organizator.guidRegion
                                })
                                if(findNakladnayaSklad2===null){
                                    let _object = new NakladnayaSklad2({
                                        dataTable: '{"vydano":{"r":{"s02":"","sh02":"","s04":"","sh04":"","l":"","b":"","pm":"","pv":"","o":false,"p":false},"d1":{"s02":"","sh02":"","s04":"","sh04":"","l":"","b":"","pm":"","pv":"","o":false,"p":false},"d2":{"s02":"","sh02":"","s04":"","sh04":"","l":"","b":"","pm":"","pv":"","o":false,"p":false},"d3":{"s02":"","sh02":"","s04":"","sh04":"","l":"","b":"","pm":"","pv":"","o":false,"p":false},"i":{"s02":"","sh02":"","s04":"","sh04":"","l":"","b":"","pm":"","pv":"","o":false,"p":false}},"vozvrat":{"r":{"s02":"","sh02":"","s04":"","sh04":"","l":"","b":"","pm":"","pv":"","o":false,"p":false},"d1":{"s02":"","sh02":"","s04":"","sh04":"","l":"","b":"","pm":"","pv":"","o":false,"p":false},"d2":{"s02":"","sh02":"","s04":"","sh04":"","l":"","b":"","pm":"","pv":"","o":false,"p":false},"d3":{"s02":"","sh02":"","s04":"","sh04":"","l":"","b":"","pm":"","pv":"","o":false,"p":false},"i":{"s02":"","sh02":"","s04":"","sh04":"","l":"","b":"","pm":"","pv":"","o":false,"p":false},"v":{"s02":"","sh02":"","s04":"","sh04":"","l":"","b":"","pm":"","pv":"","o":false,"p":false},"s":{"s02":"","s0502":"","sh02":"","s04":"","s0504":"","sh04":"","l":"","b":"","pm":"","pv":"","o":false,"p":false},"iv":{"s02":"","sh02":"","s04":"","sh04":"","l":"","b":"","pm":"","pv":"","o":false,"p":false}}}',
                                        data: date,
                                        organizator: organizator.name,
                                        region: organizator.region,
                                        disabled: false,
                                        guidRegion: organizator.guidRegion,
                                        guidOrganizator: organizator.guid,
                                    });
                                    findNakladnayaSklad2 = await NakladnayaSklad2.create(_object);
                                }
                                let findDataNakladnayaSklad2 = JSON.parse(findNakladnayaSklad2.dataTable)
                                if(item.name === 'Стакан Легенда'){
                                    findDataNakladnayaSklad2['vozvrat']['s']['l'] = req.body.elements[0].attributes.del==='1'?0:checkInt(req.body.elements[0].elements[i].attributes.qty)
                                    findDataNakladnayaSklad2['vozvrat']['iv']['l'] = checkInt(findDataNakladnayaSklad2['vozvrat']['i']['l']) + checkInt(findDataNakladnayaSklad2['vozvrat']['v']['l']) + checkInt(findDataNakladnayaSklad2['vozvrat']['s']['l'])

                                }
                                else if(item.size === '0.20'){
                                    findDataNakladnayaSklad2['vozvrat']['s']['sh02'] = req.body.elements[0].attributes.del==='1'?0:checkInt(req.body.elements[0].elements[i].attributes.qty)
                                    findDataNakladnayaSklad2['vozvrat']['iv']['sh02'] = checkInt(findDataNakladnayaSklad2['vozvrat']['i']['sh02']) + checkInt(findDataNakladnayaSklad2['vozvrat']['v']['sh02']) + checkInt(findDataNakladnayaSklad2['vozvrat']['s']['sh02'])

                                }
                                else if(item.size === '0.40'){
                                    findDataNakladnayaSklad2['vozvrat']['s']['sh04'] = req.body.elements[0].attributes.del==='1'?0:checkInt(req.body.elements[0].elements[i].attributes.qty)
                                    findDataNakladnayaSklad2['vozvrat']['iv']['sh04'] = checkInt(findDataNakladnayaSklad2['vozvrat']['i']['sh04']) + checkInt(findDataNakladnayaSklad2['vozvrat']['v']['sh04']) + checkInt(findDataNakladnayaSklad2['vozvrat']['s']['sh04'])
                                }
                                else if(item.size === '1.00'){
                                    findDataNakladnayaSklad2['vozvrat']['s']['b'] = req.body.elements[0].attributes.del==='1'?0:checkInt(req.body.elements[0].elements[i].attributes.qty)
                                    findDataNakladnayaSklad2['vozvrat']['iv']['b'] = checkInt(findDataNakladnayaSklad2['vozvrat']['i']['b']) + checkInt(findDataNakladnayaSklad2['vozvrat']['v']['b']) + checkInt(findDataNakladnayaSklad2['vozvrat']['s']['b'])
                                }
                                findNakladnayaSklad2.dataTable = JSON.stringify(findDataNakladnayaSklad2)
                                await findNakladnayaSklad2.save();
                            }
                        }
                    }
                }
            }
        }*/
        await res.status(200);
        await res.end('success')
    } catch (err) {
        let _object = new ModelsError({
            err: err.message,
            path: 'integrate put'
        });
        await ModelsError.create(_object)
        console.error(err)
        res.status(501);
        res.end('error')
    }
});

router.get('/out', async (req, res) => {
    res.set('Content+Type', 'application/xml');
    try{
        await res.status(200);
        await res.end(await generateXML())
    } catch (err) {
        let _object = new ModelsError({
            err: err.message,
            path: 'integrate out'
        });
        await ModelsError.create(_object)
        console.error(err)
        res.status(501);
        res.end('error')
    }
});

router.get('/delete', async (req, res) => {
    res.set('Content+Type', 'application/xml');
    try{
        await res.status(200);
        await OutXML.deleteMany()
        await res.end('success')
    } catch (err) {
        let _object = new ModelsError({
            err: err.message,
            path: 'integrate delete'
        });
        await ModelsError.create(_object)
        console.error(err)
        res.status(501);
        res.end('error')
    }
});

module.exports = router;
