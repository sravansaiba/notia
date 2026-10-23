'use client';

import { useSyncExternalStore } from 'react';
const subscribe = () => () => {};
const clientReady = () => true;
const serverReady = () => false;
export const useClientReady = () =>
  useSyncExternalStore(subscribe, clientReady, serverReady);
