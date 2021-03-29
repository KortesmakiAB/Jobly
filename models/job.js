const db = require("../db");
const { NotFoundError } = require("../expressError");


class Job {

    // static async create()

    // static async findAll()

    static async get(id) {
        try {
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
        } catch (error) {
            return error;
        }

    }
    
    // static async update(id)

    // static async remove(id)
}

module.exports = Job;