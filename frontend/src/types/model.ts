export interface ModelInfo {
  id: string;
  name: string;
  badge: string;
  description: string;
  supports_vision: boolean;
  supports_thinking: boolean;
  icon: string;
  size_gb?: number;
  runner?: string;
}

export interface ModelListResponse {
  models: ModelInfo[];
  default_model: string;
}
