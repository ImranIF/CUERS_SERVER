
// const { Router } = require('express') //import Router class
// // const db = require('../database')
// const router = Router()

// const mariadb = require('mysql')  //import mariadb

// const conn = mariadb.createConnection({ //allow us to import this file with database connection
//     host: 'h1p.h.filess.io',
//     port: '3305',
//     user: 'CUERS_realenter',
//     password: 'f031ad57d5d061a2c1003b21f5d9af7771fbfcce',
//     database: 'CUERS_realenter'
//     // host: 'localhost',
//     // user: 'baka',
//     // password: 'rickroll123',
//     // database: 'ExamRemunerationSystem'
// });


// app.post("/authenticatelogin", (req, res) => {
//     console.log(req.body);
//     res.json({ message: "Form data received!" });
// });


// router.post('/authenticatelogin', (req, res) => {
//     const { evaluator_id, password, role } = req.body;
//     console.log(evaluator_id, password, role);
//     // if (evaluator_id && password) {
//     //     try {
//     //         conn.query(`INSERT INTO Login_Info VALUES('${evaluator_id}', '${password}', '${role}')`)  //create record in database table via query
//     //         res.send({ msg: 'Created User!' })
//     //     }
//     //     catch (err) {
//     //         console.log(err);
//     //     }
//     // }
// })