const baseConfig = {
  name: 'MyGarage',
  slug: 'MyGarageApp',
  version: '1.0.0',
  scheme: 'mygarageapp',
  newArchEnabled: true,
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/images/MyGarage.jpg',
  },
  android: {
    package: 'com.my.garage',
  },
  extra: {
    buildNumber: 10,
    apiBaseUrl: 'https://mygarage-server.onrender.com/api',
  },
  experiments: {
    typedRoutes: true,
  },
};

module.exports = () => {
  const buildNumber =
    process.env.EXPO_PUBLIC_BUILD_NUMBER ||
    baseConfig.extra.buildNumber ||
    10;
  const apiBaseUrl =
    process.env.EXPO_PUBLIC_API_BASE_URL ||
    baseConfig.extra.apiBaseUrl ||
    'https://mygarage-server.onrender.com/api';

  return {
    expo: {
      ...baseConfig,
      extra: {
        ...baseConfig.extra,
        buildNumber,
        apiBaseUrl,
      },
    },
  };
};
