const OtchetRealizatora = require('../models/otchetRealizatora');
const {checkDate, checkInt, checkFloat} = require('../module/const');

const type = `
    type Statistic {
        columns: [String]
        row: [StatisticData]
    }
    type StatisticData {
        _id: ID
        data: [String]
    }
`;

const query = `
    statistic(region: ID, dateStart: Date, dateType: String, type: String): Statistic
`;

const resolvers = {
    statistic: async(parent, {region, dateStart, dateType, type}, {user}) => {
        if('admin'===user.role) {
            region = user.region?user.region:region
            let dateEnd
            if(dateStart){
                dateStart= checkDate(dateStart)
                dateStart.setHours(3, 0, 0, 0)
                dateEnd = new Date(dateStart)
                if(dateType==='year')
                    dateEnd.setFullYear(dateEnd.getFullYear() + 1)
                else if(dateType==='day')
                    dateEnd.setDate(dateEnd.getDate() + 1)
                else if(dateType==='week')
                    dateEnd.setDate(dateEnd.getDate() + 7)
                else
                    dateEnd.setMonth(dateEnd.getMonth() + 1)
            }
            let itogoAll = 0
            let _findOtchetRealizatora = await OtchetRealizatora.find({
                $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}}],
                ...region?{region}:{}
            })
                .populate({
                    path: 'point',
                    select: 'name _id'
                })
                .populate({
                    path: 'region',
                    select: 'name _id'
                })
                .lean()
            let findOtchetRealizatora = {}, tag
            for (let i = 0; i < _findOtchetRealizatora.length; i++) {
                tag = type==='точка'?
                    {name:  `${_findOtchetRealizatora[i].point.name}${!region?` (${_findOtchetRealizatora[i].region.name})`:''}`, _id: _findOtchetRealizatora[i].point._id}
                    :
                    {name:  _findOtchetRealizatora[i].region.name, _id: _findOtchetRealizatora[i].region._id}
                if(!findOtchetRealizatora[tag._id])
                    findOtchetRealizatora[tag._id] = {
                        name: tag.name,
                        itogo: 0
                    }
                findOtchetRealizatora[tag._id].itogo += checkInt(JSON.parse(_findOtchetRealizatora[i].dataTable)['i']['iv'])
                itogoAll += checkInt(JSON.parse(_findOtchetRealizatora[i].dataTable)['i']['iv'])
            }
            const keys = Object.keys(findOtchetRealizatora)
            _findOtchetRealizatora = []
            for(let i=0; i<keys.length; i++){
                _findOtchetRealizatora.push({
                    _id: keys[i],
                    data: [
                        findOtchetRealizatora[keys[i]].name,
                        checkInt(findOtchetRealizatora[keys[i]].itogo),
                        checkFloat(findOtchetRealizatora[keys[i]].itogo*100/itogoAll),
                    ]
                })
            }
            _findOtchetRealizatora = _findOtchetRealizatora.sort(function(a, b) {
                return b.data[1] - a.data[1]
            });
            _findOtchetRealizatora = [
                {
                    _id: 'All',
                    data: [
                        _findOtchetRealizatora.length,
                        checkInt(itogoAll)
                    ]
                },
                ..._findOtchetRealizatora
            ]
            return {
                columns: [type==='точка'?'точка':'район', 'итого(сом)', 'процент(%)'],
                row: _findOtchetRealizatora
            };
        }
    },
};

module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;