import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Loader } from 'lucide-react';
import { userService } from '../services/userService';
import { useApp } from '../context/AppContext';

interface ProfilePhotoUploadProps {
	currentAvatar?: string | null;
	onUploadSuccess?: (newAvatarUrl: string) => void;
}

const ProfilePhotoUpload: React.FC<ProfilePhotoUploadProps> = ({
	currentAvatar,
	onUploadSuccess
}) => {
	const { dispatch } = useApp();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [uploading, setUploading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [preview, setPreview] = useState<string | null>(null);

	const MAX_FILE_SIZE = 1024 * 1024; // 1MB

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setError(null);

		// Validate file type
		if (!file.type.startsWith('image/')) {
			setError('Please select an image file');
			return;
		}

		// Validate file size
		if (file.size > MAX_FILE_SIZE) {
			setError('Image must be less than 1MB');
			return;
		}

		// Create preview and convert to base64
		const reader = new FileReader();
		reader.onload = (event) => {
			const base64 = event.target?.result as string;
			setPreview(base64);
		};
		reader.readAsDataURL(file);
	};

	const handleUpload = async () => {
		if (!preview) return;

		setUploading(true);
		setError(null);

		try {
			const response = await userService.uploadProfilePhoto(preview);
			
			// Update user in context
			dispatch({ type: 'UPDATE_USER', payload: { avatar: response.avatarUrl } });
			
			if (onUploadSuccess) {
				onUploadSuccess(response.avatarUrl);
			}
			
			setPreview(null);
			alert('Profile photo updated successfully!');
		} catch (err: any) {
			console.error('Upload failed:', err);
			setError(err.response?.data?.error || 'Failed to upload photo');
		} finally {
			setUploading(false);
		}
	};

	const cancelPreview = () => {
		setPreview(null);
		setError(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center space-x-4">
				{/* Current/Preview Avatar */}
				<div className="relative">
					<div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 border-2 border-gray-300">
						{preview ? (
							<img src={preview} alt="Preview" className="w-full h-full object-cover" />
						) : currentAvatar ? (
							<img src={currentAvatar} alt="Profile" className="w-full h-full object-cover" />
						) : (
							<div className="w-full h-full flex items-center justify-center text-gray-400">
								<Camera className="w-10 h-10" />
							</div>
						)}
					</div>
					
					{preview && (
						<button
							onClick={cancelPreview}
							className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
						>
							<X className="w-4 h-4" />
						</button>
					)}
				</div>

				{/* Upload Controls */}
				<div className="flex flex-col space-y-2">
					<input
						ref={fileInputRef}
						type="file"
						accept="image/*"
						onChange={handleFileSelect}
						className="hidden"
					/>
					
					{!preview ? (
						<button
							onClick={() => fileInputRef.current?.click()}
							className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
						>
							<Upload className="w-4 h-4 mr-2" />
							Choose Photo
						</button>
					) : (
						<button
							onClick={handleUpload}
							disabled={uploading}
							className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
						>
							{uploading ? (
								<>
									<Loader className="w-4 h-4 mr-2 animate-spin" />
									Uploading...
								</>
							) : (
								<>
									<Upload className="w-4 h-4 mr-2" />
									Upload Photo
								</>
							)}
						</button>
					)}
					
					<p className="text-xs text-gray-500">Max size: 1MB</p>
				</div>
			</div>

			{error && (
				<div className="text-red-600 text-sm bg-red-50 p-2 rounded">
					{error}
				</div>
			)}
		</div>
	);
};

export default ProfilePhotoUpload;
