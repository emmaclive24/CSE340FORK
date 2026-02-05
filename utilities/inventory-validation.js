const utilities = require(".")
    const { body, validationResult } = require('express-validator')
    const validate = {}

validate.classRules = () => {
    return [
        // Classification Name (required, letters and numbers only, 2-30 chars )
        body("classification_name")
            .trim()
            .escape()
            .notEmpty()
            .withMessage("The classification name cannot be empty").bail()
            .matches(/^[A-Za-z0-9]+$/)
            .withMessage("Classification Name must only contain letters and numbers.").bail()
            .isLength({ min: 2, max: 30 })
            .withMessage("Classification name must be between 2 and 30 characters long.")
    ]
}

validate.invRules = () => {
    let year = new Date().getFullYear();
    return [
        // Make (required, letters, spaces, and hyphens only, 2-20 chars)
        body("inv_make")
            .trim()
            .escape()
            .notEmpty()
            .withMessage("Vehicle make is required.").bail()
            .matches(/^[A-Za-z\s\-]{2,20}$/)
            .withMessage("Make must be between 2 and 20 letters only (spaces and hyphens allowed)."),

        // Model (required, letters/numbers/hyphens, 2-30 chars)
        body("inv_model")
            .trim()
            .escape()
            .notEmpty()
            .withMessage("Vehicle model is required.").bail()
            .matches(/^[A-Za-z0-9\s\-]{2,30}$/)
            .withMessage("Model must be between 2 and 30 letters or numbers long (spaces/hyphens allowed)."),

        // Year (required, 4-digit year 1900-current+1)
        body("inv_year")
            .trim()
            .notEmpty()
            .withMessage("Year is required.").bail()
            .isInt({ min: 1900, max: (year + 1)})
            .withMessage(`Year must be between 1900 and ${year + 1}.`),

        // Description (required, 10-500 chars)
        body("inv_description")
            .trim()
            .escape()
            .notEmpty()
            .withMessage("Description is required.").bail()
            .isLength({ min: 10, max: 500 })
            .withMessage("Description must be between 10 and 500 characters."),

        // Main Image (defaults to no-image.png if not provided)
        body("inv_image")
            .trim()
            .if(value => value !== '')
            .matches(/^(https?:\/\/.*\.(jpg|jpeg|png|webp)$|^\/images\/vehicles\/.*\.(jpg|jpeg|png|webp)$)/i)
            .withMessage("Main image must be valid image URL or location (jpg/jpeg/png/webp)."),

        // Thumbnail (defaults to no-image-tn.png if not provided)
        body("inv_thumbnail")
            .trim()
            .if(value => value !== '')
            .matches(/^(https?:\/\/.*\.(jpg|jpeg|png|webp)$|^\/images\/vehicles\/.*\.(jpg|jpeg|png|webp)$)/i)
            .withMessage("Thumbnail must be valid image URL or location (jpg/jpeg/png/webp)."),

        // Price (required, positive number, $1-$999,999)
        body("inv_price")
            .trim()
            .toFloat()
            .notEmpty()
            .withMessage("Price is required.").bail()
            .isFloat({ min: 1, max: 999999 })
            .withMessage("Price must be between $1 and $999,999."),

        // Miles (required, 0-999,999)
        body("inv_miles")
            .trim()
            .toFloat()
            .notEmpty()
            .withMessage("Mileage is required.").bail()
            .isFloat({ min: 0, max: 999999 })
            .withMessage("Miles must be between 0 and 999,999."),

        // Color (required, letters only, 2-20 chars)
        body("inv_color")
            .trim()
            .escape()
            .notEmpty()
            .withMessage("Color is required.").bail()
            .matches(/^[A-Za-z\s\-]{2,20}$/)
            .withMessage("Color must be between 2 and 20 letters (spaces/hyphens allowed)."),

        // Classification ID (required, valid integer)
        body("classification_id")
            .trim()
            .toInt()
            .notEmpty()
            .withMessage("Classification is required.").bail()
            .isInt({ min: 1 })
            .withMessage("Valid classification must be selected.")
    ]
}

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
    next()
}

validate.checkNewInventoryData = async(req, res, next) => {
    const errors = validationResult(req)
    const class_id = req.body.classification_id || ''

    if(!errors.isEmpty()) {
        let nav = await utilities.getNav()
        let class_drop = await utilities.buildClassificationList(class_id)
        let year = new Date().getFullYear();
        return res.render("inventory/add-inventory", {
            ...req.body,
            errors,
            title: "Add New Vehicle",
            nav,
            classification_drop: class_drop,
            max_year: (year + 1),
            messages: req.flash()
        })
    }
    next()
}

validate.checkUpdateData = async(req, res, next) => {
    const errors = validationResult(req)
    const class_id = req.body.classification_id || ''

    if(!errors.isEmpty()) {
        let nav = await utilities.getNav()
        let class_drop = await utilities.buildClassificationList(class_id)
        let year = new Date().getFullYear();
        return res.render("inventory/edit", {
            ...req.body,
            errors,
            title: "Add New Vehicle",
            nav,
            classification_drop: class_drop,
            max_year: (year + 1),
            messages: req.flash()
        })
    }
    next()
}

module.exports = validate;