
import { CanonicalLexicon } from '../../types';
import { CANONICAL_LEXICON_CHUNK_0 } from './0';
import { CANONICAL_LEXICON_CHUNK_1 } from './1';
import { CANONICAL_LEXICON_CHUNK_2 } from './2';
import { CANONICAL_LEXICON_CHUNK_3 } from './3';
import { CANONICAL_LEXICON_CHUNK_4 } from './4';
import { CANONICAL_LEXICON_CHUNK_5 } from './5';
import { CANONICAL_LEXICON_CHUNK_6 } from './6';
import { CANONICAL_LEXICON_CHUNK_7 } from './7';
import { CANONICAL_LEXICON_CHUNK_8 } from './8';
import { CANONICAL_LEXICON_CHUNK_9 } from './9';
import { CANONICAL_LEXICON_CHUNK_10 } from './10';
import { CANONICAL_LEXICON_CHUNK_11 } from './11';
import { CANONICAL_LEXICON_CHUNK_12 } from './12';
import { CANONICAL_LEXICON_CHUNK_13 } from './13';
import { CANONICAL_LEXICON_CHUNK_14 } from './14';

/**
 * Merges all lexicon chunks into a single CanonicalLexicon map.
 * This provides a single source of truth for the rest of the application,
 * while keeping the source data modular and maintainable.
 */
export const CANONICAL_LEXICON: CanonicalLexicon = new Map([
  ...CANONICAL_LEXICON_CHUNK_0.entries(),
  ...CANONICAL_LEXICON_CHUNK_1.entries(),
  ...CANONICAL_LEXICON_CHUNK_2.entries(),
  ...CANONICAL_LEXICON_CHUNK_3.entries(),
  ...CANONICAL_LEXICON_CHUNK_4.entries(),
  ...CANONICAL_LEXICON_CHUNK_5.entries(),
  ...CANONICAL_LEXICON_CHUNK_6.entries(),
  ...CANONICAL_LEXICON_CHUNK_7.entries(),
  ...CANONICAL_LEXICON_CHUNK_8.entries(),
  ...CANONICAL_LEXICON_CHUNK_9.entries(),
  ...CANONICAL_LEXICON_CHUNK_10.entries(),
  ...CANONICAL_LEXICON_CHUNK_11.entries(),
  ...CANONICAL_LEXICON_CHUNK_12.entries(),
  ...CANONICAL_LEXICON_CHUNK_13.entries(),
  ...CANONICAL_LEXICON_CHUNK_14.entries(),
]);