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

import { Modal } from "antd";
import * as yaml from "js-yaml";
import { useTranslation } from "react-i18next";

import { YamlEditorPanel } from "./CodeMirrorEditor";

export const YamlModal = ({ visible, data, onclose }: { visible: any; data: any; onclose: any }): JSX.Element => {
  const { t } = useTranslation();

  const getNodeMaster = () => {
    return yaml.dump(data);
  };

  return (
    <Modal width={1000} visible={visible} title={t("ViewYaml")} onCancel={onclose}>
      <div style={{ height: "600px", overflow: "auto" }}>
        <YamlEditorPanel readOnly={true} config={getNodeMaster()} />
      </div>
    </Modal>
  );
};
