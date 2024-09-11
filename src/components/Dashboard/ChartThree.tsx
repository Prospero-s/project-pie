'use client';

import { Line } from 'react-chartjs-2';
import { useTranslation } from 'react-i18next';

const ChartThree = () => {
  const { t } = useTranslation('dashboard');
  const data = {
    labels: [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ],
    datasets: [
      {
        label: 'NeuroTech AI',
        data: [
          3000, 4000, 3500, 5000, 6000, 7000, 8000, 9000, 10000, 11000, 12000,
          13000,
        ],
        fill: false,
        backgroundColor: 'rgb(75, 192, 192)',
        borderColor: 'rgba(75, 192, 192, 0.2)',
      },
      {
        label: 'EcoDrive Innovations',
        data: [
          1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 6500,
          7000,
        ],
        fill: false,
        backgroundColor: 'rgb(54, 162, 235)',
        borderColor: 'rgba(54, 162, 235, 0.2)',
      },
      {
        label: 'Quantum Solutions',
        data: [
          2000, 2500, 3000, 3500, 4000, 4500, 5000, 5500, 6000, 6500, 7000,
          7500,
        ],
        fill: false,
        backgroundColor: 'rgb(255, 206, 86)',
        borderColor: 'rgba(255, 206, 86, 0.2)',
      },
    ],
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="p-4 shadow-lg rounded-lg bg-white">
      <h2 className="text-xl font-semibold mb-4">{t('average_growth')}</h2>
      <Line data={data} options={options} />
    </div>
  );
};

export default ChartThree;
