import React from 'react';
import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const SignUpLink = ({ t, lng }) => {
  const navigate = useNavigate();

  return (
    <div className="mt-6 text-center">
      <p className="text-sm text-gray-600">
        {t('already_have_account')}{' '}
        <Button
          type="link"
          onClick={() => navigate(`/${lng}/auth/signin`)}
          className="text-primary hover:text-primary/80 font-medium !p-0"
        >
          {t('sign_in')}
        </Button>
      </p>
    </div>
  );
};

export default SignUpLink;