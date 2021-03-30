const db = require("../db");
const { NotFoundError } = require("../expressError");
const { sqlForPartialUpdate, buildJobQuery } = require("../helpers/sql");


class Job {

    static async create(userDataObj) {
        const { title, salary, equity, companyHandle } = userDataObj;
     

        const newJob = await db.query(`INSERT INTO jobs (title, salary, equity, company_handle)
                                        VALUES ($1,$2,$3,$4)
                                        RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
                                        [title, salary, equity, companyHandle]);
        
        return newJob.rows[0];
    }

    static async findAll() {

        const allJobs = await db.query(`SELECT id, title, salary, equity, company_handle AS "companyHandle" 
                                        FROM jobs`);

        return allJobs.rows;
    }

    static async filterAll(filterData){
        
        const queryObj = buildJobQuery(Object.entries(filterData));

        const filteredJobs = await db.query(queryObj.sqlString, queryObj.vals);
        
        return filteredJobs.rows;
    }

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
    
        if (!job) throw new NotFoundError(`No job found with id: ${id}.`);
    
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

        if (!updatedJob) throw new NotFoundError(`No job found with id: ${id}.`);

        return updatedJob;
    }

    static async remove(id) {
        const result = await db.query(
            `DELETE
             FROM jobs
             WHERE id = $1
             RETURNING id`,
          [id]);
      const job = result.rows[0];
  
      if (!job) throw new NotFoundError(`No job found with id: ${id}.`);
    }
}

module.exports = Job;