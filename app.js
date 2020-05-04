var express 				= require("express");
var mongoose 				= require("mongoose");
var bodyParser  			= require("body-parser");
var flash       			= require("connect-flash");
var passport    			= require("passport");
var methodOverride 			= require("method-override");
var User					= require("./models/user");
var LocalStrategy 			= require("passport-local");
var passportLocalMongoose 	= require("passport-local-mongoose");
var multer       			= require("multer");
var Blog 					= require("./models/blogs");
var indexRoutes 			= require("./routes/index");
var blogRoutes  			= require("./routes/blog");
var comment 				= require("./models/comment");
const path				    = require('path');


mongoose.connect("mongodb://localhost/my_first_blogWebsite",{useNewUrlParser: true, useUnifiedTopology: true});

const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: function(req, file, cb){
    cb(null,file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Init Upload
const upload = multer({
  storage: storage,
  limits:{fileSize: 1000000},
  fileFilter: function(req, file, cb){
    checkFileType(file, cb);
  }
}).single('myImage');

// Check File Type
function checkFileType(file, cb){
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if(mimetype && extname){
    return cb(null,true);
  } else {
    cb('Error: Images Only!');
  }
}


var app = express();
app.set("view engine","ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(flash());
app.use(express.static(__dirname + "/public"));
app.use(require("express-session")({
	secret : "I am anshul",
	resave : false,
	saveUninitialized: false
}));

app.use(function(req,res,next){
res.locals.currentUser = req.user;
res.locals.error = req.flash("error");
res.locals.success = req.flash("success");	 	
	next();
});

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(indexRoutes); 
app.use(blogRoutes);
 
//comment

app.get("/landing",function(req,res){
res.render("landing");
});

app.get("/blogs/:id/comments/comment",isLoggedIn, function(req,res){
	Blog.findById(req.params.id, function(err,blog){
		if (err){
		console.log(err)
		}else{
			res.render("comments/comment", {blog: blog});
		}
	});
});

app.post("/blogs/:id/comments",isLoggedIn, function(req,res){
	Blog.findById(req.params.id, function(err, blog){
		if (err){
			console.log(err);
			res.redirect("/blogs")
		}else{
			console.log(req.body.comments); 
		comment.create(req.body.comment,function(err,comment){
				if (err){
				console.log(err);
				}else{	
					comment.author.id= req.user.id;
					comment.author.username= req.user.username;
					comment.save();
					blog.comments.push(comment);
					blog.save();
					res.redirect('/blogs/' + blog._id);
				}
			});
		}
	});
});

app.get("/blogs/:id/comments/:comment_id/edit",isLoggedIn, function(req,res){
	comment.findById(req.params.comment_id, function(err, foundComment){
		if (err){
	req.redirect("back");
		}else{
			res.render("comments/edit",{blog:req.params.id, comment:foundComment});
		}
	});
});

app.put("/blogs/:id/comments/:comment_id",isLoggedIn, function(req,res){
	comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err,updatedComment){
		if (err){
			res.redirect("back");
		}else{
			res.redirect("/blogs/"+req.params.id);
		}
	});
});

app.delete("/blogs/:id/comments/:comment_id",isLoggedIn, function(req,res){
	comment.findByIdAndRemove(req.params.comment_id,function(err){
		if (err){
			res.redirect("back")
		}else{
		res.redirect("/blogs/"+req.params.id)
		}
	});
});

app.get('/upload', (req, res) => res.render("upload"));

app.post('/upload', (req, res) => {
  upload(req, res, (err) => {
    if(err){
      res.render("new", {
        msg: err
      });
    } else {
      if(req.file == undefined){
        res.render("new", {
          msg: 'Error: No File Selected!'
        });
      } else {
        res.render("blogs", {
          msg: 'File Uploaded!',
          file: `uploads/${req.file.filename}`
        });
      }
    }
  });
});

function isLoggedIn(req, res, next){
	if (req.isAuthenticated()){
		return next();
	}
	res.redirect("/login"); 
}

app.listen(process.env.PORT, process.env.IP, function(){
	console.log("connected");
});
