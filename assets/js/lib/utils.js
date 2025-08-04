import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Utility function for locale-aware date formatting
export function formatDate(date, locale = 'en-US', options = {}) {
  if (!date) return '-';

  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  const finalOptions = { ...defaultOptions, ...options };

  try {
    return new Date(date).toLocaleDateString(locale, finalOptions);
  } catch (error) {
    console.error('Date formatting error:', error);
    return new Date(date).toLocaleDateString();
  }
}

// Get locale from current language
export function getDateLocale(lng) {
  switch (lng) {
    case 'fr':
      return 'fr-FR';
    case 'en':
      return 'en-US';
    default:
      return 'en-US';
  }
}
