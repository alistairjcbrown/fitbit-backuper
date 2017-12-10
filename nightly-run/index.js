require('dotenv').load();
const path = require('path');
const _ = require('lodash');
const dir = require('node-dir');
const moment = require('moment');
const runBackupFrom = require('../src');
const auth = require('../src/auth');
const github = require('./github');
const travis = require('./travis');

const getBoundaryDate = function () {
  if (process.argv[2]) return moment(process.argv[2]).format('YYYY-MM-DD');
  return moment().subtract(1, 'days').format('YYYY-MM-DD');
};

const boundaryDate = getBoundaryDate();

console.log('Running nightly backup\n');
console.log(` - Pulling data for ${boundaryDate}`)
console.log('------------------------------------------------');
runBackupFrom(boundaryDate, function (err) {
  console.log('------------------------------------------------');
  if (err) throw err;

  const dataPath = path.join(__dirname, '../data');
  console.log(` - Reading in pulled data from ${dataPath}`)

  const fileContents = [];
  dir.readFiles(dataPath, function(err, content, next) {
    if (err) throw err;
    fileContents.push(content);
    next();
  }, function(err, fileNames){
    if (err) throw err;
    const files = _.zip(fileNames, fileContents).map(function ([ absolutePath, content ]) {
      const filepath = path.relative(process.cwd(), absolutePath);
      return { path: `fitbit${path.sep}${filepath}`, content };
    });

    // TODO: Confirm data is good

    github.push(boundaryDate, files, function (err) {
      if (err) throw err;

      const travisAccessToken = process.env.TRAVIS_ACCESS_TOKEN;
      if (!travisAccessToken) {
        console.log('No Travis token available - assuming local run');
        console.log('Run complete');
        return;
      }

      const access = auth.getAccess();
      const environmentVariables = {
        FITBIT_ACCESS_TOKEN: access.accessToken,
        FITBIT_REFRESH_TOKEN: access.refreshToken
      };

      travis.update(environmentVariables, function (err) {
        if (err) throw err;

        console.log('\nRun complete');
      });
    });
  });
});
