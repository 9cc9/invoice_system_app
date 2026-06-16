/**
 * 语言切换组件（Web 平台）
 */

import { useState } from 'react';
import { Select } from 'antd';
import { useI18nStore } from 'shared/i18n/store';
import { i18nConfig } from 'shared/i18n/config';

const languageLabels = {
  'zh-CN': '中文',
  'es-BO': 'Español',
  'en-US': 'English',
};

export const LanguageSwitcher = ({ style }) => {
  const { currentLanguage, setLanguage } = useI18nStore();
  const [open, setOpen] = useState(false);

  const handleLanguageChange = async (lang) => {
    if (lang !== currentLanguage) {
      await setLanguage(lang);
    }
    setOpen(false);
  };

  const options = i18nConfig.supportedLanguages.map((lang) => ({
    label: languageLabels[lang],
    value: lang,
  }));

  return (
    <Select
      value={currentLanguage}
      onChange={handleLanguageChange}
      options={options}
      style={{ minWidth: 100, ...style }}
      open={open}
      onDropdownVisibleChange={setOpen}
    />
  );
};
