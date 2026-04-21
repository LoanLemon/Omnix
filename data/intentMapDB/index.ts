
import { IntentMap } from '../../types';
import { INTENT_MAP_CHUNK_0 } from './0';
import { INTENT_MAP_CHUNK_1 } from './1';
import { INTENT_MAP_CHUNK_2 } from './2';
import { INTENT_MAP_CHUNK_3 } from './3';
import { INTENT_MAP_CHUNK_4 } from './4';
import { INTENT_MAP_CHUNK_5 } from './5';
import { INTENT_MAP_CHUNK_6 } from './6';
import { INTENT_MAP_CHUNK_7 } from './7';
import { INTENT_MAP_CHUNK_8 } from './8';
import { INTENT_MAP_CHUNK_9 } from './9';
import { INTENT_MAP_CHUNK_10 } from './10';
import { INTENT_MAP_CHUNK_11 } from './11';
import { INTENT_MAP_CHUNK_12 } from './12';
import { INTENT_MAP_CHUNK_13 } from './13';
import { INTENT_MAP_CHUNK_14 } from './14';
import { INTENT_MAP_CHUNK_15 } from './15';
import { INTENT_MAP_CHUNK_16 } from './16';
import { INTENT_MAP_CHUNK_17 } from './17';
import { INTENT_MAP_CHUNK_18 } from './18';
import { INTENT_MAP_CHUNK_19 } from './19';
import { INTENT_MAP_CHUNK_20 } from './20';
import { INTENT_MAP_CHUNK_21 } from './21';
import { INTENT_MAP_CHUNK_22 } from './22';
import { INTENT_MAP_CHUNK_23 } from './23';
import { INTENT_MAP_CHUNK_24 } from './24';
import { INTENT_MAP_CHUNK_25 } from './25';
import { INTENT_MAP_CHUNK_26 } from './26';
import { INTENT_MAP_CHUNK_27 } from './27';


/**
 * Merges all intent map chunks into a single IntentMap.
 * This provides a single source of truth for the rest of the application,
 * while keeping the source data modular and maintainable.
 */
export const INTENT_MAP: IntentMap = new Map([
  ...INTENT_MAP_CHUNK_0.entries(),
  ...INTENT_MAP_CHUNK_1.entries(),
  ...INTENT_MAP_CHUNK_2.entries(),
  ...INTENT_MAP_CHUNK_3.entries(),
  ...INTENT_MAP_CHUNK_4.entries(),
  ...INTENT_MAP_CHUNK_5.entries(),
  ...INTENT_MAP_CHUNK_6.entries(),
  ...INTENT_MAP_CHUNK_7.entries(),
  ...INTENT_MAP_CHUNK_8.entries(),
  ...INTENT_MAP_CHUNK_9.entries(),
  ...INTENT_MAP_CHUNK_10.entries(),
  ...INTENT_MAP_CHUNK_11.entries(),
  ...INTENT_MAP_CHUNK_12.entries(),
  ...INTENT_MAP_CHUNK_13.entries(),
  ...INTENT_MAP_CHUNK_14.entries(),
  ...INTENT_MAP_CHUNK_15.entries(),
  ...INTENT_MAP_CHUNK_16.entries(),
  ...INTENT_MAP_CHUNK_17.entries(),
  ...INTENT_MAP_CHUNK_18.entries(),
  ...INTENT_MAP_CHUNK_19.entries(),
  ...INTENT_MAP_CHUNK_20.entries(),
  ...INTENT_MAP_CHUNK_21.entries(),
  ...INTENT_MAP_CHUNK_22.entries(),
  ...INTENT_MAP_CHUNK_23.entries(),
  ...INTENT_MAP_CHUNK_24.entries(),
  ...INTENT_MAP_CHUNK_25.entries(),
  ...INTENT_MAP_CHUNK_26.entries(),
  ...INTENT_MAP_CHUNK_27.entries(),
]);
