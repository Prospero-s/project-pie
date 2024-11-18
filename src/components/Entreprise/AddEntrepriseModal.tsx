import { PlusOutlined } from '@ant-design/icons';
import { Button, Form, Input, Modal } from 'antd';
import { useState } from 'react';
const AddEntrepriseModal = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    // Logique pour ajouter une startup
    console.log('Startup ajoutée');
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <>
      <Button type="primary" icon={<PlusOutlined />} onClick={showModal}>
        Ajouter une entreprise
      </Button>
      <Modal
        title="Ajouter une nouvelle entreprise"
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Ajouter"
        cancelText="Annuler"
      >
        <Form layout="vertical">
          <Form.Item
            label="Nom de l'entreprise"
            name="name"
            rules={[
              {
                required: true,
                message: "Veuillez entrer le nom de l'entreprise",
              },
            ]}
          >
            <Input placeholder="Nom de l'entreprise" />
          </Form.Item>
          <Form.Item
            label="Secteur"
            name="sector"
            rules={[{ required: true, message: 'Veuillez entrer le secteur' }]}
          >
            <Input placeholder="Secteur" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default AddEntrepriseModal;
