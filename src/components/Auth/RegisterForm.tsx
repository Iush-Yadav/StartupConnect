import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../lib/store';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';
import { X, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { AuthApiError } from '@supabase/supabase-js';

export default function RegisterForm() {
  const navigate = useNavigate();
  const register = useStore(state => state.register);
  const [step, setStep] = useState(1);
  const [showTerms, setShowTerms] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Validation states
  const [usernameValidation, setUsernameValidation] = useState<{
    status: 'idle' | 'checking' | 'available' | 'taken' | 'invalid';
    message: string;
  }>({ status: 'idle', message: '' });
  
  const [emailValidation, setEmailValidation] = useState<{
    status: 'idle' | 'checking' | 'available' | 'taken' | 'invalid';
    message: string;
  }>({ status: 'idle', message: '' });

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    username: '',
    userType: 'entrepreneur' as 'entrepreneur' | 'investor',
    bio: '',
    location: '',
    industry: '',
    foundedYear: new Date().getFullYear(),
    teamSize: 1,
    investmentRange: '',
    // Entrepreneur specific fields
    startupStage: '',
    fundingStage: '',
    businessModel: '',
    targetMarket: '',
    // Investor specific fields
    investmentFocus: '',
    investmentExperience: '',
    preferredIndustries: '',
    investmentCriteria: '',
    socialLinks: {
      twitter: '',
      linkedin: '',
      website: '',
    },
    acceptedTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Enhanced email validation
  const validateEmailFormat = (email: string): { isValid: boolean; message: string } => {
    if (!email) return { isValid: false, message: '' };

    // Basic format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, message: 'Invalid email format' };
    }

    // Check for common disposable email domains
    const disposableDomains = [
      '10minutemail.com', 'tempmail.org', 'guerrillamail.com', 'mailinator.com',
      'yopmail.com', 'temp-mail.org', 'throwaway.email', 'getnada.com',
      'maildrop.cc', 'sharklasers.com', 'guerrillamailblock.com', 'pokemail.net',
      'spam4.me', 'bccto.me', 'chacuo.net', 'dispostable.com', 'emailondeck.com',
      'fakeinbox.com', 'hide.biz.st', 'mytrashmail.com', 'nobulk.com',
      'sogetthis.com', 'spamherelots.com', 'superrito.com', 'zoemail.org'
    ];

    const domain = email.split('@')[1]?.toLowerCase();
    if (disposableDomains.includes(domain)) {
      return { isValid: false, message: 'Disposable email addresses are not allowed' };
    }

    // Check for suspicious patterns
    if (email.includes('+')) {
      return { isValid: false, message: 'Email aliases with + are not allowed' };
    }

    // Check for common typos in popular domains
    const commonDomainTypos: { [key: string]: string } = {
      'gmial.com': 'gmail.com',
      'gmai.com': 'gmail.com',
      'yahooo.com': 'yahoo.com',
      'hotmial.com': 'hotmail.com',
      'outlok.com': 'outlook.com',
      'icloud.co': 'icloud.com'
    };

    if (domain && commonDomainTypos[domain]) {
      return { isValid: false, message: `Did you mean ${commonDomainTypos[domain]}?` };
    }

    // Check for minimum domain requirements
    if (domain && domain.split('.').length < 2) {
      return { isValid: false, message: 'Invalid domain format' };
    }

    // Check for valid TLD
    const tld = domain?.split('.').pop();
    if (tld && tld.length < 2) {
      return { isValid: false, message: 'Invalid top-level domain' };
    }

    return { isValid: true, message: 'Email format is valid' };
  };

  // Debounced validation for username
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formData.username && formData.username.length >= 3) {
        checkUsernameAvailability(formData.username);
      } else if (formData.username && formData.username.length > 0 && formData.username.length < 3) {
        setUsernameValidation({
          status: 'invalid',
          message: 'Username must be at least 3 characters long'
        });
      } else {
        setUsernameValidation({ status: 'idle', message: '' });
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.username]);

  const checkUsernameAvailability = async (username: string) => {
    setUsernameValidation({ status: 'checking', message: 'Checking availability...' });
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .maybeSingle();

      if (error) {
        console.error('Error checking username:', error);
        setUsernameValidation({
          status: 'invalid',
          message: 'Unable to check username availability'
        });
        return;
      }

      if (data) {
        setUsernameValidation({
          status: 'taken',
          message: 'This username is already taken'
        });
      } else {
        setUsernameValidation({
          status: 'available',
          message: 'Username is available'
        });
      }
    } catch (err) {
      console.error('Username check error:', err);
      setUsernameValidation({
        status: 'invalid',
        message: 'Unable to check username availability'
      });
    }
  };

  const checkEmailAvailability = async (email: string) => {
    setEmailValidation({ status: 'checking', message: 'Checking availability...' });
    
    try {
      // First validate email format
      const emailFormatValidation = validateEmailFormat(email);
      if (!emailFormatValidation.isValid) {
        setEmailValidation({
          status: 'invalid',
          message: emailFormatValidation.message
        });
        return;
      }

      // Check if email exists in profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email.toLowerCase().trim())
        .maybeSingle();

      if (error) {
        console.error('Error checking email in profiles:', error);
        setEmailValidation({
          status: 'invalid',
          message: 'Unable to check email availability'
        });
        return;
      }

      if (data) {
        // Email found in profiles table, it's taken
        setEmailValidation({
          status: 'taken',
          message: 'This email is already registered'
        });
      } else {
        // Email not found in profiles, assume it's available
        setEmailValidation({
          status: 'available',
          message: 'Email is available'
        });
      }

    } catch (err) {
      console.error('Email check error (outer catch):', err);
      setEmailValidation({
        status: 'invalid',
        message: 'Unable to check email availability'
      });
    }
  };

  // Debounced validation for email
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formData.email) {
        checkEmailAvailability(formData.email);
      } else {
        setEmailValidation({ status: 'idle', message: '' });
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.email]);

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (emailValidation.status === 'taken') {
      newErrors.email = 'This email is already registered';
    } else if (emailValidation.status === 'checking') {
      newErrors.email = 'Please wait while we check email availability';
    } else if (emailValidation.status === 'invalid') {
      newErrors.email = emailValidation.message;
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.fullName) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (usernameValidation.status === 'taken') {
      newErrors.username = 'This username is already taken';
    } else if (usernameValidation.status === 'checking') {
      newErrors.username = 'Please wait while we check username availability';
    }

    if (!formData.acceptedTerms) {
      newErrors.terms = 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.bio) {
      newErrors.bio = 'Bio is required';
    }
    
    if (!formData.location) {
      newErrors.location = 'Location is required';
    }

    if (formData.userType === 'entrepreneur') {
      if (!formData.industry) {
        newErrors.industry = 'Industry is required';
      }
      if (!formData.startupStage) {
        newErrors.startupStage = 'Startup stage is required';
      }
      if (!formData.fundingStage) {
        newErrors.fundingStage = 'Funding stage is required';
      }
      if (!formData.businessModel) {
        newErrors.businessModel = 'Business model is required';
      }
      if (!formData.targetMarket) {
        newErrors.targetMarket = 'Target market is required';
      }
      if (!formData.teamSize || formData.teamSize < 1) {
        newErrors.teamSize = 'Team size must be at least 1';
      }
      if (!formData.foundedYear || formData.foundedYear < 1900 || formData.foundedYear > new Date().getFullYear()) {
        newErrors.foundedYear = 'Please enter a valid founded year';
      }
    } else {
      if (!formData.investmentRange) {
        newErrors.investmentRange = 'Investment range is required';
      }
      if (!formData.investmentFocus) {
        newErrors.investmentFocus = 'Investment focus is required';
      }
      if (!formData.investmentExperience) {
        newErrors.investmentExperience = 'Investment experience is required';
      }
      if (!formData.preferredIndustries) {
        newErrors.preferredIndustries = 'Preferred industries is required';
      }
      if (!formData.investmentCriteria) {
        newErrors.investmentCriteria = 'Investment criteria is required';
      }
    }

    setErrors(newErrors);
    console.log('validateStep2 errors:', newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('handleSubmit called');
    if (!validateStep2()) {
      console.log('Validation Step 2 failed');
      return;
    }
    setError(null);
    setLoading(true);
    console.log('Starting registration process...');

    try {
      await register(formData);
      setShowSuccess(true);
      console.log('Registration successful!');
    } catch (err) {
      console.error('Registration process failed:', err);
      let errorMessage = 'An error occurred during registration';
      
      if (err instanceof AuthApiError) {
        if (err.status === 429) {
          setError('Too many registration attempts. Please wait a minute and try again.');
        } else {
          errorMessage = err.message;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
      console.log('Registration process finished.');
    }
  };

  const nextStep = () => {
    if (validateStep1()) {
      setStep(step + 1);
    }
  };
  
  const prevStep = () => setStep(step - 1);

  const TermsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Terms and Conditions</h3>
          <button
            onClick={() => setShowTerms(false)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="prose max-w-none">
          <h4>1. Acceptance of Terms</h4>
          <p>
            By accessing and using StartupConnect, you agree to be bound by these Terms and Conditions
            and our Privacy Policy. If you do not agree to these terms, please do not use our service.
          </p>

          <h4>2. User Responsibilities</h4>
          <p>
            Users are responsible for maintaining the confidentiality of their account information
            and for all activities that occur under their account.
          </p>

          <h4>3. Content Guidelines</h4>
          <p>
            Users agree to post content that is accurate, lawful, and does not infringe on any
            third-party rights. Prohibited content includes but is not limited to:
          </p>
          <ul>
            <li>Misleading or fraudulent information</li>
            <li>Hate speech or discriminatory content</li>
            <li>Spam or unauthorized promotional material</li>
            <li>Malicious software or harmful code</li>
          </ul>

          <h4>4. Privacy</h4>
          <p>
            We collect and process personal information as described in our Privacy Policy. By using
            our service, you consent to such processing and warrant that all data provided by you
            is accurate.
          </p>

          <h4>5. Intellectual Property</h4>
          <p>
            Users retain ownership of their content but grant StartupConnect a license to use,
            display, and distribute such content on our platform.
          </p>
        </div>
      </div>
    </div>
  );

  const renderValidationIcon = (validation: { status: string; message: string }) => {
    switch (validation.status) {
      case 'checking':
        return <Loader className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'available':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'taken':
      case 'invalid':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const renderValidationMessage = (validation: { status: string; message: string }) => {
    if (!validation.message) return null;
    
    const colorClass = validation.status === 'available' ? 'text-green-600' : 'text-red-600';
    
    return (
      <div className={`mt-1 text-sm ${colorClass} flex items-center gap-1`}>
        {renderValidationIcon(validation)}
        <span>{validation.message}</span>
      </div>
    );
  };

  const renderError = (field: string) => {
    if (errors[field]) {
      return (
        <div className="mt-1 text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="h-4 w-4" />
          <span>{errors[field]}</span>
        </div>
      );
    }
    return null;
  };

  // Success Message Component
  if (showSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-xl shadow-lg border border-green-200"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-block p-3 bg-green-100 rounded-full mb-4"
          >
            <CheckCircle className="h-8 w-8 text-green-600" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-green-800 mb-2"
          >
            Registration Successful!
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-green-700 mb-4"
          >
            Please check your email to confirm your account. After confirming, you can log in.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-sm text-green-600"
          >
            <button
              onClick={() => navigate('/login')}
              className="mt-4 px-6 py-2 bg-purple-600 text-white rounded font-semibold hover:bg-purple-700 transition"
            >
              Go to Login
            </button>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-6 max-w-md mx-auto bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-xl shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {error && (
        <div className="bg-red-100 text-red-600 p-4 rounded-lg border border-red-200 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {showTerms && <TermsModal />}

      {step === 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  className={`mt-1 block w-full rounded-lg border-gray-300 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pr-10 ${
                    errors.email ? 'border-red-300' : ''
                  } ${
                    emailValidation.status === 'available' ? 'border-green-300' : ''
                  }`}
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    setErrors({ ...errors, email: '' });
                  }}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {renderValidationIcon(emailValidation)}
                </div>
              </div>
              {renderError('email')}
              {renderValidationMessage(emailValidation)}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="password"
                className={`mt-1 block w-full rounded-lg border-gray-300 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                  errors.password ? 'border-red-300' : ''
                }`}
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  setErrors({ ...errors, password: '' });
                }}
              />
              {renderError('password')}
            </div>

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="fullName"
                className={`mt-1 block w-full rounded-lg border-gray-300 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                  errors.fullName ? 'border-red-300' : ''
                }`}
                value={formData.fullName}
                onChange={(e) => {
                  setFormData({ ...formData, fullName: e.target.value });
                  setErrors({ ...errors, fullName: '' });
                }}
              />
              {renderError('fullName')}
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="username"
                  className={`mt-1 block w-full rounded-lg border-gray-300 bg-white shadow-sm focus:border-blue-500 focus:ring-blue-500 pr-10 ${
                    errors.username ? 'border-red-300' : ''
                  } ${
                    usernameValidation.status === 'available' ? 'border-green-300' : ''
                  }`}
                  value={formData.username}
                  onChange={(e) => {
                    setFormData({ ...formData, username: e.target.value });
                    setErrors({ ...errors, username: '' });
                  }}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {renderValidationIcon(usernameValidation)}
                </div>
              </div>
              {renderError('username')}
              {renderValidationMessage(usernameValidation)}
            </div>

            <div className="flex items-center">
              <input
                id="acceptedTerms"
                name="acceptedTerms"
                type="checkbox"
                required
                className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                  errors.terms ? 'border-red-500' : ''
                }`}
                checked={formData.acceptedTerms}
                onChange={(e) => setFormData({ ...formData, acceptedTerms: e.target.checked })}
              />
              <label htmlFor="acceptedTerms" className="ml-2 block text-sm text-gray-900">
                I agree to the StartupConnect{' '}
                <button
                  type="button"
                  onClick={() => setShowTerms(true)}
                  className="text-blue-600 hover:text-blue-500 underline"
                >
                  Terms and Conditions
                </button>
              </label>
            </div>
            {renderError('terms')}
          </div>

          <button
            type="button"
            onClick={nextStep}
            disabled={loading || usernameValidation.status === 'checking' || emailValidation.status === 'checking' || emailValidation.status === 'taken' || emailValidation.status === 'invalid'}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Next
          </button>
        </motion.div>
      )}

      {step === 2 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="space-y-4">
            <div>
              <label htmlFor="userType" className="block text-sm font-medium text-gray-700">
                User Type <span className="text-red-500">*</span>
              </label>
              <select
                id="userType"
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.userType}
                onChange={(e) => setFormData({ ...formData, userType: e.target.value as 'entrepreneur' | 'investor' })}
              >
                <option value="entrepreneur">Startup Entrepreneur</option>
                <option value="investor">Investor</option>
              </select>
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                Bio <span className="text-red-500">*</span>
              </label>
              <textarea
                id="bio"
                rows={3}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about yourself and what you are looking for..."
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="location"
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            {formData.userType === 'entrepreneur' && (
              <>
                <div>
                  <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
                    Industry <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="industry"
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  >
                    <option value="">Select Industry</option>
                    <option value="technology">Technology</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="finance">Finance</option>
                    <option value="education">Education</option>
                    <option value="retail">Retail</option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="startupStage" className="block text-sm font-medium text-gray-700">
                    Startup Stage <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="startupStage"
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.startupStage}
                    onChange={(e) => setFormData({ ...formData, startupStage: e.target.value })}
                  >
                    <option value="">Select Stage</option>
                    <option value="idea">Idea Stage</option>
                    <option value="mvp">MVP</option>
                    <option value="early_traction">Early Traction</option>
                    <option value="growth">Growth Stage</option>
                    <option value="scaling">Scaling</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="fundingStage" className="block text-sm font-medium text-gray-700">
                    Current Funding Stage <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="fundingStage"
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.fundingStage}
                    onChange={(e) => setFormData({ ...formData, fundingStage: e.target.value })}
                  >
                    <option value="">Select Stage</option>
                    <option value="pre_seed">Pre-seed</option>
                    <option value="seed">Seed</option>
                    <option value="series_a">Series A</option>
                    <option value="series_b">Series B</option>
                    <option value="series_c">Series C+</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="businessModel" className="block text-sm font-medium text-gray-700">
                    Business Model <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="businessModel"
                    rows={3}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.businessModel}
                    onChange={(e) => setFormData({ ...formData, businessModel: e.target.value })}
                    placeholder="Describe your business model and revenue streams..."
                  />
                </div>

                <div>
                  <label htmlFor="targetMarket" className="block text-sm font-medium text-gray-700">
                    Target Market <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="targetMarket"
                    rows={3}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.targetMarket}
                    onChange={(e) => setFormData({ ...formData, targetMarket: e.target.value })}
                    placeholder="Describe your target market and customer segments..."
                  />
                </div>

                <div>
                  <label htmlFor="foundedYear" className="block text-sm font-medium text-gray-700">
                    Founded Year <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="foundedYear"
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.foundedYear}
                    onChange={(e) => setFormData({ ...formData, foundedYear: parseInt(e.target.value) })}
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                </div>

                <div>
                  <label htmlFor="teamSize" className="block text-sm font-medium text-gray-700">
                    Team Size <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="teamSize"
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.teamSize}
                    onChange={(e) => setFormData({ ...formData, teamSize: parseInt(e.target.value) })}
                    min="1"
                  />
                </div>
              </>
            )}

            {formData.userType === 'investor' && (
              <>
                <div>
                  <label htmlFor="investmentRange" className="block text-sm font-medium text-gray-700">
                    Investment Range <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="investmentRange"
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.investmentRange}
                    onChange={(e) => setFormData({ ...formData, investmentRange: e.target.value })}
                  >
                    <option value="">Select Range</option>
                    <option value="0-50k">$0 - $50,000</option>
                    <option value="50k-250k">$50,000 - $250,000</option>
                    <option value="250k-1m">$250,000 - $1,000,000</option>
                    <option value="1m+">$1,000,000+</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="investmentFocus" className="block text-sm font-medium text-gray-700">
                    Investment Focus <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="investmentFocus"
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.investmentFocus}
                    onChange={(e) => setFormData({ ...formData, investmentFocus: e.target.value })}
                  >
                    <option value="">Select Focus</option>
                    <option value="early_stage">Early Stage</option>
                    <option value="growth">Growth Stage</option>
                    <option value="late_stage">Late Stage</option>
                    <option value="all_stages">All Stages</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="investmentExperience" className="block text-sm font-medium text-gray-700">
                    Investment Experience <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="investmentExperience"
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.investmentExperience}
                    onChange={(e) => setFormData({ ...formData, investmentExperience: e.target.value })}
                  >
                    <option value="">Select Experience</option>
                    <option value="beginner">Beginner (0-2 years)</option>
                    <option value="intermediate">Intermediate (2-5 years)</option>
                    <option value="experienced">Experienced (5-10 years)</option>
                    <option value="expert">Expert (10+ years)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="preferredIndustries" className="block text-sm font-medium text-gray-700">
                    Preferred Industries <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="preferredIndustries"
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.preferredIndustries}
                    onChange={(e) => setFormData({ ...formData, preferredIndustries: e.target.value })}
                  >
                    <option value="">Select Industries</option>
                    <option value="technology">Technology</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="finance">Finance</option>
                    <option value="education">Education</option>
                    <option value="retail">Retail</option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="investmentCriteria" className="block text-sm font-medium text-gray-700">
                    Investment Criteria <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="investmentCriteria"
                    rows={3}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value={formData.investmentCriteria}
                    onChange={(e) => setFormData({ ...formData, investmentCriteria: e.target.value })}
                    placeholder="Describe your investment criteria and what you look for in startups..."
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex justify-between space-x-4">
            <button
              type="button"
              onClick={prevStep}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </div>
        </motion.div>
      )}
    </motion.form>
  );
}