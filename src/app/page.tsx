"use client";

import { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import { analyzeExcelFile, SheetInfo } from './utils/excel-analyzer';

// Import calculator components (to be created)
import RetirementCalculator from './components/RetirementCalculator';
import SavingsCalculator from './components/SavingsCalculator';
import InvestmentCalculator from './components/InvestmentCalculator';
import TaxCalculator from './components/TaxCalculator';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Home() {
  const [sheetsInfo, setSheetsInfo] = useState<SheetInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchExcelData = async () => {
      try {
        const data = await analyzeExcelFile('/Retirement-planning-tool.xlsx');
        setSheetsInfo(data);
        console.log('Excel data loaded:', data);
      } catch (error) {
        console.error('Error loading Excel data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExcelData();
  }, []);

  const calculators = [
    { name: 'Retirement Calculator', component: <RetirementCalculator sheetsInfo={sheetsInfo} /> },
    { name: 'Savings Calculator', component: <SavingsCalculator sheetsInfo={sheetsInfo} /> },
    { name: 'Investment Calculator', component: <InvestmentCalculator sheetsInfo={sheetsInfo} /> },
    { name: 'Tax Calculator', component: <TaxCalculator sheetsInfo={sheetsInfo} /> },
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Retirement Planning Tools</h1>
          <p className="text-xl text-gray-600">
            Plan your financial future with our comprehensive retirement calculators
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="bg-white shadow-xl rounded-lg overflow-hidden">
            <Tab.Group>
              <Tab.List className="flex bg-gray-100 p-1 rounded-t-lg">
                {calculators.map((calculator) => (
                  <Tab
                    key={calculator.name}
                    className={({ selected }) =>
                      classNames(
                        'w-full py-3 text-sm font-medium rounded-md transition-all duration-200',
                        'focus:outline-none focus:ring-2 ring-offset-2 ring-offset-blue-400 ring-blue-500',
                        selected
                          ? 'bg-white text-blue-700 shadow'
                          : 'text-gray-700 hover:bg-white/[0.25] hover:text-blue-600'
                      )
                    }
                  >
                    {calculator.name}
                  </Tab>
                ))}
              </Tab.List>
              <Tab.Panels className="p-6">
                {calculators.map((calculator) => (
                  <Tab.Panel
                    key={calculator.name}
                    className={classNames(
                      'rounded-xl p-3',
                      'focus:outline-none'
                    )}
                  >
                    {calculator.component}
                  </Tab.Panel>
                ))}
              </Tab.Panels>
            </Tab.Group>
          </div>
        )}
      </div>
    </main>
  );
}
