const mongoose = require('mongoose');

const FaqSchema = mongoose.Schema({
    url: String,
    title: String,
    typex:  [String],
    video: String
}, {
    timestamps: true
});

FaqSchema.index({title: 1})
FaqSchema.index({typex: 1})

const Faq = mongoose.model('FaqShoro', FaqSchema);

Faq.collection.dropIndex('name_1', function(err) {
    if (err) {
        console.log('Error in dropping index!');
    }
});

module.exports = Faq;