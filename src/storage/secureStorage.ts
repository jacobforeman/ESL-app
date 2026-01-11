import { StorageStore, readStore, updateStore, writeStore } from './storageEngine';

export interface SecureStorage {
  read<T>(store: StorageStore<T>): Promise<T>;
  write<T>(store: StorageStore<T>, data: T): Promise<void>;
  update<T>(store: StorageStore<T>, updater: (data: T) => T): Promise<T>;
}

export const asyncStorageBackend: SecureStorage = {
  read: async <T>(store: StorageStore<T>) => {
    const envelope = await readStore(store);
    return envelope.data;
  },
  write: async <T>(store: StorageStore<T>, data: T) => {
    await writeStore(store, data);
  },
  update: async <T>(store: StorageStore<T>, updater: (data: T) => T) => {
    return updateStore(store, updater);
  },
};

export const secureStorage: SecureStorage = asyncStorageBackend;
// TODO: Swap to encrypted storage backend before enabling cloud sync.
