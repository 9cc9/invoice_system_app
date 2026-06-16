/**
 * 登录页（学生 / 老师分角色登录）
 */

import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Form, FormItem, useForm } from 'shared/ui/Form';
import { Input } from 'shared/ui/Input';
import { Button } from 'shared/ui/Button';
import { message } from 'shared/ui/Message';
import { View } from 'shared/ui/View';
import { Text } from 'shared/ui/Text';
import { useAuthStore, USER_ROLES, getHomeRouteByRole } from 'entities/auth';
import { POST_LOGIN_REDIRECT_KEY } from 'shared/constants/routes';
import { useTranslation } from 'shared/hooks/useTranslation';
import { LanguageSwitcher } from 'components/i18n';
import { styles } from './LoginPage.styles';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, logout, isAuthenticated, user, loading, error } = useAuthStore();
  const { t } = useTranslation(['common', 'auth']);
  const [selectedRole, setSelectedRole] = useState(USER_ROLES.STUDENT);
  const [form] = useForm();

  const getRedirectPath = (loggedInUser) => {
    if (location.state?.from) {
      const from = location.state.from;
      return from.pathname + (from.search || '') + (from.hash || '');
    }
    try {
      const saved = sessionStorage.getItem(POST_LOGIN_REDIRECT_KEY);
      if (saved) {
        sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY);
        return saved;
      }
    } catch {
      // ignore
    }
    return getHomeRouteByRole(loggedInUser?.role);
  };

  useEffect(() => {
    if (isAuthenticated && user?.role) {
      navigate(getRedirectPath(user), { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    form.resetFields();
  }, [selectedRole, form]);

  const handleRoleSwitch = (role) => {
    setSelectedRole(role);
  };

  const handleSubmit = async (values) => {
    const { accountNo, password } = values;
    const result = await login(accountNo.trim(), password);

    if (!result.success) {
      message.error(result.error || t('common:message.loginFailed'));
      return;
    }

    const loggedInRole = result.user?.role;
    if (loggedInRole !== selectedRole) {
      await logout();
      const roleMismatchMessage =
        selectedRole === USER_ROLES.STUDENT
          ? t('auth:error.studentRoleMismatch')
          : t('auth:error.teacherRoleMismatch');
      message.error(roleMismatchMessage);
      return;
    }

    message.success(t('common:message.loginSuccess'));
    navigate(getRedirectPath(result.user), { replace: true });
  };

  const isStudent = selectedRole === USER_ROLES.STUDENT;

  return (
    <View style={styles.loginPage}>
      <View style={styles.languageSwitcherContainer}>
        <LanguageSwitcher />
      </View>

      <View style={styles.loginContainer}>
        <View style={styles.brandBlock}>
          <Text style={styles.appTitle}>{t('common:title.app')}</Text>
          <Text style={styles.appSubtitle}>{t('auth:message.loginSubtitle')}</Text>
        </View>

        <View style={styles.roleTabs}>
          <button
            type="button"
            style={{
              ...styles.roleTab,
              ...(isStudent ? styles.roleTabActive : {}),
            }}
            onClick={() => handleRoleSwitch(USER_ROLES.STUDENT)}
          >
            {t('auth:role.student')}
          </button>
          <button
            type="button"
            style={{
              ...styles.roleTab,
              ...(!isStudent ? styles.roleTabActive : {}),
            }}
            onClick={() => handleRoleSwitch(USER_ROLES.TEACHER)}
          >
            {t('auth:role.teacher')}
          </button>
        </View>

        <Text style={styles.roleHint}>
          {isStudent ? t('auth:message.studentLoginHint') : t('auth:message.teacherLoginHint')}
        </Text>

        <Form
          form={form}
          name="login"
          onFinish={handleSubmit}
          layout="vertical"
          autoComplete="off"
          size="large"
        >
          <FormItem
            name="accountNo"
            label={isStudent ? t('auth:form.studentAccountLabel') : t('auth:form.teacherAccountLabel')}
            rules={[
              { required: true, message: t('auth:validation.accountRequired') },
            ]}
          >
            <Input
              placeholder={
                isStudent
                  ? t('auth:form.studentAccountPlaceholder')
                  : t('auth:form.teacherAccountPlaceholder')
              }
            />
          </FormItem>

          <FormItem
            name="password"
            label={t('auth:form.passwordLabel')}
            rules={[
              { required: true, message: t('auth:validation.passwordRequired') },
              { min: 6, message: t('auth:validation.passwordMinLength') },
            ]}
          >
            <Input.Password placeholder={t('auth:form.passwordPlaceholder')} />
          </FormItem>

          {error && (
            <View style={styles.loginError}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <FormItem style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" loading={loading} block>
              {isStudent ? t('auth:button.studentLogin') : t('auth:button.teacherLogin')}
            </Button>
          </FormItem>
        </Form>
      </View>
    </View>
  );
};
