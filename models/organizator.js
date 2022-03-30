const mongoose = require('mongoose');

const OrganizatorSchema = mongoose.Schema({
    renew: Boolean,
    name: String,
    phone: String,
    del: Boolean,
    region: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RegionShoro'
    },
    guidRegion: String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserShoro1'
    },
    guid: String
}, {
    timestamps: true
});

OrganizatorSchema.index({user: 1})
OrganizatorSchema.index({guid: 1})
OrganizatorSchema.index({name: 1})
OrganizatorSchema.index({del: 1})
OrganizatorSchema.index({guidRegion: 1})
OrganizatorSchema.index({region: 1})

const Organizator = mongoose.model('OrganizatorShoro', OrganizatorSchema);

module.exports = Organizator;