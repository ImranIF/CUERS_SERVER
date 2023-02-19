const { Router } = require("express"); //import Router class
// const db = require('../database')
const router = Router();
const express = require("express");
const bodyParser = require("body-parser");
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
  // host: 'localhost',
  // user: 'baka',
  // password: 'rickroll123',
  // database: 'ExamRemunerationSystem'
});

// const primaryKey = ["evaluator_id", "designation"];
// const editedData = {
//   row: {
//     evaluator_id: 1014,
//     evaluator_name: "Dr. Mohammed Hanif Siddique",
//     designation: "Professor",
//     university_name: "University of Chittagong",
//     dept_name: "Department of Computer Science and Engineering",
//     phone_no: "8801933236173",
//   },
//   changes: [
//     { col: "evaluator_id", data: 4567 },
//     { col: "Designation", data: "Professor" },
//   ],
// };
router.use((req, res, next) => {
  console.log("Request made to /USERS Route");
  next(); //needs to go to the middleware
});

// function getConnect(req, res, next){
//     res.json({route: 'Posts'})
//     next()
// }

// router.get('/', (req, res, next) =>{
//     res.status(200).send("this is okay!")
//     next()
// })

router.get("/posts", (req, res) => {
  res.json({ route: "Posts" });
});

// import and Make dynamic query based on passed data from frontend <- frontend + desc table
// Pass the query through query method of the connection
// What query method returns and how to handle it
// Many types of status codes. why should we use them?
// Why do we need to convert to json before passing data from and to server?
// How to uniquely identify a row in database(the whole row is passed)? desc table
// [{evaluator_id, 3444}, {designation, assistant_prof}]
// handling error got from database and send message based on this error to the frontend

// get evaluators
router.get("/get_evaluators", (req, res) => {
  const query = `select * from Evaluator`;
  conn.query(query, function (error, data) {
    if (data.length >= 0) {
      conn.query("desc Evaluator", function (error, data1) {
        console.log(data1);
      });
      return res.json(data);
      console.log(data);
    }
    res.end();
  });
});

//
router.post("/authenticatelogin", (req, res) => {
  const { evaluator_id, password, role } = req.body;
  console.log(evaluator_id, password, role);
  if (evaluator_id && password) {
    const query = `
        select * from Login_Info
        where evaluator_id = "${evaluator_id}"
        `;
    conn.query(query, function (error, data) {
      if (data.length > 0) {
        for (var count = 0; count < data.length; count++) {
          if (data[count].password == password) {
            res.status(200);
            console.log(data);
            return res.json({ msg: "Correct Password" });
            // res.redirect('/dashboard');
          } else {
            return res.json({ msg: "Incorrect Password" });
          }
        }
      } else {
        return res.json({ msg: "Incorrect Evaluator Id" });
      }
      res.end();
    });
    // try {
    //     conn.query(`INSERT INTO Login_Info VALUES('${evaluator_id}', '${password}', '${role}')`)  //create record in database table via query
    //     res.send({ msg: 'Created User!' })
    //     console.log(role);
    // }
    // catch (err) {
    //     console.log(err);
    // }
  }
});

// router.post('/', (req, res) =>{ //every http request made to this endpoint, expects a request body, will have both username and password
//     const {evaluator_id, password, role} = req.body;
//     if(evaluator_id && password){
//         try{
//         conn.query(`INSERT INTO Login_Info VALUES('${evaluator_id}', '${password}', '${role}')`)  //create record in database table via query
//         res.send({msg: 'Created User!'})
//         }
//         catch(err){
//             console.log(err);
//         }
//     }
//     //req
// })

router.get("/", (req, res) => {
  conn.query("SELECT * from Login_Info", function (err, rows, fields) {
    if (err) throw err;
    console.log(rows);
    res.json({ rows });
    //   res.send(`Result: ${rows[0][]}`);
  });
});

module.exports = router;
