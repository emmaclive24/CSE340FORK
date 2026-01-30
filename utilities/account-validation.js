const utilities = require(".")
    const { body, validationResult } = require("express-validator")
    const validate = {}
const accountModel = require("../models/account-model")

// Registration Validation Rules //
validate.registrationRules = () => {
    return [
    body("account_firstname")
        .trim()
        .escape()
        .notEmpty()
        // .isLength({ min: 1 }) already covered with "isEmpty"
        .withMessage("Please provide your first name."),
    
    body("account_lastname")
        .trim()
        .escape()
        .notEmpty()
        // .isLength({ min: 1 }) already covered with "isEmpty"
        .withMessage("Please provide your last name."),

    body("account_email")
        .trim()
        .escape()
        .normalizeEmail()
        .notEmpty().withMessage("Email is required.").bail() // If empty stops
        .isEmail().withMessage("Email must be Valid").bail() // Stops if invalid email
        .custom(async (account_email) => {
            const emailExists = await accountModel.checkExistingEmail(account_email)
            if(emailExists) {
                throw new Error("Email exists. Please log in or use different email.")
            }
        }),
    
    body("account_password")
        .trim()
        .notEmpty().withMessage("Please Provide a password")
        .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{12,}$/) // just using the regular expression given in the client-side validation, for consistency sake.
        .withMessage("Password must have an upper and lowercase letter, a number, and a symbol, with no spaces.")
    ]
        
        /*.isStrongPassword({
            minLength: 12,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
        })
        .custom((value) => {
            if (/\s/.test(value)) {
                throw new Error('No spaces allowed');
            }
            return true;
        }) Adding the custom method for Spaces seemed excessive so I just used the regular expression from the client-side validation. */
}

// Check the Data and Return errors to continue registration //
validate.checkRegData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email, account_password } = req.body
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("account/registration", {
            errors,
            title: "registration",
            nav,
            account_firstname,
            account_lastname,
            account_email,
            account_password
        })
        return
    }
    next()
}

module.exports = validate