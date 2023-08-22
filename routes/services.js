require('dotenv').config()

const Service = require("../models/Service")
const router = require("express").Router();
const bcrypt = require("bcrypt")

// Add a service to database
router.post("/add", async (req, res) => {
    try {


        const newService = new Service({
            name: req.body.name,
            desc: req.body.desc,
            rating: req.body.rating,
            price: req.body.price
        })

        await newService.save()

        res.status(200).json("success" + newService)

    } catch(err) {
        console.log(err);
        res.status(500).json("Error")
    }
})

// Get all services
router.get("/getAllServices", async (req, res) => {
    try {

        const services = await Service.find({});

        res.status(200).json(services);

    } catch(err) {
        console.log("hi")
    }
});

// Get service by ID
router.get("/service/:serviceId", async (req, res) => {
    try {

        const service = await Service.find({_id: req.params.serviceId});

        res.status(200).json(service);

    } catch(err) {
        console.log(err)
    }
});

module.exports = router