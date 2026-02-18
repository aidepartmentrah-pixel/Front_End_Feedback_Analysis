# 👥 Users Bulk Delete - Backend Implementation Guide

## 📋 Overview
The Users Management tab in Settings requires a bulk delete endpoint to allow SOFTWARE_ADMIN users to delete multiple user accounts simultaneously. This improves efficiency when managing large numbers of users.

---

## 🎯 Required Backend Changes

### **Bulk Delete Users Endpoint** - `POST /api/settings/users/bulk-delete`

#### Request Body:
```json
{
  "user_ids": [1, 5, 12, 25, 33]
}
```

#### ✅ Required Response Structure:
```json
{
  "success": true,
  "deleted_count": 5,
  "failed_count": 0,
  "deleted_users": [
    {
      "user_id": 1,
      "username": "testuser1",
      "status": "deleted"
    },
    {
      "user_id": 5,
      "username": "testuser2",
      "status": "deleted"
    },
    {
      "user_id": 12,
      "username": "olduser1",
      "status": "deleted"
    },
    {
      "user_id": 25,
      "username": "tempuser",
      "status": "deleted"
    },
    {
      "user_id": 33,
      "username": "inactive_user",
      "status": "deleted"
    }
  ],
  "failed_users": [],
  "message": "Successfully deleted 5 user(s)"
}
```

#### Error Response (Partial Failure):
```json
{
  "success": false,
  "deleted_count": 3,
  "failed_count": 2,
  "deleted_users": [
    {
      "user_id": 1,
      "username": "testuser1",
      "status": "deleted"
    },
    {
      "user_id": 5,
      "username": "testuser2",
      "status": "deleted"
    },
    {
      "user_id": 12,
      "username": "olduser1",
      "status": "deleted"
    }
  ],
  "failed_users": [
    {
      "user_id": 25,
      "username": "admin",
      "status": "failed",
      "reason": "Cannot delete currently logged in user"
    },
    {
      "user_id": 33,
      "username": "superadmin",
      "status": "failed",
      "reason": "Insufficient permissions to delete this user"
    }
  ],
  "message": "Deleted 3 out of 5 user(s). 2 failed."
}
```

---

## 🔒 Security & Business Rules

### 1. **Authorization Check**
- Only `SOFTWARE_ADMIN` role can use this endpoint
- Return `403 Forbidden` if user doesn't have proper role

### 2. **Self-Deletion Prevention**
- User CANNOT delete their own account (currently logged-in user)
- Skip the user's own ID from the deletion list with appropriate error message

### 3. **Protected Users**
- Prevent deletion of critical system users:
  - Last remaining SOFTWARE_ADMIN (must have at least 1)
  - System service accounts
  - Built-in accounts marked as `protected = true`

### 4. **Validation**
- Validate that `user_ids` is an array
- Validate that array is not empty
- Validate that user IDs are integers
- Return `400 Bad Request` for validation errors

### 5. **Transaction Safety**
- Use database transaction to ensure atomicity
- If any critical error occurs, rollback all changes
- For non-critical errors (like trying to delete own account), continue with other users

---

## 💻 Backend Implementation Example (Pseudo-code)

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel

router = APIRouter()

class BulkDeleteRequest(BaseModel):
    user_ids: List[int]

class DeletedUserResult(BaseModel):
    user_id: int
    username: str
    status: str
    reason: str = None

class BulkDeleteResponse(BaseModel):
    success: bool
    deleted_count: int
    failed_count: int
    deleted_users: List[DeletedUserResult]
    failed_users: List[DeletedUserResult]
    message: str

@router.post("/api/settings/users/bulk-delete", response_model=BulkDeleteResponse)
async def bulk_delete_users(
    request: BulkDeleteRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # 1. Authorization check
    if current_user.role_name != "SOFTWARE_ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only SOFTWARE_ADMIN can delete users"
        )
    
    # 2. Validation
    if not request.user_ids:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="user_ids cannot be empty"
        )
    
    if len(request.user_ids) > 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete more than 100 users at once"
        )
    
    deleted_users = []
    failed_users = []
    
    try:
        # Start transaction
        for user_id in request.user_ids:
            try:
                # Get user from database
                user = db.query(User).filter(User.id == user_id).first()
                
                if not user:
                    failed_users.append(DeletedUserResult(
                        user_id=user_id,
                        username="unknown",
                        status="failed",
                        reason="User not found"
                    ))
                    continue
                
                # Check if trying to delete self
                if user.id == current_user.id:
                    failed_users.append(DeletedUserResult(
                        user_id=user_id,
                        username=user.username,
                        status="failed",
                        reason="Cannot delete currently logged in user"
                    ))
                    continue
                
                # Check if protected user
                if user.is_protected:
                    failed_users.append(DeletedUserResult(
                        user_id=user_id,
                        username=user.username,
                        status="failed",
                        reason="This user is protected and cannot be deleted"
                    ))
                    continue
                
                # Check if last SOFTWARE_ADMIN
                if user.role_name == "SOFTWARE_ADMIN":
                    admin_count = db.query(User).filter(
                        User.role_name == "SOFTWARE_ADMIN",
                        User.is_active == True
                    ).count()
                    
                    if admin_count <= 1:
                        failed_users.append(DeletedUserResult(
                            user_id=user_id,
                            username=user.username,
                            status="failed",
                            reason="Cannot delete last SOFTWARE_ADMIN"
                        ))
                        continue
                
                # Delete user
                db.delete(user)
                
                deleted_users.append(DeletedUserResult(
                    user_id=user_id,
                    username=user.username,
                    status="deleted"
                ))
                
            except Exception as e:
                failed_users.append(DeletedUserResult(
                    user_id=user_id,
                    username="unknown",
                    status="failed",
                    reason=str(e)
                ))
        
        # Commit transaction
        db.commit()
        
        deleted_count = len(deleted_users)
        failed_count = len(failed_users)
        success = failed_count == 0
        
        if deleted_count == 0:
            message = "No users were deleted"
        elif failed_count == 0:
            message = f"Successfully deleted {deleted_count} user(s)"
        else:
            message = f"Deleted {deleted_count} out of {deleted_count + failed_count} user(s). {failed_count} failed."
        
        return BulkDeleteResponse(
            success=success,
            deleted_count=deleted_count,
            failed_count=failed_count,
            deleted_users=deleted_users,
            failed_users=failed_users,
            message=message
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete users: {str(e)}"
        )
```

---

## 🧪 Testing Requirements

### Test 1: Successful Bulk Delete
```bash
curl -X POST http://localhost:8000/api/settings/users/bulk-delete \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"user_ids": [10, 11, 12]}'
```
**Expected:** All 3 users deleted successfully

### Test 2: Prevent Self-Deletion
```bash
# If logged-in user has ID 5
curl -X POST http://localhost:8000/api/settings/users/bulk-delete \
  -H "Authorization: Bearer <token>" \
  -d '{"user_ids": [5, 10, 11]}'
```
**Expected:** Users 10 and 11 deleted, user 5 in failed_users list

### Test 3: Authorization Check
```bash
# Non-admin user trying to delete
curl -X POST http://localhost:8000/api/settings/users/bulk-delete \
  -H "Authorization: Bearer <non_admin_token>" \
  -d '{"user_ids": [10]}'
```
**Expected:** 403 Forbidden error

### Test 4: Empty Array
```bash
curl -X POST http://localhost:8000/api/settings/users/bulk-delete \
  -H "Authorization: Bearer <token>" \
  -d '{"user_ids": []}'
```
**Expected:** 400 Bad Request error

### Test 5: Non-existent User IDs
```bash
curl -X POST http://localhost:8000/api/settings/users/bulk-delete \
  -H "Authorization: Bearer <token>" \
  -d '{"user_ids": [99999, 88888]}'
```
**Expected:** Both in failed_users with "User not found" reason

### Test 6: Mixed Success/Failure
```bash
curl -X POST http://localhost:8000/api/settings/users/bulk-delete \
  -H "Authorization: Bearer <token>" \
  -d '{"user_ids": [5, 10, 99999]}'
```
**Expected:** Partial success with detailed breakdown

---

## ⚡ Performance Considerations

### 1. **Batch Size Limit**
- Recommend max 100 users per request
- For larger deletions, frontend should make multiple requests

### 2. **Database Optimization**
- Use bulk delete queries where possible
- Ensure proper indexes on user table
- Consider soft delete (mark as deleted) vs hard delete

### 3. **Audit Logging**
- Log all bulk delete operations
- Include: who deleted, when, which users, and result

```python
# Example audit log entry
audit_log = AuditLog(
    user_id=current_user.id,
    action="BULK_DELETE_USERS",
    details={
        "deleted_count": deleted_count,
        "failed_count": failed_count,
        "user_ids": request.user_ids
    },
    timestamp=datetime.now()
)
db.add(audit_log)
```

---

## 📝 Database Considerations

### Optional: Soft Delete Approach
Instead of hard deleting users, consider soft delete:

```sql
-- Add deleted_at column
ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP NULL;
ALTER TABLE users ADD COLUMN deleted_by INTEGER REFERENCES users(id);

-- Mark as deleted instead of removing
UPDATE users 
SET deleted_at = NOW(), 
    deleted_by = <current_user_id>,
    is_active = false
WHERE id IN (1, 5, 12, 25, 33);
```

**Benefits:**
- Maintain data integrity and history
- Can restore deleted users if needed
- Preserve audit trail and relationships

---

## 🎯 Success Criteria

✅ Bulk delete endpoint accepts array of user IDs  
✅ Only SOFTWARE_ADMIN can use the endpoint  
✅ Prevents deletion of currently logged-in user  
✅ Prevents deletion of protected users  
✅ Returns detailed success/failure breakdown  
✅ Uses database transactions for safety  
✅ Logs all deletion attempts  
✅ Handles errors gracefully with appropriate messages  
✅ Performance tested with 100+ user deletions  

---

## 📞 Questions & Clarifications

### Q1: Soft Delete vs Hard Delete?
**Recommendation:** Use soft delete for better auditing and data recovery

### Q2: Related Data Handling?
**Decision Needed:** What happens to user's created records (complaints, actions, etc.)?
- Option A: Cascade delete (remove everything)
- Option B: Nullify foreign keys
- Option C: Prevent deletion if user has records
- **Recommended:** Option B (set user_id to NULL, keep records)

### Q3: Notification?
Should deleted users receive email notification?
- **Recommended:** No notification (administrative action)

---

**Last Updated:** February 11, 2026  
**Status:** Ready for Backend Implementation  
**Related Frontend:** UsersTable.jsx, UnifiedUsersTab.jsx, settingsUsersApi.js
