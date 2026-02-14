import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useShortcut } from '../../hooks/useShortcut';
import { 
  LayoutGrid,
  MessageSquare,
  Puzzle,
  CreditCard,
  Layers,
  FileText,
  Folder,
  Pin,
  Plus,
  Minus,
  Settings,
  Cloud,
  Database,
  HardDrive
} from 'lucide-react';

// --- Types ---
interface NavItem {
  id: string;
  label: string;
  icon?: React.ElementType;
  path?: string;
  children?: NavItem[];
  badge?: number | string;
  actionIcon?: React.ElementType;
  shortcut?: string; 
}

interface SidebarProps {
    onClose?: () => void;
}

// --- Components ---

const SidebarSectionHeader: React.FC<{ title: string; count?: number; icon?: React.ElementType }> = ({ title, count, icon: Icon }) => (
  <div className="flex items-center justify-between px-3 mt-8 mb-3 group cursor-pointer text-slate-500 hover:text-slate-800 dark:text-slate-500 dark:hover:text-slate-300 transition-colors">
    <div className="flex items-center gap-2">
       <span className="text-xs font-bold uppercase tracking-wider">{title}</span>
       {count !== undefined && <span className="text-xs font-medium">({count})</span>}
    </div>
    {Icon && <Icon size={14} />}
  </div>
);

const Badge: React.FC<{ count: number | string }> = ({ count }) => (
  <span className="flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-blue-600 rounded-full">
    {count}
  </span>
);

/**
 * Individual Item Component to allow usage of Hooks (useShortcut) per item
 */
const SidebarItem: React.FC<{ 
    item: NavItem; 
    isChild?: boolean; 
    expandedIds: string[]; 
    toggleExpand: (id: string) => void;
    onNavigate: () => void;
}> = ({ item, isChild = false, expandedIds, toggleExpand, onNavigate }) => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Determine active state based on URL
    const isActive = item.path ? location.pathname === item.path : false;
    const isExpanded = expandedIds.includes(item.id);
    const hasChildren = !!item.children;
    const Icon = item.icon;
    const ActionIcon = item.actionIcon;

    // --- REUSABLE SHORTCUT IMPLEMENTATION ---
    useShortcut(item.shortcut, () => {
        if (item.path) {
            navigate(item.path);
            onNavigate(); // Close mobile menu if needed
        } else if (hasChildren) {
            toggleExpand(item.id);
        }
    });

    // --- Styling Logic ---
    let containerClass = "relative flex items-center justify-between px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 cursor-pointer select-none group ";
    let iconClass = "mr-3 transition-colors duration-200 ";
    
    if (hasChildren) {
        // Group Header Logic
        // Check if a child is currently active to highlight parent lightly if collapsed, or just expanded style
        const isChildActive = item.children?.some(child => child.path === location.pathname);

        if (isExpanded) {
            containerClass += "bg-blue-600 text-white shadow-lg shadow-blue-600/20";
            iconClass += "text-white";
        } else if (isActive || isChildActive) {
             // Parent is active (e.g. My Files page) OR a child is active, but group is collapsed
             containerClass += "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400";
             iconClass += "text-blue-700 dark:text-blue-400";
        } else {
            containerClass += "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white";
            iconClass += "text-slate-500 group-hover:text-slate-800 dark:text-slate-400 dark:group-hover:text-white";
        }
    } else if (isChild) {
        if (isActive) {
            containerClass += "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400";
            iconClass += "text-blue-700 dark:text-blue-400";
        } else {
            containerClass += "text-slate-500 hover:text-slate-900 dark:text-slate-500 dark:hover:text-slate-300";
            iconClass += "";
        }
    } else {
        // Top Level Leaf
        if (isActive) {
             containerClass += "bg-blue-600 text-white shadow-md shadow-blue-600/20";
             iconClass += "text-white";
        } else {
             containerClass += "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white";
             iconClass += "text-slate-500 group-hover:text-slate-800 dark:text-slate-400 dark:group-hover:text-white";
        }
    }

    const content = (
      <>
        <div className="flex items-center min-w-0">
          {Icon && <Icon size={16} className={iconClass} strokeWidth={isActive || isExpanded ? 2.5 : 2} />}
          <span className="truncate">{item.label}</span>
        </div>
        <div className="flex items-center gap-2">
            {/* Shortcut Badge */}
            {item.shortcut && (
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border shadow-sm ${
                  (hasChildren && isExpanded) || (!hasChildren && isActive)
                    ? 'border-blue-400 bg-blue-500 text-white'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
              }`}>
                {item.shortcut}
              </span>
            )}

            {item.badge && <Badge count={item.badge} />}
            {ActionIcon && <ActionIcon size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-white" />}
            {hasChildren && (
                isExpanded 
                ? <Minus size={14} className="text-white/80" strokeWidth={3} /> 
                : <Plus size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
        </div>
      </>
    );

    if (hasChildren) {
      return (
        <div className="mb-1">
          <div onClick={() => toggleExpand(item.id)} className={containerClass}>
            {content}
          </div>
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
            <div className="relative pl-3 flex flex-col gap-1">
               <div className="absolute left-[19px] top-0 bottom-4 w-px bg-slate-200 dark:bg-slate-800"></div>
               {item.children?.map(child => (
                   <div key={child.id} className="pl-6 relative">
                       <div className={`absolute left-[-5px] top-1/2 -translate-y-1/2 w-3 h-[1.5px] bg-slate-200 dark:bg-slate-800 ${location.pathname === child.path ? 'bg-blue-300 dark:bg-blue-700' : ''}`}></div>
                       <SidebarItem 
                           item={child} 
                           isChild={true} 
                           expandedIds={expandedIds} 
                           toggleExpand={toggleExpand} 
                           onNavigate={onNavigate}
                        />
                   </div>
               ))}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div 
        onClick={() => {
            if(item.path) {
                navigate(item.path);
                onNavigate();
            }
        }} 
        className={containerClass}
      >
        {content}
      </div>
    );
};


export const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const location = useLocation();
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  const menuItems: NavItem[] = [
    { id: 'overview', label: 'Home', icon: LayoutGrid, path: '/dashboard/overview', shortcut: 'Alt+H' },
    { id: 'filemanager', label: 'File Manager', icon: HardDrive, path: '/dashboard/file-manager', shortcut: 'Alt+E' },
    { id: 'storage', label: 'Storage', icon: Database, path: '/dashboard/storage', shortcut: 'Alt+D' },
    { id: 'messages', label: 'Messages', icon: MessageSquare, path: '/dashboard/messages', badge: 2, shortcut: 'Alt+M' },
    { id: 'integrations', label: 'Integrations', icon: Puzzle, path: '/dashboard/integrations', actionIcon: Plus },
    { id: 'finance', label: 'Finance', icon: CreditCard, path: '/dashboard/settings', shortcut: 'Alt+S' },
  ];

  const fileGroup: NavItem = { 
    id: 'files', 
    label: 'My Files', 
    icon: Layers, 
    path: '/dashboard/files', 
    shortcut: 'Alt+F',
    children: [
      { id: 'all', label: 'All Files', path: '/dashboard/files' },
      { id: 'shared', label: 'Shared System', path: '/dashboard/shared' },
      { id: 'assets', label: 'Asset Library', path: '/dashboard/assets' },
    ]
  };

  const draftItems: NavItem[] = [
    { id: 'recent', label: 'General', icon: FileText, path: '/dashboard/recent' },
    { id: 'drafts-folder', label: 'Project Alpha', icon: FileText, path: '/dashboard/drafts' },
    { id: 'feedback', label: 'Feedback', icon: FileText, path: '/dashboard/feedback' },
  ];

  const folderItems: NavItem[] = [
    { id: 'starred', label: 'Starred Items', icon: Folder, path: '/dashboard/starred' },
    { id: 'images', label: 'Images', icon: Folder, path: '/dashboard/images' },
    { id: 'videos', label: 'Videos', icon: Folder, path: '/dashboard/videos' },
    { id: 'trash', label: 'Trash', icon: Folder, path: '/dashboard/trash' },
  ];

  const allExpandableItems = [fileGroup, ...draftItems, ...folderItems]; // Items that have children

  // --- Auto-Expand Logic ---
  useEffect(() => {
    const currentPath = location.pathname;
    
    // Check which group should be open based on current path
    const groupsToOpen = allExpandableItems
        .filter(group => {
            // Open if group path matches current path directly
            const directMatch = group.path === currentPath;
            // Open if any child matches current path
            const childMatch = group.children?.some(child => child.path === currentPath);
            return directMatch || childMatch;
        })
        .map(g => g.id);

    // Replace state entirely to ensure groups that don't match the new path are closed.
    setExpandedIds(groupsToOpen);
    
  }, [location.pathname]);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleNavigate = () => {
    if (onClose) onClose();
  };

  return (
    <aside className="w-full h-full flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-colors font-sans select-none overflow-hidden">
      
      {/* Header - Logo */}
      <div className="h-16 px-6 flex items-center gap-3 mb-2">
         <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
            <Cloud size={16} strokeWidth={3} />
         </div>
         <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">CloudVault</span>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-1 custom-scrollbar">
        
        {menuItems.map(item => (
            <SidebarItem 
                key={item.id} 
                item={item} 
                expandedIds={expandedIds} 
                toggleExpand={toggleExpand}
                onNavigate={handleNavigate}
            />
        ))}

        <div className="py-2">
            <SidebarItem 
                item={fileGroup} 
                expandedIds={expandedIds} 
                toggleExpand={toggleExpand}
                onNavigate={handleNavigate}
            />
        </div>

        <div className="mt-6">
            <SidebarSectionHeader title="Drafts" count={3} icon={Pin} />
            <div className="space-y-1">
               {draftItems.map(item => (
                   <SidebarItem 
                        key={item.id} 
                        item={item} 
                        expandedIds={expandedIds} 
                        toggleExpand={toggleExpand}
                        onNavigate={handleNavigate}
                    />
               ))}
            </div>
        </div>

        <div className="mt-4">
            <SidebarSectionHeader title="Folders" count={6} icon={Folder} />
            <div className="space-y-1">
               {folderItems.map(item => (
                   <SidebarItem 
                        key={item.id} 
                        item={item} 
                        expandedIds={expandedIds} 
                        toggleExpand={toggleExpand}
                        onNavigate={handleNavigate}
                    />
               ))}
            </div>
        </div>

      </div>

      {/* Footer Profile */}
      <div className="p-4 mx-4 mb-4 bg-slate-50 dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between cursor-pointer hover:border-blue-300 transition-colors group">
          <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                  AJ
              </div>
              <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">Alex Johnson</span>
                  <span className="text-[10px] text-slate-500">Pro Workspace</span>
              </div>
          </div>
          <Settings size={14} className="text-slate-400 group-hover:text-slate-600" />
      </div>

    </aside>
  );
};