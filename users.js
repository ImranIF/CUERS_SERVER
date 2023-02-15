const {Router} = require('express') //import Router class
// const db = require('../database')
const router = Router()

const mariadb = require('mysql')  //import mariadb

const conn = mariadb.createConnection({ //allow us to import this file with database connection
    host: 'h1p.h.filess.io',
    port: '3305',
    user: 'CUERS_realenter',
    password: 'f031ad57d5d061a2c1003b21f5d9af7771fbfcce' ,
    database: 'CUERS_realenter'
    // host: 'localhost',
    // user: 'baka',
    // password: 'rickroll123',
    // database: 'ExamRemunerationSystem'
});

router.use((req, res, next) =>{
    console.log('Request made to /USERS Route')
    next()  //needs to go to the middleware
})

// function getConnect(req, res, next){
//     res.json({route: 'Posts'})
//     next()
// }

// router.get('/', (req, res, next) =>{
//     res.status(200).send("this is okay!")
//     next()
// })

router.get('/posts', (req, res) => {
    res.json({ route: 'Posts'})
})

router.post('/', (req, res) =>{ //every http request made to this endpoint, expects a request body, will have both username and password 
    const {email, password, role} = req.body;
    if(email && password){
        try{
        conn.query(`INSERT INTO Login_Info VALUES('${email}', '${password}', '${role}')`)  //create record in database table via query
        res.send({msg: 'Created User!'})
        }
        catch(err){
            console.log(err);
        }
    }
    //req 
})

router.get('/', (req, res) => {
    conn.query('SELECT * from Login_Info', function (err, rows, fields) {
      if (err) throw err;
      console.log(rows);
      res.json({rows})
    //   res.send(`Result: ${rows[0][]}`);
    });
  });


module.exports = router