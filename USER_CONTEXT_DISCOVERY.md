# Current User Context Discovery

## API Endpoint

Endpoint: GET /api/auth/me

File: [src/context/AuthContext.jsx](src/context/AuthContext.jsx#L30)

Called in: checkAuth function on component mount and after token verification

Code:
```javascript
const response = await apiClient.get("/api/auth/me");
const userData = response.data;
setUser(userData);
setIsAuthenticated(true);
```

## Expected Response Fields

Based on LoginForm.js login response structure:
```javascript
{
  token: "jwt_token_string",
  user: {
    username: "string",
    // Additional user fields returned by backend
  }
}
```

From AuthContext.jsx, the entire response.data is stored as user:
```javascript
const userData = response.data;
setUser(userData);
```

Currently expected minimal fields:
- username

No role, permissions, or department fields are currently expected or used.

## User Storage Location

Storage: React Context API

File: [src/context/AuthContext.jsx](src/context/AuthContext.jsx)

State management:
```javascript
const [user, setUser] = useState(null);
const [isAuthenticated, setIsAuthenticated] = useState(false);
const [isLoading, setIsLoading] = useState(true);
```

Context value provided:
```javascript
const value = {
  user,
  isAuthenticated,
  isLoading,
  login,
  logout,
};
```

Access pattern:
```javascript
import { useAuth } from "../context/AuthContext";
const { user, isAuthenticated, isLoading, login, logout } = useAuth();
```

No Redux or other state management library used.

## How Role is Read

Current implementation: NO role-based logic exists

Evidence:

1. AuthContext.jsx - No role field checked or stored
2. ProtectedRoute.jsx - Only checks isAuthenticated, not roles
3. Sidebar.js - All menu items shown to all authenticated users
4. TopBar.js - Only displays username

Code from TopBar.js:
```javascript
const { user, logout } = useAuth();
<span>{user?.username || localStorage.getItem("username") || "User"}</span>
```

Code from ProtectedRoute.jsx:
```javascript
const { isAuthenticated, isLoading } = useAuth();
if (!isAuthenticated) {
  return <Navigate to="/login" replace />;
}
return children;
```

No role checks like:
- user.role
- user.permissions
- user.department_id
- user.access_level

## Summary

The frontend expects minimal user data from /api/auth/me endpoint. Only username is currently used. No role-based access control is implemented. All protection is binary: authenticated vs not authenticated. To add RBAC, the backend would need to return role/permissions fields, and frontend would need to check these in ProtectedRoute, Sidebar menu rendering, and component-level access control.
