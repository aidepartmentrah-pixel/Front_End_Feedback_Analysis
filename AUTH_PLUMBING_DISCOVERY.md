# Authentication Plumbing Discovery

## 1. JWT Token Storage

Location: localStorage
Keys:
- auth_token (stores JWT)
- username (stores username)

Files:
- [src/api/apiClient.js](src/api/apiClient.js#L17)
- [src/context/AuthContext.jsx](src/context/AuthContext.jsx#L20)
- [src/components/login/LoginForm.js](src/components/login/LoginForm.js#L45-L46)

Code snippet from apiClient.js:
```javascript
const token = localStorage.getItem("auth_token");
if (token) {
  config.headers.Authorization = `Bearer ${token}`;
}
```

Code snippet from LoginForm.js:
```javascript
if (data.token) {
  localStorage.setItem("auth_token", data.token);
  localStorage.setItem("username", username);
  login({ username, ...data.user });
  navigate("/");
}
```

## 2. Axios Client Configuration

File: [src/api/apiClient.js](src/api/apiClient.js)

Configuration:
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
```

## 3. Authorization Header Attachment

Method: Global request interceptor
File: [src/api/apiClient.js](src/api/apiClient.js#L15-L24)

Implementation:
```javascript
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
```

Header format: Bearer token
Attached: On every request automatically

## 4. Login Page and Protected Routes

Login Page: [src/pages/Login.js](src/pages/Login.js)
Login Form Component: [src/components/login/LoginForm.js](src/components/login/LoginForm.js)

Protected Route Component: [src/components/ProtectedRoute.jsx](src/components/ProtectedRoute.jsx)

Implementation:
```jsx
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <CircularProgress />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
```

Auth Context: [src/context/AuthContext.jsx](src/context/AuthContext.jsx)

Features:
- Checks auth on mount
- Calls /api/auth/me to verify token
- Provides login/logout functions
- Manages isAuthenticated state
- Auto-redirects on 401 errors

Login Endpoint: POST /api/auth/login
Auth Verify Endpoint: GET /api/auth/me

401 Handler in apiClient.js:
```javascript
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("username");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
```
