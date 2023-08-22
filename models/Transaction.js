const mongoose = require("mongoose");

// Transaction Schema

const TransactionSchema = new mongoose.Schema({
    userId: {
        type: String
    },
    items: {
        type: Array,
        default: []
    },
    _createdAt: {
        type: Date,
        default: new Date(Date.now())
    }
})

module.exports = mongoose.model("Transaction", TransactionSchema)