import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../lib/store';
import { supabase } from '../../lib/supabase';

interface StartupDetails {
  problem: string;
  solution: string;
  marketSize: string;
  competition: string;
  businessModel?: string;
  fundingNeeds: string;
  timeline: string;
  team: string;
}

export default function PostForm() {
  const navigate = useNavigate();
  const createPost = useStore(state => state.createPost);
  const currentUser = useStore(state => state.currentUser);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    startupDetails: {
      problem: '',
      solution: '',
      marketSize: '',
      competition: '',
      businessModel: '',
      fundingNeeds: '',
      timeline: '',
      team: ''
    } as StartupDetails
  });
  const [files, setFiles] = useState<FileList | null>(null);
  const [filePreviews, setFilePreviews] = useState<{ url: string; type: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    // Clear previous previews
    setFilePreviews([]);
    
    // Create previews for new files
    const newPreviews: { url: string; type: string }[] = [];
    
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const fileType = file.type.split('/')[0]; // 'image' or 'video'
      
      // Validate file type
      if (fileType !== 'image' && fileType !== 'video') {
        setError('Only image and video files are allowed');
        continue;
      }
      
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        continue;
      }
      
      const url = URL.createObjectURL(file);
      newPreviews.push({ url, type: fileType });
    }
    
    setFilePreviews(newPreviews);
    setFiles(selectedFiles);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('handleSubmit: Function started.');
    setError(null);
    setLoading(true);

    if (!currentUser) {
      setError('You must be logged in to upload files.');
      setLoading(false);
      console.log('handleSubmit: No current user, stopping.');
      return;
    }

    try {
      const mediaUrls: string[] = [];
      console.log('handleSubmit: Files to process:', files);
      if (files) {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `${currentUser?.id}/${fileName}`;

          try {
            setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));

            // Upload file to Supabase Storage
            console.log('File type before upload:', file.type);
            const { error: uploadError } = await supabase.storage
              .from('media')
              .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false,
                contentType: file.type
              });

            if (uploadError) {
              console.error('Upload error:', uploadError);
              throw new Error(`Failed to upload file: ${uploadError.message}`);
            }

            // Get public URL for the uploaded file
            const { data } = supabase.storage
              .from('media')
              .getPublicUrl(filePath);

            if (!data?.publicUrl) {
              throw new Error('Failed to get public URL for uploaded file');
            }

            console.log('Supabase Public URL for file:', data.publicUrl);
            mediaUrls.push(data.publicUrl);
            setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
          } catch (uploadErr) {
            console.error('File upload error:', uploadErr);
            setError(`Failed to upload file ${file.name}: ${uploadErr instanceof Error ? uploadErr.message : 'Unknown error'}`);
            setUploadProgress(prev => ({ ...prev, [file.name]: -1 })); // -1 indicates error
            continue;
          }
        }
      }

      if (mediaUrls.length === 0 && files && files.length > 0) {
        throw new Error('Failed to upload any files');
      }

      console.log('PostForm: Final mediaUrls before createPost:', mediaUrls);
      console.log('PostForm: Final startupDetails before createPost:', formData.startupDetails);

      await createPost({
        title: formData.title,
        content: formData.content,
        mediaUrls,
        startupDetails: formData.startupDetails,
        tags: [],
        category: '',
        profiles: {
          full_name: '',
          username: '',
        },
        likes: 0,
        user_has_liked: false
      });

      navigate('/home');
    } catch (err) {
      console.error('Post creation error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while creating the post');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    console.log('nextStep: Attempting to proceed.');
    if (step === 1 && (!formData.title || !formData.content)) {
      setError('Please fill in all required fields');
      return;
    }
    setStep(step + 1);
    setError(null);
  };

  const prevStep = () => {
    setStep(step - 1);
    setError(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md">
          {error}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Startup Name / Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              Brief Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              required
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="media" className="block text-sm font-medium text-gray-700">
              Media (Images/Videos)
            </label>
            <input
              type="file"
              id="media"
              multiple
              accept="image/*,video/*"
              className="mt-1 block w-full"
              onChange={handleFileChange}
            />
            <p className="mt-1 text-sm text-gray-500">
              Supported formats: JPG, PNG, GIF, MP4, WebM, MOV. Max size: 10MB
            </p>
            
            {/* File Previews */}
            {filePreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-4">
                {filePreviews.map((preview, index) => {
                  const file = files?.[index];
                  const progress = file ? uploadProgress[file.name] : 0;
                  
                  return (
                    <div key={index} className="relative pt-[56.25%] rounded-lg overflow-hidden border border-gray-200">
                      {preview.type === 'video' ? (
                        <video
                          src={preview.url}
                          controls
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={preview.url}
                          alt={`Preview ${index + 1}`}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      )}
                      
                      {/* Upload Progress */}
                      {file && progress !== undefined && progress !== 100 && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <div className="text-white text-center">
                            {progress === -1 ? (
                              <span className="text-red-400">Upload Failed</span>
                            ) : (
                              <>
                                <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-2"></div>
                                <div>Uploading...</div>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={nextStep}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Next: Startup Details
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div>
            <label htmlFor="problem" className="block text-sm font-medium text-gray-700">
              Problem Statement
            </label>
            <textarea
              id="problem"
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.startupDetails.problem}
              onChange={(e) => setFormData({
                ...formData,
                startupDetails: { ...formData.startupDetails, problem: e.target.value }
              })}
              placeholder="What problem does your startup solve?"
            />
          </div>

          <div>
            <label htmlFor="solution" className="block text-sm font-medium text-gray-700">
              Solution
            </label>
            <textarea
              id="solution"
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.startupDetails.solution}
              onChange={(e) => setFormData({
                ...formData,
                startupDetails: { ...formData.startupDetails, solution: e.target.value }
              })}
              placeholder="How does your solution work?"
            />
          </div>

          <div>
            <label htmlFor="marketSize" className="block text-sm font-medium text-gray-700">
              Market Size
            </label>
            <textarea
              id="marketSize"
              rows={2}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.startupDetails.marketSize}
              onChange={(e) => setFormData({
                ...formData,
                startupDetails: { ...formData.startupDetails, marketSize: e.target.value }
              })}
              placeholder="What's your target market size?"
            />
          </div>

          <div>
            <label htmlFor="competition" className="block text-sm font-medium text-gray-700">
              Competition
            </label>
            <textarea
              id="competition"
              rows={2}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.startupDetails.competition}
              onChange={(e) => setFormData({
                ...formData,
                startupDetails: { ...formData.startupDetails, competition: e.target.value }
              })}
              placeholder="Who are your competitors?"
            />
          </div>

          <div>
            <label htmlFor="fundingNeeds" className="block text-sm font-medium text-gray-700">
              Funding Needs
            </label>
            <textarea
              id="fundingNeeds"
              rows={2}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={formData.startupDetails.fundingNeeds}
              onChange={(e) => setFormData({
                ...formData,
                startupDetails: { ...formData.startupDetails, fundingNeeds: e.target.value }
              })}
              placeholder="How much funding are you seeking?"
            />
          </div>

          <div className="flex space-x-4">
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
              className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Creating post...' : 'Create Post'}
            </button>
          </div>
        </div>
      )}

      {formData.startupDetails.businessModel && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Business Model</h3>
          <p className="text-gray-700">{formData.startupDetails.businessModel}</p>
        </div>
      )}
    </form>
  );
}