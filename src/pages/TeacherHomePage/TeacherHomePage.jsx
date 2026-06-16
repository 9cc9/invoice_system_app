/**
 * 老师首页（占位）
 */

import { Button } from 'shared/ui/Button';
import { View } from 'shared/ui/View';
import { Text } from 'shared/ui/Text';
import { useAuthStore } from 'entities/auth';
import { useTranslation } from 'shared/hooks/useTranslation';
import { ROUTES } from 'shared/constants/routes';
import { useNavigate } from 'react-router-dom';
import { message } from 'shared/ui/Message';
import { styles } from './TeacherHomePage.styles';

export const TeacherHomePage = () => {
  const { user, logout } = useAuthStore();
  const { t } = useTranslation(['common', 'auth']);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    message.success(t('common:message.logoutSuccess'));
    navigate(ROUTES.LOGIN, { replace: true });
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{t('auth:title.teacherHome')}</Text>
        <Text style={styles.welcome}>
          {t('auth:message.welcomeUser', {
            name: user?.name,
            accountNo: user?.accountNo,
          })}
        </Text>
        <Text style={styles.hint}>{t('auth:message.teacherHomeHint')}</Text>
        <Button onClick={handleLogout}>{t('common:button.logout')}</Button>
      </View>
    </View>
  );
};
