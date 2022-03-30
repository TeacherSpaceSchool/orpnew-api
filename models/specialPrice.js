const mongoose = require('mongoose');

const CoefficientPriceSchema = mongoose.Schema({
    point: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PointShoro1'
    },
    prices: String
}, {
    timestamps: true
});

CoefficientPriceSchema.index({points: 1})

const CoefficientPrice = mongoose.model('CoefficientPriceShoro', CoefficientPriceSchema);

module.exports = CoefficientPrice;