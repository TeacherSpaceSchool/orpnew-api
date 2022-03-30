const mongoose = require('mongoose');

const OtchetOrganizatoraSchema = mongoose.Schema({
    dataTable: String,
    organizator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrganizatorShoro'
    },
    region: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RegionShoro'
    },
    guidOrganizator: String,
    guidRegion: String,
    checkAdmin: Boolean
}, {
    timestamps: true
});

OtchetOrganizatoraSchema.index({disabled: 1})
OtchetOrganizatoraSchema.index({region: 1})

const OtchetOrganizatora = mongoose.model('OtchetOrganizatoraShoro', OtchetOrganizatoraSchema);

module.exports = OtchetOrganizatora;