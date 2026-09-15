const BASE_URL = "http://127.0.0.1:8000/api";

// =========================
// Refresh Access Token
// =========================
async function refreshAccessToken() {
  const refresh = localStorage.getItem("refresh");

  if (!refresh) {
    console.log("NO REFRESH TOKEN");
    return null;
  }

  try {
    const response = await fetch(`${BASE_URL}/token/refresh/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refresh,
      }),
    });

    const data = await response.json();

    console.log("TOKEN REFRESH STATUS:", response.status);
    console.log("TOKEN REFRESH RESPONSE:", data);

    if (response.ok && data.access) {
      localStorage.setItem("access", data.access);

      console.log("ACCESS TOKEN REFRESHED");

      return data.access;
    }

    console.log("REFRESH TOKEN INVALID");

    localStorage.removeItem("access");
    localStorage.removeItem("refresh");

    window.location.href = "/login";

    return null;

  } catch (error) {
    console.error("Refresh Token Error:", error);
    return null;
  }
}

// =========================
// Main Request Function
// =========================
async function request(endpoint, options = {}) {
  let access = localStorage.getItem("access");

  let headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (access) {
    headers.Authorization = `Bearer ${access}`;
  }

  let response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // اگر Access Token Expire ہو جائے
  if (response.status === 401) {
    const newAccess = await refreshAccessToken();

    if (newAccess) {
      headers = {
        ...headers,
        Authorization: `Bearer ${newAccess}`,
      };

      response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });
    }
  }

  let data = {};

if (response.status !== 204) {
  data = await response.json();
}

  if (!response.ok) {
  console.log("API ERROR:", {
    endpoint,
    status: response.status,
    data,
  });

  throw {
    response: {
      status: response.status,
      data,
    },
  };
}

return {
  ok: response.ok,
  status: response.status,
  data,
};
}

// =========================
// API Methods
// =========================
const api = {
  get(endpoint, options = {}) {
    return request(endpoint, {
      method: "GET",
      ...options,
    });
  },

  post(endpoint, body, options = {}) {
    return request(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
      ...options,
    });
  },

  put(endpoint, body, options = {}) {
    return request(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
      ...options,
    });
  },

  patch(endpoint, body, options = {}) {
    return request(endpoint, {
      method: "PATCH",
      body: JSON.stringify(body),
      ...options,
    });
  },

  delete(endpoint, options = {}) {
    return request(endpoint, {
      method: "DELETE",
      ...options,
    });
  },
};

export default api;