const Inspector = require('../models/inspector');
const User = require('../models/user');

const type = `
  type Inspector {
    _id: ID
    createdAt: Date
    user: User
    name: String
    phone: String
    del: Boolean
 }
`;

const query = `
    inspectors(skip: Int, search: String, limit: Int): [Inspector]
    inspectorsCount(search: String): Int
    inspector(_id: ID!): Inspector
`;

const mutation = `
    addInspector(login: String!, password: String!, phone: String, name: String!): String
    setInspector(_id: ID!, login: String, password: String, phone: String, name: String): String
    deleteInspector(_id: ID!): String
`;

const resolvers = {
    inspector: async(parent, {_id}, {user}) => {
        if(['admin', 'главинспектор'].includes(user.role)) {
            return await Inspector.findOne({_id})
                .populate({
                    path: 'user'
                })
                .lean()
        }
    },
    inspectors: async(parent, {skip, search, limit}, {user}) => {
        if(['admin', 'главинспектор'].includes(user.role)) {
            return await Inspector.find({
                del: {$ne: true},
                ...search?{$or: [{name: {'$regex': search, '$options': 'i'}}, {phone: {'$regex': search, '$options': 'i'}}]}:{}
            })
                .skip(skip != undefined ? skip : 0)
                .limit(limit? limit : skip != undefined ? 50 : 10000000000)
                .sort('-createdAt')
                .select('_id name createdAt')
                .lean()
        }
    },
    inspectorsCount: async(parent, {search}, {user}) => {
        if(['admin', 'главинспектор'].includes(user.role)) {
            return await Inspector.count({
                del: {$ne: true},
                ...search?{$or: [{name: {'$regex': search, '$options': 'i'}}, {phone: {'$regex': search, '$options': 'i'}}]}:{},
            })
                .lean()
        }
    },
};

const resolversMutation = {
    addInspector: async(parent, {login, password, phone, name}, {user}) => {
        if(['admin', 'главинспектор'].includes(user.role)) {
            let object = new User({
                login,
                role: 'инспектор',
                status: 'active',
                password,
            });
            object = await User.create(object)
            object = new Inspector({
                name,
                phone,
                user: object._id
            });
            await Inspector.create(object)
            return 'OK'
        }
    },
    setInspector: async(parent, {_id, login, password, phone, name}, {user}) => {
        if(['admin', 'главинспектор'].includes(user.role)) {
            let object = await Inspector.findOne({_id})
            if(name) object.name = name
            if(phone) object.phone = phone
            await object.save()
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
    },
    deleteInspector: async(parent, { _id }, {user}) => {
        if(user.role==='admin'){
            let object = await Inspector.findOne({_id})
            object.del = true
            await object.save()
        }
        return 'OK'
    }
};

module.exports.resolversMutation = resolversMutation;
module.exports.mutation = mutation;
module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;