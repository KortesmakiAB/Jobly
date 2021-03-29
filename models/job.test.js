"use strict";

const db = require("../db");
const { NotFoundError } = require("../expressError");
const Job = require("./job");

const {
    commonBeforeAll,
    commonBeforeEach,
    commonAfterEach,
    commonAfterAll,
  } = require("./_testCommon");
  
  beforeAll(commonBeforeAll);
  beforeEach(commonBeforeEach);
  afterEach(commonAfterEach);
  afterAll(commonAfterAll);
  

describe('get(id) tests', () => {

    test('should get only 1 job, by id.', async () => {
        const id = await db.query(`SELECT id from jobs WHERE title = 'j1'`);
        
        const job = await Job.get(id.rows[0].id);
        
        expect(job).toEqual({
            id: id.rows[0].id,
            title: 'j1',
            salary: 10000,
            equity: '0.1',
            companyHandle: 'c1'
        });
    });

    test('should throw error if company not found.', async () => {
        const id = 1000;
        const jobFail = await Job.get(id)
        
        expect(jobFail).toEqual(new NotFoundError(`No job with id: ${id}.`))
    });
});
