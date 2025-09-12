
import { DollarSign, BarChart, Package, Users } from 'lucide-react';

export const features = [
  {
    icon: DollarSign,
    title: 'Effortless Transactions',
    description: 'A fast, intuitive checkout experience for your customers and staff. Supports cash, card, and mobile payments.',
  },
  {
    icon: Package,
    title: 'Simple Inventory Management',
    description: 'Keep track of your stock in real-time. Get low-stock alerts and automate purchase orders to never miss a sale.',
  },
  {
    icon: BarChart,
    title: 'Insightful Analytics',
    description: 'Understand your business better with easy-to-read reports on sales, popular items, and customer trends.',
  },
  {
    icon: Users,
    title: 'Customer Relationships',
    description: 'Build loyalty by creating customer profiles, tracking purchase history, and offering personalized rewards.',
  },
];

export const pricingTiers = [
  {
    name: 'Starter',
    price: '$29',
    priceFrequency: '/month',
    description: 'For new businesses and pop-ups getting started.',
    features: ['1 Register', '100 Products', 'Basic Reporting', 'Email Support'],
    cta: 'Start for Free',
    isFeatured: false,
  },
  {
    name: 'Pro',
    price: '$79',
    priceFrequency: '/month',
    description: 'For growing businesses that need more power.',
    features: [
      '3 Registers',
      'Unlimited Products',
      'Advanced Reporting',
      'Customer Management',
      'Priority Support',
    ],
    cta: 'Get Started',
    isFeatured: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    priceFrequency: '',
    description: 'For large operations and multi-location businesses.',
    features: [
      'Unlimited Registers',
      'Dedicated Account Manager',
      'API Access',
      'Custom Integrations',
    ],
    cta: 'Contact Sales',
    isFeatured: false,
  },
];

export const faqItems = [
  {
    question: 'Is there a free trial?',
    answer: 'Yes! You can sign up for the Starter plan and use it for free for 14 days, no credit card required. This gives you plenty of time to see if Nighttangerine POS is right for your business.',
  },
  {
    question: 'What hardware do I need?',
    answer: 'Nighttangerine POS runs on any modern web browser, so you can use it on your existing iPad, laptop, or desktop computer. We also support common receipt printers, barcode scanners, and cash drawers.',
  },
  {
    question: 'Can I import my existing products?',
    answer: 'Absolutely. You can easily import your product catalog via a CSV file. Our onboarding guide provides a clear template and instructions to make the process smooth.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Yes. We take data security very seriously. All data is encrypted in transit and at rest, and we use industry-standard best practices to protect your business and customer information.',
  },
];
