const GithubAPI = require('./github-api-push');

const githubApiToken = process.env.GITHUB_API_TOKEN;
const githubUser = process.env.GITHUB_USER;
const githubRepository = process.env.GITHUB_REPOSITORY;
const githubRepositoryBranch = process.env.GITHUB_REPOSITORY_BRANCH;

const pushNewCommit = function (boundaryDate, data, callback) {
  console.log(` - Pushing data to Github repo '${githubUser}/${githubRepository}#${githubRepositoryBranch}'`);
  const api = new GithubAPI({ token: githubApiToken });
  api.setRepo(githubUser, githubRepository);
  api.setBranch(githubRepositoryBranch)
    .then(() => api.pushFiles(`Fitbit backup for ${boundaryDate}`, data))
    .then(function (response) {
      // TODO: Check response was successful
      callback()
    });
};

module.exports = {
  push: pushNewCommit
};
