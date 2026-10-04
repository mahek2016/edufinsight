const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

function getToken(): string | null {
  return localStorage.getItem('edufinsight_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.headers as Record<string, string>)
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers
  });

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;
    try {
      const errorJson = await response.json();
      if (errorJson.error) {
        errorMessage = errorJson.error;
      }
    } catch {
      // ignore
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

export const api = {
  // Auth
  register: (data: any) => request<any>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request<any>('/auth/me'),

  // Study
  getStudyPlan: () => request<any>('/study'),
  saveStudyPlan: (data: any) => request<any>('/study', { method: 'POST', body: JSON.stringify(data) }),

  // Funding
  getFunding: () => request<any>('/funding'),
  saveFunding: (data: any) => request<any>('/funding', { method: 'POST', body: JSON.stringify(data) }),

  // Financial Profile
  getFinancialProfile: () => request<any>('/financial-profile'),
  saveIncomeDetails: (data: any) => request<any>('/financial-profile', { method: 'POST', body: JSON.stringify(data) }),
  addAsset: (data: any) => request<any>('/assets', { method: 'POST', body: JSON.stringify(data) }),
  deleteAsset: (id: string) => request<any>(`/assets/${id}`, { method: 'DELETE' }),
  addLiability: (data: any) => request<any>('/liabilities', { method: 'POST', body: JSON.stringify(data) }),
  deleteLiability: (id: string) => request<any>(`/liabilities/${id}`, { method: 'DELETE' }),

  // Collateral
  getCollateral: () => request<any>('/collateral'),
  addCollateral: (data: any) => request<any>('/collateral', { method: 'POST', body: JSON.stringify(data) }),
  deleteCollateral: (id: string) => request<any>(`/collateral/${id}`, { method: 'DELETE' }),

  // Documents
  getDocuments: () => request<any>('/documents'),
  uploadDocument: (formData: FormData) => request<any>('/documents/upload', { method: 'POST', body: formData }),
  deleteDocument: (id: string) => request<any>(`/documents/${id}`, { method: 'DELETE' }),
  getDocumentDownloadUrl: (id: string) => `${API_BASE_URL}/documents/${id}/download`,

  // Lenders
  getLenders: () => request<any>('/lenders'),
  getLenderById: (id: string) => request<any>(`/lenders/${id}`),

  // Assessment
  generateAssessment: () => request<any>('/assessment', { method: 'POST' }),
  getLatestAssessment: () => request<any>('/assessment/latest'),
  getAssessmentById: (id: string) => request<any>(`/assessment/${id}`)
};
