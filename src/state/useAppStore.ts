import { moduleRegistry } from "../modules/core/ModuleRegistry";
import { esldModule } from "../modules/esld/esldModule";
import type { DiseaseModule } from "../modules/core/ModuleRegistry";

export type AppState = {
  activeModuleId: string;
  setActiveModuleId: (id: string) => void;
  getActiveModule: () => DiseaseModule | undefined;
};

const state: AppState = {
  activeModuleId: esldModule.id,
  setActiveModuleId: (id) => {
    state.activeModuleId = id;
  },
  getActiveModule: () => moduleRegistry.getById(state.activeModuleId),
};

export const appState = state;
