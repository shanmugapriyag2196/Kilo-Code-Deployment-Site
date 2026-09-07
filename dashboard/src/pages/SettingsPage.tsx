import { Settings, User, Bell, Shield, Palette } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Settings className="w-8 h-8" />
          Settings
        </h1>
        <p className="text-slate-400 mt-1">Manage your account and preferences</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-slate-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Profile</h3>
            <p className="text-sm text-slate-400">Manage your account settings</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Name</label>
            <input
              type="text"
              defaultValue="Developer"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
            <input
              type="email"
              defaultValue="dev@example.com"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="w-6 h-6 text-slate-400" />
          <div>
            <h3 className="text-lg font-semibold text-white">Notifications</h3>
            <p className="text-sm text-slate-400">Configure notification preferences</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
            <span className="text-slate-300">Email notifications</span>
            <input type="checkbox" defaultChecked className="w-4 h-4" />
          </label>
          <label className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
            <span className="text-slate-300">Deployment alerts</span>
            <input type="checkbox" defaultChecked className="w-4 h-4" />
          </label>
          <label className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
            <span className="text-slate-300">Weekly reports</span>
            <input type="checkbox" className="w-4 h-4" />
          </label>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-6 h-6 text-slate-400" />
          <div>
            <h3 className="text-lg font-semibold text-white">Security</h3>
            <p className="text-sm text-slate-400">Security and access settings</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
            <span className="text-slate-300">Two-factor authentication</span>
            <input type="checkbox" className="w-4 h-4" />
          </label>
          <label className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
            <span className="text-slate-300">Deployment tokens</span>
            <input type="checkbox" defaultChecked className="w-4 h-4" />
          </label>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <Palette className="w-6 h-6 text-slate-400" />
          <div>
            <h3 className="text-lg font-semibold text-white">Appearance</h3>
            <p className="text-sm text-slate-400">Customize your experience</p>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Theme</label>
          <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 focus:outline-none focus:border-blue-500">
            <option>Dark (Default)</option>
            <option>Light</option>
            <option>System</option>
          </select>
        </div>
      </div>
    </div>
  );
}
