# TMDB Discover – Functional Test Scenarios

> Strategy: UI + API assertions, deterministic data selections, resilient selectors (roles/text), and logging of each step.

## 1) Filters

### 1.1 Type (Movie/TV)
1. Navigate to home.
2. Observe default list count (baseline).
3. Select Type = Movie.
4. Wait for discover API call to complete.
5. Assert API response status 200 and `with_type` request param includes `movie`.
6. Assert grid updates and each card shows a Movie badge or Type text.
7. Repeat for Type = TV and assert corresponding request param and UI tag.

### 1.2 Genre filter
1. Navigate to home.
2. Open Genre dropdown and pick "Action" (fallback: any listed option).
3. Wait for discover API call.
4. Assert status 200 and query contains genre id.
5. Assert at least one card rendered; each card genre text includes selected option.

### 1.3 Year range
1. Navigate to home.
2. Set From Year = 2020, To Year = 2025.
3. Apply/blur to trigger search.
4. Assert API status 200 and query includes `primary_release_date.gte` and `lte`.
5. Assert every result year is within range.

### 1.4 Rating threshold
1. Navigate to home.
2. Set Ratings slider to >= 7.
3. Wait for discover API.
4. Assert API status 200 and filter param for vote_average >= 7.
5. Assert each displayed card rating >= 7.

### 1.5 Title search
1. Navigate to home.
2. Enter title keyword (e.g., "Avatar").
3. Wait for search API.
4. Assert API status 200.
5. Assert each card title contains keyword (case-insensitive) or highlighting exists.

### 1.6 Category quick links (Popular / Trend / Newest / Top rated)
1. Navigate to home.
2. Click each category link in turn.
3. Assert navigation or query param change.
4. Assert API status 200 and matches category endpoint.
5. Assert grid updates with non-empty cards.

## 2) Pagination

### 2.1 Next/Previous paging
1. Navigate to home.
2. Capture initial page number and first card title.
3. Click Next.
4. Assert page indicator increments; API status 200 with `page=2`.
5. Assert first card differs from baseline (content change).
6. Click Previous and assert page indicator decrements and content reverts/changes.

### 2.2 Direct page jump (if supported)
1. Navigate to home.
2. Click a numbered page (e.g., 3).
3. Assert API status 200 and `page=3`.
4. Assert grid updates and indicator shows 3.

### 2.3 Pagination boundary
1. Navigate near last available page (e.g., by clicking the highest visible number).
2. Click Next until disabled or failure.
3. Assert UI either disables Next or shows graceful error; app must not crash.
4. Log observed behavior as defect if discrepancy (known issue: last pages may not work).

## 3) Negative / Known Issues

### 3.1 Broken slugs
1. Directly open https://tmdb-discover.surge.sh/popular.
2. Assert app loads (status 200) or gracefully redirects to default list.
3. Assert cards render; otherwise capture screenshot + console errors.

### 3.2 Pagination failure on trailing pages
1. Navigate to a high page (e.g., last visible page number).
2. Click Next.
3. Assert either results load or Next becomes disabled; if stuck/blank, record defect.

### 3.3 Invalid filter combination
1. Select Type = TV, Genre = Animation, Year range very narrow (e.g., 1900–1901).
2. Wait for API.
3. Assert API status is 200/404 accordingly; UI should show empty-state message, not crash.

## 4) Non-functional checks inside functional flow
- API validation: capture request URL/params and response status/body for every filter/pagination action.
- Visual sanity: poster images are loaded (response status 200) and have non-empty `src`.
- Accessibility quick checks: page title, main landmarks, filter controls have accessible labels.

## 5) Logging and reporting hooks
- Log before/after each action with timestamp and scenario id.
- Attach API trace (request + subset of response) to HTML report.
- Capture screenshot on failure; embed in HTML report.
