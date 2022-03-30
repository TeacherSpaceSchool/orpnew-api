const mongoose = require('mongoose');

const NakladnayaNaPustuyTaruSchema = mongoose.Schema({
    dataTable: String,
    guidOrganizator: String,
    guidRegion: String,
    organizator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrganizatorShoro'
    },
    region: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RegionShoro'
    },
    checkAdmin: Boolean
}, {
    timestamps: true
});

NakladnayaNaPustuyTaruSchema.index({disabled: 1})
NakladnayaNaPustuyTaruSchema.index({region: 1})
NakladnayaNaPustuyTaruSchema.index({date: 1})

const NakladnayaNaPustuyTaru = mongoose.model('PustayaTaraShoro', NakladnayaNaPustuyTaruSchema);

module.exports = NakladnayaNaPustuyTaru;