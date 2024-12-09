import React, { useState } from 'react';
import { Input } from 'antd';

const PasswordStrengthField = ({ label, value, onChange, placeholder, className }) => {
  const [passwordStrength, setPasswordStrength] = useState(0);

  const checkPasswordStrength = (pass) => {
    let strength = 0;
    const hasLowerCase = /[a-z]/.test(pass);
    const hasUpperCase = /[A-Z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    const hasSpecialChar = /[$@#&!+-."'{}[\]\\|?<>^%$!]/.test(pass);

    if (hasLowerCase) strength += 20;
    if (hasUpperCase) strength += 20;
    if (hasNumber) strength += 20;
    if (hasSpecialChar) strength += 20;
    if (pass.length >= 8) strength += 15;
    if (pass.length >= 12) strength += 5;

    setPasswordStrength(Math.min(strength, 100));
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    onChange(e);
    checkPasswordStrength(newPassword);
  };

  return (
    <div className="space-y-2">
      <label className="block font-medium text-black dark:text-white">{label}</label>
      <div className="relative">
        <Input.Password
          value={value}
          onChange={handlePasswordChange}
          placeholder={placeholder}
          className={className}
        />
      </div>
      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            passwordStrength >= 75 ? 'bg-green-500' : 'bg-yellow-500'
          }`}
          style={{ width: `${passwordStrength}%` }}
        ></div>
      </div>
      <p
        className={`text-sm ${
          passwordStrength < 75 ? 'text-yellow-600' : 'text-green-600'
        }`}
      >
        {passwordStrength < 75
          ? 'Le mot de passe doit contenir au moins 8 caractères.'
          : passwordStrength === 100
          ? 'Mot de passe fort'
          : 'Mot de passe moyen'}
      </p>
    </div>
  );
};

export default PasswordStrengthField;