const express = require('express');
const router = express.Router();
const errorCont = require('../controllers/errorController');

// Static Routes
// Set up "public" folder / subfolders for static files
router.use(express.static("public"));
router.use("/css", express.static(__dirname + "public/css"));
router.use("/js", express.static(__dirname + "public/js"));
router.use("/images", express.static(__dirname + "public/images"));

// 500 Error route for testing error handler
router.get('/error', errorCont.triggerError);

module.exports = router;



