const Error = require('../models/error');

const type = `
  type Error {
    _id: ID
    createdAt: Date
    err: String
    path: String
  }
`;

const query = `
    errors(skip: Int): [Error]
    errorsCount: Int
`;

const mutation = `
    clearAllErrors: String
`;

const resolvers = {
    errors: async(parent, {skip}, {user}) => {
        if('admin'===user.role){
            return await Error.find()
                .skip(skip != undefined ? skip : 0)
                .limit(skip != undefined ? 50 : 10000000000)
                .sort('-createdAt')
                .lean()
        }
    },
    errorsCount: async(parent, ctx, {user}) => {
        if('admin'===user.role){
            return await Error.count()
                .lean()
        }
    },
};

const resolversMutation = {
    clearAllErrors: async(parent, ctx, {user}) => {
        if('admin'===user.role){
            await Error.deleteMany()
        }
        return 'OK'
    }
};

module.exports.resolversMutation = resolversMutation;
module.exports.mutation = mutation;
module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;