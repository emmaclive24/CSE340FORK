/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const jwt = require('jsonwebtoken')
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")
const session = require("express-session")
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
console.log('SESSION_SECRET length:', process.env.SESSION_SECRET?.length);
console.log('HOST:', process.env.HOST);
const baseController = require("./controllers/baseController")
const pool = require("./database/")
const utilities = require("./utilities/")
const inventoryRoute = require("./routes/inventoryRoute")
const accountRoute = require("./routes/accountRoute")

const app = express()
// const static = require("./routes/static")

/* ***********************
 * Middleware
 *************************/
app.use(session({
    store: new (require('connect-pg-simple')(session))({
        createTableIfMissing: true,
        pool,
    }),
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    name: 'sessionId',
}))

// Express Messages Middleware
app.use(require('connect-flash')())
app.use(function(req, res, next) {
    res.locals.messages = require('express-messages')(req, res)
    next()
})
app.use(cookieParser())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(express.static("public"))

// JWT Logged in Check 
app.use((req, res, next) => {
    res.locals.loggedin = false
    const token = req.cookies.jwt
    if (!token) return next()
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        res.locals.loggedin = true
        res.locals.accountData = decoded
    } catch (err) {
        console.log("Server error: ", err)
        res.locals.loggedin = false
    }
    next()
})

/* ***********************
* View Engine and Templates
*************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout") // not at views root

/* ***********************
 * Routes
 *************************/
app.use(require("./routes/static"))

// Index route
app.get("/", utilities.handleErrors(baseController.buildHome))

// Inventory routes
app.use("/inv", inventoryRoute) // handles classification grid, single item, and all inventory managment views

// Account Route
app.use("/account", accountRoute)

// Error testing route
app.get("/error", utilities.handleErrors(require("./controllers/errorController").triggerError))

/* File Not Found Route */
app.use(async (req, res, next) => {
    next({ status: 404, message: "It appears the page has been lost, maybe it was sold? So good news, you have good taste!" });
});

/* Express Error Handler */
app.use(async (err, req, res, next) => {
    let nav = await utilities.getNav();
    console.error(`Error at: "${req.originalUrl}": ${err.message}`);
    let message;
    if (err.status == 404) { message = err.message } 
    else { message = "Uh oh, a crash has occured, trust us, crashes are the last thing we want here. Maybe we should have changed routes?" }
    res.status(err.status || 500).render("errors/error", {
        title: err.status == 404 ? "Page Not Found" : "Server Error",
        status: err.status || 500,
        message,
        nav,
    })
})

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})