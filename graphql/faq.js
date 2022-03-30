const Faq = require('../models/faq');
const { saveFile, deleteFile, urlMain } = require('../module/const');

const type = `
  type Faq {
    _id: ID
    createdAt: Date
    url: String
    title: String
    video: String
    typex:  [String]
  }
`;

const query = `
    faqs(search: String, skip: Int): [Faq]
`;

const mutation = `
    addFaq(file: Upload, title: String!, typex: [String]!, video: String): Faq
    setFaq(_id: ID!, file: Upload, title: String, typex: [String], video: String): String
    deleteFaq(_id: ID!): String
`;

const resolvers = {
    faqs: async(parent, {search, skip}, {user}) => {
        if(['admin', 'реализатор', 'организатор'].includes(user.role)) {
            return await Faq.find({
                title: {'$regex': search, '$options': 'i'},
                ...['реализатор', 'организатор'].includes(user.role)?{typex: user.role}:{}
            })
                .skip(skip != undefined ? skip : 0)
                .limit(skip != undefined ? 50 : 10000000000)
                .sort('-title')
                .lean()
        }
    }
};

const resolversMutation = {
    addFaq: async(parent, {file, title, video, typex}, {user}) => {
        if(user.role==='admin') {
            let object = new Faq({
                title,
                typex,
                video
            });
            if (file) {
                let {stream, filename} = await file;
                filename = await saveFile(stream, filename)
                object.url = urlMain+filename
            }
            object = await Faq.create(object)
            return object
        }
    },
    setFaq: async(parent, {_id, file, title, video, typex}, {user}) => {
        if(user.role==='admin') {
            let object = await Faq.findById(_id)
            if (file) {
                let {stream, filename} = await file;
                if(object.url) await deleteFile(object.url)
                 filename = await saveFile(stream, filename)
                object.url = urlMain + filename
            }
            if(title) object.title = title
            if(video) object.video = video
            if(typex) object.typex = typex
            await object.save();
        }
        return 'OK'
    },
    deleteFaq: async(parent, { _id }, {user}) => {
        if(user.role==='admin'){
            let object = await Faq.findOne({_id}).select('file').lean()
            if(object.file)
                await deleteFile(object.file)
            await Faq.findByIdAndDelete(_id)
        }
        return 'OK'
    }
};

module.exports.resolversMutation = resolversMutation;
module.exports.mutation = mutation;
module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;