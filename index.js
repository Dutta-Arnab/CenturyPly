require('dotenv').config()
const express = require("express");
var cors = require('cors')
const roleRoute = require('./app/role')
const userRoute = require('./app/user')
const prodRoute = require('./app/prod')
const authRoute= require('./app/auth');
const dataRoute= require('./app/data');
const logInRoute= require('./app/logIn');
const { isLoggedIn } = require('./app/middleware/permision');

// create express app
const app = express();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  return res.send("Home nroute...");
})

app.use('/api/auth', authRoute)
//app.use(isLoggedIn)
app.use('/api/role', roleRoute)
app.use('/api/user', userRoute)
app.use('/api/prod', prodRoute)
app.use('/api/data',dataRoute)
app.use('/api/logIn',logInRoute)
//app.use('/api/middleware', middlewareRoute)

// Setup server port
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`app listening at http://localhost:${PORT}`)
})