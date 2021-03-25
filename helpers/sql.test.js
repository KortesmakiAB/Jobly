const { sqlForPartialUpdate } = require('./sql');
const { BadRequestError } = require("../expressError");


describe('sqlForPartialUpdate tests', () => {

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