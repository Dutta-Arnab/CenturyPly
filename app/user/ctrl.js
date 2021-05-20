const Joi = require("joi");
//const { v4: uuidv4 } = require('uuid');

const { con } = require("../../config/db")

//password added

const validateInput = (data) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        //password: Joi.string().min(8).max(255).required(),
        name: Joi.string().min(2).max(255).required(),
        designation: Joi.string().required(),
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
        name: req.body.name,
        email: req.body.email,
        //password:req.body.password,
        designation: req.body.designation,
        isActive: req.body.isActive,
        role_id: req.body.role_id
    };

    con.query("INSERT INTO user set ?", userData, function (error, result) {
        if (error) {
            console.log("error: ", error);
            return res.status(401).send("Data not inserted")

        }
        else {
            res.send("Saved successfully")
        }
    });

}

module.exports.updateUser = (req, res) => {
    const { error } = validateInput(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    //User object create
    var userData = {
        email: req.body.email,
        name: req.body.name,
        designation: req.body.designation,
        isActive: req.body.isActive,
        role_id: req.body.role_id
    };

    con.query("UPDATE user SET email=?,isActive=?,name=?,designation=?,role_id=? WHERE id = ?", [userData.email, userData.isActive, userData.name, userData.designation, userData.role_id, req.params.id], (error, result) => {
        if (error) return res.status(401).send("Data not updated")
        //***error is not working when the user id is entered wrong */
        return res.send("Updated successfully")
    });
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
    con.query("SELECT u.id, u.name, u.email, u.Designation,u.role_id, r.name as Role_Name, lm.lob as LOB_Name, bm.name as Branch_Name, tm.territory as Territory_Name FROM user u JOIN role r on u.role_id=r.id JOIN role_lob rl ON r.id=rl.role_id JOIN role_branch rb ON r.id=rb.role_id JOIN role_territory rt ON r.id=rt.role_id JOIN lob_master lm ON rl.lob_id=lm.id JOIN branch_master bm ON rb.branch_id=bm.id JOIN territory_master tm ON rt.territory_id=tm.id", function (error, result) {
        if (error) return res.status(401).send("Data not fetched")

        const userList = []
        result.map(rs => {
            if (userList.filter(ul => ul.id === rs.id).length <= 0)
                userList.push({
                    id: rs.id,
                    name: rs.name,
                    email: rs.email,
                    Designation: rs.Designation,
                    role_id: rs.role_id
                })

            userList.map((user, i) => {
                if (!userList[i].LOB) userList[i].LOB = []
                if (!userList[i].branches) userList[i].branches = []
                if (!userList[i].territory) userList[i].territory = []

                if (userList[i].LOB.filter(lob => lob === rs.LOB_Name).length <= 0) userList[i].LOB.push(rs.LOB_Name)

                if (userList[i].branches.filter(branch => branch === rs.Branch_Name).length <= 0) userList[i].branches.push(rs.Branch_Name)

                if (userList[i].territory.filter(lob => lob === rs.Territory_Name).length <= 0) userList[i].territory.push(rs.Territory_Name)
            })
        })
        res.send(userList)
    })
}


module.exports.findUserById = (req, res) => {
    id = req.params.id;
    con.query("SELECT u.id, u.name, u.email, u.Designation,u.role_id, u.isAdmin, r.name as Role_Name, lm.lob as LOB_Name, bm.name as Branch_Name, tm.territory as Territory_Name FROM user u JOIN role r on u.role_id=r.id JOIN role_lob rl ON r.id=rl.role_id JOIN role_branch rb ON r.id=rb.role_id JOIN role_territory rt ON r.id=rt.role_id JOIN lob_master lm ON rl.lob_id=lm.id JOIN branch_master bm ON rb.branch_id=bm.id JOIN territory_master tm ON rt.territory_id=tm.id where u.id = ?", id, function (error, result) {
        if (error) return res.status(401).send("Data not fetched")

        const user = {};

        // const newUser = {
        //     name: "",
        //     email: "",
        //     designation: "",
        //     role: {
        //         id: 1,
        //         name: "",
        //         lob: [],
        //         branch: [],
        //         territory: [],
        //         isAdmin: 0
        //     }
        // }

        result.map(rs => {
            if (rs.id !== user.id) user.id = rs.id
            if (rs.name !== user.name) user.name = rs.name
            if (rs.email !== user.email) user.email = rs.email
            if (rs.Designation !== user.Designation) user.Designation = rs.Designation
            if (rs.isAdmin !== user.isAdmin) user.isAdmin = rs.isAdmin

            if(!user.role) user.role={}
            if (rs.role_id !== user.role.role_id) user.role.role_id = rs.role_id
            if (!user.role.LOB) user.role.LOB = []
            if (!user.role.branches) user.role.branches = []
            if (!user.role.territory) user.role.territory = []

            if (user.role.LOB.filter(lob => lob === rs.LOB_Name).length <= 0) user.role.LOB.push(rs.LOB_Name)

            if (user.role.branches.filter(branch => branch === rs.Branch_Name).length <= 0) user.role.branches.push(rs.Branch_Name)

            if (user.role.territory.filter(lob => lob === rs.Territory_Name).length <= 0) user.role.territory.push(rs.Territory_Name)
        })
        res.send(user)

    })
}

module.exports.getCurrentUser = async (req, res) => {
    const id = res.currentUser.id;

    con.query("Select * from user where id = ?", id, function (error, result) {
        if (error) {
            console.log(error);
            return res.status(401).send("Data not fetched");
        } else {
            res.send(result);
        }
    });
};