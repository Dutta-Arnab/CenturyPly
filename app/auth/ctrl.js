const { con } = require('./../../config/db');
var jwt = require('jsonwebtoken');
const Joi = require("joi");
var nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const saltRounds = 10;

//validation for login api
const validateInput = (data) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(8).max(255).required(),
    });

    return schema.validate(data);
};
//validation for mail api
const validateMail = (data) => {
    const schema = Joi.object({
        email: Joi.string().email().required()
    });
    return schema.validate(data);
};
//validation for otpPass api
const validateOtpPass = (data) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        otp: Joi.string().min(6).max(255).required(),
        password: Joi.string().min(8).max(255).required(),
    });
    return schema.validate(data);
};

module.exports.logIn = (req, res) => {
    const { error } = validateInput(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    con.query("SELECT password FROM `user` WHERE email=?",req.body.email,(error,result)=>{
        if (error) return res.status(401).send("Password not found");
        //compare given password with the database password
        const compare = async()=>{
            const validPass = await bcrypt.compare(req.body.password, result[0].password);
            return validPass;
        }
        compare().then(compare=>{
            if (!compare) return res.status(400).send("OTP is incorrect");

            con.query("SELECT u.id, u.name, u.email, u.Designation,u.role_id,u.isAdmin, r.name as Role_Name, lm.lob as LOB_Name, bm.name as Branch_Name, tm.territory as Territory_Name FROM user u JOIN role r on u.role_id=r.id JOIN role_lob rl ON r.id=rl.role_id JOIN role_branch rb ON r.id=rb.role_id JOIN role_territory rt ON r.id=rt.role_id JOIN lob_master lm ON rl.lob_id=lm.id JOIN branch_master bm ON rb.branch_id=bm.id JOIN territory_master tm ON rt.territory_id=tm.id where u.email = ?", req.body.email, (error, result) => {
                if (error) return res.status(401).send("Email not found");
                if (result.length <= 0) return res.status(400).send("User not found, please log in");

                const user = {};        
                result.map(rs => {
                    if (rs.id !== user.id) user.id = rs.id
                    if (rs.name !== user.name) user.name = rs.name
                    if (rs.email !== user.email) user.email = rs.email
                    if (rs.Designation !== user.Designation) user.Designation = rs.Designation
                    if (rs.isAdmin !== user.isAdmin) user.isAdmin = rs.isAdmin
        
                    if (!user.role) user.role = {}
                    if (rs.role_id !== user.role.role_id) user.role.role_id = rs.role_id
                    if (!user.role.LOB) user.role.LOB = []
                    if (!user.role.branches) user.role.branches = []
                    if (!user.role.territory) user.role.territory = []
        
                    if (user.role.LOB.filter(lob => lob === rs.LOB_Name).length <= 0) user.role.LOB.push(rs.LOB_Name)
        
                    if (user.role.branches.filter(branch => branch === rs.Branch_Name).length <= 0) user.role.branches.push(rs.Branch_Name)
        
                    if (user.role.territory.filter(lob => lob === rs.Territory_Name).length <= 0) user.role.territory.push(rs.Territory_Name)
                })
                const token = jwt.sign(JSON.stringify(user), process.env.TOKEN_SECRET);
                //this is set "x-auth-token" on header of respond body
                return res
                    .header("x-auth-token", token)
                    .header("access-control-expose-headers", "x-auth-token")
                    .send(`Welcome ${user.name}`);
            }
            );
        })    
        
    })

    
};

module.exports.mail = (req, res) => {
    const { error } = validateMail(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    //check email exist or not
    con.query("SELECT id FROM `user` where email=?", req.body.email, function (error, result) {
        if (error) return res.status(401).send("Data not fetched")
        //check email exist or not
        if (result.length == 0) {
            return res.send("Email does not exist");
        } else {
            //check password exist or not for the email
            con.query("SELECT password FROM `user` where email=?", req.body.email, function (error, result) {
                if (error) return res.status(401).send("Data not fetched")

                const pass = result[0].password
                //OTP updated and sendOTPMail
                if (typeof (pass) == 'undefined' || pass == null) {
                    const sendOtpMail = (mail, OTP) => {
                        var transporter = nodemailer.createTransport({
                            service: 'Yahoo',
                            secure: false,
                            auth: {
                                user: process.env.MAIL,
                                pass: process.env.PASS
                            }
                        });

                        var mailOptions = {
                            from: 'dut.ananya92@yahoo.com',
                            to: mail,
                            subject: 'Sending Email With OTP',
                            text: `Hi, this is the mail from Century Ply ragrding registration of the app, the OTP to login your app is ${OTP}.
                        Thanks and regards,
                        Century Ply `
                            // html: '<h1>Hi Smartherd</h1><p>Your Messsage</p>'        
                        };

                        transporter.sendMail(mailOptions, function (error, info) {
                            if (error) {
                                res.send(error)
                            } else {
                                res.send(`Email sent: ` + info.response`/n OTP : ${OTP}`);
                            }
                        });
                    };

                    function rand() {
                        return Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
                    };
                    var OTP = rand()

                    const genHash = async () => {
                        const salt = await bcrypt.genSalt(10);
                        return await bcrypt.hash((OTP).toString(), salt)
                    }

                    genHash().then(hashed => {
                        con.query("UPDATE user SET otp=? WHERE email=?", [hashed, req.body.email], (err, res) => {
                            if (err) return res.status(401).send("Data not updated")
                        })
                        sendOtpMail(req.body.email, OTP)
                        res.send(`OTP send to your mail ${req.body.email}`)
                    })


                } else {
                    const obj = {
                        email: req.body.email,
                        pass: pass
                    }
                    return res.send(obj)
                }
                //res.send(result)
            })
        }
    })
};


module.exports.otpPass = (req, res) => {
    const { error } = validateOtpPass(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    con.query("SELECT email,otp FROM user WHERE email=?", req.body.email, (error, result) => {
        if (error) return res.status(401).send("Data not updated")

        const compare = async()=>{
            const validOtp = await bcrypt.compare(req.body.otp, result[0].otp);
            // if (!validOtp) return res.status(400).send("OTP is incorrect");
            return validOtp;
        }
        
        compare().then(compare=>{
            if (!compare) return res.status(400).send("OTP is incorrect");

            const genHash = async () => {
                const salt = await bcrypt.genSalt(10);
                return await bcrypt.hash((req.body.password).toString(), salt)
            }

            genHash().then(hashed => {
                con.query("UPDATE user SET password=? WHERE email=?", [hashed, req.body.email], (err, res) => {
                    if (err) return res.status(401).send("Data not updated")
                })                
                res.send("Password is changed, pls login")
            })
        })
        
    })
};