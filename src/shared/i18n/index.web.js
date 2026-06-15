/**
 * i18n 初始化入口（Web 平台）
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { resources } from './resources';
import { i18nConfig } from './config';

const getDeviceLanguage = () => {
  try {
    const browserLanguage = navigator.language || navigator.userLanguage;
    const supportedLanguages = i18nConfig.supportedLanguages;

    if (supportedLanguages.includes(browserLanguage)) {
      return browserLanguage;
    }

    const languageCode = browserLanguage.split('-')[0];
    const languageMatch = supportedLanguages.find(lang =>
      lang.startsWith(languageCode)
    );

    return languageMatch || i18nConfig.defaultLanguage;
  } catch (error) {
    console.error('Failed to detect browser language:', error);
    return i18nConfig.defaultLanguage;
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getDeviceLanguage(),
    fallbackLng: i18nConfig.defaultLanguage,
    defaultNS: 'common',
    ns: i18nConfig.namespaces,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
