const mongoose = require('mongoose');

const NakladnayaNaVecherniyVozvratShoroSchema = mongoose.Schema({
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
    guidRegion: String
}, {
    timestamps: true
});

NakladnayaNaVecherniyVozvratShoroSchema.index({region: 1})

const NakladnayaNaVecherniyVozvratShoro = mongoose.model('NakladnayaNaVecherniyVozvratShoro', NakladnayaNaVecherniyVozvratShoroSchema);

module.exports = NakladnayaNaVecherniyVozvratShoro;