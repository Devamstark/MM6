import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../services/api';
import {
    Shield, AlertTriangle, CheckCircle, Activity, Search,
    Filter, RefreshCw, Loader2, Monitor, Smartphone, Tablet,
    Globe, User, Clock, Cpu, ChevronDown, X, Lock, Eye
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

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

// ── Helpers ───────────────────────────────────────────────────────────────────

const ACTION_LABELS: Record<string, string> = {
    registration: 'Registration',
    login: 'Login',
    order_created: 'Order Created',
    suspicious_login: 'Suspicious Login',
    role_change: 'Role Change',
    password_reset_request: 'Password Reset Request',
    password_reset_confirm: 'Password Reset Confirm',
    account_lockout: 'Account Lockout',
};

const severityConfig = {
    LOW: { color: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800', dot: 'bg-green-500' },
    MEDIUM: { color: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800', dot: 'bg-blue-500' },
    HIGH: { color: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800', dot: 'bg-orange-500' },
    CRITICAL: { color: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800', dot: 'bg-red-500 animate-pulse' },
};

const DeviceIcon = ({ type }: { type: string | null }) => {
    if (type === 'Mobile') return <Smartphone className="w-3.5 h-3.5" />;
    if (type === 'Tablet') return <Tablet className="w-3.5 h-3.5" />;
    return <Monitor className="w-3.5 h-3.5" />;
};

const SeverityBadge = ({ severity }: { severity: AuditLog['severity'] }) => {
    const cfg = severityConfig[severity] || severityConfig.LOW;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${cfg.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {severity}
        </span>
    );
};

const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false });
};

// ── Stat Card ─────────────────────────────────────────────────────────────────

const StatCard = ({
    icon: Icon,
    label,
    value,
    sub,
    iconClass = 'text-indigo-600',
    bg = 'bg-indigo-50 dark:bg-indigo-900/20',
    alert = false,
}: {
    icon: React.FC<any>; label: string; value: number | string; sub?: string;
    iconClass?: string; bg?: string; alert?: boolean;
}) => (
    <div className={`bg-white dark:bg-gray-900 rounded-2xl border ${alert ? 'border-red-200 dark:border-red-800' : 'border-gray-100 dark:border-gray-800'} p-5 shadow-sm flex items-center gap-4 transition-all hover:shadow-md`}>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bg} shrink-0`}>
            <Icon className={`w-6 h-6 ${iconClass}`} />
        </div>
        <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{label}</p>
            <p className={`text-2xl font-black ${alert ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'} leading-tight`}>{value}</p>
            {sub && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{sub}</p>}
        </div>
    </div>
);

// ── Log Detail Modal ───────────────────────────────────────────────────────────

const LogDetailModal = ({ log, onClose }: { log: AuditLog; onClose: () => void }) => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-lg w-full p-8 relative" onClick={e => e.stopPropagation()}>
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X className="w-5 h-5" /></button>
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{ACTION_LABELS[log.action] || log.action}</h3>
                    <p className="text-xs text-gray-500">{formatTime(log.timestamp)}</p>
                </div>
                <div className="ml-auto"><SeverityBadge severity={log.severity} /></div>
            </div>
            <div className="space-y-3 border-t border-gray-100 dark:border-gray-800 pt-5">
                {[
                    { label: 'Log ID', value: log.id, mono: true },
                    { label: 'User', value: log.username || 'Anonymous' },
                    { label: 'Email', value: log.user_email || '—' },
                    { label: 'Source', value: log.source },
                    { label: 'IP Address', value: log.ip_address || '—', mono: true },
                    { label: 'OS', value: log.os || '—' },
                    { label: 'Browser', value: log.browser || '—' },
                    { label: 'Device Type', value: log.device_type || '—' },
                ].map(row => (
                    <div key={row.label} className="flex justify-between gap-4">
                        <span className="text-xs font-semibold text-gray-500 shrink-0">{row.label}</span>
                        <span className={`text-xs font-bold text-gray-900 dark:text-white text-right break-all ${row.mono ? 'font-mono' : ''}`}>{row.value}</span>
                    </div>
                ))}
                {Object.keys(log.metadata || {}).length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                        <p className="text-xs font-bold text-gray-500 mb-2">METADATA</p>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 font-mono text-xs text-gray-700 dark:text-gray-300 break-all">
                            {JSON.stringify(log.metadata, null, 2)}
                        </div>
                    </div>
                )}
                {log.user_agent && (
                    <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                        <p className="text-xs font-bold text-gray-500 mb-1">RAW USER-AGENT</p>
                        <p className="text-[10px] text-gray-500 break-all font-mono leading-relaxed">{log.user_agent}</p>
                    </div>
                )}
            </div>
        </div>
    </div>
);

// ── Main Component ────────────────────────────────────────────────────────────

export const SecurityHub = () => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [summary, setSummary] = useState<SecuritySummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

    // Filters
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
            if (summaryRes.status === 'fulfilled') {
                setSummary(summaryRes.value.data);
            }
        } catch (e) {
            console.error('[SecurityHub] Failed to load data:', e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [filterSeverity, filterAction, search]);

    useEffect(() => { loadData(); }, [loadData]);

    // Auto-refresh every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => loadData(true), 30000);
        return () => clearInterval(interval);
    }, [loadData]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600 dark:text-indigo-400" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-up" style={{ fontFamily: 'Inter, sans-serif' }}>

            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <span className="text-indigo-600 dark:text-indigo-400 font-semibold text-xs uppercase tracking-[0.3em] mb-2 block">Access-Restricted</span>
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
                        Security Hub
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">SOC2-compliant, append-only audit trail. Read-only.</p>
                </div>
                <button
                    onClick={() => loadData(true)}
                    disabled={refreshing}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-sm disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Stats Grid */}
            {summary && (
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 animate-fade-up">
                    <StatCard icon={User} label="Registered Today" value={summary.registrations_today} iconClass="text-indigo-600 dark:text-indigo-400" bg="bg-indigo-50 dark:bg-indigo-900/20" />
                    <StatCard icon={Activity} label="Orders (Last Hour)" value={summary.orders_last_hour} iconClass="text-blue-600 dark:text-blue-400" bg="bg-blue-50 dark:bg-blue-900/20" />
                    <StatCard icon={AlertTriangle} label="Suspicious Logins" value={summary.suspicious_logins_today} iconClass="text-orange-600 dark:text-orange-400" bg="bg-orange-50 dark:bg-orange-900/20" alert={summary.suspicious_logins_today > 0} />
                    <StatCard icon={Shield} label="Critical Events" value={summary.critical_events_today} iconClass="text-red-600 dark:text-red-400" bg="bg-red-50 dark:bg-red-900/20" alert={summary.critical_events_today > 0} />
                    <StatCard icon={Clock} label="Total Logs" value={summary.total_logs.toLocaleString()} sub="All time" iconClass="text-gray-600 dark:text-gray-400" bg="bg-gray-100 dark:bg-gray-800" />
                </div>
            )}

            {/* Recent Flags */}
            {summary && summary.recent_flags.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-2xl p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                        <h3 className="font-bold text-red-700 dark:text-red-400 text-sm">Recent High/Critical Flags</h3>
                    </div>
                    <div className="space-y-2">
                        {summary.recent_flags.map(flag => (
                            <div key={flag.id} className="flex items-center gap-3 bg-white dark:bg-gray-900 rounded-xl px-4 py-3 border border-red-100 dark:border-red-900 hover:border-red-300 dark:hover:border-red-700 cursor-pointer transition-all" onClick={() => setSelectedLog(flag)}>
                                <SeverityBadge severity={flag.severity} />
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">{ACTION_LABELS[flag.action] || flag.action}</span>
                                <span className="text-xs text-gray-500 ml-auto">{flag.username || 'Anon'}</span>
                                <span className="text-xs font-mono text-gray-400">{flag.ip_address || '—'}</span>
                                <span className="text-xs text-gray-400">{formatTime(flag.timestamp)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Forensic Table */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                {/* Table Controls */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-3 bg-gray-50/50 dark:bg-gray-800/50">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            id="audit-search"
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search by IP, username, email, OS, browser…"
                            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            id="audit-severity-filter"
                            value={filterSeverity}
                            onChange={e => setFilterSeverity(e.target.value)}
                            className="px-3 py-2 text-xs font-semibold bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
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
                            className="px-3 py-2 text-xs font-semibold bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        >
                            <option value="">All Actions</option>
                            {Object.entries(ACTION_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-800">
                        <thead className="bg-gray-50/60 dark:bg-gray-900/50">
                            <tr>
                                {['Timestamp', 'User', 'Action', 'Severity', 'IP Address', 'OS / Device', 'Source', ''].map(h => (
                                    <th key={h} className="px-5 py-4 text-left text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-50 dark:divide-gray-800">
                            {logs.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-16 text-center">
                                        <Lock className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                                        <p className="text-sm text-gray-500 dark:text-gray-400">No audit logs found.</p>
                                    </td>
                                </tr>
                            ) : logs.map(log => {
                                const isAlert = log.severity === 'HIGH' || log.severity === 'CRITICAL';
                                return (
                                    <tr
                                        key={log.id}
                                        className={`hover:bg-gray-50 dark:hover:bg-gray-800 transition-all group cursor-pointer ${isAlert ? 'bg-red-50/30 dark:bg-red-900/10' : ''}`}
                                        onClick={() => setSelectedLog(log)}
                                    >
                                        {/* Timestamp */}
                                        <td className="px-5 py-3.5 whitespace-nowrap">
                                            <span className="text-xs font-mono text-gray-600 dark:text-gray-400">{formatTime(log.timestamp)}</span>
                                        </td>
                                        {/* User */}
                                        <td className="px-5 py-3.5 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-xs border border-slate-200 dark:border-slate-700 shrink-0">
                                                    {(log.username || '?').charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-semibold text-gray-900 dark:text-white">{log.username || 'Anonymous'}</p>
                                                    {log.user_email && <p className="text-[10px] text-gray-500">{log.user_email}</p>}
                                                </div>
                                            </div>
                                        </td>
                                        {/* Action */}
                                        <td className="px-5 py-3.5 whitespace-nowrap">
                                            <span className={`text-xs font-semibold ${isAlert ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-gray-200'}`}>
                                                {ACTION_LABELS[log.action] || log.action}
                                            </span>
                                        </td>
                                        {/* Severity */}
                                        <td className="px-5 py-3.5 whitespace-nowrap">
                                            <SeverityBadge severity={log.severity} />
                                        </td>
                                        {/* IP */}
                                        <td className="px-5 py-3.5 whitespace-nowrap">
                                            <div className="flex items-center gap-1.5">
                                                <Globe className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                                <span className="text-xs font-mono text-gray-700 dark:text-gray-300">{log.ip_address || '—'}</span>
                                            </div>
                                        </td>
                                        {/* OS / Device */}
                                        <td className="px-5 py-3.5 whitespace-nowrap">
                                            <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                                                <DeviceIcon type={log.device_type} />
                                                <span className="text-xs">
                                                    {log.os || '—'}
                                                    {log.browser && <span className="text-gray-400"> · {log.browser}</span>}
                                                </span>
                                            </div>
                                        </td>
                                        {/* Source */}
                                        <td className="px-5 py-3.5 whitespace-nowrap">
                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${log.source === 'SYSTEM' ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                                                {log.source}
                                            </span>
                                        </td>
                                        {/* View */}
                                        <td className="px-5 py-3.5 whitespace-nowrap text-right">
                                            <button className="w-7 h-7 inline-flex items-center justify-center text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-gray-50 dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                                                <Eye className="w-3.5 h-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Showing <span className="font-semibold text-gray-700 dark:text-gray-300">{logs.length}</span> logs · Auto-refreshes every 30s
                    </p>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-xs text-gray-500">Live</span>
                    </div>
                </div>
            </div>

            {/* Log Detail Modal */}
            {selectedLog && <LogDetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />}
        </div>
    );
};
