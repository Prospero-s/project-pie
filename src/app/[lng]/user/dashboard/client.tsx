'use client';

import {
  DollarOutlined,
  RiseOutlined,
  ShopOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import dynamic from 'next/dynamic';

import { useTranslation } from '@/app/i18n/client';
import CardDataStats from '@/components/Dashboard/CardDataStats';
import ChartOne from '@/components/Dashboard/ChartOne';
import ChartThree from '@/components/Dashboard/ChartThree';
import ChartTwo from '@/components/Dashboard/ChartTwo';

export default function ClientDashboard({ lng }: { lng: string }) {
  const MapOne = dynamic(() => import('@/components/Dashboard/MapOne'), {
    ssr: false,
  });
  const { t } = useTranslation(lng, 'dashboard');

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
        <CardDataStats
          title={t('total_companies')}
          total="12"
          rate="5%"
          levelUp
        >
          <div className="flex items-center justify-center text-2xl text-primary rounded-full w-12 h-12 bg-gray-200">
            <ShopOutlined className="text-2xl text-primary text-green-400" />
          </div>
        </CardDataStats>
        <CardDataStats
          title={t('total_investments')}
          total="8.7M€"
          rate="3.5%"
          levelUp
        >
          <div className="flex items-center justify-center text-2xl text-primary rounded-full w-12 h-12 bg-gray-200">
            <DollarOutlined className="text-2xl text-primary text-green-400" />
          </div>
        </CardDataStats>
        <CardDataStats
          title={t('average_growth')}
          total="7.8%"
          rate="1.4%"
          levelUp
        >
          <div className="flex items-center justify-center text-2xl text-primary rounded-full w-12 h-12 bg-gray-200">
            <RiseOutlined className="text-2xl text-primary text-green-400" />
          </div>
        </CardDataStats>
        <CardDataStats
          title={t('interactions')}
          total="1.234"
          rate="0.95%"
          levelDown
        >
          <div className="flex items-center justify-center text-2xl text-primary rounded-full w-12 h-12 bg-gray-200">
            <TeamOutlined className="text-2xl text-primary text-green-400" />
          </div>
        </CardDataStats>
      </div>

      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
        <div className="col-span-12 xl:col-span-6">
          <ChartOne />
        </div>
        <div className="col-span-12 xl:col-span-6">
          <ChartTwo />
        </div>
        <div className="col-span-12 xl:col-span-6">
          <ChartThree />
        </div>
        <div className="col-span-12 xl:col-span-6">
          <MapOne lng={lng} />
        </div>
      </div>
    </>
  );
}
