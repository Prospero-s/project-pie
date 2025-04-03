import { Auth } from 'aws-amplify';
import { CognitoHostedUIIdentityProvider } from '@aws-amplify/auth';
import { openNotificationWithIcon } from '@/components/common/notification/NotifAlert';
import axios from 'axios';

export const requestVerificationCode = async (email, fullName) => {
  try {
    await axios.post(`/api/auth/send-verification-code`, {
      email,
      fullName,
    });
    return { success: true };
  } catch (error) {
    console.error("Erreur lors de l'envoi du code de vérification:", error);
    return { success: false, error };
  }
};

const handleUnverifiedUser = async (email, fullName = 'Utilisateur', t) => {
  try {
    const response = await axios.get(
      `/api/auth/check-verification-code/${email}?fullName=${encodeURIComponent(fullName)}&autoSend=true`,
    );

    if (response.data.codeSent) {
      openNotificationWithIcon(
        'info',
        t('verification_code_sent'),
        t('verification_email_sent'),
      );
    } else if (response.data.hasValidCode) {
      openNotificationWithIcon(
        'info',
        t('verification_pending'),
        t('existing_verification_code'),
      );
    }

    return { success: true };
  } catch (error) {
    console.error(
      "Erreur lors du traitement de l'utilisateur non vérifié:",
      error,
    );
    openNotificationWithIcon(
      'error',
      t('verification_error'),
      t('verification_process_error'),
    );
    return { success: false, error };
  }
};

const verifyCode = async (email, code) => {
  try {
    const response = await axios.post(`/api/auth/verify-code`, {
      email,
      code,
    });
    return response.data.success;
  } catch (error) {
    console.error('Erreur lors de la vérification du code:', error);
    return false;
  }
};

const requestPasswordReset = async email => {
  try {
    await axios.post(`/api/auth/send-reset-password`, {
      email,
    });
    return { success: true };
  } catch (error) {
    console.error(
      "Erreur lors de l'envoi de l'email de réinitialisation:",
      error,
    );

    if (error.response) {
      console.error("Détails de l'erreur:", {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers,
      });
    }

    return {
      success: false,
      error,
      errorDetails: error.response?.data || {},
    };
  }
};

export const signUpWithEmail = async (email, password, fullName, t) => {
  try {
    await Auth.signUp({
      username: email,
      password,
      attributes: {
        email,
        name: fullName,
      },
    });

    try {
      localStorage.setItem(
        'prospero_user_data',
        JSON.stringify({
          email,
          fullName,
          timestamp: new Date().getTime(),
        }),
      );
    } catch (e) {
      console.error('Erreur lors de la sauvegarde des données utilisateur:', e);
    }

    await requestVerificationCode(email, fullName);

    return { success: true, showNotification: true };
  } catch (error) {
    if (error.code === 'UsernameExistsException') {
      openNotificationWithIcon(
        'error',
        t('registration_error_title'),
        t('email_already_registered'),
      );
    } else {
      openNotificationWithIcon(
        'error',
        t('registration_error_title'),
        t('registration_error_message'),
      );
    }
    return { success: false, error };
  }
};

export const signInWithEmail = async (
  email,
  password,
  t,
  setUser,
  navigate,
  lng,
) => {
  try {
    const cognitoUser = await Auth.signIn(email, password);

    const userId = cognitoUser.attributes.sub;

    const userData = {
      id: userId,
      email: cognitoUser.attributes.email,
      user_metadata: {
        full_name: cognitoUser.attributes.name || '',
        avatar_url: cognitoUser.attributes.picture || '',
        email_verified: cognitoUser.attributes.email_verified,
      },
      app_metadata: {
        roles:
          cognitoUser.signInUserSession.accessToken.payload['cognito:groups'] ||
          [],
      },
    };

    if (cognitoUser) {
      setUser(userData);
      navigate(`/${lng}/dashboard`);
      openNotificationWithIcon(
        'success',
        t('login_success'),
        t('login_success_message'),
      );
    }
    return { success: true, showVerificationModal: false };
  } catch (error) {
    if (error.code === 'UserNotConfirmedException') {
      let fullName = 'Utilisateur';

      try {
        const savedUser = localStorage.getItem('prospero_user_data');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          if (userData.email === email && userData.fullName) {
            fullName = userData.fullName;
          }
        }
      } catch (e) {
        console.error(
          'Erreur lors de la récupération des données utilisateur:',
          e,
        );
      }

      await handleUnverifiedUser(email, fullName, t);

      return {
        success: false,
        showVerificationModal: true,
        error: 'UserNotConfirmedException',
      };
    } else if (error.code === 'NotAuthorizedException') {
      openNotificationWithIcon(
        'error',
        t('login_error'),
        t('incorrect_credentials'),
      );
      return { success: false, error: 'NotAuthorizedException' };
    } else if (error.code === 'UserNotFoundException') {
      openNotificationWithIcon('error', t('login_error'), t('user_not_found'));
      return { success: false, error: 'UserNotFoundException' };
    } else if (error.code === 'TooManyRequestsException') {
      openNotificationWithIcon(
        'error',
        t('login_error'),
        t('too_many_requests'),
      );
      return { success: false, error: 'TooManyRequestsException' };
    } else {
      openNotificationWithIcon(
        'error',
        t('login_error'),
        t('login_error_message'),
      );
      return { success: false, error: error.code || 'UnknownError' };
    }
  }
};

export const signInWithProvider = async (provider, lng) => {
  try {
    const providerName = provider.toLowerCase();
    localStorage.setItem('preferredLanguage', lng);

    const redirectUri = encodeURIComponent(
      `${window.location.origin}/${lng}/auth/callback`,
    );

    const customState = encodeURIComponent(
      JSON.stringify({
        lang: lng,
        provider: providerName,
      }),
    );

    switch (providerName) {
      case 'google':
        await Auth.federatedSignIn({
          provider: CognitoHostedUIIdentityProvider.Google,
          redirectSignIn: redirectUri,
          customState,
        });
        break;
      case 'microsoft':
        await Auth.federatedSignIn({
          provider: 'Microsoft',
          redirectSignIn: redirectUri,
          customState,
        });
        break;
      default:
        throw new Error(`Fournisseur ${provider} non supporté`);
    }
  } catch (error) {
    throw new Error(
      `Erreur de connexion: ${error.message} ${error.response?.data ? `(${JSON.stringify(error.response.data)})` : ''} [Status: ${error.response?.status || 'N/A'}]`,
    );
  }
};

export const resendVerificationEmail = async (email, t) => {
  try {
    if (!email) {
      openNotificationWithIcon('error', t('resend_error'), t('email_required'));
      return { success: false };
    }

    const storedData = localStorage.getItem('prospero_user_data');
    let fullName = '';

    if (storedData) {
      try {
        const userData = JSON.parse(storedData);
        if (userData.email === email) {
          fullName = userData.fullName || '';
        }
      } catch (e) {
        console.error(
          'Erreur lors de la récupération des données utilisateur:',
          e,
        );
      }
    }

    await requestVerificationCode(email, fullName);

    openNotificationWithIcon(
      'success',
      t('verification_email_resent'),
      t('check_inbox'),
    );

    return { success: true, showNotification: true };
  } catch (error) {
    openNotificationWithIcon(
      'error',
      t('resend_error'),
      t('resend_error_message'),
    );
    return { success: false, error };
  }
};

export const resetPassword = async (email, t) => {
  try {
    if (!email) {
      openNotificationWithIcon(
        'error',
        t('forgot_password.error'),
        t('email_required'),
      );
      return { success: false };
    }

    const result = await requestPasswordReset(email);
    if (!result.success) {
      if (result.errorDetails && result.errorDetails.error) {
        throw new Error(
          `${t('forgot_password.error_sending_email')}: ${result.errorDetails.error}`,
        );
      }
      throw new Error(t('forgot_password.error_sending_email'));
    }

    openNotificationWithIcon(
      'success',
      t('forgot_password.email_sent'),
      t('forgot_password.check_inbox'),
    );
    return { success: true };
  } catch (error) {
    openNotificationWithIcon(
      'error',
      t('forgot_password.error'),
      `${t('forgot_password.error_message')} - ${error.message}`,
    );
    return { success: false, error };
  }
};

export const confirmResetPassword = async (email, code, newPassword, t) => {
  try {
    if (!email || !code || !newPassword) {
      openNotificationWithIcon(
        'error',
        t('forgot_password.error'),
        t('forgot_password.missing_information'),
      );
      return { success: false };
    }

    const response = await axios.post(`/api/auth/update-password`, {
      email,
      code,
      newPassword,
    });

    if (response.data.success) {
      openNotificationWithIcon(
        'success',
        t('forgot_password.success'),
        t('forgot_password.success_message'),
      );
      return { success: true };
    } else {
      throw new Error(
        response.data.error || t('forgot_password.error_message'),
      );
    }
  } catch (error) {
    let errorMessage = t('forgot_password.error_message');

    if (error.response?.status === 429) {
      errorMessage = t('forgot_password.too_many_attempts');
    } else if (error.response?.data?.message?.includes('password')) {
      errorMessage = t('forgot_password.invalid_password');
    } else if (error.response?.data?.message?.includes('code')) {
      errorMessage = t('forgot_password.code_mismatch');
    } else if (error.response?.data?.message?.includes('expired')) {
      errorMessage = t('forgot_password.expired_code');
    }

    openNotificationWithIcon(
      'error',
      t('forgot_password.error'),
      `${errorMessage} - ${error.message}`,
    );
    return { success: false, error };
  }
};

export const signOut = async (t, lng = 'fr', navigate) => {
  try {
    const currentUser = await Auth.currentAuthenticatedUser();
    const isFederatedUser =
      currentUser.authenticationFlowType !== 'USER_SRP_AUTH';

    await Auth.signOut();

    if (isFederatedUser) {
      const cognitoDomain = import.meta.env.VITE_AWS_COGNITO_DOMAIN;
      const clientId = import.meta.env.VITE_AWS_CLIENT_ID;
      const signOutUrl = encodeURIComponent(
        `${window.location.protocol}//${window.location.host}/${lng}/auth/signin`,
      );

      const logoutUrl = new URL(`https://${cognitoDomain}/logout`);
      logoutUrl.searchParams.append('client_id', clientId);
      logoutUrl.searchParams.append('logout_uri', signOutUrl);

      window.location.replace(logoutUrl.toString());
    } else {
      navigate(`/${lng}/auth/signin`, { replace: true });
    }
  } catch (error) {
    openNotificationWithIcon(
      'error',
      t('logout_error'),
      `${t('logout_error_message')} - ${error.message}`,
    );
    window.location.href = `/${lng}/auth/signin`;
  }
};

export const updatePassword = async (oldPassword, newPassword, t) => {
  try {
    if (!oldPassword || !newPassword) {
      openNotificationWithIcon(
        'error',
        t('error'),
        t('password_fields_required'),
      );
      return { success: false };
    }

    const user = await Auth.currentAuthenticatedUser();
    await Auth.changePassword(user, oldPassword, newPassword);

    openNotificationWithIcon('success', t('success'), t('success_message'));
    return { success: true };
  } catch (error) {
    let errorMessage = t('error_message');

    if (error.code === 'NotAuthorizedException') {
      errorMessage = t('incorrect_old_password');
    } else if (error.code === 'InvalidPasswordException') {
      errorMessage = t('invalid_password_format');
    } else if (error.code === 'LimitExceededException') {
      errorMessage = t('too_many_attempts');
    }

    openNotificationWithIcon(
      'error',
      t('error'),
      `${errorMessage} - ${error.message}`,
    );
    return { success: false, error };
  }
};

export const confirmSignUp = async (email, code, t) => {
  try {
    if (!email || !code) {
      openNotificationWithIcon(
        'error',
        t('verification_error'),
        t('verification_code_required'),
      );
      return { success: false };
    }

    const success = await verifyCode(email, code);

    if (!success) {
      throw new Error(t('verification_error_message'));
    }

    return { success: true, showNotification: true };
  } catch (error) {
    return { success: false, error };
  }
};
