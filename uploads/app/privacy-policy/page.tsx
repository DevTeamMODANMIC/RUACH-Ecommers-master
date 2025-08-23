"use client"

import { useState, useEffect } from 'react';
import { BookUser, ShieldQuestion, Hand, Database, Users, Phone } from 'lucide-react';

const sections = [
  { id: 'introduction', title: 'Introduction', icon: BookUser },
  { id: 'information-we-collect', title: 'Information We Collect', icon: Database },
  { id: 'how-we-use-information', title: 'How We Use Your Information', icon: Hand },
  { id: 'data-protection', title: 'Data Protection', icon: ShieldQuestion },
  { id: 'sharing-of-information', title: 'Sharing of Information', icon: Users },
  { id: 'contact-us', title: 'Contact Us', icon: Phone },
];

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState('introduction');

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
          <h1 className="text-4xl font-bold text-gray-800">Privacy Policy</h1>
          <p className="text-lg text-gray-600 mt-2">Your privacy is important to us. Here's how we protect your data.</p>
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
            <section id="introduction" className="scroll-mt-24 bg-white p-8 rounded-xl shadow-sm border">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <BookUser className="h-6 w-6 mr-3 text-green-600" /> Introduction
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  At Ruach E-Store, we value your privacy and are committed to protecting your personal information. 
                  This Privacy Policy explains how we collect, use, and safeguard your data.
                </p>
              </div>
            </section>

            <section id="information-we-collect" className="scroll-mt-24 bg-white p-8 rounded-xl shadow-sm border">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <Database className="h-6 w-6 mr-3 text-green-600" /> Information We Collect
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>We may collect the following types of information when you shop with us:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Personal details: Name, email, phone number, delivery address.</li>
                  <li>Payment details: Card or bank information (processed securely by our payment partners).</li>
                  <li>Account details: Login credentials, order history, preferences.</li>
                  <li>Usage data: Device information, IP address, browsing activity on our website.</li>
                </ul>
              </div>
            </section>

            <section id="how-we-use-information" className="scroll-mt-24 bg-white p-8 rounded-xl shadow-sm border">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <Hand className="h-6 w-6 mr-3 text-green-600" /> How We Use Your Information
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>We use your information to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Process and deliver your orders.</li>
                  <li>Send order updates and customer support messages.</li>
                  <li>Improve our website, products, and services.</li>
                  <li>Send promotional offers (only if you opt in).</li>
                  <li>Prevent fraud and ensure secure transactions.</li>
                </ul>
              </div>
            </section>

            <section id="data-protection" className="scroll-mt-24 bg-white p-8 rounded-xl shadow-sm border">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <ShieldQuestion className="h-6 w-6 mr-3 text-green-600" /> Data Protection
              </h2>
              <div className="space-y-4 text-gray-700">
                <ul className="list-disc pl-6 space-y-2">
                  <li>Your payment information is encrypted and processed securely.</li>
                  <li>We do not store sensitive card details.</li>
                  <li>Access to your personal data is restricted to authorized staff only.</li>
                </ul>
              </div>
            </section>

            <section id="sharing-of-information" className="scroll-mt-24 bg-white p-8 rounded-xl shadow-sm border">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <Users className="h-6 w-6 mr-3 text-green-600" /> Sharing of Information
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>We do not sell or rent your personal data.</p>
                <p>We may share limited information with:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Delivery partners to ship your orders.</li>
                  <li>Payment processors for secure transactions.</li>
                </ul>
              </div>
            </section>

            <section id="contact-us" className="scroll-mt-24 bg-white p-8 rounded-xl shadow-sm border">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <Phone className="h-6 w-6 mr-3 text-green-600" /> Contact Us
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>If you have any questions about our Privacy Policy, please contact us:</p>
                <ul className="list-none space-y-2">
                  <li>Email: support@ruachestore.com.ng</li>
                  <li>Phone/WhatsApp: <a href="https://wa.me/2348160662997" className="text-green-600 hover:text-green-700">+234 816 066 2997</a></li>
                </ul>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
