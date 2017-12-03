# Nightly Run

The code in this section is specificaly to enable the backuper to be run on
[Travis CI](https://travis-ci.org/) to pull in the previous days data, using the
Travis CI cron functionality. Each run will download the previous days data,
push that data to a Github repository of your choice as a new commit, and then
update the Travis CI environment variables for the Fitbit access and refresh
tokens, which may have changed.

## Setup

1. Fork this public repository - the Travis job will be running against it.
2. Log into Travis and view the settings for your newly forked `fitbit-backuper`
repository.
3. Add environment variables for:
   - Fitbit OAuth application settings; you'll need to read setup instructions
   in the main `README.md` for details on how to get these values
      - `FITBIT_CLIENT_ID`
      - `FITBIT_CLIENT_SECRET`
   - Fitbit credentials; you'll need to run the app locally once (see main
   `README.md`) and then get the details from `auth/access.json`
      - `FITBIT_ACCESS_TOKEN`
      - `FITBIT_REFRESH_TOKEN`
   - Github credentials; these will be used to push new data to your remote
   repository. It's also assumed that this repo has been forked under the same
   user.
      - `GITHUB_API_TOKEN`
      - `GITHUB_USER`
      - `GITHUB_REPOSITORY`
      - `GITHUB_REPOSITORY_BRANCH` (use `master` to push directly to master)
   - [Generated Travis access token](https://developer.travis-ci.com/authentication)
   which will be used to update the job environment fitbit variabled.
      - `TRAVIS_ACCESS_TOKEN`
4. In the Travis repo settings page, under "Cron Jobs", set up a daily job.
These jobs run at around the same time as they are set up (so to run it early
morning, you'll need to create the job in the early morning).
