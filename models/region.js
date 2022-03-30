const mongoose = require('mongoose');

const RegionSchema = mongoose.Schema({
    renew: Boolean,
    name: String,
    del: Boolean,
    guid: String,
}, {
    timestamps: true
});

RegionSchema.index({guid: 1})
RegionSchema.index({name: 1})
RegionSchema.index({del: 1})

const Region = mongoose.model('RegionShoro', RegionSchema);

module.exports = Region;