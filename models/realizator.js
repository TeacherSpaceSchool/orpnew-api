const mongoose = require('mongoose');

const RealizatorSchema = mongoose.Schema({
    renew: Boolean,
    name: String,
    phone: String,
    del: Boolean,
    point: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PointShoro1'
    },
    region: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RegionShoro'
    },
    guidPoint: String,
    guidRegion: String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserShoro1'
    },
    guid: String,
}, {
    timestamps: true
});

RealizatorSchema.index({guid: 1})
RealizatorSchema.index({user: 1})
RealizatorSchema.index({name: 1})
RealizatorSchema.index({del: 1})
RealizatorSchema.index({guidRegion: 1})
RealizatorSchema.index({region: 1})
RealizatorSchema.index({guidPoint: 1})
RealizatorSchema.index({point: 1})

const Realizator = mongoose.model('RealizatorShoro', RealizatorSchema);

module.exports = Realizator;