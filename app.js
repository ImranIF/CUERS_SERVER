//require() returns a function reference
const express = require('express') //requires the entire express module
const app = express(); //create express application for us
// const cookieParser = require('cookie-parser')   // by default, express will not parse cookie, we need to use it in order for cookie middleware function to be registered to our app
// const session = require('express-session')  //imported Express session, will take care of parsing cookies for us, so cookie-parser will not be needed
const postsRoute = require('./posts')
const usersRoute = require('./users')
const cors = require('cors');
app.use(cors());
// const store = new session.MemoryStore() //MemoryStore class existing in module and we're creating an instance of it
// //use function mounts middleware function at the path which is specified

// app.use(session({
//     secret: 'burn them all', //secret is used to sign the session id cookie
//     cookie: {maxAge: 30000 }, //cookies expires after t duration
//     saveUninitialized: false,    //for login system, otherwise going to generate a unique session id every single time they make a request to the server . no cookie because of this false
//     store   //store : store
// }))
// app.use(cookieParser())
//before reaching callback function, detect json payloads, parse them correctly and attach to res.body
app.use(express.json()) //register json
app.use(express.urlencoded({extended: false})) //referencing express module; middleware enabled

// app.use((req, res, next) =>{    //must invoke the next function
//    // console.log(store)
//     console.log(`${req.method} - ${req.url}`)
//     next();     //invoke the next middleware function
// })   //to register middleware function, use the use method, takes in a function

//middleware function allows separating logic into multiple different functions, invoking each in sequential order. refer to /posts route of post method

app.use('/users', usersRoute)
app.use('/posts', postsRoute)

app.listen(3000, ()=>{
    console.log('Server is running on Port 3000')
})





// const users = [
//     {name: 'Baka', age: 22},
//     {name: 'Kelvin', age: 25},
//     {name: 'Imran', age: 20}
// ]

// const posts = [
//     {title: "My favorite foods"},
//     {title: "My favorite games"}
// ]

// //respond to handle router, GET requests
// //app.get registers a routing method
// //after making get request, we are retrieving resources
// //the endpoint or route that we want to request resources is '/'
// //the callback function will handle every single request that maps to this route
// //callback function has two parameters, the request object and response object
// //the response object has a method send that sends a body back to the client
// app.get('/', (req, res) =>{
//  res.send({
//     msg: "Hello!",
//     user: { }
//  })
// });


// app.post('/',(req, res) =>{
//     const user = req.body
//     users.push(user)
//     console.log(req.body)
//     res.status(201).send('Created User')
// } ) //allow our web server to handle post requests, can also be specified an endpoint to denote sending the post request to


// //custom middleware
// function validateAuthToken(req, res, next){
//     //usually pass in as Header for authorization and authentication
//      // console.log(req.headers)
//     console.log("Inside Valide Auth Token")
//     const { authorization } = req.headers;
//     if(authorization && authorization === '123'){
//         next()
//     }
//     else{
//         res.status(403).send({ msg: 'Forbidden. Incorrect Credentials' })
//     }
// }


// //post request to post route
// // if authorization key were activated and payload is sent, we would be able to enter this last middleware function after validation
// app.post('/posts', validateAuthToken, (req, res) =>{   //mount middleware function to this route
//     // console.log(req.body)
//     const post = req.body;
//     posts.push(post)
//     res.status(201).send(post)
// })


// //get request to /users
// //when we're making a get request, we're asking for resources
// // the /users is the route path
// app.get('/users', (req, res) =>{
//     res.status(200).send(users)
//     //whenever we make a get request at any endpoint, it will send 200 status code if its successful; if endpoint was not found, it sends 404
// } )

// app.get('/posts', (req, res) =>{
//     console.log(req.query);
//     const {title} = req.query;
//     if(title){
//         const post = posts.find((post) => post.title.localeCompare(title) == 0)
//         if(title){
//             res.status(200).send(post);
//         }
//         else res.status(404).send("Not found!")
//     }
//     res.status(200).send(posts)
// })

// app.get('/users/:parameterUser', (req, res) =>{  //endpoints will never change, :parameter can have any value, can be dynamic
//     //instead of defining individual routes for each user, we can define a route parameter and use it as data to retrieve a specific user from the database
//     const {parameterUser} = req.params;
//     console.log(parameterUser.username, parameterUser, req.params);
//     const user = users.find((user) =>  user.name.localeCompare(parameterUser) == 0)
//     if(user){
//         res.status(200).send(user)
//         console.log(user)
//     }
//     else{
//         res.status(404).send("Not found!")
//         console.log("la idiota")
//     }
// })

// function validateCookie(req, res, next){    //invoked first when routed to /protected
//     const {cookies} = req
//     if('session_id' in cookies){ //validate cookie object
//         console.log('Session ID exists.')
//         if(cookies.session_id === '1234567'){
//             next()
//         }
//         else{
//             res.status(403).send({msg: 'Not Authenticated'})
//         }
//     }
//     else{
//         res.status(403).send({msg: 'Not Authenticated'})
//     }

// }


// //every single time user make a request, we wnat to validate the cookie. we want to make sure cookie actually exist
// app.get('/signin', (req, res) =>{   //typically, a sign-in route should be a post request
//     res.cookie('session_id', '123456')    //we don't set cookies on request object. We set it on the response object. when this cookie is generated and validated, we will be able to visit the routed path as authorized
//     res.status(200).json({ msg: "Logged in." })
// })

// //whenever we log in, it's going to send back a cookie and that cookie is going to be the unique id that server generates.
// //good practice is generating a unique session id instead of hardcoding, and save it on the server
// //every time a request is made through the application, we must check to see if the session id is valid

// app.get('/protected', validateCookie, (req, res) =>{ //another route,pretend we are visiting a protected route
//     res.status(200).json({ msg: 'You are authorized!'}) //will work, because we have the cookie session id, but what happens if you delete the cookie and try visitng this route without visiting sign-in route?
// })

// app.post('/login', (req, res) =>{
//     // console.log(req.sessionID)
//     console.log(req.sessionID)
//     const {username, password} = req.body;  //get credentials from request body
//     if(username && password){
//         if(req.session.authenticated){  //if property exists, that means they (we) have logged in
//             res.json(req.session)
//         }else{
//             if(password === '123'){
//                 req.session.authenticated = true    //whenever we successfully login, it modifies the session object and then saves the session into either the database or memory. since session is saved, it also sends to the client
//                 req.session.user = {
//                     username, password
//                 }
//                 res.json(req.session)
//             } else{
//                 res.status(403).json({ msg: 'Bad Credentials'})
//             }
//         }
//     }
//     else
//         res.status(403).json({ msg: 'Bad Credentials'})
// })

// app.listen(3000, ()=>{console.log("Server is running with port 3000")}) //bind web server with our port
