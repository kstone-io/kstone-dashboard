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

import { Modal, Form, Card, Input, Switch, Spin, InputNumber, Row, Col } from 'antd';
import { useEffect, useState } from 'react';
import * as _ from 'lodash';
import http from 'src/utils/http';
import { encode, decode } from 'js-base64';
import { useTranslation } from 'react-i18next';
import { GenerateOwnerReferences } from 'src/utils/common';

// form style
const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 12 },
};

const FeatureGatesKey = 'featureGates';
// page to edit feature gates
export const ClusterFeatureModal = ({
  visible,
  data,
  close,
}: {
  visible: any;
  data: any;
  close: any;
}): JSX.Element => {
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();
  const [featureMap, setFeatureMap] = useState({} as any);

  const [form] = Form.useForm();

  const generateFeatureAnnotation = (): string => {
    let result = '';
    Object.keys(featureMap).sort().map((feature: string) => {
      result += `${feature}=${featureMap[feature].toString()},`;
      return feature;
    });
    return result.substring(0, result.lastIndexOf(','));
  };

  // load info
  useEffect(() => {
    setIsLoading(true);
    http.get('/apis/features').then(featureResp => {
      (async () => {
        if (data?.metadata?.labels) {
          const map: any = {};
          featureResp.data.map((item: string) => {
            map[item] = (data.metadata.labels[item] === 'true');
            return item;
          });
          setFeatureMap(map);

          if (data.metadata.labels.backup === 'true') {
            const backupValue = JSON.parse(
              data?.metadata?.annotations?.backup ?? '{}',
            );
            const res = await http.get(`/apis/secrets/cos-${data.metadata.name}`);
            form.setFieldsValue({
              backupIntervalInSecond: backupValue?.backupPolicy?.backupIntervalInSecond,
              maxBackups: backupValue?.backupPolicy?.maxBackups,
              timeoutInSecond: backupValue?.backupPolicy?.timeoutInSecond,
              secretId: decode(res?.data?.data['secret-id'] ?? ''),
              secretKey: decode(res?.data?.data['secret-key'] ?? ''),
              path: backupValue?.cos?.path
            });
          }
          setIsLoading(false);
        }
      })();
    });
  }, [data, form]);
  // handle finish
  const onFinish = (values: any) => {
    const backupInfo = {
      backupIntervalInSecond: values.backupIntervalInSecond,
      maxBackups: values.maxBackups,
      timeoutInSecond: values.timeoutInSecond,
      secretId: values.secretId,
      secretKey: values.secretKey,
      path: values.path,
    };

    updateCluster(backupInfo);
    createSecret(backupInfo);
    close();
  };
  // update feature gates setting
  const updateCluster = async (values?: any) => {
    const model = _.cloneDeep(data);
    if (values && featureMap['backup']) {
      const backup = `
{
  "backupPolicy": {
    "backupIntervalInSecond": ${values.backupIntervalInSecond},
    "maxBackups": ${values.maxBackups},
    "timeoutInSecond": ${values.timeoutInSecond}
  },
  "cos": {
    "cosSecret": "cos-${data.metadata.name}",
    "path": "${values.path}"
  },
  "storageType": "COS"
}
      `;
      model.metadata.annotations.backup = backup;
    }
    const gates = generateFeatureAnnotation();
    model.metadata.annotations[FeatureGatesKey] = gates;
    await http.put(`/apis/etcdclusters/${data.metadata.name}`, model);
  };
  // create secret for cos
  const createSecret = async (values: any) => {
    if (!featureMap['backup']) {
      return;
    }
    const model = {
      apiVersion: 'v1',
      data: {
        'secret-id': encode(values.secretId),
        'secret-key': encode(values.secretKey),
      },
      kind: 'Secret',
      metadata: {
        name: `cos-${data.metadata.name}`,
        ownerReferences: GenerateOwnerReferences(data.metadata.name, data.metadata.uid),
      },
      type: 'Opaque',
    };
    http
      .get(`/apis/secrets/cos-${data.metadata.name}`)
      .then((resp) => {
        if (resp.data.code === 404) {
          http.post('/apis/secrets', model);
        } else {
          http.put(`/apis/secrets/cos-${data.metadata.name}`, model);
        }
      })
      .catch(() => {
        http.post('/apis/secrets', model);
      });
  };

  return (
    <Modal
      visible={visible}
      title={t('ClusterFeature')}
      onCancel={close}
      okButtonProps={{ htmlType: 'submit', form: 'form' }}
    >
      <Form id="form" name="form" onFinish={onFinish} form={form} initialValues={{
        backupIntervalInSecond: 3600,
        maxBackups: 72,
        timeoutInSecond: 600,
      }}>
        <Spin spinning={isLoading}>
          <Card title={t('FeatureGates')}>
            <Form layout="inline">
              <Row gutter={1}>
                {
                  Object.keys(featureMap).sort().map((feature: string) => {
                    console.log(feature);
                    return <Col span={8}>
                      <Form.Item style={{ textTransform: 'capitalize' }} label={feature}>
                        <Switch
                          key={feature}
                          checked={featureMap[feature]}
                          onChange={(value: boolean) => {
                            featureMap[feature] = value;
                            setFeatureMap({
                              ...featureMap
                            });
                          }}
                        />
                      </Form.Item>
                    </Col>;
                  })
                }
              </Row>
            </Form>
          </Card>
          {featureMap['backup'] ? (
            <Card
              title={t('BackupParameterSettings')}
              style={{ marginTop: '10px' }}
            >
              {/* <Form name="backup" {...formItemLayout}> */}
              <Form.Item name="backupIntervalInSecond" label="BackupIntervalInSecond" required {...formItemLayout}>
                <InputNumber
                  min={0}
                />
              </Form.Item>
              <Form.Item name="maxBackups" label="MaxBackups" required {...formItemLayout}>
                <InputNumber
                  min={0}
                />
              </Form.Item>
              <Form.Item name="timeoutInSecond" label="TimeoutInSecond" required {...formItemLayout}>
                <InputNumber
                  min={0}
                />
              </Form.Item>
              <Form.Item
                name="secretId"
                label="SecretId"
                required
                {...formItemLayout}
                rules={[
                  {
                    required: true,
                    message: t('PleaseInput')
                  },
                ]}>
                <Input
                  placeholder={t('PleaseInput')}
                  autoComplete="off"
                  spellCheck={false}
                />
              </Form.Item>
              <Form.Item
                name="secretKey"
                label="SecretKey"
                required
                {...formItemLayout}
                rules={[
                  {
                    required: true,
                    message: t('PleaseInput')
                  },
                ]}>
                <Input
                  placeholder={t('PleaseInput')}
                  autoComplete="off"
                  spellCheck={false}
                />
              </Form.Item>
              <Form.Item
                name="path"
                label="Path"
                required
                {...formItemLayout}
                rules={[
                  {
                    required: true,
                    message: t('PleaseInput')
                  },
                ]}>
                <Input
                  placeholder={t('PleaseInput')}
                  autoComplete="off"
                  spellCheck={false}
                />
              </Form.Item>
            </Card>
          ) : null}
        </Spin>
      </Form>
    </Modal>
  );
};
