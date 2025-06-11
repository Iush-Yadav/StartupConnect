import React from 'react';

const MessageLogo: React.FC = () => {
  return (
    <div className="relative inline-flex items-center cursor-pointer bg-gradient-to-r from-pink-100 to-purple-100 p-1.5 rounded-lg shadow-sm">
      <div className="relative">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-purple-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
      </div>
    </div>
  );
};

export default MessageLogo; 