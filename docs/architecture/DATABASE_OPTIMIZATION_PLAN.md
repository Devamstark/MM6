# Database Optimization Plan

**Current State:**
- ❌ Missing indexes on frequently queried foreign keys
- ❌ No composite indexes for analytics queries
- ❌ N+1 queries in API endpoints
- ❌ Unoptimized analytics queries
- ❌ No pagination limits on large datasets
- ❌ Missing indexes on status/filter fields

**Risk:** As data grows (orders, marketing logs, products), queries will become exponentially slower.

---

## 🏗️ 1. Indexing Strategy

### Foreign Key Indexing
While Django generates indexes for `ForeignKey` fields by default, we need to verify and explicitly set `db_index=True` on other frequently queried fields, and ensure explicit indexing on fields holding large reference IDs. Focus areas:
- `OrderItem.order` & `OrderItem.product`
- `EmailDeliveryLog.campaign` & `EmailDeliveryLog.user`
- `Review.product`

### Status and Filter Fields Indexing
Add indexes to fields that are constantly used in `WHERE` clauses for filtering or status checks on large tables:
- `Order.status`
- `Product.category` / `Product.subcategory`
- `MarketingCampaign.status`
- `EmailDeliveryLog.status`
- `Coupon.is_active`

### Composite Indexes (Analytics)
Add composite indexes for complex analytical queries using `Meta.indexes` and `models.Index(fields=...)` to prevent full table scans when sorting and filtering on multiple columns simultaneously:
- **Orders**: `models.Index(fields=['created_at', 'status'])` to speed up timestamp-based status aggregations.
- **Delivery Logs**: `models.Index(fields=['campaign', 'status'])` to quickly calculate campaign performance metrics without scanning all logs.
- **Conversions**: `models.Index(fields=['campaign', 'converted_at'])` to optimize time-based conversion graphs.

---

## 🚀 2. Resolving N+1 Queries

Audit and refactor all API `ViewSet`s and serializers to utilize `select_related()` and `prefetch_related()`.

- **`select_related()`** for forward (single) foreign key relationships (SQL JOIN):
  - Use in: `Product.seller`, `Order.user`, `EmailDeliveryLog.user`
- **`prefetch_related()`** for reverse foreign key (many-to-many or one-to-many) relationships (Separate query stitched in Python):
  - Use in: `Order.items` (`OrderItem`), `Product.reviews`

**Key Endpoints to Optimize:**
- `ProductViewSet`: Add `.select_related('seller', 'category')`. If fetching reviews inline, add `.prefetch_related('reviews')`.
- `OrderViewSet`: Add `.prefetch_related('items__product')` to avoid N+1 per order item.
- `AdminDashboard`: Ensure user lists and analytics endpoints use `.values()` or `select_related()` correctly to avoid iterating over un-prefetched relations.

---

## 📊 3. Optimizing Analytics Queries

- Current aggregation queries might be calculating values in python loops or inefficient DB hits.
- Utilize Django's `aggregate()` and `annotate()` at the database level directly.
- **SQL Functions**: Migrate analytics to use `Sum`, `Count`, `Avg`, `TruncMonth`, `TruncDate` from `django.db.models`.
- **Caching**: Cache the results of heavy, slow-changing analytical endpoints using Redis or Django cache (`@method_decorator(cache_page(60 * 15))`). This is vital for `getMarketingAnalytics` and `getDashboardStats`.

---

## 📄 4. Query Pagination Limits

- Overhaul endpoint querysets to ensure strict maximum limitations on page size to prevent memory blowouts (e.g., if a malicious or broken client requests `page_size=100000`).
- Set `MAX_PAGE_SIZE` in the `REST_FRAMEWORK` default configuration inside `settings.py` (e.g., `MAX_PAGE_SIZE = 100`).
- Apply robust pagination to endpoints returning massive datasets:
  - e.g., `delivery_logs` on marketing campaigns must be strictly paginated, rather than returning raw arrays or enormous database slices like `[:5000]`.
- Consider `CursorPagination` for infinitely scrolling logs (like `EmailDeliveryLog` or `EmailClickLog`) where absolute offset limits create performance bottlenecks.

---

## 🛠️ 5. Execution Steps

### Phase 1: Modeling & Migrations
- Add `models.Index` arrays and `db_index=True` statements to heavily queried models in `backend/api/models.py`.
- Run migrations (`python manage.py makemigrations & python manage.py migrate`).

### Phase 2: ORM Refactoring (N+1 Elimination)
- Inject `select_related` and `prefetch_related` parameters into `ViewSet` querysets in `backend/api/views.py`.
- Ensure serializers are not accidentally triggering related fetches that aren't prefetched.

### Phase 3: Analytics Tuning & Caching
- Convert raw Python iteration logic into efficient `.annotate()` and `.aggregate()` queries.
- Implement `django.core.cache` logic around the Admin dashboard and Marketing analytics endpoints.

### Phase 4: Hardening & Pagination
- Set strict limits in `settings.py` for Pagination.
- Refactor any `.all()` or slice operations on endpoints dealing with user logs into properly paginated responses.

---

## 🔭 6. Future Enhancements: Observability & Monitoring

For full production maturity and to track database and application health proactively before bottlenecks occur, an enterprise observability stack should be considered:

- **Logging Strategy:** Transition to structured JSON logs for backend, database, and background processes for easier parsing.
- **Error Monitoring & Alerts:** Integrate tools like Sentry, hooked into Slack for immediate alerting on critical 500s or database deadlocks.
- **Health Checks:** Implement `/api/health` endpoints to automatically monitor DB, Redis, and Celery worker status.
- **Celery Task Monitoring:** Employ Flower to visually monitor queue congestion, failure rates, and background task execution times.
- **Uptime Monitoring:** Leverage a tool like Uptime Kuma for active pings and downtime tracking across all active microservices.
