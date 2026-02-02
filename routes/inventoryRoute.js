const express = require("express")
const router = new express.Router()
const invController = require("../controllers/invController");
const invValidate = require("../utilities/inventory-validation")
const utilities = require("../utilities")

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));
// Route to build single vehicle detail view
router.get("/detail/:invId", utilities.handleErrors(invController.buildByInventoryId));
//Route to Build Management View
router.get("/", utilities.checkLogin, utilities.checkEmployee, invController.buildManagement);
    // New Classification and New Inventory Routes
    router.get("/classification", invController.buildAddClass)
    router.post("/classification", invValidate.classRules(), invValidate.checkClassificationData, utilities.handleErrors(invController.addClass))
    router.get("/new", invController.buildNewInventoryForm)
    router.post("/new", invValidate.newInvRules(), invValidate.checkNewInventoryData, utilities.handleErrors(invController.addNewInventory))
    router.get("/getInventory/:classification_id", utilities.checkLogin, utilities.handleErrors(invController.getInventoryJSON))

module.exports = router