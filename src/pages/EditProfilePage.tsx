import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import ImageCropModal from '../components/ImageCropModal';
import { useStore } from '../lib/store';
import { motion } from 'framer-motion';
import { User, Upload, AlertCircle, CheckCircle, Camera, X, Crop } from 'lucide-react';

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { currentUser, updateUserProfile } = useStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [originalImageSrc, setOriginalImageSrc] = useState<string | null>(null);
  const [croppedImageBlob, setCroppedImageBlob] = useState<Blob | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);

  const [formData, setFormData] = useState({
    fullName: currentUser?.fullName || '',
    username: currentUser?.username || '',
    userType: currentUser?.userType || 'entrepreneur',
    bio: currentUser?.bio || '',
    location: currentUser?.location || '',
    industry: currentUser?.industry || '',
    foundedYear: currentUser?.foundedYear || new Date().getFullYear(),
    teamSize: currentUser?.teamSize || 1,
    investmentRange: currentUser?.investmentRange || '',
  });

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    setFormData({
      fullName: currentUser.fullName || '',
      username: currentUser.username || '',
      userType: currentUser.userType || 'entrepreneur',
      bio: currentUser.bio || '',
      location: currentUser.location || '',
      industry: currentUser.industry || '',
      foundedYear: currentUser.foundedYear || new Date().getFullYear(),
      teamSize: currentUser.teamSize || 1,
      investmentRange: currentUser.investmentRange || '',
    });

    if (currentUser.avatarUrl) {
      setImagePreview(currentUser.avatarUrl);
    }
  }, [currentUser, navigate]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Clear previous errors
    setError(null);

    // Check file size (500KB = 500 * 1024 bytes = 512,000 bytes)
    const maxSize = 500 * 1024; // 500KB in bytes
    if (file.size > maxSize) {
      setError(`Image size is ${formatFileSize(file.size)}. Please upload an image smaller than 500KB.`);
      // Clear the input
      e.target.value = '';
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, GIF, etc.)');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageSrc = e.target?.result as string;
      setOriginalImageSrc(imageSrc);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    setCroppedImageBlob(croppedBlob);
    const croppedImageUrl = URL.createObjectURL(croppedBlob);
    setImagePreview(croppedImageUrl);
    setShowCropModal(false);
  };

  const removeImage = () => {
    setCroppedImageBlob(null);
    setImagePreview(currentUser?.avatarUrl || null);
    setOriginalImageSrc(null);
    setError(null);
    // Clear the file input
    const fileInput = document.getElementById('avatar') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setError(null);
    setLoading(true);

    try {
      let avatarUrl = currentUser.avatarUrl;

      // If there's a cropped image blob, convert it to base64 for storage
      if (croppedImageBlob) {
        // Double-check file size before processing
        if (croppedImageBlob.size > 500 * 1024) {
          setError(`Cropped image size is ${formatFileSize(croppedImageBlob.size)}. Please try cropping again to reduce size.`);
          setLoading(false);
          return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            avatarUrl = e.target?.result as string;
            
            await updateUserProfile(currentUser.id, {
              ...formData,
              avatarUrl,
            });

            setSuccess(true);
            setTimeout(() => {
              setSuccess(false);
              navigate('/home');
            }, 2000);
          } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred while updating profile');
            setLoading(false);
          }
        };
        reader.onerror = () => {
          setError('Failed to process the image. Please try again.');
          setLoading(false);
        };
        reader.readAsDataURL(croppedImageBlob);
      } else {
        await updateUserProfile(currentUser.id, formData);
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          navigate('/home');
        }, 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while updating profile');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) return null;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-purple-100 p-8"
        >
          <div className="text-center mb-8">
            <div className="inline-block p-3 bg-purple-50 rounded-2xl mb-4">
              <User className="h-8 w-8 text-purple-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
            <p className="mt-2 text-gray-600">Update your profile information</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6 flex items-start space-x-3"
            >
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Upload Error</p>
                <p className="text-sm">{error}</p>
              </div>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg mb-6 flex items-center space-x-2"
            >
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
              <span>Profile updated successfully! Redirecting...</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture Upload */}
            <div className="text-center">
              <div className="relative inline-block">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-purple-200 bg-gray-100 relative group">
                  {imagePreview ? (
                    <>
                      <img
                        src={imagePreview}
                        alt={currentUser.fullName || 'Profile picture'}
                        className="w-full h-full object-cover"
                      />
                      {(croppedImageBlob || originalImageSrc) && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                          {originalImageSrc && (
                            <button
                              type="button"
                              onClick={() => setShowCropModal(true)}
                              className="bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 transition-colors"
                              title="Crop image"
                            >
                              <Crop className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={removeImage}
                            className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                            title="Remove image"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100">
                      <User className="h-16 w-16 text-purple-400" />
                    </div>
                  )}
                </div>
                <label
                  htmlFor="avatar"
                  className="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full cursor-pointer hover:bg-purple-700 transition-colors shadow-lg"
                >
                  <Camera className="h-4 w-4" />
                </label>
                <input
                  type="file"
                  id="avatar"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
              <div className="mt-3">
                <p className="text-sm text-gray-600">
                  Upload a profile picture
                </p>
                <p className="text-xs text-gray-500">
                  Maximum file size: 500KB • Click to crop after upload
                </p>
                {croppedImageBlob && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-green-600">
                      ✓ Image cropped and ready ({formatFileSize(croppedImageBlob.size)})
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowCropModal(true)}
                      className="text-xs text-purple-600 hover:text-purple-700 underline"
                    >
                      Adjust crop
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="fullName"
                  required
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="username"
                  required
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label htmlFor="userType" className="block text-sm font-medium text-gray-700">
                User Type <span className="text-red-500">*</span>
              </label>
              <select
                id="userType"
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                value={formData.userType}
                onChange={(e) => setFormData({ ...formData, userType: e.target.value as 'entrepreneur' | 'investor' })}
              >
                <option value="entrepreneur">Startup Entrepreneur</option>
                <option value="investor">Investor</option>
              </select>
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                Bio
              </label>
              <textarea
                id="bio"
                rows={4}
                className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about yourself..."
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
                  Industry
                </label>
                <input
                  type="text"
                  id="industry"
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                />
              </div>
            </div>

            {formData.userType === 'entrepreneur' ? (
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="foundedYear" className="block text-sm font-medium text-gray-700">
                    Founded Year
                  </label>
                  <input
                    type="number"
                    id="foundedYear"
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                    value={formData.foundedYear}
                    onChange={(e) => setFormData({ ...formData, foundedYear: parseInt(e.target.value) })}
                  />
                </div>

                <div>
                  <label htmlFor="teamSize" className="block text-sm font-medium text-gray-700">
                    Team Size
                  </label>
                  <input
                    type="number"
                    id="teamSize"
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                    value={formData.teamSize}
                    onChange={(e) => setFormData({ ...formData, teamSize: parseInt(e.target.value) })}
                  />
                </div>
              </div>
            ) : (
              <div>
                <label htmlFor="investmentRange" className="block text-sm font-medium text-gray-700">
                  Investment Range
                </label>
                <select
                  id="investmentRange"
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
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
            )}

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Image Crop Modal */}
        {originalImageSrc && (
          <ImageCropModal
            isOpen={showCropModal}
            onClose={() => setShowCropModal(false)}
            imageSrc={originalImageSrc}
            onCropComplete={handleCropComplete}
          />
        )}
      </div>
    </Layout>
  );
}