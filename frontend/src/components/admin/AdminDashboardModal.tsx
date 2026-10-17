import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Shield,
  Users,
  MessageSquare,
  MessagesSquare,
  Zap,
  HardDrive,
  Clock,
  RefreshCw,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Server,
  Activity,
  Layers,
  Search,
  Sparkles,
  BarChart3,
  Cpu,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import {
  AdminStats,
  AdminUserItem,
  AdminUsageResponse,
  AdminSystemResponse,
} from '../../types/admin';
import { User, ADMIN_EMAIL } from '../../types/auth';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
}

type TabType = 'overview' | 'users' | 'usage' | 'system';

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  currentUser,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [usage, setUsage] = useState<AdminUsageResponse | null>(null);
  const [system, setSystem] = useState<AdminSystemResponse | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [userToDelete, setUserToDelete] = useState<AdminUserItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Maintenance state
  const [isCleaning, setIsCleaning] = useState(false);
  const [cleanupMessage, setCleanupMessage] = useState<string | null>(null);

  const loadAllData = useCallback(async (quiet = false) => {
    if (!quiet) setIsLoading(true);
    else setIsRefreshing(true);
    setError(null);

    try {
      const [statsData, usersData, usageData, systemData] = await Promise.all([
        adminService.getStats(),
        adminService.getUsers(),
        adminService.getUsage(),
        adminService.getSystem(),
      ]);
      setStats(statsData);
      setUsers(usersData.users);
      setUsage(usageData);
      setSystem(systemData);
    } catch (err: any) {
      setError(err.message || 'Failed to load admin dashboard metrics.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadAllData();
    }
  }, [isOpen, loadAllData]);

  if (!isOpen) return null;

  const handleDeleteUser = async (user: AdminUserItem) => {
    if (user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) return;
    setIsDeleting(true);
    try {
      await adminService.deleteUser(user.id);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      setUserToDelete(null);
      // Reload stats quietly
      loadAllData(true);
    } catch (err: any) {
      alert(err.message || 'Failed to delete user.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRunCleanup = async () => {
    setIsCleaning(true);
    setCleanupMessage(null);
    try {
      const res = await adminService.runCleanup();
      setCleanupMessage(res.message);
      loadAllData(true);
    } catch (err: any) {
      setCleanupMessage(`Cleanup failed: ${err.message}`);
    } finally {
      setIsCleaning(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'Never';
    try {
      return new Date(dateStr).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return dateStr;
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-md animate-fade-in overflow-hidden">
      <div className="w-full max-w-5xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-[#0c111d] border border-slate-200/80 dark:border-slate-800 shadow-modal overflow-hidden animate-slide-up">
        {/* ── Modal Header ── */}
        <div className="px-6 py-4 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between shrink-0 bg-surface-50/50 dark:bg-[#070b14]/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800 flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-xs">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Admin Dashboard</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  {currentUser?.email || ADMIN_EMAIL}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Server analytics, registered accounts, hardware, and usage metrics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => loadAllData(true)}
              disabled={isRefreshing || isLoading}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors disabled:opacity-50"
              title="Refresh metrics"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-purple-500' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Tabs Navigation ── */}
        <div className="flex px-6 pt-3 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#0c111d] gap-2 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold border-b-2 transition-all shrink-0 ${
              activeTab === 'overview'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Overview</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold border-b-2 transition-all shrink-0 ${
              activeTab === 'users'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Users ({users.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('usage')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold border-b-2 transition-all shrink-0 ${
              activeTab === 'usage'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Usage & Models</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('system')}
            className={`flex items-center gap-2 pb-3 px-3 text-xs font-semibold border-b-2 transition-all shrink-0 ${
              activeTab === 'system'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>System & Health</span>
          </button>
        </div>

        {/* ── Main Scrollable Body ── */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs flex items-center gap-2.5 animate-fade-in">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin text-purple-500" />
              <p className="text-xs font-medium">Gathering server analytics & metrics...</p>
            </div>
          ) : (
            <>
              {/* ──────────────── TAB 1: OVERVIEW ──────────────── */}
              {activeTab === 'overview' && stats && (
                <div className="space-y-6 animate-fade-in">
                  {/* KPI Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                    {/* Total Users */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 shadow-card">
                      <div className="flex items-center justify-between text-slate-400 mb-2">
                        <span className="text-xs font-semibold">Total Users</span>
                        <Users className="w-4 h-4 text-blue-500" />
                      </div>
                      <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                        {stats.total_users}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">Registered accounts</p>
                    </div>

                    {/* Total Conversations */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 shadow-card">
                      <div className="flex items-center justify-between text-slate-400 mb-2">
                        <span className="text-xs font-semibold">Conversations</span>
                        <MessageSquare className="w-4 h-4 text-purple-500" />
                      </div>
                      <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                        {stats.total_conversations}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">Active chat threads</p>
                    </div>

                    {/* Total Messages */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 shadow-card">
                      <div className="flex items-center justify-between text-slate-400 mb-2">
                        <span className="text-xs font-semibold">Messages</span>
                        <MessagesSquare className="w-4 h-4 text-emerald-500" />
                      </div>
                      <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                        {stats.total_messages.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {stats.user_messages} user · {stats.assistant_messages} assistant
                      </p>
                    </div>

                    {/* Tokens Generated */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 shadow-card">
                      <div className="flex items-center justify-between text-slate-400 mb-2">
                        <span className="text-xs font-semibold">Tokens Generated</span>
                        <Zap className="w-4 h-4 text-amber-500" />
                      </div>
                      <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                        {stats.total_tokens.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">Ollama LAN inference</p>
                    </div>

                    {/* Avg Generation Latency */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 shadow-card">
                      <div className="flex items-center justify-between text-slate-400 mb-2">
                        <span className="text-xs font-semibold">Avg Response Time</span>
                        <Clock className="w-4 h-4 text-indigo-500" />
                      </div>
                      <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                        {stats.avg_generation_time_seconds}s
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">Per assistant reply</p>
                    </div>

                    {/* Attachments & Storage */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 shadow-card">
                      <div className="flex items-center justify-between text-slate-400 mb-2">
                        <span className="text-xs font-semibold">Uploads Storage</span>
                        <HardDrive className="w-4 h-4 text-pink-500" />
                      </div>
                      <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
                        {formatBytes(stats.total_storage_bytes)}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {stats.total_attachments} images attached
                      </p>
                    </div>

                    {/* Ollama Status */}
                    <div className="col-span-2 sm:col-span-3 lg:col-span-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 shadow-card flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          Ollama AI Host
                        </span>
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${
                              stats.ollama_status === 'connected'
                                ? 'bg-emerald-500 animate-pulse'
                                : 'bg-red-500'
                            }`}
                          />
                          <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                            {stats.ollama_base_url || 'Unconfigured'}
                          </p>
                        </div>
                        <p className="text-[10px] text-slate-400">
                          {stats.ollama_models_count} model(s) discovered on LAN
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`px-2.5 py-1 rounded-xl text-xs font-bold ${
                            stats.ollama_status === 'connected'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                          }`}
                        >
                          {stats.ollama_status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick summary card */}
                  <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-transparent border border-purple-200/60 dark:border-purple-900/40">
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          VickyAI Host Node Status
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                          Your server is operating normally. Only the authorized administrator account (
                          <strong className="text-purple-600 dark:text-purple-400">{ADMIN_EMAIL}</strong>) can view
                          this panel, manage registered users, and inspect hardware consumption.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ──────────────── TAB 2: USERS ──────────────── */}
              {activeTab === 'users' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="relative flex-1 max-w-md">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by username or email..."
                        className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                      />
                    </div>
                    <span className="text-xs text-slate-400 self-center">
                      Showing {filteredUsers.length} of {users.length} users
                    </span>
                  </div>

                  {/* Users Table */}
                  <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="py-3 px-4">User</th>
                          <th className="py-3 px-3">Role</th>
                          <th className="py-3 px-3">Conversations</th>
                          <th className="py-3 px-3">Messages</th>
                          <th className="py-3 px-3">Tokens</th>
                          <th className="py-3 px-3">Last Login</th>
                          <th className="py-3 px-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                        {filteredUsers.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-8 text-center text-slate-400">
                              No users match your search query.
                            </td>
                          </tr>
                        ) : (
                          filteredUsers.map((u) => {
                            const isPrimaryAdmin = u.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
                            return (
                              <tr
                                key={u.id}
                                className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors"
                              >
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 rounded-lg bg-gradient-brand text-white font-bold text-[11px] flex items-center justify-center uppercase shrink-0">
                                      {u.username.charAt(0)}
                                    </div>
                                    <div>
                                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                                        {u.username}
                                      </p>
                                      <p className="text-[10px] text-slate-400 font-mono">{u.email}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 px-3">
                                  {isPrimaryAdmin ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                                      <Shield className="w-2.5 h-2.5" /> Admin
                                    </span>
                                  ) : (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                      Member
                                    </span>
                                  )}
                                </td>
                                <td className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300">
                                  {u.conversations_count}
                                </td>
                                <td className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300">
                                  {u.messages_count}
                                </td>
                                <td className="py-3 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                                  {u.tokens_consumed.toLocaleString()}
                                </td>
                                <td className="py-3 px-3 text-[11px] text-slate-500 dark:text-slate-400">
                                  {formatDate(u.last_login)}
                                </td>
                                <td className="py-3 px-3 text-right">
                                  {isPrimaryAdmin ? (
                                    <span className="text-[10px] text-slate-400 italic">Protected</span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => setUserToDelete(u)}
                                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                                      title={`Delete ${u.username}`}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Delete Confirmation Dialog */}
                  {userToDelete && (
                    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
                      <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-modal animate-slide-up">
                        <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 flex items-center justify-center mb-3">
                          <Trash2 className="w-5 h-5" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Delete User Account?</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                          Are you sure you want to delete <strong className="text-slate-800 dark:text-slate-200">{userToDelete.username}</strong> ({userToDelete.email})?
                          This will permanently erase all their conversations, messages, and uploaded attachments.
                        </p>
                        <div className="flex items-center justify-end gap-2 mt-5">
                          <button
                            type="button"
                            disabled={isDeleting}
                            onClick={() => setUserToDelete(null)}
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            disabled={isDeleting}
                            onClick={() => handleDeleteUser(userToDelete)}
                            className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-colors"
                          >
                            {isDeleting ? 'Deleting...' : 'Delete User'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ──────────────── TAB 3: USAGE & MODELS ──────────────── */}
              {activeTab === 'usage' && usage && (
                <div className="space-y-6 animate-fade-in">
                  {/* Model Distribution Table */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-purple-500" />
                      <span>Model Inference Breakdown</span>
                    </h3>
                    <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-xs">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-800">
                          <tr>
                            <th className="py-3 px-4">Model Name</th>
                            <th className="py-3 px-3">Replies Generated</th>
                            <th className="py-3 px-3">Tokens Produced</th>
                            <th className="py-3 px-3">Avg Latency</th>
                            <th className="py-3 px-3">Share of Tokens</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                          {usage.models.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="py-8 text-center text-slate-400">
                                No inference data recorded yet.
                              </td>
                            </tr>
                          ) : (
                            usage.models.map((m) => {
                              const sharePct = usage.total_tokens > 0
                                ? Math.round((m.tokens_count / usage.total_tokens) * 100)
                                : 0;
                              return (
                                <tr
                                  key={m.model}
                                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors"
                                >
                                  <td className="py-3 px-4 font-mono font-bold text-purple-600 dark:text-purple-400">
                                    {m.model}
                                  </td>
                                  <td className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300">
                                    {m.messages_count.toLocaleString()}
                                  </td>
                                  <td className="py-3 px-3 font-mono text-slate-700 dark:text-slate-300">
                                    {m.tokens_count.toLocaleString()}
                                  </td>
                                  <td className="py-3 px-3 text-slate-600 dark:text-slate-400 font-mono">
                                    {m.avg_generation_time}s
                                  </td>
                                  <td className="py-3 px-3">
                                    <div className="flex items-center gap-2">
                                      <div className="w-20 bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                        <div
                                          className="bg-purple-500 h-full rounded-full"
                                          style={{ width: `${sharePct}%` }}
                                        />
                                      </div>
                                      <span className="font-mono text-[11px] text-slate-500">{sharePct}%</span>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Storage breakdown */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-pink-500" />
                      <span>Attachment Storage Types</span>
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800">
                        <p className="text-xs font-semibold text-slate-500">Total File Size</p>
                        <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                          {formatBytes(usage.storage_bytes)}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">{usage.attachments_count} total files</p>
                      </div>
                      {Object.entries(usage.mime_breakdown).map(([mime, count]) => (
                        <div
                          key={mime}
                          className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800"
                        >
                          <p className="text-xs font-mono font-semibold text-slate-500 truncate">{mime}</p>
                          <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">{count}</p>
                          <p className="text-[10px] text-slate-400 mt-1">images</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ──────────────── TAB 4: SYSTEM & HEALTH ──────────────── */}
              {activeTab === 'system' && system && (
                <div className="space-y-6 animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Database Health Card */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          system.database_connected
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-red-500/10 text-red-600 dark:text-red-400'
                        }`}
                      >
                        {system.database_connected ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <XCircle className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">PostgreSQL Database</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          Status: {system.database_connected ? 'Connected (Healthy)' : 'Unreachable'}
                        </p>
                      </div>
                    </div>

                    {/* Ollama Health Card */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          system.ollama_connected
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-red-500/10 text-red-600 dark:text-red-400'
                        }`}
                      >
                        {system.ollama_connected ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <XCircle className="w-5 h-5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">Ollama LAN Service</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono truncate">
                          {system.ollama_base_url}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Status: {system.ollama_connected ? 'Connected' : 'Offline / Connection Refused'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* System details list */}
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-4 space-y-3 text-xs">
                    <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500">Host OS / Kernel</span>
                      <span className="font-mono text-slate-800 dark:text-slate-200">{system.os_platform}</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500">Python Runtime</span>
                      <span className="font-mono text-slate-800 dark:text-slate-200">{system.python_version}</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500">Deployment Environment</span>
                      <span className="font-mono uppercase text-slate-800 dark:text-slate-200">
                        {system.environment}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500">Upload Storage Directory</span>
                      <span className="font-mono text-slate-800 dark:text-slate-200 truncate max-w-xs">
                        {system.upload_dir}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-slate-500">Disk Used by Uploads</span>
                      <span className="font-mono text-slate-800 dark:text-slate-200 font-bold">
                        {formatBytes(system.upload_dir_size_bytes)}
                      </span>
                    </div>
                  </div>

                  {/* Discovered Models on LAN */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-2">
                      Models Available on Ollama Host ({system.ollama_models.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {system.ollama_models.map((m) => (
                        <span
                          key={m}
                          className="px-2.5 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 text-purple-700 dark:text-purple-300 font-mono text-[11px] font-semibold"
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Maintenance Actions */}
                  <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-3">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <HardDrive className="w-3.5 h-3.5 text-amber-500" />
                        <span>Storage & Database Maintenance</span>
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        Scans the uploads directory and attachments table to purge orphaned database records and files
                        that no longer correspond to active chats.
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        disabled={isCleaning}
                        onClick={handleRunCleanup}
                        className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs font-semibold shadow-xs transition-all disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {isCleaning && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                        <span>{isCleaning ? 'Running Cleanup...' : 'Run Storage Cleanup'}</span>
                      </button>
                    </div>

                    {cleanupMessage && (
                      <p className="text-xs text-amber-800 dark:text-amber-300 font-mono bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                        {cleanupMessage}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
