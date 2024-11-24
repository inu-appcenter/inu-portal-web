export interface PredictResult {
  status: string;
  request_id: string;
  // request_head:
  eta: number;
}

export interface FiresPagination {
  pages: number;
  total: number;
  fires: Fire[];
}

export interface Fire {
  request_id: string;
  prompt: string;
}
