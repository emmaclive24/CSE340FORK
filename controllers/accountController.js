const utilities = require("../utilities")
const accountModel = require("../models/account-model")
const jwt = require("jsonwebtoken")
const bcrypt = require('bcryptjs')
require("dotenv").config()

async function buildLogin(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/login", {
        title: "Login",
        nav,
        errors: null
    })
}
async function buildRegister(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/registration", {
        title: "Register",
        nav,
        errors: null
    })
}
async function buildUpdater(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/update", {
        title: "Update Account",
        nav,
        account: res.locals.accountData,
        errors: null
    })
}
async function buildManager(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account", {
        title: "Account Manager",
        nav,
        errors: null
    })
}

/* ********************
* Process Registation
******************** */
async function registerAccount(req, res) {
    let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_password } = req.body
    let hashedPassword = null
    try {
        hashedPassword = await bcrypt.hashSync(account_password, 10)
    } catch(error) {
        req.flash("notice", 'Sorry, there was an error processing the registration.')
        res.status(500).render("account/register", {
            title: "Registration",
            nav,
            errors: null,
        })
    }

    const reqResult = await accountModel.registerAccount(
        account_firstname,
        account_lastname,
        account_email,
        hashedPassword,
    )

    if (reqResult) {
        req.flash(
            "notice",
            `Congratulations, you\'re registered ${account_firstname}. Please log in.`
        )
        res.status(201).render("account/login", {
            title: "Login",
            nav,
            errors: null,
        })
    } else {
        req.flash("notice", "Sorry, registration failed.")
        res.status(501).render("account/register", {
            title: "Registration",
            nav,
            errors: null,
        })
    }
}

async function updateAccount(req, res) {
    let nav = await utilities.getNav()
    const { account_id, account_firstname, account_lastname, account_email } = req.body

    const reqResult = await accountModel.updateAccount(
        account_firstname,
        account_lastname,
        account_email,
        account_id
    )

    if (reqResult) {
        req.flash(
            "notice",
            `Congratulations, you\'ve Updated ${account_firstname}. Please log in.`
        )
        res.status(201).render("account/login", {
            title: "Login",
            nav,
            errors: null,
        })
    } else {
        req.flash("notice", "Sorry, update failed.")
        res.status(501).render("account/update", {
            title: "Update Account",
            nav,
            errors: null,
        })
    }
}

async function updatePassword(req, res) {
    let nav = await utilities.getNav()
    const { account_id, account_password } = req.body
    const hashedPassword = await bcrypt.hash(account_password, 10)

    const reqResult = await accountModel.updatePassword( hashed_password, account_id )

    if (reqResult) {
        req.flash(
            "notice",
            `Congratulations, you\'ve Updated the password for ${account_firstname}. Please log in.`
        )
        res.status(201).render("account/login", {
            title: "Login",
            nav,
            errors: null,
        })
    } else {
        req.flash("notice", "Sorry, update password failed.")
        res.status(501).render("account/update", {
            title: "Update Account",
            nav,
            errors: null,
        })
    }
}

async function accountLogin(req, res) {
    let nav = await utilities.getNav()
    const { account_email, account_password } = req.body
    const accountData = await accountModel.getAccountByEmail(account_email)
    if (!accountData) {
        req.flash("notice", "Please check your credentials and try again.")
        res.status(400).render("account/login", {
            title: "Login",
            nav,
            errors: null,
            account_email
        })
        return
    }
    try {
        if (await bcrypt.compare(account_password, accountData.account_password)) {
            delete accountData.account_password
            const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" })
            if(process.env.NODE_ENV === 'development') {
                res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000})
            } else {
                res.cookie("jwt", accessToken, {httpOnly: true, secure: true, maxAge: 3600 * 1000})
            }
            return res.redirect("/account")
        } else {
            req.flash("message notice", "Please check your credentials and try again.")
            res.status(400).render("account/login", {
                title: "Login",
                nav,
                errors: null,
                account_email
            })
        }
    } catch (error) {
        throw new Error('Access Forbidden')
    }
}

module.exports = { buildLogin, buildRegister, buildManager, buildUpdater, registerAccount, updateAccount, updatePassword, accountLogin }