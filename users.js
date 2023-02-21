const { Router } = require("express"); //import Router class
// const db = require('../database')
const router = Router();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
router.use(cors());
// const app = express();

const mariadb = require("mysql"); //import mariadb
router.use(bodyParser.json());
const conn = mariadb.createConnection({
  //allow us to import this file with database connection
  host: "h1p.h.filess.io",
  port: "3305",
  user: "CUERS_realenter",
  password: "f031ad57d5d061a2c1003b21f5d9af7771fbfcce",
  database: "CUERS_realenter",
});

router.use((req, res, next) => {
  console.log("Request made to /USERS Route");
  next(); //needs to go to the middleware
});

router.get("/posts", (req, res) => {
  res.json({ route: "Posts" });
});

// the boss object
let tableInfo = {};

function processDB(changes, getTableInfo, res) {
  const { tableName, operation, row, updatedValue } = changes;
  return new Promise((resolve, reject) => {
    // to generate the primary keys and data types only at the loading time
    console.log("Our tableInfo is: ", getTableInfo[tableName]);
    let query;
    // let respondSent = false;
    console.log(operation);
    //**row should be an array of objects that means an array of rows (comma separated value) , should be string.**
    let pkValueString = "";
    if (operation === "update" && operation === "delete") {
      const pkLen = uniquePrimaryKey?.length;
      for (let i = 0; i < pkLen - 1; i++) {
        pkValueString += `${uniquePrimaryKey[i]} = ${row.uniquePrimarykey[i]} and`;
      }
      pkValueString += `${uniquePrimaryKey[pkLen - 1]} = ${
        row.uniquePrimarykey[pkLen - 1]
      }`;
    }
    switch (operation) {
      case "load":
        query = `SELECT * FROM ${tableName}`;
        break;
      case "insert":
        console.log(row);
        let val = "";
        for (let key in row) {
          if (row.hasOwnProperty(key)) {
            val += `${row[key]} ,`;
          }
        }
        val.slice(0, val.length - 1);
        console.log(val);
        query = `INSERT INTO ${tableName} VALUES (${val})`;
        console.log(query);
        break;
      case "update":
        query = `UPDATE ${tableName} SET ${updatedData} WHERE ${pkValueString}`;
        // adding pkValueString
        break;
      case "delete":
        query = `DELETE FROM ${tableName} WHERE ${pkValueString}`;
        break;
      default: {
        res.status(400).send("Invalid action");
      }
    }
    let data = null;
    conn.query(query, function (err, result) {
      // if (err) throw err;
      //result is an array of RowDataPackets. that is why, it is parsed into object
      data = Object.values(JSON.parse(JSON.stringify(result)));
      // data = result;
      console.log(data);
      return res.json(data);
    });
  });
}

router.post("/loadTableInfo", (req, res) => {
  const { tableNames } = req.body;
  console.log(tableNames);
  for (let index = 0; index < tableNames.length; index++) {
    const currTable = tableNames[index];
    let tempTableInfo = {};
    if (tableInfo[currTable] === undefined) {
      let tempRows = [];
      let primaryKeys = [],
        dataTypes = [];
      conn.query(`desc ${currTable}`, function (err, newData) {
        // json ->js
        // newData is an array of RowDataPackets; all rows of a table are instances of same RowDataPacket class - RowDataPacket is a low-level driver library
        // tempRows is assigned the values of the object, parsed from JSON string.

        // generating the primary keys
        tempRows.splice(0, tempRows.length);
        tempRows = Object.values(JSON.parse(JSON.stringify(newData)));
        primaryKeys.splice(0, primaryKeys.length);
        tempRows.filter((a) =>
          a.Key == "PRI" ? primaryKeys.push(a.Field) : 0
        );
        // now primarykeys array has the primary keys
        tempTableInfo["primaryKeys"] = primaryKeys;

        // generating the data types
        console.log("temprows", tempRows);
        dataTypes = tempRows.reduce((result, { Field, Type }) => {
          result[Field] = Type;
          console.log("The result is:" , result);
          return result;
        }, {});
        tempTableInfo["dataTypes"] = dataTypes;
        tableInfo[currTable] = tempTableInfo;
      });
    }
  }
  console.log(tableInfo);
  return res.json(tableInfo);
});



router.post("/processData", (req, res) => {
  const {changes, getTableInfo} = req.body
  const { tableName, row, operation } = changes;
  console.log("table name: ", tableName)
  console.log("Table info from session: ", getTableInfo)
  // console.log("At processDATA", tableInfo[tableName]);
  processDB(changes, getTableInfo, res)
    .then((result) => {
      console.log(result);
    })
    .catch((error) => {
      console.log(error);
    });
});

router.post("/authenticatelogin", (req, res) => {
  const { evaluator_id, password, role } = req.body;
  console.log(evaluator_id, password, role);
  if (evaluator_id && password) {
    const query = `
        select * from Login_Info
        where evaluator_id = "${evaluator_id}"
        `;
    conn.query(query, function (error, data) {
      if (data?.length > 0) {
        for (var count = 0; count < data.length; count++) {
          if (
            data[count].password == password &&
            data[count].role.localeCompare(role) == 0
          ) {
            res.status(200);
            return res.json({ msg: "Correct Password" });
            // res.redirect('/dashboard');
            console.log(data);
          } else if (data[count].password == password) {
            return res.json({ msg: "Incorrect Role" });
          } else {
            return res.json({ msg: "Incorrect Password" });
          }
        }
      } else {
        return res.json({ msg: "Incorrect Evaluator Id" });
      }
      res.end();
    });
  }
});

router.get("/", (req, res) => {
  conn.query("SELECT * from Login_Info", function (err, rows, fields) {
    if (err) throw err;
    console.log(rows);
    res.json({ rows });
    //   res.send(`Result: ${rows[0][]}`);
  });
});

module.exports = router;