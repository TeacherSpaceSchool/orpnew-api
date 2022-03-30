const mongoose = require('mongoose');

const ErrorSchema = mongoose.Schema({
    err: String,
    path: String,
}, {
    timestamps: true
});

ErrorSchema.index({createdAt: 1})

const Error = mongoose.model('ErrorShoro', ErrorSchema);

module.exports = Error;