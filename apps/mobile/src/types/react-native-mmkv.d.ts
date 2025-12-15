/**
 * Type declarations for react-native-mmkv
 * 
 * MMKV is a fast, efficient, small mobile key-value storage framework.
 * This module provides basic type definitions until the package is installed.
 * 
 * To install: pnpm add react-native-mmkv
 */

declare module 'react-native-mmkv' {
  export interface MMKVConfiguration {
    id?: string;
    path?: string;
    encryptionKey?: string;
  }

  export class MMKV {
    constructor(configuration?: MMKVConfiguration);

    set(key: string, value: string | number | boolean | Uint8Array): void;
    getString(key: string): string | undefined;
    getNumber(key: string): number | undefined;
    getBoolean(key: string): boolean | undefined;
    getBuffer(key: string): Uint8Array | undefined;

    contains(key: string): boolean;
    delete(key: string): void;
    getAllKeys(): string[];
    clearAll(): void;

    recrypt(encryptionKey: string | undefined): void;
  }

  export function useMMKVStorage<T>(
    key: string,
    instance: MMKV,
    defaultValue?: T
  ): [T | undefined, (value: T | ((prev: T | undefined) => T)) => void];
}
