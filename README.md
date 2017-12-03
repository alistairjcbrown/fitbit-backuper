# Fitbit Backuper

## Setting up

1. Clone this repo
   ```
   git clone git@github.com:alistairjcbrown/fitbit-backuper.git
   ```

1. Install dependencies
   ```
   cd fitbit-backuper
   npm install
   ```

1. Set up a fitbit app
   - Go to https://dev.fitbit.com/apps/new
   - Log in with your fitbit account
   - Fill in the form (whatever details you like)
      - Defaults (personal app, read-only) don't need changed
      - For `Callback URL`, set to `http://localhost:3000/auth/fitbit/callback`

1. Create a settings file in `auth/` by copying the settings file example into place
   ```
   cp auth/settings.js.example auth/settings.js
   ```

1. Enter client id and client secret from fitbit app into `auth/settings.js`

1. The app should now be ready to run


## Running the application

Run the app by providing the earliest date to get data from (ie. the date you
started using fitbit). The app will check if data has already been pulled and,
if not, will pull the data for that date.

__Example:__
```
npm run backup -- 2017-11-01
```

All data will be put into the `data/` directory with subdirectories for year,
month and day. The raw JSON for each response will be put into separate files.

__Note:__ API calls are limited, so providing a large date range may run into
problems with rejected requests. Wait until the next hour before running again.

### Running for the first time

The first time you run the application, you'll need to log in. The output on the
console will promp you to open a webpage where you'll be able to log into
fitbit. This will provide the app with a oauth token (and refresh token) which
it can use on subsequent runs. These details are saved in the `auth/` directory.

### Running dailing on Travis

For more details running this every day, see the [nightly run section](nightly-run/).
