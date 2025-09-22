import { useState } from 'react';

import { 
  Save, 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  FileText, 
  Shield, 
  HelpCircle,
  Settings,
  Globe,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
}

interface ContactInfo {
  email: string;
  phone: string;
  address: string;
  supportHours: string;
}

const PlatformSettingsPage = () => {
  const [activeTab, setActiveTab] = useState('terms');
  const [isLoading, setIsLoading] = useState(false);
  
  // Terms & Conditions State
  const [termsContent, setTermsContent] = useState(`Welcome to RentACar Platform

1. ACCEPTANCE OF TERMS
By accessing and using this platform, you accept and agree to be bound by the terms and provision of this agreement.

2. VEHICLE RENTAL AGREEMENT
- All vehicle rentals are subject to availability
- Renters must be at least 21 years old
- Valid driver's license required
- Security deposit may be required

3. PAYMENT TERMS
- Payment is due at time of booking
- Cancellation fees may apply
- Refunds processed within 5-7 business days

4. LIABILITY
- Renters are responsible for any damages
- Insurance coverage details available upon request
- Platform acts as intermediary between owners and renters

5. PROHIBITED USES
- Commercial use without permission
- Subletting vehicles to third parties
- Use for illegal activities

Last updated: December 2024`);

  // Privacy Policy State
  const [privacyContent, setPrivacyContent] = useState(`Privacy Policy

DATA COLLECTION
We collect information you provide directly to us, such as when you create an account, make a booking, or contact us.

INFORMATION WE COLLECT:
- Personal identification information (name, email, phone)
- Payment information (processed securely)
- Vehicle preferences and rental history
- Location data when using our services

HOW WE USE YOUR INFORMATION:
- To provide and maintain our services
- To process transactions and send confirmations
- To improve our platform and user experience
- To communicate with you about your account

DATA SHARING:
- We do not sell your personal information
- Information shared with vehicle owners only for booking purposes
- Third-party service providers bound by confidentiality agreements

DATA SECURITY:
- Industry-standard encryption for data transmission
- Regular security audits and updates
- Limited access to personal information

YOUR RIGHTS:
- Access and update your information
- Request deletion of your account
- Opt-out of marketing communications

Contact us at privacy@rentacar.com for questions about this policy.

Last updated: December 2024`);

  // FAQs State
  const [faqs, setFaqs] = useState<FAQ[]>([
    {
      id: 1,
      question: "How do I book a vehicle?",
      answer: "Simply search for available vehicles in your area, select your preferred car, choose your dates, and complete the booking process with payment.",
      category: "Booking"
    },
    {
      id: 2,
      question: "What documents do I need to rent a car?",
      answer: "You need a valid driver's license, credit card, and must be at least 21 years old. Additional ID may be required.",
      category: "Requirements"
    },
    {
      id: 3,
      question: "Can I cancel my booking?",
      answer: "Yes, you can cancel your booking. Cancellation fees may apply depending on how close to the rental date you cancel.",
      category: "Cancellation"
    },
    {
      id: 4,
      question: "What happens if the car breaks down?",
      answer: "Contact our 24/7 support immediately. We'll arrange for roadside assistance or a replacement vehicle if needed.",
      category: "Support"
    },
    {
      id: 5,
      question: "How do I become a car owner on the platform?",
      answer: "Register as a vehicle owner, verify your identity, add your vehicle details with photos, and set your rental rates.",
      category: "Vehicle Owners"
    }
  ]);

  // Contact Information State
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    email: 'support@rentacar.com',
    phone: '+1 (555) 123-4567',
    address: '123 Main Street, City, State 12345',
    supportHours: '24/7 Customer Support Available'
  });

  // New FAQ form state
  const [newFaq, setNewFaq] = useState({ question: '', answer: '', category: 'General' });
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);

  const handleSave = async (section: string) => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      alert(`${section} saved successfully!`);
    }, 1000);
  };

  const addFaq = () => {
    if (newFaq.question.trim() && newFaq.answer.trim()) {
      const faq: FAQ = {
        id: Date.now(),
        ...newFaq
      };
      setFaqs([...faqs, faq]);
      setNewFaq({ question: '', answer: '', category: 'General' });
    }
  };

  const deleteFaq = (id: number) => {
    setFaqs(faqs.filter(faq => faq.id !== id));
  };

  const startEditFaq = (faq: FAQ) => {
    setEditingFaq(faq);
  };

  const saveEditFaq = () => {
    if (editingFaq) {
      setFaqs(faqs.map(faq => faq.id === editingFaq.id ? editingFaq : faq));
      setEditingFaq(null);
    }
  };

  const tabs = [
    { id: 'terms', label: 'Terms & Conditions', icon: FileText },
    { id: 'privacy', label: 'Privacy Policy', icon: Shield },
    { id: 'faqs', label: 'FAQs', icon: HelpCircle },
    { id: 'contact', label: 'Contact Info', icon: Globe },
  ];

  return (
    
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Settings className="mr-3 text-blue-600" />
            Platform Settings & Content
          </h1>
          <p className="text-gray-600 mt-2">Manage platform-wide settings, terms, privacy policy, and FAQs</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Terms & Conditions Tab */}
            {activeTab === 'terms' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Terms & Conditions</h2>
                  <button
                    onClick={() => handleSave('Terms & Conditions')}
                    disabled={isLoading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
                <textarea
                  value={termsContent}
                  onChange={(e) => setTermsContent(e.target.value)}
                  rows={20}
                  className="w-full border border-gray-300 rounded-lg p-4 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter terms and conditions content..."
                />
              </div>
            )}

            {/* Privacy Policy Tab */}
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Privacy Policy</h2>
                  <button
                    onClick={() => handleSave('Privacy Policy')}
                    disabled={isLoading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
                <textarea
                  value={privacyContent}
                  onChange={(e) => setPrivacyContent(e.target.value)}
                  rows={20}
                  className="w-full border border-gray-300 rounded-lg p-4 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter privacy policy content..."
                />
              </div>
            )}

            {/* FAQs Tab */}
            {activeTab === 'faqs' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Frequently Asked Questions</h2>
                  <button
                    onClick={() => handleSave('FAQs')}
                    disabled={isLoading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isLoading ? 'Saving...' : 'Save All FAQs'}
                  </button>
                </div>

                {/* Add New FAQ */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h3 className="font-medium text-gray-900 mb-4 flex items-center">
                    <Plus className="w-4 h-4 mr-2" />
                    Add New FAQ
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <select
                      value={newFaq.category}
                      onChange={(e) => setNewFaq({ ...newFaq, category: e.target.value })}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="General">General</option>
                      <option value="Booking">Booking</option>
                      <option value="Requirements">Requirements</option>
                      <option value="Cancellation">Cancellation</option>
                      <option value="Support">Support</option>
                      <option value="Vehicle Owners">Vehicle Owners</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Enter question"
                      value={newFaq.question}
                      onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                      className="md:col-span-2 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <textarea
                    placeholder="Enter answer"
                    value={newFaq.answer}
                    onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
                  />
                  <button
                    onClick={addFaq}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add FAQ
                  </button>
                </div>

                {/* FAQ List */}
                <div className="space-y-4">
                  {faqs.map((faq) => (
                    <div key={faq.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      {editingFaq?.id === faq.id ? (
                        <div className="space-y-4">
                          <select
                            value={editingFaq.category}
                            onChange={(e) => setEditingFaq({ ...editingFaq, category: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="General">General</option>
                            <option value="Booking">Booking</option>
                            <option value="Requirements">Requirements</option>
                            <option value="Cancellation">Cancellation</option>
                            <option value="Support">Support</option>
                            <option value="Vehicle Owners">Vehicle Owners</option>
                          </select>
                          <input
                            type="text"
                            value={editingFaq.question}
                            onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <textarea
                            value={editingFaq.answer}
                            onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                            rows={3}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <div className="flex space-x-2">
                            <button
                              onClick={saveEditFaq}
                              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingFaq(null)}
                              className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-between items-start mb-3">
                            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                              {faq.category}
                            </span>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => startEditFaq(faq)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteFaq(faq.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <h4 className="font-medium text-gray-900 mb-2">{faq.question}</h4>
                          <p className="text-gray-600 text-sm">{faq.answer}</p>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Information Tab */}
            {activeTab === 'contact' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Contact Information</h2>
                  <button
                    onClick={() => handleSave('Contact Information')}
                    disabled={isLoading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <Mail className="w-4 h-4 mr-2" />
                        Support Email
                      </label>
                      <input
                        type="email"
                        value={contactInfo.email}
                        onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <Phone className="w-4 h-4 mr-2" />
                        Support Phone
                      </label>
                      <input
                        type="tel"
                        value={contactInfo.phone}
                        onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        Business Address
                      </label>
                      <textarea
                        value={contactInfo.address}
                        onChange={(e) => setContactInfo({ ...contactInfo, address: e.target.value })}
                        rows={3}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Support Hours
                      </label>
                      <input
                        type="text"
                        value={contactInfo.supportHours}
                        onChange={(e) => setContactInfo({ ...contactInfo, supportHours: e.target.value })}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformSettingsPage;