import API from "./axios";

// Auth
export const login = (data) => API.post("/api/auth/login", data);
export const register = (data) => API.post("/api/auth/register", data);

// Documents
export const uploadDocument = (formData) =>
  API.post("/api/documents/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const getMyDocuments = () => API.get("/api/documents/my");
export const getDocumentById = (id) => API.get(`/api/documents/${id}`);
export const deleteDocument = (id) => API.delete(`/api/documents/${id}`);

// Verifier
export const verifyDocument = (documentId, formData) =>
  API.post(`/api/verifier/verify/${documentId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const getAllDocumentsVerifier = () => API.get("/api/verifier/all-documents");
export const getMyVerificationLogs = () => API.get("/api/verifier/my-logs");

// Admin
export const getAdminStats = () => API.get("/api/admin/stats");
export const getAllUsers = () => API.get("/api/admin/users");
export const updateUserRole = (id, role) =>
  API.put(`/api/admin/users/${id}/role`, { role });
export const toggleUserStatus = (id) =>
  API.put(`/api/admin/users/${id}/toggle-status`);
export const getAllDocumentsAdmin = () => API.get("/api/admin/documents");
export const getAllVerificationLogs = () => API.get("/api/admin/verification-logs");
export const getAuditLogs = () => API.get("/api/admin/audit-logs");
export const getBlockchainStatus = () => API.get("/api/admin/blockchain/status");

// ── New feature APIs ──────────────────────────────────────────
export const uploadNewVersion = (docId, formData) =>
  API.post(`/api/documents/${docId}/new-version`, formData, { headers: { "Content-Type": "multipart/form-data" } });

export const batchUploadDocuments = (formData) =>
  API.post("/api/documents/batch", formData, { headers: { "Content-Type": "multipart/form-data" } });

export const getDocumentVersions = (docId) =>
  API.get(`/api/documents/${docId}/versions`);

export const getCertificateData = (docId) =>
  API.get(`/api/documents/${docId}/certificate`);

export const getQRCodeBase64 = (docId) =>
  API.get(`/api/qr/${docId}/base64`);
export const getMyTrustScore  = ()      => API.get("/api/trust/me");
export const getAllTrustScores = ()     => API.get("/api/trust/all");
