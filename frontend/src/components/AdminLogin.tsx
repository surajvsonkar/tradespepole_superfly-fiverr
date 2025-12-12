import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { adminService } from '../services/adminService';

const AdminLogin = () => {
	const navigate = useNavigate();
	const [view, setView] = useState<'login' | 'forgot' | 'reset'>('login');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [otp, setOtp] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError('');

		try {
			await adminService.login({ email, password });
			navigate('/admin/dashboard');
		} catch (err: any) {
			setError(err.response?.data?.error || 'Failed to login');
		} finally {
			setLoading(false);
		}
	};

	const handleForgotPassword = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError('');
		setSuccess('');

		try {
			await adminService.forgotPassword(email);
			setSuccess('OTP sent to your email');
			setView('reset');
		} catch (err: any) {
			setError(err.response?.data?.error || 'Failed to send OTP');
		} finally {
			setLoading(false);
		}
	};

	const handleResetPassword = async (e: React.FormEvent) => {
		e.preventDefault();
		if (newPassword !== confirmPassword) {
			setError('Passwords do not match');
			return;
		}

		setLoading(true);
		setError('');
		setSuccess('');

		try {
			await adminService.resetPassword({ email, otp, newPassword });
			setSuccess('Password reset successfully. Please login.');
			setTimeout(() => {
				setView('login');
				setPassword('');
				setSuccess('');
			}, 2000);
		} catch (err: any) {
			setError(err.response?.data?.error || 'Failed to reset password');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
			<div className="sm:mx-auto sm:w-full sm:max-w-md">
				<div className="flex justify-center">
					<div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
						<Shield className="w-8 h-8 text-white" />
					</div>
				</div>
				<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
					Admin Portal
				</h2>
				<p className="mt-2 text-center text-sm text-gray-600">
					{view === 'login' && 'Sign in to access the dashboard'}
					{view === 'forgot' && 'Reset your password'}
					{view === 'reset' && 'Enter OTP and new password'}
				</p>
			</div>

			<div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
				<div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
					{error && (
						<div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
							{error}
						</div>
					)}

					{success && (
						<div className="mb-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm flex items-center">
							<CheckCircle className="w-4 h-4 mr-2" />
							{success}
						</div>
					)}

					{view === 'login' && (
						<form className="space-y-6" onSubmit={handleLogin}>
							<div>
								<label className="block text-sm font-medium text-gray-700">
									Email address
								</label>
								<div className="mt-1 relative">
									<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
										<Mail className="h-5 w-5 text-gray-400" />
									</div>
									<input
										type="email"
										required
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
									/>
								</div>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700">
									Password
								</label>
								<div className="mt-1 relative">
									<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
										<Lock className="h-5 w-5 text-gray-400" />
									</div>
									<input
										type={showPassword ? 'text' : 'password'}
										required
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
									/>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
									>
										{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
									</button>
								</div>
							</div>

							<div className="flex items-center justify-between">
								<div className="text-sm">
									<button
										type="button"
										onClick={() => setView('forgot')}
										className="font-medium text-blue-600 hover:text-blue-500"
									>
										Forgot your password?
									</button>
								</div>
							</div>

							<div>
								<button
									type="submit"
									disabled={loading}
									className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
								>
									{loading ? 'Signing in...' : 'Sign in'}
								</button>
							</div>
						</form>
					)}

					{view === 'forgot' && (
						<form className="space-y-6" onSubmit={handleForgotPassword}>
							<div>
								<label className="block text-sm font-medium text-gray-700">
									Email address
								</label>
								<div className="mt-1 relative">
									<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
										<Mail className="h-5 w-5 text-gray-400" />
									</div>
									<input
										type="email"
										required
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
									/>
								</div>
							</div>

							<div>
								<button
									type="submit"
									disabled={loading}
									className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
								>
									{loading ? 'Sending OTP...' : 'Send OTP'}
								</button>
							</div>

							<div className="text-center">
								<button
									type="button"
									onClick={() => setView('login')}
									className="text-sm font-medium text-gray-600 hover:text-gray-500"
								>
									Back to login
								</button>
							</div>
						</form>
					)}

					{view === 'reset' && (
						<form className="space-y-6" onSubmit={handleResetPassword}>
							<div>
								<label className="block text-sm font-medium text-gray-700">
									Enter OTP
								</label>
								<input
									type="text"
									required
									value={otp}
									onChange={(e) => setOtp(e.target.value)}
									placeholder="6-digit code"
									className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700">
									New Password
								</label>
								<div className="mt-1 relative">
									<input
										type={showNewPassword ? 'text' : 'password'}
										required
										value={newPassword}
										onChange={(e) => setNewPassword(e.target.value)}
										className="appearance-none block w-full px-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
									/>
									<button
										type="button"
										onClick={() => setShowNewPassword(!showNewPassword)}
										className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
									>
										{showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
									</button>
								</div>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700">
									Confirm Password
								</label>
								<div className="mt-1 relative">
									<input
										type={showConfirmPassword ? 'text' : 'password'}
										required
										value={confirmPassword}
										onChange={(e) => setConfirmPassword(e.target.value)}
										className="appearance-none block w-full px-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
									/>
									<button
										type="button"
										onClick={() => setShowConfirmPassword(!showConfirmPassword)}
										className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
									>
										{showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
									</button>
								</div>
							</div>

							<div>
								<button
									type="submit"
									disabled={loading}
									className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
								>
									{loading ? 'Resetting...' : 'Reset Password'}
								</button>
							</div>

							<div className="text-center">
								<button
									type="button"
									onClick={() => setView('login')}
									className="text-sm font-medium text-gray-600 hover:text-gray-500"
								>
									Back to login
								</button>
							</div>
						</form>
					)}
				</div>
			</div>
		</div>
	);
};

export default AdminLogin;
