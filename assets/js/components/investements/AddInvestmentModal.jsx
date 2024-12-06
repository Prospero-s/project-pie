import React, { useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Button, Form, Input, Modal } from 'antd';
import { useTranslation } from 'react-i18next';

const AddInvestmentModal = ({ i18n }) => {
  const { t } = useTranslation('investments', { i18n });
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => setIsModalVisible(true);
  const handleCancel = () => setIsModalVisible(false);
  
  const handleOk = () => {
    console.log('Startup ajoutée');
    setIsModalVisible(false);
  };

  return (
    <>
      <Button type="primary" icon={<PlusOutlined />} onClick={showModal}>
        {t('add_investment')}
      </Button>
      <Modal
        title={t('add_investment')}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText={t('add')}
        cancelText={t('cancel')}
      >
        <Form layout="vertical">
          <Form.Item
            label={t('company_name')}
            name="name"
            rules={[
              {
                required: true,
                message: t('please_enter_company_name'),
              },
            ]}
          >
            <Input placeholder={t('company_name_placeholder')} />
          </Form.Item>
          <Form.Item
            label={t('sector')}
            name="sector"
            rules={[{ required: true, message: t('please_enter_sector') }]}
          >
            <Input placeholder={t('sector_placeholder')} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default AddInvestmentModal;