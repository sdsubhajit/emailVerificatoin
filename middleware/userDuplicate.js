const UserModel = require("../model/user");

exports.checkDuplicateEntries = (req, res, next) => {
    UserModel.findOne({
        userName: req.body.username
    }).exec((err, user) => {
        if (err) {
            console.log(err);
            return;
        }
        if (user) {
            req.flash("message", "Username Already Exists");
            return res.redirect("/");
            // console.log("Username Already Exists");
            // return;
        }
        UserModel.findOne({
            email: req.body.email
        }).exec((err, email) => {
            if (err) {
                console.log(err);
                return;
            }
            if (email) {
                req.flash("message", "Email Already Exists");
                return res.redirect("/");

                // console.log("Email already exist...");
                // return;
            }
            // next();
            const password = req.body.password;
            const confirm = req.body.confirmpassword;
            if (password !== confirm) {
                req.flash("message", "Password & Confirm Password Are Not Matched");
                return res.redirect("/");
            }
            next();
        })
    })
}