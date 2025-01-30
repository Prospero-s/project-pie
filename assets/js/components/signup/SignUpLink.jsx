import React from 'react';
import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const SignUpLink = ({ t, lng }) => {
  const navigate = useNavigate();

  return (
    <div className="mt-6 text-center">
      <p>
        {t('already_have_account')}{' '}
      <Button
        onClick={() => navigate(`/${lng}/auth/signin`)}
        className="text-primary text-base !p-0"
        type="link"
      >
        {t('sign_in')}
      </Button>
    </p>
  </div>
  );
};

export default SignUpLink;