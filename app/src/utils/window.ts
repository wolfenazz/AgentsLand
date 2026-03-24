import { invoke } from '@tauri-apps/api/core';
import { getCurrentWindow } from '@tauri-apps/api/window';

/**
 * Detect platform correctly using userAgent.
 */
let _isWindows: boolean | null = null;

export const initWindowPlatform = async (): Promise<boolean> => {
    if (_isWindows !== null) return _isWindows;

    _isWindows = navigator.userAgent.toLowerCase().includes('windows');

    if (_isWindows) {
        try {
            await getCurrentWindow().setDecorations(false);
        } catch (e) {
            console.error('Failed to set decorations:', e);
        }
    }
    return _isWindows;
};

export const getIsWindows = (): boolean => _isWindows ?? false;

/**
 * Native window commands using Rust backend for maximum reliability.
 * This bypasses any permission/sandbox issues in the browser/Vite layer.
 */
export const minimizeWindow = async () => {
    try {
        await invoke('minimize_window');
    } catch (e) {
        console.error('Rust minimize failed:', e);
    }
};

export const maximizeWindow = async () => {
    try {
        await invoke('maximize_window');
    } catch (e) {
        console.error('Rust maximize failed:', e);
    }
};

export const closeWindow = async () => {
    try {
        await invoke('close_window');
    } catch (e) {
        console.error('Rust close failed:', e);
    }
};
