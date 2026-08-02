import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/checkout/:path*'],
};

export default withAuth(
  function middleware(req) {
    const isAdmin = (req.nextauth.token?.role as string) === 'ADMIN';
    const isAdminRoute = req.nextUrl.pathname.startsWith('/admin');

    if (isAdminRoute && !isAdmin) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);
