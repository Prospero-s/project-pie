import Link from 'next/link';

// Types
type Investment = {
  id: string;
  startupName: string;
  investmentAmount: number;
  investmentDate: string;
  investmentStatus: 'Actif' | 'Sorti' | 'En attente';
};

// Données fictives
const investmentsData: Investment[] = [
  {
    id: '1',
    startupName: 'NeuroTech AI',
    investmentAmount: 3000000,
    investmentDate: '20 Fév, 2023',
    investmentStatus: 'Actif',
  },
  {
    id: '2',
    startupName: 'EcoDrive Innovations',
    investmentAmount: 1500000,
    investmentDate: '15 Jan, 2024',
    investmentStatus: 'En attente',
  },
  {
    id: '3',
    startupName: 'Quantum Solutions',
    investmentAmount: 2500000,
    investmentDate: '11 Mar, 2023',
    investmentStatus: 'Sorti',
  },
];

const TableInvestissement = () => {
  return (
    <div className="rounded-sm border border-gray-300 bg-white p-6 shadow-lg">
      <div className="max-w-full overflow-x-auto">
        <table className="w-full table-auto text-left">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="px-6 py-4 font-semibold">Entreprise</th>
              <th className="px-6 py-4 font-semibold">
                Montant de l&apos;investissement
              </th>
              <th className="px-6 py-4 font-semibold">
                Date de l&apos;investissement
              </th>
              <th className="px-6 py-4 font-semibold">Statut</th>
              <th className="px-6 py-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {investmentsData.map((investment, index) => (
              <tr key={index} className="border-b border-gray-200">
                <td className="px-6 py-4">{investment.startupName}</td>
                <td className="px-6 py-4">
                  {investment.investmentAmount.toLocaleString()} €
                </td>
                <td className="px-6 py-4">{investment.investmentDate}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      investment.investmentStatus === 'Actif'
                        ? 'bg-green-200 text-green-700'
                        : investment.investmentStatus === 'Sorti'
                          ? 'bg-red-200 text-red-700'
                          : 'bg-yellow-200 text-yellow-700'
                    }`}
                  >
                    {investment.investmentStatus}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <Link
                    href={`/entreprises?id=${investment.id}`}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    Voir
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableInvestissement;
