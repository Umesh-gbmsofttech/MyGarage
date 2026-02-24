import apiClient from './apiClient';

const api = {
  signupOwner: (payload) => apiClient.request({ path: '/api/auth/signup/owner', method: 'POST', body: payload }),
  signupMechanic: (payload) => apiClient.request({ path: '/api/auth/signup/mechanic', method: 'POST', body: payload }),
  signin: (payload) => apiClient.request({ path: '/api/auth/signin', method: 'POST', body: payload }),

  getProfile: (token) => apiClient.request({ path: '/api/profile/me', token }),
  updateProfile: (token, payload) =>
    apiClient.request({ path: '/api/profile/me', method: 'PUT', token, body: payload }),
  uploadProfileImage: (token, formData) =>
    apiClient.request({ path: '/api/profile/upload-avatar', method: 'POST', token, body: formData }),

  topRatedMechanics: (limit = 5) => apiClient.request({ path: `/api/mechanics/top-rated?limit=${limit}` }),
  randomMechanics: (limit = 10) => apiClient.request({ path: `/api/mechanics/random?limit=${limit}` }),
  searchMechanics: ({ query, lat, lng, radiusKm = 5 }) => {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (lat !== undefined && lng !== undefined) {
      params.append('lat', lat);
      params.append('lng', lng);
    }
    params.append('radiusKm', radiusKm);
    return apiClient.request({ path: `/api/mechanics/search?${params.toString()}` });
  },

  createBooking: (token, payload) =>
    apiClient.request({ path: '/api/bookings', method: 'POST', token, body: payload }),
  respondBooking: (token, id, payload) =>
    apiClient.request({ path: `/api/bookings/${id}/respond`, method: 'POST', token, body: payload }),
  verifyMeetOtp: (token, id, payload) =>
    apiClient.request({ path: `/api/bookings/${id}/verify-meet-otp`, method: 'POST', token, body: payload }),
  verifyCompleteOtp: (token, id, payload) =>
    apiClient.request({ path: `/api/bookings/${id}/verify-complete-otp`, method: 'POST', token, body: payload }),
  generateCompleteOtp: (token, id) =>
    apiClient.request({ path: `/api/bookings/${id}/generate-complete-otp`, method: 'POST', token }),
  bookingSummary: (token, id) =>
    apiClient.request({ path: `/api/bookings/${id}/summary`, token }),
  ownerBookings: (token) => apiClient.request({ path: '/api/bookings/owner', token }),
  mechanicBookings: (token) => apiClient.request({ path: '/api/bookings/mechanic', token }),

  verifyOtp: (token, bookingId, payload) =>
    apiClient.request({ path: `/api/otp/bookings/${bookingId}/verify`, method: 'POST', token, body: payload }),

  updateLocation: (token, bookingId, payload) =>
    apiClient.request({ path: `/api/locations/bookings/${bookingId}`, method: 'POST', token, body: payload }),
  getLocations: (token, bookingId) =>
    apiClient.request({ path: `/api/locations/bookings/${bookingId}`, token }),
  getLiveLocation: (token, bookingId) =>
    apiClient.request({ path: `/api/live-location/${bookingId}`, token }),

  notifications: (token) => apiClient.request({ path: '/api/notifications', token }),
  markAllNotificationsRead: (token) =>
    apiClient.request({ path: '/api/notifications/read-all', method: 'POST', token }),

  platformReviews: () => apiClient.request({ path: '/api/reviews/platform' }),
  mechanicReviews: (mechanicId) => apiClient.request({ path: `/api/reviews/mechanics/${mechanicId}` }),
  createReview: (token, payload) => apiClient.request({ path: '/api/reviews', method: 'POST', token, body: payload }),

  adminSettings: (token) => apiClient.request({ path: '/api/admin/settings', token }),
  updateAdminSettings: (token, payload) =>
    apiClient.request({ path: '/api/admin/settings', method: 'PUT', token, body: payload }),
  adminBanners: (token) => apiClient.request({ path: '/api/admin/banners', token }),
  uploadBanner: (token, formData) =>
    apiClient.request({ path: '/api/admin/banners/upload', method: 'POST', token, body: formData }),
  deleteBanner: (token, id) => apiClient.request({ path: `/api/admin/banners/${id}`, method: 'DELETE', token }),
  updateMechanicVisibility: (token, id, visible) =>
    apiClient.request({ path: `/api/admin/mechanics/${id}/visibility/${visible}`, method: 'PUT', token }),

  chat: (message) =>
    apiClient.request({ path: '/api/chat', method: 'POST', body: { message } }),
  mapsConfig: () =>
    apiClient.request({ path: '/api/maps/config' }),
  mapsDirections: (payload) =>
    apiClient.request({ path: '/api/maps/directions', method: 'POST', body: payload }),
};

export default api;
