import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Shield, Search, Edit2, Save, X, Users, Send, CheckCircle, Award, CheckSquare, Square, Trash2, Clock, Check, Ban, Download, Upload, FileJson, AlertTriangle, ShoppingBag, Link } from 'lucide-react';
import { UserLevel, BonusType, Country } from '../types';

const Admin: React.FC = () => {
  const { users, transactions, updateUserProfile, deleteUser, getUserLevel, distributePoints, distributePointsToSelected, toggleDirector, approveDeposit, rejectDeposit, restoreSystemData } = useAuth();
  const { t } = useLanguage();
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ username: string; phoneNumber: string; balance: number }>({ username: '', phoneNumber: '', balance: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 쇼핑몰 URL 상태
  const [shopUrl, setShopUrl] = useState<string>('');
  const [shopUrlInput, setShopUrlInput] = useState<string>('');

  useEffect(() => {
    const savedUrl = localStorage.getItem('shopUrl') || '';
    setShopUrl(savedUrl);
    setShopUrlInput(savedUrl);
  }, []);

  const handleSaveShopUrl = () => {
    localStorage.setItem('shopUrl', shopUrlInput);
    setShopUrl(shopUrlInput);
    setMessage({ text: '쇼핑몰 URL이 저장되었습니다.', type: 'success' });
  };

  const handleDeleteShopUrl = () => {
    localStorage.removeItem('shopUrl');
    setShopUrl('');
    setShopUrlInput('');
    setMessage({ text: '쇼핑몰 URL이 삭제되었습니다.', type: 'success' });
  };

  // Bulk Send States
  const [bulkAmount, setBulkAmount] = useState<string>('');
  const [bulkTarget, setBulkTarget] = useState<string>('ALL');
  const [selectedBonusType, setSelectedBonusType] = useState<BonusType>('DAILY');

  // Selection State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Filter pending deposits
  const pendingDeposits = transactions.filter(tx => tx.type === 'DEPOSIT' && tx.status === 'PENDING');

  const getFlagEmoji = (countryCode: Country) => {
    switch (countryCode) {
      case 'KR': return '🇰🇷';
      case 'US': return '🇺🇸';
      case 'CN': return '🇨🇳';
      case 'JP': return '🇯🇵';
      default: return '🇰🇷';
    }
  };

  const handleEdit = (user: any) => {
    setEditingId(user.id);
    setEditForm({ username: user.username, phoneNumber: user.phoneNumber, balance: user.balance });
    setMessage(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setMessage(null);
  };

  const handleSave = async (userId: string) => {
    setIsLoading(true);
    try {
      const success = await updateUserProfile(userId, editForm);
      if (success) {
        setMessage({ text: t('updateSuccess'), type: 'success' });
        setEditingId(null);
      } else {
        setMessage({ text: t('updateFail'), type: 'error' });
      }
    } catch (e) {
      setMessage({ text: 'Error updating user', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm(t('confirmDelete'))) {
      setIsLoading(true);
      try {
        const success = await deleteUser(userId);
        if (success) {
          setMessage({ text: t('deleteSuccess'), type: 'success' });
          if (selectedIds.has(userId)) {
            const newSelected = new Set(selectedIds);
            newSelected.delete(userId);
            setSelectedIds(newSelected);
          }
        } else {
          setMessage({ text: 'Failed to delete user.', type: 'error' });
        }
      } catch (e) {
        setMessage({ text: 'Error deleting user', type: 'error' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBulkSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(bulkAmount.replace(/,/g, ''), 10);
    if (isNaN(amount) || amount <= 0) return;

    setIsLoading(true);
    let result;
    try {
      if (bulkTarget === 'SELECTED') {
        if (selectedIds.size === 0) {
          setMessage({ text: 'No users selected.', type: 'error' });
          setIsLoading(false);
          return;
        }
        result = await distributePointsToSelected(amount, Array.from(selectedIds), selectedBonusType);
      } else {
        result = await distributePoints(amount, bulkTarget as 'ALL' | UserLevel, selectedBonusType);
      }

      if (result.success) {
        setMessage({ text: `${result.count}${t('bulkSuccess')}`, type: 'success' });
        setBulkAmount('');
        if (bulkTarget === 'SELECTED') {
          setSelectedIds(new Set());
          setBulkTarget('ALL');
        }
      } else {
        setMessage({ text: t('errorInvalidUser'), type: 'error' });
      }
    } catch (e) {
      setMessage({ text: 'Error distributing points', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleDirector = async (userId: string) => {
    await toggleDirector(userId);
  };

  const handleApproveDeposit = async (txId: string) => {
    await approveDeposit(txId);
  };

  const handleRejectDeposit = async (txId: string) => {
    await rejectDeposit(txId);
  };

  // --- Backup & Restore ---
  const handleExportData = () => {
    const data = {
      users,
      transactions,
      timestamp: new Date().toISOString(),
      version: "1.0"
    };
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = `fractal_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setMessage({ text: "Backup data exported successfully.", type: "success" });
  };

  const handleImportClick = () => {
    if (fileInputRef.current) {
        fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.users && Array.isArray(json.users) && json.transactions && Array.isArray(json.transactions)) {
            if (window.confirm("Warning: This will overwrite all current data. Continue?")) {
                restoreSystemData(json.users, json.transactions);
                setMessage({ text: "System restored successfully.", type: "success" });
            }
        } else {
            setMessage({ text: "Invalid backup file format.", type: "error" });
        }
      } catch (err) {
        setMessage({ text: "Failed to parse backup file.", type: "error" });
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.phoneNumber.includes(searchTerm) ||
    (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const toggleSelection = (userId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedIds(newSelected);
    
    // Auto switch dropdown if selection exists
    if (newSelected.size > 0) {
      setBulkTarget('SELECTED');
    } else {
      setBulkTarget('ALL');
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredUsers.length) {
      setSelectedIds(new Set());
      setBulkTarget('ALL');
    } else {
      const newSelected = new Set(filteredUsers.map(u => u.id));
      setSelectedIds(newSelected);
      setBulkTarget('SELECTED');
    }
  };

  const getLevelBadgeColor = (level: UserLevel) => {
    switch (level) {
      case 'DIRECTOR': return 'bg-red-100 text-red-700 border-red-200';
      case 'DISTRIBUTOR': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'VVIP': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'VIP': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
            <Shield className="text-blue-600" />
            {t('adminTitle')}
          </h2>
          <p className="text-slate-500 mt-2">{t('adminDesc')}</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200 flex items-center">
          <Users size={18} className="text-slate-400 mr-2" />
          <span className="text-slate-500 text-sm mr-2">{t('totalUsers')}:</span>
          <span className="font-bold text-slate-800 text-lg">{users.length}</span>
        </div>
      </div>

      {/* Message Banner */}
      {message && (
        <div className={`p-4 rounded-xl text-center text-sm font-bold flex items-center justify-center space-x-2 ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <X size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Backup & Deploy Help Section */}
      <div className="bg-slate-800 rounded-2xl shadow-lg p-6 text-white border border-slate-700">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
                <div className="bg-white/10 p-2 rounded-lg">
                    <FileJson size={24} className="text-blue-400" />
                </div>
                <h3 className="text-xl font-bold">System Backup & Deployment</h3>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                <h4 className="font-bold mb-2 flex items-center text-blue-300">
                    <Download size={16} className="mr-2" /> 
                    Data Backup (JSON)
                </h4>
                <p className="text-sm text-slate-400 mb-4">
                    Download all user data and transaction history as a JSON file. Use this to save your progress or migrate data.
                </p>
                <div className="flex space-x-3">
                    <button 
                        onClick={handleExportData}
                        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center"
                    >
                        <Download size={16} className="mr-2" /> Export Data
                    </button>
                    <button 
                        onClick={handleImportClick}
                        className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center"
                    >
                        <Upload size={16} className="mr-2" /> Import Data
                    </button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept=".json" 
                        className="hidden" 
                    />
                </div>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                <h4 className="font-bold mb-2 flex items-center text-green-300">
                    <Upload size={16} className="mr-2" /> 
                    How to Deploy to Netlify
                </h4>
                <div className="text-xs text-slate-400 space-y-2">
                    <p>Since you are in a web editor, you must download the source code first.</p>
                    <ol className="list-decimal pl-4 space-y-1">
                        <li>Click the <strong>Download Project</strong> button in your editor's header.</li>
                        <li>Unzip the downloaded file on your PC.</li>
                        <li>Go to <strong>app.netlify.com/drop</strong>.</li>
                        <li>Drag & drop the <strong>dist</strong> folder (after running <code>npm run build</code>) or the whole folder.</li>
                    </ol>
                </div>
            </div>
        </div>
      </div>

      {/* 쇼핑몰 URL 설정 */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl shadow-lg p-6 text-white">
        <div className="flex items-center space-x-2 mb-4">
          <div className="bg-white/20 p-2 rounded-lg">
            <ShoppingBag size={24} />
          </div>
          <h3 className="text-xl font-bold">쇼핑몰 URL 설정</h3>
        </div>
        <p className="text-emerald-100 text-sm mb-4">
          대시보드의 '쇼핑몰' 카드를 클릭하면 이동할 URL을 설정합니다.
        </p>
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Link size={18} className="absolute left-4 top-3.5 text-emerald-300" />
            <input
              type="url"
              value={shopUrlInput}
              onChange={(e) => setShopUrlInput(e.target.value)}
              placeholder="https://your-shop.com"
              className="w-full bg-white/10 border border-white/20 rounded-xl pl-12 pr-4 py-3 text-white placeholder-emerald-200 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all"
            />
          </div>
          <button
            onClick={handleSaveShopUrl}
            className="bg-white text-emerald-700 font-bold px-6 py-3 rounded-xl hover:bg-emerald-50 transition-all flex items-center justify-center space-x-2"
          >
            <Save size={18} />
            <span>저장</span>
          </button>
          {shopUrl && (
            <button
              onClick={handleDeleteShopUrl}
              className="bg-red-500 text-white font-bold px-6 py-3 rounded-xl hover:bg-red-600 transition-all flex items-center justify-center space-x-2"
            >
              <Trash2 size={18} />
              <span>삭제</span>
            </button>
          )}
        </div>
        {shopUrl && (
          <div className="mt-3 flex items-center space-x-2 text-emerald-100 text-sm">
            <CheckCircle size={16} />
            <span>현재 설정: {shopUrl}</span>
          </div>
        )}
      </div>

      {/* Pending Deposits Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center">
          <Clock className="text-orange-500 mr-2" size={20} />
          <h3 className="font-bold text-slate-700">{t('adminDepositsTitle')} ({pendingDeposits.length})</h3>
        </div>
        
        {pendingDeposits.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
             {t('noPendingDeposits')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">{t('username')}</th>
                  <th className="px-6 py-3">{t('amount')}</th>
                  <th className="px-6 py-3">{t('date')}</th>
                  <th className="px-6 py-3 text-right">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingDeposits.map(tx => (
                  <tr key={tx.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {tx.relatedUserName || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-mono font-bold">
                      {tx.amount.toLocaleString()} P
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(tx.date).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleApproveDeposit(tx.id)}
                          className="flex items-center space-x-1 bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                        >
                          <Check size={14} />
                          <span>{t('approve')}</span>
                        </button>
                        <button
                          onClick={() => handleRejectDeposit(tx.id)}
                          className="flex items-center space-x-1 bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                        >
                          <Ban size={14} />
                          <span>{t('reject')}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bulk Distribution Card */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-2xl shadow-lg p-6 text-white">
        <div className="flex items-center space-x-2 mb-6">
          <div className="bg-white/10 p-2 rounded-lg">
            <Send size={24} className="text-yellow-400" />
          </div>
          <h3 className="text-xl font-bold">{t('bulkSendTitle')}</h3>
        </div>

        <form onSubmit={handleBulkSend} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          {/* Target Level */}
          <div className="md:col-span-3">
            <label className="block text-xs font-medium text-slate-300 mb-1.5 ml-1">{t('bulkTarget')}</label>
            <select
              value={bulkTarget}
              onChange={(e) => setBulkTarget(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
            >
              {selectedIds.size > 0 && (
                <option value="SELECTED" className="text-slate-900 font-bold bg-yellow-100">
                  {t('bulkSelected')} ({selectedIds.size})
                </option>
              )}
              <option value="ALL" className="text-slate-900">{t('lvl_ALL')}</option>
              <option value="MEMBER" className="text-slate-900">{t('lvl_MEMBER')}</option>
              <option value="VIP" className="text-slate-900">{t('lvl_VIP')}</option>
              <option value="VVIP" className="text-slate-900">{t('lvl_VVIP')}</option>
              <option value="DISTRIBUTOR" className="text-slate-900">{t('lvl_DISTRIBUTOR')}</option>
              <option value="DIRECTOR" className="text-slate-900 font-bold">{t('lvl_DIRECTOR')}</option>
            </select>
          </div>

          {/* Bonus Type */}
          <div className="md:col-span-3">
            <label className="block text-xs font-medium text-slate-300 mb-1.5 ml-1">{t('bulkType')}</label>
            <select
              value={selectedBonusType}
              onChange={(e) => setSelectedBonusType(e.target.value as BonusType)}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
            >
              <option value="DAILY" className="text-slate-900">{t('bonus_DAILY')}</option>
              <option value="WEEKLY" className="text-slate-900">{t('bonus_WEEKLY')}</option>
              <option value="MONTHLY" className="text-slate-900">{t('bonus_MONTHLY')}</option>
              <option value="SPECIAL" className="text-slate-900">{t('bonus_SPECIAL')}</option>
            </select>
          </div>

          {/* Amount */}
          <div className="md:col-span-4">
            <label className="block text-xs font-medium text-slate-300 mb-1.5 ml-1">{t('bulkAmount')}</label>
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-slate-400">P</span>
              <input
                type="number"
                value={bulkAmount}
                onChange={(e) => setBulkAmount(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl pl-8 pr-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all font-mono"
                placeholder="0"
                min="1"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Send Button */}
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-bold py-3 rounded-xl shadow-lg transition-all transform hover:-translate-y-1 flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Send size={18} />
                  <span>{t('bulkSendBtn')}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* User Management Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center">
          <Search className="text-slate-400 mr-2" size={20} />
          <input 
            type="text" 
            placeholder="Search by ID, Name or Phone..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent outline-none w-full text-sm text-slate-700 placeholder-slate-400"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 w-12 text-center">
                   <button onClick={toggleSelectAll} className="text-slate-400 hover:text-slate-600">
                     {selectedIds.size > 0 && selectedIds.size === filteredUsers.length ? (
                       <CheckSquare size={20} className="text-blue-600" />
                     ) : (
                       <Square size={20} />
                     )}
                   </button>
                </th>
                <th className="px-6 py-3">{t('username')}</th>
                <th className="px-6 py-3">{t('nameField')}</th>
                <th className="px-6 py-3">{t('level')}</th>
                <th className="px-6 py-3">{t('phoneNumber')}</th>
                <th className="px-6 py-3">{t('country')}</th>
                <th className="px-6 py-3">{t('balance')}</th>
                <th className="px-6 py-3 text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map(user => {
                const userLevel = getUserLevel(user);
                const isSelected = selectedIds.has(user.id);
                return (
                  <tr key={user.id} className={`transition-colors ${isSelected ? 'bg-blue-50' : 'hover:bg-slate-50'}`}>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => toggleSelection(user.id)} className="text-slate-400 hover:text-slate-600">
                         {isSelected ? (
                           <CheckSquare size={20} className="text-blue-600" />
                         ) : (
                           <Square size={20} />
                         )}
                       </button>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {editingId === user.id ? (
                        <input 
                          type="text" 
                          value={editForm.username}
                          onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                          className="border border-slate-300 rounded px-2 py-1 w-full focus:outline-none focus:border-blue-500"
                        />
                      ) : (
                        user.username
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {user.name}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getLevelBadgeColor(userLevel)}`}>
                        {t(`lvl_${userLevel}`)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {editingId === user.id ? (
                        <input 
                          type="text" 
                          value={editForm.phoneNumber}
                          onChange={(e) => setEditForm({...editForm, phoneNumber: e.target.value})}
                          className="border border-slate-300 rounded px-2 py-1 w-full focus:outline-none focus:border-blue-500"
                        />
                      ) : (
                        user.phoneNumber
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <span className="text-xl mr-2">{getFlagEmoji(user.country)}</span>
                      {user.country}
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-mono">
                      {editingId === user.id ? (
                        <input
                          type="number"
                          value={editForm.balance}
                          onChange={(e) => setEditForm({...editForm, balance: parseInt(e.target.value) || 0})}
                          className="border border-slate-300 rounded px-2 py-1 w-full focus:outline-none focus:border-blue-500"
                        />
                      ) : (
                        `${user.balance.toLocaleString()} P`
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {/* Director Toggle */}
                        {user.username !== 'admin' && (
                          <button 
                            onClick={() => handleToggleDirector(user.id)}
                            className={`p-1.5 rounded transition-colors ${userLevel === 'DIRECTOR' ? 'text-red-600 bg-red-50 hover:bg-red-100' : 'text-slate-300 hover:text-slate-500 hover:bg-slate-100'}`}
                            title={userLevel === 'DIRECTOR' ? t('unsetDirector') : t('setDirector')}
                          >
                            <Award size={16} />
                          </button>
                        )}

                        {editingId === user.id ? (
                          <>
                            <button 
                              onClick={() => handleSave(user.id)}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                              title={t('save')}
                            >
                              <Save size={16} />
                            </button>
                            <button 
                              onClick={handleCancel}
                              className="p-1.5 text-slate-400 hover:bg-slate-100 rounded"
                              title={t('cancel')}
                            >
                              <X size={16} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              onClick={() => handleEdit(user)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title={t('edit')}
                            >
                              <Edit2 size={16} />
                            </button>
                            {/* Delete Button - Only show if not admin */}
                            {user.username !== 'admin' && (
                              <button 
                                onClick={() => handleDelete(user.id)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                title={t('delete')}
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Admin;