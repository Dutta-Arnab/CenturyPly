const { con } = require('../../config/db')

module.exports.findAllLOB = (req, res) => {
    con.query("Select * from lob_master", function (error, result) {
        if (error) {
            return res.status(401).send("Data not fetched")
        }
        else {
            res.send(result)
        }
    })
}

module.exports.findAllBranches = (req, res) => {
    con.query("Select * from branch_master", function (error, result) {
        if (error) {
            return res.status(401).send("Data not fetched")
        }
        else {
            res.send(result)
        }
    })
}

module.exports.findAllTerritory = (req, res) => {
    con.query("Select * from territory_master", function (error, result) {
        if (error) {
            return res.status(401).send("Data not fetched")
        }
        else {
            res.send(result)
        }
    })
}

module.exports.findAllProducts = (req, res) => {

    con.query("SELECT DISTINCT Prod_Grp1 FROM `master_data`", function (error, result) {
        if (error) return res.status(401).send("Data not fetched")

        const data = result.map(r => {
            r.parent_id = 0

            return Object.values(r)
        })


        con.query("INSERT INTO products (name, parent_id) VALUES ?", [data], function (error1, result1) {
            if (error1) return res.status(401).send("Unable to add to product")
        })

        return res.send("Data added...");
    })   
}