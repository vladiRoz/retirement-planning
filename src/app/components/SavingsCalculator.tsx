"use client";

import { useState, useEffect } from 'react';
import { SheetInfo } from '../utils/excel-analyzer';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SavingsCalculatorProps {
  sheetsInfo: SheetInfo[];
}

const SavingsCalculator: React.FC<SavingsCalculatorProps> = ({ sheetsInfo }) => {
  const [initialDeposit, setInitialDeposit] = useState<number>(1000);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(200);
  const [interestRate, setInterestRate] = useState<number>(5);
  const [years, setYears] = useState<number>(10);
  const [compoundFrequency, setCompoundFrequency] = useState<string>("monthly");
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    calculateSavings();
  }, [initialDeposit, monthlyContribution, interestRate, years, compoundFrequency]);

  const calculateSavings = () => {
    const frequencies: { [key: string]: number } = {
      annually: 1,
      semiannually: 2,
      quarterly: 4,
      monthly: 12,
      daily: 365
    };
    
    const n = frequencies[compoundFrequency];
    const r = interestRate / 100;
    const t = years;
    
    let balance = initialDeposit;
    const newResults = [];
    
    // Calculate for each month
    for (let month = 0; month <= t * 12; month++) {
      const year = month / 12;
      
      if (month > 0) {
        // Add monthly contribution
        balance += monthlyContribution;
        
        // Apply interest based on compound frequency
        if (compoundFrequency === 'monthly' || month % (12 / n) === 0) {
          balance *= (1 + r / n);
        } else if (compoundFrequency === 'daily') {
          // For daily compounding, apply monthly equivalent
          balance *= Math.pow(1 + r / 365, 30);
        }
      }
      
      // Only add data points for each year and the final month
      if (month % 12 === 0 || month === t * 12) {
        newResults.push({
          month,
          year: Math.floor(year * 10) / 10,
          balance: Math.round(balance),
          totalContributions: initialDeposit + (monthlyContribution * month)
        });
      }
    }
    
    setResults(newResults);
  };

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Year,Month,Balance,Total Contributions\n"
      + results.map(row => `${row.year},${row.month},${row.balance},${row.totalContributions}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "savings_projection.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate total interest earned
  const totalInterest = results.length > 0 
    ? results[results.length - 1].balance - results[results.length - 1].totalContributions 
    : 0;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Savings Parameters</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Initial Deposit ($)
              </label>
              <input
                type="number"
                value={initialDeposit}
                onChange={(e) => setInitialDeposit(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monthly Contribution ($)
              </label>
              <input
                type="number"
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Annual Interest Rate (%): {interestRate}%
              </label>
              <input
                type="range"
                min="0.1"
                max="15"
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(parseFloat(e.target.value))}
                className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time Period (Years): {years}
              </label>
              <input
                type="range"
                min="1"
                max="40"
                value={years}
                onChange={(e) => setYears(parseInt(e.target.value))}
                className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Compound Frequency
              </label>
              <select
                value={compoundFrequency}
                onChange={(e) => setCompoundFrequency(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="annually">Annually</option>
                <option value="semiannually">Semi-annually</option>
                <option value="quarterly">Quarterly</option>
                <option value="monthly">Monthly</option>
                <option value="daily">Daily</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Savings Projection</h2>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={results}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" label={{ value: 'Years', position: 'insideBottomRight', offset: -5 }} />
                <YAxis label={{ value: 'Amount ($)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']} />
                <Legend />
                <Line type="monotone" dataKey="balance" stroke="#4F46E5" name="Balance" />
                <Line type="monotone" dataKey="totalContributions" stroke="#10B981" name="Contributions" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-6">
            <div className="bg-blue-50 p-4 rounded-md">
              <h3 className="font-medium text-blue-800 mb-2">Savings Summary</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-blue-700">Final Balance:</p>
                  <p className="font-bold text-lg text-blue-800">
                    ${results.length > 0 ? results[results.length - 1].balance.toLocaleString() : 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-blue-700">Total Contributions:</p>
                  <p className="font-bold text-lg text-blue-800">
                    ${results.length > 0 ? results[results.length - 1].totalContributions.toLocaleString() : 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-blue-700">Interest Earned:</p>
                  <p className="font-bold text-lg text-blue-800">
                    ${totalInterest.toLocaleString()}
                  </p>
                </div>
              </div>
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
        <h2 className="text-xl font-semibold mb-4">Detailed Savings Table</h2>
        
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Year
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Contributions
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Interest Earned
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Balance
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {results.filter(row => row.month % 12 === 0).map((row, index) => {
              const prevBalance = index > 0 ? results.filter(r => r.month % 12 === 0)[index - 1].balance : 0;
              const interestEarned = row.balance - row.totalContributions;
              
              return (
                <tr key={row.year}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {row.year}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${row.totalContributions.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${interestEarned.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${row.balance.toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SavingsCalculator; 