require('dotenv').load();
const fs = require('fs-extra');
const moment = require('moment');
const _ = require('lodash');
const authenticate = require('./oauth');
const getData = require('./get-data');
const auth = require('./auth');

process.on('unhandledRejection', (e) => {
  console.log('unhandledRejection', e);
  process.exit(1);
});

const dataAlreadyRetrieved = function (date) {
  return fs.pathExists(`./data/${date.format('YYYY/MM/DD')}/heart.json`);
};

const retrieveDataFor = function (date, callback) {
  const formattedDate = date.format('YYYY-MM-DD');
  getData(auth.getAccess().accessToken, formattedDate, function (err) {
    if (err !== null) {
      console.log(`Failed to get data for ${formattedDate}`);
      console.log(err);
      console.log('--------------------')
      console.log(err.response.data)
      return;
    }

    console.log(`Retrieved data for ${formattedDate}`);
    callback();
  });
}

const retrieveMissingData = function (dateFrom, callback) {
  const startingDate = moment(dateFrom).startOf('day');
  const daysBetween = moment().startOf('day').diff(startingDate, 'days') - 1;
  if (daysBetween + 1 <= 0) {
    console.log("Date provided is not in the past");
    callback(new Error("Date provided is not in the past"));
    return;
  }

  const getDataIfMissing = function (addedDays) {
    const dateToRetrieve = startingDate.clone().add(addedDays, 'days');
    dataAlreadyRetrieved(dateToRetrieve).then(function (exists) {
      if (exists) {
        console.log(`Data for ${dateToRetrieve.format('YYYY-MM-DD')} already exists`);
        if (addedDays < daysBetween) return getDataIfMissing(addedDays + 1);
        return callback();
      }

      retrieveDataFor(dateToRetrieve, function () {
        if (addedDays < daysBetween) return getDataIfMissing(addedDays + 1);
        return callback();
      });
    });
  };
  getDataIfMissing(0);
};

module.exports = function(dateFrom, callback) {
  const completed = function (err) {
    if (err) {
      console.log("Error encountered");
    } else {
      console.log("Completed");
    }

    if (_.isFunction(callback)) {
      callback(err);
    }
  };

  if (_.isEmpty(auth.getAccess())) {
    authenticate(function (err) {
      if (err !== null) {
        console.log('Unable to authenticate on fresh authentication', err);
        completed(err);
        return;
      }

      retrieveMissingData(dateFrom, completed);
    });

  } else {
    auth.test(function (err) {
      if (err !== null) {
        auth.refresh(function (err) {
          if (err !== null) {
            console.log('Unable to authenticate on token refresh', err.response.data);
            completed(err);
            return;
          }

          retrieveMissingData(dateFrom, completed);
        })
        return;
      }

      retrieveMissingData(dateFrom, completed);
    });
  }
};
