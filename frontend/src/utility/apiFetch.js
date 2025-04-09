// src/helpers/apiFetch.js
export async function apiFetch(url, options = {}) {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = user?.token;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    // Token expired or invalid - force user to log in again
    window.location.href = '/';
    return;
  }
  return response;
}
