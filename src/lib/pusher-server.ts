import PusherOriginal from 'pusher';

const isMock = 
  !process.env.PUSHER_APP_ID || 
  process.env.PUSHER_APP_ID.includes('mock') || 
  !process.env.NEXT_PUBLIC_PUSHER_APP_KEY || 
  process.env.NEXT_PUBLIC_PUSHER_APP_KEY.includes('mock');

const pusher = new PusherOriginal({
  appId: process.env.PUSHER_APP_ID || 'mock-app-id',
  key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY || 'mock-key',
  secret: process.env.PUSHER_SECRET || 'mock-secret',
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap2',
  useTLS: true,
});

export const pusherServer = {
  trigger: async (channel: string, event: string, data: unknown) => {
    if (isMock) {
      console.log(`[Pusher MOCK] Triggered channel "${channel}" event "${event}"`);
      return;
    }
    return pusher.trigger(channel, event, data as Parameters<PusherOriginal['trigger']>[2]);
  }
};
