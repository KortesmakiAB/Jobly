const { BadRequestError } = require("../expressError");

// Transforms user input into data which will be used for a parameterized query.
  // Converts (JSON) JS keys from req.body to SQL column names. 
  // Converts values from req.body to an array.

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);                                 // req.body
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `${jsToSql[colName] || colName} = $${idx + 1}`,
  );
  
  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

function buildCompanyQuery(filterArr){
  const qObj = {};
  qObj.vals = [];
  qObj.sqlString = `SELECT handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl" FROM companies WHERE`;

  let i = 0;
  for (let arr of filterArr) {
    if (arr[0] === 'name'){
      if (i === 0) qObj.sqlString += (` name ILIKE '%' || $1 || '%'`);
      else qObj.sqlString += (` AND name ILIKE '%' || $1 || '%'`);

      qObj.vals.push(arr[1]);
    } 

    else if (arr[0] === 'minEmployees'){
      if (i === 0) qObj.sqlString += (` num_employees >= $${i + 1}`);
      else qObj.sqlString += (` AND num_employees >= $${i + 1}`);

      qObj.vals.push(arr[1]);
    } 

    else if (arr[0] === 'maxEmployees'){
      if (i === 0) qObj.sqlString += (` num_employees <= $${i + 1}`);
      else qObj.sqlString += (` AND num_employees <= $${i + 1}`);

      qObj.vals.push(arr[1]);
    } 

    else throw new BadRequestError('Filter categories are "name", "minEmployees", and "maxEmployees".');
    
    i++;
  }
  
  return qObj;
}

function buildJobQuery(filterArr){
  const qObj = {};
  qObj.vals = [];
  qObj.sqlString = `SELECT id, title, salary, equity, company_handle AS "companyHandle" FROM jobs WHERE`;
  
  let i=0;
  for(let arr of filterArr){
    if (arr[0] === 'title'){
      // https://stackoverflow.com/questions/58528565/how-do-i-properly-escape-the-single-quote-in-node-postgres-queries
      if (i === 0) qObj.sqlString += (` title ILIKE '%' || $1 || '%'`);
      else qObj.sqlString += (` AND title ILIKE '%' || $1 || '%'`);

      qObj.vals.push(arr[1]);
    } 

    else if (arr[0] === 'minSalary'){
      if (i === 0) qObj.sqlString += (` salary >= $${i + 1}`);
      else qObj.sqlString += (` AND salary >= $${i + 1}`);

      qObj.vals.push(arr[1]);
    } 

    else if (arr[0] === 'hasEquity'){
      if (i === 0) qObj.sqlString += (` equity >= 0`);
      else qObj.sqlString += (` AND equity >= 0`);
    } 

    else throw new BadRequestError('Filter categories are "title", "minSalary", and "hasEquity".');
    
    i++;
  }
  console.log("TEXT----", qObj.sqlString)
  return qObj
}


module.exports = { sqlForPartialUpdate, buildCompanyQuery, buildJobQuery };
