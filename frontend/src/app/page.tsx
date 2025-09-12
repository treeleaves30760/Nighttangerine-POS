'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Clock, Coffee, UtensilsCrossed, Cake, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function CustomerHomePage() {
  const [currentOrderNumber, setCurrentOrderNumber] = React.useState(142);
  const [completedToday, setCompletedToday] = React.useState(47);

  const menuCategories = [
    {
      id: 'beverages',
      name: 'Beverages',
      icon: Coffee,
      color: 'from-blue-500 to-blue-600',
      items: [
        { id: '1', name: 'Cappuccino', price: 4.50, available: true },
        { id: '2', name: 'Espresso', price: 2.50, available: true },
        { id: '3', name: 'Green Tea', price: 3.00, available: true },
        { id: '4', name: 'Iced Coffee', price: 3.75, available: false },
      ]
    },
    {
      id: 'food',
      name: 'Food',
      icon: UtensilsCrossed,
      color: 'from-orange-500 to-orange-600',
      items: [
        { id: '5', name: 'Caesar Salad', price: 12.99, available: true },
        { id: '6', name: 'Club Sandwich', price: 9.50, available: true },
        { id: '7', name: 'Soup of the Day', price: 6.75, available: true },
      ]
    },
    {
      id: 'bakery',
      name: 'Bakery',
      icon: Cake,
      color: 'from-pink-500 to-pink-600',
      items: [
        { id: '8', name: 'Croissant', price: 3.25, available: true },
        { id: '9', name: 'Chocolate Muffin', price: 4.75, available: true },
        { id: '10', name: 'Danish Pastry', price: 4.25, available: false },
      ]
    }
  ];

  const refreshOrderNumber = () => {
    setCurrentOrderNumber(prev => prev + Math.floor(Math.random() * 3) + 1);
    setCompletedToday(prev => prev + Math.floor(Math.random() * 2) + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">
                Nighttangerine Café
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Welcome! Choose from our delicious menu below
              </p>
            </div>
            
            <div className="text-right">
              <Link href="/sells">
                <Button variant="outline" className="mr-3">
                  Staff Login
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={refreshOrderNumber}
                className="ml-2"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Order Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Now Serving
                </h3>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  #{currentOrderNumber}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                <Coffee className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Orders Completed Today
                </h3>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {completedToday}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Categories */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-center">
            Our Menu
          </h2>
          
          {menuCategories.map((category) => {
            const IconComponent = category.icon;
            return (
              <div 
                key={category.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div className={`bg-gradient-to-r ${category.color} p-6`}>
                  <div className="flex items-center text-white">
                    <IconComponent className="h-8 w-8 mr-3" />
                    <h3 className="text-2xl font-bold">{category.name}</h3>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {category.items.map((item) => (
                      <div 
                        key={item.id}
                        className={`relative p-4 rounded-lg border-2 transition-all duration-200 ${
                          item.available 
                            ? 'border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-600 cursor-pointer hover:shadow-md' 
                            : 'border-gray-100 dark:border-gray-700 opacity-50'
                        }`}
                      >
                        {!item.available && (
                          <div className="absolute inset-0 bg-gray-50 dark:bg-gray-800 bg-opacity-75 rounded-lg flex items-center justify-center">
                            <span className="text-gray-500 dark:text-gray-400 font-medium">
                              Currently Unavailable
                            </span>
                          </div>
                        )}
                        
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                            {item.name}
                          </h4>
                          <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                            ${item.price.toFixed(2)}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.available 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {item.available ? 'Available' : 'Out of Stock'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 border border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Ready to Order?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Visit our counter to place your order and receive your order number
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8">
                Order at Counter
              </Button>
              <Link href="/sells">
                <Button variant="outline" size="lg" className="text-lg px-8">
                  Staff Portal
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
