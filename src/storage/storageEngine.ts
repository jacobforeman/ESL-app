import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageEnvelope } from './types';

type Migration<T> = (data: T) => T;

export interface StorageStore<T> {
  key: string;
  version: number;
  defaultData: T;
  migrations: Migration<T>[];
}

const createEnvelope = <T>(version: number, data: T): StorageEnvelope<T> => ({
  version,
  data,
});

const migrate = <T>(envelope: StorageEnvelope<T> | null, store: StorageStore<T>): StorageEnvelope<T> => {
  if (!envelope) {
    return createEnvelope(store.version, store.defaultData);
  }

  let current = envelope;
  while (current.version < store.version) {
    const migration = store.migrations[current.version];
    if (!migration) {
      break;
    }
    current = createEnvelope(current.version + 1, migration(current.data));
  }

  if (current.version !== store.version) {
    return createEnvelope(store.version, current.data);
  }

  return current;
};

export const readStore = async <T>(store: StorageStore<T>): Promise<StorageEnvelope<T>> => {
  const raw = await AsyncStorage.getItem(store.key);
  const parsed = raw ? (JSON.parse(raw) as StorageEnvelope<T>) : null;
  const migrated = migrate(parsed, store);

  if (!raw || parsed?.version !== migrated.version) {
    await AsyncStorage.setItem(store.key, JSON.stringify(migrated));
  }

  return migrated;
};

export const writeStore = async <T>(store: StorageStore<T>, data: T): Promise<void> => {
  const envelope = createEnvelope(store.version, data);
  await AsyncStorage.setItem(store.key, JSON.stringify(envelope));
};

export const updateStore = async <T>(store: StorageStore<T>, updater: (data: T) => T): Promise<T> => {
  const current = await readStore(store);
  const updated = updater(current.data);
  await writeStore(store, updated);
  return updated;
};
