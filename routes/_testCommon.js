"use strict";

const db = require("../db.js");
const User = require("../models/user");
const Company = require("../models/company");
const { createToken } = require("../helpers/tokens");
const Job = require("../models/job.js");

const testJobIds = [];

async function commonBeforeAll() {
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM users");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM companies");
  
  await db.query("DELETE FROM jobs");
  
  await db.query("DELETE from applications");

  await Company.create(
      {
        handle: "c1",
        name: "C1",
        numEmployees: 1,
        description: "Desc1",
        logoUrl: "http://c1.img",
      });
  await Company.create(
      {
        handle: "c2",
        name: "C2",
        numEmployees: 2,
        description: "Desc2",
        logoUrl: "http://c2.img",
      });
  await Company.create(
      {
        handle: "c3",
        name: "C3",
        numEmployees: 3,
        description: "Desc3",
        logoUrl: "http://c3.img",
      });

  await User.register({
    username: "u1",
    firstName: "U1F",
    lastName: "U1L",
    email: "user1@user.com",
    password: "password1",
    isAdmin: false,
  });
  await User.register({
    username: "u2",
    firstName: "U2F",
    lastName: "U2L",
    email: "user2@user.com",
    password: "password2",
    isAdmin: false,
  });
  await User.register({
    username: "u3",
    firstName: "U3F",
    lastName: "U3L",
    email: "user3@user.com",
    password: "password3",
    isAdmin: false,
  });

  // from solution code
  testJobIds[0] = (await Job.create({
    title: "j1",
    salary: 10000,
    equity: "0.1",
    companyHandle: "c1"
  })).id;
  testJobIds[1] = (await Job.create({
    title: "j2",
    salary: 20000,
    equity: "0.2",
    companyHandle: "c1"
  })).id;
  testJobIds[2] = (await Job.create({
    title: "j3",
    salary: 30000,
    equity: null,
    companyHandle: "c1"
  })).id;
  testJobIds[3] = (await Job.create({
    title: "test4",
    salary: 40000,
    equity: null,
    companyHandle: "c1"
  })).id;

  await db.query(`
    INSERT INTO applications (username, job_id)
    VALUES ('u1', $1),
            ('u1', $2)`,
            [testJobIds[0], testJobIds[1]]
  );
}

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}


const u1Token = createToken({ username: "u1", isAdmin: false });
const adminToken = createToken({ username: "admin", isAdmin: true });


module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  adminToken,
  testJobIds
};
