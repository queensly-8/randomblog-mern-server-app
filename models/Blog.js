const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required']
    },
    title:{
        type:String,
        required: [true, 'Title is required']
    },
    content:{
        type:String,
        required:[true, 'Blog content is required']
    },
    author:[{
        name:{
            type: String,
            required:[true, 'Author name is required']
        },
        details:{
            type:String,
            required:[true, 'Other details is required']
        }
    }],
    comments:[{
        comment:{
            type:String,
            required: [true, 'Comment text is required']
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User is required']
        },
    }]
},{ timestamps: true });

module.exports = mongoose.model('Blog', blogSchema)