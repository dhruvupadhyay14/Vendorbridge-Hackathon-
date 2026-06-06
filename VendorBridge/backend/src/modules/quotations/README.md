# Quotation Module Documentation

Complete quotation management module for VendorBridge ERP with vendor bid submission, comparison engine, and scoring system.

## File Structure

```
modules/quotations/
├── quotation.controller.js         # Request handlers
├── quotation.service.js            # Business logic & database queries
├── quotationComparison.service.js  # Comparison engine with scoring
├── quotation.routes.js             # Route definitions
├── quotation.validation.js         # Input validation rules
└── README.md                       # This file
```

## Features Implemented

✅ **Submit Quotation** - Vendors submit bids to RFQs  
✅ **Save Draft** - Quotations can be saved as draft and updated later  
✅ **Edit Quotation** - Update draft quotations  
✅ **View Quotations** - Get all quotations with pagination  
✅ **Vendor Quotations** - Get quotations by vendor  
✅ **Quotation Items** - Manage line items with pricing  
✅ **Accept/Reject** - Buyer can accept or reject quotations  
✅ **Search & Filter** - Search by vendor/RFQ, filter by status  
✅ **Comparison Engine** - Analyze all quotations with scoring  
✅ **Performance Report** - Get statistics and metrics  
✅ **Quotation Statistics** - Aggregated quotation metrics  

## Quotation Lifecycle

```
DRAFT → SUBMITTED → ACCEPTED / REJECTED / EXPIRED
```

**Status Descriptions:**
- **DRAFT** - Quotation in progress, not submitted yet
- **SUBMITTED** - Quotation submitted and awaiting review
- **ACCEPTED** - Quotation accepted by buyer
- **REJECTED** - Quotation rejected by buyer
- **EXPIRED** - RFQ deadline passed

## Comparison Engine

The Quotation Comparison Engine analyzes all submitted quotations and provides intelligent recommendations using a composite scoring formula.

### Scoring Formula

**Composite Score = (Price Score × 40%) + (Delivery Score × 30%) + (Vendor Rating Score × 30%)**

- **Price Score (40% weight)** - Lower prices score higher
- **Delivery Score (30% weight)** - Faster delivery scores higher
- **Vendor Rating Score (30% weight)** - Higher ratings score higher

### Normalization

All metrics are normalized to a 0-100 scale:
- **Price**: Lowest price = 100, Highest price = 0 (inverted, lower is better)
- **Delivery**: Fastest delivery = 100, Slowest delivery = 0 (inverted, faster is better)
- **Vendor Rating**: Highest rating = 100, Lowest rating = 0 (direct, higher is better)

### Analysis Output

The comparison engine provides:
- Individual vendor scores broken down by metric
- Composite overall score combining all factors
- Winners in each category (lowest price, fastest delivery, highest rated)
- Top recommendation based on overall score
- Detailed performance report with averages and ranges

## API Endpoints

### Public Endpoints (No Authentication Required)

#### Get All Quotations
```http
GET /api/quotations?page=1&limit=10&status=SUBMITTED&sortBy=submittedAt&order=desc
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `status` - Filter by status (DRAFT, SUBMITTED, ACCEPTED, REJECTED, EXPIRED)
- `sortBy` - Sort by field (submittedAt, totalPrice, deliveryDays)
- `order` - Sort order (asc, desc)

**Response (200):**
```json
{
  "success": true,
  "message": "Quotations fetched successfully",
  "data": [
    {
      "id": "quotation-uuid",
      "rfqId": "rfq-uuid",
      "vendorId": "vendor-uuid",
      "status": "SUBMITTED",
      "totalPrice": 7500.00,
      "itemCount": 2,
      "deliveryDays": 10,
      "paymentTerms": "Net 30",
      "warranty": "1 year",
      "submittedAt": "2026-06-06T12:00:00Z",
      "acceptedAt": null,
      "rejectedAt": null,
      "vendor": {
        "id": "vendor-uuid",
        "companyName": "Best Supplies Co",
        "email": "sales@best.com",
        "ratingScore": 4.7
      },
      "RFQ": {
        "id": "rfq-uuid",
        "title": "Office Supplies Procurement"
      }
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

#### Get Quotation by ID
```http
GET /api/quotations/:quotationId
```

**Response (200):**
```json
{
  "success": true,
  "message": "Quotation fetched successfully",
  "data": {
    "id": "quotation-uuid",
    "rfqId": "rfq-uuid",
    "vendorId": "vendor-uuid",
    "status": "SUBMITTED",
    "totalPrice": 7500.00,
    "itemCount": 2,
    "deliveryDays": 10,
    "paymentTerms": "Net 30",
    "warranty": "1 year",
    "coverLetter": "We are pleased to submit our quotation...",
    "submittedAt": "2026-06-06T12:00:00Z",
    "acceptedAt": null,
    "rejectedAt": null,
    "createdAt": "2026-06-06T10:00:00Z",
    "updatedAt": "2026-06-06T12:00:00Z",
    "vendor": {
      "id": "vendor-uuid",
      "companyName": "Best Supplies Co",
      "email": "sales@best.com",
      "phone": "+1-555-0100",
      "contactPersonName": "John Seller",
      "country": "USA",
      "ratingScore": 4.7,
      "status": "ACTIVE"
    },
    "RFQ": {
      "id": "rfq-uuid",
      "title": "Office Supplies Procurement",
      "deadline": "2026-07-06T23:59:59Z",
      "status": "PUBLISHED"
    },
    "QuotationItems": [
      {
        "id": "item-uuid",
        "rfqItemId": "rfq-item-uuid",
        "quotedPrice": 1000.00,
        "quantity": 100,
        "deliveryDays": 10,
        "notes": "Bulk discount applied"
      }
    ]
  }
}
```

---

#### Get RFQ Quotations
```http
GET /api/quotations/rfqs/:rfqId?page=1&limit=100&status=SUBMITTED
```

**Response (200):** Array of quotations for the RFQ

---

#### Get Vendor Quotations
```http
GET /api/quotations/vendor/:vendorId?page=1&limit=10&status=SUBMITTED
```

**Response (200):** Quotations submitted by the vendor

---

#### Search Quotations
```http
GET /api/quotations/search/:query?page=1&limit=10
```

**Path Parameters:**
- `query` - Search term (vendor name or RFQ title)

---

#### Filter by Status
```http
GET /api/quotations/filter/status/:status?page=1&limit=10
```

**Path Parameters:**
- `status` - DRAFT, SUBMITTED, ACCEPTED, REJECTED, EXPIRED

---

#### Get Quotation Statistics
```http
GET /api/quotations/stats/summary
```

**Response (200):**
```json
{
  "success": true,
  "message": "Quotation statistics fetched successfully",
  "data": {
    "totalQuotations": 250,
    "submittedQuotations": 200,
    "draftQuotations": 30,
    "acceptedQuotations": 15,
    "rejectedQuotations": 5
  }
}
```

---

### Comparison Engine Endpoints (Public)

#### Analyze Quotations (Comparison Engine)
```http
GET /api/quotations/rfqs/:rfqId/analysis
```

**Response (200):**
```json
{
  "success": true,
  "message": "Quotation analysis completed successfully",
  "data": {
    "rfqId": "rfq-uuid",
    "quotationCount": 5,
    "analysis": {
      "totalMetrics": [
        {
          "quotationId": "q1-uuid",
          "vendorId": "v1-uuid",
          "companyName": "Best Supplies",
          "email": "sales@best.com",
          "phone": "+1-555-0100",
          "price": 7500.00,
          "deliveryDays": 10,
          "vendorRating": 4.7,
          "priceScore": 85.5,
          "deliveryScore": 90.0,
          "ratingScore": 94.0,
          "compositeScore": 89.75,
          "rank": 1
        },
        {
          "quotationId": "q2-uuid",
          "vendorId": "v2-uuid",
          "companyName": "Quick Suppliers",
          "email": "info@quick.com",
          "phone": "+1-555-0101",
          "price": 7200.00,
          "deliveryDays": 5,
          "vendorRating": 4.5,
          "priceScore": 95.0,
          "deliveryScore": 100.0,
          "ratingScore": 90.0,
          "compositeScore": 93.5,
          "rank": 2
        }
      ],
      "winners": {
        "lowestPrice": {
          "quotationId": "q2-uuid",
          "vendorId": "v2-uuid",
          "companyName": "Quick Suppliers",
          "price": 7200.00,
          "savings": "Lowest cost option"
        },
        "fastestDelivery": {
          "quotationId": "q2-uuid",
          "vendorId": "v2-uuid",
          "companyName": "Quick Suppliers",
          "deliveryDays": 5,
          "advantage": "Fastest delivery timeline"
        },
        "highestRated": {
          "quotationId": "q1-uuid",
          "vendorId": "v1-uuid",
          "companyName": "Best Supplies",
          "rating": 4.7,
          "advantage": "Best vendor reputation"
        }
      }
    },
    "recommendation": {
      "quotationId": "q1-uuid",
      "vendorId": "v1-uuid",
      "companyName": "Best Supplies",
      "email": "sales@best.com",
      "phone": "+1-555-0100",
      "price": 7500.00,
      "deliveryDays": 10,
      "vendorRating": 4.7,
      "compositeScore": 89.75,
      "scoreBreakdown": {
        "price": 34.2,
        "delivery": 27.0,
        "rating": 28.2
      },
      "reason": "Recommended based on composite scoring: 40% price (34.2), 30% delivery speed (27.0), 30% vendor rating (28.2)"
    }
  }
}
```

---

#### Get Top Quotations
```http
GET /api/quotations/rfqs/:rfqId/top?limit=5
```

**Response (200):**
```json
{
  "success": true,
  "message": "Top 5 quotations fetched successfully",
  "data": [
    {
      "quotationId": "q1-uuid",
      "vendorId": "v1-uuid",
      "companyName": "Best Supplies",
      "price": 7500.00,
      "deliveryDays": 10,
      "vendorRating": 4.7,
      "compositeScore": 89.75,
      "rank": 1
    }
  ]
}
```

---

#### Get Category Winner
```http
GET /api/quotations/rfqs/:rfqId/winner/:category
```

**Path Parameters:**
- `category` - price, delivery, or rating

**Response (200):**
```json
{
  "success": true,
  "message": "price category winner determined",
  "data": {
    "category": "price",
    "winner": {
      "quotationId": "q2-uuid",
      "vendorId": "v2-uuid",
      "companyName": "Quick Suppliers",
      "price": 7200.00,
      "savings": "Lowest cost option"
    }
  }
}
```

---

#### Get Performance Report
```http
GET /api/quotations/rfqs/:rfqId/report
```

**Response (200):**
```json
{
  "success": true,
  "message": "Performance report generated successfully",
  "data": {
    "rfqId": "rfq-uuid",
    "summary": {
      "totalQuotations": 5,
      "averagePrice": 7400.00,
      "averageDeliveryDays": 9.4,
      "averageVendorRating": 4.5,
      "averageCompositeScore": 85.3
    },
    "range": {
      "priceRange": {
        "min": 7200.00,
        "max": 8000.00,
        "difference": 800.00,
        "percentDifference": 11.11
      },
      "deliveryRange": {
        "min": 5,
        "max": 15,
        "difference": 10
      },
      "ratingRange": {
        "min": 4.2,
        "max": 4.8
      }
    },
    "topVendors": [
      {
        "quotationId": "q1-uuid",
        "vendorId": "v1-uuid",
        "companyName": "Best Supplies",
        "price": 7500.00,
        "compositeScore": 89.75
      }
    ],
    "bottomVendors": [
      {
        "quotationId": "q5-uuid",
        "vendorId": "v5-uuid",
        "companyName": "Budget Vendors",
        "price": 8000.00,
        "compositeScore": 75.5
      }
    ]
  }
}
```

---

### Protected Endpoints (Requires Authentication)

#### Submit Quotation
```http
POST /api/quotations/rfqs/:rfqId
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "vendorId": "vendor-uuid",
  "items": [
    {
      "rfqItemId": "rfq-item-uuid-1",
      "quotedPrice": 1000.00,
      "quantity": 100,
      "deliveryDays": 10,
      "notes": "Bulk discount applied"
    },
    {
      "rfqItemId": "rfq-item-uuid-2",
      "quotedPrice": 6500.00,
      "quantity": 50,
      "deliveryDays": 10
    }
  ],
  "coverLetter": "We are pleased to submit our quotation for your consideration. We offer competitive pricing and timely delivery.",
  "deliveryDays": 10,
  "paymentTerms": "Net 30",
  "warranty": "1 year",
  "isDraft": false
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Quotation submitted successfully",
  "data": {
    "id": "quotation-uuid",
    "rfqId": "rfq-uuid",
    "vendorId": "vendor-uuid",
    "status": "SUBMITTED",
    "totalPrice": 7500.00,
    "itemCount": 2,
    "deliveryDays": 10,
    "submittedAt": "2026-06-06T14:00:00Z",
    "createdAt": "2026-06-06T14:00:00Z"
  }
}
```

---

#### Update Quotation
```http
PUT /api/quotations/:quotationId
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "items": [
    {
      "rfqItemId": "rfq-item-uuid-1",
      "quotedPrice": 950.00,
      "quantity": 100,
      "deliveryDays": 9
    }
  ],
  "deliveryDays": 9,
  "paymentTerms": "Net 45"
}
```

**Note:** Can only update draft quotations. Submitted quotations must be resubmitted.

---

#### Submit Draft Quotation
```http
PATCH /api/quotations/:quotationId/submit
Authorization: Bearer eyJhbGc...
```

**Response (200):**
```json
{
  "success": true,
  "message": "Quotation submitted successfully",
  "data": {
    "id": "quotation-uuid",
    "status": "SUBMITTED",
    "submittedAt": "2026-06-06T14:30:00Z"
  }
}
```

---

#### Accept Quotation
```http
PATCH /api/quotations/:quotationId/accept
Authorization: Bearer eyJhbGc...
```

**Response (200):**
```json
{
  "success": true,
  "message": "Quotation accepted successfully",
  "data": {
    "id": "quotation-uuid",
    "status": "ACCEPTED",
    "acceptedAt": "2026-06-06T15:00:00Z"
  }
}
```

---

#### Reject Quotation
```http
PATCH /api/quotations/:quotationId/reject
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "reason": "Price exceeds budget allocation"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Quotation rejected successfully",
  "data": {
    "id": "quotation-uuid",
    "status": "REJECTED",
    "rejectionReason": "Price exceeds budget allocation",
    "rejectedAt": "2026-06-06T15:00:00Z"
  }
}
```

---

#### Compare Two Quotations
```http
POST /api/quotations/compare
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "quotationId1": "q1-uuid",
  "quotationId2": "q2-uuid"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Quotations compared successfully",
  "data": {
    "comparison": {
      "quotation1": {
        "companyName": "Best Supplies",
        "price": 7500.00,
        "deliveryDays": 10,
        "vendorRating": 4.7,
        "compositeScore": 89.75,
        "priceScore": 85.5,
        "deliveryScore": 90.0,
        "ratingScore": 94.0
      },
      "quotation2": {
        "companyName": "Quick Suppliers",
        "price": 7200.00,
        "deliveryDays": 5,
        "vendorRating": 4.5,
        "compositeScore": 93.5,
        "priceScore": 95.0,
        "deliveryScore": 100.0,
        "ratingScore": 90.0
      },
      "winner": "Quick Suppliers"
    }
  }
}
```

---

#### Delete Quotation (Draft Only)
```http
DELETE /api/quotations/:quotationId
Authorization: Bearer eyJhbGc...
```

**Response (200):**
```json
{
  "success": true,
  "message": "Quotation deleted successfully"
}
```

---

## Comparison Engine Scoring Example

**Example with 3 quotations:**

| Vendor | Price | Delivery | Rating | Price Score | Delivery Score | Rating Score | Composite Score |
|--------|-------|----------|--------|-------------|----------------|--------------|-----------------|
| A | $7,500 | 10 days | 4.7 | 85.5 | 90.0 | 94.0 | (85.5×0.4) + (90.0×0.3) + (94.0×0.3) = **89.75** |
| B | $7,200 | 5 days | 4.5 | 95.0 | 100.0 | 90.0 | (95.0×0.4) + (100.0×0.3) + (90.0×0.3) = **93.5** |
| C | $8,000 | 15 days | 4.2 | 62.5 | 70.0 | 84.0 | (62.5×0.4) + (70.0×0.3) + (84.0×0.3) = **71.25** |

**Recommendation: Vendor B** with composite score of **93.5** (best overall balance of price, delivery, and vendor rating)

---

## Database Models Used

The quotation module uses the following Prisma models:
- **Quotation** - Main quotation table
- **QuotationItem** - Line items with pricing
- **RFQ** - Related RFQ
- **Vendor** - Vendor information
- **RFQItem** - Related RFQ items

---

## Integration

The quotation module is now integrated in main routes:

```javascript
// src/routes/index.js
import quotationRoutes from '../modules/quotations/quotation.routes.js';
router.use('/quotations', quotationRoutes);
```

All endpoints are available under `/api/quotations/`

---

## Authorization

**Permission Levels:**
- **Public**: Access to GET and analysis endpoints without authentication
- **Vendors**: Can submit their own quotations, update drafts, view their quotations
- **Buyers**: Can view all quotations, accept/reject, access comparison engine
- **Admin**: Full access to all quotations and operations

---

## Usage Examples

### JavaScript/Fetch

```javascript
// Submit quotation
const submitResponse = await fetch('http://localhost:5000/api/quotations/rfqs/rfq-uuid', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${vendorToken}`
  },
  body: JSON.stringify({
    vendorId: 'vendor-uuid',
    items: [
      {
        rfqItemId: 'rfq-item-uuid',
        quotedPrice: 1000,
        quantity: 100,
        deliveryDays: 10
      }
    ],
    deliveryDays: 10,
    paymentTerms: 'Net 30',
    isDraft: false
  })
});

// Get analysis for RFQ
const analysisResponse = await fetch(
  'http://localhost:5000/api/quotations/rfqs/rfq-uuid/analysis'
);

// Get top quotations
const topResponse = await fetch(
  'http://localhost:5000/api/quotations/rfqs/rfq-uuid/top?limit=5'
);

// Get category winner
const winnerResponse = await fetch(
  'http://localhost:5000/api/quotations/rfqs/rfq-uuid/winner/price'
);

// Get performance report
const reportResponse = await fetch(
  'http://localhost:5000/api/quotations/rfqs/rfq-uuid/report'
);

// Accept quotation
const acceptResponse = await fetch(
  'http://localhost:5000/api/quotations/quotation-uuid/accept',
  {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${buyerToken}` }
  }
);
```

### cURL

```bash
# Submit quotation
curl -X POST http://localhost:5000/api/quotations/rfqs/rfq-uuid \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VENDOR_TOKEN" \
  -d '{
    "vendorId": "vendor-uuid",
    "items": [
      {
        "rfqItemId": "rfq-item-uuid",
        "quotedPrice": 1000,
        "quantity": 100,
        "deliveryDays": 10
      }
    ],
    "deliveryDays": 10,
    "paymentTerms": "Net 30",
    "isDraft": false
  }'

# Get analysis
curl http://localhost:5000/api/quotations/rfqs/rfq-uuid/analysis

# Get performance report
curl http://localhost:5000/api/quotations/rfqs/rfq-uuid/report
```

---

## Future Enhancements

- [ ] Quotation validity period management
- [ ] Escalation clauses for price adjustments
- [ ] Multi-currency support
- [ ] Quotation templates
- [ ] Bulk quotation submission
- [ ] Counter-offer functionality
- [ ] Quotation amendment workflow
- [ ] Historical quotation comparison
- [ ] Price trend analysis
- [ ] Export to PDF/Excel

---

**Created**: June 6, 2026  
**Module**: Quotation Management  
**Version**: 1.0.0
