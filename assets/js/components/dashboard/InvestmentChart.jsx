import React from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// Données statiques pour le graphique
const mockData = [
  { month: "janvier", amount: 10000 },
  { month: "février", amount: 12000 },
  { month: "mars", amount: 9000 },
  { month: "avril", amount: 15000 },
  { month: "mai", amount: 20000 },
  { month: "juin", amount: 18000 },
  { month: "juillet", amount: 22000 },
  { month: "août", amount: 21000 },
  { month: "septembre", amount: 25000 },
  { month: "octobre", amount: 28000 },
  { month: "novembre", amount: 30000 },
  { month: "décembre", amount: 35000 }
];

const InvestmentChart = () => {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">
        Évolution des investissements
      </h2>
      
      <div className="shadow-lg rounded-lg p-6 bg-white">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={mockData}>
            <XAxis
              dataKey="month"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}€`}
            />
            <Tooltip 
              formatter={(value) => [`${value}€`, "Montant"]}
              labelStyle={{ color: "#888888" }}
            />
            <Line
              type="monotone"
              dataKey="amount"
              stroke="#8884d8"
              strokeWidth={2}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default InvestmentChart; 