'use client';

import { Spin } from 'antd';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

import { useTranslation } from '@/app/i18n/client';
import ActivitiesCard from '@/components/SearchCompany/ActivitiesCard';
import BeneficiariesCard from '@/components/SearchCompany/BeneficiariesCard';
import CompanyInfoCard from '@/components/SearchCompany/CompanyInfoCard';
import FinancesCard from '@/components/SearchCompany/FinancesCard';
import useCompanyDetails from '@/hooks/useCompanyDetails';

const ClientSearchCompany = ({ lng }: { lng: string }) => {
  const { t } = useTranslation(lng, 'search-company');
  const searchParams = useSearchParams();
  const siren = searchParams.get('siren') || '';
  const { company, loading, percent, error } = useCompanyDetails(siren);

  useEffect(() => {
    if (error) {
      return;
    }
  }, [error]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Spin size="large" style={{ fontSize: '32px' }} />
          <div className="mt-4 text-2xl">
            {t('search_in_progress')} {percent}%
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      {company && (
        <>
          <CompanyInfoCard company={company} siren={siren} lng={lng} />
          <ActivitiesCard activities={company.activites} lng={lng} />
          {company.beneficiairesEffectifs.length > 0 && (
            <BeneficiariesCard
              beneficiaries={company.beneficiairesEffectifs}
              lng={lng}
            />
          )}
          <FinancesCard
            capital={company.montantCapital}
            currency={company.deviseCapital}
            lng={lng}
          />
        </>
      )}
    </div>
  );
};

export default ClientSearchCompany;
