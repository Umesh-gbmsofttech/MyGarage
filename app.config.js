const baseConfig = require('./app.json');

module.exports = () => {
  const buildNumber =
    process.env.EXPO_PUBLIC_BUILD_NUMBER ||
    baseConfig.expo?.extra?.buildNumber ||
    10;
  const apiBaseUrl =
    process.env.EXPO_PUBLIC_API_BASE_URL ||
    baseConfig.expo?.extra?.apiBaseUrl ||
    'https://mygarage-server.onrender.com/api';

  return {
    ...baseConfig,
    expo: {
      ...baseConfig.expo,
      android: {
        ...baseConfig.expo.android,
      },
      ios: {
        ...baseConfig.expo.ios,
      },
      extra: {
        ...baseConfig.expo.extra,
        buildNumber,
        apiBaseUrl,
      },
    },
  };
};
