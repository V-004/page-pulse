export interface AuditReport {
  status: number;
  response_time_ms: number;
  page_title: string;
  meta_description: string;
  h1_count: number;
  images_missing_alt: number;
  word_count: number;
  total_images: number;
  page_size_kb: number;
  favicon?: string;
  timestamp?: string;
  url?: string;
}

export interface AuditError {
  error: string;
  status_code?: number;
}

export interface AuditHistoryItem {
  id: string;
  url: string;
  timestamp: string;
  report: AuditReport;
}
