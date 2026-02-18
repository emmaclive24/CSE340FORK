/* ******************************************
 * This server.js file is the primary file of the
 * application. It is used to control the project.
 *******************************************/

/* ***********************
 * Require Statements
 *************************/
require("dotenv").config()
const jwt = require("jsonwebtoken")
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")
const session = require("express-session")
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const pool = require("./database/")
const utilities = require("./utilities/")
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")
const accountRoute = require("./routes/accountRoute")

/* ***********************
 * App Instance
 *************************/
const app = express()

/* ***********************
 * Environment Validation
 *************************/
if (!process.env.SESSION_SECRET) {
  console.error("FATAL: SESSION_SECRET is not set. Check your .env file or Render environment variables.")
  process.exit(1)
}

/* ***********************
 * Middleware
 *************************/
app.use(session({
  store: new (require("connect-pg-simple")(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  name: "sessionId",
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 24, // 24 hours
  },
}))

// Flash Messages
app.use(require("connect-flash")())
app.use(function (req, res, next) {
  res.locals.messages = require("express-messages")(req, res)
  next()
})

// Body & Cookie Parsing
app.use(cookieParser())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Static Files
app.use(express.static("public"))

// JWT Login Check
app.use((req, res, next) => {
  res.locals.loggedin = false
  const token = req.cookies.jwt
  if (!token) return next()
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    res.locals.loggedin = true
    res.locals.accountData = decoded
  } catch (err) {
    console.error("JWT verification error:", err.message)
    res.locals.loggedin = false
  }
  next()
})

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout")

/* ***********************
 * Routes
 *************************/
app.use(require("./routes/static"))

// Index route
app.get("/", utilities.handleErrors(baseController.buildHome))

// Inventory routes
app.use("/inv", inventoryRoute)

// Account routes
app.use("/account", accountRoute)

// Error testing route
app.get("/error", utilities.handleErrors(require("./controllers/errorController").triggerError))

/* ***********************
 * 404 Handler
 *************************/
app.use(async (req, res, next) => {
  next({
    status: 404,
    message: "It appears the page has been lost, maybe it was sold? So good news, you have good taste!",
  })
})

/* ***********************
 * Global Error Handler
 *************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  const message =
    err.status === 404
      ? err.message
      : "Uh oh, a crash has occurred. Trust us, crashes are the last thing we want here. Maybe we should have changed routes?"
  res.status(err.status || 500).render("errors/error", {
    title: err.status === 404 ? "Page Not Found" : "Server Error",
    status: err.status || 500,
    message,
    nav,
  })
})

/* ***********************
 * Start Server
 *************************/
const port = process.env.PORT || 5500
app.listen(port, "0.0.0.0", () => {
  console.log(`App listening on 0.0.0.0:${port}`)
})
