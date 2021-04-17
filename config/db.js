
// 'use strict';

let mysql = require('mysql');


module.exports.con = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});


// module.exports.data = () => {
//     connection.connect((err) => {
//         if (err) {
//             return console.error('error: ' + err.message);
//         }

//         console.log('Connected to the Database.');
//     })
// };
