const axios = require('axios');
const _ = require('lodash');
const waterfall = require('async/waterfall');

const travisAccessToken = process.env.TRAVIS_ACCESS_TOKEN;
const githubUser = process.env.GITHUB_USER;
const githubRepository = 'fitbit-backuper';
const updatableVariables = ['FITBIT_ACCESS_TOKEN', 'FITBIT_REFRESH_TOKEN'];

const travisApi = axios.create({
  baseURL: 'https://api.travis-ci.org',
  headers: {
    Authorization: `token ${travisAccessToken}`
  }
});

const setEnvironmentVariables = function (env, callback) {
  console.log(' - Updating Travis environment variables');
  let repositoryId;

  travisApi.get(`/repos/${githubUser}/${githubRepository}`).then(function (repoResponse) {
    repositoryId = repoResponse.data.id;

    return travisApi.get(`/settings/env_vars?repository_id=${repositoryId}`);
  }).then(function (environmentVariablesResponse) {
    const travisVariables = environmentVariablesResponse.data.env_vars;

    waterfall(updatableVariables.map(function (name) {
      return function(next) {
        const { id: variableId } = _.find(travisVariables, { name });
        const data = { env_var: { name, value: env[name], public: false } };
        const variablePatchPath = `/settings/env_vars/${variableId}?repository_id=${repositoryId}`;
        travisApi.patch(variablePatchPath, data).then(function (response) {
          // TODO: Check response was successful
          next();
        });
      };
    }), callback);
  });
};

module.exports = {
  update: setEnvironmentVariables
};
