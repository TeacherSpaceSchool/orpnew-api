const NakladnayaNaPustuyTaru = require('../models/nakladnayaNaPustuyTaru');
const {checkDate} = require('../module/const');

const type = `
  type NakladnayaNaPustuyTaru {
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
    nakladnayaNaPustuyTarus(date: String, region: ID, limit: Int, skip: Int): [NakladnayaNaPustuyTaru]
    nakladnayaNaPustuyTarusCount(date: String, region: ID): Int
    nakladnayaNaPustuyTaru(_id: ID): NakladnayaNaPustuyTaru
`;

const mutation = `
    addNakladnayaNaPustuyTaru(dataTable: String!, date: String, organizator: ID, region: ID, guidOrganizator: String, guidRegion: String): String
    setNakladnayaNaPustuyTaru(_id: ID!, dataTable: String!, checkAdmin: Boolean): String
`;

const resolvers = {
    nakladnayaNaPustuyTaru: async(parent, {_id}, {user}) => {
        if(['admin', 'организатор'].includes(user.role)) {
            let dateStart, dateEnd
            if(!_id) {
                dateStart = new Date()
                dateStart.setHours(0, 0, 0, 0)
                dateEnd = new Date(dateStart)
                dateEnd.setDate(dateEnd.getDate() + 1)
            }
            return await NakladnayaNaPustuyTaru.findOne({
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
    nakladnayaNaPustuyTarus: async(parent, {date, region, skip, limit}, {user}) => {
        //await NakladnayaNaPustuyTaru.deleteMany()
        if(['admin', 'организатор'].includes(user.role)) {
            let dateStart, dateEnd
            if (date&&date.length) {
                dateStart = checkDate(date)
                dateStart.setHours(0, 0, 0, 0)
                dateEnd = new Date(dateStart)
                dateEnd.setDate(dateEnd.getDate() + 1)
            }
            return await NakladnayaNaPustuyTaru.find({
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
    nakladnayaNaPustuyTarusCount: async(parent, {date, region}, {user}) => {
        if(['admin', 'организатор'].includes(user.role)) {
            let dateStart, dateEnd
            if (date&&date.length) {
                dateStart = checkDate(date)
                dateStart.setHours(0, 0, 0, 0)
                dateEnd = new Date(dateStart)
                dateEnd.setDate(dateEnd.getDate() + 1)
            }
            return await NakladnayaNaPustuyTaru.count({
                ...user.region?{region: user.region}:region?{region}:{},
                ...dateStart?{$and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}}]}:{},
            })
                .lean()
        }
    },
};

const resolversMutation = {
    addNakladnayaNaPustuyTaru: async(parent, {dataTable}, {user}) => {
        if('организатор'===user.role) {
            let dateStart = new Date()
            dateStart.setHours(0, 0, 0, 0)
            let dateEnd = new Date(dateStart)
            dateEnd.setDate(dateEnd.getDate() + 1)
            if(!(await NakladnayaNaPustuyTaru.findOne({region: user.region, $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}}]}).select('_id').lean())) {
                let object = new NakladnayaNaPustuyTaru({
                    dataTable,
                    organizator: user.organizator,
                    region: user.region,
                    guidOrganizator: user.guidOrganizator,
                    guidRegion: user.guidRegion
                });
                await NakladnayaNaPustuyTaru.create(object)
                return 'OK'
            }
        }
    },
    setNakladnayaNaPustuyTaru: async(parent, {_id, dataTable, checkAdmin}, {user}) => {
        if(['admin', 'организатор'].includes(user.role)) {
            /*let dateStart, dateEnd
            dateStart = new Date()
            dateStart.setHours(0, 0, 0, 0)
            dateEnd = new Date(dateStart)
            dateEnd.setDate(dateEnd.getDate() + 2)
            dateEnd.setHours(dateEnd.getHours() - 12)*/
            let object = await NakladnayaNaPustuyTaru.findOne({
                //$and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}}],
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