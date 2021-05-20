const { con } = require('./../../config/db');
const Joi = require("joi");
var nodemailer = require('nodemailer');

const validateInput = (data) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        //password: Joi.string().min(8).max(255).required(),
    });

    return schema.validate(data);
};

module.exports.logIn = (req, res) => {
    const { error } = validateInput(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    con.query("SELECT id FROM `user` where email=?", req.body.email, function (error, result) {
        if (error) return res.status(401).send("Data not fetched")

        if (result.length == 0) {
            var transporter = nodemailer.createTransport({
                host: 'smtp.mail.yahoo.com',
                port: 465,
                service: 'Yahoo',
                secure: false,
                auth: {
                    user: 'dut.ananya92@yahoo.com',
                    pass: '1107tutun'
                },
                debug: false,
                logger: true
            });

            function rand() {
                return Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
            };
            var OTP = rand()

            var mailOptions = {
                from: 'dut.ananya92@yahoo.com',
                to: req.body.email,
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
        }
        else {
            res.send(result)
        }
    })

}