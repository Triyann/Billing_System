require('dotenv').config()

const Product = require('../models/Product');
const Admin = require('../models/Admin');
const Transaction = require("../models/Transaction")
const User = require("../models/User")
const router = require("express").Router();
const bcrypt = require("bcrypt")

// Register a new admin
router.post("/register", async function(req, res) {
    try {
        const admin = await Admin.findOne({email: req.body.email});

        if (!admin) {

            const newAdmin = new Admin({
                username: req.body.username,
                email: req.body.email,
                password: req.body.password,
            })

            const salt = await bcrypt.genSalt(10);
            newAdmin.password = await bcrypt.hash(newAdmin.password, salt);

            await newAdmin.save();
            res.status(200).json("successfully registered" + newAdmin)
        }

        else {
            res.json("This email is already registered.");
        }
    } catch(err) {
        console.log(err)
        res.json(err);
    }
});

// Get all orders
router.get("/allOrders", async function(req, res) {
    try {

        const admin = await Admin.findOne({email: req.body.email});

        if (!admin) {
            res.status(404).json("You are not authorized")
            return;
        }

        else {
            const validPassword = await bcrypt.compare(req.body.password, admin.password);
            if (!validPassword) {
                res.json("Password is incorrect");
                return;
            }
        }

        const transactions = await Transaction.find();

        res.status(200).json(transactions)

    } catch(err) {
        console.log(err)
    }
})

module.exports = router