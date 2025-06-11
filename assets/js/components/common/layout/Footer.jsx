import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { Layout } from 'antd';

const { Footer } = Layout;

const FooterLayout = ({ i18n, isDashboard }) => {
  const { t } = useTranslation('global', { i18n });
  const lng = useParams().lng;

  useEffect(() => {
    i18n.changeLanguage(lng);
  }, [lng, i18n]);

  return isDashboard ? (
    <Footer style={{ textAlign: 'center' }}>
      <span className="font-degarism text-sm text-gray-500">
        © 2024 - {new Date().getFullYear()} | {t('copyright')}
      </span>
    </Footer>
  ) : (
    <div className="px-8 py-6 lg:px-12">
      <span className="font-degarism text-sm text-gray-500">
        {' '}
        © 2024 - {new Date().getFullYear()} | {t('copyright')}
      </span>
    </div>
  );
};

export default FooterLayout;
