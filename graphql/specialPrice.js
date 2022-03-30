const SpecialPrice = require('../models/specialPrice');
const Point = require('../models/point');

const type = `
  type SpecialPrice {
    _id: ID
    createdAt: Date
    point: Point
    prices: String
  }
`;

const query = `
    freePointsForSpecialPrice(region: ID): [Point]
    specialPrices(point: ID, limit: Int, skip: Int): [SpecialPrice]
    specialPricesCount(point: ID): Int
    specialPrice(_id: ID!): SpecialPrice
`;

const mutation = `
    addSpecialPrice(point: ID!, prices: String!): String
    setSpecialPrice(_id: ID!, prices: String!): String
    deleteSpecialPrice(_id: ID!): String
`;

const resolvers = {
    specialPrice: async(parent, {_id}, {user}) => {
        if(['admin', 'организатор', 'реализатор'].includes(user.role)) {
            return await SpecialPrice.findOne({
                ...user.point?{point: user.point}:{$or: [{point: _id}, {_id}]}
            })
                .populate({
                    path: 'point',
                    select: '_id name'
                })
                .lean()
        }
    },
    freePointsForSpecialPrice: async(parent, {region}, {user}) => {
        if('admin'===user.role) {
            let used = await SpecialPrice.find()
                .distinct('point')
                .lean()
            return await Point.find({
                ...region?{region}:{},
                _id: {'$nin': used},
                del: {$ne: true},
            })
                .sort('name')
                .select('_id name')
                .lean()
        }
    },
    specialPrices: async(parent, {point, limit, skip}, {user}) => {
        if('admin'===user.role) {
            return await SpecialPrice.find({
                ...point?{point}:{},
            })
                .skip(skip != undefined ? skip : 0)
                .limit(limit? limit : skip != undefined ? 50 : 10000000000)
                .sort('-createdAt')
                .populate({
                    path: 'point',
                    select: '_id name'
                })
                .lean()
        }
    },
    specialPricesCount: async(parent, {point}, {user}) => {
        if('admin'===user.role) {
            return await SpecialPrice.count({
                ...point?{point}:{},
            })
                .lean()
        }
    },
};

const resolversMutation = {
    addSpecialPrice: async(parent, {point, prices}, {user}) => {
        if('admin'===user.role) {
            if(!(await SpecialPrice.findOne({point}).select('_id').lean())) {
                let object = new SpecialPrice({
                    point, prices
                });
                await SpecialPrice.create(object)
                return 'OK'
            }
        }
    },
    setSpecialPrice: async(parent, {_id, prices}, {user}) => {
        if('admin'===user.role) {
            let object = await SpecialPrice.findOne({
                _id
            })
            object.prices = prices
            await object.save()
            return 'OK'
        }
    },
    deleteSpecialPrice: async(parent, {_id}, {user}) => {
        if('admin'===user.role) {
            await SpecialPrice.deleteOne({_id})
            return 'OK'
        }
    }
};

module.exports.resolversMutation = resolversMutation;
module.exports.mutation = mutation;
module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;