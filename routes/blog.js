var express = require("express");
var router = express.Router();
var mongoose 	= require("mongoose");
var User = require("../models/user");
var Blog = require("../models/blogs");
var multer       = require("multer");
const upload = multer({dest: '/uploads/'});

router.use(function(req,res,next){
res.locals.currentUser = req.user;
	next();
});


router.get("/blogs", isLoggedIn, function(req,res){
	Blog.find({},function(err,blogs){
		if(err){
			console.log("Error")
		}else{
			res.render("index",{blogs:blogs , currentUser: req.user});
		}
		
	});
});

router.get("/blogs/about", function(req,res){
	res.render("about");
});

router.get("/blogs/patatap", function(req,res){
	res.render("patatap");
});

router.get("/blogs/new", isLoggedIn,upload.single('blogImage'), function(req,res){
	console.log(req.file);
	res.render("new");
});

router.post("/blogs",isLoggedIn, function(req,res){
	var title = req.body.blog.title;
	var image = req.body.blog.image;
	var body = req.body.blog.body;
	var author = {
		id : req.user._id,
		username : req.user.username
	}
	var newBlog={title:title , image: image , body: body , author : author };
	
	Blog.create(newBlog,function(err,newCreatedBlogs){
		if(err){	
			res.render("new");
		}else{
			res.redirect("/blogs");
		}
	});
});

router.get("/blogs/:id", isLoggedIn, function(req,res){
	Blog.findById(req.params.id).populate("comments").exec(function(err,foundBlog){
		if(err){
			res.redirect("/blogs");
		}else{
			res.render("show",{blog: foundBlog});
		}
	});
});

router.get("/blogs/:id/edit",isLoggedIn,upload.single('blogImage'), function(req,res){
	console.log(req.file);
	Blog.findById(req.params.id, function(err,foundBlog){
		if(err){
			res.render("/blogs");
		}else{
			if(foundBlog.author.id.equals(req.user._id)){
			res.render("edit",{blog: foundBlog});	
			}else{
			res.send("You need to be logged in")
			}
		}
	});
	
});

router.put("/blogs/:id",isLoggedIn, function(req,res){
	Blog.findByIdAndUpdate(req.params.id,req.body.blog, function(err,updatedBlog){
		if(err){
			res.redirect("/blogs");
		}else{
			res.redirect("/blogs/"+req.params.id);
		}
	});
});

router.delete("/blogs/:id",isLoggedIn, function(req,res){
	Blog.findByIdAndRemove(req.params.id, function(err){
		if (err){
			res.redirect("/blogs");
		}else{
			res.redirect("/blogs");
		}
	});
});

function isLoggedIn(req, res, next){
	if (req.isAuthenticated()){
		return next();
	}
	res.redirect("/login"); 
}

module.exports = router;