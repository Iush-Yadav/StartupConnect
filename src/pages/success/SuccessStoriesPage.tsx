import Layout from '../../components/Layout/Layout';
import { motion } from 'framer-motion';
import { Rocket, TrendingUp, Award, Users } from 'lucide-react';

export default function SuccessStoriesPage() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-block p-3 bg-indigo-50 rounded-2xl mb-6">
            <Rocket className="h-12 w-12 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Success Stories</h1>
          <p className="text-xl text-gray-600">
            Inspiring journeys of startups that found success through our platform
          </p>
        </motion.div>

        <div className="space-y-8">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Featured Success Stories</h2>
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <TrendingUp className="h-8 w-8 text-indigo-600 mr-3" />
                  <h3 className="text-xl font-semibold text-gray-900">EcoTech Solutions</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">The Journey</h4>
                    <p className="text-gray-600">
                      Started as a small team with a vision for sustainable energy solutions.
                      Connected with key investors through StartupConnect, securing $2M in seed funding.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Key Achievements</h4>
                    <ul className="text-gray-600 space-y-1">
                      <li>• Expanded to 5 countries</li>
                      <li>• 100,000+ customers</li>
                      <li>• 300% YoY growth</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <Award className="h-8 w-8 text-purple-600 mr-3" />
                  <h3 className="text-xl font-semibold text-gray-900">HealthTech Innovations</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">The Journey</h4>
                    <p className="text-gray-600">
                      Revolutionized telemedicine with AI-powered diagnostics.
                      Found perfect match with healthcare-focused VCs through our platform.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Key Achievements</h4>
                    <ul className="text-gray-600 space-y-1">
                      <li>• $10M Series A funding</li>
                      <li>• 50+ hospital partnerships</li>
                      <li>• FDA approval obtained</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-md p-6"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Success Metrics</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-indigo-50 rounded-lg p-6 text-center">
                <div className="text-4xl font-bold text-indigo-600 mb-2">$50M+</div>
                <div className="text-gray-700">Total Funding Raised</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-6 text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">200+</div>
                <div className="text-gray-700">Successful Startups</div>
              </div>
              <div className="bg-pink-50 rounded-lg p-6 text-center">
                <div className="text-4xl font-bold text-pink-600 mb-2">1000+</div>
                <div className="text-gray-700">Jobs Created</div>
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
              <Users className="h-6 w-6 text-indigo-600" />
              <h2 className="text-2xl font-semibold text-gray-900">Testimonials</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  name: "Sarah Chen",
                  role: "Founder, EcoTech Solutions",
                  quote: "StartupConnect was instrumental in helping us find the right investors who shared our vision for sustainable technology."
                },
                {
                  name: "Michael Rodriguez",
                  role: "CEO, HealthTech Innovations",
                  quote: "The platform's network of healthcare-focused investors helped us secure the funding we needed to bring our innovation to market."
                }
              ].map((testimonial, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-6">
                  <blockquote className="text-gray-600 italic mb-4">"{testimonial.quote}"</blockquote>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                </div>
              ))}
            </div>
          </motion.section>
        </div>
      </div>
    </Layout>
  );
}