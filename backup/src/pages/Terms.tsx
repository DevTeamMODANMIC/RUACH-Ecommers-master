import { useState, useEffect } from 'react';
import { Book, CheckSquare, ShoppingCart, Truck, CircleDollarSign, Repeat, User, Shield, Globe, Phone, AlertTriangle } from 'lucide-react';

const sections = [
  { id: 'introduction', title: 'Introduction', icon: Book },
  { id: 'eligibility', title: 'Eligibility', icon: CheckSquare },
  { id: 'products-orders', title: 'Products & Orders', icon: ShoppingCart },
  { id: 'pricing-payment', title: 'Pricing & Payment', icon: CircleDollarSign },
  { id: 'shipping-delivery', title: 'Shipping & Delivery', icon: Truck },
  { id: 'returns-refunds', title: 'Returns & Refunds', icon: Repeat },
  { id: 'user-responsibilities', title: 'User Responsibilities', icon: User },
  { id: 'intellectual-property', title: 'Intellectual Property', icon: Shield },
  { id: 'limitation-of-liability', title: 'Limitation of Liability', icon: Globe },
  { id: 'termination', title: 'Termination', icon: AlertTriangle },
  { id: 'changes-to-terms', title: 'Changes to Terms', icon: Book },
  { id: 'governing-law', title: 'Governing Law', icon: Globe },
  { id: 'contact-us', title: 'Contact Us', icon: Phone },
];

export default function TermsAndConditionsPage() {
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
          <h1 className="text-4xl font-bold text-gray-800">Terms & Conditions</h1>
          <p className="text-lg text-gray-600 mt-2">Please read our terms carefully before using our services.</p>
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
                <Book className="h-6 w-6 mr-3 text-green-600" /> 1. Introduction
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>
                  Welcome to Ruach E-Store. By accessing or using our website and services, you agree to be bound by these Terms & Conditions. Please read them carefully.
                </p>
                <p>These Terms & Conditions govern the use of Ruach E-Store&apos;s website, products, and services. By placing an order with us, you agree to these terms along with our Privacy Policy, Shipping & Delivery Policy, and Returns & Refunds Policy.</p>
              </div>
            </section>

            <section id="eligibility" className="scroll-mt-24 bg-white p-8 rounded-xl shadow-sm border">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <CheckSquare className="h-6 w-6 mr-3 text-green-600" /> 2. Eligibility
              </h2>
              <div className="space-y-4 text-gray-700">
                <ul className="list-disc pl-6 space-y-2">
                  <li>You must be at least 18 years old or have parental/guardian consent to use our services.</li>
                  <li>By using our site, you confirm that all information you provide is accurate and complete.</li>
                </ul>
              </div>
            </section>

            <section id="products-orders" className="scroll-mt-24 bg-white p-8 rounded-xl shadow-sm border">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <ShoppingCart className="h-6 w-6 mr-3 text-green-600" /> 3. Products & Orders
              </h2>
              <div className="space-y-4 text-gray-700">
                <ul className="list-disc pl-6 space-y-2">
                  <li>We make every effort to display product details, descriptions, and prices accurately.</li>
                  <li>All orders are subject to availability. If a product is unavailable, we will notify you and offer alternatives or a refund.</li>
                  <li>Placing an order means you agree to pay the stated price (including shipping and applicable fees).</li>
                </ul>
              </div>
            </section>

            <section id="pricing-payment" className="scroll-mt-24 bg-white p-8 rounded-xl shadow-sm border">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <CircleDollarSign className="h-6 w-6 mr-3 text-green-600" /> 4. Pricing & Payment
              </h2>
              <div className="space-y-4 text-gray-700">
                <ul className="list-disc pl-6 space-y-2">
                  <li>Prices are listed in Nigerian Naira (₦) unless otherwise stated.</li>
                  <li>We reserve the right to change prices at any time without prior notice.</li>
                  <li>Payment must be completed before your order is processed.</li>
                  <li>We accept payment methods displayed on the checkout page.</li>
                </ul>
              </div>
            </section>

            <section id="shipping-delivery" className="scroll-mt-24 bg-white p-8 rounded-xl shadow-sm border">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <Truck className="h-6 w-6 mr-3 text-green-600" /> 5. Shipping & Delivery
              </h2>
              <div className="space-y-4 text-gray-700">
                <ul className="list-disc pl-6 space-y-2">
                  <li>Delivery timelines are estimates and may vary due to courier delays or external factors.</li>
                  <li>Risk of loss or damage passes to you once your order has been delivered to your specified address.</li>
                  <li>For full details, see our Shipping & Delivery Policy.</li>
                </ul>
              </div>
            </section>

            <section id="returns-refunds" className="scroll-mt-24 bg-white p-8 rounded-xl shadow-sm border">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <Repeat className="h-6 w-6 mr-3 text-green-600" /> 6. Returns & Refunds
              </h2>
              <div className="space-y-4 text-gray-700">
                <ul className="list-disc pl-6 space-y-2">
                  <li>Returns and refunds are subject to our Returns & Refunds Policy.</li>
                  <li>Certain items may not be eligible for return (e.g., personal care products, food, or clearance sales).</li>
                </ul>
              </div>
            </section>

            <section id="user-responsibilities" className="scroll-mt-24 bg-white p-8 rounded-xl shadow-sm border">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <User className="h-6 w-6 mr-3 text-green-600" /> 7. User Responsibilities
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>When using our website, you agree to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide accurate and up-to-date information.</li>
                  <li>Not engage in fraudulent activity, abuse, or misuse of our services.</li>
                  <li>Not attempt to interfere with the security or operation of the website.</li>
                </ul>
              </div>
            </section>

            <section id="intellectual-property" className="scroll-mt-24 bg-white p-8 rounded-xl shadow-sm border">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <Shield className="h-6 w-6 mr-3 text-green-600" /> 8. Intellectual Property
              </h2>
              <div className="space-y-4 text-gray-700">
                <ul className="list-disc pl-6 space-y-2">
                  <li>All content on Ruach E-Store (logos, images, text, graphics, and designs) is owned by or licensed to us.</li>
                  <li>You may not copy, reproduce, distribute, or use our content without written permission.</li>
                </ul>
              </div>
            </section>

            <section id="limitation-of-liability" className="scroll-mt-24 bg-white p-8 rounded-xl shadow-sm border">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <Globe className="h-6 w-6 mr-3 text-green-600" /> 9. Limitation of Liability
              </h2>
              <div className="space-y-4 text-gray-700">
                <ul className="list-disc pl-6 space-y-2">
                  <li>Ruach E-Store will not be liable for indirect, incidental, or consequential damages arising from your use of our website or services.</li>
                  <li>We are not responsible for delays, losses, or damages caused by third-party courier services.</li>
                </ul>
              </div>
            </section>

            <section id="termination" className="scroll-mt-24 bg-white p-8 rounded-xl shadow-sm border">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <AlertTriangle className="h-6 w-6 mr-3 text-red-500" /> 10. Termination
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>We may suspend or terminate your access to Ruach E-Store if you violate these Terms & Conditions or engage in fraudulent activity.</p>
              </div>
            </section>

            <section id="changes-to-terms" className="scroll-mt-24 bg-white p-8 rounded-xl shadow-sm border">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <Book className="h-6 w-6 mr-3 text-green-600" /> 11. Changes to Terms
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>Ruach E-Store reserves the right to update or modify these Terms & Conditions at any time. Updates will be posted on this page with a revised date. Continued use of our services after changes means you accept the new terms.</p>
              </div>
            </section>

            <section id="governing-law" className="scroll-mt-24 bg-white p-8 rounded-xl shadow-sm border">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <Globe className="h-6 w-6 mr-3 text-green-600" /> 12. Governing Law
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>These Terms & Conditions shall be governed by and interpreted in accordance with the laws of the Federal Republic of Nigeria.</p>
              </div>
            </section>

            <section id="contact-us" className="scroll-mt-24 bg-white p-8 rounded-xl shadow-sm border">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <Phone className="h-6 w-6 mr-3 text-green-600" /> 13. Contact Us
              </h2>
              <div className="space-y-4 text-gray-700">
                <p>If you have questions about these Terms & Conditions, please reach out to us:</p>
                <ul className="list-none space-y-2">
                  <li>Email: legal@ruachestore.com.ng</li>
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
