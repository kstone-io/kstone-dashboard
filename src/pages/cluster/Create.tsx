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

import { useEffect, useState } from 'react';
import {
  message,
  Layout,
  Typography,
  Form,
  List,
  InputNumber,
  Input,
  Switch,
  Radio,
  Button,
  Tag,
  Select,
} from 'antd';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';
import http from 'src/utils/http';
import { useTranslation } from 'react-i18next';

const { Header, Content } = Layout;
const { Text } = Typography;
const { TextArea } = Input;

const MappingSymbol = '=';
const GlobalConfig = 'etcd-version-global-config';
// form style
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 6 },
};

const sleep = (ms: any) => new Promise((resolve) => setTimeout(resolve, ms));
// page of creating cluster
export function Create(): JSX.Element {
  const [scheme, setScheme] = useState('https');

  const [envList, setEnvList] = useState([
    {
      name: '',
      value: '',
    },
  ]);
  const [versionMap, setVersionMap] = useState([]);
  const { t } = useTranslation();
  const title = t('Create');

  const [form] = Form.useForm();
  // load list of etcd version
  useEffect(() => {
    http.get(`/apis/configmaps/${GlobalConfig}`).then((resp) => {
      setVersionMap(resp.data.data);
    });
  }, []);
  // handle finish
  const onFinish = async (values: any) => {
    // handle envList
    const envRequest = [];
    if (envList) {
      for (const item of envList) {
        if (item.name !== '' && item.value !== '') {
          envRequest.push(item);
        }
      }
    }
    // init cluster info
    const data: any = {
      apiVersion: 'kstone.tkestack.io/v1alpha1',
      kind: 'EtcdCluster',
      metadata: {
        annotations: {
          kubernetes: values.isKubernetes ? 'true' : 'false',
          scheme: scheme,
          remark: values.remark,
        },
        name: values.name,
        namespace: 'kstone',
      },
      spec: {
        args: [],
        clusterType: 'kstone-etcd-operator',
        description: values.description,
        diskSize: values.diskSize,
        diskType: values.diskType ? values.diskType : 'ssd',
        env: envRequest,
        name: values.name,
        size: values.size,
        totalCpu: values.totalCpu,
        totalMem: values.totalMem,
        version: values.version,
      },
      status: {
        phase: 'Init',
      },
    };
    // post cluster info
    http.post('/apis/etcdclusters', data).then((resp: any) => {
      if (resp.statusText === 'Created') {
        window.location.href = '/cluster';
      } else {
        // handle error
        message.error({
          content: resp.data.reason,
        });
        sleep(2000);
      }
    });
  };
  return (
    <Layout>
      <Header className="site-layout-background" style={{ padding: 0 }}>
        <Text strong style={{ float: 'left', marginLeft: '15px' }}>
          {title}
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
        <Form
          name="update"
          {...formItemLayout}
          onFinish={onFinish}
          form={form}
          initialValues={{
            scheme: 'https',
            totalCpu: 1,
            totalMem: 2,
            size: 3,
            diskSize: 30,
            diskType: 'ssd',
            version: Object.keys(versionMap)[0],
          }}
        >
          <Form.Item label={t('ClusterName')}>
            <Form.Item name="name" noStyle>
              <Input></Input>
            </Form.Item>
          </Form.Item>
          <Form.Item label={t('ClusterDescription')}>
            <Form.Item name="remark" noStyle>
              <Input></Input>
            </Form.Item>
          </Form.Item>
          <Form.Item
            name="isKubernetes"
            label={t('Forkubernetes')}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          <Form.Item
            name="version"
            label={t('EtcdVersion')}
            wrapperCol={{ span: 3 }}
          >
            <Select>
              {Object.keys(versionMap).map((value) => {
                return (
                  <Select.Option key={value} value={value}>
                    {value}
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>
          <Form.Item name="scheme" label={t('AccessMethod')}>
            <Radio.Group
              onChange={(e) => {
                setScheme(e.target.value);
              }}
            >
              <Radio value="https">HTTPS</Radio>
              <Radio value="http">HTTP</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item name="totalCpu" label={t('CPUCores')}>
            <InputNumber />
          </Form.Item>
          <Form.Item
            name="totalMem"
            label={t('MemorySize')}
            wrapperCol={{ span: 3 }}
          >
            <InputNumber addonAfter="GB" />
          </Form.Item>
          <Form.Item
            name="diskSize"
            label={t('DiskSize')}
            wrapperCol={{ span: 3 }}
          >
            <InputNumber addonAfter="GB" />
          </Form.Item>
          <Form.Item
            name="size"
            label={t('ClusterSize')}
            wrapperCol={{ span: 3 }}
          >
            <InputNumber addonAfter={t('Node')} />
          </Form.Item>
          <Form.Item
            name="env"
            label={t('EnvironmentVariableConfiguration')}
            wrapperCol={{ span: 12 }}
          >
            <List style={{ marginTop: '0px', paddingTop: '0px' }}>
              {envList.map((item, i) => {
                return (
                  <List.Item key={i} style={{ paddingTop: '0px' }}>
                    <Input
                      value={item.name}
                      onChange={(e) => {
                        setEnvList((labels: any) => {
                          labels[i].name = e.target.value;
                          return [...labels];
                        });
                      }}
                      placeholder={t('EnvironmentVariableName')}
                    />
                    <Tag
                      style={{
                        marginLeft: '10px',
                        marginRight: '10px',
                      }}
                    >
                      {MappingSymbol}
                    </Tag>
                    <Input
                      value={item.value}
                      onChange={(e) => {
                        setEnvList((labels: any) => {
                          labels[i].value = e.target.value;
                          return [...labels];
                        });
                      }}
                      placeholder={t('EnvironmentVariableValue')}
                    />
                    <Button
                      style={{ marginLeft: '10px' }}
                      onClick={() => {
                        setEnvList((labels) => {
                          labels.splice(i, 1);
                          return [...labels];
                        });
                      }}
                    >
                      <MinusOutlined />
                    </Button>
                  </List.Item>
                );
              })}
              <List.Item key="plus">
                <Button
                  type="ghost"
                  onClick={() => {
                    setEnvList((labels) => {
                      return [...labels, { name: '', value: '' }];
                    });
                  }}
                >
                  <PlusOutlined />
                </Button>
                <Typography.Link
                  href="https://etcd.io/docs/v3.4/op-guide/configuration/"
                  target="_blank"
                >
                  {t('EtcdEnvironmentConfigurations')}
                </Typography.Link>
              </List.Item>
            </List>
          </Form.Item>
          <Form.Item
            name="description"
            label={t('Description')}
            wrapperCol={{ span: 17 }}
          >
            <TextArea
              placeholder={t('Description')}
              autoSize={{ minRows: 2 }}
            />
          </Form.Item>
          <Form.Item wrapperCol={{ span: 12 }}>
            <Button type="primary" htmlType="submit">
              {t('Submit')}
            </Button>
          </Form.Item>
        </Form>
      </Content>
    </Layout>
  );
}
