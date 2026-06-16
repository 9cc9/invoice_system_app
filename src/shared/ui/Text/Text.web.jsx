/**
 * Text 组件（Web实现）
 * 跨平台的文本组件，Web 平台基于 antd Typography.Text
 */

import { Typography } from 'antd';

const { Text: AntdText } = Typography;

export const Text = ({ children, style, ...props }) => {
  return (
    <AntdText style={style} {...props}>
      {children}
    </AntdText>
  );
};

