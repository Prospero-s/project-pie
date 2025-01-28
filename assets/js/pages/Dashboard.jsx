import React, { useEffect } from "react";
import { useUser } from '@/context/userContext';
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

const Dashboard = ({ i18n }) => {
  const { t } = useTranslation('dashboard', { i18n });
  const { user } = useUser();
  const lng = useParams().lng;

  useEffect(() => {
    i18n.changeLanguage(lng);
  }, [lng, i18n]);
  
  return (
    <div>
      <h2 class="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{t('message_start')}, {user.user_metadata.full_name ?? user.email}</h2>
      <p class="mt-4 text-gray-500">{t('message_description')}</p>
    </div>
  );
}

export default Dashboard;