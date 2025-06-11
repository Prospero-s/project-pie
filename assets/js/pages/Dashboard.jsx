import React, { useEffect, useState } from 'react';
import { useUser } from '@/context/userContext';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import InvestmentGlobalChart from '@/components/dashboard/InvestmentGlobalChart';
import InvestmentGlobalFundingChart from '@/components/dashboard/InvestmentGlobalFundingChart';
import InvestmentGlobalSectorChart from '@/components/dashboard/InvestmentGlobalSectorChart';
import TableInvestments from '@/components/investments/TableInvestments';
import axios from 'axios';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const Dashboard = ({ i18n }) => {
  const { t } = useTranslation('dashboard', { i18n });
  const { user } = useUser();
  const lng = useParams().lng;
  const navigate = useNavigate();
  const [hasGroup, setHasGroup] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    i18n.changeLanguage(lng);
  }, [lng, i18n]);

  // Vérifier si l'utilisateur a un groupe avant de charger les composants
  useEffect(() => {
    const checkUserGroup = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/api/user-groups');
        const userHasGroup =
          response.data.groups && response.data.groups.length > 0;

        setHasGroup(userHasGroup);

        if (!userHasGroup) {
          // Rediriger vers la sélection de groupe si l'utilisateur n'en a pas
          navigate(`/${lng}/group-selection`, { replace: true });
        }
      } catch (error) {
        console.error('Erreur lors de la vérification des groupes', error);
        setHasGroup(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserGroup();
  }, [lng, navigate]);

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Spin indicator={<LoadingOutlined style={{ fontSize: 36 }} spin />} />
      </div>
    );
  }

  // Ne pas rendre les composants si l'utilisateur n'a pas de groupe
  if (!hasGroup) {
    return null;
  }

  return (
    <>
      <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
        {t('message_start')}, {user.user_metadata.full_name ?? user.email}
      </h2>
      <p className="font-degarism text-base mt-4 mb-8 text-gray-500">
        {t('message_description')}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm">
          <InvestmentGlobalChart />
        </div>
        <div className="bg-white rounded-lg shadow-sm">
          <InvestmentGlobalFundingChart />
        </div>
        <div className="bg-white rounded-lg shadow-sm">
          <InvestmentGlobalSectorChart />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <TableInvestments
          i18n={i18n}
          onAddClick={() => navigate(`/${lng}/investments?modal=add`)}
        />
      </div>
    </>
  );
};

export default Dashboard;
