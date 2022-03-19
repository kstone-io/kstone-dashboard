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

import {
  Dropdown,
  Layout as AntdLayout,
  Menu,
  Button,
  Form,
  Input
} from 'antd';
import { useState } from 'react';
import { LockOutlined, UserOutlined, DownOutlined } from '@ant-design/icons';
import http from 'src/utils/http';
import cookies from 'src/utils/cookies';
import logo from '../../../src/logo.png';
import { useTranslation } from 'react-i18next';

const { Header, Content } = AntdLayout;

const formLayout = {
  labelCol: { span: 6 },
};

export function ResetPassword(): JSX.Element {
  const [loading, setLoading] = useState(false);
  const { i18n, t } = useTranslation();
  const lang = localStorage.getItem('locale');

  const handleSubmit = async (values: any) => {
    setLoading(true);
    const resp: any = await http.put('/apis/user', {
      username: values.username,
      password: values.password,
    });
    console.log(resp);
    debugger;
    if (resp?.status === 200) {
      window.location.href = '/login';
    }
    setLoading(false);
  };
  const handleMenuClick = (e: any) => {
    if (e.key === '1') {
      i18n.changeLanguage('zh-CN');
      localStorage.setItem('locale', 'zh-CN');
    }
    if (e.key === '2') {
      i18n.changeLanguage('en-US');
      localStorage.setItem('locale', 'en-US');
    }
    window.location.reload();
  };
  const menus = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="1">中文</Menu.Item>
      <Menu.Item key="2">English</Menu.Item>
    </Menu>
  );

  return (
    <AntdLayout style={{ height: '100%' }}>
      <Header style={{ position: 'fixed', zIndex: 1, width: '100%', padding: 0 }}>
        <div className="logo">
          <img src={logo} alt="logo" width="120px" />
          <Dropdown overlay={menus} trigger={['click', 'hover']}>
            <Button type="link" className="ant-dropdown-link" onClick={(e: any) => e.preventDefault()}>
              {lang === 'zh-CN' ? '中文' : 'English'} <DownOutlined />
            </Button>
          </Dropdown>
        </div>
      </Header>
      <Content style={{ marginTop: '50px', height: '100%', textAlign: 'center' }}>
        <div style={{
          width: '300px',
          height: '500px',
          marginLeft: 'auto',
          marginRight: 'auto',
          marginTop: '100px'
        }}>
          <Form name='login' {...formLayout} onFinish={handleSubmit}>
            <div className='form-item'>
              <Form.Item
                name='username'
                rules={[
                  {
                    required: true,
                    message: t('User'),
                  },
                ]}
              >
                <Input allowClear autoFocus prefix={<UserOutlined className='site-form-item-icon' />} placeholder={t('User')} />
              </Form.Item>
            </div>
            <div className='form-item'>
              <Form.Item
                name='password'
                rules={[
                  {
                    required: true,
                    message: t('PasswordMessage'),
                  },
                ]}
                hasFeedback
              >
                <Input.Password autoComplete='off' prefix={<LockOutlined className='site-form-item-icon' />} placeholder={t('Password')} />
              </Form.Item>
            </div>
            <div className='form-item'>
              <Form.Item
                name='confirm'
                dependencies={['password']}
                rules={[
                  {
                    required: true,
                    message: t('ConfirmMessage'),
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error(t('ConfirmPasswordMessage')));
                    },
                  }),
                ]}
                hasFeedback
              >
                <Input.Password autoComplete='off' prefix={<LockOutlined className='site-form-item-icon' />} placeholder={t('ConfirmPassword')} />
              </Form.Item>
            </div>

            <div className='form-item'>
              <Form.Item shouldUpdate={true} style={{ marginBottom: 0 }}>
                {() => (
                  <Button className='submit-btn' loading={loading} htmlType='submit'>
                    {t('ResetPassword')}
                  </Button>
                )}
              </Form.Item>
            </div>
          </Form>
        </div>
      </Content>
    </AntdLayout>
  );
}