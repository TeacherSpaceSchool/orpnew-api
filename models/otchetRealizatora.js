const mongoose = require('mongoose');

const OtchetRealizatoraSchema = mongoose.Schema({
    dataTable: String,
    realizator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RealizatorShoro'
    },
    point: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PointShoro1'
    },
    organizator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrganizatorShoro'
    },
    region: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RegionShoro'
    },
    guidRealizator: String,
    guidPoint: String,
    guidOrganizator: String,
    guidRegion: String,
    checkOrganizator: Boolean,
    checkAdmin: Boolean
}, {
    timestamps: true
});

OtchetRealizatoraSchema.index({point: 1})
OtchetRealizatoraSchema.index({region: 1})

const OtchetRealizatora = mongoose.model('OtchetRealizatoraShoro', OtchetRealizatoraSchema);

module.exports = OtchetRealizatora;