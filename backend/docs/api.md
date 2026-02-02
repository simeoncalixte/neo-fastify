# API Reference

This document describes all available API endpoints.

## Base URL

```
http://localhost:3001
```

## Authentication

Currently, no authentication is required. Rate limiting is applied at 100 requests per minute.

---

## Root Endpoints

### GET /

Returns a welcome message and API version.

**Response:**
```json
{
  "success": true,
  "message": "Welcome to ShueApp Fastify API",
  "version": "0.0.1"
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "success": true,
  "message": "Fastify server is running",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 12345.678
}
```

---

## NEO Endpoints

All NEO endpoints are prefixed with `/neo` and include 5-minute response caching.

### GET /neo/feed

Retrieve NEO (Near Earth Object) data for a date range.

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `start_date` | string | Yes | Start date (YYYY-MM-DD) |
| `end_date` | string | Yes | End date (YYYY-MM-DD) |

**Example Request:**
```bash
curl "http://localhost:3001/neo/feed?start_date=2024-01-01&end_date=2024-01-07"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "links": {
      "self": "http://api.nasa.gov/neo/rest/v1/feed?..."
    },
    "element_count": 25,
    "near_earth_objects": {
      "2024-01-01": [
        {
          "id": "54016476",
          "name": "(2020 AV2)",
          "nasa_jpl_url": "https://ssd.jpl.nasa.gov/...",
          "absolute_magnitude_h": 26.9,
          "estimated_diameter": {...},
          "is_potentially_hazardous_asteroid": false,
          "close_approach_data": [...]
        }
      ]
    }
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "start_date and end_date are required"
}
```

---

### GET /neo/browse

Browse all Near Earth Objects with pagination.

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 0 | Page number (0-indexed) |
| `size` | integer | No | 20 | Items per page |

**Example Request:**
```bash
curl "http://localhost:3001/neo/browse?page=0&size=10"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "links": {
      "self": "http://api.nasa.gov/neo/rest/v1/neo/browse?..."
    },
    "page": {
      "size": 10,
      "total_elements": 35000,
      "total_pages": 3500,
      "number": 0
    },
    "near_earth_objects": [
      {
        "id": "2000433",
        "name": "433 Eros (A898 PA)",
        "designation": "433",
        "nasa_jpl_url": "https://ssd.jpl.nasa.gov/...",
        "absolute_magnitude_h": 10.31,
        "estimated_diameter": {...},
        "is_potentially_hazardous_asteroid": false,
        "orbital_data": {...}
      }
    ]
  }
}
```

**Error Response (502):**
```json
{
  "success": false,
  "message": "Failed to fetch NEO browse"
}
```

---

### GET /neo/lookup/:id

Get detailed information for a specific asteroid by ID.

**Path Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | Asteroid SPK-ID |

**Example Request:**
```bash
curl "http://localhost:3001/neo/lookup/2000433"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "links": {
      "self": "http://api.nasa.gov/neo/rest/v1/neo/2000433"
    },
    "id": "2000433",
    "neo_reference_id": "2000433",
    "name": "433 Eros (A898 PA)",
    "designation": "433",
    "nasa_jpl_url": "https://ssd.jpl.nasa.gov/...",
    "absolute_magnitude_h": 10.31,
    "estimated_diameter": {
      "kilometers": {
        "estimated_diameter_min": 22.0,
        "estimated_diameter_max": 49.0
      },
      "meters": {...},
      "miles": {...},
      "feet": {...}
    },
    "is_potentially_hazardous_asteroid": false,
    "close_approach_data": [...],
    "orbital_data": {
      "orbit_id": "659",
      "orbit_determination_date": "2021-05-24",
      "eccentricity": "0.2229",
      "semi_major_axis": "1.458",
      "inclination": "10.83",
      "orbital_period": "643.0",
      ...
    },
    "is_sentry_object": false
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "id must be a number"
}
```

**Error Response (502):**
```json
{
  "success": false,
  "message": "Failed to fetch NEO lookup"
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Description of the error"
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid or missing parameters |
| 404 | Not Found - Route doesn't exist |
| 429 | Too Many Requests - Rate limit exceeded |
| 502 | Bad Gateway - Upstream NASA API error |

---

## Rate Limiting

The API enforces rate limiting:

- **Limit:** 100 requests per minute
- **Window:** 1 minute sliding window

When exceeded, you'll receive a `429 Too Many Requests` response.

---

## Caching

All `/neo/*` endpoints cache successful responses for 5 minutes. The cache key is based on the full request URL including query parameters.

To get fresh data, wait for the cache TTL to expire or restart the server.

---

## Swagger Documentation

When the server is running, interactive API documentation is available at:

```
http://localhost:3001/documentation
```
