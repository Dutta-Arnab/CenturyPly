//const { v4: uuidv4 } = require('uuid');
const Joi = require("joi");

const { con } = require('./../../config/db')

const validateInput = (data) => {
    const schema = Joi.object({
        name: Joi.string().trim(true).min(2).max(255).required(),
        lob: Joi.array().items({
            id: Joi.number().required(),
            name: Joi.string().min(2).max(255).required(),
        }).required(),
        branches: Joi.array().items({
            id: Joi.number().required(),
            name: Joi.string().min(2).max(255).required(),
        }).required(),
    });

    return schema.validate(data);
};




module.exports.createRole = (req, res) => {
    const { error } = validateInput(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    //Role object create
    var roleData = {
        name: req.body.name,
        lob: JSON.stringify(req.body.lob),
        branches: JSON.stringify(req.body.branches)
    };

    con.query("INSERT INTO role set ?", roleData, function (error, result) {
        if (error) {
            console.log("error: ", error);
            return res.status(401).send("Data not inserted")

            // result(err, null);
        }
        else {
            res.send("Saved successfully")
            //console.log(res.insertId);
            // result(null, res.insertId);
        }
    });
}



module.exports.findAllRole = (req, res) => {
    //return res.send("WORKING....");

    con.query("Select * from role", function (error, result) {
        if (error) {
            return res.status(401).send("Data not fetched")
            // console.log("error: ", err);
            // result(err, null);
        }
        else {
            //console.log(result);
            res.send(result)
            //console.log(res.insertId);
            // result(null, res.insertId);
        }
    })
}

module.exports.findRoleById = (req, res) => {

    id = req.params.id;
    // console.log(id);
    con.query("Select * from role where id = ?", id, function (error, result) {
        if (error) {
            return res.status(401).send("Data not fetched")
            // console.log("error: ", err);
            // result(err, null);
        }
        else {
            //console.log(result);
            res.send(result)
            //console.log(res.insertId);
            // result(null, res.insertId);
        }
    })
}

module.exports.updateRole = (req, res) => {
    const { error } = validateInput(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    var roleData = {
        name: req.body.name,
        lob: JSON.stringify(req.body.lob),
        branches: JSON.stringify(req.body.branches)
    };
    console.log("*********", req.body.name);
    con.query("UPDATE role SET name=?,lob=?,branches=? WHERE id = ?", [roleData.name, roleData.lob, roleData.branches, req.params.id], function (error, result) {
        if (error) {
            console.log("error: ", error);
            //result(null, err);
        } else {
            res.send(result)
        }
    });
}

module.exports.deleteRole = (req, res) => {
    id = req.params.id;
    console.log(id);

    con.query("DELETE FROM role WHERE id = ?", [id], function (error, result) {
        if (error) {
            console.log("error: ", error);
            return res.status(401).send("Data not deleted")
        }
        else {
            if (result.affectedRows > 0) {
                res.send("Succesfully deleted")
            }
            else {
                res.send("This id is already deleted")
            }
        }
    })



}
