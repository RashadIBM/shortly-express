const models = require('../models');
const Promise = require('bluebird');

module.exports.createSession = (req, res, next) => {
  if (!req.cookies || Object.keys(req.cookies).length === 0) {
    models.Sessions.create()
      .then(result => {
        models.Sessions.get({ id: result.insertId }).then(result => {
          req.session = result;

          if (req.body.username) {
            console.log('here');
            models.Users.get({ username: req.body.username }).then(user => {
              console.log('User:\n');
              console.log(user);
              // req.session.user = user;
              // req.session.userId = user.id;
            });
          }

          res.cookie('shortlyid', result.hash);
          next();
        });
      })
      .catch(err => {
        console.log(err);
      });
  } else {
    models.Sessions.get({ hash: req.cookies.shortlyid })
      .then(result => {
        if (result) {
          req.session = result;
          next();
        } else {
          models.Sessions.create().then(result => {
            models.Sessions.get({ id: result.insertId }).then(result => {
              req.session = result;
              res.cookie('shortlyid', result.hash);
              next();
            });
          });
        }
      })
      .catch(err => {
        console.log(err);
      });
  }
};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/
