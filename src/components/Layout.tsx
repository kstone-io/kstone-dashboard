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
import { Outlet, Link } from 'react-router-dom';
import {
  ConfigProvider,
  Dropdown,
  Layout as AntdLayout,
  Menu,
  Button,
} from 'antd';
import { ClusterOutlined } from '@ant-design/icons';
import logo from '../../src/logo.png';
import './Layout.css';
import DownOutlined from '@ant-design/icons/lib/icons/DownOutlined';
import { useTranslation } from 'react-i18next';
import zhCN from 'antd/lib/locale/zh_CN';
import enUS from 'antd/lib/locale/en_US';
import cookies from 'src/utils/cookies';
import { t } from 'i18next';

const { Header, Content, Sider } = AntdLayout;
const { SubMenu } = Menu;

const Layout = ({ menu }: { menu: any }): JSX.Element => {
  const [collapsed, setCollapsed] = useState(false);
  const { i18n } = useTranslation();
  const lang = localStorage.getItem('locale');

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

  const handleLogout = () => {
    cookies.remove("token");
    window.location.href = "/login";
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
          {
            cookies.get('token') !== '' ? <Button style={{ width: '100px', marginRight: '0', marginLeft: 'auto' }} type='link' block onClick={() => { handleLogout() }}>
              {t('Logout')}
            </Button> : null
          }
          <Dropdown overlay={menus} trigger={['click', 'hover']}>
            <Button type="link" className="ant-dropdown-link" onClick={(e: any) => e.preventDefault()}>
              {lang === 'zh-CN' ? '中文' : 'English'} <DownOutlined />
            </Button>
          </Dropdown>
        </div>
      </Header>
      <Content style={{ marginTop: '50px', height: '100%' }}>
        <AntdLayout style={{ minHeight: '100%' }}>
          <Sider
            collapsible
            collapsed={collapsed}
            onCollapse={() => setCollapsed(!collapsed)}
            width={250}
            style={{
              overflow: 'auto',
              height: '100vh',
              position: 'fixed',
              left: 0,
            }}
          >
            <Menu
              mode="inline"
              defaultOpenKeys={menu.items.map((item: any) => item.key)}
              style={{ height: '100%' }}
              theme="dark"
            >
              {menu.items.map((item: any) => {
                if ('items' in item) {
                  return (
                    <SubMenu
                      key={item.key}
                      icon={<ClusterOutlined />}
                      title={item.title}
                    >
                      {item.items.map((subItem: any) => {
                        return (
                          <Menu.Item key={subItem.key}>
                            <Link to={subItem.route}>{subItem.title}</Link>
                          </Menu.Item>
                        );
                      })}
                    </SubMenu>
                  );
                } else {
                  return (
                    <Menu.Item key={item.key}>
                      <Link to={item.route}>{item.title}</Link>
                    </Menu.Item>
                  );
                }
              })}
            </Menu>
          </Sider>
          <AntdLayout
            className="site-layout"
            style={(() => {
              if (collapsed) {
                return { marginLeft: '80px', minHeight: '100%' };
              } else {
                return { marginLeft: '250px', minHeight: '100%' };
              }
            })()}
          >
            <ConfigProvider locale={lang === 'zh-CN' ? zhCN : enUS}>
              <Outlet></Outlet>
            </ConfigProvider>
          </AntdLayout>
        </AntdLayout>
      </Content>
    </AntdLayout>
  );
};

export default Layout;
