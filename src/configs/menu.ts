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
import i18n from 'src/languages/i18n';

/**
 * 定义导航菜单
 */
export const menu: AppMenu = {
  title: 'kstone',
  items: [
    {
      key: 'clusterManager',
      title: i18n.t('ClusterManagement'),
      items: [
        {
          key: 'addCluster',
          route: '/cluster/add',
          title: i18n.t('ImortCluster'),
        },
        {
          key: 'cluster',
          route: '/cluster',
          title: i18n.t('ClusterManagement'),
        },
      ],
    },
    {
      title: i18n.t('OperationCenter'),
      key: 'operation',
      items: [
        {
          key: 'visualization',
          route: '/visualization',
          title: i18n.t('VisualizationTool'),
        },
        {
          key: 'monitor',
          route: '/monitor',
          title: i18n.t('MonitorAndInspection'),
        },
        {
          key: 'backup',
          route: '/backup',
          title: i18n.t('BackupManagement'),
        },
      ],
    },
  ],
};
