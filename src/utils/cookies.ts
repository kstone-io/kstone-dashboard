import Cookies from 'js-cookie';

const cookies = {} as any;

/**
 * @description 存储 cookie 值
 * @param {String} name cookie name
 * @param {String} value cookie value
 * @param {Object} setting cookie setting
 */
cookies.set = function (name = 'default', value = '', cookieSetting = {}) {
  const currentCookieSetting = {
    expires: 1,
  };
  Object.assign(currentCookieSetting, cookieSetting);
  Cookies.set(`${name}`, JSON.stringify(value), currentCookieSetting);
};

/**
 * @description 拿到 cookie 值
 * @param {String} name cookie name
 */
cookies.get = function (name = 'default') {
  let uu = Cookies.get(`${name}`) as any;
  try {
    if (typeof JSON.parse(uu) != 'number') {
      uu = JSON.parse(uu);
    }
  } catch (e) {}
  return uu;
};

/**
 * @description 拿到 cookie 全部的值
 */
cookies.getAll = function () {
  return Cookies.get();
};

/**
 * @description 删除 cookie
 * @param {String} name cookie name
 */
cookies.remove = function (name = 'default') {
  return Cookies.remove(name);
};

export default cookies;