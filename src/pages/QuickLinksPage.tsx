import Layout from '../components/Layout/Layout';
import { motion } from 'framer-motion';
import { FileText, Shield, Book, Users, Rocket, Target, ArrowRight, Globe2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function QuickLinksPage() {
  const links = [
    {
      title: 'Documentation',
      description: 'Comprehensive guides and resources for using our platform',
      icon: <Book className="h-8 w-8 text-purple-600" />,
      path: '/docs'
    },
    {
      title: 'Investment Criteria',
      description: 'What global investors look for in emerging startups',
      icon: <Target className="h-8 w-8 text-pink-600" />,
      path: '/investment-criteria'
    },
    {
      title: 'Success Stories',
      description: 'Inspiring stories of successful startups from emerging markets',
      icon: <Rocket className="h-8 w-8 text-purple-600" />,
      path: '/success-stories'
    },
    {
      title: 'Community Guidelines',
      description: 'Best practices for our diverse global community',
      icon: <Users className="h-8 w-8 text-pink-600" />,
      path: '/guidelines'
    },
    {
      title: 'Terms of Service',
      description: 'Legal framework for using StartupConnect globally',
      icon: <FileText className="h-8 w-8 text-purple-600" />,
      path: '/terms'
    },
    {
      title: 'Privacy Policy',
      description: 'How we protect your data across borders',
      icon: <Shield className="h-8 w-8 text-pink-600" />,
      path: '/privacy'
    }
  ];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Global Startup Hub
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your gateway to the global startup ecosystem. Access region-specific resources, guidelines, and success stories from emerging markets worldwide.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {links.map((link, index) => (
            <motion.div
              key={link.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link
                to={link.path}
                className="group block h-full p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-purple-100 hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <div className="mb-6 flex items-center justify-between">
                  <div className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                    {link.icon}
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all duration-300" />
                </div>
                
                <h2 className="text-2xl font-semibold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
                  {link.title}
                </h2>
                
                <p className="text-gray-600">
                  {link.description}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-16 p-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Why Emerging Market Startups?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/80 p-6 rounded-xl">
              <h3 className="font-semibold text-purple-600 mb-2">Market Potential</h3>
              <p className="text-gray-600">Access to rapidly growing economies and untapped markets</p>
            </div>
            <div className="bg-white/80 p-6 rounded-xl">
              <h3 className="font-semibold text-purple-600 mb-2">Innovation Hub</h3>
              <p className="text-gray-600">Unique solutions addressing local and global challenges</p>
            </div>
            <div className="bg-white/80 p-6 rounded-xl">
              <h3 className="font-semibold text-purple-600 mb-2">Growth Trajectory</h3>
              <p className="text-gray-600">Fast-growing digital economies with increasing tech adoption</p>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}