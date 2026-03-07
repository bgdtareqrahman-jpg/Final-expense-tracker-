import { Wallet, User, Settings, Download, Camera } from 'lucide-react';
import { UserProfile } from '../types';
import { useState, useRef } from 'react';

interface TopBarProps {
  userProfile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  onExport: () => void;
  onOpenCategoryManager: () => void;
  onOpenAccount: () => void;
}

export function TopBar({ userProfile, onUpdateProfile, onExport, onOpenCategoryManager, onOpenAccount }: TopBarProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(userProfile.name);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNameSave = () => {
    onUpdateProfile({ ...userProfile, name: tempName });
    setIsEditingName(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateProfile({ ...userProfile, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerPhotoUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/10 shadow-lg transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* User Profile Section */}
          <div className="flex items-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoUpload}
              accept="image/*"
              className="hidden"
            />
            <button 
              onClick={triggerPhotoUpload}
              className="relative group p-1.5 bg-indigo-500/20 rounded-full border border-indigo-500/30 overflow-hidden hover:border-indigo-400 transition-colors"
              title="Change Photo"
            >
              {userProfile.avatar ? (
                <img 
                  src={userProfile.avatar} 
                  alt="Profile" 
                  className="w-8 h-8 object-cover rounded-full" 
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                  <Wallet className="w-4 h-4 text-indigo-400" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                <Camera className="w-3 h-3 text-white" />
              </div>
            </button>

            <div className="flex flex-col justify-center">
              <span className="text-xs text-gray-400 leading-none mb-0.5">Welcome back,</span>
              {isEditingName ? (
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="bg-black/30 border border-white/10 rounded px-1 py-0 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 w-24"
                  autoFocus
                  onBlur={handleNameSave}
                  onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
                />
              ) : (
                <button
                  onClick={() => { setIsEditingName(true); setTempName(userProfile.name); }}
                  className="font-semibold text-white hover:text-indigo-400 transition-colors flex items-center gap-1 text-sm leading-none"
                >
                  {userProfile.name}
                </button>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={onExport}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-all"
              title="Export Data"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={onOpenCategoryManager}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-all"
              title="Manage Categories"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={onOpenAccount}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-all"
              title="Account Settings"
            >
              <User className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
