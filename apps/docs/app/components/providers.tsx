'use client';
import {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';
import { usePathname } from 'next/navigation';
import { notia, Toaster, type Position, type Theme } from 'notia';
import { ExampleHost, type ExampleConfiguration } from './example-toaster';
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
function PlaygroundProvider({ children }: { children: ReactNode }) {
  const [demo, setDemo] = useState<ExampleConfiguration | null>(null);
  const [position, setPosition] = useState<Position>('bottom-right');
  const [theme, setTheme] = useState<Theme>('system');
  const [duration, setDuration] = useState(4000);
  const settings = useMemo(
    () => ({ position, setPosition, theme, setTheme, duration, setDuration }),
    [position, theme, duration],
  );
  useEffect(() => () => notia.dismissAll(), []);
  return (
    <Context.Provider value={settings}>
      <ExampleHost.Provider value={setDemo}>{children}</ExampleHost.Provider>
      <Toaster
        key={demo?.key ?? 'website'}
        position={position}
        theme={theme}
        duration={duration}
        {...demo?.props}
      />
    </Context.Provider>
  );
}
export function Providers({ children }: { children: ReactNode }) {
  const pathname = usePathname() || '/';
  // Each page owns its settings; navigation cannot leak playground configuration.
  return pathname.startsWith('/examples/') ? (
    children
  ) : (
    <PlaygroundProvider key={pathname}>{children}</PlaygroundProvider>
  );
}
