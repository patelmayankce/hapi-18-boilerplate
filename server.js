'use strict'

require('module-alias/register')

const Glue = require('glue')

// relativeTo parameter should be defined here
const options = {
  relativeTo: __dirname
}

// Start server
const startServer = async () => {
  try {
    const server = await Glue.compose(options)

    await server.start()
    console.log(`Server listening on ${server.info.uri}`)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

startServer()
