import Constants from 'expo-constants';

const extra =
  Constants.expoConfig?.extra ||
  Constants.manifest?.extra ||
  Constants.manifest2?.extra?.expoClient ||
  {};

const API_BASE_URL = extra.apiBaseUrl || '';
const BUILD_NUMBER = extra.buildNumber || null;

export { API_BASE_URL, BUILD_NUMBER };
