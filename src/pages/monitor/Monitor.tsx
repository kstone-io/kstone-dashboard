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

import { useEffect } from 'react';
import { Layout, Typography, Select, Empty } from 'antd';
import { useState } from 'react';

import http from 'src/utils/http';
import { useTranslation } from 'react-i18next';

const { Text } = Typography;
const { Header, Content } = Layout;

const GrafanaUrl =
  '/grafana/d/Hw7tu7aZz123123/kstone?var-datasource=KSTONE-PROM&theme=light&kiosk=tv&orgId=1&var-job=';

export function Monitor(): JSX.Element {
  const [grafanaUrl, setGrafanaUrl] = useState('');
  const [clusterList, setClusterList] = useState([]);
  const [clusterName, setClusterName] = useState('');
  const [cluster, setCluster] = useState({} as any);
  const { t } = useTranslation();

  const getEtcdCluster = async () => {
    http.get('/apis/etcdclusters').then((resp) => {
      if (resp.data.items.length) {
        setClusterList(resp.data.items);
        setClusterName(resp.data.items[0].metadata.name);
        setCluster(resp.data.items[0]);
        setGrafanaUrl(`${GrafanaUrl}${resp.data.items[0].metadata.name}`);
      }
    });
  };

  useEffect(() => {
    getEtcdCluster();
  }, []);

  return (
    <Layout
      style={{
        height: '100%',
      }}
    >
      <Header className="site-layout-background" style={{ padding: 0 }}>
        <Text
          strong
          style={{ float: 'left', marginLeft: '15px', marginRight: '15px' }}
        >
          {t('ClusterMonitor')}:
        </Text>
        <Select
          style={{ marginTop: '5px', minWidth: '150px' }}
          options={clusterList.map((item: any) => ({
            value: item.metadata.name,
            text: item.metadata.name,
          }))}
          value={clusterName}
          onChange={(value) => {
            setClusterName(value);
            setCluster(
              clusterList.filter((item: any) => {
                return item.metadata.name === value;
              })[0],
            );
            setGrafanaUrl(`${GrafanaUrl}${value}`);
          }}
          placeholder={t('PleaseSelectEtcdCluster')}
          size="large"
        >
          {clusterList.map((item: any) => {
            return (
              <Select.Option
                key={item.metadata.name}
                value={item.metadata.name}
              >
                {item.metadata.name}
              </Select.Option>
            );
          })}
        </Select>
      </Header>
      <Content
        className="site-layout-background"
        style={{
          minHeight: '100%',
          height: '100%',
          width: '100%',
          padding: '0',
          margin: '0',
        }}
      >
        <div style={{ height: '100%', width: '100%', margin: '0px' }}>
          {cluster.metadata === undefined ||
          cluster.metadata.labels === undefined ||
          (cluster.metadata.labels.monitor === 'false' &&
            cluster.metadata.labels.consistency === 'false' &&
            cluster.metadata.labels.healthy === 'false' &&
            cluster.metadata.labels.request === 'false') ? (
            <>
              {
                <Empty
                  style={{ height: '100%' }}
                  description={`${t(
                    'Cluster',
                  )} ${clusterName} ${t('HasNotYetEnabledTheMonitorFeature')}`}
                />
              }
            </>
          ) : (
            <iframe
              title="etcd monitor"
              src={grafanaUrl}
              width="100%"
              height="100%"
            ></iframe>
          )}
        </div>
      </Content>
    </Layout>
  );
}
