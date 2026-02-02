const express = require("express")
const router = new express.Router()
const accountController = require("../controllers/accountController")
const utilities = require("../utilities")
const regValidate = require('../utilities/account-validation')

router.get("/login", utilities.handleErrors(accountController.buildLogin))
router.get("/logout", (req, res) => {
    res.clearCookie("jwt")
    req.flash("notice", "You have been logged out.")
    res.redirect("/")
})
router.get("/registration", utilities.handleErrors(accountController.buildRegister))
router.get("/update", utilities.handleErrors(accountController.buildUpdater))
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildManager))

router.post(
    "/register", 
    regValidate.registrationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
)
router.post(
    "/update",
    regValidate.updateAccountRules(),
    regValidate.checkUpdateAccountData,
    utilities.handleErrors(accountController.updateAccount)
)
router.post(
    "/update-password",
    regValidate.passwordRules(),
    regValidate.checkPasswordData,
    utilities.handleErrors(accountController.updatePassword)
)
router.post(
    "/login",
    regValidate.loginRules(),
    regValidate.checkLoginData,
    utilities.handleErrors(accountController.accountLogin)
)

module.exports = router;