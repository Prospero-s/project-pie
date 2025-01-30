import React from 'react';
import { Button } from 'antd';
import { GoogleOutlined, WindowsOutlined } from '@ant-design/icons';

const SignInButtons = ({ t, signInWithGoogle, signInWithMicrosoft, loading }) => (
  <div className="space-y-2">
    <Button
      onClick={signInWithGoogle}
      disabled={loading}
      icon={<GoogleOutlined className="text-lg" />}
      className="w-full h-10 flex items-center justify-center gap-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors text-sm font-medium"
    >
      {t('continue_with_google')}
    </Button>
    <Button
      onClick={signInWithMicrosoft}
      disabled={loading}
      icon={<WindowsOutlined className="text-lg" />}
      className="w-full h-10 flex items-center justify-center gap-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors text-sm font-medium"
    >
      {t('continue_with_microsoft')}
    </Button>
  </div>
);

export default SignInButtons;