import Layout from '../../components/Layout/Layout';
import { motion } from 'framer-motion';
import { Target, Users, Brain, Shield, Rocket, BarChart3, Globe2 } from 'lucide-react';

export default function InvestmentCriteriaPage() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-block p-3 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl mb-6">
            <Target className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Investment Criteria</h1>
          <p className="text-xl text-gray-600">
            What investors typically look for in promising startups
          </p>
        </motion.div>

        <div className="space-y-8">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <div className="flex items-center mb-6">
              <Users className="h-6 w-6 text-blue-600 mr-3" />
              <h2 className="text-2xl font-semibold text-gray-900">Strong Team</h2>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6">
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span><strong>Experience:</strong> Relevant industry experience and a track record of success</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span><strong>Complementary Skills:</strong> A diverse team with skills covering all critical business areas</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span><strong>Passion & Commitment:</strong> Dedication to the vision and willingness to overcome challenges</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span><strong>Adaptability:</strong> Ability to pivot and learn from feedback</span>
                </li>
              </ul>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <div className="flex items-center mb-6">
              <Globe2 className="h-6 w-6 text-purple-600 mr-3" />
              <h2 className="text-2xl font-semibold text-gray-900">Large Market Opportunity</h2>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6">
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  <span><strong>Total Addressable Market (TAM):</strong> A clear understanding of the market size and potential for expansion</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  <span><strong>Market Trends:</strong> Alignment with current or emerging market trends</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  <span><strong>Scalability:</strong> The potential for the business model to grow rapidly without proportional increases in cost</span>
                </li>
              </ul>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <div className="flex items-center mb-6">
              <Brain className="h-6 w-6 text-pink-600 mr-3" />
              <h2 className="text-2xl font-semibold text-gray-900">Innovative Product/Service</h2>
            </div>
            <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-lg p-6">
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-pink-600 mr-2">•</span>
                  <span><strong>Problem Solved:</strong> A clear articulation of the problem and how the solution uniquely addresses it</span>
                </li>
                <li className="flex items-start">
                  <span className="text-pink-600 mr-2">•</span>
                  <span><strong>Competitive Advantage:</strong> What makes the product/service stand out from competitors</span>
                </li>
                <li className="flex items-start">
                  <span className="text-pink-600 mr-2">•</span>
                  <span><strong>Traction:</strong> Early indicators of market acceptance, such as user growth, revenue, or successful pilot programs</span>
                </li>
              </ul>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <div className="flex items-center mb-6">
              <BarChart3 className="h-6 w-6 text-green-600 mr-3" />
              <h2 className="text-2xl font-semibold text-gray-900">Clear Business Model & Financials</h2>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6">
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  <span><strong>Revenue Model:</strong> How the company plans to make money</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  <span><strong>Financial Projections:</strong> Realistic and well-substantiated financial forecasts</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  <span><strong>Unit Economics:</strong> Understanding the cost and revenue associated with each customer or unit of product</span>
                </li>
              </ul>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <div className="flex items-center mb-6">
              <Rocket className="h-6 w-6 text-indigo-600 mr-3" />
              <h2 className="text-2xl font-semibold text-gray-900">Exit Strategy</h2>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg p-6">
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-indigo-600 mr-2">•</span>
                  <span><strong>Potential Acquirers:</strong> Identification of companies that might be interested in acquiring the startup</span>
                </li>
                <li className="flex items-start">
                  <span className="text-indigo-600 mr-2">•</span>
                  <span><strong>Market Conditions:</strong> Favorable conditions for future liquidity events</span>
                </li>
              </ul>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <div className="flex items-center mb-6">
              <Shield className="h-6 w-6 text-violet-600 mr-3" />
              <h2 className="text-2xl font-semibold text-gray-900">Defensibility</h2>
            </div>
            <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-lg p-6">
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-violet-600 mr-2">•</span>
                  <span><strong>Intellectual Property:</strong> Patents, trademarks, or trade secrets</span>
                </li>
                <li className="flex items-start">
                  <span className="text-violet-600 mr-2">•</span>
                  <span><strong>Network Effects:</strong> Value increases as more users join</span>
                </li>
                <li className="flex items-start">
                  <span className="text-violet-600 mr-2">•</span>
                  <span><strong>Brand Strength:</strong> A strong and recognizable brand</span>
                </li>
              </ul>
            </div>
          </motion.section>
        </div>
      </div>
    </Layout>
  );
}