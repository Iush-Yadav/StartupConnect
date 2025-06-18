import { Link } from 'react-router-dom';
import RegisterForm from '../components/Auth/RegisterForm';
import Layout from '../components/Layout/Layout';

export default function RegisterPage() {
  return (
    <Layout>
      <div className="max-w-2xl mx-auto pt-20">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Join StartupConnect</h1>
          <p className="mt-2 text-gray-600">
            Create an account to share your startup ideas or invest in the next big thing
          </p>
        </div>

        <RegisterForm />

        <p className="mt-8 text-center text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-500">
            Sign in
          </Link>
        </p>
      </div>
    </Layout>
  );
}