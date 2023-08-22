require('dotenv').config()
const port = process.env.PORT || 8000;
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");


const app = express();
app.use(cors());
app.use(express.json({ extended: false }));

try {
    mongoose.connect(
      process.env.MONGO_URL,
      { useNewUrlParser: true, useUnifiedTopology: true }
      ).then(() => {
      console.log("Mongo connected");
    });
} catch(err) {
    console.log(err);
}

app.use("/api/users", require("./routes/users"));
app.use("/api/admins", require("./routes/admins"));
app.use("/api/products", require("./routes/products"));
app.use("/api/services", require("./routes/services"));

app.listen(port, function() {
    console.log("Server Running on port 8000");
})