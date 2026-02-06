import { httpHandler } from '@/server';

// export const runtime = 'edge' // nextjs runtime
export const runtime = 'nodejs';

export { httpHandler as GET, httpHandler as POST, httpHandler as PUT, httpHandler as DELETE };
