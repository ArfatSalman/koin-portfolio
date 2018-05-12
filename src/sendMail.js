const assert = require('assert');

require('dotenv').config();

const nodemailer = require('nodemailer');

const { GMAIL_USER, PASSWORD } = process.env;

assert.notStrictEqual(GMAIL_USER, undefined);
assert.notStrictEqual(PASSWORD, undefined);

const gmailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: GMAIL_USER,
    pass: PASSWORD,
  },
});

const deafultMailOptions = {
  from: 'arfatsalman78692@gmail.com', // sender address
  to: 'giney.paradise@gmail.com', // list of receivers
  subject: 'Price Update', // Subject line
  content: '', // plain text body
};

module.exports = (options = {}) => new Promise((resolve, reject) => {
  const mailOptions = { ...deafultMailOptions, ...options };
  gmailTransporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      reject(err);
    }
    resolve(info);
  });
});
