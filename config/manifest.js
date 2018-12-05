'use strict'

// const DEVELOPMENT = 'development'
const PRODUCTION = 'production'

const getArgument = argument => {
  return process.argv.indexOf(argument)
}

if (getArgument('--development') !== -1) {
  process.env.NODE_ENV = 'development'
}

if (getArgument('--prod') !== -1) {
  process.env.NODE_ENV = 'production'
}

if (getArgument('--development') !== -1 || getArgument('--prod') !== -1) {
  process.env.NODE_CONFIG_DIR = `${__dirname}`
}

const config = require('config')
const mongoose = require('mongoose')
const Config = JSON.parse(JSON.stringify(config))

// REF: https://github.com/z0mt3c/hapi-swaggered , https://github.com/z0mt3c/hapi-swaggered-ui
let swaggeredOptions = {
  info: {
    title: 'Hapi-17-boilerplate',
    version: require('../package.json').version
  },
  stripPrefix: '/v1',
  tags: [],
  tagging: {
    mode: 'tags'
  },
  securityDefinitions: {
    ApiKeyAuth: {
      type: 'apiKey',
      name: 'Authorization',
      in: 'header'
    }
  }
}

const DEFAULT = 'default'

let plugins = []
const ENV = config.util.getEnv('NODE_ENV').trim()

if (ENV !== DEFAULT) {
  swaggeredOptions.schemes = ['https', 'http']
  swaggeredOptions.host = 'productionurl.com'
  mongoose.set('debug', true)
}
if (ENV !== PRODUCTION) {
  plugins = [
    {
      plugin: 'inert'
    },
    {
      plugin: 'vision'
    },
    {
      plugin: 'hapi-swaggered',
      options: swaggeredOptions
    },
    {
      plugin: 'hapi-swaggered-ui',
      options: {
        title: 'Hapi-17-boilerplate',
        path: '/docs'
      }
    },
    {
      plugin: 'hapi-dev-errors',
      options: {
        showErrors: process.env.NODE_ENV !== 'production',
        toTerminal: true
      }
    }
  ]
}
plugins = plugins.concat([
  {
    plugin: 'good',
    options: {
      ops: {
        interval: 1000
      },
      reporters: {
        myConsoleReporter: [
          {
            module: 'good-squeeze',
            name: 'Squeeze',
            args: [{ log: '*', request: '*', response: '*', error: '*' }]
          },
          {
            module: 'good-console'
          },
          'stdout'
        ]
      }
    }
  },
  {
    plugin: 'hapi-auth-jwt2'
  },
  {
    plugin: 'hapi-auth-basic'
  },
  {
    plugin: 'schmervice'
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
    plugin: '@routes/root.route'
  }
])

const routesOb = {
  'auth.route': 'auth'
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
