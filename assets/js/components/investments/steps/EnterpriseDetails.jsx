import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Descriptions, Typography, Table, Tag } from 'antd';
import { TeamOutlined, HomeOutlined, ClockCircleOutlined } from '@ant-design/icons';
import EnterpriseMap from './EnterpriseMap';

const { Title, Text } = Typography;

const EnterpriseDetails = ({ enterprise, loading = false }) => {
  const { t } = useTranslation('investments');

  if (!enterprise) return null;

  const representantsColumns = [
    {
      title: t('enterprise_details.enterprise.details.representatives.name'),
      dataIndex: 'nom',
      key: 'nom',
      render: (text) => <Text strong className="text-navy">{text}</Text>
    },
    {
      title: t('enterprise_details.enterprise.details.representatives.role'),
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
            <Title level={3} className="!mb-2 text-dark">{enterprise.denomination}</Title>
            <Text className="text-lg text-navy">{enterprise.formeJuridique}</Text>
          </div>
          <div className="flex items-center space-x-2 text-sm bg-gray-50 px-3 py-1.5 rounded-full">
            <ClockCircleOutlined className="text-blue-primary" />
            <Text className="text-gray-600">{t('enterprise_details.enterprise.details.last_update')}: {enterprise.updatedAt}</Text>
          </div>
        </div>

        <Descriptions column={{ xs: 1, sm: 2, md: 2 }} bordered className="bg-white">
          <Descriptions.Item 
            label={
              <span className="text-blue-light">
                {t('enterprise_details.enterprise.details.siren')}
              </span>
            }
            span={1}
          >
            <Text className="text-navy">{enterprise.siren}</Text>
          </Descriptions.Item>

            {enterprise.siret && (
            <Descriptions.Item 
              label={
                <div className="text-blue-light">
                  <span>{t('enterprise_details.enterprise.details.siret')}</span>
                  <span className="ml-2 text-xs text-blue-light/70">{t('enterprise_details.enterprise.details.headquarters')}</span>
                </div>
              }
              span={1}
            >
              <Text className="text-navy">{enterprise.siret}</Text>
            </Descriptions.Item>
          )}

          {enterprise.codeApe && (
            <Descriptions.Item 
              label={
                <span className="text-blue-light">
                  {t('enterprise_details.enterprise.details.ape.code')}
                </span>
              }
              span={2}
            >
              <div>
                <Text className="text-navy">{enterprise.codeApe}</Text>
                {enterprise.activiteApe && (
                  <Text className="ml-2">- {enterprise.activiteApe}</Text>
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
              <span>{t('enterprise_details.enterprise.details.address.title')}</span>
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
                  {t('enterprise_details.loading.map')}
                </Text>
              </div>
            ) : (
              <div className="h-full">
                <EnterpriseMap address={enterprise.adresse} />
              </div>
            )}
          </div>
        </Card>

        {enterprise.representants?.length > 0 && (
          <Card
            title={
              <div className="flex items-center space-x-2 text-navy">
                <TeamOutlined className="text-blue-primary" />
                <span>{t('enterprise_details.enterprise.details.representatives.title')}</span>
              </div>
            }
            loading={loading}
            className="shadow-lg rounded-lg border-gray-light"
          >
            <Table
              dataSource={enterprise.representants}
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

export default EnterpriseDetails; 