import React from 'react';
import { Input } from 'antd';

const PasswordField = ({ label, value, onChange, placeholder, className }) => (
  <div className="space-y-3 sm:space-y-2">
    <label className="block font-medium text-base text-black">
      {label}
    </label>
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
