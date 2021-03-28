const db = require('../db');
const { BadRequestError } = require('../expressError');
const Company = require('./company.js');

beforeAll(async () => {
    await db.query('DELETE FROM companies');

    await db.query(`
        INSERT INTO companies (handle, name, num_employees, description, logo_url)
        VALUES ('test-co9', 'test company 9', 9, 'description for tc 9', NULL),
               ('test-co15', 'Study Networks', 15, 'description for tc 15', NULL),
               ('test-co21', 'test company 21', 21, 'description for tc 21', NULL)
    `);
});

afterEach(async () => {
    await db.query("ROLLBACK");
});

afterAll(async () => {
    await db.end();
})

describe('Company.filterAll() tests.', () => {
    
    test('should filter by name (including partial matches, case insensitive), minEmp (inclusive), maxEmp (inclusive).', async () => {
        const validFilter = {
            name: "net",
            minEmployees: 10,
            maxEmployees: 20
        };

        const filteredCo = await Company.filterAll(validFilter);

        expect(filteredCo).toEqual([{
            handle: "test-co15",
            name: "Study Networks",
            numEmployees: 15,
            description: "description for tc 15",
            logoUrl: null
        }]);
    });

    // test('should throw error/400 if filters provide invalid data types.', async () => {
        // MOVE TO ROUTES TEST
    // });
    
    test('should throw error if minEmployees parameter is greater than the maxEmployees parameter.', async () => {
        try {
            const invalidFilter = {
                minEmployees: 30,
                maxEmployees: 20
            };
            
            await Company.filterAll(invalidFilter);    

        } catch (error) {
            expect(error instanceof BadRequestError).toBeTruthy();
            expect(error).toThrowError(BadRequestError);
            expect(error).toThrowError('maxEmployees must be greater than minEmployees.');
        }
    });
});