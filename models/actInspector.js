const mongoose = require('mongoose');

const ActInspectorSchema = mongoose.Schema({
    type: String,
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

ActInspectorSchema.index({createdAt: 1})
ActInspectorSchema.index({inspector: 1})

const ActInspector = mongoose.model('ActInspectorShoro', ActInspectorSchema);

module.exports = ActInspector;