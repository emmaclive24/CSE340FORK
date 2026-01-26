const utilities = require(".")
    const { body, validationResult } = require('express-validator')
    const validate = {}

validate.classRules = () => {
    return [
        body("classification_name")
            .trim()
            .escape()
            .notEmpty()
            .withMessage("The classification name cannot be empty").bail()
            .matches(/^[A-Za-z0-9]+$/)
            .withMessage("Classification Name must only contain letters and numbers.").bail()
            .isLength({ max: 30 })
            .withMessage("Classification name must be 30 characters or less.")
    ];
};

validate.checkClassificationData = async(req, res, next) => {
    const { classification_name } = req.body
    const errors = validationResult(req)

    if(!errors.isEmpty()) {
        let nav = await utilities.getNav()
        return res.render("inventory/add-classification", {
            errors,
            title: "Add New Classification",
            nav,
            classification_name,
            messages: req.flash()
        });
    }
    next();
};

module.exports = validate;