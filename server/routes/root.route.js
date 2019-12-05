'use strict';
// Never take constants here
module.exports = {
  plugin: {
    async register(server, options) {
      server.route([
        {
          method: 'GET',
          path: '/',
          options: {
            auth: null,
            plugins: {
              policies: [],
            },
            tags: [],
            handler: async (request, h) => {
              return h.response({
                up: new Date().getTime() - request.server.info.started,
              });
            },
          },
        },
      ]);
    },
    version: require('../../package.json').version,
    name: 'root-routes',
  },
};
