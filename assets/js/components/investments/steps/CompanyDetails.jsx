import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Descriptions, Typography, Table, Tag } from 'antd';
import {
  TeamOutlined,
  HomeOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import CompanyMap from './CompanyMap';

const { Title, Text } = Typography;

const CompanyDetails = ({ company, loading = false }) => {
  const { t } = useTranslation('investments');

  if (!company) return null;

  const representantsColumns = [
    {
      title: t('company_details.company.details.representatives.name'),
      dataIndex: 'nom',
      key: 'nom',
      render: text => (
        <Text strong className="text-navy break-words">
          {text}
        </Text>
      ),
      ellipsis: true,
    },
    {
      title: t('company_details.company.details.representatives.role'),
      dataIndex: 'qualite',
      key: 'qualite',
      render: text => (
        <Tag
          color="blue-primary"
          className="bg-blue-primary text-blue-dark border-blue-primary text-xs sm:text-sm whitespace-normal break-words"
          style={{
            padding: '2px 4px',
            maxWidth: '100%',
            display: 'inline-block',
          }}
        >
          {text}
        </Tag>
      ),
      responsive: ['sm'],
    },
    {
      title: t('company_details.company.details.representatives.role'),
      dataIndex: 'qualite',
      key: 'qualite-mobile',
      render: text => (
        <Tag
          color="blue-primary"
          className="bg-blue-primary text-blue-dark border-blue-primary text-xs whitespace-normal break-words"
          style={{
            padding: '2px 4px',
            maxWidth: '100%',
            display: 'inline-block',
          }}
        >
          {text?.length > 15 ? `${text.substring(0, 15)}...` : text}
        </Tag>
      ),
      responsive: ['xs'],
    },
  ];

  return (
    <div className="space-y-6">
      <Card
        loading={loading}
        className="shadow-lg rounded-lg border-gray-light"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div className="flex-grow">
            <Title
              level={3}
              className="!mb-2 text-dark text-lg sm:text-xl md:text-2xl"
            >
              {company.denomination}
            </Title>
            <Text className="text-sm md:text-lg text-navy">
              {company.businessStructures}
            </Text>
          </div>
          <div className="flex items-center space-x-2 text-xs sm:text-sm bg-gray-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full mt-2 md:mt-0">
            <ClockCircleOutlined className="text-blue-primary" />
            <Text className="text-gray-600">
              {t('company_details.company.details.last_update')}:{' '}
              {company.updatedAt}
            </Text>
          </div>
        </div>

        <Descriptions
          column={{ xs: 1, sm: 2, md: 2 }}
          bordered
          className="bg-white"
          size="small"
          styles={{
            label: { whiteSpace: 'normal', wordBreak: 'break-word' },
            content: { whiteSpace: 'normal', wordBreak: 'break-word' },
          }}
        >
          <Descriptions.Item
            label={
              <span className="text-blue-light">
                {t('company_details.company.details.siren')}
              </span>
            }
          >
            <Text className="text-navy">{company.siren}</Text>
          </Descriptions.Item>

          {company.siret && (
            <Descriptions.Item
              label={
                <div className="text-blue-light">
                  <span>{t('company_details.company.details.siret')}</span>
                  <span className="ml-2 text-xs text-blue-light/70 hidden sm:inline">
                    {t('company_details.company.details.headquarters')}
                  </span>
                </div>
              }
            >
              <Text className="text-navy">{company.siret}</Text>
            </Descriptions.Item>
          )}

          {company.codeApe && (
            <Descriptions.Item
              label={
                <span className="text-blue-light">
                  {t('company_details.company.details.ape.code')}
                </span>
              }
            >
              <div>
                <Text className="text-navy">{company.codeApe}</Text>
                {company.activiteApe && (
                  <Text className="ml-2 block sm:inline text-xs sm:text-sm">
                    - {company.activiteApe}
                  </Text>
                )}
              </div>
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card
          title={
            <div className="flex items-center space-x-2 text-navy text-sm sm:text-base">
              <HomeOutlined className="text-blue-primary" />
              <span>{t('company_details.company.details.address.title')}</span>
            </div>
          }
          loading={loading}
          className="shadow-lg rounded-lg border-gray-light h-full"
          styles={{
            body: { padding: '12px 16px' },
          }}
        >
          <div className="relative min-h-[200px] sm:min-h-[300px]">
            {loading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 rounded-lg">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
                <Text className="text-gray-600">
                  {t('company_details.loading.map')}
                </Text>
              </div>
            ) : (
              <div className="h-full">
                <CompanyMap address={company.adresse} />
              </div>
            )}
          </div>
        </Card>

        {company.representants?.length > 0 && (
          <Card
            title={
              <div className="flex items-center space-x-2 text-navy text-sm sm:text-base">
                <TeamOutlined className="text-blue-primary" />
                <span>
                  {t('company_details.company.details.representatives.title')}
                </span>
              </div>
            }
            loading={loading}
            className="shadow-lg rounded-lg border-gray-light"
            styles={{
              body: { padding: '8px', overflowX: 'auto' },
            }}
          >
            <Table
              dataSource={company.representants}
              columns={representantsColumns}
              pagination={false}
              rowKey={record => record.nom}
              className="w-full"
              size="small"
              scroll={{ x: 'max-content' }}
            />
          </Card>
        )}
      </div>
    </div>
  );
};

export default CompanyDetails;
