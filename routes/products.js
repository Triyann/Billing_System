require('dotenv').config()

const Product = require("../models/Product")
const router = require("express").Router();
const bcrypt = require("bcrypt")

// Add product to database
router.post("/add", async (req, res) => {
    try {


        const newProduct = new Product({
            name: req.body.name,
            desc: req.body.desc,
            rating: req.body.rating,
            price: req.body.price
        })

        await newProduct.save()

        res.status(200).json("success" + newProduct)

    } catch(err) {
        console.log(err);
        res.status(500).json("Error")
    }
})

// Get all products
router.get("/getAllProducts", async (req, res) => {
    try {

        const products = await Product.find({});

        res.status(200).json(products);

    } catch(err) {
        console.log("hi")
        console.log(err)
    }
});

// Get a product by id
router.get("/product/:productId", async (req, res) => {
    try {

        const product = await Product.find({_id: req.params.productId});

        res.status(200).json(product);

    } catch(err) {
        console.log(err)
    }
});

module.exports = router