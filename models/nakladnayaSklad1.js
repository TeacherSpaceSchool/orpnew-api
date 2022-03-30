const mongoose = require('mongoose');

const NakladnayaSklad1Schema = mongoose.Schema({
    dataTable: String,
    date: Date,
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

NakladnayaSklad1Schema.index({disabled: 1})
NakladnayaSklad1Schema.index({region: 1})
NakladnayaSklad1Schema.index({date: 1})

const NakladnayaSklad1 = mongoose.model('NakladnayaSklad1Shoro', NakladnayaSklad1Schema);

module.exports = NakladnayaSklad1;