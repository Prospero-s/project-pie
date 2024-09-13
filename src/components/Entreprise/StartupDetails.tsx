import { ApexOptions } from 'apexcharts';
import React from 'react';
import ReactApexChart from 'react-apexcharts';

import { useTranslation } from '@/app/i18n/client';
import Breadcrumb from '@/components/common/Breadcrumbs/Breadcrumb';
interface GrowthData {
  funding: number[];
  revenue: number[];
}

interface Startup {
  name: string;
  ceo: string;
  email: string;
  sector: string;
  marketPositioning: string;
  SIREN: string;
  SIRET: string;
  legalStatus: string;
  creationDate: string;
  shareCapital: number;
  size: number;
  growthData: GrowthData;
}

interface StartupDetailsProps {
  startup: Startup;
  lng: string;
}

const StartupDetails: React.FC<StartupDetailsProps> = ({ startup, lng }) => {
  const { t } = useTranslation(lng, 'company-details');
  const getMarketPositioningIcon = (position: string) => {
    if (position === 'up') {
      return <span style={{ color: 'green' }}>▲</span>;
    } else if (position === 'down') {
      return <span style={{ color: 'red' }}>▼</span>;
    } else {
      return <span style={{ color: 'gray' }}>▶</span>;
    }
  };

  const chartOptions: ApexOptions = {
    chart: {
      type: 'line',
      stacked: false,
      toolbar: {
        show: false,
      },
    },
    colors: ['#00E396', '#008FFB'],
    stroke: {
      width: [2, 2],
    },
    title: {
      text: 'Aperçu Financier',
      align: 'left',
    },
    xaxis: {
      categories: [
        'Jan',
        'Fév',
        'Mar',
        'Avr',
        'Mai',
        'Juin',
        'Juil',
        'Août',
        'Sept',
        'Oct',
        'Nov',
        'Déc',
      ],
    },
    yaxis: [
      {
        title: {
          text: 'Financement (€)',
        },
      },
      {
        opposite: true,
        title: {
          text: 'Revenus (€)',
        },
      },
    ],
    tooltip: {
      shared: true,
      intersect: false,
    },
    legend: {
      horizontalAlign: 'left',
    },
  };

  const chartSeries = [
    {
      name: 'Financement',
      type: 'area',
      data: startup.growthData.funding,
    },
    {
      name: 'Revenus',
      type: 'bar',
      data: startup.growthData.revenue,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <Breadcrumb pageName={t('entreprises.startup_details')} />
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {startup.name}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {t('startup_details_description')}
            </p>
          </div>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="py-2">
                <dt className="text-sm font-medium text-gray-500">
                  {t('ceo')}
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{startup.ceo}</dd>
              </div>
              <div className="py-2">
                <dt className="text-sm font-medium text-gray-500">
                  {t('email')}
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{startup.email}</dd>
              </div>
              <div className="py-2">
                <dt className="text-sm font-medium text-gray-500">
                  {t('sector')}
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{startup.sector}</dd>
              </div>
              <div className="py-2">
                <dt className="text-sm font-medium text-gray-500">
                  {t('market_positioning')}
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {getMarketPositioningIcon(startup.marketPositioning)}
                </dd>
              </div>
              <div className="py-2">
                <dt className="text-sm font-medium text-gray-500">
                  {t('siren')}
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{startup.SIREN}</dd>
              </div>
            </div>
            <div>
              <div className="py-2">
                <dt className="text-sm font-medium text-gray-500">
                  {t('siret')}
                </dt>
                <dd className="mt-1 text-sm text-gray-900">{startup.SIRET}</dd>
              </div>
              <div className="py-2">
                <dt className="text-sm font-medium text-gray-500">
                  {t('legal_status')}
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {startup.legalStatus}
                </dd>
              </div>
              <div className="py-2">
                <dt className="text-sm font-medium text-gray-500">
                  {t('creation_date')}
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {startup.creationDate}
                </dd>
              </div>
              <div className="py-2">
                <dt className="text-sm font-medium text-gray-500">
                  {t('share_capital')}
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {startup.shareCapital.toLocaleString()} €
                </dd>
              </div>
              <div className="py-2">
                <dt className="text-sm font-medium text-gray-500">
                  {t('size')}
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {startup.size} employés
                </dd>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <ReactApexChart
          options={chartOptions}
          series={chartSeries}
          type="line"
          height={350}
        />
      </div>
    </div>
  );
};

export default StartupDetails;
