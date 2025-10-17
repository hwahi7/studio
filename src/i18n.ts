import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';
 
// Can be imported from a shared config
const locales = ['en', 'es', 'fr', 'de', 'hi', 'mr', 'zh', 'ja', 'ar', 'pt', 'ru', 'bn', 'id', 'ur', 'sw', 'ko', 'it', 'nl', 'tr', 'vi', 'pl', 'th', 'uk', 'ro', 'el'];
 
export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound();
 
  let messages;
  try {
    // Attempt to load the messages for the requested locale.
    messages = (await import(`../messages/${locale}.json`)).default;
  } catch (error) {
    // If the messages for the requested locale are not found, fall back to English.
    console.warn(`Messages for locale "${locale}" not found. Falling back to "en".`);
    messages = (await import('../messages/en.json')).default;
  }

  return {
    messages
  };
});