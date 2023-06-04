require('dotenv').config();
var host = process.env.HOST;
var port = process.env.PORT;
var user = process.env.USER;
var password = process.env.PASSWORD;
var database = process.env.DATABASE;

console.log(host);

const { Router, query } = require('express'); //import Router class
// const db = require('../database')
const router = Router();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
router.use(cors());
// const app = express();

const mariadb = require('mysql'); //import mariadb
router.use(bodyParser.json());
const conn = mariadb.createConnection({
  //allow us to import this file with database connection
  host: host,
  port: port,
  user: user,
  password: password,
  database: database,
});

router.use((req, res, next) => {
  console.log('Request made to /USERS Route');
  next(); //needs to go to the middleware
});

router.get('/posts', (req, res) => {
  res.json({ route: 'Posts' });
});

// Loading for the first time is not working {}
router.post('/loadTableInfo', (req, res) => {
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
          .filter((item) => item.Key === 'PRI')
          .map((item) => item.Field);
        tempInfo['primaryKeys'] = primaryKeys;
        // getting the types;
        dataTypes = tableDesc[table].reduce((result, { Field, Type }) => {
          result[Field] = Type;
          // console.log("The result is:", result);
          return result;
        }, {});
        tempInfo['dataTypes'] = dataTypes;
        tableInfo[table] = tempInfo;
      }
      res.json(tableInfo);
    })
    .catch((err) => {
      console.error('Error getting table desc: ', err);
      res.status(500).send('Internal server Error');
    });
});

async function loadData(tableName, colName, res) {
  return new Promise((resolve, reject) => {
    // const query = `SELECT * FROM ${tableName}`;
    console.log('colName is:', colName);
    let query = '';
    if (colName) {
      console.log('colName is:', colName);
      query = `SELECT ${colName} FROM ${tableName}`;
    } else {
      query = `SELECT * FROM ${tableName}`;
    }
    console.log('query is:', query);
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
    console.log('Get Table INFO: ', getTableInfo[tableName]);
    console.log('ROWS: ', row);
    let fields = '';
    let val = '';
    for (let key in row) {
      if (row.hasOwnProperty(key)) {
        fields += `\`${key}\`, `;
        if (dataTypes[key].localeCompare('int(11)') == 0) {
          val += `${row[key]}, `;
        } else {
          val += `"${row[key]}", `;
        }
      }
    }
    fields = fields.slice(0, fields.length - 2);
    val = val.slice(0, val.length - 2);
    const query = `INSERT INTO ${tableName} (${fields}) VALUES (${val});`;

    console.log('Insertion', query);
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

async function dropdownData(dropdownChanges) {
  const { tableName, operation, colName, data } = dropdownChanges;
  if (operation === 'load') {
    try {
      let data = [];
      if (colName) {
        data = await loadData(tableName, colName);
        console.log('Loaded data: ', data);
      }
    } catch (err) {
      console.error(err);
      throw new Error('Error loading data');
    }
  } else if (operation === 'insert') {
    try {
      const data = await insertData(tableName);
      console.log('Insertion status: ', data);
      return { msg: 'Added a new row' };
    } catch (err) {
      console.error(err);
      throw new Error('Error inserting data');
    }
  }
}

async function processDropDownData(changes, getTableInfo) {
  console.log('passed tableInfo: ', getTableInfo);
  const { tableName, row, operation, updatedData, colName } = changes;
  if (operation === 'load') {
    try {
      data = await loadData(tableName);
      console.log('Loaded data: ', data);
      return data;
    } catch (err) {
      console.error(err);
      throw new Error('Error loading data');
    }
  } else if (operation === 'insert') {
    try {
      const data = await insertData(tableName, row, getTableInfo);
      console.log('Insertion status: ', data);
      return { msg: 'Added a new row' };
    } catch (err) {
      console.error(err);
      throw new Error('Error inserting data');
    }
  } else if (operation === 'delete') {
    try {
      const data = await deleteData(tableName, row, getTableInfo);
      console.log('Deletion status: ', data);
      return { msg: 'Deleted a row' };
    } catch (err) {
      console.error(err);
      throw new Error('Error deleting data');
    }
  } else if (operation === 'update') {
    try {
      const data = await updateData(tableName, row, updatedData, getTableInfo);
      console.log('Update status: ', data);
      return { msg: 'Updated a row' };
    } catch (err) {
      console.error(err);
      throw new Error('Error updating data');
    }
  }
}

router.post('/dropdownData', (req, res) => {
  const { dropdownChanges } = req.body;
  dropdownChanges(dropdownChanges).then((data) => {
    console.log(data);
    res.json(data);
    res.end();
  });
});

router.get('/', (req, res) => {
  conn.query('SELECT * from Login_Info', function (err, rows, fields) {
    if (err) throw err;
    console.log(rows);
    res.json({ rows });
    //   res.send(`Result: ${rows[0][]}`);
  });
});

module.exports = router;

