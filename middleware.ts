import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('user_session')
  const isLoggedIn = !!token && token.value !== '' && token.value !== 'undefined'
  
  // Rotas públicas que não requerem autenticação
  const publicRoutes = ['/login', '/signup', '/register', '/forgot-password', '/reset-password']
  const isPublicRoute = publicRoutes.some(route => request.nextUrl.pathname.startsWith(route))

  // Se estiver logado e tentar acessar rota pública (exceto /), redireciona para /dashboard
  if (isLoggedIn && isPublicRoute && request.nextUrl.pathname !== '/') {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Se não estiver logado e tentar acessar rota privada, redireciona para /login
  if (!isLoggedIn && !isPublicRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Página raiz: redireciona baseado em auth
  if (request.nextUrl.pathname === '/') {
    const url = request.nextUrl.clone()
    if (isLoggedIn) {
      url.pathname = '/dashboard'
    } else {
      url.pathname = '/login'
    }
    return NextResponse.redirect(url)
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
