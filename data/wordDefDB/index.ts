

import { DEFINITIONS_NORMAL } from './normal';
import { DEFINITIONS_SIMPLIFIED } from './simplified';
import { DEFINITIONS_ELI5 } from './eli5';

export const WORD_DEFINITIONS = {
  normal: DEFINITIONS_NORMAL,
  simplified: DEFINITIONS_SIMPLIFIED,
  eli5: DEFINITIONS_ELI5
};

export type DefinitionType = keyof typeof WORD_DEFINITIONS;