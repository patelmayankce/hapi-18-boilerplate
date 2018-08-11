'use strict'

// const DEVELOPMENT = 'development'
const PRODUCTION = 'production'

const getArgument = argument => {
  return process.argv.indexOf(argument)
}

if (getArgument('--development') !== -1 || getArgument('--prod') !== -1) {
  process.env.NODE_CONFIG_DIR = '/var/www/hapi-17-boilerplate/config/'
}

const config = require('config')
const mongoose = require('mongoose')
const Config = JSON.parse(JSON.stringify(config))

// Follow Doc: https://github.com/glennjones/hapi-swagger/blob/master/optionsreference.md
let swaggerOptions = {
  info: {
    title: 'Hapi-17-boilerplate',
    version: require('../package.json').version
  },
  basePath: '/v1',
  tags: [],
  grouping: 'tags',
  securityDefinitions: {
    ApiKeyAuth: {
      type: 'apiKey',
      name: 'Authorization',
      in: 'header'
    }
  },
  security: [
    {
      ApiKeyAuth: []
    }
  ]
}
const DEFAULT = 'default'

let plugins = []

if (config.util.getEnv('NODE_ENV') !== DEFAULT) {
  swaggerOptions.schemes = ['http']
  // swaggerOptions.schemes = ['https', 'http']
  swaggerOptions.host = 'productionurl.com'
  mongoose.set('debug', true)
}
if (config.util.getEnv('NODE_ENV') !== PRODUCTION) {
  plugins = [
    {
      plugin: 'inert'
    },
    {
      plugin: 'vision'
    },
    {
      plugin: 'hapi-swagger',
      options: swaggerOptions
    }
  ]
}
plugins = plugins.concat([
  {
    plugin: 'hapi-auth-jwt2'
  },
  {
    plugin: 'hapi-auth-basic'
  },
  {
    plugin: 'mrhorse',
    options: {
      policyDirectory: `${__dirname}/../server/policies`,
      defaultApplyPoint:
        'onPreHandler' /* optional.  Defaults to onPreHandler */
    }
  },
  {
    plugin: '@plugins/mongoose.plugin',
    options: {
      connections: Config.connections
    }
  },
  {
    // if you need authentication then uncomment this plugin, and remove "auth: false" below
    plugin: '@plugins/auth.plugin'
  },
  {
    plugin: `@routes/root.route`
  }
])
/**
const routesOb = {
  'auth.route': 'auth',
  'user.route': 'user'
}

const routes = Object.keys(routesOb)

routes.forEach(r => {
  plugins = plugins.concat([
    {
      plugin: `@routes/${r}`,
      routes: {
        prefix: `/v1${routesOb[r] ? `/${routesOb[r]}` : ``}`
      }
    }
  ])
})
 */
exports.manifest = {
  server: {
    router: {
      stripTrailingSlash: true,
      isCaseSensitive: false
    },
    routes: {
      security: {
        hsts: false,
        xss: true,
        noOpen: true,
        noSniff: true,
        xframe: false
      },
      cors: {
        origin: ['*'],
        // ref: https://github.com/hapijs/hapi/issues/2986
        headers: ['Accept', 'Authorization', 'Content-Type']
      },
      validate: {
        failAction: async (request, h, err) => {
          request.server.log(
            ['validation', 'error'],
            'Joi throw validation error'
          )
          throw err
        }
      },
      jsonp: 'callback', // <3 Hapi,
      auth: false // remove this to enable authentication or set your authentication profile ie. auth: 'jwt'
    },
    debug: Config.debug,
    port: Config.port
  },
  register: {
    plugins
  }
}

exports.options = {}
