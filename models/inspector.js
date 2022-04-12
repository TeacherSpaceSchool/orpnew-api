const mongoose = require('mongoose');

const InspectorSchema = mongoose.Schema({
    name: String,
    phone: String,
    del: Boolean,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserShoro1'
    }
}, {
    timestamps: true
});

InspectorSchema.index({user: 1})
InspectorSchema.index({name: 1})
InspectorSchema.index({del: 1})

const Inspector = mongoose.model('InspectorShoro', InspectorSchema);

module.exports = Inspector;