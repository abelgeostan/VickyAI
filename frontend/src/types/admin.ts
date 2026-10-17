export interface AdminStats {
  total_users: number;
  total_conversations: number;
  total_messages: number;
  user_messages: number;
  assistant_messages: number;
  total_tokens: number;
  avg_generation_time_seconds: number;
  total_attachments: number;
  total_storage_bytes: number;
  ollama_status: string;
  ollama_base_url: string;
  ollama_models_count: number;
}

export interface AdminUserItem {
  id: string;
  email: string;
  username: string;
  created_at: string;
  last_login?: string | null;
  is_admin: boolean;
  conversations_count: number;
  messages_count: number;
  tokens_consumed: number;
  attachments_count: number;
}

export interface AdminUserListResponse {
  users: AdminUserItem[];
  total: number;
}

export interface AdminModelUsageItem {
  model: string;
  messages_count: number;
  tokens_count: number;
  avg_generation_time: number;
}

export interface AdminUsageResponse {
  models: AdminModelUsageItem[];
  total_tokens: number;
  total_messages: number;
  storage_bytes: number;
  attachments_count: number;
  mime_breakdown: Record<string, number>;
}

export interface AdminSystemResponse {
  os_platform: string;
  python_version: string;
  database_connected: boolean;
  ollama_connected: boolean;
  ollama_base_url: string;
  ollama_models: string[];
  environment: string;
  upload_dir: string;
  upload_dir_size_bytes: number;
}

export interface AdminCleanupResponse {
  orphaned_records_removed: number;
  orphaned_files_removed: number;
  bytes_freed: number;
  message: string;
}
