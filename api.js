import Constants from 'expo-constants';

const getBaseUrl = () => {
  const hostUri = Constants.expoConfig?.hostUri;
  if (!hostUri) {
    // return 'http://localhost:8080/api';
    return 'https://mygarage-server.onrender.com/api';
  }
  const lanIp = hostUri.split(':')[ 0 ];
  return `http://${lanIp}:8080/api`;
};

export const API_BASE = getBaseUrl();
console.log('Using API:', API_BASE);

export default API_BASE;
