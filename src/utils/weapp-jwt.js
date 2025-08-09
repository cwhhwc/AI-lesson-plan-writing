// Base64 编码字符集
const b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
// Base64 正则表达式，用于验证 Base64 字符串格式
const b64re = /^(?:[A-Za-z\d+\/]{4})*?(?:[A-Za-z\d+\/]{2}(?:==)?|[A-Za-z\d+\/]{3}=?)?$/;

/**
 * Base64 解码函数（小程序环境兼容版本）
 * @param {string} string - 需要解码的 Base64 字符串
 * @returns {string} 解码后的原始字符串
 * @throws {TypeError} 当字符串格式不正确时抛出错误
 */
export function weAtob(string) {
    string = String(string).replace(/[\t\n\f\r ]+/g, "");
    if (!b64re.test(string))
        throw new TypeError("Failed to execute 'atob' on 'Window': The string to be decoded is not correctly encoded.");
    string += "==".slice(2 - (string.length & 3));
    let bitmap, result = "", r1, r2, i = 0;
    for (; i < string.length;) {
        bitmap = b64.indexOf(string.charAt(i++)) << 18 | b64.indexOf(string.charAt(i++)) << 12 |
            (r1 = b64.indexOf(string.charAt(i++))) << 6 | (r2 = b64.indexOf(string.charAt(i++)));
        result += r1 === 64 ? String.fromCharCode(bitmap >> 16 & 255) :
            r2 === 64 ? String.fromCharCode(bitmap >> 16 & 255, bitmap >> 8 & 255) :
                String.fromCharCode(bitmap >> 16 & 255, bitmap >> 8 & 255, bitmap & 255);
    }
    return result;
}

/**
 * Base64 解码 Unicode 字符串
 * @param {string} str - Base64 编码的字符串
 * @returns {string} 解码后的 Unicode 字符串
 */
function b64DecodeUnicode(str) {
    return decodeURIComponent(weAtob(str).replace(/(.)/g, function (p) {
        let code = p.charCodeAt(0).toString(16).toUpperCase();
        if (code.length < 2) {
            code = "0" + code;
        }
        return "%" + code;
    }));
}

/**
 * Base64URL 解码函数
 * 将 Base64URL 格式的字符串转换为标准 Base64 格式，然后解码
 * @param {string} str - Base64URL 格式的字符串
 * @returns {string} 解码后的字符串
 * @throws {Error} 当 Base64URL 字符串格式不正确时抛出错误
 */
function base64_url_decode(str) {
    let output = str.replace(/-/g, "+").replace(/_/g, "/");
    switch (output.length % 4) {
        case 0:
            break;
        case 2:
            output += "==";
            break;
        case 3:
            output += "=";
            break;
        default:
            throw "Illegal base64url string!";
    }
    try {
        return b64DecodeUnicode(output);
    }
    catch (err) {
        return weAtob(output);
    }
}

/**
 * JWT Token 解码函数（小程序环境兼容版本）
 * 解析 JWT Token 并返回指定部分的内容
 * @param {string} token - JWT Token 字符串
 * @param {Object} options - 解码选项
 * @param {boolean} options.header - 是否返回 header 部分，默认为 false（返回 payload）
 * @returns {Object} 解码后的 JSON 对象
 * @throws {Error} 当 token 格式不正确或解码失败时抛出错误
 */
function weappJwtDecode(token, options) {
    if (typeof token !== "string") {
        throw ("Invalid token specified");
    }
    options = options || {};
    const pos = options.header === true ? 0 : 1;
    try {
        return JSON.parse(base64_url_decode(token.split(".")[pos]));
    }
    catch (e) {
        throw ("Invalid token specified: " + e.message);
    }
}

export default weappJwtDecode;