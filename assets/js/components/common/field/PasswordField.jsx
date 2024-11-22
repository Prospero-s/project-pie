import React from 'react';
import { Input } from 'antd';

const PasswordField = ({ label, value, onChange, placeholder, className }) => (
  <div className="space-y-2">
    <label className="block font-medium text-black dark:text-white">{label}</label>
    <div className="relative">
      <Input.Password
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={className}
      />
    </div>
  </div>
);

export default PasswordField;
