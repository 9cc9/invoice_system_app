/**
 * 按钮组件适配器
 * 
 * 统一对外 API：
 * - 支持 onClick（Web）和 onPress（Native），自动适配
 * - 构建工具会自动选择对应平台实现：
 *   - Web (Vite): 自动选择 Button.web.js
 *   - React Native (Metro): 自动选择 Button.native.js
 * 
 * 实现原理：
 * 1. 构建工具根据平台自动选择对应的适配器文件（.web.js 或 .native.js）
 * 2. 适配器统一处理 onClick/onPress，对外提供统一接口
 * 3. 适配器内部调用对应平台的实现文件（.web.jsx 或 .native.jsx）
 */

// 构建工具会自动选择对应平台的文件：
// - Web (Vite): 自动选择 Button.web.js
// - React Native (Metro): 自动选择 Button.native.js
// 注意：导入时不带平台后缀，让构建工具自动解析
import { Button } from './Button.web';

// 直接导出，构建工具会自动选择对应平台的实现
export { Button };

