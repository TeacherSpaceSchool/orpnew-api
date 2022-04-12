const Region = require('../models/region');
const Organizator = require('../models/organizator');

const type = `
  type Region {
    _id: ID
    createdAt: Date
    name: String
    guid: String
  }
`;

const query = `
    regions(skip: Int, search: String, free: Boolean): [Region]
    regionsCount(search: String): Int
    region(_id: ID!): Region
`;

const resolvers = {
    region: async(parent, {_id}, {user}) => {
        if(['admin', 'организатор'].includes(user.role)) {
            return await Region.findOne({
                ...user.region?{_id: user.region}:{_id},
            })
                .lean()
        }
    },
    regions: async(parent, {skip, search, free}, {user}) => {
        if(['admin', 'организатор', 'главинспектор', 'инспектор'].includes(user.role)) {
            let used
            if(free)
                used = await Organizator.find({
                    del: {$ne: true},
                    guidRegion: {$ne: 'lol'}
                }).distinct('region').lean()
            return await Region.find({
                ...free ? {_id: {'$nin': used}} : {},
                del: {$ne: true},
                ...user.region ? {$or: [{_id: user.region}, {guid: 'lol'}]} : {},
                ...search?{$or: [{name: {'$regex': search, '$options': 'i'}}, {guid: {'$regex': search, '$options': 'i'}}]}:{}
            })
                .skip(skip != undefined ? skip : 0)
                .limit(skip != undefined ? 50 : 10000000000)
                .sort('-createdAt')
                .select('_id name guid createdAt')
                .lean()
        }
    },
    regionsCount: async(parent, {search}, {user}) => {
        if(['admin', 'организатор'].includes(user.role)) {
            return await Region.count({
                del: {$ne: true},
                ...user.region?{$or: [{_id: user.region}, {guid: 'lol'}]}:{},
                ...search?{$or: [{name: {'$regex': search, '$options': 'i'}}, {guid: {'$regex': search, '$options': 'i'}}]}:{}
            })
                .lean()
        }
    },
};

module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;