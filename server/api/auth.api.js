'use strict'

const Joi = require('joi')
const config = require('config')
const Boom = require('boom')

const errorHelper = require('@utilities/error-helper')
const Token = require('@utilities/create-token')

const User = require('@models/user.model').schema

module.exports = {
  login: {
    validate: {
      payload: Joi.object().keys({
        username: Joi.string()
          .required()
          .trim()
          .label('Username'),
        password: Joi.string()
          .required()
          .trim()
          .label('Password')
      })
    },
    pre: [
      {
        assign: 'user',
        method: async (request, h) => {
          try {
            const username = request.payload.username
            const password = request.payload.password

            let user = await User.findByCredentials(username, password)
            if (user) {
              return user
            } else {
              errorHelper.handleError(
                Boom.badRequest('Wrong username or password')
              )
            }
          } catch (err) {
            errorHelper.handleError(err)
          }
          return h.continue
        }
      },
      {
        assign: 'accessToken',
        method: (request, h) => {
          return Token(request.pre.user, config.constants.EXPIRATION_PERIOD)
        }
      },
      {
        assign: 'emailVerified',
        method: (request, h) => {
          // TODO: Create Email service to send emails
          return h.continue
        }
      },
      {
        assign: 'lastLogin',
        method: async (request, h) => {
          try {
            const lastLogin = Date.now()
            await User.findByIdAndUpdate(request.pre.user._id, {
              lastLogin: lastLogin
            })
            return lastLogin
          } catch (err) {
            errorHelper.handleError(err)
          }

          return h.continue
        }
      }
    ],
    handler: async (request, h) => {
      let accessToken = request.pre.accessToken
      let response = {}

      delete request.pre.user.password

      response = {
        user: request.pre.user,
        accessToken
      }
      return h.response(response).code(200)
    }
  },
  signup: {
    validate: {
      payload: Joi.object().keys({
        firstName: Joi.string()
          .required()
          .trim()
          .label('First Name'),
        lastName: Joi.string()
          .required()
          .trim()
          .label('Last Name'),
        email: Joi.string()
          .email()
          .required()
          .trim()
          .label('Email'),
        phone: Joi.string()
          .trim()
          .min(10)
          .max(12)
          .label('Phone Number'),
        password: Joi.string()
          .required()
          .trim()
          .label('Password'),
        cPassword: Joi.string()
          .required()
          .trim()
          .valid(Joi.ref('password'))
          .label('Compare Password')
      })
    },
    pre: [
      {
        assign: 'uniqueEmail',
        method: async (request, h) => {
          try {
            let user = await User.findOne({
              email: request.payload.email
            })
            if (user) {
              errorHelper.handleError(
                Boom.badRequest('Email address is already exist')
              )
            }
          } catch (err) {
            errorHelper.handleError(err)
          }
          return h.continue
        }
      },
      {
        assign: 'uniquePhone',
        method: async (request, h) => {
          try {
            let user = await User.findOne({
              phone: request.payload.phone
            })
            if (user) {
              errorHelper.handleError(
                Boom.badRequest('Phone number is already exist')
              )
            }
          } catch (err) {
            errorHelper.handleError(err)
          }
          return h.continue
        }
      },
      {
        assign: 'signup',
        method: async (request, h) => {
          delete request.payload.cPassword
          delete request.payload.agentCode
          let userPayload = request.payload
          try {
            let createdUser = await User.create(userPayload)
            return createdUser
          } catch (err) {
            errorHelper.handleError(err)
          }
        }
      }
    ],
    handler: async (request, h) => {
      return h.response(request.pre.signup).code(201)
    }
  },
  me: {
    validate: {
      headers: Joi.object({
        authorization: Joi.string().required()
      }).options({
        allowUnknown: true
      })
    },
    pre: [],
    handler: async (request, h) => {
      const user = await User.findById(request.auth.credentials.user._id)

      return h.response(user)
    }
  }
}
