import React from 'react';
import { Button } from 'antd';
import { GoogleOutlined, WindowsOutlined } from '@ant-design/icons';

const SignInButtons = ({ t, signInWithGoogle, signInWithMicrosoft, loading }) => (
  <div className="flex justify-between gap-4">
    <Button
      icon={<GoogleOutlined />}
      disabled={loading}
      className="flex-1 h-12 flex items-center justify-center bg-rose-600 hover:!bg-white hover:!border-rose-600 hover:!text-rose-600 border-rose-600 text-white"
      onClick={signInWithGoogle}
    >
      Google
    </Button>
    <Button
      icon={<WindowsOutlined />}
      disabled={loading}
      className="flex-1 h-12 flex items-center justify-center bg-blue-500 hover:!bg-white hover:!border-blue-500 hover:!text-blue-500 border-blue-500 text-white"
      onClick={signInWithMicrosoft}
    >
      Microsoft
    </Button>
  </div>
);

export default SignInButtons;