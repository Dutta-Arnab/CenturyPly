const { con } = require('./../../config/db');
var jwt = require('jsonwebtoken');

module.exports.logIn = (req, res) => {
    con.query("SELECT * FROM user WHERE email= ?", req.body.email, (error, result) => {

        if (error) return res.status(401).send("Email not found");
        if (result.length <= 0) return res.status(400).send("User not found, please log in");

        const token = jwt.sign(JSON.stringify(result[0]), process.env.TOKEN_SECRET);

        
        //this is set "x-auth-token" on header of respond body
        return res
            .header("x-auth-token", token)
            .header("access-control-expose-headers", "x-auth-token")
            .send("Welcome");
    })
}