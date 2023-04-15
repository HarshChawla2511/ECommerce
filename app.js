const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
var isLogin = false;

const app = express();
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("views"));

mongoose.connect("mongodb+srv://ecommerce:e$1234@cluster0.wt6n0rb.mongodb.net/?retryWrites=true&w=majority", {useNewUrlParser: true});

app.get("/", function(req,res){
    res.render("home");
})

app.get("/about", function(req,res){
    res.render("about");
})

app.get("/contact", function(req,res){
    res.render("contact");
})

app.get("/login", function(req,res){
    if(isLogin) res.render("temp", {message: "Already Logged In"});
    else res.render("login");
})

app.get("/signup", function(req,res){
    if(isLogin) res.render("temp", {message: "Already Logged In"});
    else res.render("signup");
})

app.get("/profile",function(req,res){
    if(isLogin) res.render("profile", {loggedUser});
    else res.render("temp", {message : "Login first"});
})

const userSchma = {
    acctype : String,
    name : String,
    email : String, 
    password : String,
};
const Users = mongoose.model("users", userSchma); 

app.post("/signup", function(req,res){
    const hash2 = bcrypt.hashSync(req.body.password, 10);
    console.log(hash2);
    const NewUser = new Users({
        acctype : req.body.acctype,
        name : req.body.name,
        email : req.body.email,
        password : hash2,
    });
    NewUser.save()
        .then(()=> {
            res.render("temp", {message: "Registered Successfully"});
        })
        .catch((err)=>{
            res.render("temp", {message: "ERR Occured"});
        })
})

var loggedUser = {
    acctype : "",
    name : "",
    email : "",
}

app.post("/login", async function(req, res) {
    try {
        const foundUser = await Users.findOne({ email: req.body.email, acctype: req.body.acctype });

        if (!foundUser) {
            res.render("temp", { message: "User not found" });
            return;
        }

        const isMatch = await bcrypt.compare(req.body.password, foundUser.password);

        if (isMatch) {
            isLogin = true;
            loggedUser.acctype = foundUser.acctype;
            loggedUser.name = foundUser.name;
            loggedUser.email = foundUser.email;
            console.log(loggedUser.name, loggedUser.email);
            res.render("temp", { message: "Login Successfully" });
        } 
        else {
            res.render("temp", { message: "Wrong ID and Password" });
        }
    } 
    catch (err) {
        console.error(err);
        res.render("temp", { message: "An error occurred while logging in" });
    }
});

app.get("/logout", function(req,res){
    if(!isLogin) res.render("temp", {message: "Not Logged in"});
    else{
        isLogin = false;
        res.render("temp", {message: "Logout Successfully"});
    }
})

const menProd = {
    name : String,
    price: Number
};
const menProducts = mongoose.model("menprod", menProd); 

app.get("/menproducts", function(req,res){
    menProducts.find({})
    .then(prods => {
        res.render("menProducts", {
            menProducts : prods
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).send("Error retrieving products from database");
    });
})


const womenProd = {
    name : String,
    price: Number
};
const womenProducts = mongoose.model("womenprod", womenProd); 

app.get("/womenproducts", function(req,res){
    womenProducts.find({})
    .then(prods => {
        res.render("womenProducts", {
            womenProducts : prods
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).send("Error retrieving products from database");
    });
})

const kidsProd = {
    name : String,
    price: Number
};
const kidsProducts = mongoose.model("kidsprod", kidsProd); 

app.get("/kidsproducts", function(req,res){
    kidsProducts.find({})
    .then(prods => {
        res.render("kidsProducts", {
            kidsProducts : prods
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).send("Error retrieving products from database");
    });
})

app.get("/additem", function(req,res){
    if(isLogin && loggedUser.acctype === "seller") res.render("additem");
    else res.render("temp", {message: "Only seller can add items"});        
})

app.post("/additem", function(req, res){
    if(req.body.sect === "kids"){
        const k = new kidsProducts({
            name : req.body.name,
            price : req.body.price
        });
        k.save()
        .then(()=> {
            res.render("temp", {message: "Kid Product Added Successfully"});
        })
        .catch((err)=>{
            res.render("temp", {message: "ERR Occured"});
        })
    }
    if(req.body.sect === "men"){
        const k = new menProducts({
            name : req.body.name,
            price : req.body.price
        });
        k.save()
        .then(()=> {
            res.render("temp", {message: "Men Product Added Successfully"});
        })
        .catch((err)=>{
            res.render("temp", {message: "ERR Occured"});
        })
    }
    if(req.body.sect === "women"){
        const k = new womenProducts({
            name : req.body.name,
            price : req.body.price
        });
        k.save()
        .then(()=> {
            res.render("temp", {message: "Women Product Added Successfully"});
        })
        .catch((err)=>{
            res.render("temp", {message: "ERR Occured"});
        })
    }
});

app.listen(3000, function(){
    console.log("Server stated at 3000");
})
