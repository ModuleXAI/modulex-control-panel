# ModuleX API Documentation

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Common Response Format](#common-response-format)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)
6. [Endpoints](#endpoints)
   - [Authentication Endpoints](#authentication-endpoints)
   - [System Endpoints](#system-endpoints)
   - [Organization Management](#organization-management)
   - [User Management (Dashboard)](#user-management-dashboard)
   - [Tool Execution](#tool-execution)
   - [Integration Management](#integration-management)
   - [Dashboard & Analytics](#dashboard--analytics)
   - [Monitoring](#monitoring)
7. [Data Models](#data-models)
8. [Status Codes Reference](#status-codes-reference)

## Overview

ModuleX is a comprehensive platform for managing integrations, tools, and organizational workflows. This API provides endpoints for authentication, tool execution, organization management, analytics, and system administration.

**Base URL**: `https://your-modulex-instance.com/api`

## Authentication

The API uses JWT (JSON Web Token) based authentication with different authorization levels:

### Authentication Types

1. **Bearer Token Authentication**: Standard JWT token in Authorization header
2. **Organization Context**: Some endpoints require organization ID via query parameter or header
3. **Role-Based Access**: Different endpoints require different user roles

### Authorization Levels

- **No Auth**: Public endpoints (health check)
- **User Auth** (`user_auth_required`): Basic authenticated user
- **Organization Auth** (`organization_auth_required`): User must be member of specified organization
- **Organization Admin** (`organization_admin_required`): User must have admin/owner role in organization
- **System Auth** (`system_auth_required`): Admin/Super Admin access required

### Authentication Headers

```bash
# Standard Bearer Token
Authorization: Bearer <jwt_token>

# Organization Context (when required)
X-Organization-ID: <organization_id>
```

### Organization Context

Many endpoints require organization context. Provide organization ID via:
- Query parameter: `?organization_id=<org_id>`
- Header: `X-Organization-ID: <org_id>`

## Common Response Format

All API responses follow a consistent structure:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {...},
  "error": null,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": "Additional error details"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Common Error Codes

- `AUTHENTICATION_FAILED`: Invalid or expired token
- `AUTHORIZATION_DENIED`: Insufficient permissions
- `VALIDATION_ERROR`: Request validation failed
- `RESOURCE_NOT_FOUND`: Requested resource doesn't exist
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_ERROR`: Server-side error

## Rate Limiting

Rate limiting information is included in response headers:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642248600
```

## Endpoints

### Authentication Endpoints

#### Register User

Register a new user account.

**Endpoint**: `POST /auth/register`  
**Authentication**: None  
**Organization Context**: None

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "username": "johndoe"
}
```

**Request Example**:
```bash
curl -X POST "https://api.modulex.com/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@company.com",
    "password": "SecurePass123!",
    "username": "johndoe"
  }'
```

**Success Response** (201):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IlJlZnJlc2gifQ...",
  "token_type": "bearer",
  "expires_in": 1800,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john.doe@company.com",
    "username": "johndoe",
    "role": "USER",
    "is_active": true,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

**Error Response** (400):
```json
{
  "detail": "Email already registered"
}
```

---

#### Login User

Authenticate user and receive JWT tokens.

**Endpoint**: `POST /auth/login`  
**Authentication**: None  
**Organization Context**: None

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Request Example**:
```bash
curl -X POST "https://api.modulex.com/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@company.com",
    "password": "SecurePass123!"
  }'
```

**Success Response** (200):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IlJlZnJlc2gifQ...",
  "token_type": "bearer",
  "expires_in": 1800,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john.doe@company.com",
    "username": "johndoe",
    "role": "USER",
    "is_active": true
  }
}
```

---

#### Get Current User Info

Get information about the currently authenticated user.

**Endpoint**: `GET /auth/me`  
**Authentication**: Bearer Token  
**Organization Context**: None

**Request Example**:
```bash
curl -X GET "https://api.modulex.com/auth/me" \
  -H "Authorization: Bearer <jwt_token>"
```

**Success Response** (200):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john.doe@company.com",
  "username": "johndoe",
  "role": "USER",
  "is_active": true,
  "organization_ids": ["org-123", "org-456"],
  "primary_organization_id": "org-123"
}
```

---

#### Get User Organizations

Get detailed information about user's organizations.

**Endpoint**: `GET /auth/me/organizations`  
**Authentication**: Bearer Token  
**Organization Context**: None

**Request Example**:
```bash
curl -X GET "https://api.modulex.com/auth/me/organizations" \
  -H "Authorization: Bearer <jwt_token>"
```

**Success Response** (200):
```json
{
  "success": true,
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "organizations": [
    {
      "id": "org-123",
      "name": "ACME Corporation",
      "slug": "acme-corp",
      "role": "admin",
      "is_default": true
    }
  ],
  "total": 1
}
```

---

#### Refresh Access Token

Refresh an expired access token using a refresh token.

**Endpoint**: `POST /auth/refresh`  
**Authentication**: None  
**Organization Context**: None

**Request Body**:
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IlJlZnJlc2gifQ..."
}
```

**Request Example**:
```bash
curl -X POST "https://api.modulex.com/auth/refresh" \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IlJlZnJlc2gifQ..."
  }'
```

**Success Response** (200):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IlJlZnJlc2gifQ...",
  "token_type": "bearer",
  "expires_in": 1800,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "john.doe@company.com",
    "username": "johndoe",
    "role": "USER",
    "is_active": true
  }
}
```

---

#### Get Auth URL for Tool

Get OAuth authorization URL for authenticating with external tools.

**Endpoint**: `GET /auth/url/{tool_name}`  
**Authentication**: Bearer Token  
**Organization Context**: None

**Path Parameters**:
- `tool_name` (string, required): Name of the tool to authenticate with

**Request Example**:
```bash
curl -X GET "https://api.modulex.com/auth/url/github" \
  -H "Authorization: Bearer <jwt_token>"
```

**Success Response** (200):
```json
{
  "auth_url": "https://github.com/login/oauth/authorize?client_id=...",
  "state": "random-state-string",
  "tool_name": "github"
}
```

---

#### Manual Tool Authentication

Register credentials manually for tools that don't use OAuth.

**Endpoint**: `POST /auth/manual`  
**Authentication**: Bearer Token  
**Organization Context**: None

**Request Body**:
```json
{
  "tool_name": "api-tool",
  "credentials": {
    "api_key": "your-api-key",
    "secret": "your-secret"
  }
}
```

**Request Example**:
```bash
curl -X POST "https://api.modulex.com/auth/manual" \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "tool_name": "r2r",
    "credentials": {
      "api_url": "https://r2r.example.com",
      "username": "admin",
      "password": "password123"
    }
  }'
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Manual credentials successfully registered for r2r",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "tool_name": "r2r"
}
```

---

#### Get User Tools

Get all tools with user authentication status.

**Endpoint**: `GET /auth/tools`  
**Authentication**: Bearer Token  
**Organization Context**: None

**Query Parameters**:
- `detail` (boolean, optional): Return detailed tool information (default: false)

**Request Example**:
```bash
curl -X GET "https://api.modulex.com/auth/tools?detail=true" \
  -H "Authorization: Bearer <jwt_token>"
```

**Success Response** (200):
```json
{
  "tools": [
    {
      "name": "github",
      "display_name": "GitHub",
      "description": "GitHub integration for repositories and issues",
      "is_authenticated": true,
      "is_active": true,
      "auth_type": "oauth2",
      "actions": [
        {
          "name": "list_repos",
          "description": "List user repositories",
          "is_active": true
        }
      ]
    }
  ]
}
```

---

#### Set Tool Active Status

Enable or disable a user's authenticated tool.

**Endpoint**: `PUT /auth/tools/{tool_name}/status`  
**Authentication**: Bearer Token  
**Organization Context**: None

**Path Parameters**:
- `tool_name` (string, required): Name of the tool

**Request Body**:
```json
{
  "is_active": true
}
```

**Request Example**:
```bash
curl -X PUT "https://api.modulex.com/auth/tools/github/status" \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"is_active": false}'
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Tool github deactivated successfully",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "tool_name": "github",
  "is_active": false
}
```

---

#### Set Action Disabled Status

Enable or disable specific actions for a user's tool.

**Endpoint**: `PUT /auth/tools/{tool_name}/actions/{action_name}/status`  
**Authentication**: Bearer Token  
**Organization Context**: None

**Path Parameters**:
- `tool_name` (string, required): Name of the tool
- `action_name` (string, required): Name of the action

**Request Body**:
```json
{
  "is_disabled": false
}
```

**Request Example**:
```bash
curl -X PUT "https://api.modulex.com/auth/tools/github/actions/delete_repo/status" \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"is_disabled": true}'
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Action 'delete_repo' for tool 'github' disabled successfully",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "tool_name": "github",
  "action_name": "delete_repo",
  "is_disabled": true
}
```

---

#### Disconnect Tool

Disconnect user from a tool by removing authentication.

**Endpoint**: `DELETE /auth/tools/{tool_name}`  
**Authentication**: Bearer Token  
**Organization Context**: None

**Path Parameters**:
- `tool_name` (string, required): Name of the tool to disconnect

**Request Example**:
```bash
curl -X DELETE "https://api.modulex.com/auth/tools/github" \
  -H "Authorization: Bearer <jwt_token>"
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Successfully disconnected from github",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "tool_name": "github"
}
```

---

### System Endpoints

#### Health Check

Check system health status.

**Endpoint**: `GET /system/health`  
**Authentication**: None  
**Organization Context**: None

**Request Example**:
```bash
curl -X GET "https://api.modulex.com/system/health"
```

**Success Response** (200):
```json
{
  "status": "healthy",
  "service": "ModuleX",
  "version": "0.1.2"
}
```

---

#### Validate Admin Authentication

Validate admin authentication token.

**Endpoint**: `GET /system/validate-auth`  
**Authentication**: System Auth (Admin)  
**Organization Context**: None

**Request Example**:
```bash
curl -X GET "https://api.modulex.com/system/validate-auth" \
  -H "Authorization: Bearer <admin_jwt_token>"
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Admin authentication is valid",
  "auth_method": "jwt",
  "user_role": "ADMIN",
  "status": "authorized"
}
```

---

#### Get Admin Status

Get administrator setup status and information.

**Endpoint**: `GET /system/admin-status`  
**Authentication**: System Auth (Admin)  
**Organization Context**: None

**Request Example**:
```bash
curl -X GET "https://api.modulex.com/system/admin-status" \
  -H "Authorization: Bearer <admin_jwt_token>"
```

**Success Response** (200):
```json
{
  "success": true,
  "admin_info": {
    "has_admin": true,
    "admin_count": 2,
    "setup_complete": true
  },
  "message": "Admin status retrieved successfully"
}
```

---

#### Get Deployment Status

Get deployment and architecture status for monitoring.

**Endpoint**: `GET /system/deployment-status`  
**Authentication**: None  
**Organization Context**: None

**Request Example**:
```bash
curl -X GET "https://api.modulex.com/system/deployment-status"
```

**Success Response** (200):
```json
{
  "status": "healthy",
  "service": "ModuleX",
  "version": "0.1.2",
  "deployment": {
    "architecture_valid": true,
    "available_tools_count": 8,
    "installed_tools_count": 5,
    "user_accessible_tools_count": 5,
    "available_tools": ["github", "gmail", "gdrive", "slack", "n8n"],
    "installed_tools": ["github", "gmail", "gdrive"],
    "auto_install_working": true,
    "ui_integration_working": true
  },
  "message": "Deployment status retrieved successfully"
}
```

---

#### Get System Configuration

Get current system configuration.

**Endpoint**: `GET /system/config`  
**Authentication**: System Auth (Admin)  
**Organization Context**: None

**Request Example**:
```bash
curl -X GET "https://api.modulex.com/system/config" \
  -H "Authorization: Bearer <admin_jwt_token>"
```

**Success Response** (200):
```json
{
  "success": true,
  "auth_provider": "jwt",
  "config_info": {
    "config_loaded": true,
    "config_source": "toml",
    "environment": "production"
  },
  "loaded_config_path": "/app/modulex.toml",
  "message": "System configuration retrieved successfully"
}
```

---

#### Reload System Configuration

Reload TOML configuration from file.

**Endpoint**: `POST /system/config/reload`  
**Authentication**: System Auth (Admin)  
**Organization Context**: None

**Request Example**:
```bash
curl -X POST "https://api.modulex.com/system/config/reload" \
  -H "Authorization: Bearer <admin_jwt_token>"
```

**Success Response** (200):
```json
{
  "success": true,
  "auth_provider": "jwt",
  "message": "Configuration reloaded successfully"
}
```

---

#### Update Database Schema

Run database migrations to update schema.

**Endpoint**: `POST /system/database/update`  
**Authentication**: System Auth (Admin)  
**Organization Context**: None

**Request Example**:
```bash
curl -X POST "https://api.modulex.com/system/database/update" \
  -H "Authorization: Bearer <admin_jwt_token>"
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Database updated successfully",
  "operation": "migration"
}
```

---

#### Create User

Create a new user account (admin only).

**Endpoint**: `POST /system/users/create`  
**Authentication**: System Auth (Admin)  
**Organization Context**: None

**Request Body**:
```json
{
  "email": "newuser@example.com",
  "password": "securePassword123",
  "username": "newuser",
  "role": "USER"
}
```

**Request Example**:
```bash
curl -X POST "https://api.modulex.com/system/users/create" \
  -H "Authorization: Bearer <admin_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@company.com",
    "password": "AdminPass123!",
    "username": "admin",
    "role": "ADMIN"
  }'
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "User 'admin@company.com' created successfully",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "admin@company.com",
    "username": "admin",
    "role": "ADMIN",
    "is_active": true,
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

---

#### Cleanup Logs

Manually trigger cleanup of old log records.

**Endpoint**: `POST /system/logs/cleanup`  
**Authentication**: System Auth (Admin)  
**Organization Context**: None

**Query Parameters**:
- `days` (integer, optional): Override retention days (0 = delete all)

**Request Example**:
```bash
curl -X POST "https://api.modulex.com/system/logs/cleanup?days=30" \
  -H "Authorization: Bearer <admin_jwt_token>"
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Log cleanup task completed successfully",
  "deleted_counts": {
    "request_logs": 1500,
    "security_logs": 230,
    "business_logs": 450,
    "error_logs": 89,
    "system_logs": 67,
    "audit_logs": 123
  }
}
```

---

#### Get Log Statistics

Get current log counts for all log tables.

**Endpoint**: `GET /system/logs/stats`  
**Authentication**: System Auth (Admin)  
**Organization Context**: None

**Request Example**:
```bash
curl -X GET "https://api.modulex.com/system/logs/stats" \
  -H "Authorization: Bearer <admin_jwt_token>"
```

**Success Response** (200):
```json
{
  "success": true,
  "total_counts": {
    "request": 15420,
    "security": 3456,
    "business": 8934,
    "error": 234,
    "system": 567,
    "audit": 1234
  },
  "details": {
    "request": {
      "count": 15420,
      "oldest": "2024-01-01T00:00:00Z",
      "newest": "2024-01-15T10:30:00Z"
    }
  },
  "server_time": "2024-01-15T10:30:00Z"
}
```

---

### Organization Management

#### Create Organization

Create a new organization (Super Admin only).

**Endpoint**: `POST /organizations/`  
**Authentication**: System Auth (Super Admin)  
**Organization Context**: None

**Request Body**:
```json
{
  "slug": "acme-corp",
  "name": "ACME Corporation",
  "domain": "acme.com",
  "max_users": 500,
  "max_tools": 200,
  "settings": {
    "theme": "dark",
    "timezone": "UTC"
  }
}
```

**Request Example**:
```bash
curl -X POST "https://api.modulex.com/organizations/" \
  -H "Authorization: Bearer <super_admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "tech-startup",
    "name": "Tech Startup Inc",
    "domain": "techstartup.com",
    "max_users": 100,
    "max_tools": 50
  }'
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Organization 'Tech Startup Inc' created successfully",
  "organization": {
    "id": "org-789",
    "slug": "tech-startup",
    "name": "Tech Startup Inc",
    "domain": "techstartup.com",
    "max_users": 100,
    "max_tools": 50,
    "is_active": true,
    "is_default": false,
    "settings": {},
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

---

#### List Organizations

List organizations with pagination and search.

**Endpoint**: `GET /organizations/`  
**Authentication**: System Auth  
**Organization Context**: None

**Query Parameters**:
- `page` (integer, optional): Page number (default: 1)
- `limit` (integer, optional): Items per page (default: 10, max: 100)
- `search` (string, optional): Search by name or slug

**Request Example**:
```bash
curl -X GET "https://api.modulex.com/organizations/?page=1&limit=20&search=tech" \
  -H "Authorization: Bearer <admin_token>"
```

**Success Response** (200):
```json
{
  "success": true,
  "organizations": [
    {
      "id": "org-123",
      "slug": "tech-startup",
      "name": "Tech Startup Inc",
      "domain": "techstartup.com",
      "is_active": true,
      "max_users": 100,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 20,
    "total_pages": 1,
    "has_next": false,
    "has_previous": false
  }
}
```

---

#### Get Organization Details

Get detailed information about a specific organization.

**Endpoint**: `GET /organizations/{organization_id}`  
**Authentication**: System Auth  
**Organization Context**: None

**Path Parameters**:
- `organization_id` (string, required): Organization ID

**Request Example**:
```bash
curl -X GET "https://api.modulex.com/organizations/org-123" \
  -H "Authorization: Bearer <admin_token>"
```

**Success Response** (200):
```json
{
  "success": true,
  "organization": {
    "id": "org-123",
    "slug": "tech-startup",
    "name": "Tech Startup Inc",
    "domain": "techstartup.com",
    "max_users": 100,
    "max_tools": 50,
    "is_active": true,
    "is_default": false,
    "settings": {
      "theme": "dark"
    },
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z",
    "stats": {
      "current_users": 45,
      "users_remaining": 55,
      "can_add_user": true
    }
  }
}
```

---

#### Update Organization

Update organization information.

**Endpoint**: `PUT /organizations/{organization_id}`  
**Authentication**: System Auth  
**Organization Context**: None

**Path Parameters**:
- `organization_id` (string, required): Organization ID

**Request Body**:
```json
{
  "name": "Updated Company Name",
  "domain": "newdomain.com",
  "max_users": 200,
  "max_tools": 100,
  "is_active": true,
  "settings": {
    "theme": "light",
    "timezone": "EST"
  }
}
```

**Request Example**:
```bash
curl -X PUT "https://api.modulex.com/organizations/org-123" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Tech Startup",
    "max_users": 150
  }'
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Organization updated successfully",
  "updated_fields": ["name", "max_users"]
}
```

---

#### Delete Organization

Delete an organization (Super Admin only).

**Endpoint**: `DELETE /organizations/{organization_id}`  
**Authentication**: System Auth (Super Admin)  
**Organization Context**: None

**Path Parameters**:
- `organization_id` (string, required): Organization ID

**Request Example**:
```bash
curl -X DELETE "https://api.modulex.com/organizations/org-123" \
  -H "Authorization: Bearer <super_admin_token>"
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Organization 'Tech Startup Inc' deleted successfully"
}
```

---

#### Get Organization Users

Get users belonging to an organization.

**Endpoint**: `GET /organizations/{organization_id}/users`  
**Authentication**: System Auth  
**Organization Context**: Organization Access Required

**Path Parameters**:
- `organization_id` (string, required): Organization ID

**Query Parameters**:
- `page` (integer, optional): Page number (default: 1)
- `limit` (integer, optional): Items per page (default: 20, max: 100)

**Request Example**:
```bash
curl -X GET "https://api.modulex.com/organizations/org-123/users?page=1&limit=10" \
  -H "Authorization: Bearer <admin_token>"
```

**Success Response** (200):
```json
{
  "success": true,
  "organization": {
    "id": "org-123",
    "name": "Tech Startup Inc",
    "slug": "tech-startup",
    "domain": "techstartup.com"
  },
  "users": [
    {
      "id": "user-456",
      "email": "john@techstartup.com",
      "username": "john",
      "role": "admin",
      "is_active": true,
      "joined_at": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 10,
    "has_next": true
  }
}
```

---

#### Add User to Organization

Add a user to an organization.

**Endpoint**: `POST /organizations/{organization_id}/users`  
**Authentication**: System Auth  
**Organization Context**: Organization Access Required

**Path Parameters**:
- `organization_id` (string, required): Organization ID

**Request Body**:
```json
{
  "user_id": "user-789",
  "role": "member"
}
```

**Request Example**:
```bash
curl -X POST "https://api.modulex.com/organizations/org-123/users" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user-789",
    "role": "admin"
  }'
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "User added to organization 'Tech Startup Inc' successfully"
}
```

---

#### Remove User from Organization

Remove a user from an organization.

**Endpoint**: `DELETE /organizations/{organization_id}/users/{user_id}`  
**Authentication**: System Auth  
**Organization Context**: Organization Access Required

**Path Parameters**:
- `organization_id` (string, required): Organization ID
- `user_id` (string, required): User ID

**Request Example**:
```bash
curl -X DELETE "https://api.modulex.com/organizations/org-123/users/user-789" \
  -H "Authorization: Bearer <admin_token>"
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "User removed from organization 'Tech Startup Inc' and moved to default organization"
}
```

---

#### Get Organization Statistics

Get detailed organization statistics.

**Endpoint**: `GET /organizations/{organization_id}/stats`  
**Authentication**: System Auth  
**Organization Context**: Organization Access Required

**Path Parameters**:
- `organization_id` (string, required): Organization ID

**Request Example**:
```bash
curl -X GET "https://api.modulex.com/organizations/org-123/stats" \
  -H "Authorization: Bearer <admin_token>"
```

**Success Response** (200):
```json
{
  "success": true,
  "organization": {
    "id": "org-123",
    "name": "Tech Startup Inc",
    "slug": "tech-startup",
    "domain": "techstartup.com"
  },
  "stats": {
    "user_count": 45,
    "active_user_count": 42,
    "tool_count": 12,
    "active_tool_count": 8,
    "api_calls_today": 1250,
    "api_calls_this_month": 35000,
    "storage_used_mb": 2048,
    "last_activity": "2024-01-15T10:25:00Z"
  }
}
```

---

#### Get Organization by Slug

Get organization details by slug identifier.

**Endpoint**: `GET /organizations/slug/{organization_slug}`  
**Authentication**: System Auth  
**Organization Context**: Organization Access Required

**Path Parameters**:
- `organization_slug` (string, required): Organization slug

**Request Example**:
```bash
curl -X GET "https://api.modulex.com/organizations/slug/tech-startup" \
  -H "Authorization: Bearer <admin_token>"
```

**Success Response** (200):
```json
{
  "success": true,
  "organization": {
    "id": "org-123",
    "slug": "tech-startup",
    "name": "Tech Startup Inc",
    "domain": "techstartup.com",
    "max_users": 100,
    "max_tools": 50,
    "is_active": true,
    "is_default": false,
    "settings": {},
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

---

#### Get Organization by Domain

Get organization details by domain.

**Endpoint**: `GET /organizations/domain/{domain}`  
**Authentication**: System Auth  
**Organization Context**: Organization Access Required

**Path Parameters**:
- `domain` (string, required): Organization domain

**Request Example**:
```bash
curl -X GET "https://api.modulex.com/organizations/domain/techstartup.com" \
  -H "Authorization: Bearer <admin_token>"
```

**Success Response** (200):
```json
{
  "success": true,
  "organization": {
    "id": "org-123",
    "slug": "tech-startup",
    "name": "Tech Startup Inc",
    "domain": "techstartup.com",
    "max_users": 100,
    "max_tools": 50,
    "is_active": true,
    "is_default": false,
    "settings": {},
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

---

### Tool Execution

#### Execute Tool Action

Execute a specific action on a tool within organization context.

**Endpoint**: `POST /tools/{tool_name}/execute`  
**Authentication**: Organization Auth  
**Organization Context**: Required

**Path Parameters**:
- `tool_name` (string, required): Name of the tool to execute

**Request Body**:
```json
{
  "action": "list_repos",
  "parameters": {
    "visibility": "public",
    "sort": "updated"
  }
}
```

**Request Example**:
```bash
curl -X POST "https://api.modulex.com/tools/github/execute" \
  -H "Authorization: Bearer <jwt_token>" \
  -H "X-Organization-ID: org-123" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "list_repos",
    "parameters": {
      "visibility": "public",
      "per_page": 10
    }
  }'
```

**Success Response** (200):
```json
{
  "success": true,
  "tool_name": "github",
  "action": "list_repos",
  "organization_id": "org-123",
  "result": {
    "success": true,
    "data": [
      {
        "id": 123456,
        "name": "awesome-project",
        "full_name": "user/awesome-project",
        "private": false,
        "description": "An awesome project",
        "updated_at": "2024-01-15T10:30:00Z"
      }
    ],
    "total_count": 1,
    "start_time": "2024-01-15T10:30:00Z",
    "end_time": "2024-01-15T10:30:15Z"
  }
}
```

**Error Response** (400):
```json
{
  "detail": "Tool execution failed: Invalid credentials for github"
}
```

---

#### Get Available Tools

Get available tools for the user's organization.

**Endpoint**: `GET /tools/available`  
**Authentication**: Organization Auth  
**Organization Context**: Required

**Request Example**:
```bash
curl -X GET "https://api.modulex.com/tools/available" \
  -H "Authorization: Bearer <jwt_token>" \
  -H "X-Organization-ID: org-123"
```

**Success Response** (200):
```json
{
  "success": true,
  "organization_id": "org-123",
  "tools": [
    {
      "name": "github",
      "display_name": "GitHub",
      "description": "GitHub integration for repositories and issues",
      "version": "1.0.0",
      "author": "ModuleX Team",
      "categories": ["Development", "Version Control"],
      "logo": "https://github.com/favicon.ico",
      "actions": [
        {
          "name": "list_repos",
          "description": "List user repositories"
        }
      ]
    }
  ],
  "total": 1
}
```

---

#### Get User Tools

Get user's authenticated tools within organization context.

**Endpoint**: `GET /tools/user`  
**Authentication**: Organization Auth  
**Organization Context**: Required

**Request Example**:
```bash
curl -X GET "https://api.modulex.com/tools/user" \
  -H "Authorization: Bearer <jwt_token>" \
  -H "X-Organization-ID: org-123"
```

**Success Response** (200):
```json
{
  "success": true,
  "user_id": "user-456",
  "organization_id": "org-123",
  "tools": [
    {
      "name": "github",
      "display_name": "GitHub",
      "is_authenticated": true,
      "is_active": true,
      "auth_type": "oauth2",
      "last_used": "2024-01-15T09:30:00Z",
      "actions": [
        {
          "name": "list_repos",
          "description": "List repositories",
          "is_active": true
        }
      ]
    }
  ],
  "total": 1
}
```

---

#### Get OpenAI Tools Format

Get user's tools in OpenAI function calling format.

**Endpoint**: `GET /tools/openai-tools`  
**Authentication**: Organization Auth  
**Organization Context**: Required

**Request Example**:
```bash
curl -X GET "https://api.modulex.com/tools/openai-tools" \
  -H "Authorization: Bearer <jwt_token>" \
  -H "X-Organization-ID: org-123"
```

**Success Response** (200):
```json
{
  "success": true,
  "user_id": "user-456",
  "organization_id": "org-123",
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "github_list_repos",
        "description": "GitHub: List user repositories",
        "parameters": {
          "type": "object",
          "properties": {
            "visibility": {
              "type": "string",
              "enum": ["all", "public", "private"],
              "description": "Repository visibility"
            },
            "sort": {
              "type": "string",
              "enum": ["created", "updated", "pushed", "full_name"],
              "description": "Sort order"
            }
          },
          "required": []
        }
      }
    }
  ],
  "total": 1
}
```

---

### Integration Management

#### Get Available Integrations

Get all available integrations that can be installed.

**Endpoint**: `GET /integrations/available`  
**Authentication**: Organization Auth  
**Organization Context**: Required

**Request Example**:
```bash
curl -X GET "https://api.modulex.com/integrations/available" \
  -H "Authorization: Bearer <jwt_token>" \
  -H "X-Organization-ID: org-123"
```

**Success Response** (200):
```json
{
  "success": true,
  "organization_id": "org-123",
  "tools": [
    {
      "name": "github",
      "display_name": "GitHub",
      "description": "GitHub integration for repositories and issues",
      "version": "1.0.0",
      "author": "ModuleX Team",
      "categories": ["Development", "Version Control"],
      "logo": "https://github.com/favicon.ico",
      "app_url": "https://github.com",
      "actions": [
        {
          "name": "list_repos",
          "description": "List user repositories"
        }
      ],
      "environment_variables": [
        {
          "name": "GITHUB_CLIENT_ID",
          "description": "GitHub OAuth Client ID",
          "sample_format": "Iv1.abc123def456"
        }
      ]
    }
  ],
  "total": 1
}
```

---

#### Get Installed Integrations

Get integrations installed for the organization.

**Endpoint**: `GET /integrations/installed`  
**Authentication**: Organization Auth  
**Organization Context**: Required

**Request Example**:
```bash
curl -X GET "https://api.modulex.com/integrations/installed" \
  -H "Authorization: Bearer <jwt_token>" \
  -H "X-Organization-ID: org-123"
```

**Success Response** (200):
```json
{
  "success": true,
  "organization_id": "org-123",
  "tools": [
    {
      "name": "github",
      "display_name": "GitHub",
      "description": "GitHub integration",
      "is_active": true,
      "installed_at": "2024-01-10T12:00:00Z",
      "config_data": {
        "webhook_url": "https://api.modulex.com/webhooks/github"
      }
    }
  ],
  "total": 1
}
```

---

#### Get Non-Installed Integrations

Get integrations available but not yet installed.

**Endpoint**: `GET /integrations/not-installed`  
**Authentication**: Organization Auth  
**Organization Context**: Required

**Request Example**:
```bash
curl -X GET "https://api.modulex.com/integrations/not-installed" \
  -H "Authorization: Bearer <jwt_token>" \
  -H "X-Organization-ID: org-123"
```

**Success Response** (200):
```json
{
  "success": true,
  "organization_id": "org-123",
  "tools": [
    {
      "name": "slack",
      "display_name": "Slack",
      "description": "Slack messaging integration",
      "version": "1.0.0",
      "categories": ["Communication"]
    }
  ],
  "total": 1
}
```

---

#### Install Integration

Install an integration for the organization.

**Endpoint**: `POST /integrations/install`  
**Authentication**: Organization Admin  
**Organization Context**: Required

**Request Body**:
```json
{
  "tool_name": "slack",
  "config_data": {
    "webhook_url": "https://hooks.slack.com/services/...",
    "default_channel": "#general"
  }
}
```

**Request Example**:
```bash
curl -X POST "https://api.modulex.com/integrations/install" \
  -H "Authorization: Bearer <admin_token>" \
  -H "X-Organization-ID: org-123" \
  -H "Content-Type: application/json" \
  -d '{
    "tool_name": "slack",
    "config_data": {
      "webhook_url": "https://hooks.slack.com/services/T123/B456/xyz789",
      "default_channel": "#general"
    }
  }'
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Tool 'slack' installed successfully for organization",
  "organization_id": "org-123",
  "tool_name": "slack",
  "installed_at": "2024-01-15T10:30:00Z"
}
```

---

#### Uninstall Integration

Uninstall an integration from the organization.

**Endpoint**: `DELETE /integrations/{tool_name}`  
**Authentication**: Organization Admin  
**Organization Context**: Required

**Path Parameters**:
- `tool_name` (string, required): Name of the tool to uninstall

**Request Example**:
```bash
curl -X DELETE "https://api.modulex.com/integrations/slack" \
  -H "Authorization: Bearer <admin_token>" \
  -H "X-Organization-ID: org-123"
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Tool 'slack' uninstalled successfully from organization",
  "organization_id": "org-123",
  "tool_name": "slack"
}
```

---

#### Update Integration Configuration

Update configuration for an installed integration.

**Endpoint**: `PUT /integrations/{tool_name}/config`  
**Authentication**: Organization Admin  
**Organization Context**: Required

**Path Parameters**:
- `tool_name` (string, required): Name of the tool

**Request Body**:
```json
{
  "config_data": {
    "webhook_url": "https://hooks.slack.com/services/new-webhook",
    "default_channel": "#updates"
  }
}
```

**Request Example**:
```bash
curl -X PUT "https://api.modulex.com/integrations/slack/config" \
  -H "Authorization: Bearer <admin_token>" \
  -H "X-Organization-ID: org-123" \
  -H "Content-Type: application/json" \
  -d '{
    "config_data": {
      "webhook_url": "https://hooks.slack.com/services/new-webhook",
      "default_channel": "#updates"
    }
  }'
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Configuration updated successfully for tool 'slack'",
  "organization_id": "org-123",
  "tool_name": "slack"
}
```

---

#### Get Integration Configuration

Get current configuration for an installed integration.

**Endpoint**: `GET /integrations/{tool_name}/config`  
**Authentication**: Organization Admin  
**Organization Context**: Required

**Path Parameters**:
- `tool_name` (string, required): Name of the tool

**Request Example**:
```bash
curl -X GET "https://api.modulex.com/integrations/slack/config" \
  -H "Authorization: Bearer <admin_token>" \
  -H "X-Organization-ID: org-123"
```

**Success Response** (200):
```json
{
  "success": true,
  "organization_id": "org-123",
  "tool_name": "slack",
  "config_data": {
    "webhook_url": "https://hooks.slack.com/services/...",
    "default_channel": "#general",
    "notifications_enabled": true
  }
}
```

---

#### Sync Integrations

Sync available integrations from the integrations directory.

**Endpoint**: `POST /integrations/sync`  
**Authentication**: Organization Auth  
**Organization Context**: Required

**Query Parameters**:
- `auto_install` (boolean, optional): Auto-install tools from environment (default: true)

**Request Example**:
```bash
curl -X POST "https://api.modulex.com/integrations/sync?auto_install=true" \
  -H "Authorization: Bearer <jwt_token>" \
  -H "X-Organization-ID: org-123"
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Integration sync completed successfully",
  "synced_count": 8
}
```

---

#### Get Integration Schema

Get the schema/specification for a specific integration.

**Endpoint**: `GET /integrations/{tool_name}/schema`  
**Authentication**: Organization Auth  
**Organization Context**: Required

**Path Parameters**:
- `tool_name` (string, required): Name of the tool

**Request Example**:
```bash
curl -X GET "https://api.modulex.com/integrations/github/schema" \
  -H "Authorization: Bearer <jwt_token>" \
  -H "X-Organization-ID: org-123"
```

**Success Response** (200):
```json
{
  "success": true,
  "tool_name": "github",
  "schema": {
    "name": "github",
    "display_name": "GitHub",
    "description": "GitHub integration for repositories and issues",
    "version": "1.0.0",
    "auth_type": "oauth2",
    "actions": [
      {
        "name": "list_repos",
        "description": "List user repositories",
        "parameters": {
          "type": "object",
          "properties": {
            "visibility": {
              "type": "string",
              "enum": ["all", "public", "private"]
            }
          }
        }
      }
    ],
    "environment_variables": [
      {
        "name": "GITHUB_CLIENT_ID",
        "description": "GitHub OAuth Client ID",
        "required": true
      }
    ]
  }
}
```

---

#### Get Integration Status

Get installation status for all integrations.

**Endpoint**: `GET /integrations/status`  
**Authentication**: Organization Auth  
**Organization Context**: Required

**Request Example**:
```bash
curl -X GET "https://api.modulex.com/integrations/status" \
  -H "Authorization: Bearer <jwt_token>" \
  -H "X-Organization-ID: org-123"
```

**Success Response** (200):
```json
{
  "success": true,
  "organization_id": "org-123",
  "status": {
    "total_available": 8,
    "total_installed": 3,
    "installation_rate": 37.5,
    "integrations": [
      {
        "name": "github",
        "display_name": "GitHub",
        "is_installed": true,
        "is_active": true,
        "user_count": 12
      },
      {
        "name": "slack",
        "display_name": "Slack",
        "is_installed": false,
        "is_active": false,
        "user_count": 0
      }
    ]
  }
}
```

---

#### Get Admin Tools Status

Get admin-level integration status (Admin only).

**Endpoint**: `GET /integrations/admin-status`  
**Authentication**: Organization Admin  
**Organization Context**: Required

**Request Example**:
```bash
curl -X GET "https://api.modulex.com/integrations/admin-status" \
  -H "Authorization: Bearer <admin_token>" \
  -H "X-Organization-ID: org-123"
```

**Success Response** (200):
```json
{
  "success": true,
  "organization_id": "org-123",
  "admin_status": {
    "total_available": 8,
    "total_installed": 3,
    "environment_configured": 5,
    "missing_environment": ["tool1", "tool2"],
    "installation_health": "good",
    "last_sync": "2024-01-15T10:00:00Z"
  }
}
```

---

#### Admin Install Integration

Install an integration with environment variables (Admin only).

**Endpoint**: `POST /integrations/{tool_name}/admin-install`  
**Authentication**: Organization Admin  
**Organization Context**: Required

**Path Parameters**:
- `tool_name` (string, required): Name of the tool to install

**Request Body**:
```json
{
  "environment_variables": {
    "GITHUB_CLIENT_ID": "Iv1.abc123def456",
    "GITHUB_CLIENT_SECRET": "secret123",
    "GITHUB_WEBHOOK_SECRET": "webhook_secret"
  }
}
```

**Request Example**:
```bash
curl -X POST "https://api.modulex.com/integrations/github/admin-install" \
  -H "Authorization: Bearer <admin_token>" \
  -H "X-Organization-ID: org-123" \
  -H "Content-Type: application/json" \
  -d '{
    "environment_variables": {
      "GITHUB_CLIENT_ID": "Iv1.abc123def456",
      "GITHUB_CLIENT_SECRET": "your-secret-here"
    }
  }'
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Tool 'github' installed successfully with admin configuration",
  "organization_id": "org-123",
  "tool_name": "github",
  "environment_configured": true,
  "installed_at": "2024-01-15T10:30:00Z"
}
```

---

#### Update Integration Environment

Update environment variables for an integration (Admin only).

**Endpoint**: `PUT /integrations/{tool_name}/environment`  
**Authentication**: Organization Admin  
**Organization Context**: Required

**Path Parameters**:
- `tool_name` (string, required): Name of the tool

**Request Body**:
```json
{
  "environment_variables": {
    "GITHUB_CLIENT_ID": "Iv1.new_client_id",
    "GITHUB_CLIENT_SECRET": "new_secret"
  }
}
```

**Request Example**:
```bash
curl -X PUT "https://api.modulex.com/integrations/github/environment" \
  -H "Authorization: Bearer <admin_token>" \
  -H "X-Organization-ID: org-123" \
  -H "Content-Type: application/json" \
  -d '{
    "environment_variables": {
      "GITHUB_CLIENT_ID": "Iv1.updated_client_id"
    }
  }'
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Environment variables updated successfully for tool 'github'",
  "organization_id": "org-123",
  "tool_name": "github",
  "updated_variables": ["GITHUB_CLIENT_ID"]
}
```

---

### Dashboard & Analytics

#### Get Dashboard Statistics

Get overview statistics for the organization dashboard.

**Endpoint**: `GET /dashboard/stats`  
**Authentication**: Organization Auth  
**Organization Context**: Required

**Request Example**:
```bash
curl -X GET "https://api.modulex.com/dashboard/stats" \
  -H "Authorization: Bearer <jwt_token>" \
  -H "X-Organization-ID: org-123"
```

**Success Response** (200):
```json
{
  "success": true,
  "organization_id": "org-123",
  "stats": {
    "total_members": 45,
    "total_tool_authenticated": 128,
    "total_integrations": 8,
    "active_integrations": 5,
    "api_calls_today": 1250,
    "system_health": "healthy"
  }
}
```

---

#### Get Dashboard Logs

Get unified logs from all log tables (Admin only).

**Endpoint**: `GET /dashboard/logs`  
**Authentication**: Organization Admin  
**Organization Context**: Required

**Query Parameters**:
- `limit` (integer, optional): Number of logs to return (1-1000, default: 50)
- `offset` (integer, optional): Number of logs to skip (default: 0)
- `start_date` (datetime, optional): Start date filter (ISO format)
- `end_date` (datetime, optional): End date filter (ISO format)
- `log_type` (string, optional): Filter by log type (request, security, business, error, system, audit)
- `level` (string, optional): Filter by log level (INFO, WARNING, ERROR, CRITICAL)

**Request Example**:
```bash
curl -X GET "https://api.modulex.com/dashboard/logs?limit=100&log_type=security&level=WARNING" \
  -H "Authorization: Bearer <admin_token>" \
  -H "X-Organization-ID: org-123"
```

**Success Response** (200):
```json
{
  "success": true,
  "organization_id": "org-123",
  "logs": [
    {
      "id": "log-123",
      "timestamp": "2024-01-15T10:30:00Z",
      "log_type": "security",
      "level": "WARNING",
      "user_id": "user-456",
      "message": "Failed login attempt from suspicious IP",
      "success": false,
      "tool_name": null,
      "category": "Security",
      "details": "AUTH_FAIL"
    }
  ],
  "pagination": {
    "total_count": 1500,
    "limit": 100,
    "offset": 0,
    "has_next": true,
    "has_previous": false
  },
  "filters": {
    "start_date": null,
    "end_date": null,
    "log_type": "security",
    "level": "WARNING"
  }
}
```

---

#### Get Analytics Overview

Get comprehensive analytics overview (Admin only).

**Endpoint**: `GET /dashboard/analytics/overview`  
**Authentication**: Organization Admin  
**Organization Context**: Required

**Query Parameters**:
- `period` (string, optional): Time period (24h, 7d, 30d, 90d, default: 7d)

**Request Example**:
```bash
curl -X GET "https://api.modulex.com/dashboard/analytics/overview?period=30d" \
  -H "Authorization: Bearer <admin_token>" \
  -H "X-Organization-ID: org-123"
```

**Success Response** (200):
```json
{
  "success": true,
  "organization_id": "org-123",
  "data": {
    "overview": {
      "total_users": 45,
      "total_tools": 8,
      "active_tools": 5,
      "system_health": "optimal",
      "user_growth": [
        {
          "date": "2024-01-01",
          "users": 40,
          "growth": 0
        }
      ],
      "tool_usage": [
        {
          "date": "2024-01-01",
          "executions": 250
        }
      ],
      "system_performance": [
        {
          "time": "10:00",
          "cpu": 45,
          "memory": 62,
          "response_time": 120
        }
      ],
      "recent_alerts": [
        {
          "id": "alert-123",
          "type": "security",
          "message": "Multiple failed login attempts detected",
          "severity": "warning",
          "timestamp": "2024-01-15T10:30:00Z"
        }
      ]
    }
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "period": "30d",
    "cached": false
  }
}
```

---

#### Get User Analytics

Get detailed user analytics (Admin only).

**Endpoint**: `GET /dashboard/analytics/users`  
**Authentication**: Organization Admin  
**Organization Context**: Required

**Query Parameters**:
- `period` (string, optional): Time period (24h, 7d, 30d, 90d, default: 7d)
- `group_by` (string, optional): Group by (hour, day, week, month, default: day)

**Request Example**:
```bash
curl -X GET "https://api.modulex.com/dashboard/analytics/users?period=7d&group_by=day" \
  -H "Authorization: Bearer <admin_token>" \
  -H "X-Organization-ID: org-123"
```

**Success Response** (200):
```json
{
  "success": true,
  "organization_id": "org-123",
  "data": {
    "user_analytics": {
      "total_users": 45,
      "new_users": {
        "value": 5,
        "change": 23,
        "change_type": "increase",
        "period": "7d"
      },
      "active_users": {
        "value": 38,
        "change": 15,
        "change_type": "increase",
        "period": "7d"
      },
      "avg_session_time": {
        "value": 24,
        "change": 5,
        "change_type": "increase",
        "period": "7d"
      },
      "user_growth": [
        {
          "date": "2024-01-15",
          "new_users": 2,
          "total_users": 45
        }
      ],
      "top_users": [
        {
          "id": "user-456",
          "name": "John Doe",
          "email": "john@company.com",
          "tools_used": 5,
          "last_active": "2024-01-15T09:30:00Z"
        }
      ]
    }
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "period": "7d",
    "cached": false
  }
}
```

---

#### Get Tool Analytics

Get detailed tool usage analytics (Admin only).

**Endpoint**: `GET /dashboard/analytics/tools`  
**Authentication**: Organization Admin  
**Organization Context**: Required

**Query Parameters**:
- `period` (string, optional): Time period (24h, 7d, 30d, 90d, default: 7d)
- `category` (string, optional): Filter by tool category

**Request Example**:
```bash
curl -X GET "https://api.modulex.com/dashboard/analytics/tools?period=30d" \
  -H "Authorization: Bearer <admin_token>" \
  -H "X-Organization-ID: org-123"
```

**Success Response** (200):
```json
{
  "success": true,
  "organization_id": "org-123",
  "data": {
    "tool_analytics": {
      "total_installations": {
        "value": 128,
        "change": 28,
        "change_type": "increase",
        "period": "30d"
      },
      "tool_executions": {
        "value": 2450,
        "change": 15,
        "change_type": "increase",
        "period": "30d"
      },
      "success_rate": {
        "value": 94.2,
        "change": 0.5,
        "change_type": "increase",
        "period": "30d"
      },
      "avg_execution_time": {
        "value": 275,
        "change": -12,
        "change_type": "decrease",
        "period": "30d"
      },
      "tool_adoption": [
        {
          "month": "January",
          "installations": 25,
          "uninstallations": 2
        }
      ],
      "top_tools": [
        {
          "id": "github",
          "name": "GitHub",
          "users": 35,
          "usage": 450,
          "successRate": 96.5,
          "trend": "up"
        }
      ]
    }
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "period": "30d",
    "cached": false
  }
}
```

---

#### Get Performance Analytics

Get system performance analytics (Admin only).

**Endpoint**: `GET /dashboard/analytics/performance`  
**Authentication**: Organization Admin  
**Organization Context**: Required

**Query Parameters**:
- `period` (string, optional): Time period (24h, 7d, 30d, 90d, default: 7d)
- `metric` (string, optional): Specific metric to retrieve

**Request Example**:
```bash
curl -X GET "https://api.modulex.com/dashboard/analytics/performance?period=24h" \
  -H "Authorization: Bearer <admin_token>" \
  -H "X-Organization-ID: org-123"
```

**Success Response** (200):
```json
{
  "success": true,
  "organization_id": "org-123",
  "data": {
    "performance_analytics": {
      "avg_response_time": {
        "value": 128,
        "change": -8,
        "change_type": "decrease",
        "period": "24h"
      },
      "uptime": {
        "value": 99.95,
        "change": 0,
        "change_type": "stable",
        "period": "30d"
      },
      "request_volume": {
        "value": 15420,
        "change": 12,
        "change_type": "increase",
        "period": "24h"
      },
      "error_rate": {
        "value": 0.85,
        "change": -0.05,
        "change_type": "decrease",
        "period": "24h"
      },
      "api_response_times": [
        {
          "time": "10:00",
          "p50": 120,
          "p95": 180,
          "p99": 250
        }
      ],
      "endpoint_performance": [
        {
          "endpoint": "/tools/github/execute",
          "avg_time": 245,
          "calls": 1250,
          "errors": 12
        }
      ],
      "system_metrics": [
        {
          "name": "CPU Usage",
          "value": 68,
          "color": "#3b82f6"
        },
        {
          "name": "Memory Usage",
          "value": 74,
          "color": "#10b981"
        }
      ]
    }
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "period": "24h",
    "cached": false
  }
}
```

---

#### Get Security Analytics

Get security analytics and threat monitoring (Admin only).

**Endpoint**: `GET /dashboard/analytics/security`  
**Authentication**: Organization Admin  
**Organization Context**: Required

**Query Parameters**:
- `period` (string, optional): Time period (24h, 7d, 30d, 90d, default: 7d)
- `event_type` (string, optional): Filter by event type

**Request Example**:
```bash
curl -X GET "https://api.modulex.com/dashboard/analytics/security?period=7d" \
  -H "Authorization: Bearer <admin_token>" \
  -H "X-Organization-ID: org-123"
```

**Success Response** (200):
```json
{
  "success": true,
  "organization_id": "org-123",
  "data": {
    "security_analytics": {
      "security_score": 91,
      "failed_logins": {
        "value": 23,
        "change": -15,
        "change_type": "decrease",
        "period": "24h"
      },
      "suspicious_activities": {
        "value": 3,
        "change": 2,
        "change_type": "increase",
        "period": "24h"
      },
      "active_sessions": 342,
      "security_events": [
        {
          "time": "10:00",
          "login_attempts": 45,
          "failed_logins": 3,
          "suspicious_activity": 1
        }
      ],
      "auth_methods_usage": [
        {
          "method": "password",
          "value": 78,
          "color": "#3b82f6"
        },
        {
          "method": "oauth",
          "value": 22,
          "color": "#10b981"
        }
      ],
      "security_score_breakdown": [
        {
          "subject": "Authentication",
          "score": 95,
          "full_mark": 100
        },
        {
          "subject": "Authorization",
          "score": 88,
          "full_mark": 100
        }
      ],
      "recent_security_events": [
        {
          "id": 123456,
          "type": "auth_fail",
          "message": "Failed login attempt",
          "severity": "warning",
          "time": "2 hours ago"
        }
      ]
    }
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "period": "7d",
    "cached": false
  }
}
```

---

#### Get Users List

Get organization users with search, filtering, and pagination (Admin only).

**Endpoint**: `GET /dashboard/users`  
**Authentication**: Organization Admin  
**Organization Context**: Required

**Query Parameters**:
- `search` (string, optional): Search by username or email
- `status` (string, optional): Filter by status (active, inactive)
- `sort_by` (string, optional): Sort by (name, email, created_at, last_active, default: created_at)
- `order` (string, optional): Sort order (asc, desc, default: desc)
- `page` (integer, optional): Page number (default: 1)
- `limit` (integer, optional): Items per page (1-100, default: 10)

**Request Example**:
```bash
curl -X GET "https://api.modulex.com/dashboard/users?search=john&status=active&page=1&limit=20" \
  -H "Authorization: Bearer <admin_token>" \
  -H "X-Organization-ID: org-123"
```

**Success Response** (200):
```json
{
  "success": true,
  "organization_id": "org-123",
  "users": [
    {
      "id": "user-456",
      "email": "john@company.com",
      "username": "john",
      "avatar": null,
      "is_active": true,
      "created_at": "2024-01-10T12:00:00Z",
      "updated_at": "2024-01-15T09:30:00Z",
      "last_active_at": "2024-01-15T09:30:00Z",
      "tool_count": 5,
      "active_tool_count": 4,
      "total_logins": 127
    }
  ],
  "total": 45,
  "total_pages": 3,
  "current_page": 1,
  "limit": 20,
  "has_next": true,
  "has_previous": false
}
```

---

#### Get User Statistics

Get user statistics summary (Admin only).

**Endpoint**: `GET /dashboard/users/stats`  
**Authentication**: Organization Admin  
**Organization Context**: Required

**Request Example**:
```bash
curl -X GET "https://api.modulex.com/dashboard/users/stats" \
  -H "Authorization: Bearer <admin_token>" \
  -H "X-Organization-ID: org-123"
```

**Success Response** (200):
```json
{
  "success": true,
  "organization_id": "org-123",
  "data": {
    "total_users": 45,
    "active_users": 42,
    "inactive_users": 3,
    "new_users_today": 2,
    "active_percentage": 93.3,
    "new_users_change": 100.0
  }
}
```

---

#### Get User Details

Get detailed information about a specific user (Admin only).

**Endpoint**: `GET /dashboard/users/{user_id}`  
**Authentication**: Organization Admin  
**Organization Context**: Required

**Path Parameters**:
- `user_id` (string, required): User ID

**Request Example**:
```bash
curl -X GET "https://api.modulex.com/dashboard/users/user-456" \
  -H "Authorization: Bearer <admin_token>" \
  -H "X-Organization-ID: org-123"
```

**Success Response** (200):
```json
{
  "success": true,
  "organization_id": "org-123",
  "data": {
    "id": "user-456",
    "email": "john@company.com",
    "username": "john",
    "avatar": null,
    "is_active": true,
    "created_at": "2024-01-10T12:00:00Z",
    "updated_at": "2024-01-15T09:30:00Z",
    "last_active_at": "2024-01-15T09:30:00Z",
    "tool_count": 5,
    "active_tool_count": 4,
    "total_logins": 127,
    "session_count": 3,
    "tools": [
      {
        "id": "tool-auth-123",
        "name": "github",
        "category": "Integration",
        "is_authenticated": true,
        "is_active": true,
        "last_used": "2024-01-15T09:00:00Z",
        "created_at": "2024-01-10T15:00:00Z"
      }
    ],
    "activities": [
      {
        "type": "login",
        "description": "User login event",
        "timestamp": "2024-01-15T09:30:00Z",
        "metadata": "IP: 192.168.1.100",
        "success": true
      }
    ],
    "sessions": [
      {
        "id": "session-789",
        "is_active": true,
        "ip_address": "192.168.1.100",
        "user_agent": "Mozilla/5.0...",
        "created_at": "2024-01-15T09:30:00Z",
        "expires_at": "2024-01-16T09:30:00Z"
      }
    ]
  }
}
```

---

### Monitoring

#### Get Log Statistics

Get log statistics for monitoring purposes.

**Endpoint**: `GET /monitoring/logs/stats`  
**Authentication**: System Auth (Admin)  
**Organization Context**: None

**Query Parameters**:
- `hours` (integer, optional): Hours to look back (1-720, default: 24)

**Request Example**:
```bash
curl -X GET "https://api.modulex.com/monitoring/logs/stats?hours=48" \
  -H "Authorization: Bearer <admin_token>"
```

**Success Response** (200):
```json
{
  "success": true,
  "period_hours": 48,
  "stats": {
    "total_logs": 25420,
    "request_logs": 15420,
    "security_logs": 3456,
    "business_logs": 4934,
    "error_logs": 1234,
    "system_logs": 376,
    "log_rate_per_hour": 529.6
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

#### Get Recent Errors

Get recent error logs for monitoring.

**Endpoint**: `GET /monitoring/errors/recent`  
**Authentication**: System Auth (Admin)  
**Organization Context**: None

**Query Parameters**:
- `limit` (integer, optional): Number of errors to return (1-100, default: 20)

**Request Example**:
```bash
curl -X GET "https://api.modulex.com/monitoring/errors/recent?limit=50" \
  -H "Authorization: Bearer <admin_token>"
```

**Success Response** (200):
```json
{
  "success": true,
  "errors": [
    {
      "id": "error-123",
      "timestamp": "2024-01-15T10:25:00Z",
      "level": "ERROR",
      "category": "integration",
      "message": "GitHub API rate limit exceeded",
      "tool_name": "github",
      "user_id": "user-456",
      "endpoint": "/tools/github/execute",
      "error_code": "RATE_LIMIT"
    }
  ],
  "total": 1,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

#### Get Slow Requests

Get slow API requests for performance monitoring.

**Endpoint**: `GET /monitoring/performance/slow`  
**Authentication**: System Auth (Admin)  
**Organization Context**: None

**Query Parameters**:
- `limit` (integer, optional): Number of requests to return (1-100, default: 20)

**Request Example**:
```bash
curl -X GET "https://api.modulex.com/monitoring/performance/slow?limit=30" \
  -H "Authorization: Bearer <admin_token>"
```

**Success Response** (200):
```json
{
  "success": true,
  "slow_requests": [
    {
      "id": "request-789",
      "timestamp": "2024-01-15T10:20:00Z",
      "endpoint": "/tools/slack/execute",
      "method": "POST",
      "duration_ms": 5420,
      "status_code": 200,
      "user_id": "user-456",
      "tool_name": "slack",
      "action_name": "send_message"
    }
  ],
  "total": 1,
  "threshold_ms": 3000,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

#### Get Security Alerts

Get recent security alerts for monitoring.

**Endpoint**: `GET /monitoring/security/alerts`  
**Authentication**: System Auth (Admin)  
**Organization Context**: None

**Query Parameters**:
- `limit` (integer, optional): Number of alerts to return (1-100, default: 20)

**Request Example**:
```bash
curl -X GET "https://api.modulex.com/monitoring/security/alerts?limit=25" \
  -H "Authorization: Bearer <admin_token>"
```

**Success Response** (200):
```json
{
  "success": true,
  "alerts": [
    {
      "id": "alert-456",
      "timestamp": "2024-01-15T10:15:00Z",
      "severity": "WARNING",
      "event_type": "AUTH_FAIL",
      "message": "Multiple failed login attempts from IP 192.168.1.50",
      "ip_address": "192.168.1.50",
      "user_id": null,
      "tool_name": null,
      "count": 5
    }
  ],
  "total": 1,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## Data Models

### User Model

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "johndoe",
  "email": "john@example.com",
  "role": "USER",
  "is_active": true,
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

### Organization Model

```json
{
  "id": "org-123",
  "slug": "acme-corp",
  "name": "ACME Corporation",
  "domain": "acme.com",
  "max_users": 100,
  "max_tools": 50,
  "is_active": true,
  "is_default": false,
  "settings": {},
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

### Tool Model

```json
{
  "name": "github",
  "display_name": "GitHub",
  "description": "GitHub integration for repositories",
  "version": "1.0.0",
  "author": "ModuleX Team",
  "categories": ["Development", "Version Control"],
  "logo": "https://github.com/favicon.ico",
  "app_url": "https://github.com",
  "auth_type": "oauth2",
  "is_authenticated": true,
  "is_active": true,
  "actions": [
    {
      "name": "list_repos",
      "description": "List repositories",
      "is_active": true,
      "parameters": {}
    }
  ]
}
```

### Authentication Result

```json
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john@example.com",
  "username": "johndoe",
  "role": "USER",
  "is_active": true,
  "organization_ids": ["org-123"],
  "primary_organization_id": "org-123",
  "current_organization_id": "org-123",
  "current_organization_role": "member",
  "auth_method": "jwt"
}
```

## Status Codes Reference

| Status Code | Description | Common Usage |
|-------------|-------------|--------------|
| 200 | OK | Successful GET, PUT, DELETE requests |
| 201 | Created | Successful POST requests that create resources |
| 400 | Bad Request | Invalid request parameters or body |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | Valid authentication but insufficient permissions |
| 404 | Not Found | Requested resource doesn't exist |
| 409 | Conflict | Resource already exists (e.g., duplicate email) |
| 422 | Unprocessable Entity | Request validation failed |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server-side error |
| 502 | Bad Gateway | External service unavailable |
| 503 | Service Unavailable | Service temporarily unavailable |

### HTTP Status Code Patterns

- **2xx Success**: Request was successful
- **4xx Client Error**: Error in the request from client
- **5xx Server Error**: Error occurred on server side

### Authentication Error Codes

- `401`: Token missing, invalid, or expired
- `403`: Valid token but insufficient permissions for the resource
- `403`: Organization access denied
- `403`: Admin role required

### Validation Error Codes

- `400`: Invalid request parameters
- `400`: Missing required fields
- `422`: Request body validation failed
- `409`: Resource conflict (duplicate email, slug, etc.)

---

*This documentation is for ModuleX API v0.1.2. For support or questions, please contact the development team.* 