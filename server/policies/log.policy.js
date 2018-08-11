'use strict'

const logPolicy = async (request, h) => {
  request.server.log(['policy', 'info'], 'Log come on pre response')
  return h.continue
}
logPolicy.applyPoint = 'onPreResponse'
module.exports = logPolicy
