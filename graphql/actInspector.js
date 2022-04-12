const ActInspector = require('../models/actInspector');
const {checkDate} = require('../module/const');
const ExcelJS = require('exceljs');
const randomstring = require('randomstring');
const app = require('../app');
const fs = require('fs');
const path = require('path');
const { urlMain, pdDDMMYYYY } = require('../module/const');

const type = `
  type ActInspector {
    _id: ID
    createdAt: Date
    type: String
    inspector: Inspector
    organizator: Organizator
    region: Region
    realizator: Realizator
    point: Point
    checkMainInspector: Boolean
    checkAdmin: Boolean
}
`;

const query = `
    actInspectors(date: String, inspector: ID, region: ID, point: ID, skip: Int, limit: Int, realizator: ID, organizator: ID, dateType: String): [ActInspector]
    actInspectorsCount(date: String, inspector: ID, region: ID, point: ID, realizator: ID, organizator: ID, dateType: String): Int
    actInspector(_id: ID!): ActInspector
    unloadingActInspectors(date: String, inspector: ID, region: ID, point: ID, realizator: ID, dateType: String): String
`;

const mutation = `
    addActInspector(type: String!, region: ID!, realizator: ID!, organizator: ID!, point: ID!): String
    setActInspector(_id: ID!, checkMainInspector: Boolean, checkAdmin: Boolean): String
    deleteActInspector(_id: ID!): String
`;

const resolvers = {
    actInspector: async(parent, {_id}, {user}) => {
        if(['admin', 'главинспектор', 'инспектор'].includes(user.role)) {
            return await ActInspector.findOne({
                ...user.role==='инспектор'?{inspector: user.inspector}:{},
                _id
            })
                .populate({
                    path: 'organizator',
                    select: '_id name'
                })
                .populate({
                    path: 'region',
                    select: '_id name'
                })
                .populate({
                    path: 'realizator',
                    select: '_id name'
                })
                .populate({
                    path: 'point',
                    select: '_id name'
                })
                .populate({
                    path: 'inspector',
                    select: '_id name'
                })
                .lean()
        }
    },
    actInspectors: async(parent, {date, region, skip, point, inspector, limit, dateType, realizator, organizator}, {user}) => {
        if(['admin', 'главинспектор', 'инспектор'].includes(user.role)) {
            let dateStart, dateEnd
            if (date&&date.length) {
                dateStart = checkDate(date)
                dateStart.setHours(0, 0, 0, 0)
                dateEnd = new Date(dateStart)
                if(dateType==='year')
                    dateEnd.setFullYear(dateEnd.getFullYear() + 1)
                else if(dateType==='month')
                    dateEnd.setMonth(dateEnd.getMonth() + 1)
                else if(dateType==='week')
                    dateEnd.setDate(dateEnd.getDate() + 7)
                else
                    dateEnd.setDate(dateEnd.getDate() + 1)
            }
            return await ActInspector.find({
                ...realizator?{realizator}:{},
                ...organizator?{organizator}:{},
                ...region?{region}:{},
                ...point?{point}:{},
                ...user.role==='инспектор'?{inspector: user.inspector}:inspector?{inspector}:{},
                ...dateStart?{$and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}}]}:{},
            })
                .skip(skip != undefined ? skip : 0)
                .limit(limit? limit : skip != undefined ? 50 : 10000000000)
                .sort('-createdAt')
                .select('_id createdAt type realizator inspector')
                .populate({
                    path: 'realizator',
                    select: '_id name'
                })
                .populate({
                    path: 'inspector',
                    select: '_id name'
                })
                .lean()
        }
    },
    actInspectorsCount: async(parent, {date, region, point, inspector, dateType, realizator, organizator}, {user}) => {
        if(['admin', 'главинспектор', 'инспектор'].includes(user.role)) {
            let dateStart, dateEnd
            if (date&&date.length) {
                dateStart = checkDate(date)
                dateStart.setHours(0, 0, 0, 0)
                dateEnd = new Date(dateStart)
                if(dateType==='year')
                    dateEnd.setFullYear(dateEnd.getFullYear() + 1)
                else if(dateType==='month')
                    dateEnd.setMonth(dateEnd.getMonth() + 1)
                else if(dateType==='week')
                    dateEnd.setDate(dateEnd.getDate() + 7)
                else
                    dateEnd.setDate(dateEnd.getDate() + 1)
            }
            return await ActInspector.count({
                ...realizator?{realizator}:{},
                ...organizator?{organizator}:{},
                ...region?{region}:{},
                ...point?{point}:{},
                ...user.role==='инспектор'?{inspector: user.inspector}:inspector?{inspector}:{},
                ...dateStart?{$and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}}]}:{},
            })
                .lean()
        }
    },
    unloadingActInspectors: async(parent, { date, region, point, inspector, realizator, dateType }, {user}) => {
        if(['admin', 'главинспектор'].includes(user.role)) {
            let workbook = new ExcelJS.Workbook();
            let dateStart, dateEnd
            if (date&&date.length) {
                dateStart = checkDate(date)
                dateStart.setHours(0, 0, 0, 0)
                dateEnd = new Date(dateStart)
                if(dateType==='year')
                    dateEnd.setFullYear(dateEnd.getFullYear() + 1)
                else if(dateType==='month')
                    dateEnd.setMonth(dateEnd.getMonth() + 1)
                else if(dateType==='week')
                    dateEnd.setDate(dateEnd.getDate() + 7)
                else
                    dateEnd.setDate(dateEnd.getDate() + 1)
            }
            let data = await ActInspector.find({
                ...region?{region}:{},
                ...point?{point}:{},
                ...realizator?{realizator}:{},
                ...user.role==='инспектор'?{inspector: user.inspector}:inspector?{inspector}:{},
                ...dateStart?{$and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}}]}:{},
            })
                .sort('-createdAt')
                .select('_id createdAt type realizator inspector region point')
                .populate({
                    path: 'realizator',
                    select: '_id name'
                })
                .populate({
                    path: 'inspector',
                    select: '_id name'
                })
                .populate({
                    path: 'region',
                    select: '_id name'
                })
                .populate({
                    path: 'point',
                    select: '_id name'
                })
                .lean();
            let worksheet, row;
            worksheet = await workbook.addWorksheet('Лист загрузки');
            worksheet.getColumn(1).width = 25;
            worksheet.getColumn(2).width = 25;
            worksheet.getColumn(3).width = 25;
            worksheet.getColumn(4).width = 25;
            worksheet.getColumn(5).width = 15;
            for (let i = 0; i < data.length; i++) {
                row = i+1
                worksheet.getCell(`A${row}`).value = data[i].type;
                worksheet.getCell(`B${row}`).value = data[i].realizator.name;
                worksheet.getCell(`C${row}`).value = `${data[i].region.name}|${data[i].point.name}`;
                worksheet.getCell(`D${row}`).value = data[i].inspector.name;
                worksheet.getCell(`E${row}`).value = pdDDMMYYYY(data[i].createdAt);
                worksheet.getCell(`F${row}`).value = `${process.env.URL.trim()}/actinspector/${data[i]._id}`;
            }

            let xlsxname = `${randomstring.generate(20)}.xlsx`;
            let xlsxdir = path.join(app.dirname, 'public', 'xlsx');
            if (!await fs.existsSync(xlsxdir)){
                await fs.mkdirSync(xlsxdir);
            }
            let xlsxpath = path.join(app.dirname, 'public', 'xlsx', xlsxname);
            await workbook.xlsx.writeFile(xlsxpath);
            return urlMain + '/xlsx/' + xlsxname
        }
    },
};

const resolversMutation = {
    addActInspector: async(parent, {type, region, realizator, organizator, point}, {user}) => {
        if('инспектор'===user.role) {
            let object = new ActInspector({
                type,
                inspector: user.inspector,
                realizator,
                point,
                organizator,
                region
            });
            await ActInspector.create(object)
            return 'OK'
        }
    },
    setActInspector: async(parent, {_id, checkMainInspector, checkAdmin}, {user}) => {
        if(['admin', 'главинспектор'].includes(user.role)) {
            let object = await ActInspector.findOne({_id})

            if (checkAdmin != undefined && 'admin' === user.role)
                object.checkAdmin = checkAdmin
            if (checkMainInspector != undefined && 'главинспектор' === user.role && !object.checkAdmin)
                object.checkMainInspector = checkMainInspector
            await object.save()
            return 'OK'
        }
    },
    deleteActInspector: async(parent, { _id }, {user}) => {
        if(['admin', 'главинспектор', 'инспектор'].includes(user.role)) {
            await ActInspector.deleteOne({
                ...user.role==='инспектор'?{inspector: user.inspector}:{},
                checkAdmin: {$ne: true},
                checkMainInspector: {$ne: true},
                _id
            })
            return 'OK'
        }
    }
};

module.exports.resolversMutation = resolversMutation;
module.exports.mutation = mutation;
module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;