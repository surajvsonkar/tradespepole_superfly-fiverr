import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
	ArrowLeft,
	Users,
	Briefcase,
	DollarSign,
	TrendingUp,
	UserCheck,
	Shield,
	Search,
	Trash2,
	XCircle,
	Eye,
	EyeOff,
	BarChart3,
	Settings,
	FileText,
	Lock,
	Save,
	RefreshCw,
	Phone,
	Edit,
	MapPin,
	BookOpen,
	Pause,
	Play,
	Facebook,
	Instagram,
	Twitter,
	Linkedin,
	Globe,
} from 'lucide-react';
import { adminService } from '../services/adminService';

interface DashboardStats {
	stats: {
		totalUsers: number;
		totalJobs: number;
		totalReviews: number;
		totalConversations: number;
	};
	recentActivity: {
		jobs: any[];
		users: any[];
	};
}

interface Analytics {
	users: {
		totalHomeowners: number;
		totalTradespeople: number;
		activeHomeowners: number;
		activeTradespeople: number;
		recentSignups: number;
	};
	jobs: {
		totalJobs: number;
		activeJobs: number;
	};
	revenue: {
		total: string;
		currency: string;
	};
	memberships: any[];
}

const AdminDashboard = () => {
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState<'dashboard' | 'homeowners' | 'tradespeople' | 'directory' | 'transactions' | 'analytics' | 'settings'>('dashboard');
	const [loading, setLoading] = useState(false);
	const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
	const [analytics, setAnalytics] = useState<Analytics | null>(null);
	const [homeowners, setHomeowners] = useState<any[]>([]);
	const [tradespeople, setTradespeople] = useState<any[]>([]);
	const [transactions, setTransactions] = useState<any[]>([]);
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedUser, setSelectedUser] = useState<any>(null);
	const [showUserModal, setShowUserModal] = useState(false);
	const [editingUser, setEditingUser] = useState<any>(null);
	const [savingUser, setSavingUser] = useState(false);
	const [savingPricing, setSavingPricing] = useState(false);
	const [defaultLeadPrice, setDefaultLeadPrice] = useState('9.99');
	const [maxLeadPurchases, setMaxLeadPurchases] = useState('6');
	const [directoryPrice, setDirectoryPrice] = useState('0.99');
	const [transactionFilter, setTransactionFilter] = useState('all');
	
	// Directory listings state
	const [directoryListings, setDirectoryListings] = useState<any[]>([]);
	const [directoryFilter, setDirectoryFilter] = useState('all');
	
	// Social media links state
	const [socialLinks, setSocialLinks] = useState({
		facebook: '',
		instagram: '',
		twitter: '',
		linkedin: ''
	});
	const [savingSocialLinks, setSavingSocialLinks] = useState(false);
	const [socialLinksMessage, setSocialLinksMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
	
	// Password change state
	const [currentPassword, setCurrentPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [showCurrentPassword, setShowCurrentPassword] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
	const [savingPassword, setSavingPassword] = useState(false);

	// Boost plan prices state
	const [boostPrices, setBoostPrices] = useState<Record<string, { name: string; price: number; duration: number }>>({
		'1_week_boost': { name: '1 Week Boost', price: 19.99, duration: 7 },
		'1_month_boost': { name: '1 Month Boost', price: 49.99, duration: 30 },
		'3_month_boost': { name: '3 Month Boost', price: 99.99, duration: 90 },
		'5_year_unlimited': { name: '5 Year Unlimited Leads', price: 995.00, duration: 1825 }
	});
	const [savingPrices, setSavingPrices] = useState(false);
	const [priceMessage, setPriceMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
	
	// Settings active sub-tab
	const [settingsTab, setSettingsTab] = useState<'pricing' | 'boost' | 'social' | 'security'>('pricing');

	useEffect(() => {
		loadDashboardData();
	}, []);

	useEffect(() => {
		if (activeTab === 'homeowners') {
			loadHomeowners();
		} else if (activeTab === 'tradespeople') {
			loadTradespeople();
		} else if (activeTab === 'directory') {
			loadDirectoryListings();
		} else if (activeTab === 'transactions') {
			loadTransactions();
		} else if (activeTab === 'analytics') {
			loadAnalytics();
		} else if (activeTab === 'settings') {
			loadBoostPrices();
			loadPricing();
			loadSocialLinks();
		}
	}, [activeTab, searchTerm, transactionFilter, directoryFilter]);

	const loadDashboardData = async () => {
		setLoading(true);
		try {
			const data = await adminService.getDashboardStats();
			setDashboardStats(data);
		} catch (error: any) {
			console.error('Failed to load dashboard stats:', error);
			// If unauthorized, redirect to admin login
			if (error.response?.status === 401 || error.response?.status === 403) {
				localStorage.removeItem('adminToken');
				navigate('/admin/login');
				return;
			}
			alert('Failed to load dashboard data. Please ensure you have admin access.');
		} finally {
			setLoading(false);
		}
	};

	const loadAnalytics = async () => {
		setLoading(true);
		try {
			const data = await adminService.getAnalytics();
			setAnalytics(data);
		} catch (error) {
			console.error('Failed to load analytics:', error);
		} finally {
			setLoading(false);
		}
	};

	const loadHomeowners = async () => {
		setLoading(true);
		try {
			const data = await adminService.getHomeowners({ search: searchTerm });
			setHomeowners(data.homeowners);
		} catch (error) {
			console.error('Failed to load homeowners:', error);
		} finally {
			setLoading(false);
		}
	};

	const loadTradespeople = async () => {
		setLoading(true);
		try {
			const data = await adminService.getTradespeople({ search: searchTerm });
			setTradespeople(data.tradespeople);
		} catch (error) {
			console.error('Failed to load tradespeople:', error);
		} finally {
			setLoading(false);
		}
	};

	const loadTransactions = async () => {
		setLoading(true);
		try {
			const data = await adminService.getTransactions({ type: transactionFilter });
			setTransactions(data.transactions);
		} catch (error) {
			console.error('Failed to load transactions:', error);
		} finally {
			setLoading(false);
		}
	};

	const loadBoostPrices = async () => {
		try {
			const data = await adminService.getBoostPlanPrices();
			setBoostPrices(data.prices);
		} catch (error) {
			console.error('Failed to load boost prices:', error);
		}
	};

	const loadPricing = async () => {
		try {
			const data = await adminService.getPricing();
			setDefaultLeadPrice(data.pricing.defaultLeadPrice?.toString() || '9.99');
			setMaxLeadPurchases(data.pricing.maxLeadPurchases?.toString() || '6');
			setDirectoryPrice(data.pricing.directoryPrice?.toString() || '0.99');
		} catch (error) {
			console.error('Failed to load pricing:', error);
		}
	};

	const loadDirectoryListings = async () => {
		setLoading(true);
		try {
			const data = await adminService.getDirectoryListings({ 
				search: searchTerm, 
				status: directoryFilter !== 'all' ? directoryFilter : undefined 
			});
			setDirectoryListings(data.listings);
		} catch (error) {
			console.error('Failed to load directory listings:', error);
		} finally {
			setLoading(false);
		}
	};

	const loadSocialLinks = async () => {
		try {
			const data = await adminService.getSocialMediaLinks();
			setSocialLinks(data.socialLinks || { facebook: '', instagram: '', twitter: '', linkedin: '' });
		} catch (error) {
			console.error('Failed to load social links:', error);
		}
	};

	const handleUpdateDirectoryStatus = async (userId: string, status: string) => {
		try {
			await adminService.updateDirectoryStatus(userId, { 
				directoryStatus: status,
				hasDirectoryListing: status === 'active'
			});
			alert('Directory status updated successfully');
			loadDirectoryListings();
		} catch (error) {
			console.error('Failed to update directory status:', error);
			alert('Failed to update directory status');
		}
	};

	const handleSaveSocialLinks = async () => {
		setSavingSocialLinks(true);
		setSocialLinksMessage(null);
		try {
			await adminService.updateSocialMediaLinks(socialLinks);
			setSocialLinksMessage({ type: 'success', text: 'Social media links updated successfully!' });
		} catch (error: any) {
			setSocialLinksMessage({ 
				type: 'error', 
				text: error.response?.data?.error || 'Failed to update social media links' 
			});
		} finally {
			setSavingSocialLinks(false);
		}
	};

	const handleChangePassword = async () => {
		if (newPassword !== confirmPassword) {
			setPasswordMessage({ type: 'error', text: 'New passwords do not match' });
			return;
		}

		if (newPassword.length < 8) {
			setPasswordMessage({ type: 'error', text: 'Password must be at least 8 characters' });
			return;
		}

		setSavingPassword(true);
		setPasswordMessage(null);

		try {
			await adminService.changePassword({ currentPassword, newPassword });
			setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
			setCurrentPassword('');
			setNewPassword('');
			setConfirmPassword('');
		} catch (error: any) {
			setPasswordMessage({ 
				type: 'error', 
				text: error.response?.data?.error || 'Failed to change password' 
			});
		} finally {
			setSavingPassword(false);
		}
	};

	const handleUpdateBoostPrices = async () => {
		setSavingPrices(true);
		setPriceMessage(null);

		try {
			await adminService.updateBoostPlanPrices(boostPrices);
			setPriceMessage({ type: 'success', text: 'Boost plan prices updated successfully!' });
		} catch (error: any) {
			setPriceMessage({ 
				type: 'error', 
				text: error.response?.data?.error || 'Failed to update prices' 
			});
		} finally {
			setSavingPrices(false);
		}
	};

	const handleUpdateUserStatus = async (userId: string, status: string, type: 'account' | 'verification') => {
		try {
			const data = type === 'account' 
				? { accountStatus: status }
				: { verificationStatus: status };
			
			await adminService.updateUserStatus(userId, data);
			alert('User status updated successfully');
			
			// Reload data
			if (activeTab === 'homeowners') {
				loadHomeowners();
			} else if (activeTab === 'tradespeople') {
				loadTradespeople();
			}
			setShowUserModal(false);
		} catch (error) {
			console.error('Failed to update user status:', error);
			alert('Failed to update user status');
		}
	};

	const handleDeleteUser = async (userId: string) => {
		if (!confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) {
			return;
		}

		try {
			await adminService.deleteUser(userId);
			alert('User deleted successfully');
			
			// Reload data
			if (activeTab === 'homeowners') {
				loadHomeowners();
			} else if (activeTab === 'tradespeople') {
				loadTradespeople();
			}
			setShowUserModal(false);
		} catch (error) {
			console.error('Failed to delete user:', error);
			alert('Failed to delete user');
		}
	};

	const handleEditUser = () => {
		setEditingUser({
			name: selectedUser.name || '',
			email: selectedUser.email || '',
			phone: selectedUser.phone || '',
			location: selectedUser.location || '',
			postcode: selectedUser.workPostcode || selectedUser.postcode || 'W1K 3DE',
			trades: selectedUser.trades || [],
			workingArea: selectedUser.workingArea || null, // Ensure workingArea is included
			jobRadius: selectedUser.jobRadius || 15,
		});
	};

	const handleSaveUser = async () => {
		if (!selectedUser || !editingUser) return;

		setSavingUser(true);
		try {
			await adminService.updateUser(selectedUser.id, editingUser);
			alert('User updated successfully');
			
			// Reload data
			if (activeTab === 'homeowners') {
				loadHomeowners();
			} else if (activeTab === 'tradespeople') {
				loadTradespeople();
			}
			setEditingUser(null);
			setShowUserModal(false);
		} catch (error: any) {
			console.error('Failed to update user:', error);
			alert(error.response?.data?.error || 'Failed to update user');
		} finally {
			setSavingUser(false);
		}
	};

	const handleUpdatePricing = async () => {
		setSavingPricing(true);
		try {
			await adminService.updatePricing({ 
				defaultLeadPrice: parseFloat(defaultLeadPrice),
				maxLeadPurchases: parseInt(maxLeadPurchases),
				directoryPrice: parseFloat(directoryPrice)
			});
			alert('Pricing updated successfully');
		} catch (error) {
			console.error('Failed to update pricing:', error);
			alert('Failed to update pricing');
		} finally {
			setSavingPricing(false);
		}
	};

	const renderDashboard = () => (
		<div className="space-y-6">
			{/* Stats Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-600 font-medium">Total Users</p>
							<p className="text-3xl font-bold text-gray-900 mt-2">
								{dashboardStats?.stats.totalUsers || 0}
							</p>
						</div>
						<div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
							<Users className="w-6 h-6 text-blue-600" />
						</div>
					</div>
				</div>

				<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-600 font-medium">Total Jobs</p>
							<p className="text-3xl font-bold text-gray-900 mt-2">
								{dashboardStats?.stats.totalJobs || 0}
							</p>
						</div>
						<div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
							<Briefcase className="w-6 h-6 text-green-600" />
						</div>
					</div>
				</div>

				<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-600 font-medium">Total Reviews</p>
							<p className="text-3xl font-bold text-gray-900 mt-2">
								{dashboardStats?.stats.totalReviews || 0}
							</p>
						</div>
						<div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
							<FileText className="w-6 h-6 text-yellow-600" />
						</div>
					</div>
				</div>

				<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm text-gray-600 font-medium">Conversations</p>
							<p className="text-3xl font-bold text-gray-900 mt-2">
								{dashboardStats?.stats.totalConversations || 0}
							</p>
						</div>
						<div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
							<TrendingUp className="w-6 h-6 text-purple-600" />
						</div>
					</div>
				</div>
			</div>

			{/* Recent Activity */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
					<h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Jobs</h3>
					<div className="space-y-3">
						{dashboardStats?.recentActivity.jobs.map((job) => (
							<div key={job.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
								<div>
									<p className="font-medium text-gray-900">{job.title}</p>
									<p className="text-sm text-gray-500">by {job.poster.name}</p>
								</div>
								<p className="text-xs text-gray-400">
									{new Date(job.createdAt).toLocaleDateString()}
								</p>
							</div>
						))}
					</div>
				</div>

				<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
					<h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Users</h3>
					<div className="space-y-3">
						{dashboardStats?.recentActivity.users.map((user) => (
							<div key={user.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
								<div>
									<p className="font-medium text-gray-900">{user.name}</p>
									<p className="text-sm text-gray-500">{user.email}</p>
								</div>
								<span className={`px-2 py-1 rounded text-xs font-medium ${
									user.type === 'homeowner' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
								}`}>
									{user.type}
								</span>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);

	const renderHomeowners = () => (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="text-2xl font-bold text-gray-900">Homeowners</h2>
				<div className="relative">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
					<input
						type="text"
						placeholder="Search homeowners..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					/>
				</div>
			</div>

			<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="bg-gray-50 border-b border-gray-200">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jobs Posted</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{homeowners.map((homeowner) => (
								<tr key={homeowner.id} className="hover:bg-gray-50">
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="font-medium text-gray-900">{homeowner.name}</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										{homeowner.email}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										{homeowner.phone || 'N/A'}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										{homeowner.location || 'N/A'}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										{homeowner.postedJobLeads?.length || 0}
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<span className={`px-2 py-1 rounded-full text-xs font-medium ${
											homeowner.accountStatus === 'active' 
												? 'bg-green-100 text-green-700' 
												: homeowner.accountStatus === 'parked'
												? 'bg-yellow-100 text-yellow-700'
												: 'bg-red-100 text-red-700'
										}`}>
											{homeowner.accountStatus}
										</span>
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm">
										<button
											onClick={() => {
												setSelectedUser(homeowner);
												setShowUserModal(true);
											}}
											className="text-blue-600 hover:text-blue-700 mr-3"
										>
											<Eye className="w-5 h-5" />
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);

	const renderTradespeople = () => (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="text-2xl font-bold text-gray-900">Tradespeople</h2>
				<div className="relative">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
					<input
						type="text"
						placeholder="Search tradespeople..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					/>
				</div>
			</div>

			<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="bg-gray-50 border-b border-gray-200">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trades</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Membership</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{tradespeople.map((tradesperson) => (
								<tr key={tradesperson.id} className="hover:bg-gray-50">
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="font-medium text-gray-900">{tradesperson.name}</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										{tradesperson.email}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										{tradesperson.phone || 'N/A'}
									</td>
									<td className="px-6 py-4 text-sm text-gray-500">
										{tradesperson.trades?.join(', ') || 'N/A'}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										{tradesperson.location || 'N/A'}
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<span className={`px-2 py-1 rounded-full text-xs font-medium ${
											tradesperson.membershipType === 'premium' 
												? 'bg-purple-100 text-purple-700' 
												: tradesperson.membershipType === 'basic'
												? 'bg-blue-100 text-blue-700'
												: 'bg-gray-100 text-gray-700'
										}`}>
											{tradesperson.membershipType || 'none'}
										</span>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<span className={`px-2 py-1 rounded-full text-xs font-medium ${
											tradesperson.accountStatus === 'active' 
												? 'bg-green-100 text-green-700' 
												: tradesperson.accountStatus === 'parked'
												? 'bg-yellow-100 text-yellow-700'
												: 'bg-red-100 text-red-700'
										}`}>
											{tradesperson.accountStatus}
										</span>
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm">
										<button
											onClick={() => {
												setSelectedUser(tradesperson);
												setShowUserModal(true);
											}}
											className="text-blue-600 hover:text-blue-700 mr-3"
										>
											<Eye className="w-5 h-5" />
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);

	const renderTransactions = () => (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="text-2xl font-bold text-gray-900">All Transactions</h2>
				<div className="flex items-center gap-4">
					<select
						value={transactionFilter}
						onChange={(e) => setTransactionFilter(e.target.value)}
						className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					>
						<option value="all">All Types</option>
						<option value="credits_topup">Balance Top-ups</option>
						<option value="job_lead_purchase">Lead Purchases</option>
						<option value="membership_purchase">Boost Plans</option>
						<option value="directory_subscription">Directory Subscriptions</option>
					</select>
					<button
						onClick={loadTransactions}
						className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
					>
						<RefreshCw className="w-4 h-4" />
						Refresh
					</button>
				</div>
			</div>

			<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="bg-gray-50 border-b border-gray-200">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Type</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{transactions.length === 0 ? (
								<tr>
									<td colSpan={7} className="px-6 py-12 text-center text-gray-500">
										No transactions found
									</td>
								</tr>
							) : (
								transactions.map((transaction: any) => (
									<tr key={transaction.id} className="hover:bg-gray-50">
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
											{new Date(transaction.date).toLocaleDateString()} {new Date(transaction.date).toLocaleTimeString()}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<div className="font-medium text-gray-900">{transaction.user?.name || 'Unknown'}</div>
											<div className="text-sm text-gray-500">{transaction.user?.email}</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span className={`px-2 py-1 rounded-full text-xs font-medium ${
												transaction.userType === 'homeowner' 
													? 'bg-blue-100 text-blue-700' 
													: 'bg-green-100 text-green-700'
											}`}>
												{transaction.userType}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span className={`px-2 py-1 rounded-full text-xs font-medium ${
												transaction.type === 'credits_topup' ? 'bg-green-100 text-green-700' :
												transaction.type === 'job_lead_purchase' ? 'bg-blue-100 text-blue-700' :
												transaction.type === 'membership_purchase' ? 'bg-purple-100 text-purple-700' :
												'bg-gray-100 text-gray-700'
											}`}>
												{transaction.type.replace(/_/g, ' ')}
											</span>
										</td>
										<td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
											{transaction.description}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
											£{transaction.amount.toFixed(2)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span className={`px-2 py-1 rounded-full text-xs font-medium ${
												transaction.status === 'succeeded' ? 'bg-green-100 text-green-700' :
												transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
												'bg-red-100 text-red-700'
											}`}>
												{transaction.status}
											</span>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);

	const renderDirectory = () => (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="text-2xl font-bold text-gray-900">Directory Listings</h2>
				<div className="flex items-center gap-4">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
						<input
							type="text"
							placeholder="Search listings..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						/>
					</div>
					<select
						value={directoryFilter}
						onChange={(e) => setDirectoryFilter(e.target.value)}
						className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					>
						<option value="all">All Status</option>
						<option value="active">Active</option>
						<option value="paused">Paused</option>
						<option value="suspended">Suspended</option>
					</select>
				</div>
			</div>

			<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="bg-gray-50 border-b border-gray-200">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tradesperson</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Listing Expiry</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{directoryListings.map((listing) => (
								<tr key={listing.id} className="hover:bg-gray-50">
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="font-medium text-gray-900">{listing.name}</div>
										<div className="text-sm text-gray-500">{listing.trades?.join(', ')}</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<div className="text-sm text-gray-900">{listing.email}</div>
										<div className="text-sm text-gray-500">{listing.phone || 'N/A'}</div>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										<span className={`px-2 py-1 rounded-full text-xs font-medium ${
											listing.directoryStatus === 'active' 
												? 'bg-green-100 text-green-700' 
												: listing.directoryStatus === 'paused'
												? 'bg-yellow-100 text-yellow-700'
												: 'bg-red-100 text-red-700'
										}`}>
											{listing.directoryStatus}
										</span>
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										{listing.directoryListingExpiry 
											? new Date(listing.directoryListingExpiry).toLocaleDateString()
											: 'N/A'}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm">
										<div className="flex items-center space-x-3">
											{listing.directoryStatus === 'active' ? (
												<button
													onClick={() => handleUpdateDirectoryStatus(listing.id, 'paused')}
													className="text-yellow-600 hover:text-yellow-700"
													title="Pause Listing"
												>
													<Pause className="w-5 h-5" />
												</button>
											) : (
												<button
													onClick={() => handleUpdateDirectoryStatus(listing.id, 'active')}
													className="text-green-600 hover:text-green-700"
													title="Activate Listing"
												>
													<Play className="w-5 h-5" />
												</button>
											)}
											<button
												onClick={() => handleUpdateDirectoryStatus(listing.id, 'suspended')}
												className="text-red-600 hover:text-red-700"
												title="Suspend Listing"
											>
												<XCircle className="w-5 h-5" />
											</button>
										</div>
									</td>
								</tr>
							))}
							{directoryListings.length === 0 && (
								<tr>
									<td colSpan={5} className="px-6 py-12 text-center text-gray-500">
										No directory listings found
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);

	const renderSettings = () => (
		<div className="space-y-6">
			<h2 className="text-2xl font-bold text-gray-900">Settings</h2>
			
			<div className="flex border-b border-gray-200">
				<button
					className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
						settingsTab === 'pricing' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
					}`}
					onClick={() => setSettingsTab('pricing')}
				>
					General Pricing
				</button>
				<button
					className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
						settingsTab === 'boost' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
					}`}
					onClick={() => setSettingsTab('boost')}
				>
					Boost Plans
				</button>
				<button
					className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
						settingsTab === 'social' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
					}`}
					onClick={() => setSettingsTab('social')}
				>
					Social Media
				</button>
				<button
					className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
						settingsTab === 'security' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
					}`}
					onClick={() => setSettingsTab('security')}
				>
					Security
				</button>
			</div>

			<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
				{settingsTab === 'pricing' && (
					<div className="max-w-md space-y-6">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Default Job Lead Price (£)
							</label>
							<div className="relative">
								<DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
								<input
									type="number"
									step="0.01"
									value={defaultLeadPrice}
									onChange={(e) => setDefaultLeadPrice(e.target.value)}
									className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								/>
							</div>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Directory Listing Price (£/month)
							</label>
							<div className="relative">
								<DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
								<input
									type="number"
									step="0.01"
									value={directoryPrice}
									onChange={(e) => setDirectoryPrice(e.target.value)}
									className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								/>
							</div>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Max Purchases per Lead
							</label>
							<div className="relative">
								<Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
								<input
									type="number"
									value={maxLeadPurchases}
									onChange={(e) => setMaxLeadPurchases(e.target.value)}
									className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								/>
							</div>
						</div>

						<button
							onClick={handleUpdatePricing}
							disabled={savingPricing}
							className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
						>
							{savingPricing ? (
								<>
									<RefreshCw className="w-4 h-4 mr-2 animate-spin" />
									Saving...
								</>
							) : (
								<>
									<Save className="w-4 h-4 mr-2" />
									Save Pricing
								</>
							)}
						</button>
					</div>
				)}

				{settingsTab === 'boost' && (
					<div className="space-y-6">
						{priceMessage && (
							<div className={`p-4 rounded-lg ${priceMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
								{priceMessage.text}
							</div>
						)}
						{Object.entries(boostPrices).map(([key, plan]) => (
							<div key={key} className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 border border-gray-100 rounded-lg bg-gray-50">
								<div>
									<label className="block text-xs font-medium text-gray-500 uppercase mb-1">Plan Name</label>
									<p className="font-medium text-gray-900">{plan.name}</p>
								</div>
								<div>
									<label className="block text-xs font-medium text-gray-500 uppercase mb-2">Price (£)</label>
									<input
										type="number"
										step="0.01"
										value={plan.price}
										onChange={(e) => {
											setBoostPrices(prev => ({
												...prev,
												[key]: { ...prev[key], price: parseFloat(e.target.value) }
											}));
										}}
										className="w-full px-3 py-2 border border-gray-300 rounded-md"
									/>
								</div>
								<div>
									<label className="block text-xs font-medium text-gray-500 uppercase mb-1">Duration (Days)</label>
									<p className="font-medium text-gray-900">{plan.duration}</p>
								</div>
							</div>
						))}
						<button
							onClick={handleUpdateBoostPrices}
							disabled={savingPrices}
							className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
						>
							<Save className="w-4 h-4 mr-2" />
							{savingPrices ? 'Saving...' : 'Save Boost Prices'}
						</button>
					</div>
				)}

				{settingsTab === 'social' && (
					<div className="max-w-md space-y-6">
						{socialLinksMessage && (
							<div className={`p-4 rounded-lg ${socialLinksMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
								{socialLinksMessage.text}
							</div>
						)}
						{[
							{ key: 'facebook', label: 'Facebook', icon: Facebook },
							{ key: 'instagram', label: 'Instagram', icon: Instagram },
							{ key: 'twitter', label: 'Twitter', icon: Twitter },
							{ key: 'linkedin', label: 'LinkedIn', icon: Linkedin },
						].map(({ key, label, icon: Icon }) => (
							<div key={key}>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									{label} URL
								</label>
								<div className="relative">
									<Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
									<input
										type="url"
										value={socialLinks[key as keyof typeof socialLinks]}
										onChange={(e) => setSocialLinks(prev => ({ ...prev, [key]: e.target.value }))}
										placeholder={`https://${label.toLowerCase()}.com/...`}
										className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									/>
								</div>
							</div>
						))}

						<button
							onClick={handleSaveSocialLinks}
							disabled={savingSocialLinks}
							className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
						>
							<Save className="w-4 h-4 mr-2" />
							{savingSocialLinks ? 'Saving...' : 'Save Social Links'}
						</button>
					</div>
				)}

				{settingsTab === 'security' && (
					<div className="max-w-md space-y-6">
						<h3 className="text-lg font-semibold text-gray-900 mb-6">Change Password</h3>
									
						{passwordMessage && (
							<div className={`p-4 rounded-lg mb-6 ${
								passwordMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
							}`}>
								{passwordMessage.text}
							</div>
						)}

						<div className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Current Password
								</label>
								<div className="relative">
									<Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
									<input
										type={showCurrentPassword ? 'text' : 'password'}
										value={currentPassword}
										onChange={(e) => setCurrentPassword(e.target.value)}
										className="pl-10 pr-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									/>
									<button
										onClick={() => setShowCurrentPassword(!showCurrentPassword)}
										className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
									>
										{showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
									</button>
								</div>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									New Password
								</label>
								<div className="relative">
									<Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
									<input
										type={showNewPassword ? 'text' : 'password'}
										value={newPassword}
										onChange={(e) => setNewPassword(e.target.value)}
										className="pl-10 pr-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									/>
									<button
										onClick={() => setShowNewPassword(!showNewPassword)}
										className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
									>
										{showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
									</button>
								</div>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Confirm New Password
								</label>
								<div className="relative">
									<Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
									<input
										type="password"
										value={confirmPassword}
										onChange={(e) => setConfirmPassword(e.target.value)}
										className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									/>
								</div>
							</div>

							<button
								onClick={handleChangePassword}
								disabled={savingPassword}
								className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
							>
								{savingPassword ? (
									<>
										<RefreshCw className="w-4 h-4 mr-2 animate-spin" />
										Saving...
									</>
								) : (
									<>
										<Save className="w-4 h-4 mr-2" />
										Change Password
									</>
								)}
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);

	const renderAnalytics = () => (
		<div className="space-y-6">
			<h2 className="text-2xl font-bold text-gray-900">Analytics & Reporting</h2>

			{analytics && (
				<>
					{/* User Analytics */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
							<h3 className="text-sm font-medium text-gray-600 mb-4">Homeowners</h3>
							<div className="space-y-2">
								<div className="flex justify-between">
									<span className="text-sm text-gray-500">Total:</span>
									<span className="font-semibold">{analytics.users.totalHomeowners}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-sm text-gray-500">Active:</span>
									<span className="font-semibold text-green-600">{analytics.users.activeHomeowners}</span>
								</div>
							</div>
						</div>

						<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
							<h3 className="text-sm font-medium text-gray-600 mb-4">Tradespeople</h3>
							<div className="space-y-2">
								<div className="flex justify-between">
									<span className="text-sm text-gray-500">Total:</span>
									<span className="font-semibold">{analytics.users.totalTradespeople}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-sm text-gray-500">Active:</span>
									<span className="font-semibold text-green-600">{analytics.users.activeTradespeople}</span>
								</div>
							</div>
						</div>

						<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
							<h3 className="text-sm font-medium text-gray-600 mb-4">Recent Signups</h3>
							<div className="text-3xl font-bold text-blue-600">
								{analytics.users.recentSignups}
							</div>
							<p className="text-sm text-gray-500 mt-1">Last 30 days</p>
						</div>
					</div>

					{/* Revenue & Jobs */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
							<h3 className="text-lg font-medium mb-2">Total Revenue</h3>
							<div className="text-4xl font-bold">
								£{analytics.revenue.total}
							</div>
							<p className="text-green-100 text-sm mt-2">From lead purchases</p>
						</div>

						<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
							<h3 className="text-sm font-medium text-gray-600 mb-4">Jobs</h3>
							<div className="space-y-2">
								<div className="flex justify-between">
									<span className="text-sm text-gray-500">Total Jobs:</span>
									<span className="font-semibold">{analytics.jobs.totalJobs}</span>
								</div>
								<div className="flex justify-between">
									<span className="text-sm text-gray-500">Active Jobs:</span>
									<span className="font-semibold text-green-600">{analytics.jobs.activeJobs}</span>
								</div>
							</div>
						</div>
					</div>

					{/* Membership Distribution */}
					<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
						<h3 className="text-lg font-semibold text-gray-900 mb-4">Membership Distribution</h3>
						<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
							{analytics.memberships.map((membership) => (
								<div key={membership.membershipType} className="text-center p-4 bg-gray-50 rounded-lg">
									<div className="text-2xl font-bold text-gray-900">{membership._count}</div>
									<div className="text-sm text-gray-600 mt-1 capitalize">
										{membership.membershipType || 'None'}
									</div>
								</div>
							))}
						</div>
					</div>
				</>
			)}
		</div>
	);


	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Header */}
				<div className="mb-8">
					<button
						onClick={() => navigate('/')}
						className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
					>
						<ArrowLeft className="w-5 h-5 mr-2" />
						Back to Home
					</button>
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
							<p className="text-gray-600 mt-2">Comprehensive site management and analytics</p>
						</div>
						<div className="flex items-center space-x-2">
							<Shield className="w-8 h-8 text-blue-600" />
						</div>
					</div>
				</div>

				{/* Tabs */}
				<div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
					<div className="flex overflow-x-auto">
						<button
							onClick={() => setActiveTab('dashboard')}
							className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
								activeTab === 'dashboard'
									? 'border-blue-600 text-blue-600'
									: 'border-transparent text-gray-600 hover:text-gray-900'
							}`}
						>
							<BarChart3 className="w-5 h-5 mr-2" />
							Dashboard
						</button>
						<button
							onClick={() => setActiveTab('homeowners')}
							className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
								activeTab === 'homeowners'
									? 'border-blue-600 text-blue-600'
									: 'border-transparent text-gray-600 hover:text-gray-900'
							}`}
						>
							<Users className="w-5 h-5 mr-2" />
							Homeowners
						</button>
						<button
							onClick={() => setActiveTab('tradespeople')}
							className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
								activeTab === 'tradespeople'
									? 'border-blue-600 text-blue-600'
									: 'border-transparent text-gray-600 hover:text-gray-900'
							}`}
						>
							<UserCheck className="w-5 h-5 mr-2" />
							Tradespeople
						</button>
						<button
							onClick={() => setActiveTab('directory')}
							className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
								activeTab === 'directory'
									? 'border-blue-600 text-blue-600'
									: 'border-transparent text-gray-600 hover:text-gray-900'
							}`}
						>
							<BookOpen className="w-5 h-5 mr-2" />
							Directory
						</button>
						<button
							onClick={() => setActiveTab('transactions')}
							className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
								activeTab === 'transactions'
									? 'border-blue-600 text-blue-600'
									: 'border-transparent text-gray-600 hover:text-gray-900'
							}`}
						>
							<DollarSign className="w-5 h-5 mr-2" />
							Transactions
						</button>
						<button
							onClick={() => setActiveTab('analytics')}
							className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
								activeTab === 'analytics'
									? 'border-blue-600 text-blue-600'
									: 'border-transparent text-gray-600 hover:text-gray-900'
							}`}
						>
							<TrendingUp className="w-5 h-5 mr-2" />
							Analytics
						</button>
						<button
							onClick={() => setActiveTab('settings')}
							className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
								activeTab === 'settings'
									? 'border-blue-600 text-blue-600'
									: 'border-transparent text-gray-600 hover:text-gray-900'
							}`}
						>
							<Settings className="w-5 h-5 mr-2" />
							Settings
						</button>
					</div>
				</div>

				{/* Content */}
				{loading ? (
					<div className="flex justify-center py-12">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
					</div>
				) : (
					<>
						{activeTab === 'dashboard' && renderDashboard()}
						{activeTab === 'homeowners' && renderHomeowners()}
						{activeTab === 'tradespeople' && renderTradespeople()}
						{activeTab === 'directory' && renderDirectory()}
						{activeTab === 'transactions' && renderTransactions()}
						{activeTab === 'analytics' && renderAnalytics()}
						{activeTab === 'settings' && renderSettings()}
					</>
				)}

				{/* User Details Modal */}
				{showUserModal && selectedUser && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
						<div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
							<div className="p-6 border-b border-gray-200">
								<div className="flex items-center justify-between">
									<h3 className="text-xl font-semibold text-gray-900">
										{editingUser ? 'Edit User' : 'User Details'}
									</h3>
									<div className="flex items-center gap-2">
										{!editingUser && (
											<button
												onClick={handleEditUser}
												className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
											>
												<Edit className="w-5 h-5" />
												Edit
											</button>
										)}
										<button
											onClick={() => {
												setShowUserModal(false);
												setEditingUser(null);
											}}
											className="text-gray-500 hover:text-gray-700"
										>
											<XCircle className="w-6 h-6" />
										</button>
									</div>
								</div>
							</div>

							<div className="p-6 space-y-4">
								{editingUser ? (
									<>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<div>
												<label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
												<input
													type="text"
													value={editingUser.name}
													onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
													className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
												/>
											</div>
											<div>
												<label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
												<input
													type="email"
													value={editingUser.email}
													onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
													className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
												/>
											</div>
											<div>
												<label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
													<Phone className="w-4 h-4" />
													Phone
												</label>
												<input
													type="tel"
													value={editingUser.phone}
													onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
													className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
												/>
											</div>
											<div>
												<label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
													<MapPin className="w-4 h-4" />
													Location
												</label>
												<input
													type="text"
													value={editingUser.location}
													onChange={(e) => setEditingUser({ ...editingUser, location: e.target.value })}
													className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
												/>
											</div>
											<div>
												<label className="block text-sm font-medium text-gray-700 mb-1">
													Postcode
												</label>
												<input
													type="text"
													value={editingUser.postcode}
													onChange={(e) => setEditingUser({ ...editingUser, postcode: e.target.value.toUpperCase() })}
													className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
												/>
											</div>
											{selectedUser.type === 'tradesperson' && (
												<div>
													<label className="block text-sm font-medium text-gray-700 mb-1">
														Job Radius (miles)
													</label>
													<input
														type="number"
														min="1"
														max="200"
														value={editingUser.jobRadius}
														onChange={(e) => setEditingUser({ ...editingUser, jobRadius: parseInt(e.target.value) || 15 })}
														className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
													/>
												</div>
											)}
										</div>

										{selectedUser.type === 'tradesperson' && (
											<>
												<div>
													<label className="block text-sm font-medium text-gray-700 mb-2">
														Trades
													</label>
													{editingUser.trades?.length > 0 && (
														<div className="flex flex-wrap gap-2 mb-2">
															{editingUser.trades.map((trade: string) => (
																<span
																	key={trade}
																	className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
																>
																	{trade}
																	<button
																		type="button"
																		onClick={() => setEditingUser({ ...editingUser, trades: editingUser.trades.filter((t: string) => t !== trade) })}
																		className="ml-1 text-blue-600 hover:text-blue-800"
																	>
																		×
																	</button>
																</span>
															))}
														</div>
													)}
													<div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3 space-y-2">
														{[
															'Builder', 'Electrician', 'Handyman', 'Painter & Decorator', 'Plasterer',
															'Plumber', 'Roofer', 'Carpenter & Joiner', 'Landscaper', 'Bathroom Fitter',
															'Bricklayer', 'Gas Engineer', 'Carpet Fitter', 'Kitchen Fitter', 'Cabinet Maker',
															'Tiler', 'Door Fitter', 'Glazier', 'Stove Fitter', 'Window Fitter',
															'Tree Surgeon', 'Gardener', 'Locksmith', 'Architectural Designer', 'Groundworker',
															'Stonemason', 'Heating Engineer', 'Insulation Company', 'Fencer',
															'Waste & Rubbish Clearance Company', 'Demolition Company', 'Decking Installer',
															'Extension Builder', 'Security System Installer', 'Conservatory Installer',
															'Driveways Installer', 'Flooring Fitter', 'Guttering Installer',
															'Vinyl Flooring Fitter', 'Fireplace Installer', 'Architectural Technician',
															'Chimney Repair Specialist', 'Garden Maintenance Company', 'Loft Conversion Company',
															'Damp Proofer', 'Conversion Specialist', 'Garage Conversion Specialist',
															'New Home Builder', 'Repointing Specialist', 'Fascias & Soffits Installer',
															'Tarmac Driveway Company', 'Building Restoration & Refurbishment Company'
														].map((trade) => (
															<label key={trade} className="flex items-center cursor-pointer">
																<input
																	type="checkbox"
																	checked={editingUser.trades?.includes(trade)}
																	onChange={(e) => {
																		if (e.target.checked) {
																			setEditingUser({ ...editingUser, trades: [...(editingUser.trades || []), trade] });
																		} else {
																			setEditingUser({ ...editingUser, trades: editingUser.trades.filter((t: string) => t !== trade) });
																		}
																	}}
																	className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
																/>
																<span className="text-sm text-gray-700">{trade}</span>
															</label>
														))}
													</div>
												</div>
											</>
										)}
									</>
								) : (
									<>
										<div>
											<label className="text-sm font-medium text-gray-600">Name</label>
											<p className="text-gray-900">{selectedUser.name}</p>
										</div>
										<div>
											<label className="text-sm font-medium text-gray-600">Email</label>
											<p className="text-gray-900">{selectedUser.email}</p>
										</div>
										<div>
											<label className="text-sm font-medium text-gray-600 flex items-center gap-1">
												<Phone className="w-4 h-4" />
												Phone
											</label>
											<p className="text-gray-900">{selectedUser.phone || 'N/A'}</p>
										</div>
										<div>
											<label className="text-sm font-medium text-gray-600">Location</label>
											<p className="text-gray-900">{selectedUser.location || 'N/A'}</p>
										</div>
										<div>
											<label className="text-sm font-medium text-gray-600">Postcode</label>
											<p className="text-gray-900">{selectedUser.workPostcode || selectedUser.postcode || 'N/A'}</p>
										</div>
										{selectedUser.type === 'tradesperson' && (
											<>
												<div>
													<label className="text-sm font-medium text-gray-600">Trades</label>
													<p className="text-gray-900">{selectedUser.trades?.join(', ') || 'N/A'}</p>
												</div>
												<div>
													<label className="text-sm font-medium text-gray-600">Job Radius</label>
													<p className="text-gray-900">{selectedUser.jobRadius || 15} miles</p>
												</div>
											</>
										)}
									</>
								)}

								<div>
									<label className="text-sm font-medium text-gray-600">Account Status</label>
									<div className="flex items-center space-x-2 mt-2">
										<button
											onClick={() => handleUpdateUserStatus(selectedUser.id, 'active', 'account')}
											className={`px-3 py-1 rounded text-sm ${
												selectedUser.accountStatus === 'active'
													? 'bg-green-600 text-white'
													: 'bg-gray-200 text-gray-700 hover:bg-gray-300'
											}`}
										>
											Active
										</button>
										<button
											onClick={() => handleUpdateUserStatus(selectedUser.id, 'parked', 'account')}
											className={`px-3 py-1 rounded text-sm ${
												selectedUser.accountStatus === 'parked'
													? 'bg-yellow-600 text-white'
													: 'bg-gray-200 text-gray-700 hover:bg-gray-300'
											}`}
										>
											Parked
										</button>
										<button
											onClick={() => handleUpdateUserStatus(selectedUser.id, 'deleted', 'account')}
											className={`px-3 py-1 rounded text-sm ${
												selectedUser.accountStatus === 'deleted'
													? 'bg-red-600 text-white'
													: 'bg-gray-200 text-gray-700 hover:bg-gray-300'
											}`}
										>
											Suspended
										</button>
									</div>
								</div>
								<div>
									<label className="text-sm font-medium text-gray-600">Verification Status</label>
									<div className="flex items-center space-x-2 mt-2">
										<button
											onClick={() => handleUpdateUserStatus(selectedUser.id, 'verified', 'verification')}
											className={`px-3 py-1 rounded text-sm ${
												selectedUser.verificationStatus === 'verified'
													? 'bg-green-600 text-white'
													: 'bg-gray-200 text-gray-700 hover:bg-gray-300'
											}`}
										>
											Verified
										</button>
										<button
											onClick={() => handleUpdateUserStatus(selectedUser.id, 'pending', 'verification')}
											className={`px-3 py-1 rounded text-sm ${
												selectedUser.verificationStatus === 'pending'
													? 'bg-yellow-600 text-white'
													: 'bg-gray-200 text-gray-700 hover:bg-gray-300'
											}`}
										>
											Pending
										</button>
										<button
											onClick={() => handleUpdateUserStatus(selectedUser.id, 'rejected', 'verification')}
											className={`px-3 py-1 rounded text-sm ${
												selectedUser.verificationStatus === 'rejected'
													? 'bg-red-600 text-white'
													: 'bg-gray-200 text-gray-700 hover:bg-gray-300'
											}`}
										>
											Rejected
										</button>
									</div>
								</div>
							</div>

							<div className="p-6 border-t border-gray-200 flex justify-between">
								<button
									onClick={() => handleDeleteUser(selectedUser.id)}
									className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
								>
									<Trash2 className="w-4 h-4 mr-2" />
									Delete User
								</button>
								<div className="flex gap-2">
									{editingUser && (
										<>
											<button
												onClick={() => setEditingUser(null)}
												className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
											>
												Cancel
											</button>
											<button
												onClick={handleSaveUser}
												disabled={savingUser}
												className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50"
											>
												{savingUser ? (
													<>
														<RefreshCw className="w-4 h-4 mr-2 animate-spin" />
														Saving...
													</>
												) : (
													<>
														<Save className="w-4 h-4 mr-2" />
														Save Changes
													</>
												)}
											</button>
										</>
									)}
									{!editingUser && (
										<button
											onClick={() => {
												setShowUserModal(false);
												setEditingUser(null);
											}}
											className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
										>
											Close
										</button>
									)}
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default AdminDashboard;
