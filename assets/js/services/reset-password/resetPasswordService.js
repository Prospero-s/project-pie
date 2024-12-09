import { supabase } from '@/lib/supabaseClient';
import { openNotificationWithIcon } from '@/components/common/notification/NotifAlert';
import { useNavigate } from 'react-router-dom';

export const handleResetPassword = async (password, confirmPassword, t, access_token, refresh_token, lng) => {
  const navigate = useNavigate();

  if (password !== confirmPassword) {
    openNotificationWithIcon('error', t('password_mismatch'), t('password_mismatch_message'));
    return;
  }

  try {
    if (!access_token) {
      throw new Error('Access token is missing');
    }

    const { data: sessionData, error: signInError } = await supabase.auth.setSession({
      access_token: access_token,
      refresh_token: refresh_token,
    });

    if (signInError) {
      throw new Error(`Sign-in error: ${signInError.message}`);
    }

    if (!sessionData || !sessionData.session) {
      throw new Error('Session not established');
    }

    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      if (updateError.message.includes('New password should be different from the old password')) {
        openNotificationWithIcon('error', t('same_password_error'), t('same_password_error_message'));
      } else {
        throw new Error(`Update error: ${updateError.message}`);
      }
    } else {
      openNotificationWithIcon('success', t('success'), t('success_message'));
      navigate(`/${lng}/auth/signin`);
    }
  } catch (error) {
    console.error('Error during password reset:', error);
    openNotificationWithIcon('error', t('error'), t('error_message'));
  }
};