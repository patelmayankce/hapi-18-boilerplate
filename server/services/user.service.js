'use strict'

const Schmervice = require('schmervice')
const User = require('@models/user.model').schema

module.exports = class UserService extends Schmervice.Service {
  async getUserById(id) {
    const user = await User.findById(id)
    return user
  }
}
