

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  adminToken,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


/************************************** POST /jobs */

describe('POST /jobs', () => {
   const jobData = {
       title: "testJob1",
       salary: 123456,
       equity: "0.00000001",
       companyHandle: "c1"
   };

    test('should successfully post a job as admin.', async () => {
        const newJob = await request(app)
            .post("/jobs")
            .send(jobData)
            .set("authorization", `Bearer ${adminToken}`);
        
        const dbJob = await db.query(`
            SELECT id, title, salary, equity, company_handle AS "companyHandle"
            FROM jobs
            WHERE title = '${jobData.title}'`);
        const id = dbJob.rows[0].id;

        expect(newJob.statusCode).toBe(201);
        expect(newJob.body.job).toEqual({
            id,
            ...jobData
        });
        expect(newJob.body.job).toEqual(dbJob.rows[0]);
    });

    test('should not allow non-admin (user) to post a job.', async () => {
        const newJob = await request(app)
            .post("/jobs")
            .send(jobData)
            .set("authorization", `Bearer ${u1Token}`);
        
        expect(newJob.statusCode).toBe(401);
    });

    test("unauth for anon user", async function () {
        const resp = await request(app)
            .post("/jobs")
            .send({
              ...jobData,
            });
            
        expect(resp.statusCode).toEqual(401);
        expect(resp.body).toEqual({
          "error": {
            "message": "Unauthorized",
            "status": 401
          }
        });
      });
    
    test("bad request, sending partial data", async function () {
        const resp = await request(app)
            .post("/jobs")
            .send({
                title: "testJob1",
                salary: 123456,
            })
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(400);
    });

    test("bad request with invalid data", async function () {
        const resp = await request(app)
            .post("/jobs")
            .send({
                title: 123456,
                salary: "testJob1",
                equity: null,
                companyHandle: "c100"
            })
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(400);
    });
});

describe("GET /jobs", function () {
    test("gets list of jobs. No auth required.", async function () {
      const resp = await request(app).get("/jobs");
      const jobsResp = resp.body.jobs;

      const j1 = await db.query(`
        SELECT id, title, salary, equity, company_handle AS "companyHandle"
        FROM jobs
        WHERE title = 'j1'`);

      expect(jobsResp.length).toBe(4);
      expect(jobsResp[0].title).toBe("j1");
      expect(jobsResp[0].salary).toBe(10000);
      expect(jobsResp[0].id).toBeTruthy();
      expect(jobsResp[0]).toEqual(j1.rows[0]);
    });
  
    test("fails: test next() handler", async function () {
      // there's no normal failure event which will cause this route to fail ---
      // thus making it hard to test that the error-handler works with it. This
      // should cause an error, all right :)
      await db.query("DROP TABLE jobs CASCADE");
      const resp = await request(app)
          .get("/jobs")
          .set("authorization", `Bearer ${adminToken}`);
      expect(resp.statusCode).toEqual(500);
    });
});

describe('GET /jobs filtering test', () => {
    
    test('should successfully filter title.', async () => {
        const title = "3";
        const qString = `?title=${title}`;
        const filteredJobs = await request(app).get(`/jobs${qString}`);

        expect(filteredJobs.statusCode).toBe(200);
        expect(filteredJobs.body.jobs[0].title).toEqual('j3');
        
        const j3 = await db.query(`
            SELECT id, title, salary, equity, company_handle AS "companyHandle"
            FROM jobs
            WHERE title = 'j3'`);

        expect(filteredJobs.body).toEqual({
            jobs:[{
                ...j3.rows[0]
            }]
        });
    });
    
    test('should successfully filter minSalary.', async () => {
        const salary = 20000;
        const qString = `?minSalary=${salary}`;

        const filteredJobs = await request(app).get(`/jobs${qString}`);

        expect(filteredJobs.statusCode).toBe(200);
        expect(filteredJobs.body.jobs.length).toBe(3);
    });
    
    test('should successfully filter hasEquity.', async () => {
        const equity = true;
        const qString = `?hasEquity=${equity}`;

        const filteredJobs = await request(app).get(`/jobs${qString}`);

        expect(filteredJobs.statusCode).toBe(200);
        expect(filteredJobs.body.jobs.length).toBe(2);
    });
    
    test('should not pass validation if no qString values.', async () => {
        const qString = `?title=&minSalary=&hasEquity=`

        const filteredJobs = await request(app).get(`/jobs${qString}`);

        expect(filteredJobs.statusCode).toBe(400);
        expect(filteredJobs.body).toEqual({
            "error": {
              "message": [
                "instance.title does not meet minimum length of 1",
                "instance.minSalary is not of a type(s) integer",
                "instance.hasEquity is not of a type(s) boolean"
              ],
              "status": 400
            }
          });
    });
});

/************************************** GET /jobs/:id */

describe("GET /jobs/:id", function () {

    test("works for anon user.", async function () {
        const result = await db.query(`
            SELECT id, title, salary, equity, company_handle AS "companyHandle"
            FROM jobs
            WHERE title = 'j1'`);
        const dbJ1 = result.rows[0];

        const job = await request(app).get(`/jobs/${dbJ1.id}`);

        expect(job.body).toEqual({
            job: {
                ...dbJ1
            }
        });
    });
  
    test("should 404 if job does not exist.", async function () {
      const resp = await request(app).get(`/jobs/0`);
      expect(resp.statusCode).toEqual(404);
    });
  });

/************************************** PATCH /jobs/:id */

describe("PATCH /jobs/:id", function () {
    let id;
    
    test("works for admin", async function () {
        const resp = await db.query(`SELECT id FROM jobs WHERE title = 'j1'`);
        id = resp.rows[0].id;
        
        const updateData = {
            title: "j1-updated",
            salary: 1,
            equity: '0'
        };

        const updatedJob = await request(app)
            .patch(`/jobs/${id}`)
            .send(updateData)
            .set("authorization", `Bearer ${adminToken}`);
        
        expect(updatedJob.body).toEqual({
            job: {
                id,
                ...updateData,
                companyHandle: 'c1'
            }
        });
        
        const afterUpdate = await db.query(`SELECT id, title, salary, equity, company_handle AS "companyHandle" FROM jobs WHERE id = $1`, [id]);
        
        expect(afterUpdate.rows[0]).toEqual({
            id,
            ...updateData,
            companyHandle: 'c1'
        });
    });
  
    test("unauth for anon", async function () {
      const resp = await request(app)
          .patch(`/jobs/${id}`)
          .send({
            title: "j1-updated",
          });
      expect(resp.statusCode).toEqual(401);
    });
  
    
    test("unauth for non-admin user", async function () {
      const resp = await request(app)
          .patch(`/jobs/${id}`)
          .send({
            title: "j1-updated",
          })
          .set("authorization", `Bearer ${u1Token}`);
  
      expect(resp.statusCode).toEqual(401);
      expect(resp.body).toEqual({
        "error": {
          "message": "Unauthorized",
          "status": 401
        }
      });
    });
  
    test("should throw error if job does not exist", async function () {
      const resp = await request(app)
          .patch('/jobs/0')
          .send({
            title: "j1-updated",
          })
          .set("authorization", `Bearer ${adminToken}`);
      expect(resp.statusCode).toEqual(404);
    });
  
    test("bad request on id change attempt", async function () {
      const resp = await request(app)
          .patch(`/jobs/${id}`)
          .send({
            id: 8765,
          })
          .set("authorization", `Bearer ${adminToken}`);
      expect(resp.statusCode).toEqual(400);
    });
  
    test("bad request on invalid data", async function () {
      const resp = await request(app)
          .patch(`/jobs/${id}`)
          .send({
            title: 123456,
          })
          .set("authorization", `Bearer ${adminToken}`);
      expect(resp.statusCode).toEqual(400);
    });
});

/************************************** DELETE /jobs/:id */

describe("DELETE /jobs/:id", function () {
    let id;

    test("works for admin", async function () {
        const resp = await db.query(`SELECT id FROM jobs WHERE title = 'j1'`);
        id = resp.rows[0].id;

        const deletedJob = await request(app)
            .delete(`/jobs/${id}`)
            .set("authorization", `Bearer ${adminToken}`);
        expect(deletedJob.body).toEqual({ deleted: String(id) });
    });
  
    test("unauth for anon", async function () {
        const resp = await request(app)
            .delete(`/jobs/${id}`);
        expect(resp.statusCode).toEqual(401);
    });
  
    test("unauth for non-admin user", async function () {
        const resp = await request(app)
            .delete(`/jobs/${id}`)
            .set("authorization", `Bearer ${u1Token}`);
    
        expect(resp.statusCode).toEqual(401);
        expect(resp.body).toEqual({
            "error": {
                "message": "Unauthorized",
                "status": 401
            }
        });
    });
  
    test("not found for non-existent job", async function () {
        const resp = await request(app)
            .delete(`/jobs/0`)
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(404);
    });
  });
  