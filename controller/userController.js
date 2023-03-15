const UserModel = require("../model/user")
const TokenModel = require("../model/token");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
var c = 0


const userAuth = (req, res, next) => {
    if (req.user) {
        console.log(req.user);
        next();
    } else {
        console.log(req.user);
        res.redirect("/");
    }
}


const home = (req, res) => {
    loginData = {}
    loginData.email = (req.cookies.email) ? req.cookies.email : undefined
    loginData.password = (req.cookies.password) ? req.cookies.password : undefined
    if(c==1){
        c=0;
        res.render("home", {
            title: "Login-Registration",
            message: req.flash('message'),
            data: loginData
        })
    }else{
        c=0;
        res.render("home", {
            title: "Login-Registration",
            message: req.flash('message'),
            data: ""
        })
    }
}


const userDashboard = (req, res) => {
    if (req.user) {
        UserModel.find({}, function(err, userDetails) {
            if (!err) {
                res.render("dashboard", {
                    title: "User | Dashboard",
                    data: req.user,
                    details: userDetails
                })
            } else {
                console.log(err);
            }
        })
    }
}


const signup = (req, res) => {
    UserModel({
        userName: req.body.username,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10))
    }).save((err, user) => {
        if (!err) {
            // generate token
            TokenModel({
                _userId: user._id,
                token: crypto.randomBytes(16).toString('hex')
            }).save((err, token) => {
                if (!err) {
                    var transporter = nodemailer.createTransport({
                        host: "smtp.gmail.com",
                        port: 587,
                        secure: false,
                        requireTLS: true,
                        auth: {
                            user: "sdsubhajitdas2406@gmail.com",
                            pass: "ktrxadsdzpcoazqz"
                        }
                    });
                    var mailOptions = {
                        from: 'no-reply@raju.com',
                        to: user.email,
                        subject: 'Account Verification',
                        text: 'Hello ' + req.body.username + ',\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + req.headers.host + '\/confirmation\/' + user.email + '\/' + token.token + '\n\nThank You!\n'
                    };
                    transporter.sendMail(mailOptions, function(err) {
                        if (err) {
                            console.log("Techniclal Issue...");
                        } else {
                            req.flash("message", "A Verfication Email Sent To Your Mail ID.... Please Verify By Click The Link.... It Will Expire By 24 Hrs...");
                            res.redirect("/");
                        }
                    });
                } else {
                    console.log("Error When Create Token...", err);
                }
            })

        } else {
            console.log("Error When Create User...", err);
        }
    })
} 

const confirmation = (req, res) => {
    TokenModel.findOne({ token: req.params.token }, (err, token) => {
        if (!token) {
            console.log("Verification Link May Be Expired :(");
        } else {
            UserModel.findOne({ _id: token._userId, email: req.params.email }, (err, user) => {
                if (!user) {
                    req.flash("message", "User Not Found");
                    res.redirect("/");
                } else if (user.isVerified) {
                    req.flash("message", "User Already Verified");
                    res.redirect("/");
                } else {
                    user.isVerified = true;
                    user.save().then(result => {
                        req.flash("message", "Your Account Verified Successfully");
                        res.redirect("/");
                    }).catch(err => {
                        console.log("Something Went Wrong...", err);
                    })
                }
            })
        }
    })
}

const signin = (req, res, next) => {
    UserModel.findOne({
        email: req.body.email
    }).exec((err, data) => {
        if (data) {
            if (data.isVerified) {
                const hashPassword = data.password;
                if (bcrypt.compareSync(req.body.password, hashPassword)) {
                    const token = jwt.sign({
                        id: data._id,
                        username: data.userName
                    }, "sdemailvarification", { expiresIn: '5m' });
                    res.cookie("token", token);
                    if (req.body.rememberme) {
                        c = c+1
                        res.cookie('email', req.body.email)
                        res.cookie('password', req.body.password)
                    }
                    console.log(data);
                    res.redirect("/dashboard");
                } else {
                    // console.log("Invalid Password...");
                    // res.redirect("/");
                    req.flash("message", "Invalid Password");
                    res.redirect("/");
                }
            } else {
                // console.log("Account Is Not Verified");
                req.flash("message", "Account Is Not Verified");
                res.redirect("/");
            }
        } else {
            // console.log("Invalid Email...");
            // res.redirect("/");
            req.flash("message", "Invalid Email");
            res.redirect("/");
        }
    })
}


const logout = (req, res) => {
    res.clearCookie("token");
    res.redirect("/");
}

module.exports = {
    home,
    userAuth,
    userDashboard,
    logout,
    signin,
    signup,
    confirmation
}