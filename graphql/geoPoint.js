const GeoPoint = require('../models/geoPoint');

const type = `
  type GeoPoint {
    _id: ID
    createdAt: Date
    point: Point
    region: Region
    geo: [Float]
  }
`;

const query = `
    geoPoints(point: ID, region: ID): [GeoPoint]
    geoPointsCount(point: ID, region: ID): Int
`;

const mutation = `
    saveGeoPoint(point: ID!, region: ID!, geo: [Float]!): GeoPoint
`;

const resolvers = {
    geoPoints: async(parent, {point, region}, {user}) => {
        if(['admin', 'реализатор', 'организатор'].includes(user.role)) {
            return await GeoPoint.find({
                ...user.point?{point: user.point}:point?{point}:{},
                ...user.region?{region: user.region}:region?{region}:{},
            })
                .populate({
                    path: 'point',
                    select: '_id name'
                })
                .populate({
                    path: 'region',
                    select: '_id name'
                })
                .lean()
        }
    },
    geoPointsCount: async(parent, {point, region}, {user}) => {
        if(['admin', 'реализатор', 'организатор'].includes(user.role)) {
            return await GeoPoint.count({
                ...user.point?{point: user.point}:point?{point}:{},
                ...user.region?{region: user.region}:region?{region}:{},
            })
                .lean()
        }
    },
};

const resolversMutation = {
    saveGeoPoint: async(parent, {point, region, geo}, {user}) => {
        if(['admin', 'реализатор', 'организатор'].includes(user.role)) {
            let object = await GeoPoint.findOne({
                ...user.point?{point: user.point}:{point},
                ...user.region?{region: user.region}:{region},
            });
            if(!object) {
                object = new GeoPoint({
                    ...user.point ? {point: user.point} : {point},
                    ...user.region ? {region: user.region} : {region},
                    geo
                });
                object = await GeoPoint.create(object)
            }
            else {
                object.geo = geo
                await object.save()
            }
            return object
        }
    }
};

module.exports.resolversMutation = resolversMutation;
module.exports.mutation = mutation;
module.exports.type = type;
module.exports.query = query;
module.exports.resolvers = resolvers;