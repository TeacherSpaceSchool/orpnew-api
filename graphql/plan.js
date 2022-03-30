const Plan = require('../models/plan');
const OtchetRealizatora = require('../models/otchetRealizatora');
const {checkDate, checkInt} = require('../module/const');

const type = `
  type Plan {
    _id: ID
    createdAt: Date
    date: Date
    norma: Int
    normaRegions: String
    current: Int
    currentRegions: String
  }
`;

const query = `
    plans(skip: Int, limit: Int): [Plan]
    plansCount: Int
    plan(_id: ID, date: String): Plan
`;

const mutation = `
    addPlan(normaRegions: String!, norma: Int!, date: String!): String
    setPlan(_id: ID!, norma: Int, normaRegions: String): String
    deletePlan(_id: ID!): String
`;

const resolvers = {
    plan: async(parent, {_id, date}, {user}) => {
        if(['admin', 'организатор', 'реализатор'].includes(user.role)) {
            let dateStart = checkDate(date)
            dateStart.setHours(0, 0, 0, 0)
            dateStart.setDate(1)
            let dateEnd = new Date(dateStart)
            dateEnd.setMonth(dateEnd.getMonth()+1)
            let object = await Plan.findOne(
                date?{$and: [{date: {$gte: dateStart}}, {date: {$lt: dateEnd}}]}:{_id}
            ).lean()
            dateStart = new Date(object.date)
            dateStart.setHours(0, 0, 0, 0)
            dateStart.setDate(1)
            dateEnd = new Date(dateStart)
            dateEnd.setMonth(dateEnd.getMonth()+1)
            let _findOtchetRealizatora = await OtchetRealizatora.find({$and: [{createdAt: {$gte: dateStart}}, {createdAt: {$lt: dateEnd}}]})
                .populate({
                    path: 'point',
                    select: 'name _id'
                })
                .populate({
                    path: 'region',
                    select: 'name _id'
                })
                .lean()
            let findOtchetRealizatora = {}
            object.current = 0
            for (let i = 0; i < _findOtchetRealizatora.length; i++) {
                if(!findOtchetRealizatora[_findOtchetRealizatora[i].region._id])
                    findOtchetRealizatora[_findOtchetRealizatora[i].region._id] = {
                        _id: _findOtchetRealizatora[i].region._id,
                        name: _findOtchetRealizatora[i].region.name,
                        points: {},
                        current: 0
                    }
                if(!findOtchetRealizatora[_findOtchetRealizatora[i].region._id].points[_findOtchetRealizatora[i].point._id])
                    findOtchetRealizatora[_findOtchetRealizatora[i].region._id].points[_findOtchetRealizatora[i].point._id] = {
                        _id: _findOtchetRealizatora[i].point._id,
                        name: _findOtchetRealizatora[i].point.name,
                        current: 0
                    }
                findOtchetRealizatora[_findOtchetRealizatora[i].region._id].points[_findOtchetRealizatora[i].point._id].current += checkInt(JSON.parse(_findOtchetRealizatora[i].dataTable)['i']['iv'])
                findOtchetRealizatora[_findOtchetRealizatora[i].region._id].current += checkInt(JSON.parse(_findOtchetRealizatora[i].dataTable)['i']['iv'])
                object.current += checkInt(JSON.parse(_findOtchetRealizatora[i].dataTable)['i']['iv'])
            }
            object.currentRegions = JSON.stringify(findOtchetRealizatora)
            return object
        }
    },
    plans: async(parent, {skip, region, limit}, {user}) => {
        if(['admin', 'организатор', 'реализатор'].includes(user.role)) {
            return await Plan.find({
                del: {$ne: true},
                ...user.role==='организатор'?{region: user.region}:region?{region}:{},
                ...user.role==='реализатор'?{user: user._id}:{}
            })
                .skip(skip != undefined ? skip : 0)
                .limit(limit? limit : skip != undefined ? 50 : 10000000000)
                .sort('-date')
                .select('_id date')
                .lean()
        }
    },
    plansCount: async(parent, {region}, {user}) => {
        if(['admin', 'организатор', 'реализатор'].includes(user.role)) {
            return await Plan.count({
                del: {$ne: true},
                ...user.role==='организатор'?{region: user.region}:region?{region}:{},
                ...user.role==='реализатор'?{user: user._id}:{}
            })
                .lean()
        }
    },
};

const resolversMutation = {
    addPlan: async(parent, {normaRegions, date, norma}, {user}) => {
        if('admin'===user.role) {
            date = checkDate(date)
            let dateStart = new Date(date)
            dateStart.setHours(0, 0, 0, 0)
            dateStart.setDate(1)
            let dateEnd = new Date(dateStart)
            dateEnd.setMonth(dateEnd.getMonth() + 1)
            if(!(await Plan.findOne({$and: [{date: {$gte: dateStart}}, {date: {$lt: dateEnd}}]}).select('_id').lean())) {
                let object = new Plan({
                    norma,
                    normaRegions,
                    date
                });
                await Plan.create(object)
                return 'OK'
            }
        }
    },
    setPlan: async(parent, {_id, normaRegions, norma}, {user}) => {
        if('admin'===user.role) {
            let object = await Plan.findOne({_id})
            if(normaRegions)
                object.normaRegions = normaRegions
            if(norma)
                object.norma = norma
            await object.save()
            return 'OK'
        }
    },
    deletePlan: async(parent, { _id }, {user}) => {
        if('admin'===user.role) {
            await Plan.findByIdAndDelete(_id)
        }
        return 'OK'
    }
};

module.exports.resolversMutation = resolversMutation;
module.exports.mutation = mutation;
module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;