import React, { useEffect, useState } from 'react';
import { useUser } from '@/context/userContext';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import InvestmentGlobalChart from '@/components/dashboard/InvestmentGlobalChart';
import InvestmentGlobalFundingChart from '@/components/dashboard/InvestmentGlobalFundingChart';
import InvestmentGlobalSectorChart from '@/components/dashboard/InvestmentGlobalSectorChart';
import TableInvestments from '@/components/investments/TableInvestments';
import axios from 'axios';
import { Card, Spin, Statistic } from 'antd';
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  LoadingOutlined,
} from '@ant-design/icons';

const Dashboard = ({ i18n }) => {
  const { t } = useTranslation('dashboard', { i18n });
  const { user } = useUser();
  const lng = useParams().lng;
  const navigate = useNavigate();
  const [hasGroup, setHasGroup] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    totalInvestments: 0,
    companiesCount: 0,
    averageInvestment: 0,
    growthRate: 0,
  });

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

  useEffect(() => {
    const loadDashboardStats = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/api/dashboard/stats');
        setDashboardStats(response.data);
      } catch (error) {
        console.error('Erreur chargement stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadDashboardStats();
  }, []);

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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm">
          <Card className="border border-slate-300 w-full h-[120px]">
            <Statistic
              title={
                <span className="text-sm font-bold text-gray-900">
                  {t('stats.total_investments')}
                </span>
              }
              value={dashboardStats.totalInvestments}
              // prefix="€"
              suffix="€"
              valueStyle={{
                color: '#389e0d',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            />
          </Card>
        </div>
        <div className="bg-white rounded-lg shadow-sm">
          <Card className="border border-slate-300 w-full h-[120px]">
            <Statistic
              title={
                <span className="text-sm font-bold text-gray-900">
                  {t('stats.companies_count')}
                </span>
              }
              value={dashboardStats.companiesCount}
              valueStyle={{
                color: '#0958d9',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            />
          </Card>
        </div>
        <div className="bg-white rounded-lg shadow-sm">
          <Card className="border border-slate-300 w-full h-[120px]">
            <Statistic
              title={
                <span className="text-sm font-bold text-gray-900">
                  {t('stats.avg_investment')}
                </span>
              }
              value={dashboardStats.averageInvestment}
              // prefix="€"
              suffix="€"
              valueStyle={{
                color: '#531dab',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            />
          </Card>
        </div>
        <div className="bg-white rounded-lg shadow-sm">
          <Card className="border border-slate-300 w-full h-[120px]">
            <Statistic
              title={
                <span className="text-sm font-bold text-gray-900">
                  {t('stats.growth_rate')}
                </span>
              }
              value={dashboardStats.growthRate}
              suffix="%"
              valueStyle={{
                color: dashboardStats.growthRate > 0 ? '#3f8600' : '#cf1322',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              prefix={
                dashboardStats.growthRate > 0 ? (
                  <ArrowUpOutlined />
                ) : (
                  <ArrowDownOutlined />
                )
              }
            />
          </Card>
        </div>
      </div>

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
