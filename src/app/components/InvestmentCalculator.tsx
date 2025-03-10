"use client";

import { useState, useEffect } from 'react';
import { SheetInfo } from '../utils/excel-analyzer';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface InvestmentCalculatorProps {
  sheetsInfo: SheetInfo[];
}

const InvestmentCalculator: React.FC<InvestmentCalculatorProps> = ({ sheetsInfo }) => {
  const [investmentAmount, setInvestmentAmount] = useState<number>(100000);
  const [riskProfile, setRiskProfile] = useState<string>("moderate");
  const [investmentHorizon, setInvestmentHorizon] = useState<number>(15);
  const [portfolioAllocation, setPortfolioAllocation] = useState<any[]>([]);
  const [expectedReturns, setExpectedReturns] = useState<any[]>([]);
  
  // Define asset classes and their expected returns based on risk profile
  const assetClasses = {
    conservative: [
      { name: "Bonds", percentage: 60, expectedReturn: 3.5, color: "#4F46E5" },
      { name: "Large Cap Stocks", percentage: 20, expectedReturn: 7.0, color: "#10B981" },
      { name: "Mid Cap Stocks", percentage: 10, expectedReturn: 8.0, color: "#F59E0B" },
      { name: "International Stocks", percentage: 5, expectedReturn: 7.5, color: "#EF4444" },
      { name: "Cash", percentage: 5, expectedReturn: 1.5, color: "#6B7280" }
    ],
    moderate: [
      { name: "Bonds", percentage: 40, expectedReturn: 3.5, color: "#4F46E5" },
      { name: "Large Cap Stocks", percentage: 30, expectedReturn: 7.0, color: "#10B981" },
      { name: "Mid Cap Stocks", percentage: 15, expectedReturn: 8.0, color: "#F59E0B" },
      { name: "International Stocks", percentage: 10, expectedReturn: 7.5, color: "#EF4444" },
      { name: "Cash", percentage: 5, expectedReturn: 1.5, color: "#6B7280" }
    ],
    aggressive: [
      { name: "Bonds", percentage: 20, expectedReturn: 3.5, color: "#4F46E5" },
      { name: "Large Cap Stocks", percentage: 40, expectedReturn: 7.0, color: "#10B981" },
      { name: "Mid Cap Stocks", percentage: 20, expectedReturn: 8.0, color: "#F59E0B" },
      { name: "International Stocks", percentage: 15, expectedReturn: 7.5, color: "#EF4444" },
      { name: "Cash", percentage: 5, expectedReturn: 1.5, color: "#6B7280" }
    ]
  };

  useEffect(() => {
    // Update portfolio allocation based on risk profile
    const allocation = assetClasses[riskProfile as keyof typeof assetClasses].map(asset => ({
      ...asset,
      value: (asset.percentage / 100) * investmentAmount
    }));
    
    setPortfolioAllocation(allocation);
    
    // Calculate expected returns over time
    calculateExpectedReturns(allocation);
  }, [investmentAmount, riskProfile, investmentHorizon]);

  const calculateExpectedReturns = (allocation: any[]) => {
    const years = Array.from({ length: investmentHorizon + 1 }, (_, i) => i);
    
    // Calculate weighted average return
    const weightedReturn = allocation.reduce(
      (sum, asset) => sum + (asset.expectedReturn * asset.percentage / 100), 
      0
    );
    
    // Calculate portfolio value over time
    const returns = years.map(year => {
      const portfolioValue = investmentAmount * Math.pow(1 + weightedReturn / 100, year);
      
      return {
        year,
        value: Math.round(portfolioValue),
        growth: Math.round(portfolioValue - investmentAmount)
      };
    });
    
    setExpectedReturns(returns);
  };

  const handleExportCSV = () => {
    // Create CSV for portfolio allocation
    const allocationCSV = "data:text/csv;charset=utf-8," 
      + "Asset Class,Percentage,Amount,Expected Return\n"
      + portfolioAllocation.map(asset => 
          `${asset.name},${asset.percentage}%,$${asset.value.toLocaleString()},${asset.expectedReturn}%`
        ).join("\n");
    
    const encodedUri = encodeURI(allocationCSV);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "portfolio_allocation.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Create CSV for expected returns
    const returnsCSV = "data:text/csv;charset=utf-8," 
      + "Year,Portfolio Value,Growth\n"
      + expectedReturns.map(year => 
          `${year.year},$${year.value.toLocaleString()},$${year.growth.toLocaleString()}`
        ).join("\n");
    
    const encodedReturnsUri = encodeURI(returnsCSV);
    const returnsLink = document.createElement("a");
    returnsLink.setAttribute("href", encodedReturnsUri);
    returnsLink.setAttribute("download", "expected_returns.csv");
    document.body.appendChild(returnsLink);
    returnsLink.click();
    document.body.removeChild(returnsLink);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Investment Parameters</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Investment Amount ($)
              </label>
              <input
                type="number"
                value={investmentAmount}
                onChange={(e) => setInvestmentAmount(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Risk Profile
              </label>
              <select
                value={riskProfile}
                onChange={(e) => setRiskProfile(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="conservative">Conservative</option>
                <option value="moderate">Moderate</option>
                <option value="aggressive">Aggressive</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Investment Horizon (Years): {investmentHorizon}
              </label>
              <input
                type="range"
                min="1"
                max="40"
                value={investmentHorizon}
                onChange={(e) => setInvestmentHorizon(parseInt(e.target.value))}
                className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Portfolio Allocation</h2>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={portfolioAllocation}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                >
                  {portfolioAllocation.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Amount']} 
                  labelFormatter={(name) => `${name}`}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-6">
            <div className="bg-blue-50 p-4 rounded-md">
              <h3 className="font-medium text-blue-800 mb-2">Investment Summary</h3>
              <p className="text-blue-700">
                Expected portfolio value after {investmentHorizon} years:
                <span className="font-bold block text-xl mt-1">
                  ${expectedReturns.length > 0 ? expectedReturns[expectedReturns.length - 1].value.toLocaleString() : 0}
                </span>
              </p>
              <p className="text-blue-700 mt-2">
                Total growth:
                <span className="font-bold block text-lg mt-1">
                  ${expectedReturns.length > 0 ? expectedReturns[expectedReturns.length - 1].growth.toLocaleString() : 0}
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
        <h2 className="text-xl font-semibold mb-4">Expected Returns Over Time</h2>
        
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Year
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Portfolio Value
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Growth
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Growth %
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {expectedReturns.map((row) => (
              <tr key={row.year}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {row.year}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  ${row.value.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${row.growth.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {Math.round((row.growth / investmentAmount) * 100)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm overflow-auto">
        <h2 className="text-xl font-semibold mb-4">Asset Allocation Details</h2>
        
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Asset Class
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Allocation %
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expected Annual Return
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {portfolioAllocation.map((asset) => (
              <tr key={asset.name}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {asset.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {asset.percentage}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${asset.value.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {asset.expectedReturn}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InvestmentCalculator; 