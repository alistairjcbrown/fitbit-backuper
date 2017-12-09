const fs = require('fs-extra');
const axios = require('axios');
const _ = require('lodash');
const decache = require('decache');
const settings = require('../auth/settings');

const btoa = function (value) {
  return Buffer.from(value).toString('base64');
};

module.exports = {
  test: function (callback) {
    const access = this.getAccess();
    if (_.isEmpty(access)) {
      setTimeout(function () {
        callback(new Error('No access token'));
      }, 1);
    }

    const fitbitApi = axios.create({
      baseURL: 'https://api.fitbit.com',
      headers: {
        Authorization: `Bearer ${access.accessToken}`
      }
    });

    fitbitApi.get('/1/user/-/profile.json')
    .then(function (data) {
      callback(null);
    })
    .catch(function (e) {
      callback(e);
    });
  },

  refresh: function (callback) {
    const access = this.getAccess();
    if (_.isEmpty(access)) {
      setTimeout(function () {
        callback(new Error('No access token'));
      }, 1);
    }

    const encodedIdentifier = btoa(`${settings.oauth.clientID}:${settings.oauth.clientSecret}`)
    const fitbitApi = axios.create({
      baseURL: 'https://api.fitbit.com',
      headers: {
        Authorization: `Basic ${encodedIdentifier}`
      }
    });

    fitbitApi.post(`/oauth2/token?grant_type=refresh_token&refresh_token=${access.refreshToken}`)
    .then(function (response) {
      const updatedAccess = _.extend({}, access, {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token
      });

      fs.writeFile(`auth/access.json`, JSON.stringify(updatedAccess, null, 4)).then(function () {
        callback(null);
      });
    })
    .catch(function (e) {
      callback(e);
    });
  },

  getAccess: function () {
    try {
      decache('../auth/access')
      return require('../auth/access');
    } catch (e) {
      if (_.isEmpty(process.env.FITBIT_ACCESS_TOKEN) || _.isEmpty(process.env.FITBIT_REFRESH_TOKEN)) {
        return;
      }

      return {
        accessToken: process.env.FITBIT_ACCESS_TOKEN,
        refreshToken: process.env.FITBIT_REFRESH_TOKEN
      };
    }
  }
};
