const NakladnayaNaVecherniyVozvrat = require('../models/nakladnayaNaVecherniyVozvrat');
const {checkDate} = require('../module/const');

const type = `
  type NakladnayaNaVecherniyVozvrat {
    _id: ID
    createdAt: Date
    dataTable: String
    organizator: Organizator
    region: Region
    guidOrganizator: String
    guidRegion: String
 }
`;

const query = `
    nakladnayaNaVecherniyVozvrats(date: String, region: ID, skip: Int, limit: Int): [NakladnayaNaVecherniyVozvrat]
    nakladnayaNaVecherniyVozvratsCount(date: String, region: ID): Int
    nakladnayaNaVecherniyVozvrat(_id: ID): NakladnayaNaVecherniyVozvrat
`;

const resolvers = {
    nakladnayaNaVecherniyVozvrat: async(parent, {_id}, {user}) => {
        if(['admin', 'организатор'].includes(user.role)) {
            let dateStart, dateEnd
            if(!_id) {
                dateStart = new Date()
                dateStart.setHours(0, 0, 0, 0)
                dateEnd = new Date(dateStart)
                dateEnd.setDate(dateEnd.getDate() + 1)
            }
            return await NakladnayaNaVecherniyVozvrat.findOne({
                ...user.region?{region: user.region}:{},
                ..._id?{_id}:{$and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}}]}
            })
                .populate({
                    path: 'organizator',
                    select: '_id name'
                })
                .populate({
                    path: 'region',
                    select: '_id name'
                })
                .lean()
        }
    },
    nakladnayaNaVecherniyVozvrats: async(parent, {date, region, skip, limit}, {user}) => {
        //await NakladnayaNaVecherniyVozvrat.deleteMany()
        if(['admin', 'организатор'].includes(user.role)) {
            let dateStart, dateEnd
            if (date&&date.length) {
                dateStart = checkDate(date)
                dateStart.setHours(0, 0, 0, 0)
                dateEnd = new Date(dateStart)
                dateEnd.setDate(dateEnd.getDate() + 1)
            }
            return await NakladnayaNaVecherniyVozvrat.find({
                ...user.region?{region: user.region}:region?{region}:{},
                ...dateStart?{$and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}}]}:{},
            })
                .skip(skip!=undefined ? skip : 0)
                .limit(limit? limit : skip != undefined ? 50 : 10000000000)
                .sort('-createdAt')
                .select('_id createdAt region')
                .populate({
                    path: 'region',
                    select: '_id name'
                })
                .lean()
        }
    },
    nakladnayaNaVecherniyVozvratsCount: async(parent, {date, region}, {user}) => {
        if(['admin', 'организатор'].includes(user.role)) {
            let dateStart, dateEnd
            if (date&&date.length) {
                dateStart = checkDate(date)
                dateStart.setHours(0, 0, 0, 0)
                dateEnd = new Date(dateStart)
                dateEnd.setDate(dateEnd.getDate() + 1)
            }
            return await NakladnayaNaVecherniyVozvrat.count({
                ...user.region?{region: user.region}:region?{region}:{},
                ...dateStart?{$and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}}]}:{},
            })
                .lean()
        }
    },
};

module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;