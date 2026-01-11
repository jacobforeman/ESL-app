import AsyncStorage from '@react-native-async-storage/async-storage';

import { readStore, writeStore } from '../src/storage/storageEngine';
import { profileStore } from '../src/storage/stores';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

type AsyncStorageMock = typeof AsyncStorage & {
  setItem: jest.Mock;
  getItem: jest.Mock;
  clear: jest.Mock;
};

describe('storage smoke test', () => {
  beforeEach(() => {
    (AsyncStorage as AsyncStorageMock).clear();
  });

  it('writes and reads from storage stores', async () => {
    await writeStore(profileStore, {
      ...profileStore.defaultData,
      name: 'Test User',
    });

    const envelope = await readStore(profileStore);
    expect(envelope.data.name).toBe('Test User');
  });
});
