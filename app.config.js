// Extends app.json. Adds Google Sign-In config (google-services.json) when the file exists,
// and sets the Android versionCode from the CI run number so installs can be updated in place.
const fs = require('fs');

module.exports = ({ config }) => {
  const android = { ...(config.android || {}) };
  if (fs.existsSync('./google-services.json')) android.googleServicesFile = './google-services.json';
  const build = parseInt(process.env.APP_BUILD || '', 10);
  if (build > 0) android.versionCode = build;
  return { ...config, android };
};
