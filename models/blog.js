const mongoose = require('mongoose');

const BlogSchema = mongoose.Schema({
    image: String,
    title: String,
    text: String,
    url: String
}, {
    timestamps: true
});

BlogSchema.index({createdAt: 1})
BlogSchema.index({title: 1})

const Blog = mongoose.model('BlogShoro', BlogSchema);

module.exports = Blog;