const Joi = require("joi");
const { v4: uuidv4 } = require('uuid');

const { con } = require('../../config/db')

const validateInput = (data) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(8).max(255).required(),
        name:Joi.string().min(2).max(255).required(),
        isActive: Joi.boolean().required(),
        role_id: Joi.number().required(),
    });


    return schema.validate(data);
};


module.exports.createUser = (req, res) => {
    const { error } = validateInput(req.body);
    if (error) return res.status(400).send(error.details[0].message);


    //User object create
    var userData = {
        email: req.body.email,
        password:req.body.password,
        name: req.body.name,
        isActive: req.body.isActive,
    };

    con.query("SELECT * FROM role WHERE id = ?", req.body.role_id, (error, result) => {
        if (error) return res.status(401).send("Data not fetched");

        // if rloe isn't found
        if (result.length <= 0) return res.status(400).send("Role isn't found");

        //assign role to userData
        userData.role = JSON.stringify(result[0]);

        //save user to db
        con.query("INSERT INTO user set ?", userData, (error, result) => {
            if (error) return res.status(401).send("Data not inserted")

            return res.send("Saved successfully")
        });
    })
}

module.exports.updateUser = (req, res) => {
    const { error } = validateInput(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    //User object create
    var userData = {
        email: req.body.email,
        isActive: req.body.isActive,
    };


    con.query("SELECT * FROM role WHERE id = ?", req.body.role_id, (error, result) => {
        if (error) return res.status(401).send("Data not fetched");

        // if rloe isn't found
        if (result.length <= 0) return res.status(400).send("User isn't found");

        //assign role to userData
        userData.role = JSON.stringify(result[0]);

        //save user to db
        con.query("UPDATE user SET email=?,isActive=?,role=? WHERE id = ?", [userData.email, userData.isActive, userData.role, req.params.id], (error, result) => {
            if (error) return res.status(401).send("Data not updated")

            return res.send("Updated successfully")
        });
    })
}

module.exports.updateStatus = (req, res) => {

    con.query("SELECT isActive FROM user WHERE id = ?", req.params.id, (error, result) => {
        if (error) return res.status(401).send("Data not fetched");

        else {
            let status = JSON.stringify(result[0].isActive);
            if (status == 1) {
                con.query("UPDATE user SET isActive=? WHERE id = ?", [0, req.params.id], (error, result) => {
                    if (error) return res.status(401).send("Data not updated")

                    return res.send("Status Updated successfully")
                });
            }
            else {
                con.query("UPDATE user SET isActive=? WHERE id = ?", [1, req.params.id], (error, result) => {
                    if (error) return res.status(401).send("Data not updated")

                    return res.send("Status Updated successfully")
                });
            }
        }
    })
}


module.exports.findAllUser = (req, res) => {
    con.query("Select * from user", function (error, result) {
        if (error) {
            return res.status(401).send("Data not fetched")
        }
        else {
            res.send(result)
        }
    })
}


module.exports.findUserById = (req, res) => {
    id = req.params.id;
    con.query("Select * from user where id = ?", id, function (error, result) {
        if (error) {
            return res.status(401).send("Data not fetched")
        }
        else {
            res.send(result)
        }
    })
}
