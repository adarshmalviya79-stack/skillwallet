const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, options);
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = data?.error || data?.detail || `HTTP Error ${response.status}: ${response.statusText}`;
      throw new Error(errorMsg);
    }

    return data;
  } catch (err) {
    console.error(`API Error on [${options.method || 'GET'} ${url}]:`, err);
    throw err;
  }
}

export const apiClient = {
  // Health
  getHealth: () => request('/api/health'),

  // Dashboard
  getDashboard: () => request('/api/dashboard'),

  // Safety Analysis (Multipart form data)
  analyzeSafety: (formData) => {
    return request('/api/safety/analyze', {
      method: 'POST',
      body: formData,
    });
  },

  // Crack Analysis (Multipart form data)
  analyzeCracks: (formData) => {
    return request('/api/cracks/analyze', {
      method: 'POST',
      body: formData,
    });
  },

  // Property Valuation
  estimateValuation: (payload) => {
    return request('/api/valuation/estimate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  // Project Planning
  generateProjectPlan: (payload) => {
    return request('/api/projects/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  getProjects: () => request('/api/projects'),

  // Chat Assistant
  chatWithAssistant: (message, history = [], projectContext = null) => {
    return request('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history, project_context: projectContext }),
    });
  },

  // Weather Advisory
  getWeather: (location = 'Chicago, IL') => {
    return request(`/api/weather?location=${encodeURIComponent(location)}`);
  },

  // Reports & History
  getReports: (type = null, search = null) => {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (search) params.append('search', search);
    const q = params.toString() ? `?${params.toString()}` : '';
    return request(`/api/reports${q}`);
  },

  getReportDetail: (id) => request(`/api/reports/${id}`),

  deleteReport: (id) => {
    return request(`/api/reports/${id}`, {
      method: 'DELETE',
    });
  },
};
