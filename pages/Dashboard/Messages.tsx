import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Plus, 
  Paperclip, 
  Send, 
  Check, 
  CheckCheck,
  ChevronLeft,
  UserPlus,
  X,
  File,
  CloudUpload,
  CheckCircle,
  FileText,
  MessageSquarePlus,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  FileCode,
  Download
} from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { FORMAT_BYTES } from '../../constants';

// --- Types ---
interface User {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'busy' | 'away';
  email: string;
  lastSeen?: string;
}

interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  previewUrl?: string;
}

interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
  attachments?: Attachment[];
}

type BadgeType = 'none' | 'unread' | 'request' | 'action_required' | 'seen';

interface ChatThread {
  id: string;
  participant: User;
  messages: Message[];
  unreadCount: number;
  badgeType: BadgeType;
}

// --- Mock Data ---
const CURRENT_USER_ID = 'me';

const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Sarah Jenkins', email: 'sarah@cloudvault.com', avatar: 'https://i.pravatar.cc/150?u=10', status: 'online' },
  { id: 'u2', name: 'Mike Ross', email: 'mike@cloudvault.com', avatar: 'https://i.pravatar.cc/150?u=12', status: 'busy' },
  { id: 'u3', name: 'Jessica Pearson', email: 'jessica@cloudvault.com', avatar: 'https://i.pravatar.cc/150?u=15', status: 'offline', lastSeen: '2h ago' },
  { id: 'u4', name: 'Dev Team', email: 'dev@cloudvault.com', avatar: 'https://i.pravatar.cc/150?u=20', status: 'online' },
];

const INITIAL_CHATS: ChatThread[] = [
  {
    id: 'c1',
    participant: MOCK_USERS[0],
    unreadCount: 2,
    badgeType: 'unread',
    messages: [
      { id: 'm1', text: 'Hey! Did you get the project files?', senderId: 'u1', timestamp: new Date(Date.now() - 1000 * 60 * 60), status: 'read' },
      { id: 'm2', text: 'Yes, just reviewing them now.', senderId: 'me', timestamp: new Date(Date.now() - 1000 * 60 * 30), status: 'read' },
      { id: 'm3', text: 'Great, let me know if you need anything else.', senderId: 'u1', timestamp: new Date(Date.now() - 1000 * 60 * 5), status: 'delivered' },
      { id: 'm4', text: 'Also, are we still on for the meeting at 3?', senderId: 'u1', timestamp: new Date(Date.now() - 1000 * 60 * 2), status: 'delivered' },
    ]
  },
  {
    id: 'c2',
    participant: MOCK_USERS[1],
    unreadCount: 0,
    badgeType: 'action_required',
    messages: [
      { id: 'm5', text: 'Can you share access to the Q3 folder?', senderId: 'u2', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), status: 'read' },
      { id: 'm6', text: 'Done! Sent the invite.', senderId: 'me', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 23), status: 'read' },
    ]
  },
  {
    id: 'c3',
    participant: MOCK_USERS[2],
    unreadCount: 0,
    badgeType: 'request',
    messages: [
      { id: 'm7', text: 'The designs look fantastic!', senderId: 'u3', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), status: 'read' },
    ]
  }
];

// Simple beep sound for drop success
const playSuccessSound = () => {
  const audio = new Audio("data:audio/wav;base64,UklGRl9vT1BXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU"); // Short beep placeholder
  audio.volume = 0.2;
  audio.play().catch(() => {});
};

export const MessagesPage: React.FC = () => {
  const [chats, setChats] = useState<ChatThread[]>(INITIAL_CHATS);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  
  // Upload States
  const [newContactInput, setNewContactInput] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success'>('idle');
  
  // Refs for scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeChat = chats.find(c => c.id === activeChatId);

  // --- Effects ---

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages, attachments]); // Also scroll when attachments are added to draft

  // Clean up object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      attachments.forEach(att => {
        if (att.previewUrl) URL.revokeObjectURL(att.previewUrl);
      });
    };
  }, []); // Run on unmount

  // --- Handlers ---

  const handleRemoveAttachment = (id: string) => {
    setAttachments(prev => {
        const itemToRemove = prev.find(a => a.id === id);
        if (itemToRemove?.previewUrl) URL.revokeObjectURL(itemToRemove.previewUrl);
        return prev.filter(a => a.id !== id);
    });
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!messageInput.trim() && attachments.length === 0) || !activeChatId) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: messageInput,
      senderId: CURRENT_USER_ID,
      timestamp: new Date(),
      status: 'sent',
      attachments: attachments.length > 0 ? [...attachments] : undefined
    };

    setChats(prev => prev.map(chat => {
      if (chat.id === activeChatId) {
        return {
          ...chat,
          messages: [...chat.messages, newMessage],
          // Reset badge on reply if needed
          badgeType: 'seen' 
        };
      }
      return chat;
    }));

    setMessageInput('');
    setAttachments([]); // Clear attachments
    
    // Simulate "Delivered" -> "Read" update
    setTimeout(() => {
        setChats(prev => prev.map(chat => {
            if (chat.id === activeChatId) {
                const updatedMsgs = chat.messages.map(m => 
                    m.id === newMessage.id ? { ...m, status: 'read' as const } : m
                );
                return { ...chat, messages: updatedMsgs };
            }
            return chat;
        }));
    }, 1500);
  };

  const handleAddContact = () => {
    if(!newContactInput.trim()) return;
    
    const newChat: ChatThread = {
        id: `c_${Date.now()}`,
        participant: {
            id: `u_${Date.now()}`,
            name: newContactInput.split('@')[0],
            email: newContactInput,
            avatar: `https://i.pravatar.cc/150?u=${Date.now()}`,
            status: 'offline',
            lastSeen: 'Just now'
        },
        messages: [],
        unreadCount: 0,
        badgeType: 'none'
    };

    setChats([newChat, ...chats]);
    setActiveChatId(newChat.id);
    setIsAddModalOpen(false);
    setNewContactInput('');
  };

  // --- File Upload Logic ---

  const validateFile = (file: File): boolean => {
      // Example validation: Max 10MB
      if (file.size > 10 * 1024 * 1024) {
          alert(`File ${file.name} too large. Max 10MB.`);
          return false;
      }
      return true;
  };

  const handleFilesSelect = (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const validFiles: Attachment[] = [];
      let hasValid = false;

      fileArray.forEach(file => {
          if (!validateFile(file)) return;

          hasValid = true;
          let previewUrl: string | undefined = undefined;
          if (file.type.startsWith('image/')) {
              previewUrl = URL.createObjectURL(file);
          }

          validFiles.push({
              id: Math.random().toString(36).substring(7),
              name: file.name,
              size: file.size,
              type: file.type,
              previewUrl
          });
      });

      if (hasValid) {
          setUploadStatus('success');
          playSuccessSound();

          setTimeout(() => {
              setAttachments(prev => [...prev, ...validFiles]);
              setUploadStatus('idle');
              setIsUploadModalOpen(false);
              // Focus back to input
              setTimeout(() => inputRef.current?.focus(), 100);
          }, 800);
      }
  };

  const onDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          handleFilesSelect(e.dataTransfer.files);
          e.dataTransfer.clearData();
      }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
          handleFilesSelect(e.target.files);
      }
  };

  // --- Icon Helper ---
  const getFileIcon = (type: string, size: number = 20) => {
      if (type.startsWith('image/')) return <FileImage size={size} />;
      if (type.startsWith('video/')) return <FileVideo size={size} />;
      if (type.startsWith('audio/')) return <FileAudio size={size} />;
      if (type.includes('pdf') || type.includes('document')) return <FileText size={size} />;
      if (type.includes('zip') || type.includes('compressed')) return <FileArchive size={size} />;
      if (type.includes('javascript') || type.includes('json') || type.includes('html')) return <FileCode size={size} />;
      return <File size={size} />;
  };

  const filteredChats = chats.filter(chat => 
    chat.participant.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- Render Helpers ---
  const renderMessageAttachments = (messageAttachments: Attachment[], isMe: boolean) => {
      const images = messageAttachments.filter(a => a.type.startsWith('image/'));
      const others = messageAttachments.filter(a => !a.type.startsWith('image/'));
      
      return (
        <div className={`flex flex-col gap-2 w-full ${messageAttachments.length > 1 ? 'max-w-xs' : ''}`}>
          
          {/* Image Collage Grid */}
          {images.length > 0 && (
            <div className={`grid gap-0.5 overflow-hidden rounded-xl ${
                images.length === 1 ? 'grid-cols-1' : 
                images.length === 2 ? 'grid-cols-2' :
                'grid-cols-2' // 3+ items use 2 columns
            }`}>
                {images.slice(0, 4).map((img, idx) => {
                    // Grid Logic
                    const isThreeLayout = images.length === 3;
                    const isFirstOfThree = isThreeLayout && idx === 0;
                    
                    const showOverlay = idx === 3 && images.length > 4;
                    const overlayCount = images.length - 4;

                    return (
                        <div key={img.id} className={`relative bg-slate-100 dark:bg-slate-800 cursor-pointer group/img ${
                            images.length === 1 ? 'max-w-[320px]' : 'aspect-square'
                        } ${isFirstOfThree ? 'col-span-2 aspect-[2/1]' : ''}`}>
                            <img 
                                src={img.previewUrl || `https://picsum.photos/seed/${img.id}/400/400`} 
                                alt={img.name} 
                                className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110" 
                            />
                            {/* Overlay for +N images */}
                            {showOverlay && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-lg backdrop-blur-[2px]">
                                    +{overlayCount}
                                </div>
                            )}
                            {/* Gradient Overlay on Hover for 1-3 images */}
                            {!showOverlay && (
                                <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors"></div>
                            )}
                        </div>
                    )
                })}
            </div>
          )}

          {/* Document List */}
          {others.length > 0 && (
            <div className="flex flex-col gap-1.5 mt-1">
                {others.map((file) => (
                    <div key={file.id} className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all cursor-pointer group/file ${
                        isMe 
                            ? 'bg-white/10 border-white/20 hover:bg-white/20' 
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-600'
                    }`}>
                        <div className={`p-2 rounded-lg shrink-0 ${isMe ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-blue-600 dark:text-blue-400'}`}>
                            {getFileIcon(file.type, 20)}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className={`font-semibold text-sm truncate ${isMe ? 'text-white' : 'text-slate-700 dark:text-slate-200'}`}>{file.name}</p>
                            <p className={`text-[10px] uppercase tracking-wide font-medium ${isMe ? 'text-blue-100' : 'text-slate-500'}`}>
                                {file.type.split('/')[1] || 'FILE'} • {FORMAT_BYTES(file.size)}
                            </p>
                        </div>
                        <button className={`opacity-0 group-hover/file:opacity-100 p-1.5 rounded-full transition-all ${isMe ? 'text-white hover:bg-white/20' : 'text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                            <Download size={18} />
                        </button>
                    </div>
                ))}
            </div>
          )}
        </div>
      );
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden relative">
      
      {/* --- Sidebar (Contact List) --- */}
      <div className={`
        absolute inset-0 z-20 bg-white dark:bg-slate-900 
        md:static md:w-80 lg:w-96 md:border-r border-slate-200 dark:border-slate-800 flex flex-col
        transition-transform duration-300
        ${activeChatId ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}
      `}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Messages</h2>
                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                >
                    <UserPlus size={20} />
                </button>
            </div>
            
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                    type="text" 
                    placeholder="Search chats..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                />
            </div>
        </div>

        {/* Contact List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
            {filteredChats.map(chat => (
                <div 
                    key={chat.id}
                    onClick={() => setActiveChatId(chat.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                        activeChatId === chat.id 
                        ? 'bg-blue-50 dark:bg-blue-900/20' 
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                >
                    <div className="relative flex-shrink-0">
                        <img src={chat.participant.avatar} alt={chat.participant.name} className="w-12 h-12 rounded-full object-cover border border-slate-100 dark:border-slate-700" />
                        <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${
                            chat.participant.status === 'online' ? 'bg-green-500' :
                            chat.participant.status === 'busy' ? 'bg-red-500' :
                            'bg-slate-400'
                        }`}></span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-0.5">
                            <h3 className={`font-bold truncate text-sm ${activeChatId === chat.id ? 'text-blue-700 dark:text-blue-300' : 'text-slate-900 dark:text-white'}`}>
                                {chat.participant.name}
                            </h3>
                            {/* Time */}
                            {chat.messages.length > 0 && (
                                <span className="text-[10px] text-slate-400">
                                    {chat.messages[chat.messages.length - 1].timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                            )}
                        </div>
                        <div className="flex justify-between items-center">
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[120px]">
                                {chat.messages.length > 0 
                                    ? (chat.messages[chat.messages.length - 1].senderId === 'me' ? 'You: ' : '') + chat.messages[chat.messages.length - 1].text 
                                    : <span className="italic text-slate-400">Drafting...</span>
                                }
                            </p>
                            
                            {/* Advanced Badge Rendering */}
                            <div className="flex items-center gap-1">
                                {chat.badgeType === 'action_required' && (
                                    <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[9px] font-bold rounded-full uppercase tracking-wide">
                                        Required
                                    </span>
                                )}
                                {chat.badgeType === 'request' && (
                                    <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[9px] font-bold rounded-full uppercase tracking-wide">
                                        Request
                                    </span>
                                )}
                                {chat.unreadCount > 0 && (
                                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                                        {chat.unreadCount}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>

      {/* --- Main Chat Area --- */}
      <div className={`flex-1 flex flex-col bg-slate-50/50 dark:bg-black/20 w-full transition-transform duration-300 relative z-10 ${!activeChatId ? 'translate-x-full md:translate-x-0 opacity-0 md:opacity-100' : 'translate-x-0 opacity-100'}`}>
          
          {activeChat ? (
              <>
                {/* Clean Chat Header (No Call/Dot Icons) */}
                <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm z-10">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setActiveChatId(null)}
                            className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <div className="relative">
                             <img src={activeChat.participant.avatar} className="w-10 h-10 rounded-full" alt="User" />
                             <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900 ${activeChat.participant.status === 'online' ? 'bg-green-500' : 'bg-slate-400'}`}></span>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-sm">{activeChat.participant.name}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                {activeChat.participant.status === 'online' ? (
                                    <span className="text-green-600 dark:text-green-400">Active now</span>
                                ) : (
                                    <span>Last seen {activeChat.participant.lastSeen || 'recently'}</span>
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Messages Body */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar bg-slate-50/50 dark:bg-transparent">
                    {/* Date Separator */}
                    <div className="flex justify-center">
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full uppercase tracking-wider">Today</span>
                    </div>

                    {activeChat.messages.map((msg, index) => {
                        const isMe = msg.senderId === 'me';
                        const isLast = index === activeChat.messages.length - 1;
                        const showAvatar = !isMe && (index === 0 || activeChat.messages[index-1].senderId === 'me');

                        return (
                            <div key={msg.id} className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                {!isMe && (
                                    <div className={`w-8 h-8 flex-shrink-0 ${showAvatar ? 'opacity-100' : 'opacity-0'}`}>
                                        <img src={activeChat.participant.avatar} className="w-full h-full rounded-full" alt="sender" />
                                    </div>
                                )}
                                <div className={`flex flex-col max-w-[85%] sm:max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                                    <div 
                                        className={`
                                            px-4 py-2.5 sm:px-5 sm:py-3 text-sm sm:text-base shadow-sm relative group
                                            ${isMe 
                                                ? 'bg-blue-600 text-white rounded-[20px] rounded-tr-none' 
                                                : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-[20px] rounded-tl-none border border-slate-100 dark:border-slate-700'}
                                        `}
                                    >
                                        {/* Render Attachments */}
                                        {msg.attachments && msg.attachments.length > 0 && (
                                            <div className="mb-2">
                                                {renderMessageAttachments(msg.attachments, isMe)}
                                            </div>
                                        )}

                                        {msg.text && <p className="leading-relaxed">{msg.text}</p>}
                                        
                                        <span className={`text-[10px] absolute bottom-1 ${isMe ? 'left-[-45px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity' : 'right-[-45px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity'}`}>
                                            {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </span>
                                    </div>
                                    {isMe && isLast && (
                                        <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 font-medium">
                                            {msg.status === 'read' ? 'Read' : 'Delivered'}
                                            {msg.status === 'read' ? <CheckCheck size={12} className="text-blue-500" /> : <Check size={12} />}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                    
                    {/* Attachments Preview Area (Scrollable) */}
                    {attachments.length > 0 && (
                        <div className="mb-4 flex gap-3 overflow-x-auto pb-2 scrollbar-hide animate-in slide-in-from-bottom-2 fade-in duration-300">
                           {attachments.map((att) => (
                               <div key={att.id} className="relative group flex-shrink-0 animate-in zoom-in-95 duration-200">
                                   {att.type.startsWith('image/') && att.previewUrl ? (
                                       // Image Thumbnail
                                       <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
                                           <img src={att.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                           <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                                       </div>
                                   ) : (
                                       // File Icon Card
                                       <div className="relative w-32 h-24 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center p-3 text-center shadow-sm group-hover:border-blue-400 transition-colors">
                                           <div className="text-blue-500 dark:text-blue-400 mb-1.5 p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                               {getFileIcon(att.type, 20)}
                                           </div>
                                           <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate w-full px-1">{att.name}</p>
                                           <p className="text-[9px] text-slate-400 font-medium">{FORMAT_BYTES(att.size)}</p>
                                       </div>
                                   )}
                                   
                                   {/* Remove Button */}
                                   <button 
                                      onClick={() => handleRemoveAttachment(att.id)} 
                                      className="absolute -top-2 -right-2 p-1.5 bg-white dark:bg-slate-800 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/50 border border-slate-200 dark:border-slate-600 rounded-full shadow-lg transition-all scale-0 group-hover:scale-100 z-10"
                                   >
                                       <X size={14} strokeWidth={2.5} />
                                   </button>
                               </div>
                           ))}
                           
                           {/* Add More Button */}
                           <button 
                                onClick={() => setIsUploadModalOpen(true)}
                                className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-center text-slate-400 hover:text-blue-500 transition-all flex-shrink-0 hover:scale-95 active:scale-90"
                           >
                               <Plus size={24} />
                           </button>
                        </div>
                    )}

                    <form onSubmit={handleSendMessage} className="flex items-center gap-2 sm:gap-3">
                        {/* Functional File Selection Button */}
                        <button 
                            type="button" 
                            onClick={() => setIsUploadModalOpen(true)}
                            className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 rounded-full transition-all flex-shrink-0"
                            title="Attach File"
                        >
                            <Paperclip size={20} />
                        </button>
                        
                        <div className="flex-1 relative">
                            <input 
                                ref={inputRef}
                                type="text" 
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                                placeholder={attachments.length > 0 ? "Add a caption..." : "Type a message..."}
                                className="w-full px-5 py-3.5 bg-slate-100 dark:bg-slate-800 border-transparent focus:bg-white dark:focus:bg-slate-800 border-2 focus:border-blue-500 rounded-2xl outline-none text-slate-900 dark:text-white transition-all shadow-inner"
                            />
                        </div>
                        
                        <button 
                            type="submit" 
                            disabled={!messageInput.trim() && attachments.length === 0}
                            className="p-3.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/30 transition-all transform active:scale-95 flex items-center justify-center flex-shrink-0"
                        >
                            <Send size={20} className={messageInput.trim() || attachments.length > 0 ? 'ml-0.5' : ''} />
                        </button>
                    </form>
                </div>
              </>
          ) : (
            /* Empty State */
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-white dark:bg-slate-900 hidden md:flex">
                <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <MessageSquarePlus size={32} />
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Select a Conversation</h2>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                    Choose a shared user from the list to start chatting or add a new friend to collaborate.
                </p>
                <button onClick={() => setIsAddModalOpen(true)} className="mt-8 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all">
                    Start New Chat
                </button>
            </div>
          )}
      </div>

      {/* --- Add Friend Modal --- */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Chat">
         <div className="space-y-4">
             <p className="text-sm text-slate-600 dark:text-slate-400">
                 Enter the username or email address of the person you want to chat with.
             </p>
             <div className="space-y-2">
                 <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Email or Username</label>
                 <div className="relative">
                    <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        value={newContactInput}
                        onChange={(e) => setNewContactInput(e.target.value)}
                        placeholder="e.g. alex@cloudvault.com"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 dark:text-white"
                        autoFocus
                    />
                 </div>
             </div>
             
             {/* Mock Suggestions */}
             {newContactInput.length > 2 && (
                 <div className="mt-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                     <p className="text-xs font-bold text-slate-400 px-2 mb-1">Found in Workspace</p>
                     <div className="flex items-center gap-3 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/10 rounded-lg cursor-pointer transition-colors" onClick={handleAddContact}>
                         <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                             {newContactInput.charAt(0).toUpperCase()}
                         </div>
                         <div>
                             <p className="text-sm font-bold text-slate-800 dark:text-white">{newContactInput.split('@')[0]}</p>
                             <p className="text-xs text-slate-500">{newContactInput}</p>
                         </div>
                         <Plus size={16} className="ml-auto text-blue-500" />
                     </div>
                 </div>
             )}

             <div className="flex gap-3 pt-4 mt-2">
                 <button 
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 py-2.5 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                 >
                     Cancel
                 </button>
                 <button 
                    onClick={handleAddContact}
                    disabled={!newContactInput}
                    className="flex-1 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20 transition-all"
                 >
                     Add Chat
                 </button>
             </div>
         </div>
      </Modal>

      {/* --- File Upload Modal (Drag & Drop) --- */}
      <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title="Upload Files">
          <div 
             className={`
                relative h-64 rounded-3xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center gap-4 cursor-pointer overflow-hidden
                ${isDragging 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.02] rotate-[0.5deg]' 
                    : uploadStatus === 'success' 
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                        : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:scale-[1.01]'
                }
             `}
             onDragOver={onDragOver}
             onDragLeave={onDragLeave}
             onDrop={onDrop}
             onClick={() => fileInputRef.current?.click()}
          >
             <input 
                 type="file" 
                 ref={fileInputRef} 
                 className="hidden" 
                 onChange={onFileInputChange} 
                 multiple
             />

             {/* Animated Icons based on State */}
             <div className="relative">
                 {/* Success Icon */}
                 <div className={`transition-all duration-500 absolute inset-0 flex items-center justify-center z-20 ${uploadStatus === 'success' ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 rotate-180'}`}>
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30 animate-bounce">
                        <CheckCircle size={40} className="text-white" strokeWidth={3} />
                    </div>
                 </div>

                 {/* Drag/Idle Icon */}
                 <div className={`transition-all duration-300 ${uploadStatus === 'success' ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}`}>
                     <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${isDragging ? 'bg-blue-100 dark:bg-blue-800 text-blue-600 scale-110 shadow-lg shadow-blue-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                        <CloudUpload size={36} className={`transition-transform duration-300 ${isDragging ? 'scale-125 -translate-y-1' : ''}`} />
                     </div>
                 </div>
             </div>

             <div className="text-center z-10 px-4 transition-all duration-300">
                 {uploadStatus === 'success' ? (
                     <h3 className="text-xl font-bold text-green-600 dark:text-green-400 animate-in fade-in slide-in-from-bottom-2">Files Added!</h3>
                 ) : (
                     <>
                        <h3 className={`text-lg font-bold transition-colors ${isDragging ? 'text-blue-600 scale-105' : 'text-slate-700 dark:text-slate-200'}`}>
                            {isDragging ? 'Drop files to attach!' : 'Click to upload multiple files'}
                        </h3>
                        <p className={`text-sm mt-1 transition-colors ${isDragging ? 'text-blue-500' : 'text-slate-400'}`}>
                            Support for Images, Video, PDF & Docs
                        </p>
                     </>
                 )}
             </div>

             {/* Decorative Background Elements */}
             {isDragging && (
                 <>
                    <div className="absolute inset-0 bg-blue-500/5 animate-pulse pointer-events-none" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border-4 border-blue-500/10 rounded-full animate-ping pointer-events-none"></div>
                 </>
             )}
          </div>
          
          <div className="mt-4 flex justify-end">
             <button 
                onClick={() => setIsUploadModalOpen(false)}
                className="px-4 py-2 text-slate-500 hover:text-slate-700 font-bold"
             >
                Cancel
             </button>
          </div>
      </Modal>

    </div>
  );
};