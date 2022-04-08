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

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Layout,
  Select,
  Row,
  Col,
  Typography,
  Tree,
  Input,
  Spin,
  Radio,
} from 'antd';
import MonacoEditor from 'react-monaco-editor';
import 'antd/dist/antd.css';
import { useTranslation } from 'react-i18next';
import http from 'src/utils/http';

const { Header, Content } = Layout;
const { Text } = Typography;

// Visualization visualization page
export function Visualization(): JSX.Element {
  const [clusterList, setClusterList] = useState([]);
  const [clusterName, setClusterName] = useState('');
  const [treeJson, setTreeJson] = useState([] as any);
  const [data, setData] = useState([]);
  const [selectKey, setSelectKey] = useState([]);
  const [jsonViewData, setJsonViewData] = useState(null as any);
  const [viewData, setViewData] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingTree, setLoadingTree] = useState(true);
  const [type, setType] = useState('javascript');
  const ref = useRef(null as any);
  const { t } = useTranslation();

  useEffect(() => {
    getEtcdCluster();
  }, []);
  // fetch cluster list from api
  const getEtcdCluster = async () => {
    http.get('/apis/etcdclusters').then((resp) => {
      if (resp.data.items.length) {
        setClusterList(resp.data.items);
        setClusterName(resp.data.items[0].metadata.name);
      }
    });
  };
  // fetch etcd key from api
  const getEtcdKeyValues = useCallback(async () => {
    setLoadingTree(true);
    if (clusterName.length) {
      setSelectKey([]);
      http.get(`/apis/etcd/${clusterName}`).then((res) => {
        setData(res.data.data);
        const tree = toTree(res.data.data);
        setTreeJson(tree);
        setLoadingTree(false);
      });
    }
  }, [clusterName]);
  // init info
  const initEditor = useCallback(async () => {
    setIsLoading(true);
    const res = await http.get(
      `/apis/etcd/${clusterName}?key=${selectKey
        .join('/')
        .replace('root', '')}`,
    );
    if (res.data.data.length) {
      await setJsonViewData(res.data.data);
      if (res.data.data[0].type !== 'javascript') {
        setType('json');
      }
    }
    await setIsLoading(false);
  }, [clusterName, selectKey]);

  useEffect(() => {
    getEtcdKeyValues();
  }, [clusterName, getEtcdKeyValues]);
  // transfer etcd key to tree
  function toTree(menuData: any) {
    const tree = {};
    for (let i = 0; i < menuData.length; i++) {
      const menu = menuData[i].split('/').map((item: any) => {
        return item;
      });
      let obj: any = tree;
      const len: any = menu.length - 1;

      for (let j = 0; j < len; j++) {
        const parentPath = j > 1 ? menu.slice(0, j).join('/') : '';
        if (!obj[`${parentPath}/${menu[j]}`]) {
          obj[`${parentPath}/${menu[j]}`] = {};
        }
        obj = obj[`${parentPath}/${menu[j]}`];
      }
      const parentPath = menu.slice(0, len).join('/');
      if (parentPath.length) {
        obj[`${parentPath}/${menu[len]}`] = `${parentPath}/${menu[len]}`;
      } else {
        obj[`${menu[len]}`] = `${menu[len]}`;
      }
    }
    // check data
    function checkData(tree: any) {
      return Object.keys(tree).map((value) => {
        const children: any =
          typeof tree[value] === 'string' ? undefined : checkData(tree[value]);
        const v = value.split('/');
        const currentKey = value === '/' ? '/' : v[v.length - 1];
        const target = {
          value: currentKey,
          title: currentKey,
          key: value,
          label: currentKey,
          children: children ?? [],
        };
        if (target.children.length === 0) {
          delete target.children;
        }
        return target;
      });
    }
    return checkData(tree);
  }

  useEffect(() => {
    if (selectKey.length) {
      initEditor();
    }
  }, [selectKey, initEditor]);
  // handle select
  const onSelect = (selectedKeys: any, info: any) => {
    if (!info.node?.children?.length) {
      setSelectKey(selectedKeys);
    }
  };
  // handle search
  const onSearchHandle = (value: any) => {
    const searchResult = data.filter((item: any) => item.includes(value));
    const tree = toTree(searchResult);
    setTreeJson(tree);
  };

  useEffect(() => {
    (async () => {
      const data =
        jsonViewData?.find((item: any) => item.type === type)?.data ?? '';
      await setViewData(data);
      setTimeout(() => {
        ref?.current?.editor.getAction('editor.action.formatDocument').run();
      }, 300);
    })();
  }, [type, jsonViewData]);

  const typeChangeHandle = (e: any) => {
    setType(e.target.value);
    setTimeout(() => {
      ref?.current?.editor.getAction('editor.action.formatDocument').run();
    }, 300);
  };

  return (
    <Layout>
      <Header className="site-layout-background" style={{ padding: 0 }}>
        <Text strong style={{ float: 'left', marginLeft: '15px' }}>
          {t('VisualizationTool')}
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
        <Header className="site-layout-background" style={{ padding: 0 }}>
          <span>{t('ChooseCluster')}</span>
          <Select
            showSearch
            style={{ width: 200 }}
            onChange={(value: string) => setClusterName(value)}
            placeholder={t('PleaseSelectEtcdCluster')}
            optionFilterProp="children"
            value={clusterName}
          >
            {clusterList.map((item: any) => (
              <Select.Option
                value={item.metadata.name}
                key={item.metadata.name}
              >
                {item.metadata.name}
              </Select.Option>
            ))}
          </Select>
        </Header>
        <span>{t('SearchViewKeyValueData')}</span>
        <Row>
          <Col span={8}>
            <Input.Search
              onSearch={onSearchHandle}
              style={{ marginBottom: '20px' }}
            />
            <Spin spinning={loadingTree}>
              <Tree
                height={800}
                treeData={treeJson}
                showLine={true}
                showIcon={false}
                onSelect={onSelect}
              />
            </Spin>
          </Col>
          <Col span={16}>
            <Spin spinning={isLoading}>
              {viewData ? (
                <>
                  <Row justify="end">
                    <div style={{ float: 'right' }}>
                      <Radio.Group
                        value={'default'}
                        onChange={typeChangeHandle}
                        style={{ float: 'right' }}
                      >
                        {jsonViewData?.map((item: any) => {
                          return (
                            <Radio.Button key={item.type} value={item.type}>
                              {item.type}
                            </Radio.Button>
                          );
                        })}
                      </Radio.Group>
                    </div>
                  </Row>
                  <Row>
                    <MonacoEditor
                      ref={ref}
                      height={800}
                      language={type}
                      value={viewData}
                      options={
                        {
                          // readOnly: true,
                        }
                      }
                    />
                  </Row>
                </>
              ) : null}
            </Spin>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
}
