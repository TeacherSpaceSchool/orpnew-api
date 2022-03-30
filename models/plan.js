const mongoose = require('mongoose');

const PlanSchema = mongoose.Schema({
    date: Date,
    normaRegions: String,
    norma: Number
}, {
    timestamps: true
});

PlanSchema.index({date: 1})

const Plan = mongoose.model('PlanShoro', PlanSchema);

module.exports = Plan;