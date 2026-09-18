import { Service, Product, Appointment, Inquiry, ChatMessage } from '../types';

/**
 * Frontend API client communicating with backend Express server.
 * Supports configurable API_BASE for standalone multi-repo deployment (e.g. VITE_API_BASE_URL=http://localhost:3000)
 * or relative URL '/api' when hosted together.
 */
const API_BASE = (((import.meta as any).env?.VITE_API_BASE_URL as string) || '').replace(/\/$/, '');

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
      throw new Error('Failed to fetch services from backend');
    }
    const result = await response.json();
    return result.data || [];
  },

  // Products Database API
  async getProducts(): Promise<Product[]> {
    const response = await fetch(`${API_BASE}/api/products`);
    if (!response.ok) {
      throw new Error('Failed to fetch products from backend');
    }
    const result = await response.json();
    return result.data || [];
  },

  // Appointments Database API
  async getAppointments(): Promise<Appointment[]> {
    const response = await fetch(`${API_BASE}/api/appointments`);
    if (!response.ok) {
      throw new Error('Failed to fetch appointments from backend');
    }
    const result = await response.json();
    return result.data || [];
  },

  async createAppointment(appointment: Omit<Appointment, 'id' | 'createdAt'>): Promise<Appointment> {
    const response = await fetch(`${API_BASE}/api/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
    const response = await fetch(`${API_BASE}/api/appointments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update appointment');
    }
  },

  // Inquiries Database API
  async getInquiries(): Promise<Inquiry[]> {
    const response = await fetch(`${API_BASE}/api/inquiries`);
    if (!response.ok) {
      throw new Error('Failed to fetch inquiries from backend');
    }
    const result = await response.json();
    return result.data || [];
  },

  async createInquiry(inquiry: Omit<Inquiry, 'id' | 'createdAt'>): Promise<Inquiry> {
    const response = await fetch(`${API_BASE}/api/inquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
    const response = await fetch(`${API_BASE}/api/inquiries/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to delete inquiry');
    }
  }
};
