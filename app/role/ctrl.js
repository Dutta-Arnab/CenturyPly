const { func } = require("joi");
const Joi = require("joi");

const { con } = require('./../../config/db')

const validateInput = (data) => {
    const schema = Joi.object({
        name: Joi.string().trim(true).min(2).max(255).required(),
        lob: Joi.array().items({
            id: Joi.number().required()
        }).required(),
        branch: Joi.array().items({
            id: Joi.number().required()
        }).required(),
        territory: Joi.array().items({
            id: Joi.number().required()
        }).required()
    });

    return schema.validate(data);
};

//====>>>>Create Role
module.exports.createRole = (req, res) => {
    const { error } = validateInput(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    //Role object create
    const roleData = {
        name: req.body.name,
        lob: JSON.stringify(req.body.lob),
        branch: JSON.stringify(req.body.branch),
        territory: JSON.stringify(req.body.territory)
    };

    con.query("INSERT INTO role set ?", roleData, function (error, result) {
        if (error) {
            return res.status(401).send("Data not inserted in role table")
        }
        else {
            const newID = result.insertId;

            const lobs = JSON.parse(roleData.lob);
            const branchs = JSON.parse(roleData.branch);
            const territorys = JSON.parse(roleData.territory);

            lobs.map(l => {
                con.query(`INSERT INTO role_lob (role_id, lob_id) VALUES(${newID}, ${l.id})`, function (err, result) {
                    if (err) return res.status(401).send("Data not inserted in role_lob table")

                })
            })

            branchs.map(b => {
                con.query(`INSERT INTO role_branch (role_id, branch_id) VALUES(${newID}, ${b.id})`, function (err, result) {
                    if (err) return res.status(401).send("Data not inserted in role_branch table")

                })
            })

            territorys.map(t => {
                con.query(`INSERT INTO role_territory (role_id, territory_id) VALUES(${newID}, ${t.id})`, function (err, result) {
                    if (err) return res.status(401).send("Data not inserted in role_territory table")

                })
            })
            res.send("Saved Succesfully")
        }
    });
}

//====>>>>Find All Role
module.exports.findAllRole = (req, res) => {

    con.query("SELECT DISTINCT r.id as Role_id, r.name as Role_Name, lm.lob as LOB_Name, bm.name as Branch_Name, tm.territory as Territory_Name FROM role r JOIN role_lob rl ON r.id=rl.role_id JOIN role_branch rb ON r.id=rb.role_id JOIN role_territory rt ON r.id=rt.role_id JOIN lob_master lm ON rl.lob_id=lm.id JOIN branch_master bm ON rb.branch_id=bm.id JOIN territory_master tm ON rt.territory_id=tm.id", function (error, result) {
        if (error) return res.status(401).send("Data not fetched")

        const roleList = []

        result.map(rs => {
            if (roleList.filter(role => role.id === rs.Role_id).length <= 0) roleList.push({
                id: rs.Role_id,
                name: rs.Role_Name
            })

            roleList.map((role, i) => {
                if (!roleList[i].LOB) roleList[i].LOB = []
                if (!roleList[i].branches) roleList[i].branches = []
                if (!roleList[i].territorys) roleList[i].territorys = []

                if (roleList[i].LOB.filter(lob => lob === rs.LOB_Name).length <= 0) roleList[i].LOB.push(rs.LOB_Name)

                if (roleList[i].branches.filter(branch => branch === rs.Branch_Name).length <= 0) roleList[i].branches.push(rs.Branch_Name)

                if (roleList[i].territorys.filter(t => t === rs.Territory_Name).length <= 0) roleList[i].territorys.push(rs.Territory_Name)


            })
        })
        res.send(roleList)
    })
}

//====>>>> Find Role By ID
module.exports.findRoleById = (req, res) => {
    const id = req.params.id;

    con.query("SELECT DISTINCT r.id as Role_id, r.name as Role_Name, lm.lob as LOB_Name, bm.name as Branch_Name, tm.territory as Territory_Name FROM role r JOIN role_lob rl ON r.id=rl.role_id JOIN role_branch rb ON r.id=rb.role_id JOIN role_territory rt ON r.id=rt.role_id JOIN lob_master lm ON rl.lob_id=lm.id JOIN branch_master bm ON rb.branch_id=bm.id JOIN territory_master tm ON rt.territory_id=tm.id WHERE r.id=?", id, function (error, result) {
        if (error) return res.status(401).send("Data not fetched")

        const resultRole = {}

        result.map(rs => {
            if (rs.Role_id !== resultRole.id) resultRole.id = rs.Role_id
            if (rs.Role_Name !== resultRole.name) resultRole.name = rs.Role_Name

            if (!resultRole.LOB) resultRole.LOB = []
            if (!resultRole.branches) resultRole.branches = []
            if (!resultRole.territorys) resultRole.territorys = []

            if (resultRole.LOB.filter(lob => lob === rs.LOB_Name).length <= 0) resultRole.LOB.push(rs.LOB_Name)

            if (resultRole.branches.filter(branch => branch === rs.Branch_Name).length <= 0) resultRole.branches.push(rs.Branch_Name)

            if (resultRole.territorys.filter(t => t === rs.Territory_Name).length <= 0) resultRole.territorys.push(rs.Territory_Name)
        })
        res.send(resultRole)
    })
}
//====>>>>Update Role
module.exports.updateRole = (req, res) => {
    const { error } = validateInput(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const roleData = {
        name: req.body.name,
        lob: JSON.stringify(req.body.lob),
        branch: JSON.stringify(req.body.branch),
        territory: JSON.stringify(req.body.territory)
    };
    con.query("UPDATE role SET name=?, lob=?, branch=?, territory=?  WHERE id = ?", [roleData.name, roleData.lob, roleData.branch, roleData.territory, req.params.id], function (error, result) {
        if (error) return res.status(401).send("Unable to Update")

        con.query("DELETE FROM role_lob WHERE id IN(SELECT id WHERE role_id=?)", req.params.id, function (err, result) {
            if (err) return res.send(err)

            const lobs = JSON.parse(roleData.lob);

            lobs.map(l => {
                con.query(`INSERT INTO role_lob (role_id, lob_id) VALUES(${req.params.id}, ${l.id})`, function (err, result) {
                    if (err) return res.status(401).send("Data not inserted in role_lob table")

                })
            })
        })

        con.query("DELETE FROM role_branch WHERE id IN(SELECT id WHERE role_id=?)", req.params.id, function (err, result) {
            if (err) return res.send(err)

            const branchs = JSON.parse(roleData.branch);
            
            branchs.map(b => {
                con.query(`INSERT INTO role_branch (role_id, branch_id) VALUES(${req.params.id}, ${b.id})`, function (err, result) {
                    if (err) return res.status(401).send("Data not inserted in role_branch table")

                })
            });
        })

        con.query("DELETE FROM role_territory WHERE id IN(SELECT id WHERE role_id=?)", req.params.id, function (err, result) {
            if (err) return res.send(err)

            const territorys = JSON.parse(roleData.territory);

            territorys.map(t => {
                con.query(`INSERT INTO role_territory (role_id, territory_id) VALUES(${req.params.id}, ${t.id})`, function (err, result) {
                    if (err) return res.status(401).send("Data not inserted in role_territory table")

                })
            });
        })
        res.send("Updated Successfully")

    });
}

//====>>>>Delete Role
module.exports.deleteRole = (req, res) => {
    id = req.params.id;

    con.query("DELETE FROM role WHERE id = ?", [id], function (error, result) {
        if (error) return res.status(401).send("Role not deleted")

        if (result.affectedRows > 0) {
            res.send("Succesfully deleted")
        }
        else {
            res.send("This id is already deleted")
        }
    })
}
