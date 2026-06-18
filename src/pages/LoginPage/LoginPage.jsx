/**
 * 登录页（上传发票 / 处理发票）
 */

import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Select } from 'antd';
import { Form, FormItem, useForm } from 'shared/ui/Form';
import { Input } from 'shared/ui/Input';
import { Button } from 'shared/ui/Button';
import { message } from 'shared/ui/Message';
import { View } from 'shared/ui/View';
import { Text } from 'shared/ui/Text';
import {
  useAuthStore,
  LOGIN_MODES,
  USER_ROLES,
  getHomeRouteByRole,
  canAccessLoginMode,
} from 'entities/auth';
import { POST_LOGIN_REDIRECT_KEY } from 'shared/constants/routes';
import { useTranslation } from 'shared/hooks/useTranslation';
import { LanguageSwitcher } from 'components/i18n';
import { styles } from './LoginPage.styles';

const DEFAULT_UPLOAD_PASSWORD = 'password123';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, logout, isAuthenticated, user, loading, error } = useAuthStore();
  const { t } = useTranslation(['common', 'auth']);
  const [loginMode, setLoginMode] = useState(LOGIN_MODES.UPLOAD);
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

  const handleModeSwitch = (mode) => {
    setLoginMode(mode);
    form.resetFields();
    if (mode === LOGIN_MODES.UPLOAD) {
      form.setFieldsValue({
        role: USER_ROLES.STUDENT,
        password: DEFAULT_UPLOAD_PASSWORD,
      });
    }
  };

  useEffect(() => {
    if (loginMode === LOGIN_MODES.UPLOAD) {
      form.setFieldsValue({
        role: USER_ROLES.STUDENT,
        password: DEFAULT_UPLOAD_PASSWORD,
      });
    }
  }, [form, loginMode]);

  const isUploadMode = loginMode === LOGIN_MODES.UPLOAD;

  const handleSubmit = async (values) => {
    const { accountNo, password, name, role } = values;
    const result = await login({
      accountNo: accountNo.trim(),
      password,
      ...(isUploadMode
        ? { name: name?.trim(), role }
        : {}),
    });

    if (!result.success) {
      message.error(result.error || t('common:message.loginFailed'));
      return;
    }

    const loggedInRole = result.user?.role;
    if (!canAccessLoginMode(loggedInRole, loginMode)) {
      await logout();
      const modeMismatchMessage =
        loginMode === LOGIN_MODES.UPLOAD
          ? t('auth:error.uploadRoleMismatch')
          : t('auth:error.processRoleMismatch');
      message.error(modeMismatchMessage);
      return;
    }

    message.success(t('common:message.loginSuccess'));
    navigate(getRedirectPath(result.user), { replace: true });
  };

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
              ...(isUploadMode ? styles.roleTabActive : {}),
            }}
            onClick={() => handleModeSwitch(LOGIN_MODES.UPLOAD)}
          >
            {t('auth:mode.upload')}
          </button>
          <button
            type="button"
            style={{
              ...styles.roleTab,
              ...(!isUploadMode ? styles.roleTabActive : {}),
            }}
            onClick={() => handleModeSwitch(LOGIN_MODES.PROCESS)}
          >
            {t('auth:mode.process')}
          </button>
        </View>

        <Text style={styles.roleHint}>
          {isUploadMode ? t('auth:message.uploadLoginHint') : t('auth:message.processLoginHint')}
        </Text>

        <Form
          form={form}
          name="login"
          onFinish={handleSubmit}
          layout="vertical"
          autoComplete="off"
          size="large"
          initialValues={
            isUploadMode
              ? { role: USER_ROLES.STUDENT, password: DEFAULT_UPLOAD_PASSWORD }
              : undefined
          }
        >
          {isUploadMode && (
            <>
              <FormItem
                name="role"
                label={t('auth:form.roleLabel')}
                rules={[
                  { required: true, message: t('auth:validation.roleRequired') },
                ]}
              >
                <Select
                  placeholder={t('auth:form.rolePlaceholder')}
                  options={[
                    { value: USER_ROLES.STUDENT, label: t('auth:form.roleStudent') },
                    { value: USER_ROLES.TEACHER, label: t('auth:form.roleTeacher') },
                  ]}
                />
              </FormItem>

              <FormItem
                name="name"
                label={t('auth:form.nameLabel')}
                rules={[
                  { required: true, message: t('auth:validation.nameRequired') },
                ]}
              >
                <Input placeholder={t('auth:form.namePlaceholder')} />
              </FormItem>
            </>
          )}

          <FormItem
            name="accountNo"
            label={t('auth:form.accountLabel')}
            rules={[
              { required: true, message: t('auth:validation.accountRequired') },
            ]}
          >
            <Input placeholder={t('auth:form.accountPlaceholder')} />
          </FormItem>

          <FormItem
            name="password"
            label={t('auth:form.passwordLabel')}
            rules={[
              { required: true, message: t('auth:validation.passwordRequired') },
              { min: 6, message: t('auth:validation.passwordMinLength') },
            ]}
          >
            <Input.Password
              placeholder={
                isUploadMode
                  ? t('auth:form.uploadPasswordPlaceholder')
                  : t('auth:form.passwordPlaceholder')
              }
            />
          </FormItem>

          {error && (
            <View style={styles.loginError}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <FormItem style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" loading={loading} block>
              {isUploadMode ? t('auth:button.uploadLogin') : t('auth:button.processLogin')}
            </Button>
          </FormItem>
        </Form>
      </View>
    </View>
  );
};
