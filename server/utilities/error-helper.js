'use strict';
let Boom = require('@hapi/boom');

function handleError(err) {
  if (err.isBoom) {
    throw err;
  } else {
    console.error(err);
    throw Boom.badImplementation(err);
  }
}

module.exports = {
  handleError,
};
