# API Endpoints Organization Integration Summary

Bu dosya, ModuleX Control Panel'ın hangi endpoint'lerin `organization_id` parametresi gerektirdiğini özetler.

## 🔐 Endpoint Kategorileri

### 1. USER AUTH (organization_id gerektirmez)
- `GET /auth/me` ✅ 
- `GET /auth/me/organizations` ✅
- `GET /auth/tools` ✅
- `PUT /auth/tools/{tool_name}/status` ✅
- `GET /auth/url/{tool_name}` ✅
- `POST /auth/manual` ✅

### 2. ORGANIZATION AUTH (organization_id gerektirir)
- `GET /tools/available` ✅ **Güncellenmiş**: `useAvailableTools()`
- `GET /tools/user` ✅ **Güncellenmiş**: `useInstalledTools()`
- `GET /tools/openai-tools` ✅ **Yeni eklendi**: `useOpenAITools()`
- `GET /integrations/available` ✅ **Yeni eklendi**: `useAvailableIntegrations()`
- `GET /integrations/installed` ✅ **Yeni eklendi**: `useInstalledIntegrations()`
- `GET /dashboard/stats` ✅
- `POST /tools/{tool_name}/execute` ✅ **Yeni eklendi**: `useExecuteTool()`

### 3. ORGANIZATION ADMIN (organization_id + admin role gerektirir)
- `POST /integrations/install` ✅
- `DELETE /integrations/{tool_name}` ✅ **Yeni eklendi**: `useUninstallTool()`
- `PUT /integrations/{tool_name}/config` ✅
- `GET /dashboard/logs` ✅
- `GET /dashboard/users` ✅

### 4. ANALYTICS (organization_id gerektirebilir - backend ile konfirme edilmeli)
- `GET /analytics/overview` ⚠️ **Kontrol edilmeli**
- `GET /analytics/users` ⚠️ **Kontrol edilmeli** 
- `GET /analytics/tools` ⚠️ **Kontrol edilmeli**
- `GET /analytics/performance` ⚠️ **Kontrol edilmeli**
- `GET /analytics/security` ⚠️ **Kontrol edilmeli**

## 🔄 Değişiklik Özeti

### ✅ Güncellenen Dosyalar:

1. **`src/lib/api-client.ts`**
   - Organization_id otomatik ekleme sistemi
   - Yeni endpoint'ler eklendi:
     - `getAvailableIntegrations()`
     - `getInstalledIntegrations()`
     - `getOpenAITools()`
     - `uninstallTool()`
     - `executeTool()`
     - `getUserTools()`
     - `updateUserToolStatus()`
     - `getOAuthUrl()`
     - `manualAuth()`

2. **`src/hooks/use-tools.ts`**
   - Yeni hook'lar eklendi:
     - `useAvailableIntegrations()`
     - `useInstalledIntegrations()`
     - `useOpenAITools()`
     - `useUninstallTool()`
     - `useExecuteTool()`
     - `useUserTools()`
     - `useUpdateUserToolStatus()`
     - `useGetOAuthUrl()`
     - `useManualAuth()`

3. **`src/app/dashboard/tools/page.tsx`**
   - `useAvailableTools()` → `useAvailableIntegrations()`
   - `useInstalledTools()` → `useInstalledIntegrations()`

## 🚀 API Client Organization System

API Client artık otomatik olarak organization_id ekliyor:

```javascript
// Organization gerektirenler
apiClient.getAvailableIntegrations() 
// → GET /integrations/available?organization_id=org-uuid

// Organization gerektirmeyenler  
apiClient.getUserOrganizations() 
// → GET /auth/me/organizations (no org_id)
```

### 🔧 Organization Store Integration

```javascript
// Organization seçimi
useOrganizationStore.getState().selectOrganization('org-uuid');

// API call'lar otomatik olarak seçili organization'ı kullanır
apiClient.getDashboardStats(); 
// → GET /dashboard/stats?organization_id=org-uuid
```

## ⚠️ Todo Items

1. **Analytics Endpoint'leri**: Backend ile konfirme et - organization_id gerekiyor mu?
2. **Tool Execution**: Test et - tool execution endpoint'i çalışıyor mu?
3. **Error Handling**: Organization seçili değilse API call'ları nasıl handle edilmeli?
4. **Cache Invalidation**: Organization değiştiğinde query cache'i temizlenmeli 