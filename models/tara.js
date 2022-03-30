const mongoose = require('mongoose');

const TaraSchema = mongoose.Schema({
    name: String,
    size: String,
    date: Date,
    guid: String
}, {
    timestamps: true
});

TaraSchema.index({name: 1})
TaraSchema.index({del: 1})
TaraSchema.index({date: 1})
TaraSchema.index({guid: 1})

const Tara = mongoose.model('TaraShoro', TaraSchema);

module.exports = Tara;