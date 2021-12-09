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

import { useState, useEffect, useCallback } from 'react';
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
  Spin,
} from 'antd';
import { PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { useParams } from 'react-router';
import http from 'src/utils/http';
import { encode, decode } from 'js-base64';

const { Header, Content } = Layout;
const { Text } = Typography;
const { TextArea } = Input;

const MappingSymbol = '->'; // member map symbol
const ClusterTypeImported = 'imported'; // default cluster type
const ENVSymbol = '='; // env symbol
// form style
const formItemLayout = {
  labelCol: { span: 3 },
  wrapperCol: { span: 6 },
};
const sleep = (ms: any) => new Promise(resolve => setTimeout(resolve, ms));
// page of updaing cluster
export function Update(): JSX.Element {
  // get url params
  const params: any = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [scheme, setScheme] = useState('https');
  const [cluster, setCluster] = useState({} as any);
  const [title, setTitle] = useState('关联集群');
  const [memberList, setMemberList] = useState([
    {
      'key': '',
      'value': '',
    }
  ]);
  const [envList, setEnvList] = useState([
    {
      name: '',
      value: '',
    }
  ]);
  // get form
  const [form] = Form.useForm();
  // handle finish
  const onFinish = async (values: any) => {
    // handle https
    if (values.scheme === 'https') {
      // init certName
      let certName: string = cluster.metadata.annotations.certName;
      if (certName !== undefined && certName !== '') {
        if (certName.indexOf('/') > -1) {
          certName = certName.split('/')[1];
        }
      } else {
        certName = values.name;
      }
      // init etcd secret
      const secret: any = {
        'apiVersion': 'v1',
        'data': {
          'ca.pem': encode(values.ca),
          'client.pem': encode(values.clientCa),
          'client-key.pem': encode(values.clientKey),
        },
        'kind': 'Secret',
        'metadata': {
          'name': certName,
          'namespace': 'kstone',
        },
        'type': 'Opaque'
      };
      // update etcd secret
      const resp = await http.put(`/apis/secrets/${secret.metadata.name}`, secret);
      if (resp.statusText !== 'Created' && resp.status !== 409 && resp.status !== 200) {
        message.error({
          content: 'Secret创建失败',
        });
        sleep(2000);
        return;
      }
    }
    // transfer memberList to extClientURL
    let extClientURL = '';
    memberList.map(item => {
      if (item.key !== '' && item.value !== '') {
        extClientURL += `${item.key}${MappingSymbol}${item.value},`;
      }
      return item;
    });
    if (extClientURL !== '') {
      extClientURL = extClientURL.substr(0, extClientURL.length - 1);
      cluster.metadata.annotations.extClientURL = extClientURL;
    }
    // handle envList
    const envRequest = [];
    if (envList) {
      for (const item of envList) {
        if (item.name !== '' && item.value !== '') {
          envRequest.push(item);
        }
      }
    }
    // update cluster info
    cluster.metadata.annotations.importedAddr = `${values.scheme}://${values.endpoint}`;
    cluster.metadata.annotations.kubernetes = values.isKubernetes ? 'true' : 'false';
    cluster.metadata.annotations.remark = values.remark;
    cluster.spec = {
      'args': [],
      'clusterType': cluster.spec?.clusterType,
      'description': values.description,
      'diskSize': values.diskSize,
      'diskType': values.diskType,
      'env': envRequest,
      'name': values.name,
      'size': values.size,
      'totalCpu': values.totalCpu,
      'totalMem': values.totalMem,
      'version': cluster.spec.version,
    };
    // put cluster info
    http.put(`/apis/etcdclusters/${cluster.metadata.name}`, cluster).then(resp => {
      if (resp.statusText === 'Created' || resp.status === 200) {
        window.location.href = '/cluster';
      } else {
        message.error({
          content: resp.data.reason,
        });
        sleep(2000);
      }
    });
  };
  // init cluster info
  const initEditor = useCallback(async () => {
    setIsLoading(true);
    setTitle('编辑集群');
    // get cluster info
    await http.get(`/apis/etcdclusters/${params.name}`).then(resp => {
      setCluster(resp.data);
      const cluster: any = resp.data;
      // get certName
      let certName: string = cluster.metadata.annotations.certName;
      if (certName !== undefined) {
        if (certName.indexOf('/') > -1) {
          certName = certName.split('/')[1];
        }
        // get etcd secret
        http.get(`/apis/secrets/${certName}`).then(secretResp => {
          const secret = secretResp.data;
          // init form
          form.setFieldsValue({
            name: cluster.metadata.name,
            remark: cluster.metadata.annotations.remark,
            scheme: cluster.metadata.annotations.importedAddr.split(':')[0],
            endpoint: cluster.metadata.annotations.importedAddr.split('/')[2],
            isKubernetes: cluster.metadata.annotations.kubernetes === 'true' ? true : false,
            totalCpu: cluster.spec.totalCpu,
            totalMem: cluster.spec.totalMem,
            diskType: cluster.spec.diskType,
            diskSize: cluster.spec.diskSize,
            size: cluster.spec.size,
            description: cluster.spec.description,
            ca: decode(secret.data['ca.pem']),
            clientCa: decode(secret.data['client.pem']),
            clientKey: decode(secret.data['client-key.pem']),
            version: cluster.spec.version,
          });
          // init envList
          setEnvList(cluster.spec.env ? cluster.spec.env : []);
          // init memberList
          const extClientURL: string = cluster.metadata.annotations.extClientURL;
          if (extClientURL && extClientURL !== '') {
            const mapList: any = extClientURL.split(',');
            const resultList: any = [];
            mapList.map((item: any) => {
              resultList.push({
                'key': item.split('->')[0],
                'value': item.split('->')[1],
              });
              return item;
            });
            setMemberList(resultList);
          }
        });
      } else {
        setScheme('http');
        // init form
        form.setFieldsValue({
          name: cluster.metadata.name,
          remark: cluster.metadata.annotations.remark,
          scheme: cluster.metadata.annotations.importedAddr.split(':')[0],
          endpoint: cluster.metadata.annotations.importedAddr.split('/')[2],
          isKubernetes: cluster.metadata.annotations.kubernetes === 'true' ? true : false,
          totalCpu: cluster.spec.totalCpu,
          totalMem: cluster.spec.totalMem,
          diskType: cluster.spec.diskType,
          diskSize: cluster.spec.diskSize,
          size: cluster.spec.size,
          description: cluster.spec.description,
          ca: undefined,
          clientCa: undefined,
          clientKey: undefined,
          version: cluster.spec.version,
        });
        // init envList
        setEnvList(cluster.spec.env);
        // init memberList
        const extClientURL: string = cluster.metadata.annotations.extClientURL;
        if (extClientURL && extClientURL !== '') {
          const mapList: any = extClientURL.split(',');
          const resultList: any = [];
          mapList.map((item: any) => {
            resultList.push({
              'key': item.split('->')[0],
              'value': item.split('->')[1],
            });
            return item;
          });
          setMemberList(resultList);
        }
      }
    });
    await setIsLoading(false);
  }, [form, params.name]);
  // init page
  useEffect(() => {
    if (params.name !== undefined) {
      initEditor();
    }
  }, [initEditor, params.name]);

  return (
    <Spin spinning={isLoading} delay={500} size='large'>
      <Layout>
        <Header className='site-layout-background' style={{ padding: 0 }}>
          <Text strong style={{ float: 'left', marginLeft: '15px' }}>{title}</Text>
        </Header>
        <Content
          className='site-layout-background'
          style={{
            margin: '30px 30px',
            padding: 24,
            minHeight: 280,
          }}
        >
          <Form
            name='update'
            {...formItemLayout}
            onFinish={onFinish}
            form={form}
          >
            <Form.Item label='集群名称'>
              <Form.Item name='name' noStyle>
                <Input disabled></Input>
              </Form.Item>
            </Form.Item>
            <Form.Item label='集群备注'>
              <Form.Item name='remark' noStyle>
                <Input></Input>
              </Form.Item>
            </Form.Item>
            <Form.Item name='isKubernetes' label='用于Kubernetes' valuePropName='checked'>
              <Switch />
            </Form.Item>
            <Form.Item name='scheme' label='访问方式'>
              <Radio.Group onChange={(e) => {
                setScheme(e.target.value);
              }}>
                <Radio value='https'>HTTPS</Radio>
                <Radio value='http'>HTTP</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item
              name='endpoint'
              label='访问地址'
              wrapperCol={{ span: 7 }}
            >
              <Input addonBefore={`${scheme}://`} disabled={cluster.spec?.clusterType !== ClusterTypeImported} />
            </Form.Item>
            <Form.Item name='totalCpu' label='CPU核数'>
              <InputNumber />
            </Form.Item>
            <Form.Item name='totalMem' label='内存大小' wrapperCol={{ span: 3 }}>
              <InputNumber addonAfter='GB' />
            </Form.Item>
            <Form.Item name='diskType' label='磁盘类型' hidden={cluster.spec?.clusterType !== ClusterTypeImported}>
              <Radio.Group>
                <Radio value='ssd'>SSD</Radio>
                <Radio value='basic'>普通硬盘</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item name='diskSize' label='磁盘大小' wrapperCol={{ span: 3 }}>
              <InputNumber addonAfter='GB' />
            </Form.Item>
            <Form.Item name='size' label='集群规模' wrapperCol={{ span: 3 }}>
              <InputNumber addonAfter='节点' />
            </Form.Item>
            <Form.Item name='env' label='环境变量配置' wrapperCol={{ span: 12 }}>
              <List style={{ marginTop: '0px', paddingTop: '0px' }}>
                {
                  envList?.map((item, i) => {
                    return (
                      <List.Item key={i}>
                        <Input
                          value={item.name}
                          onChange={e => {
                            setEnvList((labels: any) => {
                              labels[i].name = e.target.value;
                              return [...labels];
                            });
                          }}
                          placeholder='环境变量名称'
                        />
                        <Tag style={{
                          marginLeft: '10px',
                          marginRight: '10px'
                        }}>{ENVSymbol}</Tag>
                        <Input
                          value={item.value}
                          onChange={e => {
                            setEnvList((labels: any) => {
                              labels[i].value = e.target.value;
                              return [...labels];
                            });
                          }}
                          placeholder='环境变量值'
                        />
                        <Button style={{ marginLeft: '10px' }} onClick={() => {
                          setEnvList(labels => {
                            labels.splice(i, 1);
                            return [...labels];
                          });
                        }}>
                          <MinusOutlined />
                        </Button>
                      </List.Item>
                    );
                  })
                }
                <List.Item key='plus'>
                  <Button type='ghost' onClick={() => {
                    setEnvList(labels => [...labels, { name: '', value: '' }]);
                  }}>
                    <PlusOutlined />
                  </Button>
                  <Typography.Link href='https://etcd.io/docs/v3.4/op-guide/configuration/' target='_blank'>etcd环境变量配置?</Typography.Link>
                </List.Item>
              </List>
            </Form.Item>
            <Form.Item
              label='集群节点映射'
              wrapperCol={{ span: 12 }}
            >
              <List style={{ marginTop: '0px', paddingTop: '0px' }}>
                {
                  memberList.map((item, i) => {
                    return (
                      <List.Item key={i}>
                        <Input
                          value={item.key}
                          onChange={e => {
                            setMemberList((labels: any) => {
                              labels[i].key = e.target.value;
                              return [...labels];
                            });
                          }}
                          placeholder='内网访问地址'
                          disabled={cluster.spec?.clusterType !== ClusterTypeImported}
                        />
                        <Tag style={{
                          marginLeft: '10px',
                          marginRight: '10px'
                        }}>{MappingSymbol}</Tag>
                        <Input
                          value={item.value}
                          onChange={e => {
                            setMemberList((labels: any) => {
                              labels[i].value = e.target.value;
                              return [...labels];
                            });
                          }}
                          placeholder='外网访问地址'
                          disabled={cluster.spec?.clusterType !== ClusterTypeImported}
                        />
                        <Button style={{ marginLeft: '10px' }} disabled={cluster.spec?.clusterType !== ClusterTypeImported} onClick={() => {
                          setMemberList(labels => {
                            labels.splice(i, 1);
                            return [...labels];
                          });
                        }}>
                          <MinusOutlined />
                        </Button>
                      </List.Item>
                    );
                  })
                }
                <List.Item key='plus'>
                  <Button type='ghost' disabled={cluster.spec?.clusterType !== ClusterTypeImported} onClick={() => {
                    setMemberList(labels => [...labels, { key: '', value: '' }]);
                  }}>
                    <PlusOutlined />
                  </Button>
                </List.Item>
              </List>
            </Form.Item>
            <Form.Item
              noStyle
              shouldUpdate={(prevValues, currentValues) => prevValues.scheme !== currentValues.scheme}
            >
              {({ getFieldValue }) =>
                getFieldValue('scheme') === 'https' ? (
                  <>
                    <Form.Item name='ca' label='CA证书' wrapperCol={{ span: 17 }}>
                      <TextArea
                        placeholder='CA证书'
                        autoSize={{ minRows: 5 }}
                        disabled={cluster.spec?.clusterType !== ClusterTypeImported}
                      />
                    </Form.Item>
                    <Form.Item name='clientCa' label='客户端证书' wrapperCol={{ span: 17 }}>
                      <TextArea
                        placeholder='客户端证书'
                        autoSize={{ minRows: 5 }}
                        disabled={cluster.spec?.clusterType !== ClusterTypeImported}
                      />
                    </Form.Item>
                    <Form.Item name='clientKey' label='客户端私钥' wrapperCol={{ span: 17 }}>
                      <TextArea
                        placeholder='客户端私钥'
                        autoSize={{ minRows: 5 }}
                        disabled={cluster.spec?.clusterType !== ClusterTypeImported}
                      />
                    </Form.Item>
                  </>) : null
              }
            </Form.Item>
            <Form.Item name='description' label='描述' wrapperCol={{ span: 17 }}>
              <TextArea
                placeholder='描述'
                autoSize={{ minRows: 2 }}
              />
            </Form.Item>
            <Form.Item wrapperCol={{ span: 12 }}>
              <Button type='primary' htmlType='submit'>
                提交
              </Button>
            </Form.Item>
          </Form>
        </Content>
      </Layout>
    </Spin>
  );
}