import { apiFetch } from './api';
import { ModelListResponse } from '../types/model';

export const modelService = {
  async list(): Promise<ModelListResponse> {
    return apiFetch<ModelListResponse>('/models');
  },
};
