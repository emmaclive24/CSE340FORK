const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* Building Inventory by Classification view */
invCont.buildByClassificationId = async function (req, res, next) {
    const rawId = req.query.classification_ids ?? req.params.classificationId;
    const classification_id = parseInt(rawId, 10);

    let classification_ids = req.query.classification_ids
    if (!classification_ids || classification_ids.length === 0) {
        classification_ids = [classification_id]
    } else if (!Array.isArray(classification_ids)) {
        classification_ids = [classification_ids]
    }
    const classSet = new Set(classification_ids.map(Number).filter(Boolean)) // Removing Duplicate classification Ids
    classification_ids = Array.from(classSet)

    console.log("classification_ids (In Controller): ", classification_ids)
    const filters = req.query;

    const data = await invModel.getInventoryByClassificationId(classification_ids, filters)

    const filterControl = await utilities.buildFilterControl(classification_ids, filters)
    const grid = await utilities.buildClassificationGrid(data)

    let nav = await utilities.getNav()
    const classNameResults = await invModel.getClassifications()
    const classNames = classNameResults.rows

    const selectedNames = classification_ids.map(id => { // matching the ids from classification_ids to the classification_id in classNames from the database
        const match = classNames.find(c => c.classification_id === id)
        return match ? match.classification_name : ""
    }).filter(Boolean)
    
    const finalName = selectedNames.length > 0 ? selectedNames.join(", ") + " Automotives"  : "Vehicles"
    console.log("Class Names: ", classNames)
 
    res.render("./inventory/classification", {
        title: finalName,
        nav,
        filterControl,
        grid,
        classification_ids,
        filters
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
    const classSelect = await utilities.buildClassificationList()
    return res.render("inventory/management", {
        title: "Inventory Manager",
        nav,
        messages: req.flash(),
        classSelect
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
    let { inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id } = req.body
    let classification_name = ''
    inv_image = inv_image || '/images/vehicles/no-image.png'
    inv_thumbnail = inv_thumbnail || '/images/vehicles/no-image-tn.png'
    const result = await invModel.addNewVehicle(inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id)
    const classes = await invModel.getClassifications()

    classes.rows.forEach(row => {
        if(row.classification_id === classification_id) {
            classification_name = row.classification_name
        }
    })
    let nav = await utilities.getNav()

    if (result) {
        req.flash("success", `${inv_year} ${inv_make} ${inv_model} was added to the Database under classification: ${classification_name}.`)
        const classSelect = await utilities.buildClassificationList()
        res.render("inventory/management", {
            title: "Inventory Manager",
            nav,
            messages: req.flash(),
            classSelect
        })
    } else {
        console.log("Is this where we are?")
        let class_drop = await utilities.buildClassificationList()
        let year = new Date().getFullYear();
        req.flash("error", `Failed to add the ${inv_year}, ${inv_make} ${inv_model}`)
        res.render("inventory/add-inventory", {
            title: "Add New Inventory",
            nav,
            messages: req.flash(),
            classSelect: class_drop,
            max_year: (year + 1)
        })
    }
}

// Return Inventory by Classification as JSON
invCont.getInventoryJSON = async (req, res, next) => {
    const classification_id = parseInt(req.params.classification_id)
    const invData = await invModel.getInventoryByClassificationId([classification_id])
    if (invData.length > 0) {
        return res.json({data: invData})
    } else {
        return res.json({warning: "No inventory found for this classification"})
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
    let { inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_color } = req.body
    const inv_year = parseInt(req.body.inv_year) || null;
    const inv_price = parseInt(req.body.inv_price) || 0;
    const inv_miles = parseInt(req.body.inv_miles) || 0;
    const classification_id = parseInt(req.body.classification_id) || null;
    const inv_id = parseInt(req.params.invId || req.body.inv_id);
    // Apply defaults if empty
    inv_image = inv_image || '/images/vehicles/no-image.png'
    inv_thumbnail = inv_thumbnail || '/images/vehicles/no-image-tn.png'
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

// Delete Vehicle
invCont.removeVehicle = async function (req, res, next) {
    const inv_id = parseInt(req.params.inv_id)
    
    const oldCar = await invModel.getByInventoryId(inv_id)
    const classes = await invModel.getClassifications()
    let oldClass = ''
    classes.rows.forEach(row => {
        if(row.classification_id === oldCar.classification_id) {
            oldClass = row.classification_name
        }
    })

    const result = await invModel.deleteVehicle(inv_id)

    let nav = await utilities.getNav()
    const classSelect = await utilities.buildClassificationList()

    if (result) {
        req.flash("success", `The ${oldCar.inv_year} ${oldCar.inv_make} ${oldCar.inv_model} was successfully deleted from ${oldClass}.`)
        res.render("inventory/management", {
            title: "Inventory Manager",
            nav,
            messages: req.flash(),
            classSelect
        })
    } else {
        req.flash("error", `Failed to delete the ${oldCar.inv_year} ${oldCar.inv_make} ${oldCar.inv_model} from ${oldClass}.`)
        res.render("inventory/management", {
            title: "Inventory Manager",
            nav,
            messages: req.flash(),
            classSelect
        })
    }
}

module.exports = invCont