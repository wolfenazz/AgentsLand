import { LayoutConfig } from '../types';

export const getGridLayout = (sessions: number): string => {
  switch (sessions) {
    case 1:
      return "grid-cols-1 grid-rows-1";
    case 2:
      return "grid-cols-2 grid-rows-1";
    case 4:
      return "grid-cols-2 grid-rows-2";
    case 6:
      return "grid-cols-3 grid-rows-2";
    case 8:
      return "grid-cols-4 grid-rows-2";
    default:
      return "grid-cols-1 grid-rows-1";
  }
};

export const getLayoutDimensions = (sessions: number): { rows: number; cols: number } => {
  switch (sessions) {
    case 1:
      return { rows: 1, cols: 1 };
    case 2:
      return { rows: 1, cols: 2 };
    case 4:
      return { rows: 2, cols: 2 };
    case 6:
      return { rows: 2, cols: 3 };
    case 8:
      return { rows: 2, cols: 4 };
    default:
      return { rows: 1, cols: 1 };
  }
};

export const validateLayoutConfig = (config: LayoutConfig): boolean => {
  const validSessions = [1, 2, 4, 6, 8];
  return validSessions.includes(config.sessions) && config.type === "grid";
};
