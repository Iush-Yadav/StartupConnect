import { useState, useRef, useCallback } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw, ZoomIn, ZoomOut, Check, Move } from 'lucide-react';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  onCropComplete: (croppedImageBlob: Blob) => void;
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}

export default function ImageCropModal({ isOpen, onClose, imageSrc, onCropComplete }: ImageCropModalProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [aspect, setAspect] = useState<number | undefined>(1);
  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    if (aspect) {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspect));
    }
  }

  const getCroppedImg = useCallback(
    (image: HTMLImageElement, crop: PixelCrop, scale = 1, rotate = 0): Promise<Blob> => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('No 2d context');
      }

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      const pixelRatio = window.devicePixelRatio;

      canvas.width = Math.floor(crop.width * scaleX * pixelRatio);
      canvas.height = Math.floor(crop.height * scaleY * pixelRatio);

      ctx.scale(pixelRatio, pixelRatio);
      ctx.imageSmoothingQuality = 'high';

      const cropX = crop.x * scaleX;
      const cropY = crop.y * scaleY;

      const rotateRads = rotate * (Math.PI / 180);
      const centerX = image.naturalWidth / 2;
      const centerY = image.naturalHeight / 2;

      ctx.save();

      ctx.translate(-cropX, -cropY);
      ctx.translate(centerX, centerY);
      ctx.rotate(rotateRads);
      ctx.scale(scale, scale);
      ctx.translate(-centerX, -centerY);
      ctx.drawImage(
        image,
        0,
        0,
        image.naturalWidth,
        image.naturalHeight,
        0,
        0,
        image.naturalWidth,
        image.naturalHeight,
      );

      ctx.restore();

      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          }
        }, 'image/jpeg', 0.9);
      });
    },
    []
  );

  const handleCropComplete = async () => {
    if (completedCrop && imgRef.current) {
      try {
        const croppedImageBlob = await getCroppedImg(
          imgRef.current,
          completedCrop,
          scale,
          rotate
        );
        onCropComplete(croppedImageBlob);
        onClose();
      } catch (error) {
        console.error('Error cropping image:', error);
      }
    }
  };

  const resetTransforms = () => {
    setScale(1);
    setRotate(0);
    if (imgRef.current && aspect) {
      const { width, height } = imgRef.current;
      setCrop(centerAspectCrop(width, height, aspect));
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-75 flex items-start justify-center p-4 z-50 pt-8"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -20 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
              <h2 className="text-xl font-bold text-gray-900">Crop & Adjust Image</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Controls */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex flex-wrap items-center gap-3">
                {/* Aspect Ratio */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">Aspect:</span>
                  <select
                    value={aspect || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      setAspect(value ? parseFloat(value) : undefined);
                      if (imgRef.current && value) {
                        const { width, height } = imgRef.current;
                        setCrop(centerAspectCrop(width, height, parseFloat(value)));
                      }
                    }}
                    className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="">Free</option>
                    <option value="1">Square (1:1)</option>
                    <option value="1.3333">4:3</option>
                    <option value="1.7778">16:9</option>
                  </select>
                </div>

                {/* Scale */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setScale(Math.max(0.5, scale - 0.1))}
                    className="p-1.5 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    disabled={scale <= 0.5}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </button>
                  <span className="text-sm font-medium text-gray-700 min-w-[50px] text-center">
                    {Math.round(scale * 100)}%
                  </span>
                  <button
                    onClick={() => setScale(Math.min(3, scale + 0.1))}
                    className="p-1.5 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    disabled={scale >= 3}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>
                </div>

                {/* Rotation */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setRotate((rotate - 90) % 360)}
                    className="p-1.5 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                  <span className="text-sm font-medium text-gray-700 min-w-[35px] text-center">
                    {rotate}°
                  </span>
                </div>

                {/* Reset */}
                <button
                  onClick={resetTransforms}
                  className="px-3 py-1.5 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm font-medium"
                >
                  Reset
                </button>
              </div>

              {/* Scale Slider */}
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-sm font-medium text-gray-700">
                    Zoom
                  </label>
                  <span className="text-sm text-gray-500">{Math.round(scale * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
            </div>

            {/* Crop Area */}
            <div className="p-4 flex justify-center bg-gray-100 max-h-[45vh] overflow-auto">
              <div className="relative">
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={aspect}
                  minWidth={50}
                  minHeight={50}
                  className="max-w-full max-h-full"
                >
                  <img
                    ref={imgRef}
                    alt="Crop preview"
                    src={imageSrc}
                    style={{
                      transform: `scale(${scale}) rotate(${rotate}deg)`,
                      maxWidth: '100%',
                      maxHeight: '300px',
                    }}
                    onLoad={onImageLoad}
                    className="block"
                  />
                </ReactCrop>
                
                {/* Crop Instructions */}
                <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded-lg text-xs">
                  <div className="flex items-center space-x-1">
                    <Move className="h-3 w-3" />
                    <span>Drag to crop</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-600">
                Adjust the crop area and zoom to get the perfect image
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCropComplete}
                  disabled={!completedCrop}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <Check className="h-4 w-4" />
                  <span>Apply Crop</span>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}