const mongoose = require('mongoose');
const Product = require("./models/product")

mongoose.connect('mongodb://localhos/product', {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => {
        console.log("Connection open")
    })
    .catch(err =>{
        console.log('Oh no Err');
    })
const p = new Product({
    name: "Ruby",
    price: 1.99,
    category: "fruit"
})     

p.save()
    .then(p => {
        console.log(p);
    })
    .catch(err =>{
        console.log(err);
    })

//mongoose first validate all and than save ...if any one fails shows error and not save after that