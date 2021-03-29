"use strict";

const db = require("../db");
const { NotFoundError, BadRequestError } = require("../expressError");
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
        const result = await db.query(`SELECT id from jobs WHERE title = 'j1'`);
        const id = result.rows[0].id;

        const job = await Job.get(id);
        
        expect(job).toEqual({
            id,
            title: 'j1',
            salary: 10000,
            equity: '0.1',
            companyHandle: 'c1'
        });
    });

    test('should throw error if job not found.', async () => {
        try {
            const id = 1000;
            await Job.get(id)
        } catch (error) {
            expect(error).toEqual(new NotFoundError(`No job found with id: 1000.`))    
        }
    });
});

describe('update(id) tests', () => {

    test('should update title, salary, equity. Not id or company_handle.', async () => {
        const updateData = {
            title: 'j1_updated',
            salary: 9999,
            equity: '0.1111'
        }

        const job = await db.query(`SELECT id, company_handle AS "companyHandle" FROM jobs WHERE title = 'j1'`);
        const id = job.rows[0].id;

        const updatedJob = await Job.update(id, updateData);

        // updateData.equity = String(updateData.equity);
        
        expect(updatedJob).toEqual({
            id,
            ...updateData,
            companyHandle: job.rows[0].companyHandle
        });

        const actualJob = await db.query(`SELECT id, title, salary, equity, company_handle AS "companyHandle" FROM jobs WHERE id = $1`, [id]);

        expect(updatedJob).toEqual(actualJob.rows[0]);
    });
    
    test("successful update with null fields", async function () {
        const updateDataNulls = {
            title: 'j1_updated',
            salary: null,
            equity: null
        }

        const job = await db.query(`SELECT id, company_handle AS "companyHandle" FROM jobs WHERE title = 'j1'`);
        const id = job.rows[0].id;

        let updatedJob = await Job.update(id, updateDataNulls);

        expect(updatedJob).toEqual({
            id,
            ...updateDataNulls,
            companyHandle: job.rows[0].companyHandle
        });

        const actualJob = await db.query(`SELECT id, title, salary, equity, company_handle AS "companyHandle" FROM jobs WHERE id = $1`, [id]);

        expect(updatedJob).toEqual(actualJob.rows[0]);
    });

    test('should throw error if job not found.', async () => {
        try {
            const updateData = {
                title: 'j1_updated',
                salary: 9999,
                equity: '0.1111'
            }
            const id = 0;
            await Job.update(id, updateData);
        } catch (error) {
            expect(error).toEqual(new NotFoundError(`No job found with id: 0.`))    
        }
    });

    test('should throw error if no data in request.', async () => {
        try {
            const job = await db.query(`SELECT id, company_handle AS "companyHandle" FROM jobs WHERE title = 'j1'`);
            const id = job.rows[0].id;
            
            await Job.update(id, {})
        } catch (error) {
            expect(error).toEqual(new BadRequestError(`No data`));
        }
    });
});

describe('remove(id) tests', () => {
    
    test('should successfully delete job.', async () => {
        const resp = await db.query(`SELECT id FROM jobs WHERE title = $1`, ['j1']);
        const id = resp.rows[0].id;

        const deadJob = await Job.remove(id);
        expect(deadJob).toBe(undefined);

        const noJob = await db.query(`SELECT * FROM jobs where id = $1`, [id]);
        expect(noJob.rows.length).toBe(0);
    });
    
    test('should throw error if job not found.', async () => {
        try {
            const id = 0;
            await Job.remove(id);
        } catch (error) {
            expect(error).toEqual(new NotFoundError(`No job found with id: 0.`));
        }
    });
});
