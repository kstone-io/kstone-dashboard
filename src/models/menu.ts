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

export interface AppMenu {
  title: string;
  icon?: string;
  items: (AppMenuItem | AppMenuLabel | AppSubMenu)[];
}

/**
 * 一个可路由的菜单项，至少包括 `title` 和 `route` 属性
 */
export interface AppMenuItem {
  /**
   * 菜单的标题
   */
  title: string;

  /**
   * 菜单的路由
   */
  route: string;

  /**
   * 菜单显示的图标
   */
  icon?: string;

  /**
   * 菜单激活时显示的图标
   */
  iconActive?: string;

  /**
   * 菜单打开的目标位置，默认为 _self 在当前页面打开，配置为 _blank
   */
  target?: '_self' | '_blank';

  /**
   * 是否渲染一个“外部链接”图标
   */
  outerLinkIcon?: boolean;

  key?: string;
}

/**
 * 一个菜单分类标签，仅包含 `label` 属性
 */
export interface AppMenuLabel {
  label: string;
}

/**
 * 一个子菜单项，包括 `title` 和 `items` 属性
 */
export interface AppSubMenu {
  /**
   * 子菜单明名称
   */
  title: string;

  /**
   * 包含的子菜单项
   */
  items: AppMenuItem[];

  /**
   * 子菜单图标
   */
  icon?: string;

  /**
   * 子菜单激活图标
   */
  iconActive?: string;
}