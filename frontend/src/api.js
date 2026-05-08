const API_URL = 'http://localhost:4000/api';

function getToken() {
  return localStorage.getItem('noe_token');
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401) {
    localStorage.removeItem('noe_token');
    localStorage.removeItem('noe_user');
    window.location.reload();
    throw new Error('Session expirée');
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erreur serveur');
  return data;
}

// --- Auth ---
export async function login(email, password) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  localStorage.setItem('noe_token', data.token);
  localStorage.setItem('noe_user', JSON.stringify(data.user));
  return data;
}

export async function logout() {
  try { await request('/auth/logout', { method: 'POST' }); } catch {}
  localStorage.removeItem('noe_token');
  localStorage.removeItem('noe_user');
}

export async function getMe() {
  return request('/auth/me');
}

// --- Products ---
export async function fetchProducts(params = {}) {
  const qs = new URLSearchParams();
  if (params.category) qs.set('category', params.category);
  if (params.warehouse) qs.set('warehouse', params.warehouse);
  if (params.search) qs.set('search', params.search);
  if (params.status) qs.set('status', params.status);
  const query = qs.toString();
  return request(`/products${query ? '?' + query : ''}`);
}

export async function fetchProduct(sku) {
  return request(`/products/${sku}`);
}

export async function createProduct(data) {
  return request('/products', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateProduct(sku, data) {
  return request(`/products/${sku}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function deleteProduct(sku) {
  return request(`/products/${sku}`, { method: 'DELETE' });
}

// --- Movements ---
export async function fetchMovements(params = {}) {
  const qs = new URLSearchParams();
  if (params.type) qs.set('type', params.type);
  if (params.warehouse) qs.set('warehouse', params.warehouse);
  if (params.productSku) qs.set('productSku', params.productSku);
  if (params.limit) qs.set('limit', params.limit);
  if (params.offset) qs.set('offset', params.offset);
  const query = qs.toString();
  return request(`/movements${query ? '?' + query : ''}`);
}

export async function createMovement(data) {
  return request('/movements', { method: 'POST', body: JSON.stringify(data) });
}

// --- Warehouses ---
export async function fetchWarehouses() {
  return request('/warehouses');
}

// --- Categories ---
export async function fetchCategories() {
  return request('/categories');
}

// --- Users ---
export async function fetchUsers() {
  return request('/users');
}

export async function createUser(data) {
  return request('/users', { method: 'POST', body: JSON.stringify(data) });
}

export async function updateUser(id, data) {
  return request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function deleteUser(id) {
  return request(`/users/${id}`, { method: 'DELETE' });
}

// --- Notifications ---
export async function fetchNotifications(params = {}) {
  const qs = new URLSearchParams();
  if (params.type) qs.set('type', params.type);
  if (params.read !== undefined) qs.set('read', params.read);
  const query = qs.toString();
  return request(`/notifications${query ? '?' + query : ''}`);
}

export async function markNotificationRead(id) {
  return request(`/notifications/${id}/read`, { method: 'PUT' });
}

export async function markAllNotificationsRead() {
  return request('/notifications/read-all', { method: 'PUT' });
}

// --- Dashboard ---
export async function fetchKPIs() {
  return request('/dashboard/kpis');
}

export async function fetchFlow() {
  return request('/dashboard/flow');
}

export async function fetchTopMovers() {
  return request('/dashboard/top-movers');
}

export async function fetchRecentActivity() {
  return request('/dashboard/recent-activity');
}

// --- Cadrage ---
export async function saveCadrageResponses(responses, progress) {
  return request('/cadrage', { method: 'POST', body: JSON.stringify({ responses, progress }) });
}

export async function fetchMyCadrageResponses() {
  return request('/cadrage/me');
}

export async function fetchAllCadrageResponses() {
  return request('/cadrage');
}

export async function exportCadrageResponses() {
  const token = localStorage.getItem('noe_token');
  const res = await fetch('http://localhost:4000/api/cadrage/export', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'cadrage_noe_services.csv';
  a.click();
  URL.revokeObjectURL(url);
}
