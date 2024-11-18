'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { useTranslation } from '@/app/i18n/client';
import startupsMock from '@/mocks/startupsMock';
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { Button, Skeleton, Table, Tooltip } from 'antd';
import Image from 'next/image';

const TableInvestissement = ({ lng }: { lng: string }) => {
  const { t } = useTranslation(lng, 'entreprises');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const columns = [
    {
      title: '',
      dataIndex: 'logo',
      key: 'logo',
      width: 80,
      render: (logo: string, record: any) =>
        loading ? (
          <Skeleton.Avatar active shape="circle" />
        ) : (
          <Image
            src={logo}
            alt={record.name}
            width={40}
            height={40}
            className="rounded-full"
          />
        ),
    },
    {
      title: t('startup_name'),
      dataIndex: 'name',
      key: 'name',
      render: (text: string) =>
        loading ? <Skeleton.Input block active size="small" /> : text,
    },
    {
      title: t('sector'),
      dataIndex: 'sector',
      key: 'sector',
      render: (text: string) =>
        loading ? <Skeleton.Input block active size="small" /> : text,
    },
    {
      title: t('description'),
      dataIndex: 'description',
      key: 'description',
      width: 400,
      ellipsis: {
        showTitle: false,
      },
      render: (text: string) =>
        loading ? (
          <Skeleton.Input block active size="small" />
        ) : (
          <Tooltip placement="topLeft" title={text}>
            {text}
          </Tooltip>
        ),
    },
    {
      title: t('funding_type'),
      dataIndex: 'fundingType',
      key: 'fundingType',
      render: (text: string) =>
        loading ? <Skeleton.Input block active size="small" /> : text,
    },
    {
      title: t('amount_raised'),
      dataIndex: 'amountRaised',
      key: 'amountRaised',
      render: (amount: number) =>
        loading ? (
          <Skeleton.Input block active size="small" />
        ) : (
          `${amount.toLocaleString()} €`
        ),
    },
    {
      title: t('actions'),
      key: 'actions',
      width: 100,
      render: (text: string, record: any) =>
        loading ? (
          <Skeleton.Button active size="small" />
        ) : (
          <div className="flex items-center gap-4">
            <Link
              href={`/user/table-investement/${record.id}`}
              className="text-blue-500 hover:text-blue-700 text-lg"
            >
              <EyeOutlined />
            </Link>
            <DeleteOutlined className="!text-rose-500 hover:!text-rose-700 text-lg" />
          </div>
        ),
    },
  ];

  const dataSource = startupsMock.map((startup, index) => ({
    key: index,
    ...startup,
  }));

  return (
    <div className="rounded-lg border border-slate-200 flex flex-col w-full">
      <div className="overflow-x-auto">
        <Table
          columns={columns}
          dataSource={loading ? Array(5).fill({}) : dataSource}
          pagination={false}
          rowClassName={(record, index) =>
            index % 2 === 0 ? '!bg-white' : '!bg-slate-50'
          }
          size="small"
        />
      </div>
      <div className="flex justify-between items-center p-4 bg-white rounded-b-lg w-full">
        <div className="flex items-center gap-2">
          <Button>Précedent</Button>
          <Button>Suivant</Button>
        </div>
        <div className="flex items-center gap-2">Page 1 sur 10</div>
      </div>
    </div>
  );
};

export default TableInvestissement;
