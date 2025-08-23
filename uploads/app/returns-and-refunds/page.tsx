"use client"

import { useState, useEffect } from 'react';
import { ShieldCheck, Package, CircleDollarSign, Repeat, AlertTriangle, Phone, Truck } from 'lucide-react';

const sections = [
  { id: 'eligibility', title: 'Eligibility for Returns', icon: ShieldCheck },
  { id: 'initiate', title: 'How to Initiate a Return', icon: Package },
  { id: 'refunds', title: 'Refunds', icon: CircleDollarSign },
  { id: 'exchanges', title: 'Exchanges', icon: Repeat },
  { id: 'damaged', title: 'Damaged or Wrong Items', icon: AlertTriangle },
  { id: 'shipping', title: 'Return Shipping Costs', icon: Truck },
  { id: 'contact', title: 'Need Help?', icon: Phone },
];

export default function ReturnsAndRefundsPage() {
  const [activeSection, setActiveSection] = useState('eligibility');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -80% 0px' }
    );

    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      sections.forEach((section) => {
        const element = document.getElementById(section.id);
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800">Returns & Refunds</h1>
          <p className="text-lg text-gray-600 mt-2">Your satisfaction is our priority. Here's how we handle returns.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          <aside className="lg:col-span-1 lg:sticky top-24 self-start">
            <nav className="space-y-2">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className={`flex items-center px-4 py-2.5 rounded-lg transition-colors duration-200 ${
                    activeSection === section.id
                      ? 'bg-green-100 text-green-700 font-semibold'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <section.icon className="h-5 w-5 mr-3" />
                  <span>{section.title}</span>
                </a>
              ))}
            </nav>
          </aside>

          <main className="lg:col-span-3 space-y-12">
            <section id="eligibility" className="scroll-mt-24 bg-white p-8 rounded-xl shadow-sm border">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <ShieldCheck className="h-6 w-6 mr-3 text-green-600" /> Eligibility for Returns
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>Items must be returned within 7 days of delivery.</p>
                <p>To be eligible, the item must be:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Unused, unworn, and in the same condition as received.</li>
                  <li>In its original packaging with all tags, labels, or seals intact.</li>
                </ul>
                <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800">
                  <p>Certain items cannot be returned for hygiene and safety reasons (e.g., underwear, cosmetics, food items).</p>
                  <p className="mt-1">Sale or clearance items may not be eligible for return unless faulty.</p>
                </div>
              </div>
            </section>

            <section id="initiate" className="scroll-mt-24 bg-white p-8 rounded-xl shadow-sm border">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <Package className="h-6 w-6 mr-3 text-green-600" /> How to Initiate a Return
              </h2>
              <div className="space-y-4 text-gray-700">
                <ol className="list-decimal pl-6 space-y-4">
                  <li>Contact our Customer Support Team via email or WhatsApp within 7 days of receiving your order.</li>
                  <li>Provide your order number, product details, and reason for return.</li>
                  <li>Our team will guide you on the return shipping process.</li>
                </ol>
              </div>
            </section>

            <section id="refunds" className="scroll-mt-24 bg-white p-8 rounded-xl shadow-sm border">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <CircleDollarSign className="h-6 w-6 mr-3 text-green-600" /> Refunds
              </h2>
              <div className="space-y-4 text-gray-700">
                <ul className="list-disc pl-6 space-y-2">
                  <li>Once your return is received and inspected, we will notify you of the approval or rejection of your refund.</li>
                  <li>Approved refunds will be processed within 5–10 business days.</li>
                  <li>Refunds will be made to your original payment method (bank transfer, card, or wallet credit).</li>
                  <li>Shipping fees are non-refundable, unless the return is due to a mistake on our part (e.g., wrong or damaged item).</li>
                </ul>
              </div>
            </section>

            <section id="exchanges" className="scroll-mt-24 bg-white p-8 rounded-xl shadow-sm border">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <Repeat className="h-6 w-6 mr-3 text-green-600" /> Exchanges
              </h2>
              <div className="space-y-4 text-gray-700">
                <ul className="list-disc pl-6 space-y-2">
                  <li>If you would like to exchange an item (e.g., for a different size or color), please indicate this when contacting support.</li>
                  <li>Exchanges are subject to product availability.</li>
                  <li>If the replacement item is not available, a refund will be issued instead.</li>
                </ul>
              </div>
            </section>

            <section id="damaged" className="scroll-mt-24 bg-white p-8 rounded-xl shadow-sm border">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <AlertTriangle className="h-6 w-6 mr-3 text-red-500" /> Damaged, Defective, or Wrong Items
              </h2>
              <div className="space-y-4 text-gray-700">
                <ul className="list-disc pl-6 space-y-2">
                  <li>If you receive a damaged, defective, or incorrect item, please contact us within 48 hours of delivery.</li>
                  <li>Provide clear pictures of the product and packaging.</li>
                  <li>We will arrange a replacement or issue a full refund at no extra cost to you.</li>
                </ul>
              </div>
            </section>

            <section id="shipping" className="scroll-mt-24 bg-white p-8 rounded-xl shadow-sm border">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <Truck className="h-6 w-6 mr-3 text-green-600" /> Return Shipping Costs
              </h2>
              <div className="space-y-4 text-gray-700">
                <ul className="list-disc pl-6 space-y-2">
                  <li>Customers are responsible for the cost of return shipping, unless the return is due to our error (wrong or defective item).</li>
                  <li>We recommend using a trackable courier service, as we cannot guarantee that we will receive your returned item.</li>
                </ul>
              </div>
            </section>

            <section id="contact" className="scroll-mt-24 bg-white p-8 rounded-xl shadow-sm border">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <Phone className="h-6 w-6 mr-3 text-green-600" /> Need Help?
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>For returns, refunds, or exchanges, please reach out to our Customer Support Team:</p>
                <ul className="list-none space-y-2">
                  <li>Email: support@ruachestore.com.ng</li>
                  <li>Phone/WhatsApp: <a href="https://wa.me/2348160662997" className="text-green-600 hover:text-green-700">+234 816 066 2997</a></li>
                </ul>
                <p>We'll be glad to assist you.</p>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
