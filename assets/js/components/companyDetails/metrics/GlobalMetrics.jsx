import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { BarChart, LineChart, RadarChart, AreaChart, XAxis, YAxis, Tooltip, Legend, CartesianGrid, Bar, Line, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Area } from 'recharts';
import ChartCompanyFilters from '../metrics/ChartCompanyFilters'
const chartComponents = {
  radar: RadarChart,
  bar: BarChart,
  area: AreaChart,
  line: LineChart,
};

const GlobalMetrics = ({company}) => {
  console.log(company)
  const [charts, setCharts] = useState([]);
  const [chartType, setChartType] = useState('line');
  const [chartDataOptions, setChartDataOptions] = useState(Object.keys(company));
  const [filterOptions, setFilterOptions] = useState(Object.keys(company));
  const [xAxis, setXAxis] = useState('');
  const [yAxis, setYAxis] = useState([]);
  const [chartsData, setChartsData] = ([]);
  
  // État pour stocker les valeurs des filtres (en array)
  const [filterValues, setFilterValues] = React.useState({});
  
  const [data, setData] = useState([
    { name: 'Jan', value1: 30, value2: 20 },
    { name: 'Feb', value1: 50, value2: 40 },
    { name: 'Mar', value1: 80, value2: 70 },
  ]);

  useEffect(() => {
    const storedCharts = JSON.parse(localStorage.getItem('charts')) || [];
    setCharts(storedCharts);
  }, []);

  useEffect(() => {
    charts.map((chart) => {
      // call avec le chart xAxis,Yaxis,Filters
    })
  })

  useEffect(() => {
    localStorage.setItem('charts', JSON.stringify(charts));
  }, [charts]);

  const handleCheckboxChange = (option, selectedOptions, setSelectedOptions) => {
    setSelectedOptions((prev) =>
      prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option]
    );
  };

  const addChart = () => {
    const newChart = {
      id: uuidv4(),
      type: chartType,
      xAxis,
      yAxis,
      filters,
      data,
    };
    setCharts([...charts, newChart]);
  };


  return (
    <div>
      <div className="mb-6">
        <select value={chartType} onChange={(e) => setChartType(e.target.value)} className="border p-2">
          <option value="radar">Radar Chart</option>
          <option value="bar">Bar Chart</option>
          <option value="area">Area Chart</option>
          <option value="line">Line Chart</option>
        </select>
        
        <div className="border p-2 mx-2">
          <button className="font-bold">Axe X</button>
          {chartDataOptions.map((option) => (
            <label key={option} className="block">
              <input
                type="radio"
                name="xAxis"
                value={option}
                checked={xAxis === option}
                onChange={() => setXAxis(option)}
              /> {option}
            </label>
          ))}
        </div>

        <div className="border p-2 mx-2">
          <button className="font-bold">Axe Y</button>
          {chartDataOptions.filter(opt => opt !== 'name').map((option) => (
            <label key={option} className="block">
              <input
                type="checkbox"
                checked={yAxis.includes(option)}
                onChange={() => handleCheckboxChange(option, yAxis, setYAxis)}
              /> {option}
            </label>
          ))}
        </div>
        
        <ChartCompanyFilters filterValues={filterValues} setFilterValues={setFilterValues}/>

        <button onClick={addChart} className="bg-blue-500 text-white p-2 rounded">Ajouter</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {charts.map(({ id, type, xAxis, yAxis, filterValues, data }) => {
          const ChartComponent = chartComponents[type];
          if (!ChartComponent) return null;
          
          return (
            <ChartComponent key={id} width={400} height={300} data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxis} />
              <YAxis />
              <Tooltip />
              <Legend />
              {yAxis.map((yKey) => (
                type === 'bar' ? <Bar key={yKey} dataKey={yKey} fill="#8884d8" /> :
                type === 'line' ? <Line key={yKey} type="monotone" dataKey={yKey} stroke="#82ca9d" /> :
                type === 'area' ? <Area key={yKey} type="monotone" dataKey={yKey} fill="#ffc658" stroke="#ffc658" /> :
                type === 'radar' ? (
                  <RadarChart key={yKey} outerRadius={90} data={data}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey={xAxis} />
                    <PolarRadiusAxis />
                    <Radar name="Data" dataKey={yKey} stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  </RadarChart>
                ) : null
              ))}
            </ChartComponent>
          );
        })}
      </div>
    </div>
  );
};

export default GlobalMetrics;
