# RFQ Module Documentation

Complete Request for Quotation (RFQ) management module for VendorBridge ERP with full lifecycle management from creation to closure.

## File Structure

```
modules/rfqs/
├── rfq.controller.js    # Request handlers
├── rfq.service.js       # Business logic & database queries
├── rfq.routes.js        # Route definitions
├── rfq.validation.js    # Input validation rules
└── README.md           # This file
```

## Features Implemented

✅ **Create RFQ** - Create new RFQ with draft or published status  
✅ **Update RFQ** - Update RFQ details (draft only)  
✅ **Delete RFQ** - Soft delete RFQ (draft only)  
✅ **Get RFQ** - Retrieve single RFQ with all details  
✅ **Get All RFQs** - List RFQs with pagination, search, and filtering  
✅ **Get My RFQs** - List RFQs created by current user  
✅ **Search RFQs** - Search by title, description, category  
✅ **Filter RFQs** - Filter by status, category, date range  
✅ **Publish RFQ** - Change RFQ from DRAFT to PUBLISHED  
✅ **Close RFQ** - Close published RFQs  
✅ **Add RFQ Items** - Add line items to RFQ  
✅ **Delete RFQ Items** - Remove items from RFQ  
✅ **Assign Vendors** - Invite vendors to submit quotations  
✅ **Remove Vendors** - Remove vendors from RFQ  
✅ **Get RFQ Statistics** - View RFQ metrics and analytics  

## RFQ Lifecycle

```
DRAFT → PUBLISHED → CLOSED
   ↓
CANCELLED (optional)
```

**Status Descriptions:**
- **DRAFT** - RFQ is in draft state, can be edited or deleted
- **PUBLISHED** - RFQ is published and vendors can submit quotations
- **CLOSED** - RFQ is closed, no new quotations accepted
- **CANCELLED** - RFQ is cancelled (not used in this version)
- **AWARDED** - RFQ has been awarded (set after PO creation)

## API Endpoints

### Public Endpoints (No Authentication Required)

#### Get All RFQs
```http
GET /api/rfqs?page=1&limit=10&search=&status=PUBLISHED&category=&sortBy=createdAt&order=desc
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `search` - Search by title, description, or category
- `status` - Filter by status (DRAFT, PUBLISHED, CLOSED, CANCELLED, AWARDED)
- `category` - Filter by category
- `sortBy` - Sort by field (createdAt, deadline, budgetMin, budgetMax)
- `order` - Sort order (asc, desc)

**Response (200):**
```json
{
  "success": true,
  "message": "RFQs fetched successfully",
  "data": [
    {
      "id": "rfq-uuid",
      "title": "Office Supplies Procurement",
      "category": "Office Supplies",
      "description": "Need office supplies for Q2 2026",
      "status": "PUBLISHED",
      "deadline": "2026-07-06T23:59:59Z",
      "budgetMin": 5000,
      "budgetMax": 10000,
      "itemCount": 5,
      "vendorCount": 3,
      "quotationCount": 2,
      "createdById": "user-uuid",
      "createdBy": {
        "id": "user-uuid",
        "email": "buyer@company.com",
        "fullName": "John Buyer",
        "companyName": "ABC Corp"
      },
      "publishedAt": "2026-06-06T10:00:00Z",
      "createdAt": "2026-06-06T09:00:00Z",
      "updatedAt": "2026-06-06T10:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

#### Get RFQ By ID
```http
GET /api/rfqs/:rfqId
```

**Response (200):**
```json
{
  "success": true,
  "message": "RFQ fetched successfully",
  "data": {
    "id": "rfq-uuid",
    "title": "Office Supplies Procurement",
    "category": "Office Supplies",
    "description": "Detailed description of RFQ",
    "status": "PUBLISHED",
    "deadline": "2026-07-06T23:59:59Z",
    "budgetMin": 5000,
    "budgetMax": 10000,
    "deliveryLocation": "New York, NY",
    "preferredVendorTypes": ["Distributors", "Manufacturers"],
    "itemCount": 5,
    "vendorCount": 3,
    "quotationCount": 2,
    "createdById": "user-uuid",
    "publishedAt": "2026-06-06T10:00:00Z",
    "closedAt": null,
    "createdAt": "2026-06-06T09:00:00Z",
    "updatedAt": "2026-06-06T10:00:00Z",
    "createdBy": {
      "id": "user-uuid",
      "email": "buyer@company.com",
      "fullName": "John Buyer",
      "companyName": "ABC Corp",
      "role": "PROCUREMENT_OFFICER"
    },
    "RFQItems": [
      {
        "id": "item-uuid",
        "description": "A4 Paper 500 sheets",
        "quantity": 100,
        "unit": "boxes",
        "estimatedBudget": 1000,
        "specifications": "80gsm, white"
      }
    ],
    "RFQVendors": [
      {
        "id": "assignment-uuid",
        "status": "INVITED",
        "invitedAt": "2026-06-06T10:00:00Z",
        "respondedAt": null,
        "vendor": {
          "id": "vendor-uuid",
          "companyName": "Office Supplies Co",
          "email": "contact@office.com",
          "phone": "+1-555-0100",
          "contactPersonName": "Jane Vendor",
          "country": "USA",
          "status": "ACTIVE",
          "ratingScore": 4.5
        }
      }
    ],
    "Quotations": [
      {
        "id": "quotation-uuid",
        "vendorId": "vendor-uuid",
        "totalPrice": 7500,
        "status": "SUBMITTED",
        "submittedAt": "2026-06-06T12:00:00Z"
      }
    ]
  }
}
```

---

#### Get RFQ Items
```http
GET /api/rfqs/:rfqId/items
```

**Response (200):**
```json
{
  "success": true,
  "message": "5 items in this RFQ",
  "data": [
    {
      "id": "item-uuid",
      "description": "A4 Paper 500 sheets",
      "quantity": 100,
      "unit": "boxes",
      "estimatedBudget": 1000,
      "specifications": "80gsm, white",
      "createdAt": "2026-06-06T09:00:00Z"
    }
  ]
}
```

---

#### Get Assigned Vendors
```http
GET /api/rfqs/:rfqId/vendors
```

**Response (200):**
```json
{
  "success": true,
  "message": "3 vendors assigned to this RFQ",
  "data": [
    {
      "id": "assignment-uuid",
      "status": "INVITED",
      "invitedAt": "2026-06-06T10:00:00Z",
      "respondedAt": null,
      "vendor": {
        "id": "vendor-uuid",
        "companyName": "Office Supplies Co",
        "email": "contact@office.com",
        "phone": "+1-555-0100",
        "contactPersonName": "Jane Vendor",
        "country": "USA",
        "ratingScore": 4.5
      }
    }
  ]
}
```

---

#### Search RFQs
```http
GET /api/rfqs/search/:query?page=1&limit=10
```

**Path Parameters:**
- `query` - Search term (min 2 characters)

**Response (200):** Same as Get All RFQs

---

#### Filter RFQs by Status
```http
GET /api/rfqs/filter/status/:status?page=1&limit=10
```

**Path Parameters:**
- `status` - RFQ status (DRAFT, PUBLISHED, CLOSED, CANCELLED, AWARDED)

**Response (200):** Same as Get All RFQs

---

#### Get RFQ Statistics
```http
GET /api/rfqs/stats/summary
```

**Response (200):**
```json
{
  "success": true,
  "message": "RFQ statistics fetched successfully",
  "data": {
    "totalRFQs": 150,
    "publishedRFQs": 120,
    "draftRFQs": 20,
    "closedRFQs": 10,
    "totalVendorInvitations": 350
  }
}
```

---

### Protected Endpoints (Requires Authentication)

Add to all requests:
```http
Authorization: Bearer <accessToken>
```

#### Get My RFQs
```http
GET /api/rfqs/my?page=1&limit=10&status=&sortBy=createdAt&order=desc
Authorization: Bearer eyJhbGc...
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `status` - Filter by status (optional)
- `sortBy` - Sort by field (createdAt, deadline, etc.)
- `order` - Sort order (asc, desc)

**Response (200):** Same as Get All RFQs

---

#### Create RFQ
```http
POST /api/rfqs
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "title": "Office Supplies Procurement",
  "category": "Office Supplies",
  "description": "We need office supplies for Q2 2026 including paper, pens, and notebooks",
  "deadline": "2026-07-06T23:59:59Z",
  "budgetMin": 5000,
  "budgetMax": 10000,
  "deliveryLocation": "New York, NY",
  "preferredVendorTypes": ["Distributors", "Wholesalers"],
  "isDraft": true
}
```

**Request Fields:**
- `title` - RFQ title (5-255 chars, required)
- `category` - Category (2-100 chars, required)
- `description` - Detailed description (10-5000 chars, required)
- `deadline` - Response deadline (ISO8601, required, must be future date)
- `budgetMin` - Minimum budget (optional, positive number)
- `budgetMax` - Maximum budget (optional, must be >= budgetMin)
- `deliveryLocation` - Delivery location (optional, 2-255 chars)
- `preferredVendorTypes` - Array of preferred vendor types (optional)
- `isDraft` - Save as draft? (optional, default: true)

**Response (201):**
```json
{
  "success": true,
  "message": "RFQ created successfully with status: DRAFT",
  "data": {
    "id": "new-rfq-uuid",
    "title": "Office Supplies Procurement",
    "category": "Office Supplies",
    "description": "...",
    "status": "DRAFT",
    "deadline": "2026-07-06T23:59:59Z",
    "budgetMin": 5000,
    "budgetMax": 10000,
    "itemCount": 0,
    "vendorCount": 0,
    "quotationCount": 0,
    "createdAt": "2026-06-06T14:00:00Z"
  }
}
```

---

#### Add RFQ Items
```http
POST /api/rfqs/:rfqId/items
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "items": [
    {
      "description": "A4 Paper 500 sheets",
      "quantity": 100,
      "unit": "boxes",
      "estimatedBudget": 1000,
      "specifications": "80gsm, white"
    },
    {
      "description": "Blue Ballpoint Pens",
      "quantity": 500,
      "unit": "pieces",
      "estimatedBudget": 250
    }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "2 items added to RFQ successfully",
  "data": [
    {
      "id": "item-uuid-1",
      "rfqId": "rfq-uuid",
      "description": "A4 Paper 500 sheets",
      "quantity": 100,
      "unit": "boxes",
      "estimatedBudget": 1000,
      "specifications": "80gsm, white"
    }
  ]
}
```

---

#### Assign Vendors to RFQ
```http
POST /api/rfqs/:rfqId/vendors
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "vendorIds": [
    "vendor-uuid-1",
    "vendor-uuid-2",
    "vendor-uuid-3"
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "3 vendors assigned to RFQ successfully",
  "data": [
    {
      "id": "assignment-uuid",
      "rfqId": "rfq-uuid",
      "vendorId": "vendor-uuid-1",
      "status": "INVITED",
      "invitedAt": "2026-06-06T14:00:00Z",
      "vendor": {
        "id": "vendor-uuid-1",
        "companyName": "Office Supplies Co",
        "email": "contact@office.com"
      }
    }
  ]
}
```

---

#### Update RFQ
```http
PUT /api/rfqs/:rfqId
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "title": "Office Supplies Procurement Updated",
  "deadline": "2026-07-15T23:59:59Z",
  "budgetMax": 12000
}
```

**Note:** Can only update DRAFT RFQs. Published or closed RFQs cannot be modified.

**Response (200):**
```json
{
  "success": true,
  "message": "RFQ updated successfully",
  "data": {
    "id": "rfq-uuid",
    "title": "Office Supplies Procurement Updated",
    "deadline": "2026-07-15T23:59:59Z",
    "budgetMax": 12000,
    "status": "DRAFT",
    "updatedAt": "2026-06-06T15:00:00Z"
  }
}
```

---

#### Publish RFQ
```http
PATCH /api/rfqs/:rfqId/publish
Authorization: Bearer eyJhbGc...
```

**Requirements:**
- RFQ must be in DRAFT status
- RFQ must have at least one item
- RFQ must have at least one vendor assigned

**Response (200):**
```json
{
  "success": true,
  "message": "RFQ published successfully",
  "data": {
    "id": "rfq-uuid",
    "title": "Office Supplies Procurement",
    "status": "PUBLISHED",
    "publishedAt": "2026-06-06T15:00:00Z"
  }
}
```

---

#### Close RFQ
```http
PATCH /api/rfqs/:rfqId/close
Authorization: Bearer eyJhbGc...
```

**Requirements:**
- RFQ must be in PUBLISHED status

**Response (200):**
```json
{
  "success": true,
  "message": "RFQ closed successfully",
  "data": {
    "id": "rfq-uuid",
    "title": "Office Supplies Procurement",
    "status": "CLOSED",
    "closedAt": "2026-06-06T16:00:00Z"
  }
}
```

---

#### Update RFQ (DELETE RFQ Item)
```http
DELETE /api/rfqs/:rfqId/items/:itemId
Authorization: Bearer eyJhbGc...
```

**Response (200):**
```json
{
  "success": true,
  "message": "RFQ item deleted successfully"
}
```

---

#### Remove Vendor from RFQ
```http
DELETE /api/rfqs/:rfqId/vendors/:vendorId
Authorization: Bearer eyJhbGc...
```

**Response (200):**
```json
{
  "success": true,
  "message": "Vendor removed from RFQ successfully"
}
```

---

#### Delete RFQ
```http
DELETE /api/rfqs/:rfqId
Authorization: Bearer eyJhbGc...
```

**Note:** Can only delete DRAFT RFQs. Published or closed RFQs cannot be deleted.

**Response (200):**
```json
{
  "success": true,
  "message": "RFQ deleted successfully"
}
```

---

## Error Responses

### 400 - Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "title",
      "message": "Title must be between 5 and 255 characters"
    }
  ]
}
```

### 403 - Forbidden
```json
{
  "success": false,
  "message": "You do not have permission to update this RFQ"
}
```

### 404 - Not Found
```json
{
  "success": false,
  "message": "RFQ not found"
}
```

### 409 - Conflict
```json
{
  "success": false,
  "message": "Cannot update RFQ with status PUBLISHED"
}
```

---

## RFQ Fields

### Basic Information
- `id` - Unique identifier (UUID)
- `title` - RFQ title
- `category` - Category name
- `description` - Detailed description
- `status` - Current status (DRAFT, PUBLISHED, CLOSED, CANCELLED, AWARDED)

### Budget & Logistics
- `budgetMin` - Minimum budget amount
- `budgetMax` - Maximum budget amount
- `deliveryLocation` - Delivery address
- `preferredVendorTypes` - Array of preferred vendor types

### Counts
- `itemCount` - Number of RFQ items
- `vendorCount` - Number of assigned vendors
- `quotationCount` - Number of quotations received

### Dates
- `deadline` - Response deadline
- `publishedAt` - Publication timestamp
- `closedAt` - Closure timestamp
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp
- `deletedAt` - Soft delete timestamp (if deleted)

### Relations
- `createdBy` - User who created the RFQ
- `RFQItems` - Line items of the RFQ
- `RFQVendors` - Vendors assigned to RFQ
- `Quotations` - Quotations received

---

## Usage Examples

### JavaScript/Fetch

```javascript
// Get all published RFQs
const response = await fetch('http://localhost:5000/api/rfqs?status=PUBLISHED');
const data = await response.json();

// Search RFQs
const searchResult = await fetch('http://localhost:5000/api/rfqs/search/office');

// Get my RFQs
const myRFQs = await fetch('http://localhost:5000/api/rfqs/my', {
  headers: { 'Authorization': `Bearer ${accessToken}` }
});

// Create RFQ
const createResponse = await fetch('http://localhost:5000/api/rfqs', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    title: 'Office Supplies Procurement',
    category: 'Office Supplies',
    description: 'We need office supplies for Q2 2026',
    deadline: '2026-07-06T23:59:59Z',
    budgetMin: 5000,
    budgetMax: 10000,
    isDraft: true
  })
});

// Add items to RFQ
const addItemsResponse = await fetch(`http://localhost:5000/api/rfqs/${rfqId}/items`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    items: [
      {
        description: 'A4 Paper 500 sheets',
        quantity: 100,
        unit: 'boxes',
        estimatedBudget: 1000
      }
    ]
  })
});

// Assign vendors
const assignVendorsResponse = await fetch(`http://localhost:5000/api/rfqs/${rfqId}/vendors`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    vendorIds: ['vendor-uuid-1', 'vendor-uuid-2']
  })
});

// Publish RFQ
const publishResponse = await fetch(`http://localhost:5000/api/rfqs/${rfqId}/publish`, {
  method: 'PATCH',
  headers: { 'Authorization': `Bearer ${accessToken}` }
});
```

### cURL

```bash
# Get all published RFQs
curl "http://localhost:5000/api/rfqs?status=PUBLISHED"

# Get RFQ statistics
curl "http://localhost:5000/api/rfqs/stats/summary"

# Create RFQ
curl -X POST http://localhost:5000/api/rfqs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Office Supplies",
    "category": "Supplies",
    "description": "Office supplies needed for Q2 2026",
    "deadline": "2026-07-06T23:59:59Z",
    "budgetMin": 5000,
    "budgetMax": 10000
  }'

# Add items
curl -X POST http://localhost:5000/api/rfqs/rfq-uuid/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "items": [
      {
        "description": "A4 Paper",
        "quantity": 100,
        "unit": "boxes",
        "estimatedBudget": 1000
      }
    ]
  }'

# Assign vendors
curl -X POST http://localhost:5000/api/rfqs/rfq-uuid/vendors \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "vendorIds": ["vendor-uuid-1", "vendor-uuid-2"]
  }'

# Publish RFQ
curl -X PATCH http://localhost:5000/api/rfqs/rfq-uuid/publish \
  -H "Authorization: Bearer YOUR_TOKEN"

# Close RFQ
curl -X PATCH http://localhost:5000/api/rfqs/rfq-uuid/close \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Database Models Used

The RFQ module uses the following Prisma models:
- **RFQ** - Main RFQ table
- **RFQItem** - RFQ line items
- **RFQVendor** - Vendor assignments
- **User** - Creator user
- **Vendor** - Assigned vendors
- **Quotation** - Vendor quotations

---

## Integration

The RFQ module is now integrated in main routes:

```javascript
// src/routes/index.js
import rfqRoutes from '../modules/rfqs/rfq.routes.js';
router.use('/rfqs', rfqRoutes);
```

All endpoints are available under `/api/rfqs/`

---

## Authorization

**Permission Levels:**
- **Public**: Access to GET endpoints without authentication
- **Authenticated**: Access to create, update, delete own RFQs
- **Admin**: Full access to all RFQs and operations

**Authorization Rules:**
- Only creator or ADMIN can update RFQ
- Only creator or ADMIN can publish RFQ
- Only creator or ADMIN can close RFQ
- Only creator or ADMIN can delete RFQ (only if draft)
- Only creator or ADMIN can add items to RFQ
- Only creator or ADMIN can assign vendors to RFQ

---

## Future Enhancements

- [ ] RFQ attachments upload
- [ ] RFQ templates
- [ ] RFQ categories management
- [ ] Automated vendor notifications
- [ ] RFQ comparison dashboard
- [ ] Quotation evaluation workflow
- [ ] Bulk RFQ operations
- [ ] RFQ approval workflow
- [ ] Partial RFQ responses
- [ ] RFQ counter-offers

---

**Created**: June 6, 2026  
**Module**: RFQ Management  
**Version**: 1.0.0
