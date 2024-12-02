import React from 'react';
import { Button } from 'antd';

const SignUpLink = ({ t, lng }) => (
  <div className="mt-6 text-center">
    <p>
      {t('already_have_account')}{' '}
      <Button
        href={`/${lng}/auth/signin`}
        className="text-primary text-md !p-0"
        type="link"
      >
        {t('sign_in')}
      </Button>
    </p>
  </div>
);

export default SignUpLink;