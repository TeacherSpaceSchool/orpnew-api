const mongoose = require('mongoose');

const ChecklistInspectorSchema = mongoose.Schema({
    score: Number,
    questions: String,
    inspector: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'InspectorShoro'
    },
    realizator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RealizatorShoro'
    },
    point: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PointShoro1'
    },
    organizator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrganizatorShoro'
    },
    region: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RegionShoro'
    },
    checkMainInspector: Boolean,
    checkAdmin: Boolean
}, {
    timestamps: true
});

ChecklistInspectorSchema.index({createdAt: 1})
ChecklistInspectorSchema.index({inspector: 1})

const ChecklistInspector = mongoose.model('ChecklistInspectorShoro', ChecklistInspectorSchema);

module.exports = ChecklistInspector;