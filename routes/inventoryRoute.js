const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController");
const invValidate = require("../utilities/inventory-validation")
const utilities = require("../utilities")

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));
// Route to build single vehicle detail view
router.get("/detail/:invId", utilities.handleErrors(invController.buildByInventoryId));
//Route to build the vehicle page editor view
router.get("/edit/:invId", utilities.handleErrors(invController.buildVehicleEditor));
//Route to Build Management View
router.get("/", utilities.checkLogin, utilities.checkEmployee, invController.buildManagement);
    // New Classification and New Inventory Routes
    router.get("/classification", invController.buildAddClass)
    router.post("/classification", invValidate.classRules(), invValidate.checkClassificationData, utilities.handleErrors(invController.addClass))
    router.get("/new", invController.buildNewInventoryForm)
    router.post("/new", invValidate.invRules(), invValidate.checkNewInventoryData, utilities.handleErrors(invController.addNewInventory))
    // Route to add confirmation for deletion of inventory items.
    router.get("/delete/:inv_id", utilities.checkLogin, utilities.checkEmployee, utilities.handleErrors(invController.buildDeleteConfirmation))
    // Route to delete inventory items
    router.post("/delete/:inv_id", utilities.checkLogin, utilities.checkEmployee, utilities.handleErrors(invController.removeVehicle));
    router.get("/getInventory/:classification_id", utilities.checkLogin, utilities.handleErrors(invController.getInventoryJSON))
    router.post("/edit/:invId", invValidate.invRules(), invValidate.checkUpdateData, utilities.handleErrors(invController.updateVehicle))

module.exports = router