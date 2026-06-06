// API documentation for VendorBridge Backend

## VendorBridge API Endpoints

Base URL: `http://localhost:5000/api`

### Authentication Flow

```
POST /auth/register        → Create account
POST /auth/login           → Get JWT token
POST /auth/refresh-token   → Refresh token
POST /auth/logout          → Logout
```

### Health & Status

```
GET  /health               → Server health check
GET  /status               → API status
GET  /info                 → API information
```

### User Management

```
GET    /users              → List all users (ADMIN only)
GET    /users/:userId      → Get user details
PUT    /users/:userId      → Update user profile
DELETE /users/:userId      → Delete user (ADMIN only)
POST   /users/change-password → Change password
GET    /profile            → Get current user profile
```

### Vendor Management

```
GET    /vendors            → List all vendors
POST   /vendors            → Create vendor profile
GET    /vendors/:vendorId  → Get vendor details
PUT    /vendors/:vendorId  → Update vendor (VENDOR only)
DELETE /vendors/:vendorId  → Delete vendor (ADMIN only)
PUT    /vendors/:vendorId/status → Change status (ADMIN only)
GET    /vendors/:vendorId/products → Get vendor products
GET    /vendors/:vendorId/orders    → Get vendor orders
GET    /vendors/:vendorId/reviews   → Get vendor reviews
POST   /vendors/:vendorId/reviews   → Add vendor review
```

### Products Management

```
GET    /products           → List all products
POST   /products           → Create product (VENDOR only)
GET    /products/:productId → Get product details
PUT    /products/:productId → Update product (VENDOR only)
DELETE /products/:productId → Delete product (VENDOR only)
```

### Purchase Orders

```
GET    /orders             → List purchase orders
POST   /orders             → Create purchase order
GET    /orders/:orderId    → Get order details
PUT    /orders/:orderId    → Update order (PROCUREMENT_OFFICER)
DELETE /orders/:orderId    → Cancel order
POST   /orders/:orderId/approve → Approve order (PROCUREMENT_OFFICER)
POST   /orders/:orderId/reject  → Reject order (PROCUREMENT_OFFICER)
GET    /orders/:orderId/items   → Get order items
POST   /orders/:orderId/items   → Add items to order
```

### Invoices & Payments

```
GET    /invoices           → List invoices
GET    /invoices/:invoiceId → Get invoice details
POST   /invoices/:invoiceId/pay   → Record payment
GET    /payments           → List payments
GET    /payments/:paymentId → Get payment details
```

### Audit Logs

```
GET    /audit-logs         → List audit logs (ADMIN only)
GET    /audit-logs/user/:userId → Get user activity (ADMIN only)
```

---

## Standard Response Format

### Success Response (200, 201)
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* requested data */ },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### Error Response (400, 401, 403, 404, 500)
```json
{
  "success": false,
  "message": "Error description",
  "details": { /* error details */ },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### Paginated Response
```json
{
  "success": true,
  "message": "Data fetched successfully",
  "data": [ /* array of items */ ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

---

## Authentication

Include JWT token in request header:
```
Authorization: Bearer <token>
```

---

## Role-Based Access

| Role | Permissions |
|------|-------------|
| ADMIN | Full system access |
| VENDOR | Manage own profile, products, and orders |
| PROCUREMENT_OFFICER | Create and manage purchase orders |
| FINANCE_MANAGER | Manage invoices and payments |
| VIEWER | Read-only access |

---

## Common Query Parameters

```
?page=1              → Pagination page (default: 1)
?limit=10            → Items per page (default: 10)
?sort=name           → Sort field
?order=asc           → Sort order (asc/desc)
?search=query        → Search query
?filter=status:active → Filter by field:value
```

---

## Error Codes

| Code | Status | Meaning |
|------|--------|---------|
| 200 | OK | Request successful |
| 201 | Created | Resource created |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | No permission |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 500 | Server Error | Internal error |

---

## File Upload

Upload files using multipart/form-data:
```
POST /upload
Content-Type: multipart/form-data

file: <binary>
```

Supported file types:
- Images: jpg, jpeg, png, gif, webp
- Documents: pdf, doc, docx, xls, xlsx

Max file size: 50MB

---

## Rate Limiting

Rate limits per endpoint:
- Auth endpoints: 5 requests/minute
- User endpoints: 30 requests/minute
- Other endpoints: 60 requests/minute

---

## Webhook Events

Subscribe to webhook events:
```
POST /webhooks/subscribe
{
  "event": "order.created",
  "url": "https://your-app.com/webhooks"
}
```

Available events:
- order.created
- order.approved
- order.rejected
- invoice.created
- payment.received
- vendor.approved
- vendor.rejected

