const fs = require('fs-extra');
const axios = require('axios');
const _ = require('lodash');

module.exports = function (accessToken, dataDate, callback) {
  const convertToJson = function (response) {
    return JSON.stringify(_.omit(response, ['request']), null, 4)
      .replace(new RegExp(accessToken, 'g'), '<token removed>');
  };

  var fitbitApi = axios.create({
    baseURL: 'https://api.fitbit.com',
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  // Source: https://dev.fitbit.com/reference/web-api/basics/#overview
  const requests = new Map([
    // Activity
    ['calories',      fitbitApi.get(`/1/user/-/activities/calories/date/${dataDate}/1d/1min.json`)],
    ['steps',         fitbitApi.get(`/1/user/-/activities/steps/date/${dataDate}/1d/1min.json`)],
    ['distance',      fitbitApi.get(`/1/user/-/activities/distance/date/${dataDate}/1d/1min.json`)],
    // // Not supported
    // // ['floors',        fitbitApi.get(`/1/user/-/activities/floors/date/${dataDate}/1d/1min.json`)],
    // // ['elevation',     fitbitApi.get(`/1/user/-/activities/elevation/date/${dataDate}/1d/1min.json`)],

    // // Body & Weight
    ['fat',           fitbitApi.get(`/1/user/-/body/fat/date/${dataDate}/1d.json`)],
    ['weight',        fitbitApi.get(`/1/user/-/body/weight/date/${dataDate}/1d.json`)],

    // // Devices
    ['devices',       fitbitApi.get(`/1/user/-/devices.json`)],

    // // Food Logging
    ['food',          fitbitApi.get(`/1/user/-/foods/log/date/${dataDate}.json`)],
    ['water',         fitbitApi.get(`/1/user/-/foods/log/water/date/${dataDate}.json`)],
    ['favorite-food', fitbitApi.get('/1/user/-/foods/log/favorite.json')],
    ['frequent-food', fitbitApi.get('/1/user/-/foods/log/frequent.json')],
    ['recent-food',   fitbitApi.get('/1/user/-/foods/log/recent.json')],

    // // Heart Rate
    ['heart',         fitbitApi.get(`/1/user/-/activities/heart/date/${dataDate}/1d/1sec.json`)],

    // Sleep
    ['sleep',         fitbitApi.get(`/1.2/user/-/sleep/date/${dataDate}.json`)],
  ]);

  const resourceList = Array.from(requests.keys());
  const requestList = Array.from(requests.values());

  Promise.all(requestList)
  .then(function (responses) {
    const namedResponses = _.fromPairs(_.zip(resourceList, responses));

    const datePath = dataDate.split('-').join('/');
    fs.mkdirs(`data/${datePath}`)
    .then(function () {
      return Promise.all(resourceList.map(function (resourceName) {
        const jsonData = convertToJson(namedResponses[resourceName]);
        return fs.writeFile(`data/${datePath}/${resourceName}.json`, jsonData);
      }));
    })
    .then(function () {
      callback(null);
    });

  })
  .catch(function (error) {
    callback(error);
  });
};
