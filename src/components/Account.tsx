import { useState } from 'react';
import { UserProfile } from '../types';
import { User, Download, Save, Wallet, Globe, Bell, Trash2, AlertTriangle } from 'lucide-react';

interface AccountProps {
  userProfile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  onExport: () => void;
  onDeleteAccount: () => void;
}

export function Account({ userProfile, onUpdateProfile, onExport, onDeleteAccount }: AccountProps) {
  const [name, setName] = useState(userProfile.name);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSave = () => {
    onUpdateProfile({ ...userProfile, name });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDeleteAccount();
    } else {
      setShowDeleteConfirm(true);
      // Auto-reset confirmation after 3 seconds
      setTimeout(() => setShowDeleteConfirm(false), 3000);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white/80 uppercase tracking-wider text-sm">Account Details</h2>
      
      <div className="space-y-4">
        {/* Row 1: Profile Information */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {userProfile.avatar ? (
                <img src={userProfile.avatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
              ) : (
                name.charAt(0).toUpperCase()
              )}
            </div>
            
            <div className="flex-1">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    autoFocus
                  />
                  <button 
                    onClick={handleSave}
                    className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-semibold text-white">{userProfile.name}</h3>
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Edit
                  </button>
                </div>
              )}
              <p className="text-sm text-gray-400">Personal Account</p>
            </div>
          </div>
        </div>

        {/* Row 2: Preferences */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6 shadow-xl">
          <h4 className="text-sm font-medium text-gray-300 mb-4 uppercase tracking-wider">Preferences</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-white font-medium">Currency</p>
                  <p className="text-xs text-gray-400">Default currency for transactions</p>
                </div>
              </div>
              <span className="text-sm font-mono text-gray-300 bg-white/10 px-2 py-1 rounded">BDT</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-white font-medium">Language</p>
                  <p className="text-xs text-gray-400">App interface language</p>
                </div>
              </div>
              <span className="text-sm text-gray-300">English</span>
            </div>
          </div>
        </div>

        {/* Row 3: Data Management */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6 shadow-xl">
          <h4 className="text-sm font-medium text-gray-300 mb-4 uppercase tracking-wider">Data Management</h4>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={onExport}
              className="flex items-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white transition-all shadow-lg shadow-indigo-500/20 flex-1 justify-center"
            >
              <Download className="w-5 h-5" />
              <span>Export Data to Excel</span>
            </button>
            
            <button
              onClick={handleDelete}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl text-white transition-all shadow-lg flex-1 justify-center ${
                showDeleteConfirm 
                  ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20' 
                  : 'bg-white/5 hover:bg-red-500/10 hover:text-red-400 border border-white/10'
              }`}
            >
              {showDeleteConfirm ? (
                <>
                  <AlertTriangle className="w-5 h-5" />
                  <span>Confirm Delete?</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-5 h-5" />
                  <span>Delete Account</span>
                </>
              )}
            </button>
          </div>
          {showDeleteConfirm && (
            <p className="text-xs text-red-400 mt-2 text-center animate-pulse">
              Warning: This will permanently delete all your data.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
