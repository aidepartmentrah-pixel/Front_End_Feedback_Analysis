# Session Persistence Issue & Fix

## Problem

When users close their browser and reopen it, they remain logged in because the session cookie persists. This is a security concern for a hospital system where users should be required to re-authenticate after closing the browser.

## Root Cause

The backend (FastAPI) is likely setting session cookies with a `max_age` parameter, which makes them persist across browser sessions. For security, session cookies should expire when the browser closes.

## Solution (Backend Changes Required)

### Option 1: Session-Only Cookies (Recommended for Security)

Configure the backend to set session cookies **without** a `max_age` or `expires` parameter. This makes them "session cookies" that are deleted when the browser closes.

**FastAPI Example:**

```python
from fastapi import Response
from starlette.middleware.sessions import SessionMiddleware

# When setting the session cookie
response.set_cookie(
    key="incident_manager_session",
    value=session_id,
    httponly=True,
    secure=True,  # Use True in production with HTTPS
    samesite="lax",
    # DO NOT SET max_age or expires - this makes it a session cookie
)
```

### Option 2: Short Session Timeout

If you need sessions to persist for a short time (e.g., for user convenience), set a short `max_age`:

```python
response.set_cookie(
    key="incident_manager_session",
    value=session_id,
    httponly=True,
    secure=True,
    samesite="lax",
    max_age=3600  # 1 hour (3600 seconds)
)
```

### Option 3: Backend Session Expiration

Implement server-side session expiration logic:

```python
import time

# When creating a session
session_data = {
    "user_id": user.id,
    "username": user.username,
    "roles": user.roles,
    "created_at": time.time(),
    "expires_at": time.time() + 3600  # 1 hour from now
}

# When checking session in /api/auth/me
current_time = time.time()
if current_time > session_data["expires_at"]:
    # Session expired
    raise HTTPException(status_code=401, detail="Session expired")
```

## Frontend Verification

The frontend is already correctly configured:

✅ **No localStorage token storage** - Session relies entirely on HTTP-only cookies  
✅ **Credentials included** - `withCredentials: true` in apiClient  
✅ **Proper logout** - Calls `/api/auth/logout` to clear backend session  
✅ **Auth check on mount** - Validates session via `/api/auth/me`

## Testing the Fix

### Test Session Expiration on Browser Close:

1. Login to the application
2. Verify you're logged in and see your username
3. **Close the entire browser** (not just the tab)
4. Reopen the browser and navigate to the application
5. **Expected:** You should be redirected to the login page
6. **If not working:** Session cookies are persisting (backend needs configuration)

### Test Session Timeout (if implemented):

1. Login to the application
2. Wait for the timeout period (e.g., 1 hour)
3. Try to perform an action (like viewing the dashboard)
4. **Expected:** You should be logged out or see an error
5. **Check console:** Should see 401 error from `/api/auth/me`

## Security Best Practices

For a hospital incident management system:

1. ✅ **Use HTTPS in production** - Required for `secure=True` cookies
2. ✅ **HTTP-only cookies** - Prevents XSS attacks from stealing sessions
3. ✅ **SameSite=Lax or Strict** - Prevents CSRF attacks
4. ⚠️ **Session timeout** - Implement 15-30 minute inactivity timeout
5. ⚠️ **Session expiration on browser close** - Prevent unauthorized access
6. ⚠️ **Audit logging** - Log all login/logout events with timestamps

## Additional Recommendations

### Inactivity Timeout (Frontend)

Add automatic logout after inactivity:

```javascript
// In AuthContext.jsx or a separate useIdleTimer hook
import { useEffect, useRef } from "react";

const IDLE_TIMEOUT = 15 * 60 * 1000; // 15 minutes

export const useIdleTimer = (onIdle) => {
  const timeoutRef = useRef(null);

  const resetTimer = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(onIdle, IDLE_TIMEOUT);
  };

  useEffect(() => {
    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    events.forEach(event => window.addEventListener(event, resetTimer));
    
    resetTimer(); // Start timer

    return () => {
      events.forEach(event => window.removeEventListener(event, resetTimer));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);
};

// Usage in AuthContext:
useIdleTimer(() => {
  console.log("User idle for 15 minutes, logging out...");
  logout();
});
```

### Session Refresh on Activity

Extend session on user activity:

```javascript
// In apiClient.js or AuthContext
let lastActivityCheck = Date.now();

const refreshSessionIfNeeded = async () => {
  const now = Date.now();
  const timeSinceLastCheck = now - lastActivityCheck;
  
  // Refresh session every 5 minutes of activity
  if (timeSinceLastCheck > 5 * 60 * 1000) {
    try {
      await apiClient.post("/api/auth/refresh-session");
      lastActivityCheck = now;
    } catch (error) {
      console.error("Session refresh failed:", error);
    }
  }
};

// Call this on user interactions
window.addEventListener("click", refreshSessionIfNeeded);
```

## Current Status

✅ **Frontend Fixed:**
- [Topbar.js](src/components/common/Topbar.js) now shows actual username and role
- Logout button visible in all pages using MainLayout
- Session-based authentication working correctly

⚠️ **Backend Configuration Needed:**
- Configure session cookies to expire on browser close
- Implement server-side session expiration (recommended: 30 minutes)
- Add session refresh endpoint (optional but recommended)

## Summary

The issue where users remain logged in after closing the browser is a **backend configuration issue**. The session cookie needs to be configured as a "session cookie" (no `max_age` parameter) so it expires when the browser closes.

**Action Required:** Update the FastAPI backend cookie configuration to remove or reduce the `max_age` parameter on the session cookie.

**Frontend Status:** ✅ All frontend issues fixed - username displays correctly and logout button is visible.
