import { getFormsApiClient } from '../../services/advforms/formsapis.js';
import { run } from './sxgeneric.js';

export const sxForms = async (pack) => {
  return run(pack, getFormsApiClient);
};