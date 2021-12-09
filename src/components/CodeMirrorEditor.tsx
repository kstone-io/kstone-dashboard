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

import { insertCSS } from '../../src/utils/common';
import * as React from 'react';
import { UnControlled as CodeMirror } from 'react-codemirror2';

// 这里是对editor一些配置
require('codemirror/mode/yaml/yaml');

insertCSS(
  'YamlEditorPanel',
  `
.cm-s-monokai.CodeMirror{background:#272822;color:#f8f8f2;height:100%;}.cm-s-monokai div.CodeMirror-selected{background:#49483e}.cm-s-monokai .CodeMirror-line::selection,.cm-s-monokai .CodeMirror-line>span::selection,.cm-s-monokai .CodeMirror-line>span>span::selection{background:rgba(73,72,62,.99)}.cm-s-monokai .CodeMirror-line::-moz-selection,.cm-s-monokai .CodeMirror-line>span::-moz-selection,.cm-s-monokai .CodeMirror-line>span>span::-moz-selection{background:rgba(73,72,62,.99)}.cm-s-monokai .CodeMirror-gutters{background:#272822;border-right:0}.cm-s-monokai .CodeMirror-guttermarker{color:white}.cm-s-monokai .CodeMirror-guttermarker-subtle{color:#d0d0d0}.cm-s-monokai .CodeMirror-linenumber{color:#d0d0d0}.cm-s-monokai .CodeMirror-cursor{border-left:1px solid #f8f8f0}.cm-s-monokai span.cm-comment{color:#75715e}.cm-s-monokai span.cm-atom{color:#ae81ff}.cm-s-monokai span.cm-number{color:#ae81ff}.cm-s-monokai span.cm-property,.cm-s-monokai span.cm-attribute{color:#a6e22e}.cm-s-monokai span.cm-keyword{color:#f92672}.cm-s-monokai span.cm-builtin{color:#66d9ef}.cm-s-monokai span.cm-string{color:#e6db74}.cm-s-monokai span.cm-variable{color:#f8f8f2}.cm-s-monokai span.cm-variable-2{color:#9effff}.cm-s-monokai span.cm-variable-3,.cm-s-monokai span.cm-type{color:#66d9ef}.cm-s-monokai span.cm-def{color:#fd971f}.cm-s-monokai span.cm-bracket{color:#f8f8f2}.cm-s-monokai span.cm-tag{color:#f92672}.cm-s-monokai span.cm-header{color:#ae81ff}.cm-s-monokai span.cm-link{color:#ae81ff}.cm-s-monokai span.cm-error{background:#f92672;color:#f8f8f0}.cm-s-monokai .CodeMirror-activeline-background{background:#373831}.cm-s-monokai .CodeMirror-matchingbracket{text-decoration:underline;color:white!important}.CodeMirror{font-family:monospace;height:560px;color:black;border-radius:2px;direction:ltr}.CodeMirror-lines{padding:4px 0}.CodeMirror pre{padding:0 4px}.CodeMirror-scrollbar-filler,.CodeMirror-gutter-filler{background-color:white}.CodeMirror-gutters{border-right:1px solid #ddd;background-color:#f7f7f7;white-space:nowrap}.CodeMirror-linenumber{padding:0 3px 0 5px;min-width:20px;text-align:right;color:#999;white-space:nowrap}.CodeMirror-guttermarker{color:black}.CodeMirror-guttermarker-subtle{color:#999}.CodeMirror-cursor{border-left:1px solid black;border-right:0;width:0}.CodeMirror div.CodeMirror-secondarycursor{border-left:1px solid silver}.cm-fat-cursor .CodeMirror-cursor{width:auto;border:0!important;background:#7e7}.cm-fat-cursor div.CodeMirror-cursors{z-index:1}.cm-animate-fat-cursor{width:auto;border:0;-webkit-animation:blink 1.06s steps(1) infinite;-moz-animation:blink 1.06s steps(1) infinite;animation:blink 1.06s steps(1) infinite;background-color:#7e7}@-moz-keyframes blink{50%{background-color:transparent}}@-webkit-keyframes blink{50%{background-color:transparent}}@keyframes blink{50%{background-color:transparent}}.cm-tab{display:inline-block;text-decoration:inherit}.CodeMirror-rulers{position:absolute;left:0;right:0;top:-50px;bottom:-20px;overflow:hidden}.CodeMirror-ruler{border-left:1px solid #ccc;top:0;bottom:0;position:absolute}.cm-s-default .cm-header{color:blue}.cm-s-default .cm-quote{color:#090}.cm-negative{color:#d44}.cm-positive{color:#292}.cm-header,.cm-strong{font-weight:bold}.cm-em{font-style:italic}.cm-link{text-decoration:underline}.cm-strikethrough{text-decoration:line-through}.cm-s-default .cm-keyword{color:#708}.cm-s-default .cm-atom{color:#219}.cm-s-default .cm-number{color:#164}.cm-s-default .cm-def{color:#00f}.cm-s-default .cm-variable-2{color:#05a}.cm-s-default .cm-variable-3,.cm-s-default .cm-type{color:#085}.cm-s-default .cm-comment{color:#a50}.cm-s-default .cm-string{color:#a11}.cm-s-default .cm-string-2{color:#f50}.cm-s-default .cm-meta{color:#555}.cm-s-default .cm-qualifier{color:#555}.cm-s-default .cm-builtin{color:#30a}.cm-s-default .cm-bracket{color:#997}.cm-s-default .cm-tag{color:#170}.cm-s-default .cm-attribute{color:#00c}.cm-s-default .cm-hr{color:#999}.cm-s-default .cm-link{color:#00c}.cm-s-default .cm-error{color:#f00}.cm-invalidchar{color:#f00}.CodeMirror-composing{border-bottom:2px solid}div.CodeMirror span.CodeMirror-matchingbracket{color:#0f0}div.CodeMirror span.CodeMirror-nonmatchingbracket{color:#f22}.CodeMirror-matchingtag{background:rgba(255,150,0,.3)}.CodeMirror-activeline-background{background:#e8f2ff}.CodeMirror{position:relative;overflow:hidden;background:white}.CodeMirror-scroll{overflow:scroll!important;margin-bottom:-30px;margin-right:-30px;padding-bottom:30px;height:100%;outline:0;position:relative}.CodeMirror-sizer{position:relative;border-right:30px solid transparent}.CodeMirror-vscrollbar,.CodeMirror-hscrollbar,.CodeMirror-scrollbar-filler,.CodeMirror-gutter-filler{position:absolute;z-index:6;display:none}.CodeMirror-vscrollbar{right:0;top:0;overflow-x:hidden;overflow-y:scroll}.CodeMirror-hscrollbar{bottom:0;left:0;overflow-y:hidden;overflow-x:scroll}.CodeMirror-scrollbar-filler{right:0;bottom:0}.CodeMirror-gutter-filler{left:0;bottom:0}.CodeMirror-gutters{position:absolute;left:0;top:0;min-height:100%;z-index:3}
.CodeMirror-gutter{white-space:normal;height:100%;display:inline-block;vertical-align:top;margin-bottom:-30px}.CodeMirror-gutter-wrapper{position:absolute;z-index:4;background:none!important;border:none!important}.CodeMirror-gutter-background{position:absolute;top:0;bottom:0;z-index:4}.CodeMirror-gutter-elt{position:absolute;cursor:default;z-index:4}.CodeMirror-gutter-wrapper ::selection{background-color:transparent}.CodeMirror-gutter-wrapper ::-moz-selection{background-color:transparent}.CodeMirror-lines{cursor:text;min-height:1px}.CodeMirror pre{-moz-border-radius:0;-webkit-border-radius:0;border-radius:0;border-width:0;background:transparent;font-family:inherit;font-size:inherit;margin:0;white-space:pre;word-wrap:normal;line-height:inherit;color:inherit;z-index:2;position:relative;overflow:visible;-webkit-tap-highlight-color:transparent;-webkit-font-variant-ligatures:contextual;font-variant-ligatures:contextual}.CodeMirror-wrap pre{word-wrap:break-word;white-space:pre-wrap;word-break:normal}.CodeMirror-linebackground{position:absolute;left:0;right:0;top:0;bottom:0;z-index:0}.CodeMirror-linewidget{position:relative;z-index:2;overflow:auto}.CodeMirror-rtl pre{direction:rtl}.CodeMirror-code{outline:0}.CodeMirror-scroll,.CodeMirror-sizer,.CodeMirror-gutter,.CodeMirror-gutters,.CodeMirror-linenumber{-moz-box-sizing:content-box;box-sizing:content-box}.CodeMirror-measure{position:absolute;width:100%;height:0;overflow:hidden;visibility:hidden}.CodeMirror-cursor{position:absolute;pointer-events:none}.CodeMirror-measure pre{position:static}div.CodeMirror-cursors{visibility:hidden;position:relative;z-index:3}div.CodeMirror-dragcursors{visibility:visible}.CodeMirror-focused div.CodeMirror-cursors{visibility:visible}.CodeMirror-selected{background:#d9d9d9}.CodeMirror-focused .CodeMirror-selected{background:#d7d4f0}.CodeMirror-crosshair{cursor:crosshair}.CodeMirror-line::selection,.CodeMirror-line>span::selection,.CodeMirror-line>span>span::selection{background:#d7d4f0}.CodeMirror-line::-moz-selection,.CodeMirror-line>span::-moz-selection,.CodeMirror-line>span>span::-moz-selection{background:#d7d4f0}.cm-searching{background-color:#ffa;background-color:rgba(255,255,0,.4)}.cm-force-border{padding-right:.1px}@media print{.CodeMirror div.CodeMirror-cursors{visibility:hidden}}.cm-tab-wrap-hack:after{content:''}span.CodeMirror-selectedtext{background:0}
.codeMirrorHeight{height:600px;overflow:auto;}
`
);

interface YamlEditorPanelProps {
  /** 输入的内容 */
  config?: string;

  /** 是否只读 */
  readOnly?: boolean;

  /** 回调函数，处理输入数据 */
  handleInputForEditor?: (config: string) => void;

  /** 当前的mode */
  mode?: string;
}

export class YamlEditorPanel extends React.Component<YamlEditorPanelProps> {
  render(): JSX.Element {
    const { readOnly, mode = 'yaml', handleInputForEditor } = this.props;

    const codeOptions = {
      lineNumbers: true,
      mode,
      theme: 'monokai',
      readOnly: readOnly ? readOnly : false,
      lineWrapping: true, // 自动换行
      styleActiveLine: true, // 当前行背景高亮
    };

    return (
      <CodeMirror
        className={'codeMirrorHeight'}
        value={this.props.config}
        options={codeOptions}
        onChange={(editor, data, value) => {
          !readOnly && handleInputForEditor !== undefined && handleInputForEditor(value);
        }}
      />
    );
  }
}
