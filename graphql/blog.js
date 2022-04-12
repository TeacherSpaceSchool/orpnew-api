const Blog = require('../models/blog');
const { saveImage, deleteFile, urlMain } = require('../module/const');
const { sendWebPush } = require('../module/webPush');

const type = `
  type Blog {
    _id: ID
    createdAt: Date
    image: String
    title: String
    text: String
    url: String
  }
`;

const query = `
    blogs(search: String, skip: Int): [Blog]
`;

const mutation = `
    addBlog(image: Upload!, title: String!, text: String!, url: String): Blog
    deleteBlog(_id: ID!): String
`;

const resolvers = {
    blogs: async(parent, {search, skip}, {user}) => {
        if(user.role) {
            return await Blog.find({
                ...search?{title: {'$regex': search, '$options': 'i'}}:{}
            })
                .skip(skip != undefined ? skip : 0)
                .limit(skip != undefined ? 50 : 10000000000)
                .sort('-createdAt')
                .lean()
        }
    }
};

const resolversMutation = {
    addBlog: async(parent, {image, text, title, url}, {user}) => {
        if(user.role==='admin'){
            let { stream, filename } = await image;
            filename = await saveImage(stream, filename)
            let object = new Blog({
                image: urlMain+filename, text, title, url
            });
            object = await Blog.create(object)
            await sendWebPush({title, text, user: 'all', icon: urlMain+filename})
            return object
        }
    },
    deleteBlog: async(parent, { _id }, {user}) => {
        if(user.role==='admin'){
            let object = await Blog.findOne({_id}).select('image').lean()
            await deleteFile(object.image)
            await Blog.findByIdAndDelete(_id)
        }
        return 'OK'
    }
};

module.exports.resolversMutation = resolversMutation;
module.exports.mutation = mutation;
module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;