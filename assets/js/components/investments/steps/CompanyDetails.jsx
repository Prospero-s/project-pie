import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Descriptions, Typography, Table, Tag } from 'antd';
import { TeamOutlined, HomeOutlined, ClockCircleOutlined } from '@ant-design/icons';
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
      render: (text) => <Text strong className="text-navy">{text}</Text>
    },
    {
      title: t('company_details.company.details.representatives.role'),
      dataIndex: 'qualite',
      key: 'qualite',
      render: (text) => <Tag color="blue-primary" className="bg-blue-primary text-blue-dark border-blue-primary">{text}</Tag>
    }
  ];

  return (
    <div className="space-y-6">
      <Card loading={loading} className="shadow-lg rounded-lg border-gray-light">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div className="flex-grow">
            <Title level={3} className="!mb-2 text-dark">{company.denomination}</Title>
            <Text className="text-lg text-navy">{company.businessStructures}</Text>
          </div>
          <div className="flex items-center space-x-2 text-sm bg-gray-50 px-3 py-1.5 rounded-full">
            <ClockCircleOutlined className="text-blue-primary" />
            <Text className="text-gray-600">{t('company_details.company.details.last_update')}: {company.updatedAt}</Text>
          </div>
        </div>

        <Descriptions column={{ xs: 1, sm: 2, md: 2 }} bordered className="bg-white">
          <Descriptions.Item 
            label={
              <span className="text-blue-light">
                {t('company_details.company.details.siren')}
              </span>
            }
            span={1}
          >
            <Text className="text-navy">{company.siren}</Text>
          </Descriptions.Item>

            {company.siret && (
            <Descriptions.Item 
              label={
                <div className="text-blue-light">
                  <span>{t('company_details.company.details.siret')}</span>
                  <span className="ml-2 text-xs text-blue-light/70">{t('company_details.company.details.headquarters')}</span>
                </div>
              }
              span={1}
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
              span={2}
            >
              <div>
                <Text className="text-navy">{company.codeApe}</Text>
                {company.activiteApe && (
                  <Text className="ml-2">- {company.activiteApe}</Text>
                )}
              </div>
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card 
          title={
            <div className="flex items-center space-x-2 text-navy">
              <HomeOutlined className="text-blue-primary" />
              <span>{t('company_details.company.details.address.title')}</span>
            </div>
          }
          loading={loading}
          className="shadow-lg rounded-lg border-gray-light h-full"
        >
          <div className="relative min-h-[300px]">
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
              <div className="flex items-center space-x-2 text-navy">
                <TeamOutlined className="text-blue-primary" />
                <span>{t('company_details.company.details.representatives.title')}</span>
              </div>
            }
            loading={loading}
            className="shadow-lg rounded-lg border-gray-light"
          >
            <Table
              dataSource={company.representants}
              columns={representantsColumns}
              pagination={false}
              rowKey={(record) => record.nom}
              className="w-full"
            />
          </Card>
        )}
      </div>
    </div>
  );
};

export default CompanyDetails; 