/**
 * 应用根组件
 */

import { useEffect } from 'react';
import { Router } from './router';
import 'shared/i18n';
import { useI18nStore } from 'shared/i18n/store';

export const App = () => {
  const initLanguage = useI18nStore((state) => state.initLanguage);

  useEffect(() => {
    initLanguage();
  }, [initLanguage]);

  return <Router />;
};
