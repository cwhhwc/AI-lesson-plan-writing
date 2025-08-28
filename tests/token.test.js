import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setToken, getToken, removeToken } from '../src/utils/token.js';

describe('Token functions', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call uni.setStorageSync with the correct token', () => {
    const testToken = 'my-secret-token';

    setToken(testToken);

    expect(uni.setStorageSync).toHaveBeenCalled();
    expect(uni.setStorageSync).toHaveBeenCalledWith('token', testToken);
  });

  it('should call uni.getStorageSync and return the stored token', () => {
    const storedToken = 'retrieved-token';
    uni.getStorageSync.mockReturnValue(storedToken);

    const result = getToken();

    expect(uni.getStorageSync).toHaveBeenCalledWith('token');
    expect(result).toBe(storedToken);
  });

  it('should call uni.removeStorageSync with the correct key', () => {
    removeToken();

    expect(uni.removeStorageSync).toHaveBeenCalledWith('token');
  });
});
