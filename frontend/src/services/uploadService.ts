import { getAuthToken } from './api';
import { AttachmentUploadResult } from '../types/chat';

export const uploadService = {
  async upload(file: File): Promise<AttachmentUploadResult> {
    const formData = new FormData();
    formData.append('file', file);

    const token = getAuthToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch('/api/uploads', {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      let errorMsg = `Upload failed with status ${response.status}`;
      try {
        const err = await response.json();
        errorMsg = err.detail || errorMsg;
      } catch {
        // ignore
      }
      throw new Error(errorMsg);
    }

    return response.json();
  },
};
