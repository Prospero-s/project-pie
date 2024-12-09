import { supabase } from '@/lib/supabaseClient';
import { openNotificationWithIcon } from '@/components/common/notification/NotifAlert';

export const signInWithEmail = async (email, password, t, setUser, navigate, lng) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (error) {
      if (error.status === 400 && error.message.includes('Email not confirmed')) {
        return { showVerificationModal: true };
      } else {
        throw error;
      }
    } else if (data.user) {
      const session = await supabase.auth.getSession();
      if (session.data.session) {
        openNotificationWithIcon('success', t('login_success'), t('login_success_message'));
        setUser(data.user);
        navigate(`/${lng}/dashboard`);
      }
    }
  } catch (error) {
    openNotificationWithIcon('error', t('login_error'), t('login_error_provider'));
  }
  return { showVerificationModal: false };
};

export const signInWithProvider = async (provider, lng, t, setUser, navigate) => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: window.location.origin + `/${lng}/dashboard`,
      },
    });
    if (data.user) {
      const session = await supabase.auth.getSession();
      if (session.data.session) {
        openNotificationWithIcon('success', t('login_success'), t('login_success_message'));
        setUser(data.user);
        navigate(`/${lng}/dashboard`);
      }
    }
  } catch (error) {
    openNotificationWithIcon('error', t('login_error'), t('login_error_provider'));
  }
};

export const resendVerificationEmail = async (email, t) => {
  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    });
    if (error) throw error;
    openNotificationWithIcon('success', t('verification_email_resent'), t('check_inbox'));
    return true;
  } catch (error) {
    openNotificationWithIcon('error', t('resend_error'), t('resend_error_message'));
    return false;
  }
};

export const resetPassword = async (email, lng, t) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + `/${lng}/auth/reset-password`,
    });
    if (error) throw error;
    openNotificationWithIcon('success', t('forgot_password.email_sent'), t('forgot_password.check_inbox'));
    return true;
  } catch (error) {
    openNotificationWithIcon('error', t('forgot_password.error'), t('forgot_password.error_message'));
    return false;
  }
};