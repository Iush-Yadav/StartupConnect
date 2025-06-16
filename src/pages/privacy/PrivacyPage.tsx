import Layout from '../../components/Layout/Layout';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Server } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-block p-3 bg-pink-50 rounded-2xl mb-6">
            <Shield className="h-12 w-12 text-pink-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-xl text-gray-600">
            How we handle and protect your data
          </p>
        </motion.div>

        <div className="space-y-8">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              <Lock className="h-6 w-6 text-pink-600" />
              <h2 className="text-2xl font-semibold text-gray-900">Data Collection & Security</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-pink-50">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-pink-900">Data Type</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-pink-900">Purpose</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-pink-900">Protection Measure</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pink-100">
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">Personal Information</td>
                    <td className="px-6 py-4 text-sm text-gray-600">Account creation and verification</td>
                    <td className="px-6 py-4 text-sm text-gray-600">End-to-end encryption</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">Usage Data</td>
                    <td className="px-6 py-4 text-sm text-gray-600">Service improvement</td>
                    <td className="px-6 py-4 text-sm text-gray-600">Anonymization</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">Financial Data</td>
                    <td className="px-6 py-4 text-sm text-gray-600">Transaction processing</td>
                    <td className="px-6 py-4 text-sm text-gray-600">Bank-level security</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              <Eye className="h-6 w-6 text-pink-600" />
              <h2 className="text-2xl font-semibold text-gray-900">Data Usage & Sharing</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-pink-50 rounded-lg p-4">
                <h3 className="font-semibold text-pink-900 mb-2">We Use Data For:</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Improving our services</li>
                  <li>• Personalizing user experience</li>
                  <li>• Communication about updates</li>
                  <li>• Security monitoring</li>
                </ul>
              </div>
              <div className="bg-pink-50 rounded-lg p-4">
                <h3 className="font-semibold text-pink-900 mb-2">We Never Share:</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Personal information without consent</li>
                  <li>• Financial details with third parties</li>
                  <li>• Private messages between users</li>
                  <li>• Sensitive account data</li>
                </ul>
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              <Server className="h-6 w-6 text-pink-600" />
              <h2 className="text-2xl font-semibold text-gray-900">Your Data Rights</h2>
            </div>
            <div className="prose max-w-none text-gray-600">
              <p className="mb-4">
                You have several rights regarding your personal data:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Access Rights</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Request a copy of your data</li>
                    <li>View your data usage history</li>
                    <li>Export your data</li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Control Rights</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Update your information</li>
                    <li>Delete your account</li>
                    <li>Opt out of communications</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </Layout>
  );
}