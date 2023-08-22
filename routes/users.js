require('dotenv').config()

const Product = require('../models/Product');
const Transaction = require('../models/Transaction');
const User = require("../models/User")
const router = require("express").Router();
const bcrypt = require("bcrypt");
const axios = require("axios")

// Get a user by his id
router.get("/", async function(req, res) {
    try {
        const user = await User.findOne({_id: req.body.id});
        
        res.json({_id: user._id, username: user.username, email: user.email, phone: user.phone, 
            address: user.address, orderHistory: user.orderHistory, productsCart: user.productsCart, servicesCart: user.servicesCart});

    } catch(err) {
        console.log(err)
    }
})

// Register a new user
router.post("/register", async function(req, res) {
    try {
        const user = await User.findOne({email: req.body.email});

        if (!user) {

            const newUser = new User({
                username: req.body.username,
                email: req.body.email,
                password: req.body.password,
                phone: req.body.phone ? req.body.phone : "",
                address: req.body.address ? req.body.address : ""
            })

            const salt = await bcrypt.genSalt(10);
            newUser.password = await bcrypt.hash(newUser.password, salt);

            await newUser.save();
            res.status(200).json("successfully registered" + newUser)
        }
        
        else {
            res.json("This email is already registered.");
        }
    } catch(err) {
        res.json(err);
    }
});

// User login
router.post("/login", async function(req, res) {
    try {
        const user = await User.findOne({email: req.body.email});
        
        if (!user) {
            res.json("Email not registered. Create an account and try again");
        }

        else {
            const validPassword = await bcrypt.compare(req.body.password, user.password);
            if (!validPassword) {
                res.json("Password is incorrect");
            } else {
                res.json({_id: user._id, username: user.username, email: user.email, phone: user.phone, address: user.address, orderHistory: user.orderHistory, productsCart: user.productsCart, servicesCart: user.servicesCart});
            }
        }

    } catch(err) {
        console.log(err);
        res.json(err)
    }
})

// User adds an item to the cart
router.post("/addToCart", async (req, res) => {

    try {

        let user = await User.findOne({email: req.body.email});

        if (!user) {
            res.status(404).json("Email not registered. Create an account and try again");
        }

        else {
            // console.log(req.body.newOrder);
            // await User.findOneAndUpdate({email: req.body.email}, {$push:{orderHistory:req.body.newOrder}});
            if (req.body.product)
                await user.updateOne({$push: {productsCart: {productId: req.body.productId, price: req.body.price, quantity: req.body.quantity}}});
            else
                await user.updateOne({$push: {servicesCart: {serviceId: req.body.serviceId, price: req.body.price, quantity: req.body.quantity}}});
        }

        user = await User.findOne({email: req.body.email});
        res.json({_id: user._id, username: user.username, email: user.email, phone: user.phone, address: user.address, orderHistory: user.orderHistory, productsCart: user.productsCart, servicesCart: user.servicesCart});

    } catch(err) {
        console.log(err)
    }
})

// User removes an item from the cart
router.delete("/removeFromCart", async (req, res) => {

    try {

        let user = await User.findOne({email: req.body.email});

        if (!user) {
            res.status(404).json("Email not registered. Create an account and try again");
        }

        else {
            if (req.body.product)
                await user.updateOne({$pull: {productsCart: {productId: req.body.productId}}});
            else 
                await user.updateOne({$pull: {servicesCart: {serviceId: req.body.serviceId}}});
            await user.save();
        }

        user = await User.findOne({email: req.body.email});
        res.json({_id: user._id, username: user.username, email: user.email, phone: user.phone, address: user.address, orderHistory: user.orderHistory, productsCart: user.productsCart, servicesCart: user.servicesCart});

    } catch(err) {
        console.log(err)
    }
})

// Clear the cart
router.delete("/clearCart", async (req, res) => {

    try {

        let user = await User.findOne({email: req.body.email});

        if (!user) {
            res.status(404).json("Email not registered. Create an account and try again");
        }

        else {
            
            await user.updateOne({productsCart: []});
            await user.updateOne({servicesCart: []});
            await user.save();
        }

        user = await User.findOne({email: req.body.email});
        res.json({_id: user._id, username: user.username, email: user.email, phone: user.phone, address: user.address, orderHistory: user.orderHistory, productsCart: user.productsCart, servicesCart: user.servicesCart});

    } catch(err) {
        console.log(err)
    }
})

// View total Bill
router.post("/cartTotal", async (req, res) => {

    try {

        const user = await User.findOne({email: req.body.email});

        if (!user) {
            res.status(404).json("Email not registered. Create an account and try again");
            return
        }

        else {
            
            const productsCart = user.productsCart
            const servicesCart = user.servicesCart

            // [[600, 5], [1500000, 2]]

            let totals = []
            let taxes = [];
            // totals[i][0] = price of ith product, totals[i][1] = quantity of ith product the user wants
            for (let i = 0; i < productsCart.length; i++) {
                totals.push([parseInt(productsCart[i].price), parseInt(productsCart[i].quantity)])
            }

            // CALCULATING TAXES FOR PRODUCTS
            for (let i = 0; i < productsCart.length; i++) {

                // Multiplying tax amount by qunatity to apply tax to each product
                if (totals[i][0] > 1000 && totals[i][0] <= 5000)
                    taxes.push(totals[i][1] * (0.12 * totals[i][0]))
                
                else if (totals[i][0] > 5000)
                    taxes.push(totals[i][1] * (0.18 * totals[i][0]))
                
                else
                    taxes.push(0)
                
                // Adding tax PC to ith product (multiplying by quantity)
                taxes[i] += totals[i][1] * 200
            }

            for (let i = 0; i < servicesCart.length; i++) {
                totals.push([parseInt(servicesCart[i].price), parseInt(servicesCart[i].quantity)])
            }
            
            // CALCULATING TAXES FOR SERVICES
            for (let i = 0; i < servicesCart.length; i++) {

                // Multiplying tax amount by qunatity to apply tax to each product
                if (totals[productsCart.length + i][0] > 1000 && totals[productsCart.length + i][0] <= 8000)
                    taxes.push(totals[productsCart.length + i][1] * (0.1 * totals[productsCart.length + i][0]))
                
                else if (totals[productsCart.length + i][0] > 8000)
                    taxes.push(totals[productsCart.length + i][1] * (0.15 * totals[productsCart.length + i][0]))
                
                else
                    taxes.push(0)
                
                // Adding tax PC to ith product (multiplying by quantity)
                taxes[productsCart.length + i] += totals[productsCart.length + i][1] * 100
            }
            
            let subTotal = 0;
            for (let i = 0; i < totals.length; i++) {
                subTotal += (totals[i][0] * totals[i][1]) + taxes[i]
            }

            let info1 = []

            for (let i = 0; i < productsCart.length; i++) {
                info1.push({
                    productId: productsCart[i].productId,
                    quantity: productsCart[i].quantity,
                    price: productsCart[i].price,
                    total: totals[i][0] * totals[i][1],
                    tax: taxes[i]
                })
            }

            let info2 = []
            for (let i = 0; i < servicesCart.length; i++) {
                info2.push({
                    productId: servicesCart[i].productId,
                    quantity: servicesCart[i].quantity,
                    price: servicesCart[i].price,
                    total: totals[i + productsCart.length][0] * totals[i + productsCart.length][1],
                    tax: taxes[i + productsCart.length]
                })
            }

            let result = {"products": [info1], "services": [info2]}

            res.status(200).json({items: result, subTotal: subTotal})
        }

    } catch(err) {
        console.log(err)
    }
})


// User places a new order
router.post("/newOrder", async function(req, res) {
    try {
        let user = await User.findOne({email: req.body.email});
        
        if (!user) {
            res.status(404).json("Email not registered. Create an account and try again");
        }

        else {

            const data = await axios.post("http://localhost:8000/api/users/cartTotal", {email: req.body.email})
            
            let newTransaction = new Transaction({
                userId: user._id,
                items: data.data
            })

            await newTransaction.save()

            await user.updateOne({$push: {orderHistory: newTransaction._id}});
            await user.updateOne({productsCart: [], servicesCart: []})
            await user.save();
        }
        
        user = await User.findOne({email: req.body.email});
        res.status(200).json({_id: user._id, username: user.username, email: user.email, phone: user.phone, address: user.address, orderHistory: user.orderHistory, productsCart: user.productsCart, servicesCart: user.servicesCart});

    } catch(err) {
        console.log(err);
    }
});

module.exports = router