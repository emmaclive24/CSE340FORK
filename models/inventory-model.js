const pool = require("../database/")
const { get } = require("../routes/static")

/* Return all classifications from the Database */
async function getClassifications() {
    return await pool.query(
        "SELECT * FROM public.classification ORDER BY classification_id"
    )
}

/* Get Inventory Items and classification_name by classification_id */
async function getInventoryByClassificationId(classification_ids = [], filters = {}) {
    const FILTER_RULES = {
        inv_make: "text",
        inv_model: "text",
        inv_description: "text",
        inv_color: "text",
        inv_price: "max",
        inv_miles: "max",
        inv_year: "min",
    };
    try {
        console.log("classification_ids (in Model): ", classification_ids)
        if (!classification_ids.length) return [];

        let queryText = `
            SELECT * FROM public.inventory AS i
            JOIN public.classification AS c
            ON i.classification_id = c.classification_id
            WHERE i.classification_id = ANY($1)`;
        const queryParams = [classification_ids]
        let paramIndex = 2;

        for (const [key, value] of Object.entries(filters)) {
            if (!value || key === "sort_by" || key === "classification_ids" || !FILTER_RULES[key.replace("_filter", "")]) continue; // Exclusions
            const column = key.replace("_filter", "") // matching database
            const rule = FILTER_RULES[column] // dividing rules

            if (rule === "text") {
                queryText += ` AND i.${column} ILIKE $${paramIndex}` // Find Matching values in the column
                queryParams.push(`%${value}%`)
            }
            if (rule === "max") {
                queryText += ` AND i.${column} <= $${paramIndex}` // Only grabbing values greater or equal to input in the column
                queryParams.push(Number(value))
            }
            if (rule === "min") {
                queryText += ` AND i.${column} >= $${paramIndex}` // Only grabbing values less than or equal to input from the column
                queryParams.push(Number(value))
            }

            paramIndex++;
        }

        if (filters.sort_by) {
            const [sort_head, sortColumn, sortOrder] = filters.sort_by.split("_");
            queryText += ` ORDER BY i.${sort_head + "_" + sortColumn} ${sortOrder.toUpperCase()}`;
        }
        console.log("Query Params: ", queryParams)
        const data = await pool.query(queryText, queryParams)
        return data.rows
    } catch (error) {
        console.error("getclassificationsbyid error " + error)
        return [];
    }
}

async function getFilterOptions(classification_id) {
    try {
        const result = await pool.query(
            `SELECT * FROM public.inventory WHERE classification_id = $1 LIMIT 1`,
            [classification_id]
        );
        if (result.rows.length === 0) {
            return { isEmpty:true, columns: [] }
        }
        const columns = Object.keys(result.rows[0])
        return { isEmpty: false, columns }
    } catch (error) {
        console.error("FilterOptions Error: ", error)
        return { isEmpty: true, columns: [] }
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
            `INSERT INTO public.classification (classification_name) VALUES ($1)`,
            [classification_name]
        )
        return query.rowCount === 1;
    } catch (error) {
        console.error("addClassification error " + error)
    }
}

async function addNewVehicle(inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id) {
    try {
        const query = await pool.query(
            `INSERT INTO public.inventory (
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
            )
            VALUES (
                $1,
                $2,
                $3,
                $4,
                $5,
                $6,
                $7,
                $8,
                $9,
                $10
            )`,
            [inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id]
        )
        return query.rowCount === 1;
    } catch (error) {
        console.error("addNewVehicle error " + error)
    }
}

async function updateVehicle(inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id, inv_id) {
    try {
        console.log("InvModel: Data: ", {inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id, inv_id})
        console.log("inv_id isInteger: ", Number.isInteger(inv_id));
        const query = await pool.query(
            `Update public.inventory SET
                inv_make = $1,
                inv_model = $2,
                inv_year = $3,
                inv_description = $4,
                inv_image = $5,
                inv_thumbnail = $6,
                inv_price = $7,
                inv_miles = $8,
                inv_color = $9,
                classification_id = $10
            WHERE inv_id = $11`,
            [inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id, inv_id]
        )
        console.log("Query: ", query);
        return query.rowCount === 1;
    } catch (error) {
        console.error("updateVehicle error " + error)
    }
}

async function deleteVehicle(inv_id) {
    try {
        const sql = 'DELETE FROM inventory WHERE inv_id = $1'
        const data = await pool.query(sql, [inv_id])
        return data.rowCount
    } catch (error) {
        console.error("deleteVehicle error " + error)
    }
}

module.exports = { getClassifications, getFilterOptions, getInventoryByClassificationId, getByInventoryId, addClassification, addNewVehicle, updateVehicle, deleteVehicle }