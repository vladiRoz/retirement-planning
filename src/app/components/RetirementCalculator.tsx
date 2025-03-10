"use client";

import { useState, useEffect } from 'react';
import { SheetInfo } from '../utils/excel-analyzer';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface RetirementCalculatorProps {
  sheetsInfo: SheetInfo[];
}

const RetirementCalculator: React.FC<RetirementCalculatorProps> = ({ sheetsInfo }) => {
  const [currentAge, setCurrentAge] = useState<number>(30);
  const [retirementAge, setRetirementAge] = useState<number>(65);
  const [currentSavings, setCurrentSavings] = useState<number>(50000);
  const [annualContribution, setAnnualContribution] = useState<number>(6000);
  const [expectedReturn, setExpectedReturn] = useState<number>(7);
  const [inflationRate, setInflationRate] = useState<number>(2.5);
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    calculateRetirement();
  }, [currentAge, retirementAge, currentSavings, annualContribution, expectedReturn, inflationRate]);

  const calculateRetirement = () => {
    const years = retirementAge - currentAge;
    const realRate = (1 + expectedReturn / 100) / (1 + inflationRate / 100) - 1;
    
    let balance = currentSavings;
    const newResults = [];
    
    for (let i = 0; i <= years; i++) {
      const age = currentAge + i;
      const yearContribution = i === 0 ? 0 : annualContribution;
      balance = balance * (1 + realRate) + yearContribution;
      
      newResults.push({
        age,
        balance: Math.round(balance),
        contribution: i === 0 ? currentSavings : annualContribution,
        year: i
      });
    }
    
    setResults(newResults);
  };

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Age,Year,Balance,Contribution\n"
      + results.map(row => `${row.age},${row.year},${row.balance},${row.contribution}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "retirement_projection.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Input Parameters</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Age: {currentAge}
              </label>
              <input
                type="range"
                min="18"
                max="80"
                value={currentAge}
                onChange={(e) => setCurrentAge(parseInt(e.target.value))}
                className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Retirement Age: {retirementAge}
              </label>
              <input
                type="range"
                min={currentAge + 1}
                max="90"
                value={retirementAge}
                onChange={(e) => setRetirementAge(parseInt(e.target.value))}
                className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Savings ($)
              </label>
              <input
                type="number"
                value={currentSavings}
                onChange={(e) => setCurrentSavings(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Annual Contribution ($)
              </label>
              <input
                type="number"
                value={annualContribution}
                onChange={(e) => setAnnualContribution(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expected Return (%): {expectedReturn}%
              </label>
              <input
                type="range"
                min="1"
                max="12"
                step="0.1"
                value={expectedReturn}
                onChange={(e) => setExpectedReturn(parseFloat(e.target.value))}
                className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Inflation Rate (%): {inflationRate}%
              </label>
              <input
                type="range"
                min="0"
                max="8"
                step="0.1"
                value={inflationRate}
                onChange={(e) => setInflationRate(parseFloat(e.target.value))}
                className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Retirement Projection</h2>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={results}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="age" label={{ value: 'Age', position: 'insideBottomRight', offset: -5 }} />
                <YAxis label={{ value: 'Balance ($)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Balance']} />
                <Legend />
                <Bar dataKey="balance" fill="#4F46E5" name="Projected Balance" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-6">
            <div className="bg-blue-50 p-4 rounded-md">
              <h3 className="font-medium text-blue-800 mb-2">Retirement Summary</h3>
              <p className="text-blue-700">
                At age {retirementAge}, your projected retirement savings will be:
                <span className="font-bold block text-xl mt-1">
                  ${results.length > 0 ? results[results.length - 1].balance.toLocaleString() : 0}
                </span>
              </p>
            </div>
            
            <button
              onClick={handleExportCSV}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Export to CSV
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm overflow-auto">
        <h2 className="text-xl font-semibold mb-4">Detailed Projection Table</h2>
        
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Year
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Age
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Annual Contribution
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Balance
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {results.map((row) => (
              <tr key={row.year}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {row.year}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {row.age}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${row.contribution.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  ${row.balance.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RetirementCalculator; 