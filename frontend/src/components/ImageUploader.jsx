import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, X, AlertCircle } from 'lucide-react';

export default function ImageUploader({ file, onFileSelect, onFileRemove, label = 'Upload Site or Surface Image' }) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const validateAndSelect = (selectedFile) => {
    setError(null);
    if (!selectedFile) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Please select a valid image file (JPEG, PNG, or WEBP).');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit. Please upload a smaller image.');
      return;
    }

    onFileSelect(selectedFile);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSelect(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-semibold text-slate-800 mb-1.5">{label}</label>

      {file ? (
        <div className="relative overflow-hidden rounded-2xl border-2 border-slate-200 bg-slate-900/5 p-2">
          <div className="relative aspect-video max-h-72 w-full overflow-hidden rounded-xl bg-slate-100 flex items-center justify-center">
            <img
              src={URL.createObjectURL(file)}
              alt="Preview"
              className="h-full w-full object-contain"
            />
            <button
              type="button"
              onClick={onFileRemove}
              className="absolute top-3 right-3 rounded-full bg-slate-900/80 p-2 text-white shadow-md hover:bg-slate-900 transition-colors"
              title="Remove image"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-2 flex items-center justify-between px-2 text-xs text-slate-600">
            <span className="truncate max-w-[250px] font-medium">{file.name}</span>
            <span>{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
          </div>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-blue-500 bg-blue-50/50'
              : 'border-slate-300 hover:border-blue-400 bg-white hover:bg-slate-50/50'
          }`}
        >
          <div className="rounded-full bg-blue-50 p-4 text-blue-600 mb-3 shadow-inner">
            <UploadCloud className="h-8 w-8" />
          </div>
          <p className="text-sm font-semibold text-slate-800">
            Click to upload or drag & drop photograph
          </p>
          <p className="mt-1 text-xs text-slate-500">
            High-resolution JPEG, PNG, or WEBP (Max 10 MB)
          </p>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleChange}
            className="hidden"
          />
        </div>
      )}

      {error && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-red-600">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
