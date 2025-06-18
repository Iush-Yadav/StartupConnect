import Layout from '../../components/Layout/Layout';
import { motion } from 'framer-motion';
import { FileText, Check } from 'lucide-react';

export default function TermsPage() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-block p-3 bg-purple-50 rounded-2xl mb-6">
            <FileText className="h-12 w-12 text-purple-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-xl text-gray-600">
            Our terms and conditions for using StartupConnect
          </p>
        </motion.div>

        <div className="space-y-8">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">User Rights & Responsibilities</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-purple-50">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-purple-900">Right/Responsibility</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-purple-900">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-100">
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">Account Security</td>
                    <td className="px-6 py-4 text-sm text-gray-600">Users are responsible for maintaining the security of their account credentials</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">Content Ownership</td>
                    <td className="px-6 py-4 text-sm text-gray-600">Users retain ownership of their original content while granting us license to display it</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">Platform Access</td>
                    <td className="px-6 py-4 text-sm text-gray-600">Users have the right to access and use platform features as per their account type</td>
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
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Prohibited Activities</h2>
            <ul className="space-y-3">
              {[
                'Sharing false or misleading information',
                'Harassment or abuse of other users',
                'Unauthorized access to other accounts',
                'Spam or excessive self-promotion',
                'Distribution of malware or harmful code',
                'Violation of intellectual property rights'
              ].map((item, index) => (
                <li key={index} className="flex items-center space-x-3 text-gray-700">
                  <Check className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Account Termination</h2>
            <div className="prose max-w-none text-gray-600">
              <p className="mb-4">
                We reserve the right to terminate or suspend accounts that violate our terms of service. 
                Termination may occur under the following circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Repeated violations of our community guidelines</li>
                <li>Fraudulent or illegal activities</li>
                <li>Non-payment of fees (if applicable)</li>
                <li>Extended period of account inactivity</li>
                <li>At user's request</li>
              </ul>
              <p className="mt-4">
                Upon termination, users may have limited time to export their data before it is permanently removed 
                from our systems.
              </p>
            </div>
          </motion.section>
        </div>
      </div>
    </Layout>
  );
}