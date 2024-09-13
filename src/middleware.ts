import { match as matchLocale } from '@formatjs/intl-localematcher';
// Utiliser pour décoder les cookies
import { NextRequest, NextResponse } from 'next/server';

const locales = ['en', 'fr']; // Langues supportées

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Ignore les fichiers statiques et les ressources Next.js
  if (pathname.startsWith('/_next') || pathname.includes('.')) {
    return NextResponse.next();
  }

  // Récupérer la langue depuis l'URL
  const locale =
    locales.find(locale => pathname.startsWith(`/${locale}`)) || 'fr'; // Langue par défaut: 'fr'

  // Exclure les pages de connexion de la redirection
  if (pathname.startsWith(`/${locale}/signin`)) {
    return NextResponse.next();
  }

  // Gérer la langue si elle est manquante dans l'URL
  const pathnameIsMissingLocale = locales.every(
    locale => !pathname.startsWith(`/${locale}/`),
  );

  if (pathnameIsMissingLocale) {
    const acceptLanguageHeader = request.headers.get('accept-language') || '';
    const acceptLanguages = acceptLanguageHeader
      .split(',')
      .map(lang => lang.trim())
      .filter(lang => locales.includes(lang)); // Ne garder que les langues supportées

    const preferredLocale = matchLocale(
      acceptLanguages.length > 0 ? acceptLanguages : ['fr'],
      locales,
      'fr', // Langue par défaut si aucune langue correspondante n'est trouvée
    );

    return NextResponse.redirect(
      new URL(`/${preferredLocale}${pathname}`, request.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
};
