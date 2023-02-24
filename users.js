const { Router, query } = require("express"); //import Router class
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

// Loading for the first time is not working {}
router.post("/loadTableInfo", (req, res) => {
  const { tableNames } = req.body;
  let tableInfo = {};
  let tableDesc = {};
  const promises = tableNames.map((tableName) => {
    return new Promise((resolve, reject) => {
      const query = `desc ${tableName}`;
      conn.query(query, (err, results) => {
        if (err) {
          reject(err);
        } else {
          tableDesc[tableName] = results;
          resolve();
        }
      });
    });
  });
  Promise.all(promises)
    .then(() => {
      // getting the primary keys of each
      const tableInfo = {};
      for (table in tableDesc) {
        const tempInfo = {};
        let primaryKeys = [];
        let dataTypes = {};
        primaryKeys = tableDesc[table]
          .filter((item) => item.Key === "PRI")
          .map((item) => item.Field);
        tempInfo["primaryKeys"] = primaryKeys;
        // getting the types;
        dataTypes = tableDesc[table].reduce((result, { Field, Type }) => {
          result[Field] = Type;
          // console.log("The result is:", result);
          return result;
        }, {});
        tempInfo["dataTypes"] = dataTypes;
        tableInfo[table] = tempInfo;
      }
      res.json(tableInfo);
    })
    .catch((err) => {
      console.error("Error getting table desc: ", err);
      res.status(500).send("Internal server Error");
    });
});

async function loadData(tableName, res) {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM ${tableName}`;
    conn.query(query, function (err, result) {
      if (err) return reject(err);
      const data = Object.values(JSON.parse(JSON.stringify(result)));
      resolve(data);
    });
  });
} 

async function deleteData(tableName, row, getTableInfo) {
  return new Promise((resolve, reject) => {
    const { primaryKeys, dataTypes } = getTableInfo[tableName];

    // creating the query
    let pkLen = primaryKeys.length;
    console.log("PK LEN IS:", pkLen);
    console.log(row[primaryKeys[0]]);
    let pkValueString = "";

    // dataTypes[row[primaryKeys[i]] === "int(11)"
    for (let i = 0; i < pkLen; i++) {
      if(dataTypes[primaryKeys[i]].localeCompare("int(11)")==0 ){
        pkValueString += `${primaryKeys[i]} = ${row[primaryKeys[i]]}`;
      }else{
        pkValueString += `${primaryKeys[i]} = "${row[primaryKeys[i]]}"`;
      }
      if (pkLen - 1 != i) pkValueString += " and ";
    }

    // running the query
    const query = `DELETE FROM ${tableName} WHERE ${pkValueString};`;
    conn.query(query, function (err, result) {
      if (err) return reject(err);
      const data = Object.values(JSON.parse(JSON.stringify(result)));
      resolve(data);
    });
  });
}
async function updateData(tableName, row, updatedData, getTableInfo) {
  return new Promise((resolve, reject) => {
    const { primaryKeys, dataTypes } = getTableInfo[tableName];
    const { colType, value } = updatedData;

    // create the query
    let pkLen = primaryKeys.length;
    console.log("PK LEN IS:", pkLen);
    console.log(row[primaryKeys[0]]);
    let pkValueString = "";
    for (let i = 0; i < pkLen; i++) {
      if(dataTypes[primaryKeys[i]].localeCompare("int(11)")==0 )
        pkValueString += `${primaryKeys[i]} = ${row[primaryKeys[i]]}`;
      else
        pkValueString += `${primaryKeys[i]} = "${row[primaryKeys[i]]}"`;
      if (pkLen - 1 != i) pkValueString += " and ";
    }
    let val = "";
    if (dataTypes[colType].localeCompare("int(11)") == 0) {
      val += `${colType} = ${value}`;
    } else {
      val += `${colType} =  '${value}'`;
    }
    const query = `UPDATE ${tableName} SET ${val} WHERE ${pkValueString};`;

    // run the query
    conn.query(query, function (err, result) {
      if (err) return reject(err);
      const data = Object.values(JSON.parse(JSON.stringify(result)));
      resolve(data);
    });
  });
}

async function insertData(tableName, row, getTableInfo) {
  return new Promise((resolve, reject) => {
    // create the query
    const { dataTypes } = getTableInfo[tableName];
    console.log("Get Table INFO: ", getTableInfo[tableName])
    console.log("ROWS: ", row)
    let fields = "";
    let val = "";
    for (let key in row) {
      if (row.hasOwnProperty(key)) {
        fields += `\`${key}\`, `;
        if (dataTypes[key].localeCompare("int(11)") == 0) {
          val += `${row[key]}, `;
        } else {
          val += `"${row[key]}", `;
        }
      }
    }
    fields = fields.slice(0, fields.length - 2);
    val = val.slice(0, val.length - 2);
    const query = `INSERT INTO ${tableName} (${fields}) VALUES (${val});`;

    console.log("Insertion", query);
    // run the query
    conn.query(query, (err, result) => {
      if (err) {
        reject(err);
      } else {
        const data = Object.values(JSON.parse(JSON.stringify(result)));
        resolve(data);
      }
    });
  });
}

async function processData(changes, getTableInfo) {
  console.log("passed tableInfo: ", getTableInfo);
  const { tableName, row, operation, updatedData } = changes;
  if (operation === "load") {
    try {
      const data = await loadData(tableName);
      return data;
    } catch (err) {
      console.error(err);
      throw new Error("Error loading data");
    }
  } else if (operation === "insert") {
    try {
      const data = await insertData(tableName, row, getTableInfo);
      console.log("Insertion status: ", data);
      return { msg: "Added a new row" };
    } catch (err) {
      console.error(err);
      throw new Error("Error inserting data");
    }
  } else if (operation === "delete") {
    try {
      const data = await deleteData(tableName, row, getTableInfo);
      console.log("Deletion status: ", data);
      return { msg: "Deleted a row" };
    } catch (err) {
      console.error(err);
      throw new Error("Error deleting data");
    }
  } else if (operation === "update") {
    try {
      const data = await updateData(tableName, row, updatedData, getTableInfo);
      console.log("Update status: ", data);
      return { msg: "Updated a row" };
    } catch (err) {
      console.error(err);
      throw new Error("Error updating data");
    }
  }
}

router.post("/processData", (req, res) => {
  const { changes, getTableInfo } = req.body;
  processData(changes, getTableInfo).then((data) => {
    console.log(data);
    res.json(data);
    res.end();
  });
});

router.post("/authenticatelogin", (req, res) => {
  const { evaluator_id, password, role } = req.body;
  console.log(evaluator_id, password, role);
  if (evaluator_id && password) {
    const query = `
        select * from Login_Info
        where evaluator_id = "${evaluator_id}"
        and role = "${role}"
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