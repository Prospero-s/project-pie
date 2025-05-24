import React from 'react';
import { Button } from 'antd';

const SignUpButton = ({ t, isFormValid, loading }) => (
  <Button
    type="primary"
    htmlType="submit"
    disabled={!isFormValid() || loading}
    loading={loading}
    className={`w-full rounded-lg h-10 text-sm font-medium flex items-center justify-center bg-primary p-0 text-white transition ${
      isFormValid() && !loading
        ? 'hover:bg-opacity-90'
        : 'opacity-50 cursor-not-allowed'
    }`}
  >
    {t('create_account')}
  </Button>
);

export default SignUpButton;
