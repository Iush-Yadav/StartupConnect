import Layout from '../../components/Layout/Layout';
import { motion } from 'framer-motion';
import { Users, MessageSquare, Shield, AlertTriangle } from 'lucide-react';

export default function GuidelinesPage() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-block p-3 bg-green-50 rounded-2xl mb-6">
            <Users className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Community Guidelines</h1>
          <p className="text-xl text-gray-600">
            Rules and best practices for our community
          </p>
        </motion.div>

        <div className="space-y-8">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Communication Standards</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-green-50">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-green-900">Guideline</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-green-900">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-green-100">
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">Respectful Dialogue</td>
                    <td className="px-6 py-4 text-sm text-gray-600">Maintain professional and courteous communication</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">Constructive Feedback</td>
                    <td className="px-6 py-4 text-sm text-gray-600">Provide helpful and actionable suggestions</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">Language Usage</td>
                    <td className="px-6 py-4 text-sm text-gray-600">Use clear, professional language free from harassment</td>
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
              <Shield className="h-6 w-6 text-green-600" />
              <h2 className="text-2xl font-semibold text-gray-900">Content Guidelines</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-900 mb-4">Acceptable Content</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start space-x-2">
                    <span className="text-green-600">✓</span>
                    <span>Original startup ideas and innovations</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-600">✓</span>
                    <span>Professional experiences and insights</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-600">✓</span>
                    <span>Industry news and updates</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-600">✓</span>
                    <span>Constructive discussions</span>
                  </li>
                </ul>
              </div>
              <div className="bg-red-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-red-900 mb-4">Prohibited Content</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start space-x-2">
                    <span className="text-red-600">✗</span>
                    <span>Spam or promotional content</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-red-600">✗</span>
                    <span>Hate speech or discrimination</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-red-600">✗</span>
                    <span>Personal attacks or harassment</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-red-600">✗</span>
                    <span>False or misleading information</span>
                  </li>
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
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
              <h2 className="text-2xl font-semibold text-gray-900">Violation Consequences</h2>
            </div>
            <div className="bg-yellow-50 rounded-lg p-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <h4 className="font-semibold text-yellow-900 mb-2">First Violation</h4>
                  <p className="text-sm text-gray-600">Warning and content removal if applicable</p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <h4 className="font-semibold text-yellow-900 mb-2">Second Violation</h4>
                  <p className="text-sm text-gray-600">Temporary account suspension (7 days)</p>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <h4 className="font-semibold text-yellow-900 mb-2">Third Violation</h4>
                  <p className="text-sm text-gray-600">Permanent account termination</p>
                </div>
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </Layout>
  );
}