import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('user_session')
  const isLoggedIn = !!token && token.value !== '' && token.value !== 'undefined'
  
  // Páginas públicas que não requerem autenticação
  const isPublicPage = 
    request.nextUrl.pathname.startsWith('/login') || 
    request.nextUrl.pathname.startsWith('/signup') ||
    request.nextUrl.pathname.startsWith('/forgot-password') ||
    request.nextUrl.pathname.startsWith('/reset-password') ||
    request.nextUrl.pathname === '/'

  // Se não estiver logado e tentar acessar página protegida, redireciona para login
  if (!isLoggedIn && !isPublicPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Se estiver logado e tentar acessar página de auth (exceto /), redireciona para home
  if (isLoggedIn && isPublicPage && request.nextUrl.pathname !== '/') {
    const url = request.nextUrl.clone()
    url.pathname = '/home'
    return NextResponse.redirect(url)
  }

  // Se não estiver logado e estiver na página inicial, redireciona para login
  if (!isLoggedIn && request.nextUrl.pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
