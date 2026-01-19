/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const baseController = require("./controllers/baseController")
const pool = require("./database/")
const utilities = require("./utilities/")
const inventoryRoute = require("./routes/inventoryRoute")

const app = express()
// const static = require("./routes/static")

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
app.use("/inv", utilities.handleErrors(inventoryRoute)) // handles both the classification grid and single item views

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
        title: err.status || "Server Error",
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
