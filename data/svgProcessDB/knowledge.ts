
import { ProcessDefinitionMap } from '../../types';
import { AUTO_LOAN_PROCESS_SVG_DATA } from './svg-data';
import { AUTO_LOAN_PROCESS_XML } from './xml-data';

export const PROCESS_DEFINITION_MAP: ProcessDefinitionMap = new Map([
  ['auto-loan-process', {
    svgData: AUTO_LOAN_PROCESS_SVG_DATA,
    xmlData: AUTO_LOAN_PROCESS_XML,
  }],
]);