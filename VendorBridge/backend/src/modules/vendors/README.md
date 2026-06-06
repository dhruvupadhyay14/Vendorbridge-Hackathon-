# Vendor Module Documentation

Complete vendor management module for VendorBridge ERP with CRUD operations, search, filtering, and pagination.

## File Structure

```
modules/vendors/
├── vendor.controller.js    # Request handlers
├── vendor.service.js       # Business logic & database queries
├── vendor.routes.js        # Route definitions
├── vendor.validation.js    # Input validation rules
└── README.md              # This file
```

## Features Implemented

✅ **Create Vendor** - Register new vendor with validation  
✅ **Get All Vendors** - List vendors with pagination, search, and filtering  
✅ **Get Vendor Details** - Retrieve single vendor with all information  
✅ **Update Vendor** - Update vendor information  
✅ **Delete Vendor** - Soft delete vendor (data retention)  
✅ **Search Vendors** - Search by company name, email, or contact  
✅ **Filter Vendors** - Filter by status, country, city  
✅ **Vendor Status Management** - Approve, reject, suspend vendors  
✅ **Vendor Statistics** - Get vendor metrics and analytics  

## API Endpoints

### Public Endpoints (No Authentication Required)

#### Get All Vendors
```http
GET /api/vendors?page=1&limit=10&search=&status=ACTIVE&country=&sortBy=createdAt&order=desc
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `search` - Search by company name, email, or contact person
- `status` - Filter by status (PENDING, APPROVED, REJECTED, ACTIVE, SUSPENDED, INACTIVE)
- `country` - Filter by country
- `sortBy` - Sort by field (createdAt, updatedAt, companyName, ratingScore, totalSpent)
- `order` - Sort order (asc, desc)

**Response (200):**
```json
{
  "success": true,
  "message": "Vendors fetched successfully",
  "data": [
    {
      "id": "vendor-uuid",
      "companyName": "ABC Supplies Inc",
      "email": "contact@abc.com",
      "phone": "+1-555-0100",
      "country": "USA",
      "status": "ACTIVE",
      "ratingScore": 4.5,
      "totalPurchaseOrders": 25,
      "totalSpent": 150000.00,
      "createdAt": "2026-06-06T10:00:00Z"
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

#### Get Vendor By ID
```http
GET /api/vendors/:vendorId
```

**Response (200):**
```json
{
  "success": true,
  "message": "Vendor fetched successfully",
  "data": {
    "id": "vendor-uuid",
    "companyName": "ABC Supplies Inc",
    "registrationNumber": "REG-2024-001",
    "taxId": "TAX123456",
    "email": "contact@abc.com",
    "phone": "+1-555-0100",
    "website": "https://abc.com",
    "contactPersonName": "John Smith",
    "contactPersonEmail": "john@abc.com",
    "contactPersonPhone": "+1-555-0101",
    "street": "123 Business St",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "postalCode": "10001",
    "status": "ACTIVE",
    "ratingScore": 4.5,
    "totalPurchaseOrders": 25,
    "totalSpent": 150000.00,
    "onTimeDeliveryRate": 95.5,
    "qualityScore": 4.3,
    "companyLogo": "https://example.com/logo.png",
    "createdAt": "2026-06-06T10:00:00Z",
    "updatedAt": "2026-06-06T12:00:00Z"
  }
}
```

---

#### Search Vendors
```http
GET /api/vendors/search/:query?page=1&limit=10
```

**Path Parameters:**
- `query` - Search term (min 2 characters, searches company name, email, contact person)

**Response (200):**
```json
{
  "success": true,
  "message": "Search completed",
  "data": [
    {
      "id": "vendor-uuid",
      "companyName": "ABC Supplies Inc",
      "email": "contact@abc.com",
      "phone": "+1-555-0100",
      "country": "USA",
      "status": "ACTIVE",
      "ratingScore": 4.5
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "pages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

---

#### Get Vendors By Status
```http
GET /api/vendors/filter/status/:status?page=1&limit=10
```

**Path Parameters:**
- `status` - PENDING, APPROVED, REJECTED, ACTIVE, SUSPENDED, INACTIVE

**Response (200):** Same as Get All Vendors

---

#### Get Vendor Statistics
```http
GET /api/vendors/stats/summary
```

**Response (200):**
```json
{
  "success": true,
  "message": "Vendor statistics fetched successfully",
  "data": {
    "totalVendors": 150,
    "activeVendors": 120,
    "approvedVendors": 140,
    "pendingVendors": 10,
    "suspendedVendors": 5,
    "averageRating": 4.2,
    "topRatedVendors": [
      {
        "id": "vendor-uuid",
        "companyName": "Top Supplier",
        "ratingScore": 4.8,
        "status": "ACTIVE"
      }
    ]
  }
}
```

---

### Protected Endpoints (Requires Authentication)

Add to all requests:
```http
Authorization: Bearer <accessToken>
```

#### Create Vendor
```http
POST /api/vendors
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "companyName": "ABC Supplies Inc",
  "registrationNumber": "REG-2024-001",
  "taxId": "TAX123456",
  "email": "contact@abc.com",
  "phone": "+1-555-0100",
  "website": "https://abc.com",
  "contactPersonName": "John Smith",
  "contactPersonEmail": "john@abc.com",
  "contactPersonPhone": "+1-555-0101",
  "street": "123 Business St",
  "city": "New York",
  "state": "NY",
  "country": "USA",
  "postalCode": "10001",
  "gstNumber": "GST123456789"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Vendor created successfully",
  "data": {
    "id": "new-vendor-uuid",
    "companyName": "ABC Supplies Inc",
    "email": "contact@abc.com",
    "phone": "+1-555-0100",
    "status": "PENDING",
    "createdAt": "2026-06-06T14:00:00Z"
  }
}
```

**Validation Rules:**
- ✓ companyName: 2-255 chars (required)
- ✓ registrationNumber: 0-100 chars (optional)
- ✓ taxId: 0-100 chars (optional)
- ✓ gstNumber: 0-50 chars (optional)
- ✓ email: Valid format, unique (required)
- ✓ phone: Valid phone format (required)
- ✓ website: Valid URL (optional)
- ✓ contactPersonName: 2-255 chars (required)
- ✓ contactPersonEmail: Valid email format (required)
- ✓ contactPersonPhone: Valid phone format (required)
- ✓ street: 1-255 chars (required)
- ✓ city: 1-100 chars (required)
- ✓ state: 1-100 chars (required)
- ✓ country: 1-100 chars (required)
- ✓ postalCode: 1-20 chars (required)

---

#### Update Vendor
```http
PUT /api/vendors/:vendorId
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "companyName": "ABC Supplies Inc Updated",
  "phone": "+1-555-0102",
  "website": "https://newabc.com",
  "contactPersonName": "Jane Smith",
  "contactPersonEmail": "jane@abc.com",
  "contactPersonPhone": "+1-555-0103",
  "street": "456 Business Ave",
  "city": "Boston",
  "state": "MA",
  "country": "USA",
  "postalCode": "02101",
  "companyLogo": "https://example.com/new-logo.png"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Vendor updated successfully",
  "data": {
    "id": "vendor-uuid",
    "companyName": "ABC Supplies Inc Updated",
    "email": "contact@abc.com",
    "phone": "+1-555-0102",
    "status": "PENDING",
    "updatedAt": "2026-06-06T15:00:00Z"
  }
}
```

**Authorization:**
- Vendor owner can update their own profile
- ADMIN can update any vendor

---

#### Delete Vendor
```http
DELETE /api/vendors/:vendorId
Authorization: Bearer eyJhbGc...
```

**Response (200):**
```json
{
  "success": true,
  "message": "Vendor deleted successfully"
}
```

**Authorization:**
- Only ADMIN can delete vendors

---

#### Update Vendor Status
```http
PATCH /api/vendors/:vendorId/status
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "status": "APPROVED"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Vendor status updated successfully",
  "data": {
    "id": "vendor-uuid",
    "companyName": "ABC Supplies Inc",
    "status": "APPROVED",
    "updatedAt": "2026-06-06T16:00:00Z"
  }
}
```

**Valid Status Values:**
- PENDING - New vendor, awaiting approval
- APPROVED - Application approved
- REJECTED - Application rejected
- ACTIVE - Active vendor
- SUSPENDED - Temporarily suspended
- INACTIVE - Disabled vendor

**Authorization:**
- Only ADMIN can update vendor status

---

## Error Responses

### 400 - Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    }
  ]
}
```

### 404 - Not Found
```json
{
  "success": false,
  "message": "Vendor not found"
}
```

### 401 - Unauthorized
```json
{
  "success": false,
  "message": "You do not have permission to update this vendor"
}
```

### 409 - Conflict
```json
{
  "success": false,
  "message": "Vendor with this email already exists"
}
```

---

## Vendor Fields

### Basic Information
- `id` - Unique identifier (UUID)
- `companyName` - Company name (unique)
- `registrationNumber` - Company registration number
- `taxId` - Tax identification number
- `gstNumber` - GST registration number
- `email` - Company email (unique)
- `phone` - Company phone number
- `website` - Company website URL
- `companyLogo` - Company logo URL

### Contact Information
- `contactPersonName` - Primary contact person name
- `contactPersonEmail` - Contact person email
- `contactPersonPhone` - Contact person phone

### Address
- `street` - Street address
- `city` - City
- `state` - State/Province
- `country` - Country
- `postalCode` - Postal/ZIP code

### Business Information
- `status` - Vendor status (PENDING, APPROVED, etc.)
- `ratingScore` - Vendor rating (0-5)
- `onTimeDeliveryRate` - On-time delivery percentage
- `qualityScore` - Quality score (0-5)
- `totalRFQs` - Total RFQs sent to vendor
- `totalQuotations` - Total quotations received
- `totalPurchaseOrders` - Total purchase orders
- `totalSpent` - Total amount spent with vendor

### Metadata
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp
- `deletedAt` - Soft delete timestamp (if deleted)

---

## Search & Filtering

### Search Functionality
Searches across multiple fields:
- Company name
- Email address
- Contact person name
- City
- Country

**Example:**
```
GET /api/vendors/search/ABC?page=1&limit=20
```

### Filter Options
- **By Status**: Get vendors in specific status
- **By Country**: Filter by country
- **By City**: Filter by city
- **By Rating**: Filter by minimum rating score

**Example:**
```
GET /api/vendors?status=ACTIVE&country=USA&sortBy=ratingScore&order=desc
```

### Sorting Options
- `createdAt` - Sort by creation date
- `updatedAt` - Sort by update date
- `companyName` - Sort by company name
- `ratingScore` - Sort by rating
- `totalSpent` - Sort by total amount spent

---

## Pagination

**Default:**
- Page: 1
- Limit: 10
- Max limit: 100

**Example:**
```
GET /api/vendors?page=2&limit=20
```

**Response Metadata:**
```json
{
  "meta": {
    "page": 2,
    "limit": 20,
    "total": 150,
    "pages": 8,
    "hasNextPage": true,
    "hasPrevPage": true
  }
}
```

---

## Usage Examples

### JavaScript/Fetch

```javascript
// Get all vendors
const response = await fetch('http://localhost:5000/api/vendors?status=ACTIVE');
const data = await response.json();

// Search vendors
const searchResult = await fetch('http://localhost:5000/api/vendors/search/ABC?limit=20');

// Get vendor details
const vendorResponse = await fetch('http://localhost:5000/api/vendors/vendor-uuid');

// Create vendor (with auth)
const createResponse = await fetch('http://localhost:5000/api/vendors', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    companyName: 'ABC Supplies',
    email: 'contact@abc.com',
    phone: '+1-555-0100',
    contactPersonName: 'John Smith',
    contactPersonEmail: 'john@abc.com',
    contactPersonPhone: '+1-555-0101',
    street: '123 Business St',
    city: 'New York',
    state: 'NY',
    country: 'USA',
    postalCode: '10001'
  })
});

// Update vendor
const updateResponse = await fetch('http://localhost:5000/api/vendors/vendor-uuid', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    companyName: 'ABC Supplies Updated',
    phone: '+1-555-0102'
  })
});

// Update status (admin only)
const statusResponse = await fetch('http://localhost:5000/api/vendors/vendor-uuid/status', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`
  },
  body: JSON.stringify({
    status: 'APPROVED'
  })
});
```

### cURL

```bash
# Get all active vendors
curl "http://localhost:5000/api/vendors?status=ACTIVE"

# Search vendors
curl "http://localhost:5000/api/vendors/search/ABC?page=1&limit=20"

# Get vendor details
curl "http://localhost:5000/api/vendors/vendor-uuid"

# Get vendor statistics
curl "http://localhost:5000/api/vendors/stats/summary"

# Create vendor
curl -X POST http://localhost:5000/api/vendors \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "companyName": "ABC Supplies Inc",
    "email": "contact@abc.com",
    "phone": "+1-555-0100",
    "contactPersonName": "John Smith",
    "contactPersonEmail": "john@abc.com",
    "contactPersonPhone": "+1-555-0101",
    "street": "123 Business St",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "postalCode": "10001"
  }'

# Update vendor
curl -X PUT http://localhost:5000/api/vendors/vendor-uuid \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "companyName": "ABC Supplies Inc Updated",
    "phone": "+1-555-0102"
  }'

# Update vendor status (admin only)
curl -X PATCH http://localhost:5000/api/vendors/vendor-uuid/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "status": "APPROVED"
  }'

# Delete vendor (admin only)
curl -X DELETE http://localhost:5000/api/vendors/vendor-uuid \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## Database Models Used

The vendor module uses the following Prisma models:
- **Vendor** - Main vendor table
- **User** - Related user profiles
- **RFQVendor** - RFQ vendor relationships
- **Quotation** - Vendor quotations
- **PurchaseOrder** - Vendor purchase orders
- **Invoice** - Vendor invoices

---

## Integration

The vendor module is already integrated in main routes:

```javascript
// src/routes/index.js
import vendorRoutes from '../modules/vendors/vendor.routes.js';
router.use('/vendors', vendorRoutes);
```

All endpoints are available under `/api/vendors/`

---

## Future Enhancements

- [ ] Vendor document upload (license, certificate)
- [ ] Vendor performance ratings
- [ ] Vendor communication history
- [ ] Bulk vendor import/export
- [ ] Vendor categories and sub-categories
- [ ] Vendor location mapping
- [ ] Vendor compliance tracking
- [ ] Vendor contract management
- [ ] Vendor communication templates

---

**Created**: June 6, 2026  
**Module**: Vendor Management  
**Version**: 1.0.0
