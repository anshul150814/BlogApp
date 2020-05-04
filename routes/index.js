		
var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");

router.use(function(req,res,next){
res.locals.currentUser = req.user;
	next();
});

router.get("/",function(req,res){
    res.redirect("/landing");
});

 
// AUTHENTICATION ROUTES

router.get("/signup",function(req,res){
	res.render("signup");
});

router.post("/signup",function(req,res){
		var newUser = new User({username: req.body.username});
		User.register(newUser, req.body.password, function(err,user){
			if (err){
			req.flash("error","Username already taken! Please try using different username");
			return res.render("signup");
			} 
			passport.authenticate("local")(req, res, function(){
			req.flash("success","Hey! You are signed in");
			res.redirect("/blogs");
			
		});
	});
});

router.get("/login",function(req,res){
	res.render("login");
});

router.post("/login",passport.authenticate("local",{ 
	successRedirect: "/blogs",
	failureRedirect: "/login"
}),function(req,res){

});

router.get("/logout",function(req,res){
	req.logout();
	res.redirect("/");
});

function isLoggedIn(req, res, next){
	if (req.isAuthenticated()){
		return next();
	}
	res.redirect("/login"); 
}
	
module.exports = router;