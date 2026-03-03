import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import {
    Shield, AlertTriangle, Search,
    RefreshCw, Loader2, Monitor, Smartphone, Tablet,
    Globe, Clock, X, Lock, Eye, ShieldOff, Unlock, Ban
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface AuditLog {
    id: string;
    user: string | null;
    username: string | null;
    user_email: string | null;
    action: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    source: 'USER' | 'SYSTEM';
    ip_address: string | null;
    os: string | null;
    browser: string | null;
    device_type: string | null;
    user_agent: string | null;
    timestamp: string;
    metadata: Record<string, any>;
}

interface SecuritySummary {
    registrations_today: number;
    orders_last_hour: number;
    suspicious_logins_today: number;
    critical_events_today: number;
    total_logs: number;
    recent_flags: AuditLog[];
}

interface BlockedIP {
    id: number;
    username: string;
    ip_address: string;
    failures: number;
    last_attempt: string | null;
    user_agent: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const ACTION_LABELS: Record<string, string> = {
    registration: 'Registration',
    login: 'Login',
    order_created: 'Order Created',
    suspicious_login: 'Suspicious Login',
    role_change: 'Role Change',
    password_reset_request: 'Password Reset',
    password_reset_confirm: 'Password Confirm',
    account_lockout: 'Account Lockout',
    ip_unblocked: 'IP Unblocked',
    failed_login: 'Failed Login',
};

const SEV_STYLE: Record<string, string> = {
    LOW: 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800',
    MEDIUM: 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
    HIGH: 'bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800',
    CRITICAL: 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
};

const SEV_DOT: Record<string, string> = {
    LOW: 'bg-emerald-500', MEDIUM: 'bg-blue-500',
    HIGH: 'bg-orange-500', CRITICAL: 'bg-red-500 animate-pulse',
};

const DeviceIcon = ({ type }: { type: string | null }) => {
    if (type === 'Mobile') return <Smartphone className="w-3 h-3" />;
    if (type === 'Tablet') return <Tablet className="w-3 h-3" />;
    return <Monitor className="w-3 h-3" />;
};

const SeverityBadge = ({ severity }: { severity: AuditLog['severity'] }) => (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${SEV_STYLE[severity]}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${SEV_DOT[severity]}`} />
        {severity}
    </span>
);

const fmt = (ts: string) =>
    new Date(ts).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });

const avatar = (name: string | null) => (name || '?').charAt(0).toUpperCase();

// ── Compact Stat Card ─────────────────────────────────────────────────────────

const MiniStat = ({ label, value, color, alert }: {
    label: string; value: number | string; color: string; alert?: boolean;
}) => (
    <div className={`flex flex-col gap-0.5 px-4 py-3 rounded-xl border ${alert && Number(value) > 0
        ? 'border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900'
        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900'
        }`}>
        <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest whitespace-nowrap">
            {label}
        </span>
        <span
            className={`text-xl font-bold leading-none ${alert && Number(value) > 0 ? 'text-red-600 dark:text-red-400' : color
                }`}
            style={{ fontFamily: 'Outfit, Inter, sans-serif' }}
        >
            {value}
        </span>
    </div>
);

// ── Log Detail Modal ───────────────────────────────────────────────────────────

const LogDetailModal = ({ log, onClose }: { log: AuditLog; onClose: () => void }) => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-6 relative" onClick={e => e.stopPropagation()}>
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                    <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{ACTION_LABELS[log.action] || log.action}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{fmt(log.timestamp)}</p>
                </div>
                <SeverityBadge severity={log.severity} />
            </div>

            <div className="space-y-2.5 border-t border-gray-100 dark:border-gray-800 pt-4">
                {[
                    { label: 'Log ID', value: log.id, mono: true },
                    { label: 'User', value: log.username || 'Anonymous' },
                    { label: 'Email', value: log.user_email || '—' },
                    { label: 'Source', value: log.source },
                    { label: 'IP', value: log.ip_address || '—', mono: true },
                    { label: 'OS', value: log.os || '—' },
                    { label: 'Browser', value: log.browser || '—' },
                    { label: 'Device', value: log.device_type || '—' },
                ].map(row => (
                    <div key={row.label} className="flex justify-between gap-4 items-start">
                        <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 shrink-0 w-20">{row.label}</span>
                        <span className={`text-[11px] font-semibold text-gray-800 dark:text-gray-200 text-right break-all ${row.mono ? 'font-mono text-[10px]' : ''}`}>{row.value}</span>
                    </div>
                ))}

                {Object.keys(log.metadata || {}).length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                        <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-widest">Metadata</p>
                        <pre className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 font-mono text-[10px] text-gray-700 dark:text-gray-300 overflow-x-auto">
                            {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                    </div>
                )}

                {log.user_agent && (
                    <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                        <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">User-Agent</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 break-all font-mono leading-relaxed">{log.user_agent}</p>
                    </div>
                )}
            </div>
        </div>
    </div>
);

// ── Blocked IPs Tab ────────────────────────────────────────────────────────────

const BlockedIPsTab = () => {
    const [blocked, setBlocked] = useState<BlockedIP[]>([]);
    const [loading, setLoading] = useState(true);
    const [unblocking, setUnblocking] = useState<number | null>(null);
    const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

    const showToast = (msg: string, ok: boolean) => {
        setToast({ msg, ok });
        setTimeout(() => setToast(null), 4000);
    };

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await (api as any).client.get('blocked-ips/');
            setBlocked(res.data || []);
        } catch {
            setBlocked([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const unblock = async (entry: BlockedIP) => {
        setUnblocking(entry.id);
        try {
            await (api as any).client.post('blocked-ips/unblock/', {
                ip_address: entry.ip_address || undefined,
                username: entry.username || undefined,
            });
            showToast(`✅ Unblocked: ${entry.ip_address || entry.username}`, true);
            setBlocked(prev => prev.filter(b => b.id !== entry.id));
        } catch (e: any) {
            showToast(`❌ Failed: ${e?.response?.data?.error || 'Unknown error'}`, false);
        } finally {
            setUnblocking(null);
        }
    };

    useEffect(() => { load(); }, [load]);

    if (loading) return (
        <div className="flex items-center justify-center py-24">
            <Loader2 className="w-7 h-7 animate-spin text-indigo-500" />
        </div>
    );

    return (
        <div className="space-y-4">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-fade-in ${toast.ok
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-700 dark:text-emerald-300'
                    : 'bg-red-50 border border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-700 dark:text-red-300'
                    }`}>
                    {toast.msg}
                </div>
            )}

            {/* Header row */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Ban className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {blocked.length} blocked {blocked.length === 1 ? 'entry' : 'entries'}
                    </span>
                    {blocked.length > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            Active Blocks
                        </span>
                    )}
                </div>
                <button
                    onClick={load}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:border-indigo-300 hover:text-indigo-600 transition-all"
                >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Refresh
                </button>
            </div>

            {blocked.length === 0 ? (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 py-20 text-center">
                    <ShieldOff className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">No blocked IPs at the moment</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Axes automatically releases blocks after 30 minutes.</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-800/60">
                                    {['IP Address', 'Username / Email', 'Failed Attempts', 'Last Attempt', 'User Agent', 'Action'].map(h => (
                                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/60">
                                {blocked.map(entry => (
                                    <tr key={entry.id} className="group hover:bg-red-50/30 dark:hover:bg-red-900/5 transition-colors">
                                        {/* IP */}
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="flex items-center gap-1.5">
                                                <Globe className="w-3.5 h-3.5 text-red-400 shrink-0" />
                                                <span className="font-mono text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                    {entry.ip_address || '—'}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Username */}
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 font-bold text-xs shrink-0">
                                                    {avatar(entry.username)}
                                                </div>
                                                <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate max-w-[150px]">
                                                    {entry.username || 'Unknown'}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Failures */}
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800">
                                                <Lock className="w-3 h-3" />
                                                {entry.failures} failed
                                            </span>
                                        </td>

                                        {/* Last Attempt */}
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                                                <Clock className="w-3 h-3 shrink-0" />
                                                <span className="font-mono text-xs">
                                                    {entry.last_attempt ? fmt(entry.last_attempt) : '—'}
                                                </span>
                                            </div>
                                        </td>

                                        {/* User Agent */}
                                        <td className="px-4 py-3 max-w-[200px]">
                                            <span className="text-xs text-gray-500 dark:text-gray-400 truncate block" title={entry.user_agent}>
                                                {entry.user_agent ? entry.user_agent.substring(0, 60) + (entry.user_agent.length > 60 ? '…' : '') : '—'}
                                            </span>
                                        </td>

                                        {/* Unblock Button */}
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <button
                                                onClick={() => unblock(entry)}
                                                disabled={unblocking === entry.id}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800 dark:hover:bg-emerald-900/30 transition-all disabled:opacity-50 disabled:cursor-wait"
                                            >
                                                {unblocking === entry.id
                                                    ? <Loader2 className="w-3 h-3 animate-spin" />
                                                    : <Unlock className="w-3 h-3" />
                                                }
                                                {unblocking === entry.id ? 'Unblocking…' : 'Unblock'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/20">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Blocks expire automatically after <strong className="text-gray-700 dark:text-gray-300">30 minutes</strong>. Use Unblock to clear immediately. All unblocks are logged to the Audit Log.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

// ── Main ──────────────────────────────────────────────────────────────────────

type Tab = 'audit' | 'blocked';

export const SecurityHub = () => {
    const [activeTab, setActiveTab] = useState<Tab>('audit');
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [summary, setSummary] = useState<SecuritySummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
    const [search, setSearch] = useState('');
    const [filterSeverity, setFilterSeverity] = useState('');
    const [filterAction, setFilterAction] = useState('');

    const loadData = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true); else setLoading(true);
        try {
            const params: any = { page_size: 100 };
            if (filterSeverity) params.severity = filterSeverity;
            if (filterAction) params.action = filterAction;
            if (search) params.search = search;

            const [logsRes, summaryRes] = await Promise.allSettled([
                (api as any).client.get('audit-logs/', { params }),
                (api as any).client.get('audit-logs/summary/'),
            ]);

            if (logsRes.status === 'fulfilled') {
                const data = logsRes.value.data;
                setLogs(data.results || data || []);
            }
            if (summaryRes.status === 'fulfilled') setSummary(summaryRes.value.data);
        } catch (e) {
            console.error('[SecurityHub]', e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [filterSeverity, filterAction, search]);

    useEffect(() => { loadData(); }, [loadData]);
    useEffect(() => {
        const t = setInterval(() => loadData(true), 30000);
        return () => clearInterval(t);
    }, [loadData]);

    if (loading) return (
        <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
    );

    return (
        <div className="space-y-5" style={{ fontFamily: 'Inter, sans-serif' }}>

            {/* ── Tabs ── */}
            <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl w-fit">
                <button
                    id="tab-audit-logs"
                    onClick={() => setActiveTab('audit')}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'audit'
                        ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                        }`}
                >
                    <Shield className="w-3.5 h-3.5" />
                    Audit Logs
                </button>
                <button
                    id="tab-blocked-ips"
                    onClick={() => setActiveTab('blocked')}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'blocked'
                        ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                        }`}
                >
                    <Ban className="w-3.5 h-3.5" />
                    Blocked IPs
                    {summary && summary.critical_events_today > 0 && (
                        <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400">
                            !
                        </span>
                    )}
                </button>
            </div>

            {/* ── Audit Logs Tab ── */}
            {activeTab === 'audit' && (
                <>
                    {/* Refresh row */}
                    <div className="flex justify-end">
                        <button
                            onClick={() => loadData(true)}
                            disabled={refreshing}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:border-indigo-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all disabled:opacity-50"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>

                    {/* Stats Row */}
                    {summary && (
                        <div className="flex flex-wrap gap-2">
                            <MiniStat label="Registered Today" value={summary.registrations_today} color="text-gray-900 dark:text-white" />
                            <MiniStat label="Orders / Hr" value={summary.orders_last_hour} color="text-gray-900 dark:text-white" />
                            <MiniStat label="Suspicious Logins" value={summary.suspicious_logins_today} color="text-orange-600 dark:text-orange-400" alert />
                            <MiniStat label="Critical Events" value={summary.critical_events_today} color="text-red-600 dark:text-red-400" alert />
                            <MiniStat label="Total Logs" value={summary.total_logs.toLocaleString()} color="text-gray-900 dark:text-white" />
                        </div>
                    )}

                    {/* Recent Flags */}
                    {summary && summary.recent_flags.length > 0 && (
                        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/40 rounded-xl p-4">
                            <p className="flex items-center gap-1.5 text-xs font-semibold text-red-600 dark:text-red-400 mb-3 uppercase tracking-widest">
                                <AlertTriangle className="w-3.5 h-3.5" /> Recent High / Critical Flags
                            </p>
                            <div className="space-y-1.5">
                                {summary.recent_flags.map(flag => (
                                    <div
                                        key={flag.id}
                                        onClick={() => setSelectedLog(flag)}
                                        className="flex items-center gap-3 bg-white dark:bg-gray-900 rounded-lg px-3 py-2 border border-red-100 dark:border-red-900/30 hover:border-red-300 cursor-pointer transition-all text-xs"
                                    >
                                        <SeverityBadge severity={flag.severity} />
                                        <span className="font-semibold text-gray-800 dark:text-gray-200">{ACTION_LABELS[flag.action] || flag.action}</span>
                                        <span className="text-gray-600 dark:text-gray-400 ml-auto">{flag.username || 'Anon'}</span>
                                        <span className="font-mono text-gray-500 dark:text-gray-400">{flag.ip_address || '—'}</span>
                                        <span className="text-gray-500 dark:text-gray-400">{fmt(flag.timestamp)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Table */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                        {/* Controls */}
                        <div className="flex flex-col sm:flex-row gap-2 p-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                            <div className="relative flex-1">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                <input
                                    id="audit-search"
                                    type="text"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Search by IP, username, email, OS, browser…"
                                    className="w-full pl-8 pr-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                />
                            </div>
                            <div className="flex gap-2 shrink-0">
                                <select
                                    id="audit-severity-filter"
                                    value={filterSeverity}
                                    onChange={e => setFilterSeverity(e.target.value)}
                                    className="px-2.5 py-2 text-sm font-medium bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                >
                                    <option value="">All Severities</option>
                                    <option value="LOW">Low</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HIGH">High</option>
                                    <option value="CRITICAL">Critical</option>
                                </select>
                                <select
                                    id="audit-action-filter"
                                    value={filterAction}
                                    onChange={e => setFilterAction(e.target.value)}
                                    className="px-2.5 py-2 text-sm font-medium bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                >
                                    <option value="">All Actions</option>
                                    {Object.entries(ACTION_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-800/60">
                                        {['Timestamp', 'User', 'Action', 'Severity', 'IP Address', 'OS / Device', 'Src', ''].map(h => (
                                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-gray-800/60">
                                    {logs.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="py-16 text-center">
                                                <Lock className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                                                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">No audit logs found.</p>
                                            </td>
                                        </tr>
                                    ) : logs.map(log => {
                                        const isAlert = log.severity === 'HIGH' || log.severity === 'CRITICAL';
                                        return (
                                            <tr
                                                key={log.id}
                                                onClick={() => setSelectedLog(log)}
                                                className={`cursor-pointer group transition-colors hover:bg-indigo-50/40 dark:hover:bg-indigo-900/10 ${isAlert ? 'bg-red-50/30 dark:bg-red-900/5' : ''}`}
                                            >
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <span className="font-mono text-xs text-gray-600 dark:text-gray-400">{fmt(log.timestamp)}</span>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-7 h-7 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs shrink-0">
                                                            {avatar(log.username)}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate max-w-[110px]">{log.username || 'Anon'}</p>
                                                            {log.user_email && <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[110px]">{log.user_email}</p>}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <span className={`font-semibold text-sm ${isAlert ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-gray-200'}`}>
                                                        {ACTION_LABELS[log.action] || log.action}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <SeverityBadge severity={log.severity} />
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                                                        <Globe className="w-3.5 h-3.5 shrink-0" />
                                                        <span className="font-mono text-xs">{log.ip_address || '—'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                                                        <DeviceIcon type={log.device_type} />
                                                        <span className="text-xs truncate max-w-[130px]">
                                                            {log.os || '—'}
                                                            {log.browser && <span className="text-gray-500 dark:text-gray-500"> · {log.browser}</span>}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${log.source === 'SYSTEM'
                                                        ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300'
                                                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                                                        }`}>
                                                        {log.source}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-right">
                                                    <Eye className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-indigo-500 transition-colors inline" />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Footer */}
                        <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/30 dark:bg-gray-800/20">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                <span className="font-semibold text-gray-800 dark:text-gray-200">{logs.length}</span> logs · auto-refresh every 30s
                            </p>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Live</span>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* ── Blocked IPs Tab ── */}
            {activeTab === 'blocked' && <BlockedIPsTab />}

            {selectedLog && <LogDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />}
        </div>
    );
};
