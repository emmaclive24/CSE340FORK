const invModel = require("../models/inventory-model")
const Util = {}

// Checking if the car Color will have issues displaying on a white background
const LOW_CONTRAST_COLORS = new Set([ 
  'white',
  'ivory',
  'beige',
  'cream',
  'silver',
  'light gray',
  'light grey',
  'yellow'
])


/* Navigation Unordered List Creation */
Util.getNav = async function (req, res, next) {
    let data = await invModel.getClassifications()
    let list = "<ul>"
    list += '<li><a href="/" title="Home page">Home</a></li>'
    data.rows.forEach((row) => {
        list += "<li>"
        list +=
            '<a href="/inv/type/' +
            row.classification_id +
            '" title="See our inventory of ' +
            row.classification_name +
            ' vehicles!">' +
            row.classification_name +
            "</a>"
        list += "</li>"
    })
    list += "</ul>"
    return list
}

/* Classification View Creation */
Util.buildClassificationGrid = async function(data) {
    let grid
    if(data.length > 0){
        grid = '<ul id="inv-display">'
        data.forEach(vehicle => {
            grid += '<li>'
            grid += '<a href="../../inv/detail/' + vehicle.inv_id
            + '" title="View ' + vehicle.inv_make + ' ' + vehicle.inv_model
            + ' on CSE Motors" />'
            + '<img src="' + vehicle.inv_thumbnail + '" class="vehicle-thumbnail"' + '" alt="' + vehicle.inv_make + ' ' + vehicle.inv_model + ' on CSE Motors" /></a>'
            grid += '<div class="namePrice">'
            grid += '<hr />'
            grid += '<h2>'
            grid += '<a href="../../inv/detail/' + vehicle.inv_id + '" title="View '
            + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">'
            + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
            grid += '</h2>'
            grid += '<span>$'
            + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
            grid += '</div>'
            grid += '</li>'
        })
        grid += '</ul>'
    } else {
        grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
    }
    return grid
}

/* Single Vehicle Details Constructor */
Util.buildVehicleDetails = function(data) {
    const colorName = data.inv_color.toLowerCase()
    const needsContrastFix = LOW_CONTRAST_COLORS.has(colorName)
    let details = '<div id="vehicle-details">'
    if(!data){ // Error Handling if Data is empty or invalid
            details += '<p class="notice">Sorry, no matching vehicle could be found.</p>'
        details += '</div>'
    }
    else if(data.count > 1){ // Error Handling for Multiple Vehicles sharing the same ID
            details += '<p class="notice">Sorry, there seems to be an error, multiple vehicles were found with sharing that ID.</p>'
        details += '</div>'
    }
    else { // Building the vehicles Details Div element
            details += '<img src="' + data.inv_image + '" alt="' + data.inv_make + ' ' + data.inv_model + ' image" />'
            details += '<div id="vehicle-info">'
                details += '<p id="vehicle-price">Price: $' + new Intl.NumberFormat('en-US').format(data.inv_price) + '</p>'
                details += '<p id="vehicle-description">' + data.inv_description + '</p>'
                details += '<ul id="vehicle-specs">'
                 // Capitalizing first letter of color name even after hyphens, underscores, or spaces and displaying color in text, while also formatting low-contrast colors to be more appealing against background
                    details += `<li id="vehicle-color">
                        Color: 
                        <span class="${needsContrastFix ? 'low-contrast' : ''}" style="color: ${colorName === 'rust' ? 'brown' : colorName}">
                            ${data.inv_color.replace(/(?:^|[\s-_])\w/g, c => c.toUpperCase())}
                        </span>
                    </li>`
                    details += '<li id="vehicle-miles">Miles: ' + new Intl.NumberFormat('en-US').format(data.inv_miles) + '</li>'
                    details += '<li id="vehicle-year">Year: ' + data.inv_year + '</li>'
                details += '</ul>'
            details += '</div>'
        details += '</div>'
    }
    return details
}

/* Middleware for Handling Errors, General Error Handling */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = Util