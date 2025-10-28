'use client';
import { useState, useEffect } from 'react';
import { adminSettingsAPI } from '@/lib/api/admin-settings';
import { useSettings } from '@/contexts/SettingsContext';
import { Save, RotateCcw, Globe, Settings, Shield, Server } from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [systemInfo, setSystemInfo] = useState<any>(null);
  const [tab, setTab] = useState('general');
  const { refreshSettings } = useSettings();

  useEffect(() => {
    Promise.all([adminSettingsAPI.getSettings(), adminSettingsAPI.getSystemInfo()])
      .then(([s, i]) => { setSettings(s); setSystemInfo(i); });
  }, []);

  if (!settings) return <div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Paramètres</h1>
      <div className="mb-6 flex justify-end space-x-3">
        <button onClick={() => adminSettingsAPI.resetSettings().then(() => { refreshSettings(); window.location.reload(); })} className="px-4 py-2 border rounded-lg"><RotateCcw className="h-4 w-4 inline mr-2"/>Réinitialiser</button>
        <button onClick={() => adminSettingsAPI.updateSettings(settings).then(() => { refreshSettings(); alert('Sauvegardé!'); })} className="px-4 py-2 bg-primary-600 text-white rounded-lg"><Save className="h-4 w-4 inline mr-2"/>Sauvegarder</button>
      </div>
      <div className="bg-white rounded-lg shadow">
        <div className="border-b"><nav className="flex space-x-8 px-6">
          {[['general','Général',Globe],['system','Système',Server]].map(([k,l,I]:any)=><button key={k} onClick={()=>setTab(k)} className={`py-4 px-1 border-b-2 ${tab===k?'border-primary-500 text-primary-600':'border-transparent text-gray-500'}`}><I className="h-4 w-4 inline mr-2"/>{l}</button>)}
        </nav></div>
        <div className="p-6">
          {tab==='general'&&<div className="space-y-6"><div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-2">Nom du Site</label><input value={settings.siteName} onChange={e=>setSettings({...settings,siteName:e.target.value})} className="w-full px-3 py-2 border rounded-md"/></div>
            <div><label className="block text-sm font-medium mb-2">Tagline</label><input value={settings.siteTagline} onChange={e=>setSettings({...settings,siteTagline:e.target.value})} className="w-full px-3 py-2 border rounded-md" placeholder="Plateforme de..."/></div>
            <div className="col-span-2"><label className="block text-sm font-medium mb-2">Description du Site</label><textarea value={settings.siteDescription} onChange={e=>setSettings({...settings,siteDescription:e.target.value})} className="w-full px-3 py-2 border rounded-md" rows={3} placeholder="Gérez vos paris..."/></div>
            <div className="col-span-2"><label className="block text-sm font-medium mb-2">Texte Footer</label><input value={settings.footerText} onChange={e=>setSettings({...settings,footerText:e.target.value})} className="w-full px-3 py-2 border rounded-md" placeholder="Fait avec ❤️..."/></div>
            <div><label className="block text-sm font-medium mb-2">Email Support</label><input value={settings.supportEmail} onChange={e=>setSettings({...settings,supportEmail:e.target.value})} className="w-full px-3 py-2 border rounded-md"/></div>
            <div><label className="block text-sm font-medium mb-2">Email Contact</label><input value={settings.contactEmail} onChange={e=>setSettings({...settings,contactEmail:e.target.value})} className="w-full px-3 py-2 border rounded-md"/></div>
          </div><div className="space-y-3 mt-6">
            <label className="flex items-center space-x-3"><input type="checkbox" checked={settings.maintenanceMode} onChange={e=>setSettings({...settings,maintenanceMode:e.target.checked})} className="h-4 w-4"/><span>Mode Maintenance</span></label>
            <label className="flex items-center space-x-3"><input type="checkbox" checked={settings.registrationEnabled} onChange={e=>setSettings({...settings,registrationEnabled:e.target.checked})} className="h-4 w-4"/><span>Inscription Activée</span></label>
          </div></div>}
          {tab==='system'&&systemInfo&&<div className="grid grid-cols-4 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg"><p className="text-sm text-gray-600">Utilisateurs</p><p className="text-2xl font-bold">{systemInfo.totalUsers}</p></div>
            <div className="bg-green-50 p-6 rounded-lg"><p className="text-sm text-gray-600">Paris</p><p className="text-2xl font-bold">{systemInfo.totalBets}</p></div>
            <div className="bg-purple-50 p-6 rounded-lg"><p className="text-sm text-gray-600">Revenu</p><p className="text-2xl font-bold">{systemInfo.totalRevenue}€</p></div>
            <div className="bg-orange-50 p-6 rounded-lg"><p className="text-sm text-gray-600">Mémoire</p><p className="text-2xl font-bold">{systemInfo.memory.used}MB</p></div>
          </div>}
        </div>
      </div>
    </div>
  );
}
