import React, { useEffect } from "react";
import { useUser } from '@/context/userContext';
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import InvestmentGlobalChart from "@/components/dashboard/InvestmentGlobalChart";
import InvestmentFundingChart from "@/components/dashboard/InvestmentFundingChart";
import InvestmentSectorChart from "@/components/dashboard/InvestmentSectorChart";
import TableInvestments from "@/components/investments/TableInvestments";


const Dashboard = ({ i18n }) => {
  const { t } = useTranslation('dashboard', { i18n });
  const { user } = useUser();
  const lng = useParams().lng;

  useEffect(() => {
    i18n.changeLanguage(lng);
  }, [lng, i18n]);
  
  return (
    <>
      <h2 class="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">{t('message_start')}, {user.user_metadata.full_name ?? user.email}</h2>
      <p class="mt-4 mb-8 text-gray-500">{t('message_description')}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm">
          <InvestmentGlobalChart />
        </div>
        <div className="bg-white rounded-lg shadow-sm">
          <InvestmentFundingChart />
        </div>
        <div className="bg-white rounded-lg shadow-sm">
          <InvestmentSectorChart />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <TableInvestments i18n={i18n} />
      </div>
    </>
  );
}

export default Dashboard;