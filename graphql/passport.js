const { signinuserGQL } = require('../module/passport');

const type = `
  type Status {
    role: String
    status: String
    login: String
    _id: ID
    realizator: ID
    organizator: ID
    guid: String
    point: ID
    guidPoint: String
    namePoint: String
    region: ID
    guidRegion: String
    nameRegion: String
  }
`;

const query = `
       getStatus: Status
`;

const resolvers = {
    getStatus: async(parent, args, {user}) => {
        return user
    },
};

const mutation = `
    signinuser(login: String!, password: String!): Status
`;

const resolversMutation = {
    signinuser: async(parent, { login, password}, {req, res}) => {
        return await signinuserGQL({ ...req, query: {login: login, password: password}}, res);
    },
};

module.exports.resolvers = resolvers;
module.exports.query = query;
module.exports.resolversMutation = resolversMutation;
module.exports.mutation = mutation;
module.exports.type = type;