import { useTranslation } from 'react-i18next';

import { toCamelCase } from '@/utils/textUtils';
const ActivitiesCard = ({ activities }: { activities: any[] }) => {
  const { t } = useTranslation('search-company');
  return (
    <div className="mt-5 bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          {t('activities')}
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          {t('activities_details')}
        </p>
      </div>
      <div className="border-t border-gray-200">
        <dl>
          {activities.length > 0 ? (
            activities.map((activite, index) => (
              <div
                key={index}
                className={
                  index % 2 === 0
                    ? 'bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'
                    : 'bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6'
                }
              >
                {activite.dateDebut && (
                  <>
                    <dt className="text-sm font-medium text-gray-500">
                      {t('start_date')}
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {activite.dateDebut}
                    </dd>
                  </>
                )}
                {activite.formeExercice && (
                  <>
                    <dt className="text-sm font-medium text-gray-500">
                      {t('exercise_form')}
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {toCamelCase(activite.formeExercice)}
                    </dd>
                  </>
                )}
                {activite.descriptionDetaillee && (
                  <>
                    <dt className="text-sm font-medium text-gray-500">
                      {t('detailed_description')}
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {activite.descriptionDetaillee}
                    </dd>
                  </>
                )}
                {activite.codeApe && (
                  <>
                    <dt className="text-sm font-medium text-gray-500">
                      {t('ape_code')}
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {activite.codeApe}
                    </dd>
                  </>
                )}
              </div>
            ))
          ) : (
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <p className="text-sm text-gray-500">
                {t('no_activity_specified')}
              </p>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
};

export default ActivitiesCard;
