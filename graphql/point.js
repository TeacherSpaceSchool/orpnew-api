const Point = require('../models/point');
const Realizator = require('../models/realizator');

const type = `
  type Point {
    _id: ID
    createdAt: Date
    name: String
    region: Region
    guidRegion: String
    guid: String
  }
`;

const query = `
    points(skip: Int, region: ID, search: String, free: Boolean): [Point]
    pointsCount(region: ID, search: String): Int
    point(_id: ID!): Point
`;

const resolvers = {
    point: async(parent, {_id}, {user}) => {
        if(['admin', 'организатор'].includes(user.role)) {
            return await Point.findOne({
                ...user.region?{$or: [{region: user.region}, {guidRegion: 'lol'}]}:{},
                _id
            })
                .populate({
                    path: 'region'
                })
                .lean()
        }
    },
    points: async(parent, {skip, region, search, free}, {user}) => {
        if(['admin', 'организатор', 'главинспектор', 'инспектор'].includes(user.role)) {
            let used
            if(free)
                used = await Realizator.find({
                    ...user.region?{$or: [{region: user.region}, {guidRegion: 'lol'}]}:{},
                    ...region?{region}:{},
                    del: {$ne: true},
                    guidPoint: {$ne: 'lol'}
                }).distinct('point').lean()
            return await Point.find({
                ...free ? {_id: {'$nin': used}} : {},
                del: {$ne: true},

                ...user.region?{$or: [{region: user.region}, {guidRegion: 'lol'}]}:{},
                ...region?{region}:{},

                ...search?{$or: [{name: {'$regex': search, '$options': 'i'}}, {guid: {'$regex': search, '$options': 'i'}}]}:{}
            })
                .skip(skip != undefined ? skip : 0)
                .limit(skip != undefined ? 50 : 10000000000)
                .sort('-createdAt')
                .select('_id name region guid createdAt')
                .populate({
                    path: 'region',
                    select: 'name _id'
                })
                .lean()
        }
    },
    pointsCount: async(parent, {region, search}, {user}) => {
        if(['admin', 'организатор'].includes(user.role)) {
            return await Point.count({
                del: {$ne: true},
                ...user.region?{$or: [{region: user.region}, {guidRegion: 'lol'}]}:{},
                ...region?{region}:{},
                ...search?{$or: [{name: {'$regex': search, '$options': 'i'}}, {guid: {'$regex': search, '$options': 'i'}}]}:{}
            })
                .lean()
        }
    },
};

module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;