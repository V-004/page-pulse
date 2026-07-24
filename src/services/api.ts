import axios, { AxiosError } from "axios";
import { AuditReport } from "../types/audit";

const getApiBaseUrl = (): string => {
  if (typeof window !== "undefined") {
    // Check if custom backend URL is defined in localStorage or env
    const customUrl = localStorage.getItem("page_pulse_custom_backend");
    if (customUrl) return customUrl;
  }
  return import.meta.env.VITE_BACKEND_URL || "";
};

export async function runPageAudit(url: string): Promise<AuditReport> {
  const baseUrl = getApiBaseUrl();
  const endpoint = baseUrl ? `${baseUrl.replace(/\/$/, '')}/audit` : '/audit';

  try {
    const response = await axios.post<AuditReport>(
      endpoint,
      { url },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 20000, // 20s overall client timeout
      }
    );

    return {
      ...response.data,
      url,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosErr = error as AxiosError<{ error?: string }>;
      if (axiosErr.response && axiosErr.response.data && axiosErr.response.data.error) {
        throw new Error(axiosErr.response.data.error);
      }
      if (axiosErr.code === 'ECONNABORTED' || axiosErr.message.includes('timeout')) {
        throw new Error("Request timed out");
      }
      if (axiosErr.response?.status === 400) {
        throw new Error("Invalid URL");
      }
      if (axiosErr.response?.status === 408) {
        throw new Error("Request timed out");
      }
      if (axiosErr.response?.status === 502) {
        throw new Error("Unable to reach website");
      }
      if (axiosErr.response?.status === 415) {
        throw new Error("URL is not an HTML page");
      }
    }
    throw new Error("Unable to reach website or internal server error");
  }
}
