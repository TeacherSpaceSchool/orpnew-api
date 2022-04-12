const Realizator = require('../models/realizator');
const Organizator = require('../models/organizator');
const User = require('../models/user');
const Point = require('../models/point');
const OtchetRealizatora = require('../models/otchetRealizatora');
const {prepareXML} = require('../module/outXML');

const type = `
  type Realizator {
    _id: ID
    createdAt: Date
    name: String
    phone: String
    point: Point
    region: Region
    user: User
    guid: String
    guidPoint: String
    guidRegion: String
  }
`;

const query = `
    realizators(skip: Int, region: ID, limit: Int, search: String, point: ID): [Realizator]
    realizatorsCount(region: ID, search: String, point: ID): Int
    realizator(_id: ID!): Realizator
`;

const mutation = `
    setRealizator(_id: ID!, phone: String, login: String, password: String, region: ID, guidRegion: String, point: ID, guidPoint: String): String
`;

const resolvers = {
    realizator: async(parent, {_id}, {user}) => {
        if(['admin', 'организатор', 'реализатор', 'главинспектор', 'инспектор'].includes(user.role)) {
            return await Realizator.findOne({
                ...user.region?{$or: [{region: user.region}, {guidRegion: 'lol'}]}:{},
                ...'реализатор'===user.role?{_id: user.realizator}:{$or: [{_id}, {point: _id}]}
            })
                .populate({
                    path: 'user'
                })
                .populate({
                    path: 'region'
                })
                .populate({
                    path: 'point'
                })
                .lean()
        }
    },
    realizators: async(parent, {skip, region, point, search, limit}, {user}) => {
        if(['admin', 'организатор', 'главинспектор', 'инспектор'].includes(user.role)) {
            return await Realizator.find({
                del: {$ne: true},
                ...user.region?{$or: [{region: user.region}, {guidRegion: 'lol'}]}:{},
                ...region?{region}:{},
                ...point?{point}:{},
                ...search?{$or: [{name: {'$regex': search, '$options': 'i'}}, {guid: {'$regex': search, '$options': 'i'}}]}:{}
            })
                .skip(skip != undefined ? skip : 0)
                .limit(limit? limit : skip != undefined ? 50 : 10000000000)
                .sort('-createdAt')
                .select('_id name guid region point createdAt')
                .populate({
                    path: 'region',
                    select: 'name'
                })
                .populate({
                    path: 'point',
                    select: 'name'
                })
                .lean()
        }
    },
    realizatorsCount: async(parent, {region, search, point}, {user}) => {
        if(['admin', 'организатор'].includes(user.role)) {
            return await Realizator.count({
                del: {$ne: true},
                ...point?{point}:{},
                ...user.region?{$or: [{region: user.region}, {guidRegion: 'lol'}]}:{},
                ...region?{region}:{},
                ...search?{$or: [{name: {'$regex': search, '$options': 'i'}}, {guid: {'$regex': search, '$options': 'i'}}]}:{},
            })
                .lean()
        }
    },
};

const resolversMutation = {
    setRealizator: async(parent, {_id, login, password, phone, region, point, guidPoint, guidRegion}, {user}) => {
        if(['admin', 'организатор'].includes(user.role)) {
            let object = await Realizator.findOne({
                ...user.region?{$or: [{region: user.region}, {guidRegion: 'lol'}]}:{},
                _id
            })
            if(phone)
                object.phone = phone
            if(region&&guidRegion) {
                object.region = region
                object.guidRegion = guidRegion
                if(!point&&!guidPoint) {
                    let point = await Point.findOne({guid: 'lol'}).select('_id').lean()
                    object.point = point._id
                    object.guidPoint = 'lol'
                }
            }
            if(point&&guidPoint/*&&!region&&!guidRegion*/) {
                if(guidPoint==='lol'||!(await Realizator.find({guidPoint, point}).select('_id').lean()).length) {
                    object.point = point
                    object.guidPoint = guidPoint
                    if(guidPoint!=='lol'){
                        let dateStart = new Date()
                        dateStart.setHours(0, 0, 0, 0)
                        let dateEnd = new Date(dateStart)
                        dateEnd.setDate(dateEnd.getDate() + 1)
                        await OtchetRealizatora.updateMany(
                            {point: point, $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}}]},
                            {realizator: object._id, guidRealizator: object.guid}
                        )
                        let _point = await Point.findOne({_id: point}).select('guidRegion').lean()
                        let organizator = await Organizator.findOne({guidRegion: _point.guidRegion}).select('guid').lean()
                        await prepareXML({guidRegion: _point.guidRegion, guidOrganizator: organizator.guid})
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