
import { IntentMap } from '../../types';

export const INTENT_MAP_CHUNK_26: IntentMap = new Map([
  ['CREATE_FILE_GENERIC', {
    keywords: { 'create': 3.0, 'write': 3.0, 'make': 3.0, 'generate': 3.0, 'file': 3.0, 'javascript': 2.0, 'js': 2.0, 'json': 2.0, 'html': 2.0 },
    booster_phrases: { 'create a file': 4.0, 'write a file': 4.0 }
  }],
  ['CREATE_HELLO_WORLD_JS', {
    keywords: { 'create': 3.0, 'write': 3.0, 'javascript': 2.0, 'js': 2.0, 'file': 2.0, 'hello world': 4.0 },
    booster_phrases: { 'create a hello world javascript file': 6.0, 'make a hello world script': 5.0 }
  }],
  ['CREATE_USER_JSON', {
    keywords: { 'create': 3.0, 'write': 3.0, 'json': 3.0, 'file': 2.0, 'user': 3.0, 'object': 2.0, 'example': 2.0 },
    booster_phrases: { 'create a user json file': 6.0, 'make an example json for a user': 5.0 }
  }],
  ['CREATE_SIMPLE_HTML', {
    keywords: { 'create': 3.0, 'write': 3.0, 'html': 3.0, 'file': 2.0, 'simple': 2.0, 'basic': 2.0, 'page': 2.0, 'boilerplate': 3.0 },
    booster_phrases: { 'create a simple html page': 6.0, 'make a basic html file': 5.0 }
  }],
  ['CREATE_SAMPLE_SVG_GRAPH', {
    keywords: { 'create': 3.0, 'write': 3.0, 'graph': 3.0, 'file': 2.0, 'svg': 3.0, 'chart': 3.0, 'sample': 2.0 },
    booster_phrases: { 'create a sample graph file': 6.0, 'make an svg chart': 5.0 }
  }],
]);
