//require() returns a function reference
const express = require("express"); //requires the entire express module
const app = express(); //create express application for us

const postsRoute = require("./posts");
const usersRoute = require("./users");
// const pdfGenerationRoute = require("./pdfGeneration");
const cors = require("cors");
app.use(cors());

app.use(express.json()); //register json
app.use(express.urlencoded({ extended: false })); //referencing express module; middleware enabled

app.use("/users", usersRoute);
app.use("/posts", postsRoute);
// app.use("/pdfGeneration", pdfGenerationRoute);

app.listen(3000, () => {
  console.log("Server is running on Port 3000");
});

