import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('authToken')?.value;
  const userRole = request.cookies.get('userRole')?.value?.toUpperCase();

  // Helper to determine destination dashboard for authenticated user
  const getDashboardPath = () => {
    if (userRole === 'TEACHER') return '/teacher';
    if (userRole === 'STUDENT') return '/student';
    return '/admin';
  };

  const isLoginPage =
    pathname === '/' ||
    pathname === '/admin/login' ||
    pathname === '/teacher/login' ||
    pathname === '/student/login' ||
    pathname === '/login';

  // 1. If user is already authenticated and visits Root (/) or any Login page,
  // redirect them directly to their corresponding dashboard
  if ((pathname === '/' || isLoginPage) && token) {
    if (pathname === '/admin/login' && userRole === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    if (pathname === '/teacher/login' && userRole === 'TEACHER') {
      return NextResponse.redirect(new URL('/teacher', request.url));
    }
    if (pathname === '/student/login' && userRole === 'STUDENT') {
      return NextResponse.redirect(new URL('/student', request.url));
    }
    return NextResponse.redirect(new URL(getDashboardPath(), request.url));
  }

  // 2. Unauthenticated protection: redirect to root login portal (/)
  // Only append 'from' parameter if user was accessing a specific sub-route
  if (!isLoginPage) {
    if ((pathname.startsWith('/admin') || pathname.startsWith('/teacher') || pathname.startsWith('/student')) && !token) {
      const loginUrl = new URL('/', request.url);
      if (pathname !== '/admin' && pathname !== '/teacher' && pathname !== '/student') {
        loginUrl.searchParams.set('from', pathname);
      }
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. Role authorization checks for protected dashboard paths
  if (!isLoginPage && token && userRole) {
    if (pathname.startsWith('/admin') && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL(getDashboardPath(), request.url));
    }
    if (pathname.startsWith('/teacher') && userRole !== 'TEACHER' && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL(getDashboardPath(), request.url));
    }
    if (pathname.startsWith('/student') && userRole !== 'STUDENT' && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL(getDashboardPath(), request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/admin/:path*',
    '/teacher/:path*',
    '/student/:path*'
  ],
};
