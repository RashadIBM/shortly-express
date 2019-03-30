const models = require('../models');
const Promise = require('bluebird');

module.exports.createSession = (req, res, next) => {
  if (Object.keys(req.cookies).length === 0) {
    models.Sessions.create().then((result) => {
      models.Sessions.get({ id: result.insertId }).then((result) => {
        req.session = result;
        res.cookie('shortlyid', result.hash);
        next();
      });
    });
  } else {
    models.Sessions.get({ hash: req.cookies.shortlyid }).then((result) => {
      if(result) {
        req.session = result;
        next();
      } else {
        models.Sessions.create().then((result) => {
          models.Sessions.get({ id: result.insertId }).then((result) => {
            req.session = result;
            res.cookie('shortlyid', result.hash);
            next();
          });
        });
      }
    });
  }
};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/
