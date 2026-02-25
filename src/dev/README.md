# 🔧 Development Authentication Helpers

**Phase 5 - Module 5.6: Frontend Login Verification Tasks**

This folder contains **DEV-ONLY** helpers for testing and verifying authentication flows. All components are safe to remove before production deployment.

---

## 📦 What's Included

### 1. **AuthDebugPanel.jsx**
Visual debug panel showing real-time auth state.

**Features:**
- Shows authentication status
- Displays username, roles, and scopes
- Token presence and length (not the token itself)
- Backend API URL
- Full user object (JSON)
- Collapsible and dismissible UI

**Auto-mounted in App.js** (dev mode only)

---

### 2. **loginVerificationChecklist.js**
Manual testing checklist for authentication flows.

**Use this to verify:**
- ✓ Login with software_admin
- ✓ Login with section_admin
- ✓ Wrong password rejected
- ✓ Unknown user rejected
- ✓ Refresh page keeps session
- ✓ Logout redirects to login
- ✓ Protected route blocked when logged out
- ✓ Role-based routes enforce correctly

---

### 3. **testRouteAccess.js**
Route access decision logger.

**Purpose:**
Logs role-based access checks to console during navigation.

**Not actively used** - available for future integration if needed.

---

### 4. **testAccounts.js**
Reference list of test accounts.

**Example:**
```javascript
{
  role: "SOFTWARE_ADMIN",
  username: "software_admin",
  password: "admin123"
}
```

⚠️ **For reference only** - do NOT use for auto-login or autofill.

---

## 🔒 Security Guarantees

✅ **All helpers:**
- Only render/execute in `NODE_ENV === "development"`
- Never display full auth tokens
- Never auto-fill credentials
- Never log passwords automatically
- Safe to delete entire `/dev` folder before production

✅ **API Client Enhancements:**
- Warns if token missing on authenticated requests
- Warns if `/auth/me` returns 401 with valid token
- All warnings wrapped in dev-only checks

✅ **RoleProtectedRoute Enhancements:**
- Logs access decisions in console
- Shows user roles on denial
- No logic changes - logging only

---

## 🧪 How to Use

### View Auth State
The debug panel is available in dev mode, but disabled by default.

Enable it when needed:

```bash
REACT_APP_SHOW_AUTH_DEBUG_PANEL=true
```

**Actions:**
- Collapse/expand with arrow button
- Close with X button
- Refresh page to show again

### Test Login Flows
1. Open browser console
2. Navigate to protected routes
3. Watch for access logs and warnings
4. Reference `testAccounts.js` for credentials
5. Use `loginVerificationChecklist.js` as testing guide

### Console Warnings You May See

**API Warnings:**
```
⚠️ API request without auth token: /api/some-endpoint
⚠️ Token exists but Authorization header not attached
⚠️ /api/auth/me returned 401 but token exists
```

**Route Warnings:**
```
🚫 Access denied to route: Settings Page
✓ Access granted to route: Dashboard
```

---

## 🗑️ Removing Dev Helpers for Production

**Option 1: Tree-shaking (automatic)**
- Build tools will eliminate dev-only code if `NODE_ENV=production`
- No action required

**Option 2: Manual removal**
```bash
# Delete entire dev folder
rm -rf src/dev

# Remove import from App.js
# Remove import from RoleProtectedRoute.jsx
# Remove dev warnings from apiClient.js
```

---

## 📁 File Structure

```
src/dev/
├── index.js                        # Central exports
├── AuthDebugPanel.jsx              # Visual debug panel
├── loginVerificationChecklist.js   # Testing checklist
├── testRouteAccess.js              # Route logger
└── testAccounts.js                 # Reference credentials
```

---

## 🔗 Integration Points

### App.js
```javascript
import AuthDebugPanel from "./dev/AuthDebugPanel";

const shouldShowAuthDebugPanel =
  process.env.NODE_ENV === "development" &&
  process.env.REACT_APP_SHOW_AUTH_DEBUG_PANEL === "true";

{shouldShowAuthDebugPanel && <AuthDebugPanel />}
```

### apiClient.js
```javascript
// DEV-ONLY warnings in request/response interceptors
if (process.env.NODE_ENV === "development") {
  console.warn(...);
}
```

### RoleProtectedRoute.jsx
```javascript
// DEV-ONLY access logs
if (process.env.NODE_ENV === "development") {
  console.log("✓ Access granted...");
}
```

---

## ✅ Testing Checklist

Before marking MODULE 5.6 complete, verify:

- [ ] Debug panel appears in dev mode when `REACT_APP_SHOW_AUTH_DEBUG_PANEL=true`
- [ ] Debug panel shows correct auth state
- [ ] Debug panel disappears in production build
- [ ] Console warnings appear for auth issues
- [ ] Route access logs show in console
- [ ] No auth logic was modified
- [ ] No routing logic was changed
- [ ] Token handling unchanged
- [ ] All dev code wrapped in NODE_ENV checks
- [ ] Test accounts file exists for reference

---

## 🚨 What This Is NOT

❌ **This is NOT:**
- Production security enforcement
- Auth flow redesign
- Token storage changes
- Route guard modifications
- Backend contract changes

✅ **This IS:**
- Visibility tooling only
- Testing helpers only
- Dev-mode debugging only
- Safe to remove later

---

## 📞 Support

If you encounter issues with dev helpers:
1. Check browser console for errors
2. Verify `NODE_ENV=development`
3. Check that AuthContext is mounted
4. Verify all imports are correct

---

**STATUS:** ✅ MODULE 5.6 COMPLETE

**Next:** MODULE 5.10 — Frontend Settings Page (Admin Only)
