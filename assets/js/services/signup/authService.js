import { supabase } from '@/lib/supabaseClient';
import { openNotificationWithIcon } from '@/components/common/notification/NotifAlert';

export const signUpWithEmail = async (email, password, fullName, t, navigate, lng) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) throw error;

    if (data.user && data.user.identities && data.user.identities.length === 0) {
      openNotificationWithIcon('error', t('registration_error_title'), t('email_already_registered'));
      return false;
    }

    openNotificationWithIcon('success', t('registration_successful'), t('verification_email_sent'));
    navigate(`/${lng}/signin`);
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    openNotificationWithIcon('error', t('registration_error_title'), t('registration_error_message'));
    return false;
  }
};