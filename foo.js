// var express = require('express');
// var util = require('./lib/utility');
// var partials = require('express-partials');
// var bodyParser = require('body-parser');
// // add express session
// var session =  require('express-session');


// var db = require('./app/config');
// var Users = require('./app/collections/users');
// var User = require('./app/models/user');
// var Links = require('./app/collections/links');
// var Link = require('./app/models/link');
// var Click = require('./app/models/click');

// var app = express();

// app.set('views', __dirname + '/views');
// app.set('view engine', 'ejs');
// app.use(partials());
// // Parse JSON (uniform resource locators)
// app.use(bodyParser.json());
// // Parse forms (signup/login)
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.static(__dirname + '/public'));
// // Use session
// app.use( session ({
//   secret: 'what'
// }));
var bcrypt = require('bcrypt-nodejs');
var path = require('path');
var knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: path.join(__dirname, '/db/shortly.sqlite')
  },
  useNullAsDefault: true
});
var db = require('bookshelf')(knex);
var Users = require('./app/collections/users.js');

// console.log(
//   Users
//   .query('where', 'username', '=', 'Phillip')
//   .query('where', 'password', '=', 'asdfasdfasdf')
//   .fetch()
//   .then( models =>{
//     console.log(models.length, 'is Array?');
//     console.log(models, '<-- models');
//     models.forEach( (model) =>{
//       console.log(model.get('username'), '<--- model username');
//       console.log(model.get('password'), '<--- model password');
//       console.log(model.get('id'), '<--- model id');
//     });
//   })
// );
const myPlaintextPassword = 's0/\/\P4$$w0rD';
const someOtherPlaintextPassword = 'not_bacon';

var hashedPassword;

var bhash = bcrypt.genSalt(10, function(err, result) {
  if (err) {
    throw err;
  } else {
    console.log(result, '---------------------SALT!!!');
    bcrypt.hash(myPlaintextPassword, result, null, function(err, hash) {
      if (err) {
        throw err;
      }
      console.log(hash, '-----------------------HASH!');
      hashedPassword = hash;
    });
  }
});

setTimeout(function() {
  console.log(bcrypt.compareSync('dgs', hashedPassword), '^^^ RESULT OF COMPARE');
}, 5000);
  
console.log(bcrypt.hashSync('plain', null), 'hashSync');


// bcrypt.hash(myPlaintextPassword, , null, function(err, hash) {
//   if(err) {
//     throw err;
//   }
//   console.log(hash);
// });





