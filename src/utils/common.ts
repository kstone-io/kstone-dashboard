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
import i18n from 'src/languages/i18n';

const prefix = 'dynamic-inserted-css-';

// CheckEndpoint
export function CheckEndpoint(endpoint: string): string {
  let endpointMsg = '';

  if (endpoint) {
    if (endpoint.indexOf(':') === -1) {
      endpointMsg = i18n.t('PleaseInputTheEtcdAccessPort');
    } else {
      if (endpoint.split(':')[1].length < 2) {
        endpointMsg = i18n.t('PleaseInputTheCorrectEtcdAccessPort');
      }
    }
  } else {
    endpointMsg = i18n.t('PleaseInputTheAccessAddress');
  }

  return endpointMsg;
}

// CheckK8sName
export function CheckK8sName(name: string): string {
  let k8sNameMsg = '';

  const reg = /^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/;

  if (name) {
    if (reg.test(name)) {
      k8sNameMsg = '';
    } else {
      k8sNameMsg = `${i18n.t(
        'TheInputNameDoesNotMeetTheRulesPleaseReferToTheRegularRules',
      )} [a-z0-9]([-a-z0-9]*[a-z0-9])?`;
    }
  } else {
    k8sNameMsg = i18n.t('PleaseInputTheCorrespondingName');
  }

  return k8sNameMsg;
}

/**
 * insert css to the current page
 * */
export function insertCSS(id: string, cssText: string): HTMLStyleElement {
  let style: HTMLStyleElement;
  style = document.getElementById(prefix + id) as HTMLStyleElement;
  if (!style) {
    style = document.createElement('style');
    style.id = prefix + id;

    // IE8/9 can not use document.head
    document.getElementsByTagName('head')[0].appendChild(style);
  }
  if (style.textContent !== cssText) {
    style.textContent = cssText;
  }
  return style;
}

// FormatBytes
export function FormatBytes(a: number, b: number): string {
  if (0 === a) return '0 Bytes';
  const c = 1024,
    d = b || 2,
    e = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
    f = Math.floor(Math.log(a) / Math.log(c));
  return parseFloat((a / Math.pow(c, f)).toFixed(d)) + ' ' + e[f];
}

// GenerateOwnerReferences generates ownerReferences by etcdName
export function GenerateOwnerReferences(etcdName: string, uid: string): any {
  return [
    {
      apiVersion: 'kstone.tkestack.io/v1alpha1',
      kind: 'EtcdCluster',
      name: etcdName,
      uid: uid,
    }
  ];
}