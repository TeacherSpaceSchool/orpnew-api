const mongoose = require('mongoose');

const SubscriberSchema = mongoose.Schema({
    endpoint: String,
    keys: mongoose.Schema.Types.Mixed,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserShoro1'
    },
    number: String,
    status: String,
}, {
    timestamps: true
});

SubscriberSchema.index({user: 1})
SubscriberSchema.index({number: 1})

const Subscriber = mongoose.model('SubscriberShoro', SubscriberSchema);

module.exports = Subscriber;