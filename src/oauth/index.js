const _ = require('lodash');
const fs = require('fs-extra');
const express = require('express');
const FitbitStrategy = require( 'passport-fitbit-oauth2' ).FitbitOAuth2Strategy;
const passport = require('passport');
const settings = require('../../auth/settings');

const PORT = 3000;
const ROOT_PATH = '/auth/fitbit'
const CALLBACK_PATH = `${ROOT_PATH}/callback`;
const SUCCESS_PATH = `${ROOT_PATH}/success`
const FAILURE_PATH = `${ROOT_PATH}/failure`

module.exports = function(callback) {
  const fitbitStrategy = new FitbitStrategy(_.extend({
    scope: ['activity', 'heartrate', 'location', 'nutrition', 'profile', 'settings', 'sleep', 'social', 'weight'],
    callbackURL: `http://localhost:${PORT}${CALLBACK_PATH}`
  }, settings.oauth), function(accessToken, refreshToken, profile, done) {

    const payload = {
      accessToken: accessToken,
      refreshToken: refreshToken
    };

    fs.writeFile(`auth/access.json`, JSON.stringify(payload, null, 4)).then(() => done(null, payload));
  });

  const fitbitAuthenticate = passport.authenticate('fitbit', {
    successRedirect: SUCCESS_PATH,
    failureRedirect: FAILURE_PATH,
    session: false
  });

  const app = express();
  app.use(passport.initialize());
  passport.use(fitbitStrategy);

  app.get(ROOT_PATH, fitbitAuthenticate);
  app.get(CALLBACK_PATH, fitbitAuthenticate);

  app.get(SUCCESS_PATH, function(req, res) {
    res.send('Success');
    server.close();
    callback(null);
  });

  app.get(FAILURE_PATH, function(req, res) {
    res.send('Failed');
    server.close();
    callback(new Error('Failed'));
  });

  const server = app.listen(PORT);

  console.log(`Open a webpage at: http://localhost:${PORT}${ROOT_PATH}`);
};
