const express = require('express');
const path = require('path');
const utils = require('./lib/hashUtils');
const partials = require('express-partials');
const bodyParser = require('body-parser');
const Auth = require('./middleware/auth');
const models = require('./models');
const cookieFn = require('./middleware/cookieParser');

const app = express();

app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');
app.use(partials());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

app.get('/', Auth.createSession, (req, res, next) => {
  // Aim to remove Auth.createSession from line 19 & call below
  var isLoggedIn = models.Sessions.isLoggedIn(req.session);
  if (!isLoggedIn) {
    res.redirect('/login');
    next();
  } else {
    res.render('index');
    next();
  }
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/create', Auth.createSession, (req, res, next) => {
  // Aim to remove Auth.createSession from line 19 & call below
  var isLoggedIn = models.Sessions.isLoggedIn(req.session);
  if (!isLoggedIn) {
    res.redirect('/login');
    next();
  } else {
    res.render('index');
    next();
  }
});

app.get('/links', Auth.createSession, (req, res, next) => {
  var isLoggedIn = models.Sessions.isLoggedIn(req.session);
  if (!isLoggedIn) {
    res.redirect('/login');
    next();
  } else {
    models.Links.getAll()
      .then((links) => {
        res.status(200).send(links);
      })
      .error((error) => {
        res.status(500).send(error);
      });
  }
});

app.post('/links', (req, res, next) => {
  var url = req.body.url;
  if (!models.Links.isValidUrl(url)) {
    // send back a 404 if link is not valid
    return res.sendStatus(404);
  }

  return models.Links.get({ url })
    .then((link) => {
      if (link) {
        throw link;
      }
      return models.Links.getUrlTitle(url);
    })
    .then((title) => {
      return models.Links.create({
        url: url,
        title: title,
        baseUrl: req.headers.origin,
      });
    })
    .then((results) => {
      return models.Links.get({ id: results.insertId });
    })
    .then((link) => {
      throw link;
    })
    .error((error) => {
      res.status(500).send(error);
    })
    .catch((link) => {
      res.status(200).send(link);
    });
});

/************************************************************/
// Write your authentication routes here
/************************************************************/

app.post('/signup', Auth.createSession, (req, res, next) => {
  let username = req.body.username;
  let password = req.body.password;

  return models.Users.create({
    username: username,
    password: password,
  })
    .then((results) => {
      models.Sessions.update({ hash: req.session.hash }, { userId: results.insertId })
        .then((stat) => {
          // If successful session update then updated session userId cookie
          if (stat.affectedRows) {
            req.session.userId = results.insertId;
          }
          res.redirect('/');
          next();
        });
    })
    .catch((err) => {
      res.redirect('/signup');

    });
});

app.post('/login', Auth.createSession, (req, res) => {

  let username = req.body.username;
  let attempted = req.body.password;

  return models.Users.get({
    username,
  })
    .then((result) => {
      // If login is successful then update session table
      if (models.Users.compare(attempted, result.password, result.salt)) {
        models.Sessions.update({ hash: req.session.hash }, { userId: result.id })
          .then((stat) => {
            // If table session updates then update session userId cookie
            if (stat.affectedRows) {
              req.session.userId = result.id; //result.insertId  --> result.id
              res.redirect('/');
            } // Else session table was not updated so..
          });
      } else {
        res.redirect('/login');
      }
    })
    .catch((err) => {
      res.redirect('/login');
    });
});

app.get('/logout', (req, res, next) => {
  cookieFn(req, res, next);
  models.Sessions.delete({ hash: req.cookies.shortlyid })
    .then(() => {
      // Upon deletion from table, also delete cookie
      // Account for models.Sessions.isLoggedIn needs session.user ???
      /**
       * Will need to refactor req.session assigment as
       * session.user needs to exist on this as well for
       * isLoggedIn  albeit blank?? as it errors out since undefined
       */
      req.session = {};
      console.log(req.session);
      next();
    });
});






/************************************************************/
// Handle the code parameter route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/:code', (req, res, next) => {
  return models.Links.get({ code: req.params.code })
    .tap((link) => {
      if (!link) {
        throw new Error('Link does not exist');
      }
      return models.Clicks.create({ linkId: link.id });
    })
    .tap((link) => {
      return models.Links.update(link, { visits: link.visits + 1 });
    })
    .then(({ url }) => {
      res.redirect(url);
    })
    .error((error) => {
      res.status(500).send(error);
    })
    .catch(() => {
      res.redirect('/');
    });
});

module.exports = app;
