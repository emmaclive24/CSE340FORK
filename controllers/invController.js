const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* Building Inventory by Classification view */
invCont.buildByClassificationId = async function (req, res, next) {
    const classification_id = req.params.classificationId 
    const data = await invModel.getInventoryByClassificationId(classification_id)
    const grid = await utilities.buildClassificationGrid(data)
    let nav = await utilities.getNav()
    const className = data[0].classification_name
    res.render("./inventory/classification", {
        title: className + " vehicles",
        nav,
        grid,
    })
}

invCont.buildByInventoryId = async function (req, res, next) {
    const inv_id = req.params.invId
    const data = await invModel.getByInventoryId(inv_id)
    const vehicle = utilities.buildVehicleDetails(data)
    let nav = await utilities.getNav()
    res.render("./inventory/detail", {
        title: data.inv_make + " " + data.inv_model,
        nav,
        vehicle,
    })
}

invCont.buildManagment = async function (req, res, next) {
    let nav = await utilities.getNav()
    req.flash("notice", "Welcome to the Inventory Managment Screen.");
    res.render("inventory/management", {
        title: "Inventory Manager",
        nav: nav,
        messages: req.flash()
    })
}

invCont.buildAddClass = async function (req, res, next) {
    let nav = await utilities.getNav()
    req.flash("notice", "Adding New Classification");
    res.render("inventory/add-classification", {
        title: "Add New Classification",
        nav: nav,
        messages: req.flash()
    })
}

invCont.addClass = async function (req, res, next) {
    const { classification_name } = req.body
    const result = await invModel.addClassification(classification_name)

    if (result) {
        req.flash("success", `${classification_name} was added successfully!`)
    } else {
        req.flash("error", `Failed to add ${classification_name}.`)
    }

    const nav = await utilities.getNav() // New nav with new classification if successful
    res.render("inventory/managment", {
        title: "Inventory Manager",
        nav,
        messages: req.flash()
    })
}

module.exports = invCont