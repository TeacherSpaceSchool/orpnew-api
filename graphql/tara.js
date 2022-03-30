const Tara = require('../models/tara');

const type = `
  type Tara {
    _id: ID
    createdAt: Date
    name: String
    size: String
    guid: String
  }
`;

const query = `
    taras(skip: Int, search: String): [Tara]
    tarasCount(search: String): Int
    tara(_id: ID!): Tara
`;

const resolvers = {
    tara: async(parent, {_id}, {user}) => {
        if(['admin', 'организатор', 'реализатор'].includes(user.role)) {
            return await Tara.findOne({
                _id
            })
                .lean()
        }
    },
    taras: async(parent, {skip, search}, {user}) => {
        if(['admin', 'организатор', 'реализатор'].includes(user.role)) {
            return await Tara.find({
                del: {$ne: true},
                ...search?{$or: [{name: {'$regex': search, '$options': 'i'}}, {guid: {'$regex': search, '$options': 'i'}}]}:{},
            })
                .skip(skip != undefined ? skip : 0)
                .limit(skip != undefined ? 50 : 10000000000)
                .sort('-createdAt')
                .select('_id name size guid createdAt')
                .lean()
        }
    },
    tarasCount: async(parent, {search}, {user}) => {
        if(['admin', 'организатор', 'реализатор'].includes(user.role)) {
            return await Tara.count({
                del: {$ne: true},
                ...search?{$or: [{name: {'$regex': search, '$options': 'i'}}, {guid: {'$regex': search, '$options': 'i'}}]}:{},
            })
                .lean()
        }
    },
};

module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;