import { handleAuth, handleLogin, handleLogout } from '@auth0/nextjs-auth0';
import { NextRequest } from 'next/server';

async function handler(request: NextRequest, ctx: { params: Promise<{ auth0: string[] }> }) {
  const resolvedParams = await ctx.params;

  const handlers = handleAuth({
    login: handleLogin({
      returnTo: '/sells',
    }),
    logout: handleLogout({
      returnTo: '/',
    }),
  });

  return handlers(request, { params: resolvedParams });
}

export const GET = handler;
export const POST = handler;
