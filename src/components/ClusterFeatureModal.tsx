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

import { Modal, Form, Card, Input, Switch, Spin, InputNumber } from "antd";
import { useEffect, useState } from "react";
import * as _ from "lodash";
import http from "src/utils/http";
import { encode, decode } from "js-base64";
import { useTranslation } from "react-i18next";
// form style
const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 12 },
};

const FeatureGatesKey = "featureGates";
// page to edit feature gates
export const ClusterFeatureModal = ({ visible, data, close }: { visible: any; data: any; close: any }): JSX.Element => {
  const [isLoading, setIsLoading] = useState(false);
  const [monitor, setMonitor] = useState(false);
  const [consistency, setConsistency] = useState(false);
  const [healthy, setHealthy] = useState(false);
  const [request, setRequest] = useState(false);
  const [backup, setBackup] = useState(false);
  const [backupIntervalInSecond, setBackupIntervalInSecond] = useState(3600);
  const [maxBackups, setMaxBackups] = useState(72);
  const [timeoutInSecond, setTimeoutInSecond] = useState(600);
  const [secretId, setSecretId] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [path, setPath] = useState("");
  const { t } = useTranslation();

  // load info
  useEffect(() => {
    (async () => {
      if (data?.metadata?.labels) {
        setIsLoading(true);
        setMonitor(data.metadata.labels.monitor === "true");
        setConsistency(data.metadata.labels.consistency === "true");
        setHealthy(data.metadata.labels.healthy === "true");
        setRequest(data.metadata.labels.request === "true");
        setBackup(data.metadata.labels.backup === "true");

        if (data.metadata.labels.backup === "true") {
          const backupValue = JSON.parse(data?.metadata?.annotations?.backup ?? "{}");
          const res = await http.get(`/apis/secrets/cos-${data.metadata.name}`);
          setBackupIntervalInSecond(backupValue?.backupPolicy?.backupIntervalInSecond);
          setMaxBackups(backupValue?.backupPolicy?.maxBackups);
          setTimeoutInSecond(backupValue?.backupPolicy?.timeoutInSecond);
          setSecretId(decode(res?.data?.data["secret-id"] ?? ""));
          setSecretKey(decode(res?.data?.data["secret-key"] ?? ""));
          setPath(backupValue?.cos?.path);
        }
        setIsLoading(false);
      }
    })();
  }, [data]);
  // handle finish
  const onFinish = async () => {
    const backupInfo = {
      backupIntervalInSecond: backupIntervalInSecond,
      maxBackups: maxBackups,
      timeoutInSecond: timeoutInSecond,
      secretId: secretId,
      secretKey: secretKey,
      path: path,
    };

    await updateCluster(backupInfo);
    await createSecret(backupInfo);
    close();
  };
  // update feature gates setting
  const updateCluster = async (values?: any) => {
    const model = _.cloneDeep(data);
    if (values && backup) {
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
    const gates = `monitor=${monitor.toString()},consistency=${consistency.toString()},healthy=${healthy.toString()},request=${request.toString()},backup=${backup.toString()}`;
    model.metadata.annotations[FeatureGatesKey] = gates;
    await http.put(`/apis/etcdclusters/${data.metadata.name}`, model);
  };
  // create secret for cos
  const createSecret = async (values: any) => {
    if (!backup) {
      return;
    }
    const model = {
      apiVersion: "v1",
      data: {
        "secret-id": encode(values.secretId),
        "secret-key": encode(values.secretKey),
      },
      kind: "Secret",
      metadata: {
        name: `cos-${data.metadata.name}`,
        namespace: "kstone",
      },
      type: "Opaque",
    };
    http
      .get(`/apis/secrets/cos-${data.metadata.name}`)
      .then(resp => {
        if (resp.data.code === 404) {
          http.post("/apis/secrets", model);
        } else {
          http.put(`/apis/secrets/cos-${data.metadata.name}`, model);
        }
      })
      .catch(() => {
        http.post("/apis/secrets", model);
      });
  };

  return (
    <Modal visible={visible} title={t("ClusterFeature")} onCancel={close} onOk={onFinish}>
      <Spin spinning={isLoading}>
        <Card title={t("FeatureGates")}>
          <Form name="form" layout="inline">
            <Form.Item label="Monitor">
              <Switch key="Monitor" checked={monitor} onChange={(value: boolean) => setMonitor(value)} />
            </Form.Item>
            <Form.Item label="Consistency">
              <Switch key="Consistency" checked={consistency} onChange={(value: boolean) => setConsistency(value)} />
            </Form.Item>
            <Form.Item label="Healthy">
              <Switch key="Healthy" checked={healthy} onChange={(value: boolean) => setHealthy(value)} />
            </Form.Item>
            <Form.Item label="Request">
              <Switch key="Request" checked={request} onChange={(value: boolean) => setRequest(value)} />
            </Form.Item>
            <Form.Item label="Backup">
              <Switch key="Backup" checked={backup} onChange={(value: boolean) => setBackup(value)} />
            </Form.Item>
          </Form>
        </Card>
        {backup ? (
          <Card title={t("BackupParameterSettings")} style={{ marginTop: "10px" }}>
            <Form name="backup" {...formItemLayout}>
              <Form.Item label="BackupIntervalInSecond" required>
                <InputNumber min={0} value={backupIntervalInSecond} onChange={(e: any) => setBackupIntervalInSecond(e.target.value)} />
              </Form.Item>
              <Form.Item label="MaxBackups" required>
                <InputNumber min={0} value={maxBackups} onChange={(e: any) => setMaxBackups(e.target.value)} />
              </Form.Item>
              <Form.Item label="TimeoutInSecond" required>
                <InputNumber min={0} value={timeoutInSecond} onChange={(e: any) => setTimeoutInSecond(e.target.value)} />
              </Form.Item>
              <Form.Item label="SecretId" required>
                <Input placeholder={t("PleaseInput")} autoComplete="off" spellCheck={false} value={secretId} onChange={(e: any) => setSecretId(e.target.value)} />
              </Form.Item>
              <Form.Item label="SecretKey" required>
                <Input placeholder={t("PleaseInput")} autoComplete="off" spellCheck={false} value={secretKey} onChange={(e: any) => setSecretKey(e.target.value)} />
              </Form.Item>
              <Form.Item label="Path" required>
                <Input placeholder={t("PleaseInput")} autoComplete="off" spellCheck={false} value={path} onChange={(e: any) => setPath(e.target.value)} />
              </Form.Item>
            </Form>
          </Card>
        ) : null}
      </Spin>
    </Modal>
  );
};
