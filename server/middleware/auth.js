const models = require('../models');
const Promise = require('bluebird');

module.exports.createSession = (req, res, next) => {
  /**
   *  1. Verify if any cookies are present
   *  2. If none present then => initialize new session
   *  3. Set new cookie => res.cookie()
   *  4. Else =>
   */
  return new Promise((resolve, reject) => {
    if (Object.keys(req.cookies).length) {
      req.session = {hash: 'Hmmm, wonder how this will be refactored'};
      resolve(req);
      next();
    } else {
      models.Sessions.create()
        .then((successPacket) => {
          // Pass an options object to get the hash we just created
          var options = {
            id: successPacket.insertId
          };
          models.Sessions.get(options)
            .then((results) => {
              req.session = {hash: results.hash};
              resolve(req);
              next();
            });
        });

    }
  });

};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/
