const models = require('../models');
const Promise = require('bluebird');

module.exports.createSession = (req, res, next) => {
  /**
   *  1. Verify if any cookies are present
   *  2. If none present then => initialize new session
   *  3. Set new cookie => res.cookie()
   *  4. Else =>
   */
  if(Object.keys(req.cookies).length){
    console.log('Yay');
    return models.Sessions.create();
   } else {
    console.log('--<');
    return models.Sessions.create();
   }







};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/
