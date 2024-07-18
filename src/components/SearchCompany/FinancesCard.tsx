const FinancesCard = ({
  capital,
  currency,
}: {
  capital: any;
  currency: string;
}) => {
  const formattedCapital =
    capital !== null
      ? new Intl.NumberFormat('fr-FR', {
          style: 'decimal',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(capital)
      : 'Non spécifié';

  return (
    <div className="mt-5 bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Finances
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Détails financiers de l'entreprise.
        </p>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
        <dl className="sm:divide-y sm:divide-gray-200">
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">
              Montant du capital
            </dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {formattedCapital}
            </dd>
            <dt className="text-sm font-medium text-gray-500">
              Devise du capital
            </dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {currency}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
};

export default FinancesCard;
