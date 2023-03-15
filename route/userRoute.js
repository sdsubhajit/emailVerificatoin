const express =  require('express')
const route = express.Router()
const userController = require('../controller/userController')
const checkDuplicate = require("../middleware/userDuplicate")

route.get("/", userController.home);
route.get("/dashboard", userController.userAuth, userController.userDashboard);
route.get("/logout", userController.logout);
route.post("/signup",  userController.signup);
route.get("/confirmation/:email/:token", userController.confirmation);
route.post("/signin", userController.signin);

module.exports = route

// [checkDuplicate.checkDuplicateEntries]