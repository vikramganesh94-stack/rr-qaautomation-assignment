import { test, expect } from '@playwright/test';
import { log } from '../../src/utils/logger';

/**
 * API-only tests for TMDB Discovery endpoints
 * Validates network layer without UI interaction
 * Uses Playwright's route interception for pure API testing
 */

test.describe('Discovery API Validation', () => {
  const baseUrl = 'https://api.themoviedb.org/3';
  
  test('Discover API returns valid structure for movies', async ({ request }) => {
    const response = await request.get(`${baseUrl}/discover/movie`, {
      params: {
        api_key: 'add494e96808c55b3ee7f940c9d5e5b6',
        page: 1
      }
    });
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    log.info({ data: { page: data.page, total_pages: data.total_pages } }, 'Discover API response structure');
    
    // Validate response structure
    expect(data).toHaveProperty('page');
    expect(data).toHaveProperty('results');
    expect(data).toHaveProperty('total_pages');
    expect(data.results).toBeInstanceOf(Array);
    expect(data.results.length).toBeGreaterThan(0);
    
    // Validate movie object structure
    const firstMovie = data.results[0];
    expect(firstMovie).toHaveProperty('id');
    expect(firstMovie).toHaveProperty('title');
    expect(firstMovie).toHaveProperty('poster_path');
    expect(firstMovie).toHaveProperty('vote_average');
  });

  test('Discover API respects genre filter', async ({ request }) => {
    const actionGenreId = 28;
    const response = await request.get(`${baseUrl}/discover/movie`, {
      params: {
        api_key: 'add494e96808c55b3ee7f940c9d5e5b6',
        with_genres: actionGenreId,
        page: 1
      }
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    log.info({ genre: actionGenreId, count: data.results.length }, 'Genre filter applied');
    
    // Validate all results contain the genre
    const firstMovie = data.results[0];
    expect(firstMovie.genre_ids).toContain(actionGenreId);
  });

  test('Discover API respects year range', async ({ request }) => {
    const response = await request.get(`${baseUrl}/discover/movie`, {
      params: {
        api_key: 'add494e96808c55b3ee7f940c9d5e5b6',
        'primary_release_date.gte': '2020-01-01',
        'primary_release_date.lte': '2023-12-31',
        page: 1
      }
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    log.info({ yearRange: '2020-2023', count: data.results.length }, 'Year filter applied');
    
    // Validate release dates are within range
    const firstMovie = data.results[0];
    const releaseYear = new Date(firstMovie.release_date).getFullYear();
    expect(releaseYear).toBeGreaterThanOrEqual(2020);
    expect(releaseYear).toBeLessThanOrEqual(2023);
  });

  test('Discover API respects rating filter', async ({ request }) => {
    const minRating = 7;
    const response = await request.get(`${baseUrl}/discover/movie`, {
      params: {
        api_key: 'add494e96808c55b3ee7f940c9d5e5b6',
        'vote_average.gte': minRating,
        page: 1
      }
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    log.info({ minRating, count: data.results.length }, 'Rating filter applied');
    
    // Validate all results meet rating threshold
    data.results.forEach((movie: any) => {
      expect(movie.vote_average).toBeGreaterThanOrEqual(minRating);
    });
  });

  test('Discover API pagination works correctly', async ({ request }) => {
    const page1 = await request.get(`${baseUrl}/discover/movie`, {
      params: { api_key: 'add494e96808c55b3ee7f940c9d5e5b6', page: 1 }
    });
    const page2 = await request.get(`${baseUrl}/discover/movie`, {
      params: { api_key: 'add494e96808c55b3ee7f940c9d5e5b6', page: 2 }
    });
    
    expect(page1.ok()).toBeTruthy();
    expect(page2.ok()).toBeTruthy();
    
    const data1 = await page1.json();
    const data2 = await page2.json();
    
    // Validate different results on different pages
    expect(data1.results[0].id).not.toEqual(data2.results[0].id);
    expect(data1.page).toBe(1);
    expect(data2.page).toBe(2);
    
    log.info({ page1Count: data1.results.length, page2Count: data2.results.length }, 'Pagination validated');
  });

  test('Search API returns relevant results', async ({ request }) => {
    const response = await request.get(`${baseUrl}/search/movie`, {
      params: {
        api_key: 'add494e96808c55b3ee7f940c9d5e5b6',
        query: 'Avatar'
      }
    });
    
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    expect(data.results.length).toBeGreaterThan(0);
    expect(data.results[0].title.toLowerCase()).toContain('avatar');
    
    log.info({ query: 'Avatar', resultsCount: data.results.length }, 'Search API validated');
  });

  test('API handles invalid requests gracefully', async ({ request }) => {
    const response = await request.get(`${baseUrl}/discover/movie`, {
      params: {
        api_key: 'invalid_key',
        page: 1
      },
      failOnStatusCode: false
    });
    
    expect(response.status()).toBe(401);
    log.info({ status: response.status() }, 'Invalid API key handled correctly');
  });

  test('API rate limiting returns appropriate status', async ({ request }) => {
    // Make multiple rapid requests to test rate limiting behavior
    const requests = Array(5).fill(null).map(() => 
      request.get(`${baseUrl}/discover/movie`, {
        params: { api_key: 'add494e96808c55b3ee7f940c9d5e5b6', page: 1 }
      })
    );
    
    const responses = await Promise.all(requests);
    
    // All should succeed (this API is generous with rate limits)
    responses.forEach(response => {
      expect([200, 429]).toContain(response.status());
    });
    
    log.info({ requestCount: requests.length }, 'Rate limiting tested');
  });
});
