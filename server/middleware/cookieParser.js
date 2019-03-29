const parseCookies = (req, res, next) => {

  const cookiesObj = {};
  if (req.headers.cookie) {
    req.headers.cookie.split(';').forEach((val) => {
      let key = val.trim().split('=')[0];
      let value = val.trim().split('=')[1];

      cookiesObj[key] = value;
    });
  }

  req.cookies = cookiesObj;
  return next();
};

module.exports = parseCookies;
