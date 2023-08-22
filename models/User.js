const mongoose = require("mongoose");

// User Schema

const UserSchema = new mongoose.Schema(
    {
        username: {
            type: String
        },
        email: {
            type: String,
            required: true,
            max: 50,
            unique: true,
        },
        password: {
            type: String,
            required: true,
            min: 6,
        },
        phone: {
            type:String,
        },
        orderHistory: {
            type: Array,
            default: []
        },
        address: {
            type: Array,
            default: []
        },
        productsCart: {
            type: Array,
            default: []
        },
        servicesCart: {
            type: Array,
            default: []
        }
    }, 
    { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);