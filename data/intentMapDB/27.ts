
import { IntentMap } from '../../types';

export const INTENT_MAP_CHUNK_27: IntentMap = new Map([
  ['REQUEST_GRAPH_GENERATION', {
    topic: 'Data Visualization',
    keywords: { 'graph': 4.0, 'chart': 4.0, 'draw': 3.0, 'plot': 3.0, 'visualize': 3.5, 'data': 2.0, 'bar': 2.5, 'pie': 2.5 },
    booster_phrases: { 'create a graph': 5.0, 'draw a chart': 5.0, 'make a chart': 5.0, 'visualize this data': 4.5, 'plot this data': 4.0 }
  }],
  ['EXAMPLE_GRAPH_GENERATION', {
    topic: 'Bot Capabilities',
    keywords: { 'example': 3.0, 'capability': 3.0, 'generate': 4.0, 'graph': 4.0, 'chart': 3.0, 'visualization': 3.0 },
    booster_phrases: { 
      'example of your capability to generate a graph': 7.0,
      'show me an example of a chart': 6.0
    }
  }]
]);
