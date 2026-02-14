import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { FileCard } from '../../components/files/FileCard';
import { 
  Users, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Filter, 
  Search,
  MoreVertical,
  Clock,
  Shield,
  FileText,
  Download,
  Share2
} from 'lucide-react';

export const SharedPage: React.FC = () => {
  const { files } = useSelector((state: RootState) => state.dashboard);
  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing'>('incoming');

  // Filter Logic based on ownership
  const incomingFiles = files.filter(f => f.owner !== 'Me');
  const outgoingFiles = files.filter(f => f.owner === 'Me'); // In a real app, this would check a 'sharedWith' array

  const currentFiles = activeTab === 'incoming' ? incomingFiles : outgoingFiles;

  return (
    <div className="space-y-8 pb-12 max-w-6xl mx-auto">
      
      {/* --- Header & Tabs --- */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
              <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
                      <Users size={24} />
                  </div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Shared System</h1>
              </div>
              <p className="text-slate-500 dark:text-slate-400 max-w-lg">
                  Manage files shared with you and track the links you've sent to others.
              </p>
          </div>

          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button 
                  onClick={() => setActiveTab('incoming')}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'incoming' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
              >
                  <ArrowDownLeft size={16} />
                  <span>Incoming</span>
              </button>
              <button 
                  onClick={() => setActiveTab('outgoing')}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'outgoing' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
              >
                  <ArrowUpRight size={16} />
                  <span>Outgoing</span>
              </button>
          </div>
      </div>

      {/* --- Content Area --- */}
      <div className="space-y-4">
          
          {/* List Header */}
          <div className="flex items-center justify-between px-2">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                  {activeTab === 'incoming' ? 'Shared with you' : 'Shared by you'}
                  <span className="ml-2 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-900 dark:text-white text-xs">{currentFiles.length}</span>
              </h3>
              <div className="flex gap-2">
                  <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"><Search size={18} /></button>
                  <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors"><Filter size={18} /></button>
              </div>
          </div>

          {/* List Items */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              {currentFiles.length > 0 ? (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                      {currentFiles.map((file) => (
                          <div key={file.id} className="group flex flex-col sm:flex-row items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                              
                              {/* File Icon & Info */}
                              <div className="flex items-center gap-4 w-full sm:w-1/3">
                                  <div className="relative">
                                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                          file.type === 'IMAGE' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' :
                                          file.type === 'VIDEO' ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400' :
                                          'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                      }`}>
                                          <FileText size={24} />
                                      </div>
                                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center border border-slate-100 dark:border-slate-800">
                                          {activeTab === 'incoming' ? <ArrowDownLeft size={10} className="text-indigo-500" /> : <ArrowUpRight size={10} className="text-emerald-500" />}
                                      </div>
                                  </div>
                                  <div className="min-w-0">
                                      <h4 className="font-bold text-slate-900 dark:text-white truncate text-sm">{file.name}</h4>
                                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                          <span>{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                                          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                          <span>{file.type}</span>
                                      </div>
                                  </div>
                              </div>

                              {/* Owner / Permission Info */}
                              <div className="flex items-center gap-3 w-full sm:w-1/4">
                                  <div className="flex -space-x-2">
                                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold text-white ring-2 ring-white dark:ring-slate-900">
                                          {file.owner.charAt(0)}
                                      </div>
                                  </div>
                                  <div>
                                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{file.owner}</p>
                                      <p className="text-[10px] text-slate-400">Owner</p>
                                  </div>
                              </div>

                              {/* Date & Access */}
                              <div className="flex items-center justify-between w-full sm:flex-1">
                                  <div className="flex flex-col">
                                      <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                          <Clock size={12} />
                                          <span>{new Date(file.modifiedAt).toLocaleDateString()}</span>
                                      </div>
                                      <div className="flex items-center gap-1.5 text-xs text-emerald-600 mt-0.5">
                                          <Shield size={10} />
                                          <span className="font-medium">Can Edit</span>
                                      </div>
                                  </div>

                                  {/* Actions */}
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="Download">
                                          <Download size={18} />
                                      </button>
                                      <button className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" title="Share">
                                          <Share2 size={18} />
                                      </button>
                                      <button className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                          <MoreVertical size={18} />
                                      </button>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                          <Share2 size={32} className="text-slate-300 dark:text-slate-600" />
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white">No files shared yet</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                          {activeTab === 'incoming' ? "Files shared with you will appear here." : "Files you share with others will appear here."}
                      </p>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};