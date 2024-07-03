const express = require('express')
const blogController = require("../controllers/blog.js");
const auth = require("../auth.js");

const {verify, verifyAdmin} = auth;
const router = express.Router();

router.post("/addBlog", verify, blogController.createBlog);
router.get("/getBlogAll", blogController.getBlogAll);
router.get("/getBlog/:id", blogController.getBlog);
router.get("/getMyBlog", verify, blogController.getMyBlog);
router.post("/addComment/:id", verify, blogController.addBlogComment);
router.get("/getComment/:id", verify, blogController.getBlogComment);
router.patch("/deleteOwnComment/:blogid/:commentid", verify, blogController.deleteBlogComment);
router.delete("/deleteOwnBlog/:blogId", verify,blogController.deleteBlog );
router.patch("/updateBlog/:id", verify, blogController.updateBlog)
router.patch("/updateComment/:id/:commentId", verify , blogController.updateComment);







// Admin
router.patch("/deleteCommentAdmin/:id/:commentId", verify, verifyAdmin, blogController.deleteBlogCommentAdmin)
router.delete("/deleteBlog/:blogId", verify, verifyAdmin, blogController.deleteBlogAdmin)


module.exports = router;