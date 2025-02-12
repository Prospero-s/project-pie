import React from 'react';
import { Button } from 'antd';

const SignUpButton = ({ t, isFormValid }) => (
  <Button
    type="primary"
    htmlType="submit"
    disabled={!isFormValid()}
    className={`w-full rounded-lg h-10 text-sm font-medium flex items-center justify-center bg-primary p-0 text-white transition ${
      isFormValid() ? 'hover:bg-opacity-90' : 'opacity-50 cursor-not-allowed'
    }`}
  >
    {t('create_account')}
  </Button>
);

export default SignUpButton;