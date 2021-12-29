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

import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Layout,
  Tag,
  Dropdown,
  Modal,
  Tooltip,
  Typography,
  Menu,
  Space,
} from 'antd';
import { YamlModal } from 'src/components/YamlModal';
import { ClusterFeatureModal } from 'src/components/ClusterFeatureModal';
import http from 'src/utils/http';
import { useTranslation } from 'react-i18next';
const { Header, Content } = Layout;
const { Text } = Typography;

// Cluster cluster page
export function Cluster(): JSX.Element {
  const [clusterList, setClusterList] = useState([]);
  const [cluster, setCluster] = useState({} as any);
  const [visible, setVisible] = useState(false);
  const [yamlVisible, setYamlVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();
  // handle operation
  const onOperation = (key: string, cluster: any) => {
    // handle edit
    if (key === 'edit') {
      window.location.href = `/cluster/${cluster.metadata.name}`;
    }
    // handle feature gates
    if (key === 'featureGates') {
      setCluster(cluster);
      setVisible(true);
    }
    // view with yaml
    if (key === 'yaml') {
      setCluster(cluster);
      setYamlVisible(true);
    }
  };
  // columnList table column
  const columnList = [
    {
      key: 'name',
      title: t('Name'),
      render: (cluster: any) => (
        <>
          <p>{cluster.metadata.name}</p>
        </>
      ),
    },
    {
      key: 'status',
      title: () => (
        <>
          {t('Status')}
          <Tooltip title={t('StatusDescription')}>
            {/* <Icon type='info' /> */}
          </Tooltip>
        </>
      ),
      width: 100,
      render: (cluster: any) => {
        if (cluster.status === undefined) {
          return <Tag>Unknown</Tag>;
        }
        if (cluster.status.phase === 'Running') {
          return <Tag color="green">{t('Normal')}</Tag>;
        }
        if (cluster.status.phase === 'stopped') {
          return <Tag color="green">{t('NorExceptionmal')}</Tag>;
        }
        return <Tag>{cluster.status.phase}</Tag>;
      },
    },
    {
      key: 'clusterType',
      title: t('ClusterType'),
      render: (cluster: any) => (
        <>
          <p>{cluster.spec.clusterType}</p>
        </>
      ),
    },
    {
      key: 'memberCount',
      title: t('NodeNumber'),
      render: (cluster: any) => (
        <>
          <p>{cluster.spec.size}</p>
        </>
      ),
    },
    {
      key: 'spec',
      title: t('Configurations'),
      render: (cluster: any) => (
        <>
          <p>
            {cluster.spec.totalCpu}{t('Core')} {cluster.spec.totalMem}GB
          </p>
        </>
      ),
    },
    {
      key: 'disk',
      title: t('DiskConfiguration'),
      render: (cluster: any) => (
        <>
          <p>
            {cluster.spec.diskType}{' '}
            {cluster.spec.diskSize === 0 ? <></> : `${cluster.spec.diskSize}GB`}
          </p>
        </>
      ),
    },
    {
      key: 'operation',
      title: t('Operation'),
      render: (cluster: any) => {
        const dropDownMenu = (
          <Menu onClick={(value) => onOperation(value.key, cluster)}>
            <Menu.Item key="edit">{t('Edit')}</Menu.Item>
            <Menu.Item key="featureGates">{t('ClusterFeature')}</Menu.Item>
            <Menu.Item key="yaml">{t('ViewYaml')}</Menu.Item>
          </Menu>
        );
        return (
          <>
            <Dropdown overlay={dropDownMenu}>
              <a
                href="/#"
                className="ant-dropdown-link"
                onClick={(e) => e.preventDefault()}
              >
                {t('Operation')}
              </a>
            </Dropdown>
            <Button
              type="link"
              onClick={() => {
                setCluster(cluster);
                setDeleteVisible(true);
              }}
            >
              {t('Delete')}
            </Button>
          </>
        );
      },
    },
  ];
  // fetch cluster list from api
  const getEtcdClusters = () => {
    setIsLoading(true);
    http.get('/apis/etcdclusters').then((resp) => {
      setClusterList(
        resp.data.items?.map((item: any) => {
          item.key = item.metadata.name;
          return item;
        }),
      );
      setIsLoading(false);
    });
  };

  useEffect(() => {
    getEtcdClusters();
  }, []);
  // render
  return (
    <>
      <Layout>
        <Header className="site-layout-background" style={{ padding: 0 }}>
          <Text strong style={{ float: 'left', marginLeft: '15px' }}>
            {t('ClusterManagement')}
          </Text>
        </Header>
        <Content
          className="site-layout-background"
          style={{
            margin: '30px 30px',
            padding: 24,
            minHeight: 280,
          }}
        >
          <Space>
            <Button
              type="primary"
              onClick={() => {
                window.location.href = '/cluster/add';
              }}
            >
              {t('ImortCluster')}
            </Button>
            <Button
              type="primary"
              onClick={() => {
                window.location.href = '/cluster/create';
              }}
            >
              {t('CreateCluster')}
            </Button>
          </Space>
          <Table
            dataSource={clusterList}
            columns={columnList}
            loading={isLoading}
            style={{ marginTop: '10px' }}
          />
        </Content>
      </Layout>
      {yamlVisible ? (
        <YamlModal
          onclose={() => {
            setYamlVisible(false);
          }}
          data={cluster}
          visible={yamlVisible}
        />
      ) : null}
      {deleteVisible ? (
        <Modal
          visible={deleteVisible}
          title={t('ConfirmDelete')}
          onCancel={() => setDeleteVisible(false)}
          onOk={() => {
            http
              .delete(`/apis/etcdclusters/${cluster.metadata.name}`)
              .then(() => {
                window.location.href = '/cluster';
              });
          }}
        >
          {t('AreYouSureToDeleteTheCluster')}
          <Text type="danger">{cluster.metadata.name}</Text>
          ?
        </Modal>
      ) : null}
      {visible ? (
        <ClusterFeatureModal
          close={() => {
            setVisible(false);
            getEtcdClusters();
          }}
          data={cluster}
          visible={visible}
        />
      ) : null}
    </>
  );
}
