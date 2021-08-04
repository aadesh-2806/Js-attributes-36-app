const express = require("express");
const app = express();
const path = require("path");
// const mongoose = require('mongoose');
const methodOverride = require("method-override")
const famrs = require('./models/farm')

const Product = require("./models/product");
const Farm = require("./models/farm");
app.use(methodOverride('_method'))
app.set("views" , path.join(__dirname , 'views'))
app.set('view engine' , "ejs");
app.use(express.urlencoded({ extended: true }));

// mongoose.connect('mongodb://localhost:27017/farmStand', {useNewUrlParser: true, useUnifiedTopology: true})
//     .then(() => {
//         console.log("Connection open")
//     })
//     .catch(err =>{
//         console.log('Oh no Err');
//     })

const category = ['fruits' , 'vegetables' , 'dairy'];

app.get('/farms' , async(req,res)=>{
    const farms = await Farm.find({});
    res.render('farms/index' , {farms});
})
app.get('/farms/new' , (req,res)=>{
    res.render('farms/new');
})
app.get('/farms/:id' , async(req,res)=>{
    const farm = await Farm.find(req.params).populate('products');
    res.render('farms/show' , {farm});
})
app.post('/farms' , async(req,res)=>{
    const farm = new Farm(req.body);
    await farm.save();
    res.redirect('farms/index');
})
app.delete('/farms/:id' , async(req,res)=>{
    const {id} = req.params;
    const farm = await Farm.findByIdAndDelete(id);
    res.redirect('/farms');
})
app.get('/farms/:id/products/new' , async(req,res)=>{
    const {id} = req.params;
    const farm = await Farm.findById(id);
    res.render('products/new', {categories,farm})
})
app.get('/farms/:id/products' , async(req,res)=>{
    const { name , price , category} = req.body;
    const product = new Product({ name , price , category});
    const {id} = req.params;
    const farm = await Farm.findById(id);
    farm.products.push(product);
    product.farm = farm;
    await product.save();
    await farm.save();
    res.redirect(`/farms/${id}`);
})

app.get("/products" , async (req,res,next)=>{
    try{
        const {categories} = req.query;
        if(categories){
            const products = await Product.find({categories});
            res.render("products/index" , {products , categories})
        }
        else{
            const products = await Product.find({});
            res.render("products/index" , {products , categories: 'ALL'})
        }
    } 
    catch(e){
        next(e);
    }
    // console.log(products);
    // res.send("All done and Product are visible here only");
})

app.get('/products/new' , (req,res,next)=>{
    // throw new AppError('Not Allowed' , 401);
    res.render('products/new' , {category});
})

app.post('/products' , async (req,res,next) => {
    // console.log(req.body);
    try{
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.redirect("/products/:id")
    }
    catch(e){
        next(e);
    }
})

function wrapAsync(fn) {
    return function (req,res,next) {
        fn(req,res,next).catch(e=>next(e));
    }
}

app.get("products/:id" , wrapAsync(async (req,res,next) => {
    const { id } = req.params;
    const product = await Product.findById( id ).populate('Farm' , 'name');
    if(!product){
        throw new AppError('Product Not Found',404);
    }
    res.render('products/show' , {product})
}))

app.get("/products/:id/edit" , async (req,res,next)=>{
    try{
        const {id} = req.params;
        const product = await Product.findById(id);
        res.render('products/edit' , {product , category});
    } 
    catch(e){
        next(e);
    }
})

app.put("/products/:id" , async (req,res,next)=>{
    try{
        const {id} = req.params;
        const product = await Product.findByIdAndUpdate(id , req.body , {runValidators: true , new: true});
        res.redirect(`/products/${product._id}`)
    } 
    catch(e){
        next(e);
    }
    // console.log(req.body);
})

app.delete("/products/:id" , async (req,res,next)=>{
    try{
        const {id} = req.params;
        const product = await Product.findByIdAndDelete(id);
        res.redirect("/products");
    } 
    catch(e){
        next(e);
    }
})

const handleValidationError = err =>{
    console.dir(err);
    return new AppError(`Validation Failed...${err.message}` , 400)
}

app.use((err,req,res,next)=>{
    console.log(err.name);
    if(err.name === 'ValidationError') {
        err = handleValidationError(err);
    }
    next(err);
})
app.use((err,req,res,next)=>{
    const {status = 500 , message = 'Something Went Wrong'} = err;
    res.status(status.send(message));
})

app.get("/dogs" , (req,res)=>{
    res.send("woof");
})

app.listen(3000 , ()=>{
    console.log("Listening to Port");
})