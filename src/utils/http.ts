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

const showStatus = (status: number) => {
  let message = '';
  switch (status) {
    case 400:
      message = '请求错误(400)';
      break;
    case 401:
      message = '未授权，请重新登录(401)';
      break;
    case 403:
      message = '拒绝访问(403)';
      break;
    case 404:
      message = '请求出错(404)';
      break;
    case 408:
      message = '请求超时(408)';
      break;
    case 500:
      message = '服务器错误(500)';
      break;
    case 501:
      message = '服务未实现(501)';
      break;
    case 502:
      message = '网络错误(502)';
      break;
    case 503:
      message = '服务不可用(503)';
      break;
    case 504:
      message = '网络超时(504)';
      break;
    case 505:
      message = 'HTTP版本不受支持(505)';
      break;
    default:
      message = `连接出错(${status})!`;
  }
  return `${message}，请检查网络或联系管理员！`;
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
    return config;
  },
  (error) => {
    // 错误抛到业务代码
    error.data = {};
    error.data.msg = '服务器异常！';
    message.error({ content: error.data.msg });
    return Promise.resolve(error);
  }
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
      message.error({ content: response.data.message || response.data.msg });
    } else {
      return response;
    }
  },
  (error) => {
    // 错误抛到业务代码
    error.data = {};
    error.data.msg = '请求超时或服务器异常！';
    message.error({ content: error.data.msg });
    return Promise.resolve(error);
  }
);

export default HTTP;
