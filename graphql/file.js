const app = require('../app');
const {pdDDMMYYHHMM} = require('../module/const');
const fs = require('fs');
const path = require('path');
const dirs = ['images', 'xlsx']
const { deleteFile, urlMain } = require('../module/const');
const Blog = require('../models/blog');
const Faq = require('../models/faq');

const type = `
  type File {
    name: String
    url: String
    size: Float
    createdAt: String
    active: String
    owner: String
  }
`;

const query = `
    files(filter: String!): [File]
`;

const mutation = `
    clearAllDeactiveFiles: String
`;

const resolvers = {
    files: async(parent, {filter}, {user}) => {
        if(user.role==='admin') {
            let data = [], res = [], filesUrl = [], stat, size, createdAt, url
            for (let i = 0; i < dirs.length; i++) {
                url = path.join(app.dirname, 'public', dirs[i])
                if (fs.existsSync(url)) {
                    const files = fs.readdirSync(url, 'utf8');
                    for (let name of files) {
                        url = path.join(app.dirname, 'public', dirs[i], name)
                        stat = fs.statSync(url)
                        createdAt = pdDDMMYYHHMM(stat.atime)
                        size = Math.round((stat.size / 1000000) * 1000) / 1000;
                        data.push({name, size, url: dirs[i], createdAt});
                        filesUrl.push(`${urlMain}/${dirs[i]}/${name}`)
                    }
                }
            }
            res = [
                ...(await Blog.find({image: {$in: filesUrl}}).select('title image').lean()).map(element=>{return {...element, name: element.title, type: 'Блог'}}),
                ...(await Faq.find({url: {$in: filesUrl}}).select('title url').lean()).map(element=>{return {...element, name: element.title, type: 'Инструкция'}}),
            ]
            filesUrl = {}
            for (let i = 0; i < res.length; i++) {
                filesUrl[res[i].image?res[i].image:res[i].url?res[i].url:'lol'] = res[i]
            }
            res = []
            let fileUrl
            for (let i = 0; i < data.length; i++) {
                fileUrl = filesUrl[`${urlMain}/${data[i].url}/${data[i].name}`]
                data[i].active = fileUrl ? 'активен' : 'неактивен'
                data[i].owner = fileUrl? `${fileUrl.type} ${fileUrl.name}`: 'Отсутствует'
                if(!filter.length||(filter==='active'&&fileUrl)||(filter==='deactive'&&!fileUrl))
                    res.push(data[i])
            }
            res = res.sort(function (a, b) {
                return b.size - a.size
            });
            return res;
        }
    }
};

const resolversMutation = {
    clearAllDeactiveFiles: async(parent, ctx, {user}) => {
        if('admin'===user.role){
            let data = [], url, filesUrl = []
            for (let i = 0; i < dirs.length; i++) {
                url = path.join(app.dirname, 'public', dirs[i])
                if (fs.existsSync(url)) {
                    const files = fs.readdirSync(url, 'utf8');
                    for (let name of files) {
                        data.push(`${urlMain}/${dirs[i]}/${name}`)
                    }
                }
            }
            filesUrl = [
                ...(await Blog.find({image: {$in: data}}).distinct('image').lean()),
                ...(await Faq.find({url: {$in: data}}).distinct('url').lean()),
            ]
            for (let i = 0; i < data.length; i++) {
                if(!filesUrl.includes(data[i]))
                    await deleteFile(data[i])
            }
        }
        return 'OK'
    }
};

module.exports.resolversMutation = resolversMutation;
module.exports.mutation = mutation;
module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;