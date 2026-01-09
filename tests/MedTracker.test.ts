import AsyncStorage from '@react-native-async-storage/async-storage';

import { initialMedStoreState, useMedStore } from '../src/state/useMedStore';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

type AsyncStorageMock = typeof AsyncStorage & {
  setItem: jest.Mock;
  getItem: jest.Mock;
  clear: jest.Mock;
};

const resetStore = () => {
  useMedStore.setState({
    ...initialMedStoreState,
    meds: [
      {
        id: 'med-1',
        name: 'Tacrolimus',
        critical: true,
      },
    ],
  });
};

describe('useMedStore', () => {
  beforeEach(() => {
    resetStore();
    (AsyncStorage as AsyncStorageMock).clear();
    (AsyncStorage as AsyncStorageMock).setItem.mockClear();
  });

  it('transitions dose status for a date', () => {
    const date = '2024-01-01';
    const store = useMedStore.getState();

    store.resetDaily(date);
    store.markDoseTaken('med-1', date);
    expect(useMedStore.getState().history[date]?.['med-1']).toBe('taken');

    store.markDoseMissed('med-1', date);
    expect(useMedStore.getState().history[date]?.['med-1']).toBe('missed');

    store.markDoseUnknown('med-1', date);
    expect(useMedStore.getState().history[date]?.['med-1']).toBe('unknown');
  });

  it('persists adherence history serialization', () => {
    const date = '2024-02-10';
    const store = useMedStore.getState();

    store.resetDaily(date);
    store.markDoseTaken('med-1', date);

    const storageMock = AsyncStorage as AsyncStorageMock;
    const lastCall = storageMock.setItem.mock.calls.at(-1);
    expect(lastCall).toBeDefined();

    const [key, value] = lastCall ?? [];
    expect(key).toBe('esl.medTracker');

    const parsed = JSON.parse(value);
    expect(parsed.state.history[date]['med-1']).toBe('taken');
  });
});
