require('dotenv').config();
const express=require("express");
const bodyParser=require("body-parser");
const app=express();
const ejs=require("ejs");
const mongoose=require("mongoose");
const session=require("express-session");
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");

app.set('view engine','ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:true}));

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
  }));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/authDB",{useNewUrlParser:true});

const userSchema=new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);

const User= new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/",(req,res)=>{
    res.render('home');
});

app.get("/secrets", function(req,res){
    if(req.isAuthenticated()){
        res.render("secrets");
    }else{
        res.redirect("/login");
    }
})

app.get("/register",(req,res)=>{
    res.render("register");
});

app.get("/login",(req,res)=>{
    res.render("login");
});

app.post("/register",function(req,res){
    User.register({username:req.body.username}, 
        req.body.password,function(err,user){
            if(err){
                console.log(err);
                res.redirect("/register");
            }else{
                passport.authenticate("local")(req,res,function(){
                    res.redirect("/secrets");
                })
                
            }
        });
})

// app.post("/register",(req,res)=>{
    
//     bcrypt.hash(req.body.password,saltRounds,function(err,hash){
//         const newUser=new User({
//             email: req.body.username,
//             password: hash
//         });
//         newUser.save().then(()=>{
//             res.render("secrets");
//         }).catch((err)=>{
//             console.log(err);
//         });
//     });
// });


// app.post("/login",(req,res)=>{
//     const username=req.body.username;
//     const password=req.body.password; 

//     User.findOne({email:username}).then((foundUser)=>{
//         if(foundUser){
//             bcrypt.compare(password,foundUser.password,function(err,result){
//                 if(result===true){
//                          res.render("secrets");
//                 }
//             })
//         }
//     }).catch((err)=>{
//         res.send("Bad Request");
//     });
// });

app.listen(3000,()=>{
    console.log("The server is running on port 3000");
});
