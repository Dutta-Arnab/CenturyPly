require('dotenv').config()
const express = require("express");
const cors = require('cors');
const cron = require('node-cron');
const fs = require("fs");
const fastcsv = require("fast-csv");
const csvParser = require('csv-parse');
const XLSX = require('xlsx')

const roleRoute = require('./app/role')
const userRoute = require('./app/user')
const prodRoute = require('./app/prod')
const authRoute = require('./app/auth');
const dataRoute = require('./app/data');
const logInRoute = require('./app/logIn');
const { isLoggedIn } = require('./app/middleware/permision');
const { con } = require('./config/db');

// create express app
const app = express();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  return res.send("Home nroute...");
})

app.use('/api/auth', authRoute)
app.use(isLoggedIn)
app.use('/api/role', roleRoute)
app.use('/api/user', userRoute)
app.use('/api/prod', prodRoute)
app.use('/api/data', dataRoute)
app.use('/api/logIn', logInRoute)

//Hourly cron job
cron.schedule('0 * * * *', () => {
  const letsTry = () => {

    const xlData = XLSX.readFile("sampleOne.csv", { type: 'binary' });
    const jsonData = xlData.SheetNames.reduce((sheetData, colData) => {
      const colItem = xlData.Sheets[colData];
      sheetData[colData] = XLSX.utils.sheet_to_json(colItem);
      return sheetData;
    }, {});

    con.query("TRUNCATE TABLE fulldata", (error, result) => {
      if (error) return res.status(401).send("Unable to insert new data")

      const finalData = jsonData.Sheet1;
      //console.log(finalData);
      finalData.map(obj => {
        con.query("INSERT INTO fulldata set ?", obj, (err, res) => {
          if (err) return res.status(401).send("Unable to insert new data")

          console.log("Data Inserted");
        })
      })
    })

  }
  letsTry()
}, {
  scheduleed: true,
  timezone: "Asia/Kolkata"
});

// Setup server port
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`app listening at http://localhost:${PORT}`)
})

//Daily cron job
cron.schedule('0 0 * * *', () => {
  con.query("INSERT INTO branch_master (name) SELECT DISTINCT f.Branch FROM fulldata f, branch_master bm WHERE f.Branch NOT IN (SELECT name FROM branch_master)", (error, result) => {
    if (error) {
      con.query("INSERT INTO errors (resource,error) VALUES ?",["insert Branch corn job","unable to insert Branch"],(err,res)=>{
        if (error) return res.status(401).send("Error occured but Unable to insert Branch")

        return res.status(401).send("Unable to insert Branch")
      })
    }

  })

  con.query("INSERT INTO lob_master (lob) SELECT DISTINCT f.LOB FROM fulldata f, lob_master lm WHERE f.LOB NOT IN (SELECT lob FROM lob_master)", (error, result) => {
    if (error) {
      con.query("INSERT INTO errors (resource,error) VALUES ?",["insert LOB corn job","unable to insert LOB"],(err,res)=>{
        if (error) return res.status(401).send("Error occured but Unable to insert LOB")

        return res.status(401).send("Unable to insert LOB")
      })
    }

  })

  con.query("INSERT INTO territory_master (territory) SELECT DISTINCT f.Territory_Name FROM fulldata f, territory_master tm WHERE f.Territory_Name NOT IN (SELECT lob FROM territory_master)", (error, result) => {
    if (error) {
      con.query("INSERT INTO errors (resource,error) VALUES ?",["insert territory corn job","unable to insert territory"],(err,res)=>{
        if (error) return res.status(401).send("Error occured but Unable to insert Territory")

        return res.status(401).send("Unable to insert Territory")
      })
    }

  })
})
