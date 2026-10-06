// API Service Layer for Cloud Carbon Compass Frontend

const API_BASE = '/api';

async function handleResponse(res) {
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API Error ${res.status}: ${errorText || res.statusText}`);
  }
  return res.json();
}

export const api = {
  async getSummary() {
    const res = await fetch(`${API_BASE}/summary`);
    return handleResponse(res);
  },

  async getWorkloads() {
    const res = await fetch(`${API_BASE}/workloads`);
    return handleResponse(res);
  },

  async getRegions() {
    const res = await fetch(`${API_BASE}/regions`);
    return handleResponse(res);
  },

  async getRecommendations() {
    const res = await fetch(`${API_BASE}/recommendations`);
    return handleResponse(res);
  },

  async getMethodology() {
    const res = await fetch(`${API_BASE}/methodology`);
    return handleResponse(res);
  },

  async runWhatIfSimulation(scenarioSettings) {
    const res = await fetch(`${API_BASE}/what-if`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scenarioSettings)
    });
    return handleResponse(res);
  },

  async addWorkload(payload) {
    const res = await fetch(`${API_BASE}/workloads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  async updateWorkload(id, payload) {
    const res = await fetch(`${API_BASE}/workloads/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  async deleteWorkload(id) {
    const res = await fetch(`${API_BASE}/workloads/${id}`, {
      method: 'DELETE'
    });
    return handleResponse(res);
  },

  async resetWorkloads() {
    const res = await fetch(`${API_BASE}/workloads/reset`, {
      method: 'POST'
    });
    return handleResponse(res);
  }
};
