import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

const Dashboard = ({ i18n }) => {
  const { t } = useTranslation('dashboard', { i18n });
  const lng = useParams().lng;

  useEffect(() => {
    i18n.changeLanguage(lng);
  }, [lng, i18n]);
  
  return <div>dashboard</div>;
}

export default Dashboard;