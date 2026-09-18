export interface Service {
  id?: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  imageUrl: string;
}

export interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
}

export interface Appointment {
  id?: string;
  userId?: string;
  serviceId: string;
  date: string; // YYYY-MM-DD
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  customerName: string;
  customerEmail: string;
  createdAt: any;
}

export interface Inquiry {
  id?: string;
  name: string;
  email: string;
  message: string;
  createdAt: any;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: {
    userId: string;
    email: string;
    emailVerified: boolean;
    isAnonymous: boolean;
    providerInfo: { providerId: string; displayName: string; email: string; }[];
  }
}
