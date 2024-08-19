import { ReactNode } from "react";
export const runtime = 'edge'

export interface ContextProviderValue {
  [propName: string]: any;
}

export interface ContextProviderProps {
  children: ReactNode;
}
