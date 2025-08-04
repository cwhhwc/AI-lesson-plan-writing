// src/utils/token.js
export function setToken(token) {
  uni.setStorageSync('token', token);
}

export function getToken() {
  return uni.getStorageSync('token');
}

export function removeToken() {
  uni.removeStorageSync('token');
} 