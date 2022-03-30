const mongoose = require('mongoose');

const PriceSchema = mongoose.Schema({
    name: String,
    price: Number,
    del: Boolean,
    date: Date,
    guid: String
}, {
    timestamps: true
});

PriceSchema.index({name: 1})
PriceSchema.index({del: 1})
PriceSchema.index({date: 1})
PriceSchema.index({guid: 1})

const Price = mongoose.model('PriceShoro', PriceSchema);

module.exports = Price;