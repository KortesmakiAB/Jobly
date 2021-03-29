const db = require("../db");
const { NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");


class Job {

    // static async create()

    // static async findAll()

    static async get(id) {
        const jobResp = await db.query(
              `SELECT id,
                      title,
                      salary,
                      equity,
                      company_handle AS "companyHandle"
               FROM jobs
               WHERE id = $1`,
            [id]);
    
        const job = jobResp.rows[0];
    
        if (!job) throw new NotFoundError(`No job with id: ${id}.`);
    
        return job;
    }
    
    static async update(id, updateData) {
        const { setCols, values } = sqlForPartialUpdate(updateData, {});                 // (req.body, {no sql to JS conversion needed})

        const id$Idx = "$" + (values.length + 1);

        const sqlQueryTxt = `UPDATE jobs 
                            SET ${setCols} 
                            WHERE id = ${id$Idx} 
                            RETURNING id, title, salary, equity, company_handle AS "companyHandle"`;

        const result = await db.query(sqlQueryTxt, [...values, id]);
        const updatedJob = result.rows[0];

        if (!updatedJob) throw new NotFoundError(`No job found with id ${id}.`);

        return updatedJob;
    }

    // static async remove(id)
}

module.exports = Job;