const pool = require("../database/")
const { get } = require("../routes/static")

/* Return all classifications from the Database */
async function getClassifications() {
    return await pool.query(
        "SELECT * FROM public.classification ORDER BY classification_name"
    )
}

/* Get Inventory Items and classification_name by classification_id */
async function getInventoryByClassificationId(classification_id) {
    try {
        const data = await pool.query(
            `SELECT * FROM public.inventory AS i
            JOIN public.classification AS c
            ON i.classification_id = c.classification_id
            WHERE i.classification_id = $1`,
            [classification_id]
        )
        return data.rows
    } catch (error) {
        console.error("getclassificationsbyid error " + error)
    }
}

async function getByInventoryId(inv_id) {
    try {
        const data = await pool.query(
            `SELECT * FROM public.inventory WHERE inv_id = $1`,
            [inv_id]
        )
        return data.rows[0]
    } catch (error) {
        console.error("getByInventoryId error " + error)
    }
}

async function addClassification(classification_name) {
    try {
        const query = await pool.query(
            `INSERT INTO public.classification VALUES classification_name = $1`,
            [classification_name]
        )
        return query.rowCount === 1;
    } catch (error) {
        console.error("addClassification error " + error)
    }
}

module.exports = { getClassifications, getInventoryByClassificationId, getByInventoryId, addClassification }