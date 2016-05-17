var express = require('express');
var util = require('./lib/utility');
var partials = require('express-partials');
var bodyParser = require('body-parser');
// add express session
var session = require('express-session');


var db = require('./app/config');
var Users = require('./app/collections/users');
var User = require('./app/models/user');
var Links = require('./app/collections/links');
var Link = require('./app/models/link');
var Click = require('./app/models/click');

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
// Parse JSON (uniform resource locators)
app.use(bodyParser.json());
// Parse forms (signup/login)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
// Use session
app.use( session ({
  secret: 'what'
}));

app.get('/', 
function(req, res) {
  if (req.session.user) {
    res.render('index');
  } else {
    res.redirect('login');
  }
});

app.get('/create', 
function(req, res) {
  if (req.session.user) {
    console.log('trying to access /create');
    res.render('index');
  } else {
    res.redirect('login');
  }
});

app.get('/links', 
function(req, res) {
  if (req.session.user) {
    Links.reset().fetch().then(function(links) {
      res.status(200).send(links.models);
    });
  } else {
    res.redirect('login');
  }
});

app.post('/links', 
function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.sendStatus(404);
  }

  new Link({ url: uri }).fetch().then(function(found) {
    if (found) {
      res.status(200).send(found.attributes);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.sendStatus(404);
        }

        Links.create({
          url: uri,
          title: title,
          baseUrl: req.headers.origin
        })
        .then(function(newLink) {
          res.status(200).send(newLink);
        });
      });
    }
  });
});

/************************************************************/
// Write your authentication routes here
/************************************************************/
app.get('/logout', (req, res) =>{
  req.session.destroy();
  res.redirect('/');
});

app.get('/login', 
function(req, res) {
  res.render('login');
});

app.post('/signup', (req, res) => {
  var username = req.body.username;
  var password = req.body.password;
  Users
  .query('where', 'username', '=', username)
  .fetch()
  .then(model => {
    console.log(model, '<---- this is the model');
    if (model.length === 1) {
      res.send('Username taken, please choose a new Username');
    } else {
      new User({
        'username': username,
        'password': password
      }).save()
      .then(() => {
        console.log('trying to respond with username');
        req.session.user = username;
        req.session.admin = true;
        res.redirect('/');
      });
    }
  }); 
});

app.get('/signup', 
function(req, res) {
  res.render('signup');
});

app.post('/login', (req, res) =>{
  var authenticate = (req) => { 
    var username = req.body.username;
    var password = req.body.password;
    Users
    .query('where', 'username', '=', username)
    .query('where', 'password', '=', password)
    .fetch()
    .then( models => {
      if (models.length === 1) {
        req.session.user = username;
        req.session.admin = true;
        res.redirect('/');
      } else {
        res.redirect('/login');
      } 
    })
    .catch((err) => {
      throw err;
    });
  };
  
  authenticate(req);
});
/************************************************************/
// Handle the wildcard route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/*', function(req, res) {
  new Link({ code: req.params[0] }).fetch().then(function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      var click = new Click({
        linkId: link.get('id')
      });

      click.save().then(function() {
        link.set('visits', link.get('visits') + 1);
        link.save().then(function() {
          return res.redirect(link.get('url'));
        });
      });
    }
  });
});

console.log('Shortly is listening on 4568');
app.listen(4568);
