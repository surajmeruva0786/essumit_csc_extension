// filetractApi.ts
// Thin API client for the local FileTract backend used by the extension frontend.

import type { Service } from '../config/services';
import { getServiceConfig } from '../config/serviceConfig';

const API_BASE_URL = 'https://essumit-csc-extension.onrender.com';
const POLL_INTERVAL_MS = 2000;
const MAX_POLL_ATTEMPTS = 120;

export interface ExtractedField {
  value: string | null;
  confidence: number; // 0–1
}

export interface ExtractionResult {
  extractedFields: Record<string, ExtractedField>;
  crossDocumentMismatches: Array<{
    field: string;
    val1: string;
    val2: string;
  }>;
}

function mapServiceToBackendConfig(serviceId: string): { serviceType: string; fields: string[] } | null {
  const config = getServiceConfig(serviceId);
  if (!config) return null;
  return {
    serviceType: config.backendId,
    fields: config.formFields,
  };
}

async function uploadFiles(files: File[]): Promise<string[]> {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file, file.name));

  const resp = await fetch(`${API_BASE_URL}/api/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!resp.ok) {
    throw new Error(`Upload failed: ${resp.status} ${resp.statusText}`);
  }
  const data = await resp.json();
  if (Array.isArray(data.jobs)) {
    return data.jobs.map((j: any) => j.job_id);
  }
  return data.job_id ? [data.job_id] : [];
}

async function startExtraction(jobIds: string[], fields: string[]): Promise<void> {
  const resp = await fetch(`${API_BASE_URL}/api/extract/batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      job_ids: jobIds,
      fields,
      pipeline: 'patent',
    }),
  });
  if (!resp.ok) {
    throw new Error(`Extract start failed: ${resp.status} ${resp.statusText}`);
  }
}

async function waitForResults(jobIds: string[], serviceType: string): Promise<ExtractionResult> {
  const allResults: any[] = [];

  for (const jobId of jobIds) {
    let attempts = 0;
    let done = false;
    while (!done && attempts < MAX_POLL_ATTEMPTS) {
      attempts += 1;
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
      const statusResp = await fetch(`${API_BASE_URL}/api/status/${jobId}`);
      if (!statusResp.ok) continue;
      const statusData = await statusResp.json();
      if (statusData.status === 'complete') {
        const resultResp = await fetch(`${API_BASE_URL}/api/result/${jobId}`);
        if (resultResp.ok) {
          const finalData = await resultResp.json();
          if (finalData.results && finalData.results.extracted_fields) {
            allResults.push(finalData.results.extracted_fields);
          } else if (finalData.results) {
            allResults.push(finalData.results);
          }
        }
        done = true;
      } else if (statusData.status === 'error') {
        console.warn('[filetractApi] Job failed', jobId, statusData.error);
        done = true;
      }
    }
  }

  if (!allResults.length) {
    throw new Error('No successful extraction results');
  }

  // Use first result; patent returns { value, ocr_confidence, llm_confidence, quality_flag }, standard returns plain values
  const first = allResults[0] as Record<string, any>;
  const extractedFields: Record<string, ExtractedField> = {};
  Object.keys(first).forEach((k) => {
    const entry = first[k];
    if (entry && typeof entry === 'object' && 'value' in entry) {
      const conf =
        typeof entry.ocr_confidence === 'number'
          ? entry.ocr_confidence
          : typeof entry.llm_confidence === 'number'
          ? entry.llm_confidence
          : typeof entry.confidence === 'number'
          ? entry.confidence
          : 0;
      extractedFields[k] = {
        value: entry.value != null ? String(entry.value) : null,
        confidence: Math.min(1, Math.max(0, conf)),
      };
    } else if (entry !== null && entry !== undefined) {
      extractedFields[k] = { value: String(entry), confidence: 0 };
    } else {
      extractedFields[k] = { value: null, confidence: 0 };
    }
  });

  return {
    extractedFields,
    crossDocumentMismatches: [],
  };
}

export async function extractFromDocuments(
  files: File[],
  service: Service,
  fieldsOverride?: string[]
): Promise<ExtractionResult> {
  const backendConfig = mapServiceToBackendConfig(service.id);
  if (!backendConfig) {
    throw new Error(`Service ${service.id} not yet wired to backend`);
  }

  // Use form fields from active tab if provided and non-empty; else service config
  const fieldsToExtract =
    fieldsOverride && fieldsOverride.length > 0 ? fieldsOverride : backendConfig.fields;

  const jobIds = await uploadFiles(files);
  if (!jobIds.length) {
    throw new Error('No job IDs returned from upload');
  }
  await startExtraction(jobIds, fieldsToExtract);
  return waitForResults(jobIds, backendConfig.serviceType);
}

