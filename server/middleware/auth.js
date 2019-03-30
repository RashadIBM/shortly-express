const models = require('../models');
const Promise = require('bluebird');

// module.exports.createSession = (req, res, next) => {
var createSession = (req, res, next) => {
  /**
   *  1. Verify if any cookies are present
   *  2. If none present then => initialize new session
   *  3. Set new cookie => res.cookie()
   *  4. Else =>
   */
  if (Object.keys(req.cookies).length) {
    req.session = {hash: 'Hmmm, wonder how this will be refactored'};
  } else {
    models.Sessions.create()
      .then((successPacket) => {
        resolve(successPacket);
        // Pass an options object to get the hash we just created
        var options = {
          id: successPacket.insertId
        };
        models.Sessions.get(options)
          .then((results) => {
            console.log('\n\n\n\n\n\n\n--->', results);
            req.session = {hash: results.hash};
          });
      });

  }
  next();
};

createSession = Promise.promisify(createSession);
module.exports.createSession = createSession;
/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/
