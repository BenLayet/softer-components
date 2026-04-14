import { EventsContract } from '@softer-components/types';

export const uiEvents = ['signOutRequested', 'goToSignInFormRequested'] as const;
export const allEvents = [...uiEvents, 'signOutSucceeded', 'authenticated'];
export type AppEvents = EventsContract<
  typeof allEvents,
  { authenticated: { username: string } },
  typeof uiEvents
>;
