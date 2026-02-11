import { useEffect } from 'react';

type KeyCombo = string; // e.g., "Alt+N", "Meta+K", "Ctrl+Shift+L"

export const useShortcut = (shortcut: KeyCombo | undefined, callback: (e: KeyboardEvent) => void) => {
  useEffect(() => {
    if (!shortcut) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Parse the shortcut string (e.g., "Alt+Shift+F")
      const keys = shortcut.toLowerCase().split('+').map(k => k.trim());
      
      // 2. Check Modifiers
      const hasAlt = keys.includes('alt');
      const hasCtrl = keys.includes('ctrl') || keys.includes('control');
      const hasMeta = keys.includes('meta') || keys.includes('cmd') || keys.includes('command'); // Mac Command or Win Key
      const hasShift = keys.includes('shift');

      // 3. Check exact modifier match (prevent Alt+F triggering on Alt+Shift+F)
      if (e.altKey !== hasAlt) return;
      if (e.ctrlKey !== hasCtrl) return;
      if (e.metaKey !== hasMeta) return;
      if (e.shiftKey !== hasShift) return;

      // 4. Check the main key (the last one usually, e.g., 'f', 'enter')
      const mainKey = keys.find(k => !['alt', 'ctrl', 'control', 'meta', 'cmd', 'command', 'shift'].includes(k));
      
      if (!mainKey) return; // Should not happen if config is correct

      // Normalize event key
      const pressedKey = e.key.toLowerCase();
      const codeKey = e.code.toLowerCase(); // e.g., 'keyf'

      // Match either key char or key code (handles 'f' vs 'KeyF')
      if (pressedKey === mainKey || codeKey === `key${mainKey}` || codeKey === mainKey) {
        
        // Prevent default browser actions if needed (except for inputs unless specified)
        // We generally don't want shortcuts firing while typing in inputs
        if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
             // Exception: Command/Ctrl + K usually works in inputs in many apps, but let's stick to safety
             // If modifier is used, we might allow it, but for safety blocking all.
             return; 
        }

        e.preventDefault();
        callback(e);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcut, callback]);
};
