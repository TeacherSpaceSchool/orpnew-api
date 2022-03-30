const NakladnayaSklad1 = require('../models/nakladnayaSklad1');
const {checkDate} = require('../module/const');

const type = `
  type NakladnayaSklad1 {
    _id: ID
    date: Date
    dataTable: String
    organizator: Organizator
    region: Region
    guidOrganizator: String
    guidRegion: String
     checkAdmin: Boolean
 }
`;

const query = `
    nakladnayaSklad1s(date: String, region: ID, skip: Int, limit: Int): [NakladnayaSklad1]
    nakladnayaSklad1sCount(date: String, region: ID): Int
    nakladnayaSklad1(_id: ID): NakladnayaSklad1
`;

const mutation = `
    addNakladnayaSklad1(dataTable: String!): String
    setNakladnayaSklad1(_id: ID!, dataTable: String!, checkAdmin: Boolean): String
`;

const resolvers = {
    nakladnayaSklad1: async(parent, {_id}, {user}) => {
        if(['admin', 'организатор'].includes(user.role)) {
            let dateStart, dateEnd
            if(!_id) {
                dateStart = new Date()
                dateStart.setHours(0, 0, 0, 0)
                dateEnd = new Date(dateStart)
                dateEnd.setDate(dateEnd.getDate() + 1)
            }
            return await NakladnayaSklad1.findOne({
                ...user.region?{region: user.region}:{},
                ..._id?{_id}:{$and: [{date: {$gte: dateStart}}, {date: {$lt: dateEnd}}]}
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
    nakladnayaSklad1s: async(parent, {date, region, skip, limit}, {user}) => {
        //await NakladnayaSklad1.deleteMany()
        if(['admin', 'организатор'].includes(user.role)) {
            let dateStart, dateEnd
            if (date&&date.length) {
                dateStart = checkDate(date)
                dateStart.setHours(0, 0, 0, 0)
                dateEnd = new Date(dateStart)
                dateEnd.setDate(dateEnd.getDate() + 1)
            }
            return await NakladnayaSklad1.find({
                ...user.region?{region: user.region}:region?{region}:{},
                ...dateStart?{$and: [{date: {$gte: dateStart}}, {date: {$lt: dateEnd}}]}:{},
            })
                .skip(skip != undefined ? skip : 0)
                .limit(limit? limit : skip != undefined ? 50 : 10000000000)
                .sort('-date')
                .select('_id date region')
                .populate({
                    path: 'region',
                    select: '_id name'
                })
                .lean()
        }
    },
    nakladnayaSklad1sCount: async(parent, {date, region}, {user}) => {
        if(['admin', 'организатор'].includes(user.role)) {
            let dateStart, dateEnd
            if (date&&date.length) {
                dateStart = checkDate(date)
                dateStart.setHours(0, 0, 0, 0)
                dateEnd = new Date(dateStart)
                dateEnd.setDate(dateEnd.getDate() + 1)
            }
            return await NakladnayaSklad1.count({
                ...user.region?{region: user.region}:region?{region}:{},
                ...dateStart?{$and: [{date: {$gte: dateStart}}, {date: {$lt: dateEnd}}]}:{},
            })
                .lean()
        }
    },
};

const resolversMutation = {
    addNakladnayaSklad1: async(parent, {dataTable}, {user}) => {
        if('организатор'===user.role) {
            let dateStart = new Date()
            dateStart.setHours(0, 0, 0, 0)
            let dateEnd = new Date(dateStart)
            dateEnd.setDate(dateEnd.getDate() + 1)
            if(!(await NakladnayaSklad1.findOne({region: user.region, $and: [{date: {$gte: dateStart}}, {date: {$lt: dateEnd}}] }).select('_id').lean())) {
                let object = new NakladnayaSklad1({
                    date: new Date(),
                    dataTable,
                    organizator: user.organizator,
                    region: user.region,
                    guidOrganizator: user.guidOrganizator,
                    guidRegion: user.guidRegion
                });
                await NakladnayaSklad1.create(object)
                return 'OK'
            }
        }
    },
    setNakladnayaSklad1: async(parent, {_id, dataTable, checkAdmin}, {user}) => {
        if(['admin', 'организатор'].includes(user.role)) {
            /*let dateStart, dateEnd
            dateStart = new Date()
            dateStart.setHours(0, 0, 0, 0)
            dateEnd = new Date(dateStart)
            dateEnd.setDate(dateEnd.getDate() + 2)
            dateEnd.setHours(dateEnd.getHours() - 12)*/
            let object = await NakladnayaSklad1.findOne({
                //$and: [{date: {$gte: dateStart}}, {date: {$lt: dateEnd}}],
                ...'организатор'===user.role?{checkAdmin: {$ne: true}}:{},
                ...user.region?{region: user.region}:{},
                _id
            })
            object.dataTable = dataTable
            if(checkAdmin!=undefined&&'admin'===user.role)
                object.checkAdmin = checkAdmin
            await object.save()
            return 'OK'
        }
    }
};

module.exports.resolversMutation = resolversMutation;
module.exports.mutation = mutation;
module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;