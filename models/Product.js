const mongoose = require("mongoose");

// Product Schema

const ProductSchema = new mongoose.Schema({
    name: {
        type: String
    }, 
    desc: {
        type: String,
    },
    rating: {
        type: String
    },
    images: {
        type: Array,
        default: []
    },
    price: {
        type: String,
        default: ""
    }
})

module.exports = mongoose.model("Product", ProductSchema)