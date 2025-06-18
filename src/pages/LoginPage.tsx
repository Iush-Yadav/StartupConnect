import { Link } from 'react-router-dom';
import LoginForm from '../components/Auth/LoginForm';
import Layout from '../components/Layout/Layout';

export default function LoginPage() {
  return (
    <Layout>
      <div className="max-w-2xl mx-auto pt-20">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="mt-2 text-gray-600">
            Sign in to continue your journey with StartupConnect
          </p>
        </div>

        <LoginForm />

        <p className="mt-8 text-center text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-600 hover:text-blue-500">
            Create one
          </Link>
        </p>
      </div>
    </Layout>
  );
}