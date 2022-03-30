const mongoose = require('mongoose');

const PointSchema = mongoose.Schema({
    renew: Boolean,
    name: String,
    region: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RegionShoro'
    },
    guidRegion: String,
    del: Boolean,
    guid: String
}, {
    timestamps: true
});

PointSchema.index({guid: 1})
PointSchema.index({name: 1})
PointSchema.index({del: 1})
PointSchema.index({guidRegion: 1})
PointSchema.index({region: 1})

const Point = mongoose.model('PointShoro1', PointSchema);

module.exports = Point;