const express = require('express');
const notificationsRouter = express.Router();
const axios = require('axios');
const client = require('../notificationsConfig.js')

notificationsRouter.post('/', (req, res) => {
  let {link, phoneNumber} = req.body;
  let phoneNumbers = phoneNumber.split(',').map(str => str.trim()).filter(num => num.length === 10);
  console.log(phoneNumbers);
  // res.status(222).send('NOTIFICATION POLL ROUTER!!!');
  // client.messages.create({
  //   body: `Here's the link to your Fire Poll! ${link} Thanks for Voting!`,
  //   to: `+1${phoneNumber}`,
  //   from: '+19738334983'
  // })
  // .then(message => console.log(message))
  // .catch(err => console.log(err));
});

module.exports = notificationsRouter;