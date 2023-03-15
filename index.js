const express = require('express');
const mongoose = require('mongoose');
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');

app.use(express.urlencoded({extended: true}));
const session = require('express-session');
app.use(session({
    cookie: { maxAge: 60000 },
    secret: 'subhajit',
    resave: false,
    saveUninitialized: false
}));
app.use(flash());
app.use(cookieParser())



app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", "views");

const dbcon = "mongodb+srv://sdsubhajit24:w0hUsqRkmdYlbmRf@cluster0.uyhkjgq.mongodb.net/emailVerification";

const userRoute = require("./route/userRoute");
const userAuth = require("./middleware/userAuth");



app.use(userAuth.authJwt);
app.use(userRoute);

port = process.env.PORT || 9008;

mongoose.connect(dbcon, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(res => {
    app.listen(port, () => {
        console.log("DB Connected...");
        console.log(`App Running On http://localhost:${port}`);
    })
}).catch(err => {
    console.log(err);
})