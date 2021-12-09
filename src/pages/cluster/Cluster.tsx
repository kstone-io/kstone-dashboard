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
      title: '名称',
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
          状态
          <Tooltip title='状态描述'>
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
          return <Tag color='green'>正常</Tag>;
        }
        if (cluster.status.phase === 'stopped') {
          return <Tag color='green'>异常</Tag>;
        }
        return <Tag>{cluster.status.phase}</Tag>;
      },
    },
    {
      key: 'clusterType',
      title: '集群类型',
      render: (cluster: any) => (
        <>
          <p>{cluster.spec.clusterType}</p>
        </>
      ),
    },
    {
      key: 'memberCount',
      title: '节点个数',
      render: (cluster: any) => (
        <>
          <p>{cluster.spec.size}</p>
        </>
      ),
    },
    {
      key: 'spec',
      title: '配置',
      render: (cluster: any) => (
        <>
          <p>
            {cluster.spec.totalCpu}核 {cluster.spec.totalMem}GB
          </p>
        </>
      ),
    },
    {
      key: 'disk',
      title: '磁盘配置',
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
      title: '操作',
      render: (cluster: any) => {
        const dropDownMenu = (
          <Menu onClick={value => onOperation(value.key, cluster)}>
            <Menu.Item key='edit'>编辑</Menu.Item>
            <Menu.Item key='featureGates'>集群功能项</Menu.Item>
            <Menu.Item key='yaml'>查看YAML</Menu.Item>
          </Menu>
        );
        return (
          <>
            <Dropdown overlay={dropDownMenu}>
              <a href='/#' className='ant-dropdown-link' onClick={e => e.preventDefault()}>
                操作
              </a>
            </Dropdown>
            <Button type='link' onClick={() => {
              setCluster(cluster);
              setDeleteVisible(true);
            }}>删除</Button>
          </>
        );
      }
    }
  ];
  // fetch cluster list from api
  const getEtcdClusters = () => {
    setIsLoading(true);
    http.get('/apis/etcdclusters').then((resp) => {
      setClusterList(resp.data.items.map((item: any) => {
        item.key = item.metadata.name;
        return item;
      }));
      setIsLoading(false);
    });
  };

  useEffect(() => {
    getEtcdClusters();
  }, []);
  // render
  return <>
    <Layout>
      <Header className='site-layout-background' style={{ padding: 0 }}>
        <Text strong style={{ float: 'left', marginLeft: '15px' }}>集群管理</Text>
      </Header>
      <Content
        className='site-layout-background'
        style={{
          margin: '30px 30px',
          padding: 24,
          minHeight: 280,
        }}
      >
        <Space>
          <Button
            type='primary'
            onClick={() => {
              window.location.href = '/cluster/add';
            }}
          >
            关联集群
          </Button>
          <Button
            type='primary'
            onClick={() => {
              window.location.href = '/cluster/create';
            }}
          >
            新建集群
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
    {
      yamlVisible ? (
        <YamlModal
          onclose={() => {
            setYamlVisible(false);
          }}
          data={cluster}
          visible={yamlVisible}
        />
      ) : null
    }
    {
      deleteVisible ? (
        <Modal visible={deleteVisible} title='确认删除' onCancel={() => setDeleteVisible(false)} onOk={() => {
          http.delete(`/apis/etcdclusters/${cluster.metadata.name}`).then(() => {
            window.location.href = '/cluster';
          });
        }}>
          确定删除集群<Text type='danger'>{cluster.metadata.name}</Text>
        </Modal>
      ) : null
    }
    {
      visible ? (
        <ClusterFeatureModal
          close={() => {
            setVisible(false);
            getEtcdClusters();
          }}
          data={cluster}
          visible={visible} />
      ) : null
    }
  </>;
}