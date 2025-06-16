import Layout from '../components/Layout/Layout';
import PostForm from '../components/Posts/PostForm';

export default function CreatePostPage() {
  return (
    <Layout>
      <div className="max-w-2xl mx-auto pt-20">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Share Your Startup Idea</h1>
          <p className="mt-2 text-gray-600">
            Tell us about your innovative idea and connect with potential investors
          </p>
        </div>

        <PostForm />
      </div>
    </Layout>
  );
}