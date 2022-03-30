const Price = require('../models/price');

const type = `
  type Price {
    _id: ID
    createdAt: Date
    name: String
    price: Int
    guid: String
  }
`;

const query = `
    prices(skip: Int, search: String): [Price]
    pricesCount(search: String): Int
    price(_id: ID!): Price
`;

const resolvers = {
    price: async(parent, {_id}, {user}) => {
        if(['admin', 'организатор', 'реализатор'].includes(user.role)) {
            return await Price.findOne({
                _id
            })
                .lean()
        }
    },
    prices: async(parent, {skip, search}, {user}) => {
        if(['admin', 'организатор', 'реализатор'].includes(user.role)) {
            return await Price.find({
                del: {$ne: true},
                ...search?{$or: [{name: {'$regex': search, '$options': 'i'}}, {guid: {'$regex': search, '$options': 'i'}}]}:{},
            })
                .skip(skip != undefined ? skip : 0)
                .limit(skip != undefined ? 50 : 10000000000)
                .sort('-createdAt')
                .select('_id name price guid createdAt')
                .lean()
        }
    },
    pricesCount: async(parent, {search}, {user}) => {
        if(['admin', 'организатор', 'реализатор'].includes(user.role)) {
            return await Price.count({
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