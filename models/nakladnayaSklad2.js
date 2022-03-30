const mongoose = require('mongoose');

const NakladnayaSklad2Schema = mongoose.Schema({
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

NakladnayaSklad2Schema.index({region: 1})

const NakladnayaSklad2 = mongoose.model('NakladnayaSklad2Shoro', NakladnayaSklad2Schema);

module.exports = NakladnayaSklad2;