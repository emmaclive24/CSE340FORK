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

Util.buildFilterControl = async function (classification_ids, prevFilters={} ) {
    let empty = true // default
    let combinedColumns = new Set()

    for (const id of classification_ids) {
        const { isEmpty, columns } = await invModel.getFilterOptions(id)
        empty = empty && isEmpty
        if (columns && Array.isArray(columns)) {
            columns.forEach(col => combinedColumns.add(col))
        }
    }
    const columns = Array.from(combinedColumns)

    const MAX_COLUMNS = [ 'inv_price', 'inv_miles' ] 
    const MIN_COLUMNS = [ 'inv_year' ]
    
    filters = `<form action="/inv/type/${classification_ids}" method='get'>`

    if (empty) filters += `<p>That Classification is empty, select a new classification(s)</p>`
    else { filters += `<p>Filter by field or Search by Column</p>` }
    columns.forEach(key => {
        if (key === "inv_id" || key === "classification_id" || key === "inv_image" || key === "inv_thumbnail") return;

        const cleanKey = key.replace("inv_", "").replace(/\b\w/g, c => c.toUpperCase());
        const currentValue = prevFilters[key + '_filter'] || ''
        console.log("Current Value: ", currentValue)

        filters += `<div class="filter_row">`
            filters += `<label for="${key}_filter">${cleanKey}</label>`
            if (MAX_COLUMNS.includes(key)) {
                filters += `<input type="number" name="${key}_filter" id="${key}_filter" placeholder="Max ${cleanKey}" value="${currentValue}">`
                filters += `<fieldset><legend>Organize Results by ${cleanKey} Ascending or Descending</legend>`
                    filters += `<input type="radio" name="sort_by" value="${key}_asc" id="${key}_asc" ${filters.sort_by === `${key}_asc` ? 'checked' : ''}><label for="${key}_asc">Asc</label>`;
                    filters += `<input type="radio" name="sort_by" value="${key}_desc" id="${key}_desc" ${filters.sort_by === `${key}_desc` ? 'checked' : ''}><label for="${key}_desc">Desc</label>`;
                filters += `</fieldset>`
            } else if (MIN_COLUMNS.includes(key)) {
                filters += `<input type="number" name="${key}_filter" id="${key}_filter" placeholder="Minimum ${cleanKey}" value="${currentValue}">`
                filters += `<fieldset><legend>Organize Results by ${cleanKey} Ascending or Descending</legend>`
                    filters += `<input type="radio" name="sort_by" value="${key}_asc" id="${key}_asc" ${filters.sort_by === `${key}_asc` ? 'checked' : ''}><label for="${key}_asc">Asc</label>`;
                    filters += `<input type="radio" name="sort_by" value="${key}_desc" id="${key}_desc" ${filters.sort_by === `${key}_desc` ? 'checked' : ''}><label for="${key}_desc">Desc</label>`;
                filters += `</fieldset>`
            } else {
                filters += `<input type="text" name="${key}_filter" id="${key}_filter" placeholder="Keywords in ${cleanKey}" value="${currentValue}">`
            }
        filters += `</div>`
    })
    let classes = await invModel.getClassifications()
    let classCheck = `<ul class="class_checkbox_ul"><fieldset><fieldset><legend>Vehicle Classifications:</legend>`
    classes.rows.forEach(row => {
        const isChecked = classification_ids.includes(row.classification_id) ? 'checked' : ''
        classCheck += `
        <li>
            <label for="class_${row.classification_id}">
                ${row.classification_name}
                <input
                    type="checkbox" 
                    id="class_${row.classification_id}" 
                    value="${row.classification_id}" 
                    ${isChecked}
                    title="Filter for ${row.classification_name} vehicles"
                    name="classification_ids[]"
                >
            </label>
        </li>`
    })
    classCheck += `</ul></fieldset>`
    filters += classCheck
    filters += `<button type="submit">Apply Filters</button>`
    filters += `</form>`

    return filters
}
/* Classification View Creation */
Util.buildClassificationGrid = async function(data) {
    let grid
    if(data.length > 0){
        grid = '<ul id="inv-display">'
        data.forEach(vehicle => {
            grid += '<li class="grid-detail">'
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

/* Classification Drop Down for Add Inventory */
Util.buildClassificationList = async function (classification_id = null) { 
    let data = await invModel.getClassifications()
    let classificationList =
      '<select name="classification_id" id="classificationList" required>'
    classificationList += "<option value=''>Choose a Classification</option>"
    data.rows.forEach((row) => {
      classificationList += '<option value="' + row.classification_id + '"'
      if (
        classification_id != null &&
        row.classification_id == classification_id
      ) {
        classificationList += " selected "
      }
      classificationList += ">" + row.classification_name + "</option>"
    })
    classificationList += "</select>"
    return classificationList
  }

/* Middleware for Handling Errors, General Error Handling */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

/* Check Login */
Util.checkLogin = (req, res, next) => {
    console.log("Checking Login");
    if (res.locals.loggedin) {
        console.log("account Data: ", res.locals.accountData);
        if (res.locals.accountData.account_type.toLowerCase() != 'client') {
            res.locals.employee = true;
        } else {
            res.locals.employee = false;
        }
        next()
    } else {
        req.flash("notice", "Please log in.")
        return res.redirect("/account/login")
    }
}

Util.checkEmployee = (req, res, next) => {
    console.log("Checking Employee Status", res.locals.employee);
    if (res.locals.employee) {
        next()
    } else {
        req.flash("notice", "Area is off limits to non-employee's.");
        return res.redirect("/account/login");
    }
}

module.exports = Util