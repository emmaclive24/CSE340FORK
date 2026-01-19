const utilities = require("../utilities")

exports.triggerError = async function (req, res, next) {
    next(new Error('Intentional 500 Server Error'))
}