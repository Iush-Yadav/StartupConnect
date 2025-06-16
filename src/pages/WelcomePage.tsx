import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Rocket, Sparkles, Zap, ArrowRight, Eye } from 'lucide-react';

export default function WelcomePage() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Animated Background Beams */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Falling Beam 1 */}
        <motion.div
          className="absolute w-3 bg-gradient-to-b from-transparent via-pink-400 to-transparent"
          style={{
            height: '200vh',
            left: '10%',
            top: '-100vh',
          }}
          animate={{
            y: ['0vh', '200vh'],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'linear',
            delay: 0,
          }}
        />
        
        {/* Falling Beam 2 */}
        <motion.div
          className="absolute w-3 bg-gradient-to-b from-transparent via-purple-400 to-transparent"
          style={{
            height: '200vh',
            left: '25%',
            top: '-100vh',
          }}
          animate={{
            y: ['0vh', '200vh'],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'linear',
            delay: 2,
          }}
        />

        {/* Falling Beam 3 */}
        <motion.div
          className="absolute w-3 bg-gradient-to-b from-transparent via-blue-400 to-transparent"
          style={{
            height: '200vh',
            left: '40%',
            top: '-100vh',
          }}
          animate={{
            y: ['0vh', '200vh'],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'linear',
            delay: 4,
          }}
        />

        {/* Falling Beam 4 */}
        <motion.div
          className="absolute w-3 bg-gradient-to-b from-transparent via-indigo-400 to-transparent"
          style={{
            height: '200vh',
            left: '60%',
            top: '-100vh',
          }}
          animate={{
            y: ['0vh', '200vh'],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: 'linear',
            delay: 1,
          }}
        />

        {/* Falling Beam 5 */}
        <motion.div
          className="absolute w-3 bg-gradient-to-b from-transparent via-rose-400 to-transparent"
          style={{
            height: '200vh',
            left: '75%',
            top: '-100vh',
          }}
          animate={{
            y: ['0vh', '200vh'],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: 11,
            repeat: Infinity,
            ease: 'linear',
            delay: 3,
          }}
        />

        {/* Falling Beam 6 */}
        <motion.div
          className="absolute w-3 bg-gradient-to-b from-transparent via-violet-400 to-transparent"
          style={{
            height: '200vh',
            left: '90%',
            top: '-100vh',
          }}
          animate={{
            y: ['0vh', '200vh'],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: 'linear',
            delay: 5,
          }}
        />

        {/* Additional Thicker Beams */}
        <motion.div
          className="absolute w-4 bg-gradient-to-b from-transparent via-pink-500 to-transparent"
          style={{
            height: '200vh',
            left: '15%',
            top: '-100vh',
          }}
          animate={{
            y: ['0vh', '200vh'],
            opacity: [0, 0.9, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'linear',
            delay: 6,
          }}
        />

        <motion.div
          className="absolute w-4 bg-gradient-to-b from-transparent via-purple-500 to-transparent"
          style={{
            height: '200vh',
            left: '85%',
            top: '-100vh',
          }}
          animate={{
            y: ['0vh', '200vh'],
            opacity: [0, 0.9, 0],
          }}
          transition={{
            duration: 13,
            repeat: Infinity,
            ease: 'linear',
            delay: 7,
          }}
        />

        {/* New Diagonal Beams */}
        <motion.div
          className="absolute w-3 bg-gradient-to-b from-transparent via-cyan-400 to-transparent"
          style={{
            height: '200vh',
            left: '35%',
            top: '-100vh',
            transform: 'rotate(15deg)',
          }}
          animate={{
            y: ['0vh', '200vh'],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: 'linear',
            delay: 8,
          }}
        />

        <motion.div
          className="absolute w-3 bg-gradient-to-b from-transparent via-fuchsia-400 to-transparent"
          style={{
            height: '200vh',
            left: '65%',
            top: '-100vh',
            transform: 'rotate(-15deg)',
          }}
          animate={{
            y: ['0vh', '200vh'],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: 'linear',
            delay: 9,
          }}
        />

        {/* Floating Particles with More Colors */}
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-2 h-2 rounded-full ${
              ['bg-pink-400', 'bg-purple-400', 'bg-blue-400', 'bg-indigo-400', 'bg-rose-400', 'bg-violet-400', 'bg-cyan-400', 'bg-fuchsia-400'][i % 8]
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.4, 0.9, 0.4],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 text-center">
        {/* Logo and Brand */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-pink-300 to-purple-300 rounded-full blur opacity-50"></div>
              <div className="relative flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-200 to-purple-300 rounded-full">
                <Rocket className="h-8 w-8 text-purple-800 transform -rotate-45" />
                <Sparkles className="absolute h-4 w-4 text-yellow-500 top-1 right-1 animate-pulse" />
                <Zap className="absolute h-4 w-4 text-blue-500 bottom-1 left-1 animate-pulse" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Heading with Cursive Font */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight"
          style={{ fontFamily: 'Dancing Script, cursive' }}
        >
          Welcome to{' '}
          <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
            StartupConnect
          </span>
        </motion.h1>

        {/* Subtitle with Cursive Font */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.1 }}
          className="text-xl md:text-2xl lg:text-3xl text-gray-700 mb-12 max-w-3xl leading-relaxed"
          style={{ fontFamily: 'Dancing Script, cursive' }}
        >
          Launch Your Vision
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.4 }}
          className="flex flex-col sm:flex-row gap-6 mb-16"
        >
          {/* Register Button */}
          <Link
            to="/register"
            className="group relative px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-full text-lg transition-all duration-300 hover:from-pink-600 hover:to-purple-700 hover:scale-105 hover:shadow-2xl transform"
          >
            <span className="relative z-10 flex items-center space-x-2">
              <span>Register</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Link>

          {/* Let's Go Button */}
          <Link
            to="/home"
            className="group relative px-8 py-4 bg-white/20 backdrop-blur-sm text-gray-800 font-semibold rounded-full text-lg border-2 border-purple-200 transition-all duration-300 hover:bg-white/30 hover:border-purple-300 hover:scale-105 hover:shadow-2xl transform"
          >
            <span className="relative z-10 flex items-center space-x-2">
              <ArrowRight className="h-5 w-5" />
              <span>Let's Go</span>
            </span>
          </Link>
        </motion.div>

        {/* Footer Credit */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <p className="text-gray-600 text-xl md:text-2xl" style={{ fontFamily: 'Dancing Script, cursive' }}>
            Ayush Yadav
          </p>
        </motion.div>
      </div>

      {/* Gradient Overlays for Better Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/20 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-transparent to-pink-900/20 pointer-events-none"></div>
    </div>
  );
}