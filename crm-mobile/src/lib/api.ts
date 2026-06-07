import Constants from 'expo-constants';

export type ApiUser = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export type Customer = {
  id: number;
  companyName: string;
  industrySector: string | null;
  status: string;
  mainContactName: string | null;
  contactPosition?: string | null;
  phone: string | null;
  email: string | null;
  lastActivityDate: string | null;
  assignedSalesRepId: number;
  salesRepName: string;
  deliveryAddress?: string | null;
  administrativeAddress?: string | null;
  communicationAddress?: string | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type Activity = {
  id: number;
  customerId: number;
  salesRepId: number;
  title: string;
  type: string;
  description?: string | null;
  startDate: string;
  endDate: string | null;
  status: string;
  state: string;
  outcome: string | null;
  nextAction: string | null;
  customerName: string;
  customerContactName?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  salesRepName: string;
};

export type Page<T> = {
  data: T[];
  paging: {
    page: number;
    pageSize: number;
    total: number;
  };
};

type LoginResponse = {
  token: string;
  tokenType: 'Bearer';
  expiresIn: number;
  user: ApiUser;
};

const configuredBaseUrl =
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  (Constants.expoConfig?.extra?.apiBaseUrl as string | undefined);

export const apiBaseUrl = (configuredBaseUrl || 'http://localhost:3000/api').replace(/\/$/, '');

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      payload && typeof payload.error === 'string'
        ? payload.error
        : `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return payload as T;
}

export function login(email: string, password: string) {
  return request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function listCustomers(token: string, page: number, pageSize = 10) {
  return request<Page<Customer>>(`/customers?page=${page}&pageSize=${pageSize}`, {}, token);
}

export async function getCustomer(token: string, customerId: number) {
  const response = await request<{ data: Customer }>(`/customers/${customerId}`, {}, token);
  return response.data;
}

export function listActivities(token: string, page: number, pageSize = 10) {
  return request<Page<Activity>>(`/activities?page=${page}&pageSize=${pageSize}`, {}, token);
}

export async function getActivity(token: string, activityId: number) {
  const response = await request<{ data: Activity }>(`/activities/${activityId}`, {}, token);
  return response.data;
}

export async function completeActivity(
  token: string,
  activityId: number,
  body: { outcome: string; nextAction?: string }
) {
  const response = await request<{ data: Activity }>(
    `/activities/${activityId}/complete`,
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
    token
  );
  return response.data;
}

export async function cancelActivity(token: string, activityId: number) {
  const response = await request<{ data: Activity }>(
    `/activities/${activityId}/cancel`,
    { method: 'POST' },
    token
  );
  return response.data;
}

export async function createFollowUp(
  token: string,
  activityId: number,
  body: {
    title: string;
    type: string;
    description?: string;
    startDate: string;
    endDate?: string;
    nextAction?: string;
  }
) {
  const response = await request<{ data: Activity }>(
    `/activities/${activityId}/follow-up`,
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
    token
  );
  return response.data;
}
