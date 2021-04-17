//isLoggedIn, isAdmin
var jwt = require('jsonwebtoken');
const { con } = require('../../config/db');

module.exports.isLoggedIn = (req, res, next) => {
    const token = req.header("x-auth-token")

    if (!token) return res.status(401).send("Token required, access denied")


    try {
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET)
        //this is just created another field named "currentUser" in res, in next phase we can catch this data by (res.currentUser)
        res.currentUser = decoded

        if (decoded) next()

    } catch (error) {
        return res.status(401).send("Invalid token, access denied")
    }

}

module.exports.isAdmin = (req, res, next) => {
    const admin =  res.currentUser.isAdmin

    if(admin==0) return res.status(403).send("Only ADMIN can proceed further")
    next()
}