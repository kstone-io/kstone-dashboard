/*
 * Tencent is pleased to support the open source community by making TKEStack
 * available.
 *
 * Copyright (C) 2012-2023 Tencent. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use
 * this file except in compliance with the License. You may obtain a copy of the
 * License at
 *
 * https://opensource.org/licenses/Apache-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OF ANY KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations under the License.
 */

import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { message } from 'antd';
import i18n from 'src/languages/i18n';
import cookies from './cookies';

const showStatus = (status: number) => {
  let message = '';
  switch (status) {
    case 400:
      message = i18n.t('400BadRequest');
      break;
    case 401:
      message = i18n.t('401Unauthorized');
      break;
    case 403:
      message = i18n.t('403Forbidden');
      break;
    case 404:
      message = i18n.t('404NotFound');
      break;
    case 408:
      message = i18n.t('408RequestTimeout');
      break;
    case 500:
      message = i18n.t('InternalServerError');
      break;
    case 501:
      message = i18n.t('NotImplemented');
      break;
    case 502:
      message = i18n.t('502BadGateway');
      break;
    case 503:
      message = i18n.t('ServiceUnavailable');
      break;
    case 504:
      message = i18n.t('504GatewayTimeout');
      break;
    case 505:
      message = i18n.t('HTTPVersionNotSupported');
      break;
    default:
      message = `${i18n.t('ConnectionError')}(${status})!`;
  }
  return `${message}，${i18n.t(
    'PleaseCheckTheNetworkOrContactTheAdministrator',
  )}!`;
};

const HTTP = axios.create({
  // 是否跨站点访问控制请求
  withCredentials: true,
  timeout: 200000,
  transformRequest: [
    (data) => {
      data = JSON.stringify(data);
      return data;
    },
  ],
  validateStatus() {
    // 使用async-await，处理reject情况较为繁琐，所以全部返回resolve，在业务代码中处理异常
    return true;
  },
});

// 请求拦截器
HTTP.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const cnf = config as any;
    // 为所有的请求设置token
    const token = cookies.get("token");
    if (token) {
      cnf.headers["kstone-api-jwt"] = token;
    }
    return cnf;
  },
  (error) => {
    // 错误抛到业务代码
    error.data = {};
    error.data.msg = i18n.t('TheServerIsAbnormal');
    message.error({ content: error.data.msg });
    return Promise.resolve(error);
  },
);

// 响应拦截器
HTTP.interceptors.response.use(
  (response: AxiosResponse) => {
    const status = response.status;
    let msg = '';
    if (status < 200 || status >= 300) {
      // 处理http错误，抛到业务代码
      msg = response.data?.message ?? showStatus(status);
      if (typeof response.data === 'string') {
        response.data = { msg };
      } else {
        response.data.msg = msg;
      }
      if (status === 401) {
        debugger;
        if (window.location.href.indexOf('login') === -1) {
          window.location.href = '/login';
        }
      }
      message.error({ content: response.data.message || response.data.msg });
    } else {
      return response;
    }
  },
  (error) => {
    // 错误抛到业务代码
    error.data = {};
    error.data.msg = i18n.t('TheRequestTimedOutOrTheServerWasAbnormal');
    message.error({ content: error.data.msg });
    return Promise.resolve(error);
  },
);

export default HTTP;
