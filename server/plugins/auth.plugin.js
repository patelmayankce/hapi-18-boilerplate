'use strict';
const config = require('config');

module.exports.plugin = {
  async register(server, options) {
    const jwtValidate = async (decodedToken, request, h) => {
      const User = require('models/user.model').schema;

      let credentials = {
        user: {},
      };
      let isValid = false;
      credentials.user = await User.findById(decodedToken.user._id);
      if (credentials.user) {
        isValid = true;
      }
      // Authentication Code will be here
      return {
        isValid,
        credentials,
      };
    };

    server.auth.strategy('auth', 'jwt', {
      key: config.constants.JWT_SECRET,
      validate: jwtValidate,
      verifyOptions: {
        algorithms: ['HS256'],
      },
    });

    // Add helper method to get request ip
    const getIP = function (request) {
      // We check the headers first in case the server is behind a reverse proxy.
      // see: https://ypereirareis.github.io/blog/2017/02/15/nginx-real-ip-behind-nginx-reverse-proxy/
      return (
        request.headers['x-real-ip'] ||
        request.headers['x-forwarded-for'] ||
        request.info.remoteAddress
      );
    };
    server.method('getIP', getIP, {});
  },
  name: 'auth',
  version: require('../../package.json').version,
};
