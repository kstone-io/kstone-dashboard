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

import { AppMenu } from '../models/menu';

/**
 * 定义导航菜单
 */
export const menu: AppMenu = {
  title: 'kstone',
  items: [
    {
      key: 'clusterManager',
      title: '集群管理',
      items:
      [
        {
          key: 'addCluster',
          route: '/cluster/add',
          title: '关联集群'
        },
        {
          key: 'cluster',
          route: '/cluster',
          title: '集群管理'
        },
      ]
    },
    {
      title: '运维中心',
      key: 'operation',
      items:
      [
        {
          key: 'visualization',
          route: '/visualization',
          title: '可视化工具',
        },
        {
          key: 'monitor',
          route: '/monitor',
          title: '监控和巡检'
        },
        {
          key: 'backup',
          route: '/backup',
          title: '备份管理'
        }
      ]
    },
  ]
};
