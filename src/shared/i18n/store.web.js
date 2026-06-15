/**
 * i18n 语言切换 Store（Web 平台）
 */

import { create } from 'zustand';
import i18n from './index.web';
import { i18nConfig } from './config';

const STORAGE_KEY = 'i18n_language';

export const useI18nStore = create((set) => ({
  currentLanguage: i18nConfig.defaultLanguage,

  setLanguage: async (lang) => {
    try {
      await i18n.changeLanguage(lang);
      localStorage.setItem(STORAGE_KEY, lang);
      set({ currentLanguage: lang });
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  },

  initLanguage: async () => {
    try {
      const savedLanguage = localStorage.getItem(STORAGE_KEY);
      if (savedLanguage && i18n.hasResourceBundle(savedLanguage, 'common')) {
        await i18n.changeLanguage(savedLanguage);
        set({ currentLanguage: savedLanguage });
      } else {
        set({ currentLanguage: i18n.language });
      }
    } catch (error) {
      console.error('Failed to load saved language:', error);
    }
  },
}));
