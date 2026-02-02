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

invCont.buildManagement = async function (req, res, next) {
    let nav = await utilities.getNav()
    req.flash("notice", "Welcome to the Inventory Management Screen.");
    const classSelect = await utilities.buildClassificationList()
    res.render("inventory/management", {
        title: "Inventory Manager",
        nav: nav,
        messages: req.flash(),
        classSelect
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
        let nav = await utilities.getNav()
        return res.render("inventory/add-classification", {
            title: "Add New Classification",
            nav,
            classification_name,
            messages: req.flash()
        })
    }

    const nav = await utilities.getNav() // New nav with new classification if successful
    return res.render("inventory/management", {
        title: "Inventory Manager",
        nav,
        messages: req.flash()
    })
}

invCont.buildNewInventoryForm = async function (req, res, next) {
    let inv_make = '';
    let inv_model = '';
    let inv_year = '';
    let inv_description = '';
    let inv_image = '';
    let inv_thumbnail = '';
    let inv_price = '';
    let inv_miles = '';
    let inv_color = '';
    let classification_id = '';

    // Only populate with form data on POST (validation errors)
    if (req.method === 'POST') {
        const { inv_make: form_make, inv_model: form_model, inv_year: form_year, 
                inv_description, inv_image, inv_thumbnail, inv_price, 
                inv_miles, inv_color, classification_id: form_class_id } = req.body;
        
        inv_make = form_make || '';
        inv_model = form_model || '';
        inv_year = form_year || '';
        inv_description = inv_description || '';
        inv_image = inv_image || '';
        inv_thumbnail = inv_thumbnail || '';
        inv_price = inv_price || '';
        inv_miles = inv_miles || '';
        inv_color = inv_color || '';
        classification_id = form_class_id || '';
    }
    let nav = await utilities.getNav()
    let class_drop = await utilities.buildClassificationList(classification_id)
    let year = new Date().getFullYear();
    req.flash("notice", "Adding new inventory")
    res.render("inventory/add-inventory", {
        title: "Add New Inventory",
        nav,
        messages: req.flash(),
        classification_drop: class_drop,
        max_year: (year + 1),
        inv_make,
        inv_model, 
        inv_year, 
        inv_description, 
        inv_image, 
        inv_thumbnail, 
        inv_price, 
        inv_miles, 
        inv_color, 
        classification_id
    })
}

invCont.addNewInventory = async function (req, res, next) {
    const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body
    const result = await invModel.addNewVehicle(inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id)
    let nav = await utilities.getNav()

    if (result) {
        req.flash("success", `${inv_year} ${inv_make} ${inv_model} was added to the Database.`)
        res.render("inventory/management", {
            title: "Inventory Manager",
            nav,
            messages: req.flash()
        })
    } else {
        let class_drop = await utilities.buildClassificationList()
        let year = new Date().getFullYear();
        req.flash("error", `Failed to add the ${inv_year}, ${inv_make} ${inv_model}`)
        res.render("inventory/add-inventory", {
            title: "Add New Inventory",
            nav,
            messages: req.flash(),
            classification_drop: class_drop,
            max_year: (year + 1)
        })
    }
}

// Return Inventory by Classification as JSON
invCont.getInventoryJSON = async (req, res, next) => {
    const classification_id = parseInt(req.params.classification_id)
    const invData = await invModel.getInventoryByClassificationId(classification_id)
    if (invData[0].inv_id) {
        return res.json(invData)
    } else {
        next(new Error("No Data returned"))
    }
}

// Building the Vehicle Detail Editor
invCont.buildVehicleEditor = async (req, res, next) => {
    const inv_id = parseInt(req.params.invId || req.body.inv_id);
    let nav = await utilities.getNav()
    const data = await invModel.getByInventoryId(inv_id)
    const { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = data
    let class_drop = await utilities.buildClassificationList(classification_id)
    const vehName = `${data.inv_make} ${data.inv_model}`
    let year = new Date().getFullYear();

    req.flash("notice", `Updating ${vehName}`)
    res.render(`inventory/edit`, {
        title: "Update " + vehName,
        nav,
        messages: req.flash(),
        classification_drop: class_drop,
        max_year: (year + 1),
        inv_make,
        inv_model, 
        inv_year, 
        inv_description, 
        inv_image, 
        inv_thumbnail, 
        inv_price, 
        inv_miles, 
        inv_color, 
        classification_id,
        inv_id
    })
}

invCont.updateVehicle = async function (req, res, next) {
    const { inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_color } = req.body
    const inv_year = parseInt(req.body.inv_year) || null;
    const inv_price = parseInt(req.body.inv_price) || 0;
    const inv_miles = parseInt(req.body.inv_miles) || 0;
    const classification_id = parseInt(req.body.classification_id) || null;
    const inv_id = parseInt(req.params.invId || req.body.inv_id);
    console.log("Inventory ID: ", inv_id)

    const result = await invModel.updateVehicle(inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id, inv_id)
    let nav = await utilities.getNav()
    let class_drop = await utilities.buildClassificationList(classification_id)
    console.log("result: ", result);

    if (result) {
        req.flash("success", `${inv_year} ${inv_make} ${inv_model} was updated successfully.`)
        res.render("inventory/management", {
            title: "Inventory Manager",
            nav,
            messages: req.flash(),
            classSelect: class_drop
        })
    } else {
        let year = new Date().getFullYear();
        req.flash("notice", `Failed to update the ${inv_year}, ${inv_make} ${inv_model}`)
        res.render(`inventory/edit`, {
            title: "Update " + vehName,
            nav,
            messages: req.flash(),
            classification_drop: class_drop,
            max_year: (year + 1),
            inv_make,
            inv_model, 
            inv_year, 
            inv_description, 
            inv_image, 
            inv_thumbnail, 
            inv_price, 
            inv_miles, 
            inv_color, 
            classification_id
        })
    }
}

module.exports = invCont