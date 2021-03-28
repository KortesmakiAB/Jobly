const { BadRequestError } = require("../expressError");

// Transforms user input into data which will be used for a parameterized query.
  // Converts (JSON) JS keys from req.body to SQL column names. 
  // Converts values from req.body to an array.

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);                                 // req.body
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );
  
  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

function buildQuery(filterArr){
  let qString = `SELECT handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl" FROM companies WHERE`;

  let i = 0;
  for (let arr of filterArr) {
    if (arr[0] === 'name'){
      if (i === 0) qString += (` name ILIKE '%${arr[1]}%'`);
      else qString += (` AND name ILIKE '%${arr[1]}%'`);
    } 

    else if (arr[0] === 'minEmployees'){
      if (i === 0) qString += (` num_employees >= ${arr[1]}`);
      else qString += (` AND num_employees >= ${arr[1]}`);
    } 

    else if (arr[0] === 'maxEmployees'){
      if (i === 0) qString += (` num_employees <= ${arr[1]}`);
      else qString += (` AND num_employees <= ${arr[1]}`);
    } 

    // TODO
    else throw new BadRequestError('Filter categories are "name", "minEmployees", and "maxEmployees".');
    
    i++;
  }

  return qString;
}

module.exports = { sqlForPartialUpdate, buildQuery };
