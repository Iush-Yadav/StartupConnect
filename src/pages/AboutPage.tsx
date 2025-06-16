import Layout from '../components/Layout/Layout';
import { motion } from 'framer-motion';
import { Rocket, Users, Target, TrendingUp } from 'lucide-react';

export default function AboutPage() {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent break-words">
            About StartupConnect
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto break-words">
            Empowering entrepreneurs and investors to build the future together. We're creating
            a vibrant ecosystem where innovative ideas meet strategic capital.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 mb-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-2xl shadow-lg"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 break-words">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed break-words">
              To democratize access to startup funding and mentorship, creating a world where
              great ideas can flourish regardless of their origin. We believe in the power of
              connection and collaboration to drive innovation forward.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-2xl shadow-lg"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 break-words">Our Vision</h2>
            <p className="text-gray-600 leading-relaxed break-words">
              To become the leading platform where startups and investors connect, collaborate,
              and create successful ventures together. We envision a future where every
              innovative idea has the opportunity to become reality.
            </p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-4 gap-8 mb-20">
          {[
            {
              icon: <Rocket className="h-8 w-8 text-blue-600" />,
              title: "Innovation First",
              description: "Supporting groundbreaking ideas and solutions"
            },
            {
              icon: <Users className="h-8 w-8 text-purple-600" />,
              title: "Community Driven",
              description: "Building strong networks and relationships"
            },
            {
              icon: <Target className="h-8 w-8 text-pink-600" />,
              title: "Goal Oriented",
              description: "Focused on achieving measurable success"
            },
            {
              icon: <TrendingUp className="h-8 w-8 text-indigo-600" />,
              title: "Growth Mindset",
              description: "Continuously evolving and improving"
            }
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 * index }}
              className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="mb-4 inline-block p-3 bg-gray-50 rounded-full">
                {item.icon}
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 break-words">{item.title}</h3>
              <p className="text-gray-600 break-words">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </Layout>
  );
}