const OtchetOrganizatora = require('../models/otchetOrganizatora');
const {checkDate} = require('../module/const');

const type = `
  type OtchetOrganizatora {
    _id: ID
    createdAt: Date
    dataTable: String
    organizator: Organizator
    region: Region
    guidOrganizator: String
    guidRegion: String
    checkAdmin: Boolean
  }
`;

const query = `
    otchetOrganizatoras(date: String, region: ID, skip: Int, limit: Int): [OtchetOrganizatora]
    otchetOrganizatorasCount(date: String, region: ID): Int
    otchetOrganizatora(_id: ID): OtchetOrganizatora
`;

const mutation = `
    addOtchetOrganizatora(dataTable: String!): String
    setOtchetOrganizatora(_id: ID!, dataTable: String!, checkAdmin: Boolean): String
`;

const resolvers = {
    otchetOrganizatora: async(parent, {_id}, {user}) => {
        if(['admin', 'организатор'].includes(user.role)) {
            let dateStart, dateEnd
            if(!_id) {
                dateStart = new Date()
                dateStart.setHours(0, 0, 0, 0)
                dateEnd = new Date(dateStart)
                dateEnd.setDate(dateEnd.getDate() + 1)
            }
            return await OtchetOrganizatora.findOne({
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
    otchetOrganizatoras: async(parent, {date, region, skip, limit}, {user}) => {
        //await OtchetOrganizatora.deleteMany()
        if(['admin', 'организатор'].includes(user.role)) {
            let dateStart, dateEnd
            if (date&&date.length) {
                dateStart = checkDate(date)
                dateStart.setHours(0, 0, 0, 0)
                dateEnd = new Date(dateStart)
                dateEnd.setDate(dateEnd.getDate() + 1)
            }
            return await OtchetOrganizatora.find({
                ...user.region?{region: user.region}:region?{region}:{},
                ...dateStart?{$and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}}]}:{},
            })
                .skip(skip != undefined ? skip : 0)
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
    otchetOrganizatorasCount: async(parent, {date, region}, {user}) => {
        if(['admin', 'организатор'].includes(user.role)) {
            let dateStart, dateEnd
            if (date&&date.length) {
                dateStart = checkDate(date)
                dateStart.setHours(0, 0, 0, 0)
                dateEnd = new Date(dateStart)
                dateEnd.setDate(dateEnd.getDate() + 1)
            }
            return await OtchetOrganizatora.count({
                ...user.region?{region: user.region}:region?{region}:{},
                ...dateStart?{$and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}}]}:{},
            })
                .lean()
        }
    },
};

const resolversMutation = {
    addOtchetOrganizatora: async(parent, {dataTable}, {user}) => {
        if(['admin', 'организатор'].includes(user.role)) {
            let dateStart = new Date()
            dateStart.setHours(0, 0, 0, 0)
            let dateEnd = new Date(dateStart)
            dateEnd.setDate(dateEnd.getDate() + 1)
            if(!(await OtchetOrganizatora.findOne({region: user.region, $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}}] }).select('_id').lean())) {
                let object = new OtchetOrganizatora({
                    dataTable,
                    organizator: user.organizator,
                    region: user.region,
                    guidOrganizator: user.guidOrganizator,
                    guidRegion: user.guidRegion
                });
                await OtchetOrganizatora.create(object)
                return 'OK'
            }
        }
    },
    setOtchetOrganizatora: async(parent, {_id, dataTable, checkAdmin}, {user}) => {
        if(['admin', 'организатор'].includes(user.role)) {
            /*let dateStart, dateEnd
            dateStart = new Date()
            dateStart.setHours(0, 0, 0, 0)
            dateEnd = new Date(dateStart)
            dateEnd.setDate(dateEnd.getDate() + 2)
            dateEnd.setHours(dateEnd.getHours() - 12)*/
            let object = await OtchetOrganizatora.findOne({
                ...user.region?{region: user.region}:{},
                ...'организатор'===user.role?{checkAdmin: {$ne: true}}:{},
                //$and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}}],
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