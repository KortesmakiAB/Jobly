

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

/************************************** POST /companies */

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

    test('should not allow user to post a job.', async () => {
        const newJob = await request(app)
            .post("/jobs")
            .send(jobData)
            .set("authorization", `Bearer ${u1Token}`);
        
        expect(newJob.statusCode).toBe(401);
    });
   
    // test('should successfully post a job as user.', async () => {
        
    // });
    
});
