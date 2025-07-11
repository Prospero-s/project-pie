import React, { useState, useEffect } from 'react';
import {
  Timeline,
  Card,
  Typography,
  Tag,
  Avatar,
  Pagination,
  Spin,
  Alert,
  Row,
  Col,
  Badge,
  Space,
} from 'antd';
import {
  DollarOutlined,
  FileTextOutlined,
  UserAddOutlined,
  CalendarOutlined,
  BankOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import Breadcrumb from '@/components/common/breadcrumb/Breadcrumb';
import axios from 'axios';
import { useUser } from '@/context/userContext';

const { Text } = Typography;

const EventLog = ({ i18n }) => {
  const { t } = useTranslation('eventLog', { i18n });
  const { user } = useUser();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEvents(1);
  }, []);

  const fetchEvents = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get('/api/event-log/events', {
        params: { page, limit: pagination.limit },
        headers: {
          'x-cognito-id': user?.id,
          'x-cognito-email': user?.email,
          'x-cognito-name': user?.user_metadata?.full_name,
        },
      });

      setEvents(response.data.events);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Erreur lors du chargement des événements:', error);
      setError(t('error.fetch_events'));
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = page => {
    fetchEvents(page);
  };

  const getEventIcon = type => {
    switch (type) {
      case 'investment_added':
        return <DollarOutlined style={{ color: '#52c41a' }} />;
      case 'investment_deleted':
        return <DollarOutlined style={{ color: '#ff4d4f' }} />;
      case 'document_added':
        return <FileTextOutlined style={{ color: '#1890ff' }} />;
      case 'document_deleted':
        return <FileTextOutlined style={{ color: '#ff4d4f' }} />;
      case 'member_added':
        return <UserAddOutlined style={{ color: '#722ed1' }} />;
      default:
        return <CalendarOutlined style={{ color: '#faad14' }} />;
    }
  };

  const getEventColor = type => {
    switch (type) {
      case 'investment_added':
        return 'green';
      case 'investment_deleted':
        return 'red';
      case 'document_added':
        return 'blue';
      case 'document_deleted':
        return 'red';
      case 'member_added':
        return 'purple';
      default:
        return 'orange';
    }
  };

  const formatAmount = (amount, currency) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency || 'EUR',
    }).format(amount);
  };

  const formatDate = timestamp => {
    return new Date(timestamp).toLocaleString(
      i18n.language === 'fr' ? 'fr-FR' : 'en-US',
      {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      },
    );
  };

  const renderEventDetails = event => {
    switch (event.type) {
      case 'investment_added':
        return (
          <Card size="small" className="mt-2">
            <Space direction="vertical" className="w-full">
              <div className="flex justify-between items-center">
                <Text strong>{event.details.company_name}</Text>
                <Tag color="green">
                  {formatAmount(event.details.amount, event.details.currency)}
                </Tag>
              </div>
              <div className="flex items-center gap-2">
                <BankOutlined className="text-gray-500" />
                <Text type="secondary">
                  {t(`funding_types.${event.details.funding_type}`)}
                </Text>
              </div>
            </Space>
          </Card>
        );

      case 'investment_deleted':
        return (
          <Card size="small" className="mt-2">
            <Space direction="vertical" className="w-full">
              <div className="flex justify-between items-center">
                <Text strong>{event.details.company_name}</Text>
                <Tag color="red">
                  {formatAmount(event.details.amount, event.details.currency)}
                </Tag>
              </div>
              <div className="flex items-center gap-2">
                <BankOutlined className="text-gray-500" />
                <Text type="secondary">
                  {t(`funding_types.${event.details.funding_type}`)}
                </Text>
              </div>
            </Space>
          </Card>
        );

      case 'document_added':
        return (
          <Card size="small" className="mt-2">
            <Space direction="vertical" className="w-full">
              <div className="flex justify-between items-center">
                <Text strong>{event.details.company_name}</Text>
                <Tag color="blue">{event.details.year}</Tag>
              </div>
              <div>
                <Text type="secondary">{event.details.filename}</Text>
              </div>
              <div>
                <Text type="secondary">
                  {t(`periodicity.${event.details.periodicity}`)}
                </Text>
              </div>
            </Space>
          </Card>
        );

      case 'document_deleted':
        return (
          <Card size="small" className="mt-2">
            <Space direction="vertical" className="w-full">
              <div className="flex justify-between items-center">
                <Text strong>{event.details.company_name}</Text>
                <Tag color="red">{event.details.year}</Tag>
              </div>
              <div>
                <Text type="secondary">{event.details.filename}</Text>
              </div>
              <div>
                <Text type="secondary">
                  {t(`periodicity.${event.details.periodicity}`)}
                </Text>
              </div>
            </Space>
          </Card>
        );

      case 'member_added':
        return (
          <Card size="small" className="mt-2">
            <Space direction="vertical" className="w-full">
              <div className="flex justify-between items-center">
                <Text strong>{event.details.user_email}</Text>
                <Tag color="purple">{t(`roles.${event.details.role}`)}</Tag>
              </div>
            </Space>
          </Card>
        );

      default:
        return null;
    }
  };

  if (loading && events.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <Breadcrumb pageName={t('title')} />
        <div className="flex justify-center items-center py-8">
          <Spin size="large" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Breadcrumb pageName={t('title')} />

      <Card>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <div className="flex justify-between items-center mb-4">
              <Badge count={pagination.total} overflowCount={999} />
            </div>

            <Text type="secondary" className="block mb-6">
              {t('description')}
            </Text>

            {error && (
              <Alert
                message={t('error.title')}
                description={error}
                type="error"
                className="mb-4"
                showIcon
              />
            )}

            {events.length === 0 ? (
              <div className="text-center py-8">
                <Text type="secondary">{t('no_events')}</Text>
              </div>
            ) : (
              <>
                <Timeline
                  items={events.map(event => ({
                    dot: (
                      <Avatar
                        size="small"
                        icon={getEventIcon(event.type)}
                        style={{
                          backgroundColor: '#f0f0f0',
                          border: `2px solid var(--ant-color-${getEventColor(event.type)})`,
                        }}
                      />
                    ),
                    color: getEventColor(event.type),
                    children: (
                      <div className="pb-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <Text strong className="text-base">
                              {t(`event_types.${event.type}`)}
                            </Text>
                            <br />
                            <Text type="secondary" className="text-sm">
                              {t('by')} {event.user} •{' '}
                              {formatDate(event.timestamp)}
                            </Text>
                          </div>
                        </div>
                        {renderEventDetails(event)}
                      </div>
                    ),
                  }))}
                />

                {pagination.totalPages > 1 && (
                  <div className="flex justify-center mt-6">
                    <Pagination
                      current={pagination.page}
                      total={pagination.total}
                      pageSize={pagination.limit}
                      onChange={handlePageChange}
                      showSizeChanger={false}
                      showQuickJumper
                      showTotal={(total, range) =>
                        t('pagination.showing', {
                          start: range[0],
                          end: range[1],
                          total,
                        })
                      }
                    />
                  </div>
                )}
              </>
            )}
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default EventLog;
