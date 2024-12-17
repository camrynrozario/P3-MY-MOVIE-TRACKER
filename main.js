require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Database connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on("error", (error) => console.log(error));
db.once("open", () => console.log("Connected to the database"));

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(
    session({
        secret: "my secret key",
        saveUninitialized: true,
        resave: false,
    })
);

app.use((req, res, next) => {
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
});

// Set template engine
app.set("view engine", "ejs");

// Static files
app.use(express.static("public"));
app.use('/css', express.static(path.join(__dirname, 'assets/css')));

// Route prefix
app.use("", require("./routes/routes"));

app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`);
});