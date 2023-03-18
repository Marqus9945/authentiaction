require('dotenv').config();
const express=require("express");
const bodyParser=require("body-parser");
const app=express();
const ejs=require("ejs");
const mongoose=require("mongoose");
const encrypt=require("mongoose-encryption");

app.set('view engine','ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:true}));
console.log(process.env.SECRET);
mongoose.connect("mongodb://localhost:27017/authDB",{useNewUrlParser:true});

const userSchema=new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(encrypt,{secret:process.env.SECRET, encryptedFields:["password"]});

const User= new mongoose.model("User", userSchema);

app.get("/",(req,res)=>{
    res.render('home');
});

app.get("/register",(req,res)=>{
    res.render("register");
});

app.get("/login",(req,res)=>{
    res.render("login");
});

app.post("/register",(req,res)=>{
    const username=req.body.username;
    const password=req.body.password;
    console.log(username,password);
    const newUser=new User({
        email: req.body.username,
        password: req.body.password
    });
    newUser.save().then(()=>{
        res.render("secrets");
    }).catch((err)=>{
        console.log(err);
    });
});

app.post("/login",(req,res)=>{
    const username=req.body.username;
    const password=req.body.password;
    console.log(username,password);

    User.findOne({email:username}).then((foundUser)=>{
        if(foundUser){
            if(foundUser.password===password){
                res.render("secrets");
            }
        }
    }).catch((err)=>{
        res.send("Bad Request");
    });
});

app.listen(3000,()=>{
    console.log("The server is running on port 3000");
});