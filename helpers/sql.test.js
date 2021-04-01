const { sqlForPartialUpdate, buildCompanyQuery, buildJobQuery } = require('./sql');
const { BadRequestError } = require("../expressError");


describe('sqlForPartialUpdate() tests', () => {

    const data = { firstName: 'Aliya', age: 32 };
    const jsToSql = { firstName: "first_name", lastName: "last_name" };
        
    test('should successfully return SQL string and array.', () => {
        const result = sqlForPartialUpdate(data, jsToSql);
        
        expect(result).toEqual({
            setCols: 'first_name = $1, age = $2',
            values: [data.firstName, data.age]
        });
    });

    test('should throw BadRequestError if no data provided.', () => {
        const throwBadError = () => sqlForPartialUpdate({}, jsToSql);
        
        expect(throwBadError).toThrowError("No data");
        expect(throwBadError).toThrowError(BadRequestError);
    });
});

describe('buildCompanyQuery() tests', () => {
   
    test('should successfully build company query with all 3 filtering options.', () => {
        const testArr1 = [ [ 'name', 'test1' ], [ 'minEmployees', 10 ], [ 'maxEmployees', 20 ] ];
        const query = buildCompanyQuery(testArr1);

        expect(query.sqlString).toContain('SELECT handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl" FROM companies WHERE');
        expect(query.sqlString).toContain(`name ILIKE '%`);
        expect(query.sqlString).toContain(`num_employees >= $`);
        expect(query.sqlString).toContain(`num_employees <= $`);
        expect(query.sqlString).toContain(`AND`);
        expect(query.vals).toEqual( [ testArr1[0][1], testArr1[1][1], testArr1[2][1] ] );
    });
   
    test('should successfully build query with 1 filtering option, and in a different order than prev test.', () => {
        const testArr2 = [[ 'minEmployees', 10 ]];
        const query = buildCompanyQuery(testArr2);

        expect(query.sqlString).toBe(`SELECT handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl" FROM companies WHERE num_employees >= $1`);
        expect(query.vals).toEqual([10])
    });
    
    test('should throw error with invalid filter key.', () => {
        const invalidKey = [['invalid_key', 'net']];
        const query = () => buildCompanyQuery(invalidKey);

        expect(query).toThrowError(BadRequestError);
        expect(query).toThrowError('Filter categories are "name", "minEmployees", and "maxEmployees".');
    });
});

describe('buildJobQuery() tests', () => {
   
    test('should successfully build parameterized job query with all 3 filtering options.', () => {
        const filterData = [ ['title', 'testJob'], ['minSalary', 9999], ['hasEquity', true]];
        const parameterizedQuery = buildJobQuery(filterData);

        expect(parameterizedQuery.sqlString).toContain(`SELECT id, title, salary, equity, company_handle AS "companyHandle" FROM jobs WHERE`);
        expect(parameterizedQuery.sqlString).toContain(`title ILIKE '%`);
        expect(parameterizedQuery.sqlString).toContain(`salary >= $`);
        expect(parameterizedQuery.sqlString).toContain(`equity >= 0`);
        expect(parameterizedQuery.vals).toEqual( [filterData[0][1], filterData[1][1]] );
    });
    
    test('should successfully build query with 1 filtering option, and in a different order than prev test.', () => {
        const testArr2 = [['hasEquity', true]];
        const parameterizedQuery = buildJobQuery(testArr2);

        expect(parameterizedQuery.sqlString).toContain(`SELECT id, title, salary, equity, company_handle AS "companyHandle" FROM jobs WHERE`);
        expect(parameterizedQuery.sqlString).toContain(`equity >= 0`);
        expect(parameterizedQuery.sqlString).not.toContain('AND');
        expect(parameterizedQuery.vals).toEqual([]);
    });

    test('should throw error with invalid filter key.', () => {
        const invalidKey = ['invalid_key'];
        const query = () => buildJobQuery(invalidKey);

        expect(query).toThrowError(BadRequestError);
        expect(query).toThrowError('Filter categories are "title", "minSalary", and "hasEquity".');
    });
});
