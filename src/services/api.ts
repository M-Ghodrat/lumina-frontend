import { Service, Product, Appointment, Inquiry, ChatMessage } from '../types';
import { auth } from '../firebase';

/**
 * Frontend API client communicating with backend Express server.
 * Supports configurable API_BASE for standalone multi-repo deployment (e.g. VITE_API_BASE_URL=http://localhost:3000)
 * or relative URL '/api' when hosted together.
 */
const API_BASE = (((import.meta as any).env?.VITE_API_BASE_URL as string) || '').replace(/\/$/, '');

async function getAuthHeaders(): Promise<HeadersInit> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  try {
    let currentUser = auth.currentUser;
    if (!currentUser) {
      // Allow Firebase Auth a brief window to restore persisted session if active
      await new Promise<void>((resolve) => {
        const unsubscribe = auth.onAuthStateChanged((u) => {
          currentUser = u;
          unsubscribe();
          resolve();
        });
        setTimeout(() => {
          unsubscribe();
          resolve();
        }, 1000);
      });
    }
    if (currentUser) {
      const token = await currentUser.getIdToken();
      headers['Authorization'] = `Bearer ${token}`;
    }
  } catch (e) {
    // Continue without token
  }
  return headers;
}

export const api = {
  // Chatbot AI API
  async sendChatMessage(messages: ChatMessage[]): Promise<string> {
    const response = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to connect with beauty assistant');
    }

    const data = await response.json();
    return data.reply;
  },

  // Services Database API
  async getServices(): Promise<Service[]> {
    const response = await fetch(`${API_BASE}/api/services`);
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to fetch services from backend');
    }
    const result = await response.json();
    return result.data || [];
  },

  // Products Database API
  async getProducts(): Promise<Product[]> {
    const response = await fetch(`${API_BASE}/api/products`);
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to fetch products from backend');
    }
    const result = await response.json();
    return result.data || [];
  },

  // Appointments Database API
  async getAppointments(): Promise<Appointment[]> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE}/api/appointments`, { headers });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Failed to fetch appointments (${response.status})`);
    }
    const result = await response.json();
    return result.data || [];
  },

  async createAppointment(appointment: Omit<Appointment, 'id' | 'createdAt'>): Promise<Appointment> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE}/api/appointments`, {
      method: 'POST',
      headers,
      body: JSON.stringify(appointment),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to schedule appointment');
    }

    const result = await response.json();
    return result.data;
  },

  async updateAppointmentStatus(id: string, status: 'pending' | 'confirmed' | 'cancelled'): Promise<void> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE}/api/appointments/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update appointment');
    }
  },

  // Inquiries Database API
  async getInquiries(): Promise<Inquiry[]> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE}/api/inquiries`, { headers });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Failed to fetch inquiries (${response.status})`);
    }
    const result = await response.json();
    return result.data || [];
  },

  async createInquiry(inquiry: Omit<Inquiry, 'id' | 'createdAt'>): Promise<Inquiry> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE}/api/inquiries`, {
      method: 'POST',
      headers,
      body: JSON.stringify(inquiry),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to submit inquiry');
    }

    const result = await response.json();
    return result.data;
  },

  async deleteInquiry(id: string): Promise<void> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE}/api/inquiries/${id}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to delete inquiry');
    }
  }
};
