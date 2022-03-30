const Organizator = require('../models/organizator');
const NakladnayaNaPustuyTaru = require('../models/nakladnayaNaPustuyTaru');
const NakladnayaNaVecherniyVozvrat = require('../models/nakladnayaNaVecherniyVozvrat');
const NakladnayaSklad1 = require('../models/nakladnayaSklad1');
const NakladnayaSklad2 = require('../models/nakladnayaSklad2');
const OtchetOrganizatora = require('../models/otchetOrganizatora');
const OtchetRealizatora = require('../models/otchetRealizatora');
const User = require('../models/user');
const {prepareXML} = require('../module/outXML');

const type = `
  type Organizator {
    _id: ID
    createdAt: Date
    name: String
    region: Region
    user: User
    guid: String
    guidRegion: String
 }
`;

const query = `
    organizators(skip: Int, search: String, limit: Int, region: ID): [Organizator]
    organizatorsCount(search: String region: ID): Int
    organizator(_id: ID!): Organizator
`;

const mutation = `
    setOrganizator(_id: ID!, login: String, password: String, region: ID, guidRegion: String, status: String): String
`;

const resolvers = {
    organizator: async(parent, {_id}, {user}) => {
        if(['admin', 'организатор', 'реализатор'].includes(user.role)) {
            return await Organizator.findOne({
                ...'реализатор'===user.role?{region: user.region}:{},
                ...user.role==='организатор'?{user: user._id}:{$or: [{_id}, {region: _id}]}
            })
                .populate({
                    path: 'user'
                })
                .populate({
                    path: 'region'
                })
                .lean()
        }
    },
    organizators: async(parent, {skip, search, region, limit}, {user}) => {
        if(['admin', 'организатор'].includes(user.role)) {
            return await Organizator.find({
                del: {$ne: true},
                ...region?{region}:{},
                ...user.role==='организатор'?{user: user._id}:{},
                ...search?{$or: [{name: {'$regex': search, '$options': 'i'}}, {guid: {'$regex': search, '$options': 'i'}}]}:{}
            })
                .skip(skip != undefined ? skip : 0)
                .limit(limit? limit : skip != undefined ? 50 : 10000000000)
                .sort('-createdAt')
                .select('_id name guid region createdAt')
                .populate({
                    path: 'region',
                    select: '-createdAt'
                })
                .lean()
        }
    },
    organizatorsCount: async(parent, {search, region}, {user}) => {
        if(['admin', 'организатор'].includes(user.role)) {
            return await Organizator.count({
                del: {$ne: true},
                ...region?{region}:{},
                ...search?{$or: [{name: {'$regex': search, '$options': 'i'}}, {guid: {'$regex': search, '$options': 'i'}}]}:{},
                ...user.role==='организатор'?{user: user._id}:{}
            })
                .lean()
        }
    },
};

const resolversMutation = {
    setOrganizator: async(parent, {_id, login, password, region, guidRegion}, {user}) => {
        if(['admin', 'организатор'].includes(user.role)) {
            let object = await Organizator.findOne({
                ...user.role==='организатор'?{user: user._id}:{_id}
            })
            if(region&&guidRegion) {
                if(guidRegion==='lol'||!(await Organizator.find({guidRegion, region}).select('_id').lean()).length) {
                    object.region = region
                    object.guidRegion = guidRegion
                    if(guidRegion!=='lol'){
                        let dateStart = new Date()
                        dateStart.setHours(0, 0, 0, 0)
                        let dateEnd = new Date(dateStart)
                        dateEnd.setDate(dateEnd.getDate() + 1)
                        await NakladnayaSklad1.updateMany(
                            {region: region, $and: [{date: {$gte: dateStart}}, {date: {$lt: dateEnd}}]},
                            {organizator: object._id, guidOrganizator: object.guid}
                        )
                        await NakladnayaSklad2.updateMany(
                            {region: region, $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}}]},
                            {organizator: object._id, guidOrganizator: object.guid}
                        )
                        await NakladnayaNaPustuyTaru.updateMany(
                            {region: region, $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}}]},
                            {organizator: object._id, guidOrganizator: object.guid}
                        )
                        await NakladnayaNaVecherniyVozvrat.updateMany(
                            {region: region, $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}}]},
                            {organizator: object._id, guidOrganizator: object.guid}
                        )
                        await OtchetOrganizatora.updateMany(
                            {region: region, $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}}]},
                            {organizator: object._id, guidOrganizator: object.guid}
                        )
                        await OtchetRealizatora.updateMany(
                            {region: region, $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}}]},
                            {organizator: object._id, guidOrganizator: object.guid}
                        )
                        await prepareXML({guidRegion, guidOrganizator: object.guid})
                    }
                }
            }
            if(login||password) {
                let _user = await User.findOne({
                    _id: object.user
                })
                if(login)
                    _user.login = login
                if(password&&password.length>=8)
                    _user.password = password
                await _user.save()
            }
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