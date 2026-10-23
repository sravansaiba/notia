'use client';

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';
import { Toaster, type Position, type Theme } from 'notia';

interface Settings {
  position: Position;
  setPosition: Dispatch<SetStateAction<Position>>;
  theme: Theme;
  setTheme: Dispatch<SetStateAction<Theme>>;
  duration: number;
  setDuration: Dispatch<SetStateAction<number>>;
}
const Context = createContext<Settings | null>(null);
export function usePlaygroundSettings() {
  const context = useContext(Context);
  if (!context)
    throw new Error('Playground settings require the site provider.');
  return context;
}
export function Providers({ children }: { children: ReactNode }) {
  const [position, setPosition] = useState<Position>('bottom-right');
  const [theme, setTheme] = useState<Theme>('light');
  const [duration, setDuration] = useState(4000);
  const settings = useMemo(
    () => ({ position, setPosition, theme, setTheme, duration, setDuration }),
    [position, theme, duration],
  );
  return (
    <Context.Provider value={settings}>
      {children}
      <Toaster position={position} theme={theme} duration={duration} />
    </Context.Provider>
  );
}
