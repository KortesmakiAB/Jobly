const { sqlForPartialUpdate, buildQuery } = require('./sql');
const { BadRequestError } = require("../expressError");
const e = require('express');


describe('sqlForPartialUpdate() tests', () => {

    const data = { firstName: 'Aliya', age: 32 };
    const jsToSql = { firstName: "first_name", lastName: "last_name" };
        
    test('should successfully return SQL string and array.', () => {
        const result = sqlForPartialUpdate(data, jsToSql);
        
        expect(result).toEqual({
            setCols: '"first_name"=$1, "age"=$2',
            values: [data.firstName, data.age]
        });
    });

    test('should throw BadRequestError if no data provided.', () => {
        const throwBadError = () => sqlForPartialUpdate({}, jsToSql);
        
        expect(throwBadError).toThrowError("No data");
        expect(throwBadError).toThrowError(BadRequestError);
    });
});

describe('buildQuery() test', () => {
    const testArr1 = [ [ 'name', 'test1' ], [ 'minEmployees', 10 ], [ 'maxEmployees', 20 ] ];
   
    test('should successfully build query string.', () => {
        const query = buildQuery(testArr1);

        expect(query).toContain(`name ILIKE '%${testArr1[0][1]}%'`);
        expect(query).toContain(`num_employees >= ${testArr1[1][1]}`);
        expect(query).toContain(`num_employees <= ${testArr1[2][1]}`);
    });
   
    const testArr2 = [[ 'minEmployees', 10 ]];
   
    test('should successfully build query string.', () => {
        const query = buildQuery(testArr2);

        expect(query).toBe(`SELECT handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl" FROM companies WHERE num_employees >= ${testArr2[0][1]}`);
    });
    
    test('should throw successfully build query string.', () => {
        const invalidKey = [['invalid_key', 'net']];
        const query = () => buildQuery(invalidKey);

        expect(query).toThrowError(BadRequestError);
        expect(query).toThrowError('Filter categories are "name", "minEmployees", and "maxEmployees".');
    });
});
