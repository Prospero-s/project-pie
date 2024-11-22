import { supabase } from '@/lib/supabaseClient';
import { openNotificationWithIcon } from '@/components/common/Notification/NotifAlert';

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
      openNotificationWithIcon('success', t('login_success'), t('login_success_message'));
      setUser(data.user);
      navigate(`/${lng}/user/dashboard`);
    }
  } catch (error) {
    openNotificationWithIcon('error', t('login_error'), t('login_error_message'));
  }
  return { showVerificationModal: false };
};

export const signInWithProvider = async (provider, lng, t) => {
  try {
    await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: window.location.origin + `/${lng}/user/dashboard`,
      },
    });
  } catch (error) {
    console.error(`Erreur de connexion avec ${provider}:`, error);
    openNotificationWithIcon('error', t('login_error_title'), t('login_error_message'));
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

export const resetPassword = async (email, t) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/dashboard',
    });
    if (error) throw error;
    openNotificationWithIcon('success', t('forgot_password.email_sent'), t('forgot_password.check_inbox'));
    return true;
  } catch (error) {
    openNotificationWithIcon('error', t('forgot_password.error'), t('forgot_password.error_message'));
    return false;
  }
};