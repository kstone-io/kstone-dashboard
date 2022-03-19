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

import { Navigate, useRoutes } from 'react-router-dom';
import Layout from 'src/components/Layout';
import {
  Cluster,
  Add as AddCluster,
  Update as UpdateCluster,
  Create as CreateCluster,
} from 'src/pages/cluster';
import { menu } from 'src/configs/menu';
import { Visualization } from 'src/pages/visualization';
import { Monitor } from 'src/pages/monitor';
import { Backup } from 'src/pages/backup';
import { Login, ResetPassword } from 'src/pages/login';

import './App.css';

function App(): JSX.Element {
  const mainRoutes = [
    {
      path: '/',
      element: <Layout menu={menu} />,
      children: [
        { path: '*', element: <Navigate to="/404" /> },
        { path: '/', element: <Cluster /> },
        { path: 'cluster', element: <Cluster /> },
        { path: 'cluster/add', element: <AddCluster /> },
        { path: 'cluster/create', element: <CreateCluster /> },
        { path: 'cluster/:name', element: <UpdateCluster /> },
        { path: 'visualization', element: <Visualization /> },
        { path: 'monitor', element: <Monitor /> },
        { path: 'backup', element: <Backup /> },
      ],
    },
    { path: '/reset', element: <ResetPassword />},
    { path: '/login', element: <Login /> }
  ];

  const routing = useRoutes(mainRoutes);
  return <>{routing}</>;
}

export default App;
