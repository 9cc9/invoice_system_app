/**
 * 首页（占位）
 */

import { useTranslation } from 'react-i18next';
import { styles } from './HomePage.styles';

export const HomePage = () => {
  const { t } = useTranslation('common');

  return (
    <main style={styles.container}>
      <h1 style={styles.title}>{t('title.app')}</h1>
      <p style={styles.subtitle}>{t('message.welcome')}</p>
    </main>
  );
};
