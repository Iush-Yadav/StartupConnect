import Layout from '../../components/Layout/Layout';
import { motion } from 'framer-motion';
import { Book, Search, Users, MessageSquare } from 'lucide-react';

export default function DocumentationPage() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-block p-3 bg-blue-50 rounded-2xl mb-6">
            <Book className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Documentation</h1>
          <p className="text-xl text-gray-600">
            Comprehensive guides and resources for using our platform
          </p>
        </motion.div>

        <div className="space-y-8">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Getting Started</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-blue-50">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-blue-900">Topic</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-blue-900">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-100">
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">Account Setup</td>
                    <td className="px-6 py-4 text-sm text-gray-600">Create and configure your StartupConnect profile</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">Profile Optimization</td>
                    <td className="px-6 py-4 text-sm text-gray-600">Tips for creating an engaging profile that attracts connections</td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">Navigation Guide</td>
                    <td className="px-6 py-4 text-sm text-gray-600">Overview of platform features and how to use them</td>
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
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Platform Features</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 rounded-lg p-6">
                <Search className="h-6 w-6 text-blue-600 mb-4" />
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Search & Discovery</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Advanced search filters</li>
                  <li>• Industry categorization</li>
                  <li>• Trending startups</li>
                  <li>• Investment opportunities</li>
                </ul>
              </div>
              <div className="bg-blue-50 rounded-lg p-6">
                <Users className="h-6 w-6 text-blue-600 mb-4" />
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Networking</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Connection requests</li>
                  <li>• Direct messaging</li>
                  <li>• Group discussions</li>
                  <li>• Event participation</li>
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
              <MessageSquare className="h-6 w-6 text-blue-600" />
              <h2 className="text-2xl font-semibold text-gray-900">Communication Tools</h2>
            </div>
            <div className="prose max-w-none text-gray-600">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Messaging System</h4>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Real-time chat functionality</li>
                    <li>File sharing capabilities</li>
                    <li>Message organization</li>
                    <li>Notification settings</li>
                  </ul>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Collaboration Features</h4>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Project sharing</li>
                    <li>Document collaboration</li>
                    <li>Meeting scheduling</li>
                    <li>Progress tracking</li>
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