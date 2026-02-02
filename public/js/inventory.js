'use strict'
const classList = document.querySelector('#classificationList')
// Get a list of items in inventory based on classification_id
function loadInventoryManagmentByClass() {
    let classification_id = classList.value
    if(!classification_id) return //value not selected

    console.log(`classification_id is: ${classification_id}`)
    let classIdURL = "/inv/getInventory/" + classification_id
    fetch(classIdURL)
    .then(function (response) {
        if (response.ok) {
            return response.json();
        }
        throw Error("Network response was not OK");
    })
    .then(function (data) {
        console.log(data);
        buildInventoryList(data);
    })
    .catch(function (error) {
        console.log('There was an problem: ', error.message)
    })
}

function buildInventoryList(data) {
    console.log("We are in the Inventory List Constructor.")
    let inventoryDisplay = document.getElementById('inventoryDisplay');

    let dataTable = '<thead>';
    dataTable += '<tr><th>Vehicle Name</th><td>&nbsp;</td><td>&nbsp;</tb></tr>';
    dataTable += '</thead>';
    dataTable += '<tbody>';

    data.forEach(function (element) {
        console.log(element.inv_id + ", " + element.inv_model);
        dataTable += `<tr><td>${element.inv_make} ${element.inv_model}</td>`;
        dataTable += `<td><a href='/inv/edit/${element.inv_id}' title='Click to update'>Modify</a></td>`;
        dataTable += `<td><a href='/inv/delete/${element.inv_id} title='Click to delete'>Delete</a></td></tr>`;
    })
    dataTable += '</tbody>';

    inventoryDisplay.innerHTML = dataTable;
}

document.addEventListener("DOMContentLoaded", () => {
    loadInventoryManagmentByClass()
})

classList.addEventListener("change", loadInventoryManagmentByClass)