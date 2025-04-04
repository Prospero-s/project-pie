import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Auth } from 'aws-amplify';
import { useUser } from '@/context/userContext';
import { useRedirect } from '@/context/redirectContext';

const GroupRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  const { setIsCheckingRedirect } = useRedirect();
  const [retryCount, setRetryCount] = useState(0);
  const [lastCheckedPath, setLastCheckedPath] = useState('');

  const setupAuthHeaders = useCallback(async () => {
    if (
      location.pathname.includes('/auth') ||
      location.pathname === lastCheckedPath ||
      !user
    ) {
      setIsCheckingRedirect(false);
      return;
    }

    try {
      setIsCheckingRedirect(true);
      if (retryCount > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const session = await Auth.currentSession();
      const jwtToken = session.getIdToken().getJwtToken();

      const headers = {
        Authorization: `Bearer ${jwtToken}`,
        'x-cognito-id': session.getIdToken().payload.sub,
        'x-cognito-email': session.getIdToken().payload.email,
        'x-cognito-name': session.getIdToken().payload.name,
      };

      axios.defaults.headers.common = headers;

      const response = await axios.get('/api/user-groups', { headers });
      const hasGroup = response.data.groups && response.data.groups.length > 0;
      const isOnGroupSelection = location.pathname.includes('/group-selection');
      const lang = location.pathname.split('/')[1] || 'fr';

      if (hasGroup && isOnGroupSelection) {
        navigate(`/${lang}/dashboard`, { replace: true });
      } else if (
        !hasGroup &&
        !isOnGroupSelection &&
        !location.pathname.includes('/auth')
      ) {
        navigate(`/${lang}/group-selection`, { replace: true });
      }

      setLastCheckedPath(location.pathname);
    } catch (error) {
      if (error.response?.status === 401 && retryCount < 3) {
        setRetryCount(prev => prev + 1);
        return;
      }

      if (
        error.response?.status === 401 &&
        !location.pathname.includes('/auth')
      ) {
        const lang = location.pathname.split('/')[1] || 'fr';
        navigate(`/${lang}/auth/signin`, { replace: true });
      }
    } finally {
      setIsCheckingRedirect(false);
    }
  }, [
    location.pathname,
    retryCount,
    user,
    lastCheckedPath,
    navigate,
    setIsCheckingRedirect,
  ]);

  useEffect(() => {
    setupAuthHeaders();
  }, [setupAuthHeaders]);

  return null;
};

export default GroupRedirect;
