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

/**
 * @fileoverview 和表单相关的工具方法
 * @typedef {import('react-final-form/typescript').FieldMetaState<any>} FieldMetaState
 */

export const FORM_HELPER = {
  /**
   * 获取表单项状态
   * @param {{ meta: FieldMetaState }} field 表单项
   * @returns {any}
   */
  getStatus({ meta }: { meta: any }) {
    const { touched, error } = meta;
    return touched && error ? 'error' : null;
  },

  /**
   * 获取表单项提示信息/校验信息
   * @param {{ meta: FieldMetaState }} field 表单项
   * @param {string} defaultMessage 默认信息
   */
  getMessage({ meta }: { meta: any }, defaultMessage = '') {
    const { touched, error } = meta;
    if (touched) {
      return error || defaultMessage;
    }
    return defaultMessage;
  },
};
