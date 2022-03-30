const mongoose = require('mongoose');

const GeoPointSchema = mongoose.Schema({
    point: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PointShoro1'
    },
    geo: [Number],
    region: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RegionShoro'
    },
}, {
    timestamps: true
});

GeoPointSchema.index({point: 1})
GeoPointSchema.index({region: 1})

const GeoPoint = mongoose.model('GeoPointShoro', GeoPointSchema);

module.exports = GeoPoint;