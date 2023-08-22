const mongoose = require("mongoose");

// Admin Schema

const AdminSchema = new mongoose.Schema(
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
    }, 
    { timestamps: true }
);

module.exports = mongoose.model("Admin", AdminSchema);