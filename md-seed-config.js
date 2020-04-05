require('module-alias/register');
const mongooseLib = require('mongoose');
const Users = require('./seeders/user.seeder');

const getArgument = (argument) => {
  return process.argv.indexOf(argument);
};

if (getArgument('--development') !== -1) {
  process.env.NODE_ENV = 'development';
}

if (getArgument('--prod') !== -1) {
  process.env.NODE_ENV = 'production';
}

if (getArgument('--development') !== -1 || getArgument('--prod') !== -1) {
  process.env.NODE_CONFIG_DIR = `${__dirname}`;
}

const config = require('config');

mongooseLib.Promise = global.Promise || Promise;

module.exports = {
  // Export the mongoose lib
  mongoose: mongooseLib,

  // Export the mongodb url
  mongoURL: config.connections.db,

  /*
    Seeders List
    ------
    order is important
  */
  seedersList: {
    Users,
  },
};
