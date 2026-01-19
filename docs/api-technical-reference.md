## Car Rental Platform API – Technical Reference (v1)

This document summarizes the backend API discovered from `GET http://localhost:3000/docs-json`.  
All endpoints are prefixed with `/api/v1` and return JSON.

- **Base URL**: `https://{backend-host}/api/v1`
- **Auth scheme**: `JWT-auth` (HTTP `Authorization: Bearer <token>`)

---

## Authentication & Authorization

### Admin Authentication (`Admin Auth`)

#### Initialize Super Admin
- **POST** `/auth/admin/init-super-admin`
- **Auth**: **No JWT**, requires `INIT_SECRET` header (see backend config).
- **Body**: `InitSuperAdminV1Dto`
  - `email: string`
  - `password: string`
  - `firstName: string`
  - `lastName: string`
- **Responses**
  - `201` – Super admin created (`AdminInitSuperAdminResponseDto`)
  - `400` – Invalid input
  - `401` – Invalid `INIT_SECRET` or super admin already exists
- **Notes**
  - Can be called **only once** when there are no admins.
  - Must be run in a secure environment.

#### Admin Login
- **POST** `/auth/admin/login`
- **Auth**: none
- **Body**: `LoginV1Dto`
  - `email: string`
  - `password: string`
- **Responses**
  - `200` – `AdminLoginResponseWrapperDto`
    - If 2FA disabled: returns full access JWT.
    - If 2FA enabled: returns **temporary JWT** (`requires2FA: true`) valid for a short time.
  - `401` – Invalid credentials
- **Notes**
  - When `requires2FA=true`, client must call `/auth/admin/verify-2fa` with the **temp** token.

#### Verify Admin 2FA
- **POST** `/auth/admin/verify-2fa`
- **Auth**: `Authorization: Bearer <temporary-jwt-from-login>`
- **Body**: `Verify2FAV1Dto`
  - `code: string` (TOTP or backup code)
- **Responses**
  - `200` – `AdminLoginResponseWrapperDto` (full access JWT)
  - `400` – Invalid code / too many attempts
  - `401` – Invalid TOTP/backup code or expired temp token
  - `404` – Admin not found

#### Enroll Admin 2FA (TOTP)
- **POST** `/auth/admin/2fa/enroll`
- **Auth**: `Authorization: Bearer <admin-access-token>`
- **Body**: `Enroll2FAV1Dto` (typically empty or minimal)
- **Responses**
  - `201` – `Enroll2FAResponseWrapperDto` (otpauth URL + backup codes)
  - `400` – Invalid input
  - `401` – Missing/invalid JWT
  - `409` – 2FA already enrolled
- **Notes**
  - Backup codes are returned **once**; store securely.
  - Must be confirmed via `/auth/admin/2fa/enable`.

#### Enable Admin 2FA
- **POST** `/auth/admin/2fa/enable`
- **Auth**: `Authorization: Bearer <admin-access-token>`
- **Body**: `Enable2FAV1Dto`
  - `totpCode: string`
- **Responses**
  - `200` – `MessageResponseWrapperDto`
  - `400` – Invalid TOTP or enrollment not started
  - `401`, `404` – Auth/user errors

#### Regenerate 2FA Backup Codes
- **POST** `/auth/admin/2fa/backup-codes/regenerate`
- **Auth**: `Authorization: Bearer <admin-access-token>`
- **Body**: `RegenerateBackupCodesV1Dto`
  - Includes a TOTP code to re‑authenticate.
- **Responses**
  - `200` – `BackupCodesResponseWrapperDto`
  - `400`, `401`, `404` – Invalid TOTP / not enabled / not found

#### Admin Forgot / Reset Password
- **POST** `/auth/admin/forgot-password`
  - **Auth**: none
  - **Body**: `ForgotPasswordV1Dto` (`email: string`)
  - **Response**: `200` – `AdminForgotPasswordResponseWrapperDto`
- **POST** `/auth/admin/verify-otp`
  - **Body**: `VerifyOtpV1Dto` (`email: string`, `otp: string`)
  - **Responses**: `200` – `AdminVerifyOtpResponseWrapperDto` (reset token), `400`, `404`
- **POST** `/auth/admin/reset-password`
  - **Body**: `ResetPasswordV1Dto` (`resetToken: string`, `newPassword: string`)
  - **Responses**: `200` – `AdminResetPasswordResponseWrapperDto`, `400`

#### Admin Profile & Logout
- **GET** `/auth/admin/profile`
  - **Auth**: JWT
  - **Response**: `AdminProfileResponseWrapperDto`
- **POST** `/auth/admin/logout`
  - **Auth**: JWT (also sent explicitly as `authorization` header param)
  - **Response**: `MessageResponseWrapperDto`

**Example – Admin login + 2FA**

```http
POST /api/v1/auth/admin/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "SecurePassword123!"
}
```

```json
{
  "requires2FA": true,
  "token": "<temporary-jwt>",
  "admin": { "id": "...", "email": "admin@example.com" }
}
```

```http
POST /api/v1/auth/admin/verify-2fa
Authorization: Bearer <temporary-jwt>
Content-Type: application/json

{ "code": "123456" }
```

```json
{
  "requires2FA": false,
  "token": "<access-jwt>",
  "admin": { "id": "...", "email": "admin@example.com" }
}
```

---

### User (Customer) Authentication (`User Auth`)

#### Register
- **POST** `/auth/user/register`
- **Auth**: none
- **Body**: `RegisterV1Dto`
  - `email: string`
  - `password: string`
  - `firstName: string`
  - `lastName: string`
  - `phoneNumber: string`
  - `cityId?: string`
- **Responses**
  - `201` – `UserRegisterResponseWrapperDto`
  - `400` – Invalid data or city not found
  - `409` – Email already in use

#### Login
- **POST** `/auth/user/login`
- **Body**: `LoginV1Dto` (`email`, `password`)
- **Responses**
  - `200` – `UserLoginResponseWrapperDto` (access JWT)
  - `401` – Invalid credentials / inactive account

#### Forgot / Reset Password
- **POST** `/auth/user/forgot-password`
  - **Body**: `ForgotPasswordV1Dto`
  - **Response**: `UserForgotPasswordResponseWrapperDto`
- **POST** `/auth/user/verify-otp`
  - **Body**: `VerifyOtpV1Dto`
  - **Response**: `UserVerifyOtpResponseWrapperDto` (reset token)
- **POST** `/auth/user/reset-password`
  - **Body**: `ResetPasswordV1Dto`
  - **Response**: `UserResetPasswordResponseWrapperDto`

#### Profile & Logout
- **GET** `/auth/user/profile`
  - **Auth**: JWT
  - **Response**: `UserProfileResponseWrapperDto`
- **POST** `/auth/user/logout`
  - **Auth**: JWT + `authorization` header param
  - **Response**: `UserMessageResponseWrapperDto`

**Example – User login**

```http
POST /api/v1/auth/user/login
Content-Type: application/json

{
  "email": "customer@example.com",
  "password": "Password123!"
}
```

```json
{
  "token": "<access-jwt>",
  "user": { "id": "...", "email": "customer@example.com" }
}
```

---

## Admin Management

All Admin Management endpoints require **admin JWT** (`JWT-auth`) unless explicitly noted.

### Addon Pricing Models (`Admin Management - Addon Pricing Models`)

#### Create addon pricing model
- **POST** `/addon-pricing-models`
- **Body**: `CreateAddonPricingModelV1Dto`
  - `name: string`
  - `serviceType: "DRIVER" | "BODYGUARD"`
  - `description?: string`
  - `pricing: { [tier in "HOURLY" | "DAILY" | "WEEKLY" | "MONTHLY"]?: { amount: number; currency: string } }`
  - `displayOrder?: number`
- **Responses**
  - `201` – Created
  - `409` – Duplicate name per service type

#### List addon pricing models
- **GET** `/addon-pricing-models`
- **Query**
  - `page?: number = 1`
  - `limit?: number = 10`
  - `serviceType?: "DRIVER" | "BODYGUARD"`
  - `isActive?: boolean`
  - `search?: string` (name or description)
- **Response**: 200 – paginated list

#### Get / Update / Toggle status
- **GET** `/addon-pricing-models/{id}`
- **PATCH** `/addon-pricing-models/{id}`
  - **Body**: `UpdateAddonPricingModelV1Dto` (same shape as create, all optional)
- **PATCH** `/addon-pricing-models/{id}/toggle-status`
- **Path params**
  - `id: string`

---

### Admins (`Admin Management - Admins`)

- **POST** `/admins`
  - **Body**: `CreateAdminV1Dto`
    - `email: string`
    - `password: string`
    - `firstName: string`
    - `lastName: string`
    - `role?: "SUPER_ADMIN" | "ADMIN"` (default `ADMIN`)
  - **Responses**: `201`, `409` (email exists)

- **GET** `/admins`
  - **Query**
    - `page?: number = 1`
    - `limit?: number = 10`
    - `role?: "SUPER_ADMIN" | "ADMIN"`
    - `isActive?: boolean`
    - `search?: string`

- **GET / PATCH** `/admins/{id}`
  - **Path**: `id: string`
  - **Body (PATCH)**: `UpdateAdminV1Dto` (email/password/firstName/lastName/role)
  - **Errors**: `404` not found, `409` email in use

- **PATCH** `/admins/{id}/toggle-status`
  - Toggles active/inactive.

---

### Agents (`Admin Management - Agents`)

- **POST** `/agents`
  - **Body**: `CreateAgentV1Dto`
    - `email, password, firstName, lastName: string`
    - `phoneNumber: string`
    - `companyName?: string`
    - `businessLicense?: string`
    - `applicationStatus?: "PENDING" | "APPROVED" | "REJECTED" | "REAPPLY_AVAILABLE"`
  - **Responses**: `201`, `409` (email/phone exists)

- **GET** `/agents`
  - **Query**
    - Common pagination `page`, `limit`
    - `applicationStatus?: enum`
    - `isActive?: boolean`
    - `search?: string`
    - `companyName?: string`

- **GET / PATCH** `/agents/{id}`
  - **Path**: `id: string`
  - **Body (PATCH)**: `UpdateAgentV1Dto` (similar to create)

- **PATCH** `/agents/{id}/toggle-status`

---

### Bodyguards (`Admin Management - Bodyguards`)

- **POST** `/bodyguards`
  - **Body**: `CreateBodyguardV1Dto`
    - Credentials + personal info
    - `cities: string[]` (city IDs, required)
    - `licenseNumber?: string`
    - `yearsOfExperience?: number`
    - `securityLevel?: "BASIC" | "STANDARD" | "PREMIUM"`
    - `teamMembers?: TeamMemberDto[]`
    - `pricingModelId: string` (must be active BODYGUARD model)
    - `applicationStatus?: enum`
    - `availabilityStatus?: "ONLINE" | "OFFLINE"`
  - **Responses**: `201`, `400` invalid pricing tier, `409` email/phone exists

- **GET** `/bodyguards`
  - **Query**: pagination + `applicationStatus`, `availabilityStatus`, `securityLevel`, `isActive`, `search`

- **GET / PATCH** `/bodyguards/{id}`
  - **Path**: `id: string`
  - **Body (PATCH)**: `UpdateBodyguardV1Dto`

- **PATCH** `/bodyguards/{id}/toggle-status`

---

### Drivers (`Admin Management - Drivers`)

- **POST** `/drivers`
  - **Body**: `CreateDriverV1Dto`
    - Similar to bodyguards but driver‑specific fields (vehicle type, etc.).
  - **Responses**: `201`, `409` (email/phone)

- **GET** `/drivers`
  - **Query**: pagination + `applicationStatus`, `availabilityStatus`, `isActive`, `search`, `vehicleType?: string`

- **GET / PATCH** `/drivers/{id}`
  - **Path**: `id: string`
  - **Body (PATCH)**: `UpdateDriverV1Dto`

- **PATCH** `/drivers/{id}/toggle-status`

---

### Vehicles (`Admin Management - Vehicles`)

- **POST** `/vehicles`
  - **Body**: `CreateVehicleV1Dto`
    - Agent + city references
    - Make/model/year
    - `vehicleType: enum` (`SEDAN`, `SUV`, `HATCHBACK`, `VAN`, `TRUCK`, `LUXURY`, `ELECTRIC`, `CONVERTIBLE`, `PICKUP`)
    - `luxuryClass?: "STANDARD" | "PREMIUM" | "LUXURY" | "ELITE"`
    - `fuelType: "PETROL" | "DIESEL" | "HYBRID" | "ELECTRIC" | "CNG" | "LPG"`
    - Availability & pricing info.
  - **Responses**
    - `201` – Created
    - `400` – Invalid input
    - `404` – Agent or city not found

- **GET** `/vehicles`
  - **Query**
    - Pagination `page`, `limit`
    - `agent?: string`
    - `city?: string`
    - `status?: "PENDING_APPROVAL" | "APPROVED" | "REJECTED" | "INACTIVE"`
    - `vehicleType?: enum`
    - `luxuryClass?: enum`
    - `fuelType?: enum`
    - `isAvailable?: boolean`
    - `search?: string`

- **GET / PATCH** `/vehicles/{id}`
  - **Path**: `id: string`
  - **Body (PATCH)**: `UpdateVehicleV1Dto`

- **PATCH** `/vehicles/{id}/toggle-status`
- **PATCH** `/vehicles/{id}/approve`
- **PATCH** `/vehicles/{id}/reject`
  - **Body**: `{ "reason": string }`

---

### Cities (`Admin Management - Cities`)

- **POST** `/cities`
  - **Body**: `CreateCityV1Dto`
    - `name: string`
    - `country: string`
    - `countryCode: string`
  - **Responses**: `201`, `409` duplicate (name + country code)

- **GET** `/cities`
  - **Query**
    - `page?: number`
    - `limit?: number`
    - `isActive?: boolean`
    - `country?: string`
    - `countryCode?: string`
    - `search?: string`

- **GET / PATCH** `/cities/{id}`
  - **Path**: `id: string`
  - **Body (PATCH)**: `UpdateCityV1Dto`
  - **Responses**: `200`, `404`, `409` duplicate

- **PATCH** `/cities/{id}/toggle-status`

---

### Platform Bookings (Admin) (`Admin Management - Bookings`)

All endpoints below use **admin JWT** and act on **all bookings in the platform**.

- **GET** `/bookings`
  - **Query**
    - `page?: number = 1`
    - `limit?: number = 10` (max 50)
    - `bookingType?: "VEHICLE" | "DRIVER" | "BODYGUARD"`
    - `status?: "PENDING_AGENT_APPROVAL" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED_BY_USER" | "CANCELLED_BY_AGENT" | "CANCELLED_BY_ADMIN" | "REFUND_PENDING" | "REFUNDED"`
    - `customer?: string`
    - `agent?: string`
    - `city?: string`
    - `startDate?: ISO string`
    - `endDate?: ISO string`

- **GET / PATCH** `/bookings/{id}`
  - **GET** – Returns `BookingDetailResponseV1Dto`
  - **PATCH** – Reschedule booking
    - **Body**: `UpdateBookingV1Dto` (new start/end dates)
    - **Errors**: `400` invalid dates, `409` conflicts

- **GET** `/bookings/{id}/summary`
  - Summary with cost breakdown (`BookingSummaryV1Dto`).

- **POST** `/bookings/{id}/reassign-driver`
  - **Path**: `id` – child driver booking ID
  - **Body**: `ReassignDriverV1Dto` (new driver + dates)
  - **Notes**: Cancels existing driver sub‑booking and creates a new one; used only for child driver bookings.

- **POST** `/bookings/{id}/cancel`
  - **Body**: `CancelBookingAdminV1Dto` (reason, optional notes)
  - **Refund rules**
    - System calculates refund automatically using booking time, cancellation time and internal policy.
    - Cancelling a parent booking cancels all child bookings.
    - Resulting status may be `REFUND_PENDING` (requires approval).

- **PATCH** `/bookings/{id}/adjust-refund`
  - **Body**: `AdjustRefundV1Dto` (`amount: number`, optional reason)
  - **Notes**: Refund type is derived from amount:
    - `FULL` – equals total paid
    - `PARTIAL` – between 0 and total
    - `NONE` – zero

- **POST** `/bookings/{id}/approve-refund`
  - Approves a pending refund, sets status to `REFUNDED`, records approving admin.

**Admin refund/cancellation flow**
1. User or admin cancels booking → auto refund is computed.
2. If needed, admin adjusts with `/adjust-refund`.
3. Finance/ops confirms via `/approve-refund`.

---

## User Booking APIs (`User Management - Booking`)

These endpoints are for **customers** and require a **user JWT**.

### Create bookings

- **POST** `/booking/vehicle-with-services`
  - Create root booking + vehicle and optional driver/bodyguard.
  - **Body**: `CreateVehicleWithServicesBookingV1Dto`
    - `vehicleId: string`
    - `cityId: string`
    - `startDate, endDate: ISO string`
    - `withDriver?: { driverId?: string, ... }`
    - `withBodyguard?: { bodyguardId?: string, ... }`
  - **Errors**
    - `400` – invalid dates
    - `404` – vehicle/driver/bodyguard/city not found
    - `409` – resource not available for the period

- **POST** `/booking/driver`
  - Standalone driver booking.
  - **Body**: `CreateDriverBookingV1Dto` (driverId, cityId, start/end).

- **POST** `/booking/bodyguard`
  - Standalone bodyguard booking.
  - **Body**: `CreateBodyguardBookingV1Dto`.

All three return `201` with `BookingSummaryV1Dto`.

### Booking details & policies

- **GET** `/booking/{bookingId}/summary`
  - Summary (root booking, child services, cost breakdown).

- **GET** `/booking/{bookingId}/cancellation-policy`
  - Returns `CancellationPolicyV1Dto`:
    - Time‑based refund tiers (e.g., >24h full, 24–4h partial, <4h none).
    - Penalty rules per service if applicable.

### Upcoming & history

- **GET** `/booking/upcoming`
- **GET** `/booking/history`
- **Query (both)**:
  - `page?: number = 1`
  - `limit?: number = 10` (max 50)
  - `bookingType?: "VEHICLE" | "DRIVER" | "BODYGUARD"`
  - `status?: BookingStatus` (history only)
  - `startDate?: ISO string`
  - `endDate?: ISO string`

### Cancel booking (user)

- **POST** `/booking/{bookingId}/cancel`
- **Body**: `CancelBookingV1Dto`
  - Includes reason and optional notes.
- **Behaviour**
  - Allowed only within configured cancellation windows.
  - System auto‑calculates refund based on:
    - Time before start
    - Service types
    - Internal cancellation policy
  - May set booking to `REFUND_PENDING` waiting for admin approval.

### Refund status

- **GET** `/booking/{bookingId}/refund-status`
- **Response**: `RefundStatusV1ResponseDto`
  - `status: "PENDING" | "APPROVED" | "REJECTED"`
  - `type: "FULL" | "PARTIAL" | "NONE"`
  - `amount: number`

**Example – User cancel flow**

```http
POST /api/v1/booking/123/cancel
Authorization: Bearer <user-jwt>
Content-Type: application/json

{ "reason": "Change of plans" }
```

```json
{
  "bookingId": "123",
  "status": "CANCELLED_BY_USER",
  "refund": {
    "type": "PARTIAL",
    "amount": 80
  }
}
```

---

## User Search APIs (`User Management - Search`)

All search endpoints require **user JWT** and are read‑only.

### Vehicle search

- **GET** `/search/vehicles`
- **Query (required)**
  - `city: string` (city ID)
  - `startDate: string (ISO date-time)`
  - `endDate: string (ISO date-time)`
  - `pricingType: PricingType` (e.g., `HOURLY`, `DAILY`, `WEEKLY`, `MONTHLY`)
- **Query (optional)**
  - `minPrice?: number`
  - `maxPrice?: number`
  - `seatingCapacity?: number`
  - `fuelType?: FuelType`
  - `luxuryClass?: LuxuryClass`
  - `page?: number = 1`
  - `limit?: number = 10`
- **Response**: `VehicleSearchResponseDto`

- **GET** `/search/vehicles/{id}`
  - **Path**: `id: string` (vehicle ID)
  - **Response**: `VehicleDetailResponseDto`

### Driver search

- **GET** `/search/drivers`
- **Query (required)**
  - `city: string`
  - `startDate: string (ISO)`
  - `endDate: string (ISO)`
  - `pricingType: PricingType`
- **Query (optional)**
  - `minPrice?: number`
  - `maxPrice?: number`
  - `vehicleType?: string`
  - `page?: number = 1`
  - `limit?: number = 10`
- **Response**: `DriverSearchResponseDto`

- **GET** `/search/drivers/{id}`
  - **Response**: `DriverDetailResponseDto`

### Bodyguard search

- **GET** `/search/bodyguards`
- **Query (required)**
  - `city: string`
  - `startDate: string (ISO)`
  - `endDate: string (ISO)`
  - `pricingType: PricingType`
- **Query (optional)**
  - `minPrice?: number`
  - `maxPrice?: number`
  - `minExperience?: number`
  - `securityLevel?: SecurityLevel` (`BASIC | STANDARD | PREMIUM`)
  - `page?: number = 1`
  - `limit?: number = 10`
- **Response**: `BodyguardSearchResponseDto`

- **GET** `/search/bodyguards/{id}`
  - **Path**: `id: string`
  - **Response**: `BodyguardDetailResponseDto`

---

## Common Models & Types (high level)

### Pricing & enums

- **PricingItemDto**
  - `type: "HOURLY" | "DAILY" | "WEEKLY" | "MONTHLY"`
  - `amount: number`
  - `currency: string` (default `"USD"`)

- **PricingType** – same enum as above.
- **FuelType** – `PETROL | DIESEL | HYBRID | ELECTRIC | CNG | LPG`
- **LuxuryClass** – `STANDARD | PREMIUM | LUXURY | ELITE`
- **SecurityLevel** – `BASIC | STANDARD | PREMIUM`

### Booking DTOs

- **BookingSummaryV1Dto**
  - Root booking info
  - Linked services (vehicle, driver, bodyguard)
  - Totals per service type (subtotals, taxes, discounts, final amount).

- **CancellationPolicyV1Dto**
  - Time windows with:
    - `thresholdHours: number`
    - `refundPercent: number`
    - `description: string`

- **RefundStatusV1ResponseDto**
  - `status: "PENDING" | "APPROVED" | "REJECTED"`
  - `type: "FULL" | "PARTIAL" | "NONE"`
  - `amount: number`

---

## Implementation Notes & Best Practices

- **Authentication**
  - Always send `Authorization: Bearer <jwt>` for any secured endpoint.
  - Admin and user tokens are distinct; don’t mix them.

- **Pagination**
  - Standard pattern: `page` (1‑based), `limit` (default 10, often max 50).
  - Most list endpoints respond with meta fields (`total`, `page`, `limit`) together with `items`.

- **Date handling**
  - All dates are ISO 8601 strings in UTC.
  - For search and bookings, always provide consistent `startDate` < `endDate`.

- **Refund & cancellation logic**
  - Auto‑refund based on:
    - Time difference between cancellation and booking start.
    - Internal policy thresholds (exposed via `/booking/{bookingId}/cancellation-policy`).
  - Admin can override amount (`/bookings/{id}/adjust-refund`) and must approve (`/bookings/{id}/approve-refund`) when status is `REFUND_PENDING`.

- **Idempotency & conflicts**
  - Many create/update endpoints can return `409` for conflicts:
    - Duplicate emails/phones
    - Resource already approved/rejected
    - Booking conflicts with other bookings or unavailability.
  - Frontend should handle `409` with clear user messaging and re‑fetch when needed.

- **Next steps for implementation**
  - Create typed client wrappers per module (Auth, Search, Booking, Admin).
  - Centralize axios/fetch instance with:
    - Base URL
    - JWT injection
    - 401/403 handling and refresh/redirect to login.

