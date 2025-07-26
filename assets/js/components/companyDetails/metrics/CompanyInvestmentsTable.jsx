import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  InputNumber,
  Select,
  message,
  Spin,
  Typography,
  Empty,
} from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import {
  fetchCompanyInvestments,
  updateInvestment,
} from '@/services/investment/investmentService';
import { getFundingTypeColor } from '@/lib/colors';
import { formatDate, getDateLocale } from '@/lib/utils';

const { Title } = Typography;
const { Option } = Select;

const CompanyInvestmentsTable = ({ companyId, i18n }) => {
  const { t } = useTranslation('investments', { i18n });
  const lng = i18n.language;
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadInvestments();
  }, [companyId]);

  const loadInvestments = async () => {
    try {
      setLoading(true);
      const data = await fetchCompanyInvestments(companyId);
      setInvestments(data);
      setPagination(prev => ({
        ...prev,
        total: data.length,
      }));
    } catch (error) {
      console.error('Erreur lors du chargement des investissements:', error);
      message.error(t('company_investments.error_loading'));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = investment => {
    setEditingInvestment(investment);
    form.setFieldsValue({
      amount: investment.amount,
      currency: investment.currency,
      fundingType: investment.fundingType,
    });
    setEditModalVisible(true);
  };

  const handleEditSubmit = async () => {
    try {
      const values = await form.validateFields();
      await updateInvestment(editingInvestment.id, values);
      message.success(t('company_investments.edit.success'));
      setEditModalVisible(false);
      setEditingInvestment(null);
      form.resetFields();
      loadInvestments(); // Recharger les données
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      message.error(t('company_investments.edit.error'));
    }
  };

  const handleEditCancel = () => {
    setEditModalVisible(false);
    setEditingInvestment(null);
    form.resetFields();
  };

  const currencies = ['EUR', 'USD', 'GBP', 'CHF', 'CAD', 'AUD'];

  const fundingTypes = ['seed', 'serieA', 'serieB', 'serieC', 'growth', 'ipo'];

  const columns = [
    {
      title: t('company_investments.table.amount'),
      dataIndex: 'amount',
      key: 'amount',
      render: (amount, record) => (
        <span className="font-medium">
          {Number(amount).toLocaleString()} {record.currency}
        </span>
      ),
    },
    {
      title: t('company_investments.table.funding_type'),
      dataIndex: 'fundingType',
      key: 'fundingType',
      render: fundingType => (
        <span
          className={`px-2 py-1 rounded text-white text-sm`}
          style={{ backgroundColor: getFundingTypeColor(fundingType) }}
        >
          {t(`funding.types.${fundingType}`) || fundingType}
        </span>
      ),
    },
    {
      title: t('company_investments.table.date'),
      dataIndex: 'investedAt',
      key: 'investedAt',
      render: date => formatDate(date, getDateLocale(lng)),
    },
    {
      title: t('company_investments.table.investor'),
      dataIndex: 'investor',
      key: 'investor',
      render: investor => (
        <div>
          <div className="font-medium">{investor.name}</div>
          <div className="text-sm text-gray-500">{investor.email}</div>
        </div>
      ),
    },
    {
      title: t('company_investments.table.actions'),
      key: 'actions',
      width: 80,
      render: (_, record) => (
        <Button
          type="link"
          icon={<EditOutlined />}
          onClick={() => handleEdit(record)}
          title={t('company_investments.edit.title')}
        />
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Spin size="large" />
        <span className="ml-2">{t('company_investments.loading')}</span>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-300 dark:border-gray-600">
      <div className="p-6 border-b border-slate-200 dark:border-gray-700">
        <Title level={4} className="!mb-0">
          {t('company_investments.title')}
        </Title>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {t('company_investments.list_title')}
        </p>
      </div>

      {investments.length === 0 ? (
        <div className="p-8 text-center">
          <Empty
            description={t('company_investments.no_investments.description')}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      ) : (
        <Table
          columns={columns}
          dataSource={investments}
          rowKey="id"
          pagination={pagination}
          className="!border-none"
          rowClassName={(record, index) =>
            index % 2 === 0
              ? 'bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700'
              : 'bg-slate-50 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-gray-600'
          }
        />
      )}

      <Modal
        title={t('company_investments.edit.title')}
        open={editModalVisible}
        onOk={handleEditSubmit}
        onCancel={handleEditCancel}
        okText={t('company_investments.edit.save')}
        cancelText={t('company_investments.edit.cancel')}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="amount"
            label={t('company_investments.edit.amount_label')}
            rules={[
              { required: true, message: t('funding.amount_required') },
              {
                type: 'number',
                min: 0,
                message: 'Le montant doit être positif',
              },
            ]}
          >
            <InputNumber
              placeholder="0"
              min={0}
              style={{ width: '100%' }}
              formatter={value =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
              }
              parser={value => value.replace(/\s/g, '')}
            />
          </Form.Item>

          <Form.Item
            name="currency"
            label={t('company_investments.edit.currency_label')}
            rules={[
              { required: true, message: t('funding.currency_required') },
            ]}
          >
            <Select placeholder={t('funding.currency')}>
              {currencies.map(currency => (
                <Option key={currency} value={currency}>
                  {currency}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="fundingType"
            label={t('funding.type')}
            rules={[{ required: true, message: t('funding.type_required') }]}
          >
            <Select placeholder={t('funding.select_type')}>
              {fundingTypes.map(type => (
                <Option key={type} value={type}>
                  {t(`funding.types.${type}`) || type}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CompanyInvestmentsTable;
