/**
 * 封装的 useTranslation Hook
 */

import { useTranslation as useI18nTranslation } from 'react-i18next';

export const useTranslation = (ns) => {
  const { t, i18n, ready } = useI18nTranslation(ns);
  
  return {
    t,
    i18n,
    ready,
    currentLanguage: i18n.language,
    changeLanguage: (lng) => i18n.changeLanguage(lng),
  };
};
