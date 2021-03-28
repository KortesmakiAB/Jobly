const request = require("supertest");
const app = require("../app");

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

describe('GET /companies filtering test', () => {
    
    test('should successfully filter name.', async () => {
        const name = "3";
        const qString = `?name=${name}`;
        const filteredCos = await request(app).get(`/companies${qString}`);

        expect(filteredCos.statusCode).toBe(200);
        expect(filteredCos.body).toEqual({
            companies:[{
                handle: "c3",
                name: "C3",
                numEmployees: 3,
                description: "Desc3",
                logoUrl: "http://c3.img",
            }]
        });
    });
    
    
    test('should successfully filter min/max.', async () => {
        const min = 2;
        const max = 2;
        const qString = `?minEmployees=${min}&maxEmployees=${max}`

        const filteredCos = await request(app).get(`/companies${qString}`);

        expect(filteredCos.statusCode).toBe(200);
        expect(filteredCos.body.companies.length).toBe(1);
    });
    
    test('should not pass validation if no qString values.', async () => {
        const qString = `?name=&minEmployees=&maxEmployees=`

        const filteredCos = await request(app).get(`/companies${qString}`);

        expect(filteredCos.statusCode).toBe(400);
        expect(filteredCos.body).toEqual({
            "error": {
              "message": [
                "instance.name does not meet minimum length of 1",
                "instance.minEmployees is not of a type(s) integer",
                "instance.maxEmployees is not of a type(s) integer"
              ],
              "status": 400
            }
          });
    });
});

