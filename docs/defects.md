# Defect Summary (based on known risks)

| ID | Area | Steps | Observed | Expected | Notes |
| --- | --- | --- | --- | --- | --- |
| DEF-01 | Broken slug | Open https://tmdb-discover.surge.sh/popular | May return blank/partial content before manual navigation | Should load list or redirect to main discover feed | Negative test captures status/logs; attach screenshot on failure |
| DEF-02 | Pagination tail | Navigate to highest visible page, click Next repeatedly | Last pages may not load; Next may stay enabled while content freezes | Either disable Next or load content for requested page | Test logs warning instead of hard-failing (known issue) |
| DEF-03 | Sparse filter combo | Type=TV + Genre=Animation + Years 1900–1901 | Could yield no results and no empty-state message | Show clear empty-state text | Logged as usability gap if empty-state missing |
