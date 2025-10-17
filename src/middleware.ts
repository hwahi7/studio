import createMiddleware from 'next-intl/middleware';
 
export default createMiddleware({
  locales: ['en', 'es', 'fr', 'de', 'hi', 'mr', 'zh', 'ja', 'ar', 'pt', 'ru', 'bn', 'id', 'ur', 'sw', 'ko', 'it', 'nl', 'tr', 'vi', 'pl', 'th', 'uk', 'ro', 'el'],
 
  // Used when no locale matches
  defaultLocale: 'en'
});
 
export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(de|en|es|fr|hi|mr|zh|ja|ar|pt|ru|bn|id|ur|sw|ko|it|nl|tr|vi|pl|th|uk|ro|el)/:path*']
};