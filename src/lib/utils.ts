import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateDeviceId() {
  return 'BT-' + Math.random().toString(36).substring(2, 10).toUpperCase();
}

export function formatTime(time: string) {
  return time; // Simple for now
}
