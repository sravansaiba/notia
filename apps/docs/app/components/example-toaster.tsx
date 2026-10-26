'use client';
import {
  createContext,
  useContext,
  useEffect,
  useId,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { Toaster, type ToasterProps } from 'notia';
export interface ExampleConfiguration {
  props: ToasterProps;
  key: string;
}
export const ExampleHost = createContext<Dispatch<
  SetStateAction<ExampleConfiguration | null>
> | null>(null);
// Embedded examples configure the website's single Toaster; standalone examples own theirs.
export function ExampleToaster(props: ToasterProps) {
  const key = useId();
  const configure = useContext(ExampleHost);
  useEffect(() => {
    if (!configure) return;
    configure({ props, key });
    return () => configure(null);
  }, [configure, props, key]);
  return configure ? null : <Toaster {...props} />;
}
