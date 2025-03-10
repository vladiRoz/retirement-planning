"use client";

import { useState, useEffect } from 'react';
import { SheetInfo } from '../utils/excel-analyzer';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TaxCalculatorProps {
  sheetsInfo: SheetInfo[];
}

const TaxCalculator: React.FC<TaxCalculatorProps> = ({ sheetsInfo }) => {
  const [income, setIncome] = useState<number>(75000);
  const [filingStatus, setFilingStatus] = useState<string>("single");
  const [retirementContributions, setRetirementContributions] = useState<number>(6000);
  const [otherDeductions, setOtherDeductions] = useState<number>(12950); // Standard deduction
  const [state, setState] = useState<string>("california");
  const [taxResults, setTaxResults] = useState<any>({});
  const [taxBreakdown, setTaxBreakdown] = useState<any[]>([]);

  // 2023 Federal Tax Brackets
  const federalTaxBrackets = {
    single: [
      { rate: 0.10, upTo: 11000 },
      { rate: 0.12, upTo: 44725 },
      { rate: 0.22, upTo: 95375 },
      { rate: 0.24, upTo: 182100 },
      { rate: 0.32, upTo: 231250 },
      { rate: 0.35, upTo: 578125 },
      { rate: 0.37, upTo: Infinity }
    ],
    married: [
      { rate: 0.10, upTo: 22000 },
      { rate: 0.12, upTo: 89450 },
      { rate: 0.22, upTo: 190750 },
      { rate: 0.24, upTo: 364200 },
      { rate: 0.32, upTo: 462500 },
      { rate: 0.35, upTo: 693750 },
      { rate: 0.37, upTo: Infinity }
    ],
    head: [
      { rate: 0.10, upTo: 15700 },
      { rate: 0.12, upTo: 59850 },
      { rate: 0.22, upTo: 95350 },
      { rate: 0.24, upTo: 182100 },
      { rate: 0.32, upTo: 231250 },
      { rate: 0.35, upTo: 578100 },
      { rate: 0.37, upTo: Infinity }
    ]
  };

  // State Tax Rates (simplified)
  const stateTaxRates = {
    california: 0.093,
    newyork: 0.068,
    texas: 0,
    florida: 0,
    illinois: 0.0495,
    washington: 0,
    pennsylvania: 0.0307,
    ohio: 0.0399,
    georgia: 0.0575,
    northcarolina: 0.0499
  };

  // FICA Tax Rates
  const ficaTaxes = {
    socialSecurity: { rate: 0.062, wageBase: 160200 },
    medicare: { rate: 0.0145, additionalRate: 0.009, threshold: 200000 }
  };

  useEffect(() => {
    calculateTaxes();
  }, [income, filingStatus, retirementContributions, otherDeductions, state]);

  const calculateTaxes = () => {
    // Calculate taxable income
    const taxableIncome = Math.max(0, income - retirementContributions - otherDeductions);
    
    // Calculate federal income tax
    const federalTax = calculateFederalTax(taxableIncome);
    
    // Calculate state income tax
    const stateRate = stateTaxRates[state as keyof typeof stateTaxRates] || 0;
    const stateTax = taxableIncome * stateRate;
    
    // Calculate FICA taxes
    const socialSecurityTax = Math.min(income, ficaTaxes.socialSecurity.wageBase) * ficaTaxes.socialSecurity.rate;
    let medicareTax = income * ficaTaxes.medicare.rate;
    
    // Additional Medicare tax for high earners
    if (income > ficaTaxes.medicare.threshold) {
      medicareTax += (income - ficaTaxes.medicare.threshold) * ficaTaxes.medicare.additionalRate;
    }
    
    // Total tax
    const totalTax = federalTax + stateTax + socialSecurityTax + medicareTax;
    
    // Effective tax rate
    const effectiveTaxRate = (totalTax / income) * 100;
    
    // Take-home pay
    const takeHomePay = income - totalTax;
    
    // Set tax results
    setTaxResults({
      taxableIncome,
      federalTax,
      stateTax,
      socialSecurityTax,
      medicareTax,
      totalTax,
      effectiveTaxRate,
      takeHomePay
    });
    
    // Set tax breakdown for chart
    setTaxBreakdown([
      { name: 'Federal Tax', value: federalTax },
      { name: 'State Tax', value: stateTax },
      { name: 'Social Security', value: socialSecurityTax },
      { name: 'Medicare', value: medicareTax },
      { name: 'Take-home Pay', value: takeHomePay }
    ]);
  };

  const calculateFederalTax = (taxableIncome: number) => {
    const brackets = federalTaxBrackets[filingStatus as keyof typeof federalTaxBrackets] || federalTaxBrackets.single;
    let tax = 0;
    let remainingIncome = taxableIncome;
    let previousBracketLimit = 0;
    
    for (const bracket of brackets) {
      const bracketIncome = Math.min(remainingIncome, bracket.upTo - previousBracketLimit);
      
      if (bracketIncome <= 0) break;
      
      tax += bracketIncome * bracket.rate;
      remainingIncome -= bracketIncome;
      previousBracketLimit = bracket.upTo;
      
      if (remainingIncome <= 0) break;
    }
    
    return tax;
  };

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Category,Amount\n"
      + `Gross Income,$${income.toLocaleString()}\n`
      + `Taxable Income,$${taxResults.taxableIncome.toLocaleString()}\n`
      + `Federal Tax,$${taxResults.federalTax.toLocaleString()}\n`
      + `State Tax,$${taxResults.stateTax.toLocaleString()}\n`
      + `Social Security Tax,$${taxResults.socialSecurityTax.toLocaleString()}\n`
      + `Medicare Tax,$${taxResults.medicareTax.toLocaleString()}\n`
      + `Total Tax,$${taxResults.totalTax.toLocaleString()}\n`
      + `Take-home Pay,$${taxResults.takeHomePay.toLocaleString()}\n`
      + `Effective Tax Rate,${taxResults.effectiveTaxRate.toFixed(2)}%`;
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "tax_calculation.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Tax Parameters</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Annual Income ($)
              </label>
              <input
                type="number"
                value={income}
                onChange={(e) => setIncome(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filing Status
              </label>
              <select
                value={filingStatus}
                onChange={(e) => setFilingStatus(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="single">Single</option>
                <option value="married">Married Filing Jointly</option>
                <option value="head">Head of Household</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Retirement Contributions ($)
              </label>
              <input
                type="number"
                value={retirementContributions}
                onChange={(e) => setRetirementContributions(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Other Deductions ($)
              </label>
              <input
                type="number"
                value={otherDeductions}
                onChange={(e) => setOtherDeductions(Number(e.target.value))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="california">California</option>
                <option value="newyork">New York</option>
                <option value="texas">Texas</option>
                <option value="florida">Florida</option>
                <option value="illinois">Illinois</option>
                <option value="washington">Washington</option>
                <option value="pennsylvania">Pennsylvania</option>
                <option value="ohio">Ohio</option>
                <option value="georgia">Georgia</option>
                <option value="northcarolina">North Carolina</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Tax Breakdown</h2>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={taxBreakdown}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Amount']} />
                <Legend />
                <Bar dataKey="value" fill="#4F46E5" name="Amount" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-6">
            <div className="bg-blue-50 p-4 rounded-md">
              <h3 className="font-medium text-blue-800 mb-2">Tax Summary</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-blue-700">Total Tax:</p>
                  <p className="font-bold text-lg text-blue-800">
                    ${taxResults.totalTax ? taxResults.totalTax.toLocaleString() : 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-blue-700">Effective Tax Rate:</p>
                  <p className="font-bold text-lg text-blue-800">
                    {taxResults.effectiveTaxRate ? taxResults.effectiveTaxRate.toFixed(2) : 0}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-blue-700">Take-home Pay:</p>
                  <p className="font-bold text-lg text-blue-800">
                    ${taxResults.takeHomePay ? taxResults.takeHomePay.toLocaleString() : 0}
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
        <h2 className="text-xl font-semibold mb-4">Detailed Tax Calculation</h2>
        
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Percentage of Income
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Gross Income
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${income.toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                100.00%
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Retirement Contributions
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${retirementContributions.toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {((retirementContributions / income) * 100).toFixed(2)}%
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Other Deductions
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${otherDeductions.toLocaleString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {((otherDeductions / income) * 100).toFixed(2)}%
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Taxable Income
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${taxResults.taxableIncome ? taxResults.taxableIncome.toLocaleString() : 0}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {taxResults.taxableIncome ? ((taxResults.taxableIncome / income) * 100).toFixed(2) : 0}%
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Federal Income Tax
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${taxResults.federalTax ? taxResults.federalTax.toLocaleString() : 0}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {taxResults.federalTax ? ((taxResults.federalTax / income) * 100).toFixed(2) : 0}%
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                State Income Tax
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${taxResults.stateTax ? taxResults.stateTax.toLocaleString() : 0}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {taxResults.stateTax ? ((taxResults.stateTax / income) * 100).toFixed(2) : 0}%
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Social Security Tax
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${taxResults.socialSecurityTax ? taxResults.socialSecurityTax.toLocaleString() : 0}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {taxResults.socialSecurityTax ? ((taxResults.socialSecurityTax / income) * 100).toFixed(2) : 0}%
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Medicare Tax
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${taxResults.medicareTax ? taxResults.medicareTax.toLocaleString() : 0}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {taxResults.medicareTax ? ((taxResults.medicareTax / income) * 100).toFixed(2) : 0}%
              </td>
            </tr>
            <tr className="bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                Total Tax
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                ${taxResults.totalTax ? taxResults.totalTax.toLocaleString() : 0}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {taxResults.effectiveTaxRate ? taxResults.effectiveTaxRate.toFixed(2) : 0}%
              </td>
            </tr>
            <tr className="bg-blue-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-800">
                Take-home Pay
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-800">
                ${taxResults.takeHomePay ? taxResults.takeHomePay.toLocaleString() : 0}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-800">
                {taxResults.takeHomePay ? ((taxResults.takeHomePay / income) * 100).toFixed(2) : 0}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TaxCalculator; 