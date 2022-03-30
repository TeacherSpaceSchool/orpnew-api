const OtchetRealizatora = require('../models/otchetRealizatora');
const Organizator = require('../models/organizator');
const {checkDate} = require('../module/const');
const {prepareXML} = require('../module/outXML');
const {calculateOtchetOrganizatora} = require('../module/otchetOrganizatora');
const ModelsError = require('../models/error');

const type = `
  type OtchetRealizatora {
    _id: ID
    createdAt: Date
    dataTable: String
    organizator: Organizator
    region: Region
    realizator: Realizator
    point: Point
    guidRealizator: String
    guidPoint: String
    guidOrganizator: String
    guidRegion: String
    checkOrganizator: Boolean
    checkAdmin: Boolean
}
`;

const query = `
    otchetRealizatoras(date: String, region: ID, point: ID, skip: Int, limit: Int): [OtchetRealizatora]
    otchetRealizatorasCount(date: String, region: ID, point: ID): Int
    otchetRealizatora(_id: ID, point: ID): OtchetRealizatora
`;

const mutation = `
    addOtchetRealizatora(dataTable: String!, organizator: ID!, region: ID!, realizator: ID!, point: ID!, guidRealizator: String!, guidPoint: String!, guidOrganizator: String!, guidRegion: String!): String
    setOtchetRealizatora(_id: ID!, dataTable: String!, checkOrganizator: Boolean, checkAdmin: Boolean): String
    deleteOtchetRealizatora(_id: ID!): String
`;

const resolvers = {
    otchetRealizatora: async(parent, {_id, point}, {user}) => {
        if(['admin', 'организатор', 'реализатор'].includes(user.role)) {
            let dateStart, dateEnd
            if(point) {
                dateStart = new Date()
                dateStart.setHours(0, 0, 0, 0)
                dateEnd = new Date(dateStart)
                dateEnd.setDate(dateEnd.getDate() + 1)
            }
            return await OtchetRealizatora.findOne({
                ...user.region?{region: user.region}:{},
                ...user.point?{point: user.point}:point?{point}:{},
                ..._id?{_id}:{$and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}}]}
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
                .lean()
        }
    },
    otchetRealizatoras: async(parent, {date, region, skip, point, limit}, {user}) => {
        if(['admin', 'организатор', 'реализатор'].includes(user.role)) {
            let dateStart, dateEnd
            if (date&&date.length) {
                dateStart = checkDate(date)
                dateStart.setHours(0, 0, 0, 0)
                dateEnd = new Date(dateStart)
                dateEnd.setDate(dateEnd.getDate() + 1)
            }
            return await OtchetRealizatora.find({
                ...user.region?{region: user.region}:region?{region}:{},
                ...user.point?{point: user.point}:point?{point}:{},
                ...dateStart?{$and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}}]}:{},
            })
                .skip(skip != undefined ? skip : 0)
                .limit(limit? limit : skip != undefined ? 50 : 10000000000)
                .sort('-createdAt')
                .select('_id createdAt point region')
                .populate({
                    path: 'region',
                    select: '_id name'
                })
                .populate({
                    path: 'point',
                    select: '_id name'
                })
                .lean()
        }
    },
    otchetRealizatorasCount: async(parent, {date, region, point}, {user}) => {
        if(['admin', 'организатор'].includes(user.role)) {
            let dateStart, dateEnd
            if (date&&date.length) {
                dateStart = checkDate(date)
                dateStart.setHours(0, 0, 0, 0)
                dateEnd = new Date(dateStart)
                dateEnd.setDate(dateEnd.getDate() + 1)
            }
            return await OtchetRealizatora.count({
                ...user.region?{region: user.region}:region?{region}:{},
                ...user.point?{point: user.point}:point?{point}:{},
                ...dateStart?{$and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}}]}:{},
            })
                .lean()
        }
    },
};

const resolversMutation = {
    addOtchetRealizatora: async(parent, {dataTable, organizator, region, realizator, point, guidRealizator, guidPoint, guidOrganizator, guidRegion}, {user}) => {
        if(['организатор', 'реализатор'].includes(user.role)&&guidPoint!=='lol') {
            let dateStart = new Date()
            dateStart.setHours(0, 0, 0, 0)
            let dateEnd = new Date(dateStart)
            dateEnd.setDate(dateEnd.getDate() + 1)
            if(!(await OtchetRealizatora.findOne({...user.region?{region: user.region}:{region}, ...user.point?{point: user.point}:{point}, $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}}]}).select('_id').lean())) {
                let object = new OtchetRealizatora({
                    dataTable,
                    ...user.organizator ? {organizator: user.organizator} : {organizator},
                    ...user.region ? {region: user.region} : {region},
                    ...user.realizator ? {realizator: user.realizator} : {realizator},
                    ...user.point ? {point: user.point} : {point},
                    ...'организатор'===user.role ? {guidOrganizator: user.guid} : {guidOrganizator},
                    ...user.guidRegion ? {guidRegion: user.guidRegion} : {guidRegion},
                    ...'реализатор'===user.role ? {guidRealizator: user.guid} : {guidRealizator},
                    ...user.guidPoint ? {guidPoint: user.guidPoint} : {guidPoint}
                });
                await OtchetRealizatora.create(object)
                await calculateOtchetOrganizatora({region, guidRegion, organizator, guidOrganizator})
                await prepareXML({guidRegion, guidOrganizator})
                return 'OK'
            }
        }
    },
    setOtchetRealizatora: async(parent, {_id, dataTable, checkOrganizator, checkAdmin}, {user}) => {
        if(['admin', 'организатор', 'реализатор'].includes(user.role)) {
            let dateStart, dateEnd
            dateStart = new Date()
            dateStart.setHours(0, 0, 0, 0)
            dateEnd = new Date(dateStart)
            dateEnd.setDate(dateEnd.getDate() + 2)
            dateEnd.setHours(dateEnd.getHours() - 12)
            let object = await OtchetRealizatora.findOne({
                ...user.region?{region: user.region}:{},
                ...user.point?{point: user.point}:{},
                ...'организатор'===user.role?{checkAdmin: {$ne: true}}:{},
                ...'реализатор'===user.role?{
                    $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}}],
                    checkOrganizator: {$ne: true},
                    checkAdmin: {$ne: true}
                }:{},
                _id
            })

            if(!object&&'реализатор'===user.role) {
                if(!(await OtchetRealizatora.findOne({
                        $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}}],
                        region: user.region,
                        point: user.point
                    }).select('_id').lean())) {
                    let organizator = await Organizator.findOne({region: user.region}).select('_id guid').lean()
                    object = new OtchetRealizatora({
                        dataTable,
                        organizator: organizator._id,
                        guidOrganizator: organizator.guid,
                        region: user.region,
                        realizator: user.realizator,
                        point: user.point,
                        guidRegion: user.guidRegion,
                        guidRealizator: user.guid,
                        guidPoint: user.guidPoint
                    });
                    object = await OtchetRealizatora.create(object)
                }
            }

            if(!object) {
                //Запись хака
                let modelsError = new ModelsError({
                    err: `${user.role}-${user.nameRegion}-${user.namePoint} _id: ${_id}`,
                    path: 'setRealizator'
                });
                if(await OtchetRealizatora.findOne({
                        $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}}],
                        region: user.region,
                        point: user.point
                    }).select('_id').lean()) {
                    modelsError.err += ' хакает'
                }
                await ModelsError.create(modelsError)
                return 'OK'
            }

            object.dataTable = dataTable
            if (checkAdmin != undefined && 'admin' === user.role)
                object.checkAdmin = checkAdmin
            if (checkOrganizator != undefined && 'организатор' === user.role && !object.checkAdmin)
                object.checkOrganizator = checkOrganizator
            await object.save()
            await calculateOtchetOrganizatora({date: object.createdAt, region: object.region, guidRegion: object.guidRegion, organizator: object.organizator, guidOrganizator: object.guidOrganizator})
            await prepareXML({date: object.createdAt, guidRegion: object.guidRegion, guidOrganizator: object.guidOrganizator})
            return 'OK'
        }
    },
    deleteOtchetRealizatora: async(parent, { _id }, {user}) => {
        if(['admin', 'организатор', 'реализатор'].includes(user.role)) {
            let dateStart, dateEnd
            dateStart = new Date()
            dateStart.setHours(0, 0, 0, 0)
            dateEnd = new Date(dateStart)
            dateEnd.setDate(dateEnd.getDate() + 1)
            let object = await OtchetRealizatora.findOne({
                $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}}],
                ...user.region?{region: user.region}:{},
                ...user.point?{point: user.point}:{},
                _id
            }).select('region guidRegion organizator guidOrganizator point guidPoint').lean()
            if(object) {
                await OtchetRealizatora.deleteOne({
                    $and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}}],
                    ...user.region ? {region: user.region} : {},
                    ...user.point ? {point: user.point} : {},
                    _id
                })
                await calculateOtchetOrganizatora({
                    date: object.createdAt,
                    region: object.region,
                    guidRegion: object.guidRegion,
                    organizator: object.organizator,
                    guidOrganizator: object.guidOrganizator
                })
                await prepareXML({date: object.createdAt, guidRegion: object.guidRegion, guidOrganizator: object.guidOrganizator})
                return 'OK'
            }
        }
    }
};

module.exports.resolversMutation = resolversMutation;
module.exports.mutation = mutation;
module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;