'use client';

import dynamic from 'next/dynamic';

import { useTranslation } from '@/app/i18n/client';
import { SearchCompany } from '@/types/search-company';
import { toCamelCase, toLowerCase } from '@/utils/textUtils';

const DynamicSearchCompanyMap = dynamic(() => import('./SearchCompanyMap'), {
  ssr: false,
});

const CompanyInfoCard = ({
  company,
  siren,
  lng,
}: {
  company: SearchCompany;
  siren: string;
  lng: string;
}) => {
  const { t } = useTranslation(lng, 'search-company');
  const address = `${company.adresse.numVoie} ${toLowerCase(company.adresse.typeVoie)} ${toLowerCase(company.adresse.voie)}, ${company.adresse.codePostal} ${toCamelCase(company.adresse.commune)}, ${toCamelCase(company.adresse.pays)}`;

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          {t('company_details')}
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          {t('company_details_description')}
        </p>
      </div>
      <div className="border-t border-gray-200 sm:grid sm:grid-cols-2 sm:gap-4">
        <div>
          <dl>
            {company.denomination && (
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  {t('denomination')}
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {company.denomination}
                </dd>
              </div>
            )}
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                {t('siren')}
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {siren}
              </dd>
            </div>
            {company.siret && (
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  {t('siret')}
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {company.siret}
                </dd>
              </div>
            )}
            {company.nombreBeneficiairesEffectifsActifs !== undefined && (
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  {t('number_of_beneficiaries')}
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {company.nombreBeneficiairesEffectifsActifs}
                </dd>
              </div>
            )}
            {company.societeEtrangere !== undefined && (
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  {t('foreign_company')}
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {company.societeEtrangere ? 'Oui' : 'Non'}
                </dd>
              </div>
            )}
            {company.etablieEnFrance !== undefined && (
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  {t('established_in_france')}
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {company.etablieEnFrance ? 'Oui' : 'Non'}
                </dd>
              </div>
            )}
            {company.formeJuridique && (
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  {t('legal_form')}
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {company.formeJuridique}
                </dd>
              </div>
            )}
            {company.formeExerciceActivitePrincipale && (
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  {t('exercise_form')}
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {toCamelCase(company.formeExerciceActivitePrincipale)}
                </dd>
              </div>
            )}
            {company.adresse && (
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">
                  {t('address')}
                </dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {company.adresse.numVoie}{' '}
                  {toLowerCase(company.adresse.typeVoie)}{' '}
                  {toLowerCase(company.adresse.voie)},{' '}
                  {company.adresse.codePostal}{' '}
                  {toCamelCase(company.adresse.commune)},{' '}
                  {toCamelCase(company.adresse.pays)}
                </dd>
              </div>
            )}
          </dl>
        </div>
        <div className="p-4 sm:col-span-2 lg:col-span-1">
          <DynamicSearchCompanyMap address={address} lng={lng} />
        </div>
      </div>
    </div>
  );
};

export default CompanyInfoCard;
