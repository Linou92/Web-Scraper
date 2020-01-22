'use strict'

var request = require('request')

module.exports = {
  fetch: fetch
}

function fetch (url) {
  return new Promise(function (resolve, reject) {
    request(url, function (err, res, html) {
      if (err) {
        return reject(err)
      }

      if (res.statusCode !== 200) {
        return reject(new Error('Bad status code'))
      }

      resolve(html)
    })
  })
}
