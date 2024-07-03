const Blog = require('../models/Blog');
const auth = require('../auth');

const {errorHandler} = auth;

module.exports.createBlog = (req, res) => {
    const userId = req.user.id;
    const { title, content, author } = req.body;
    
    // Ensure title, content, and at least one author are provided
    if (!title || !content || !author || !author.length) {
        return res.status(400).send({ message: "Title, content, and at least one author are required" });
    }

    // Create new Blog document with empty comments array
    let newBlog = new Blog({
        userId,
        title,
        content,
        author,
        comments: [] // Initialize with an empty array
    });

    // Save new blog
    newBlog.save()
        .then(blog => res.status(201).send({ message: "Blog created successfully", blog }))
        .catch(err => errorHandler(err, req, res));
};



module.exports.getBlogAll=(req, res)=>{
    return Blog.find()
    .then((result)=>{
        return res.status(200).send({Blogs: result})
    })
    .catch(error => errorHandler (error, req, res));
}

module.exports.getBlog=(req,res)=>{
    const blogId = req.params.id;
    return Blog.findById(blogId)
    .then((result)=>{
        if(!result){
            return res.status(404).send("Blog not found")
        }
        res.status(201).send(result)
    })
    .catch(error => errorHandler(error, req, res));
}


module.exports.getMyBlog = (req, res) => {
    if (!req.user || !req.user.id) {
        return res.status(401).send("Unauthorized: User not authenticated");
    }
    const userId = req.user.id;
    console.log(userId);
    
    Blog.find({ userId: userId })
        .then((blogs) => {
            if (!blogs || blogs.length === 0) {
                return res.status(404).send("Blogs not found");
            }
            
            return res.status(200).send(blogs); // Return all blogs belonging to the user
        })
        .catch((error) => errorHandler(error, req, res));
};

module.exports.addBlogComment=(req,res)=>{
    const blogId = req.params.id;
    const userId = req.user.id;
    if(!req.body.comment){
        return res.status(404).send("No Comment, add comment please")
    }

    let newComment = {
        userId,
        comment: req.body.comment
    }

    return Blog.findByIdAndUpdate(blogId, {$push: {comments: newComment}}, {new: true})
    .then((result)=> {
        if(!result){
            return res.status(404).send('Blog not found')
        }
        res.status(201).send({message: "New Comment added",result})
    })
    .catch(error => errorHandler(error, req,res));
}

module.exports.getBlogComment=(req, res)=>{
    const userId = req.user.id;
    const blogId = req.params.id;
    if(!userId){
        return res.status(401).send({message: "Unauthorized"})
    }

    return Blog.findById(blogId)
    .then((result)=>{
        if(!result){
            return res.status(404).send({message: "No Blog found"})
        }
        const userCom = result.comments.filter(comm => comm.userId.toString() === userId)
        res.status(201).send({BlogComments: userCom})
    })
    .catch(error => errorHandler(error, req, res))
}

module.exports.updateBlog=(req, res)=>{
    const userId = req.user.id;
    const blogId = req.params.id;
    const {title, content, author } = req.body;
    if (!title || !content || !author || !author.length) {
        return res.status(400).send({ message: "Title, content, and at least one author are required" });
    }
    return Blog.findById(blogId)
        .then((blog) => {
            if (!blog) {
                return res.status(404).send("Blog not found");
            }

            if (blog.userId.toString() !== userId) {
                return res.status(401).send("Not the blog owner / Unauthorized");
            }

            // Update the blog
            let updateBlog = { title, content, author };
            return Blog.findByIdAndUpdate(blogId, updateBlog, { new: true })
                .then((updatedBlog) => res.status(200).send({ message: "Blog updated", blog: updatedBlog }))
                .catch(error => errorHandler(error, req, res));
        })
        .catch(error => errorHandler(error, req, res));
};

module.exports.updateComment = (req, res) => {
    const blogId = req.params.id;
    const userId = req.user.id;
    const commentId = req.params.commentId;

    let updateCom = {
        comment: req.body.comment // Assuming the updated comment is sent in req.body.comment
    };

    Blog.findById(blogId)
        .then((blog) => {
            if (!blog) {
                return res.status(404).send("Blog not found");
            }

            // Find the index of the comment in the comments array
            const commentIndex = blog.comments.findIndex(comm => comm._id.toString() === commentId);

            if (commentIndex === -1) {
                return res.status(404).send("Comment not found on this blog");
            }

            // Ensure only the comment owner can update the comment
            if (blog.comments[commentIndex].userId.toString() !== userId) {
                return res.status(401).send("Not authorized to update this comment");
            }

            // Update the comment
            blog.comments[commentIndex].comment = updateCom.comment;

            // Save the updated blog document
            return blog.save()
                .then(updatedBlog => {
                    res.status(200).send({ message: "Comment updated successfully", blog: updatedBlog });
                })
                .catch(error => errorHandler(error, req, res));
        })
        .catch(error => errorHandler(error, req, res));
};



module.exports.deleteBlogComment=(req, res)=>{
    const userId = req.user.id;
    const blogId = req.params.blogid;
    const commentId = req.params.commentid;
    return Blog.findById(blogId)
        .then((blog) => {
            if (!blog) {
                return res.status(404).send({ message: "Blog not found" });
            }

            const commentIndex = blog.comments.findIndex(comment => comment._id.toString() === commentId);

            if (commentIndex === -1) {
                return res.status(404).send({ message: "Comment not found" });
            }

            const comment = blog.comments[commentIndex];

            if (comment.userId.toString() !== userId) {
                return res.status(401).send({ message: "Not the comment owner/Unauthorized" });
            }

            blog.comments.splice(commentIndex, 1);

            return blog.save()
                .then(() => res.status(200).send({ message: "Successfully deleted comment" }))
                .catch(error => errorHandler(error, req, res));
        })
        .catch(error => errorHandler(error, req, res));
};

module.exports.deleteBlog = (req, res) => {
    const userId = req.user.id;
    const blogId = req.params.blogId;

    return Blog.findById(blogId)
        .then((result) => {
            if (!result) {
                return res.status(404).send("Blog not found");
            }

            if (result.userId.toString() !== userId) {
                return res.status(401).send("Not the blog owner / Unauthorized");
            } else {
                return Blog.findByIdAndDelete(blogId)
                    .then(() => res.status(200).send({ message: "Your own blog successfully deleted" }))
                    .catch(error => errorHandler(error, req, res));
            }
        })
        .catch(error => errorHandler(error, req, res));
};
    

// ADMIN

module.exports.deleteBlogCommentAdmin=(req, res)=>{
    const blogId = req.params.id;
    const commentId = req.params.commentId;
    return Blog.findById(blogId)
    .then((blog)=>{
        if(!blog){
            res.status(404).send("Blog Not found")
        }

        const commentIndex = blog.comments.findIndex (comm => comm._id.toString() === commentId)

        if(commentIndex === -1){
            return res.status(404).send("No such comment found on this blog");
        }
            blog.comments.splice(commentIndex, 1);

            return blog.save()
                .then(() => res.status(200).send({ message: "Successfully deleted comment" }))
                .catch(error => errorHandler(error, req, res));
        })
        .catch(error => errorHandler(error, req, res));
};

module.exports.deleteBlogAdmin=(req,res)=>{
    const blogId = req.params.blogId;
    return Blog.findByIdAndDelete(blogId)
    .then((blog)=>{
        if(!blog){
            return res.status(404).send("Blog not found")
        }
        return res.status(200).send({message:"blog successfully deleted"})
    })
    .catch(error => errorHandler(error, req, res))
}

