import Layout from '../components/Layout/Layout';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Calendar } from 'lucide-react';

export default function ContactPage() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Get in Touch
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Have questions, suggestions, or want to collaborate? I'd love to hear from you!
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-8"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Contact Information</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <a
              href="mailto:ydvayush27@gmail.com"
              className="flex items-center space-x-4 p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl hover:shadow-md transition-all duration-200 group"
            >
              <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Email Me</p>
                <p className="text-blue-600">ydvayush27@gmail.com</p>
              </div>
            </a>

            <a
              href="tel:+9779746577927"
              className="flex items-center space-x-4 p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl hover:shadow-md transition-all duration-200 group"
            >
              <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                <Phone className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Call Me</p>
                <p className="text-purple-600">+977 9746577927 (Whatsapp)</p>
                <p className="text-purple-600">+91 9867039853 (Mobile)</p>
              </div>
            </a>

            <a
              href="https://calendly.com/iush"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-4 p-6 bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl hover:shadow-md transition-all duration-200 group"
            >
              <div className="p-3 bg-pink-100 rounded-lg group-hover:bg-pink-200 transition-colors">
                <Calendar className="h-6 w-6 text-pink-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Schedule a Meeting</p>
                <p className="text-pink-600">Book a time slot</p>
              </div>
            </a>

            <div className="flex items-center space-x-4 p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <MapPin className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Location</p>
                <p className="text-indigo-600">Janakpurdham, Nepal</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}