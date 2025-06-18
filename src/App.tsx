import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WelcomePage from './pages/WelcomePage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CreatePostPage from './pages/CreatePostPage';
import EditPostPage from './pages/EditPostPage';
import EditProfilePage from './pages/EditProfilePage';
import PostDetailPage from './pages/PostDetailPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import QuickLinksPage from './pages/QuickLinksPage';
import TermsPage from './pages/terms/TermsPage';
import PrivacyPage from './pages/privacy/PrivacyPage';
import DocumentationPage from './pages/docs/DocumentationPage';
import GuidelinesPage from './pages/guidelines/GuidelinesPage';
import SuccessStoriesPage from './pages/success/SuccessStoriesPage';
import InvestmentCriteriaPage from './pages/investment/InvestmentCriteriaPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import CompleteProfilePage from './pages/CompleteProfilePage';
import MessagesPage from './pages/MessagesPage';
import ConnectionsPage from './pages/ConnectionsPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/create-post" element={<CreatePostPage />} />
        <Route path="/edit-post/:id" element={<EditPostPage />} />
        <Route path="/edit-profile" element={<EditProfilePage />} />
        <Route path="/post/:id" element={<PostDetailPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/quick-links" element={<QuickLinksPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/docs" element={<DocumentationPage />} />
        <Route path="/guidelines" element={<GuidelinesPage />} />
        <Route path="/success-stories" element={<SuccessStoriesPage />} />
        <Route path="/investment-criteria" element={<InvestmentCriteriaPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/complete-profile" element={<CompleteProfilePage />} />
        <Route path="/messages" element={<MessagesPage />} />
        <Route path="/connections" element={<ConnectionsPage />} />
      </Routes>
    </Router>
  );
}