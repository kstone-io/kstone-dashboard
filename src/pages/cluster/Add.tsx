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

import { useState } from 'react';
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
} from 'antd';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';
import http from 'src/utils/http';
import { encode } from 'js-base64';
import { useTranslation } from 'react-i18next';
import { GenerateOwnerReferences } from 'src/utils/common';

const { Header, Content } = Layout;
const { Text } = Typography;
const { TextArea } = Input;

const MappingSymbol = '->';
// form style
const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 6 },
};
const sleep = (ms: any) => new Promise((resolve) => setTimeout(resolve, ms));
// page of adding cluster
export function Add(): JSX.Element {
  const [scheme, setScheme] = useState('https');
  const { t } = useTranslation();

  const [memberList, setMemberList] = useState([
    {
      key: '',
      value: '',
    },
  ]);
  const title = t('ImortCluster');

  const ensureSecret = async (values: any, clusterUID: string) => {
    if (values.scheme === 'https') {
      // init etcd secret
      const secret: any = {
        apiVersion: 'v1',
        data: {
          'ca.pem': encode(values.ca),
          'client.pem': encode(values.clientCa),
          'client-key.pem': encode(values.clientKey),
        },
        kind: 'Secret',
        metadata: {
          name: values.name,
          namespace: 'kstone',
          ownerReferences: GenerateOwnerReferences(values.name, clusterUID),
        },
        type: 'Opaque',
      };
      // post etcd secret
      const resp = await http.post('/apis/secrets', secret);
      if (resp.statusText !== 'Created' && resp.status !== 409) {
        // handle error
        message.error({
          content: t('FailedToCreateSecret'),
        });
        sleep(2000);
        return;
      }
    }
    window.location.href = '/cluster';
  };

  // get form
  const [form] = Form.useForm();
  // handle finish
  const onFinish = async (values: any) => {
    let certName = '';
    // handle https
    if (values.scheme === 'https') {
      certName = `kstone/${values.name}`;
    }
    // transfer memberList to extClientURL
    let extClientURL = '';
    memberList.map((item) => {
      if (item.key !== '' && item.value !== '') {
        extClientURL += `${item.key}${MappingSymbol}${item.value},`;
      }
      return item;
    });
    if (extClientURL !== '') {
      extClientURL = extClientURL.substr(0, extClientURL.length - 1);
    }
    // init cluster info
    const data = {
      apiVersion: 'kstone.tkestack.io/v1alpha1',
      kind: 'EtcdCluster',
      metadata: {
        annotations: {
          importedAddr: `${values.scheme}://${values.endpoint}`,
          kubernetes: values.isKubernetes ? 'true' : 'false',
        },
        name: values.name,
        namespace: 'kstone',
      },
      spec: {
        args: [],
        clusterType: 'imported',
        description: values.description,
        diskSize: values.diskSize,
        diskType: values.diskType,
        env: [],
        name: values.name,
        size: values.size,
        totalCpu: values.totalCpu,
        totalMem: values.totalMem,
        version: '',
      },
    } as any;
    if (extClientURL !== '') {
      data.metadata.annotations.extClientURL = extClientURL;
    }
    if (certName !== '') {
      data.metadata.annotations.certName = certName;
    }
    // post cluster
    http.post('/apis/etcdclusters', data).then((resp) => {
      if (resp.statusText === 'Created') {
        ensureSecret(values, resp.data.metadata.uid);
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
        <Form name="update" {...formItemLayout} onFinish={onFinish} form={form}>
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
          <Form.Item
            name="endpoint"
            label={t('Address')}
            wrapperCol={{ span: 7 }}
          >
            <Input addonBefore={`${scheme}://`} />
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
          <Form.Item name="diskType" label={t('DiskType')}>
            <Radio.Group>
              <Radio value="ssd">SSD</Radio>
              <Radio value="basic">{t('HardDrive')}</Radio>
            </Radio.Group>
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
          <Form.Item label={t('ClusterNodeMapping')} wrapperCol={{ span: 12 }}>
            <List style={{ marginTop: '0px', paddingTop: '0px' }}>
              {memberList.map((item, i) => {
                return (
                  <List.Item key={i} style={{ paddingTop: '0px' }}>
                    <Input
                      value={item.key}
                      onChange={(e) => {
                        setMemberList((labels: any) => {
                          labels[i].key = e.target.value;
                          return [...labels];
                        });
                      }}
                      placeholder={t('PrivateAccessAddress')}
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
                        setMemberList((labels: any) => {
                          labels[i].value = e.target.value;
                          return [...labels];
                        });
                      }}
                      placeholder={t('PublicNetworkAddress')}
                    />
                    <Button
                      style={{ marginLeft: '10px' }}
                      onClick={() => {
                        setMemberList((labels) => {
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
                    setMemberList((labels) => {
                      return [...labels, { key: '', value: '' }];
                    });
                  }}
                >
                  <PlusOutlined />
                </Button>
              </List.Item>
            </List>
          </Form.Item>
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.scheme !== currentValues.scheme
            }
          >
            {({ getFieldValue }) =>
              getFieldValue('scheme') === 'https' ? (
                <>
                  <Form.Item
                    name="ca"
                    label={t('CACertificate')}
                    wrapperCol={{ span: 17 }}
                  >
                    <TextArea
                      placeholder={t('CACertificate')}
                      autoSize={{ minRows: 5 }}
                    />
                  </Form.Item>
                  <Form.Item
                    name="clientCa"
                    label={t('ClientCertificate')}
                    wrapperCol={{ span: 17 }}
                  >
                    <TextArea
                      placeholder={t('ClientCertificate')}
                      autoSize={{ minRows: 5 }}
                    />
                  </Form.Item>
                  <Form.Item
                    name="clientKey"
                    label={t('ClientPrivateKey')}
                    wrapperCol={{ span: 17 }}
                  >
                    <TextArea
                      placeholder={t('ClientPrivateKey')}
                      autoSize={{ minRows: 5 }}
                    />
                  </Form.Item>
                </>
              ) : null
            }
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
