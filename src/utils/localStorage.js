// src/utils/localStorage.js
// 本地存储工具类

/**
 * 设置存储数据
 * @param {string} key 存储键名
 * @param {any} value 存储值，自动序列化
 * @returns {boolean} 是否设置成功
 */
export function setStorage(key, value) {
  try {
    const serializedValue = JSON.stringify(value);
    uni.setStorageSync(key, serializedValue);
    return true;
  } catch (error) {
    console.error('存储数据失败:', error);
    return false;
  }
}

/**
 * 获取存储数据
 * @param {string} key 存储键名
 * @param {any} defaultValue 默认值
 * @returns {any} 存储的数据，自动反序列化
 */
export function getStorage(key, defaultValue = null) {
  try {
    const serializedValue = uni.getStorageSync(key);
    if (serializedValue === '' || serializedValue === null || serializedValue === undefined) {
      return defaultValue;
    }
    return JSON.parse(serializedValue);
  } catch (error) {
    console.error('获取数据失败:', error);
    return defaultValue;
  }
}

/**
 * 删除存储数据
 * @param {string} key 存储键名
 * @returns {boolean} 是否删除成功
 */
export function removeStorage(key) {
  try {
    uni.removeStorageSync(key);
    return true;
  } catch (error) {
    console.error('删除数据失败:', error);
    return false;
  }
}

/**
 * 清空所有存储数据
 * @returns {boolean} 是否清空成功
 */
export function clearStorage() {
  try {
    uni.clearStorageSync();
    return true;
  } catch (error) {
    console.error('清空存储失败:', error);
    return false;
  }
}

/**
 * 检查存储键是否存在
 * @param {string} key 存储键名
 * @returns {boolean} 是否存在
 */
export function hasStorage(key) {
  try {
    const value = uni.getStorageSync(key);
    return value !== '' && value !== null && value !== undefined;
  } catch (error) {
    console.error('检查存储失败:', error);
    return false;
  }
}

/**
 * 获取所有存储键名
 * @returns {Array<string>} 所有键名数组
 */
export function getAllKeys() {
  try {
    const info = uni.getStorageInfoSync();
    return info.keys || [];
  } catch (error) {
    console.error('获取存储键名失败:', error);
    return [];
  }
}

/**
 * 获取存储信息
 * @returns {Object} 存储信息（键数量、占用空间等）
 */
export function getStorageInfo() {
  try {
    return uni.getStorageInfoSync();
  } catch (error) {
    console.error('获取存储信息失败:', error);
    return { keys: [], currentSize: 0, limitSize: 0 };
  }
}

/**
 * 批量设置存储数据
 * @param {Object} data 键值对对象
 * @returns {boolean} 是否全部设置成功
 */
export function setBatchStorage(data) {
  try {
    let allSuccess = true;
    for (const [key, value] of Object.entries(data)) {
      const success = setStorage(key, value);
      if (!success) {
        allSuccess = false;
      }
    }
    return allSuccess;
  } catch (error) {
    console.error('批量设置存储失败:', error);
    return false;
  }
}

/**
 * 批量获取存储数据
 * @param {Array<string>} keys 键名数组
 * @param {any} defaultValue 默认值
 * @returns {Object} 键值对对象
 */
export function getBatchStorage(keys, defaultValue = null) {
  try {
    const result = {};
    keys.forEach(key => {
      result[key] = getStorage(key, defaultValue);
    });
    return result;
  } catch (error) {
    console.error('批量获取存储失败:', error);
    return {};
  }
}

/**
 * 批量删除存储数据
 * @param {Array<string>} keys 键名数组
 * @returns {boolean} 是否全部删除成功
 */
export function removeBatchStorage(keys) {
  try {
    let allSuccess = true;
    keys.forEach(key => {
      const success = removeStorage(key);
      if (!success) {
        allSuccess = false;
      }
    });
    return allSuccess;
  } catch (error) {
    console.error('批量删除存储失败:', error);
    return false;
  }
}