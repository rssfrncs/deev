import { test, expect } from '@playwright/test';
import { createVideo } from './helpers';

test('shows error when the video list fails to load', async ({ page }) => {
  // Simulate a network failure so the saga's catch path fires
  await page.route('http://localhost:3001/trpc/**', (route) => route.abort());

  await page.goto('/');

  await expect(page.getByText('Failed to load videos')).toBeVisible();
});

test('listing page loads and displays videos', async ({ page, request }) => {
  const v1 = await createVideo(request, { title: 'Getting Started with React', duration: 120, tags: ['react'] });
  const v2 = await createVideo(request, { title: 'TypeScript Tips', duration: 90, tags: ['typescript'] });

  await page.goto('/');

  await expect(page.getByText(v1.title)).toBeVisible();
  await expect(page.getByText(v2.title)).toBeVisible();
});

test('can add a new video', async ({ page }) => {
  const newTitle = 'My Brand New Video';

  await page.goto('/');
  await expect(page.getByRole('button', { name: '+ Add video' })).toBeVisible();

  await page.getByRole('button', { name: '+ Add video' }).click();
  await page.getByPlaceholder('Video title').fill(newTitle);
  await page.getByPlaceholder('Duration (s)').fill('45');
  await page.getByRole('button', { name: 'Add video', exact: true }).click();

  await expect(page.getByText(newTitle)).toBeVisible();
});

test('clicking a video navigates to the detail page', async ({ page, request }) => {
  const video = await createVideo(request, { title: 'Detail Page Video', duration: 180 });

  await page.goto('/');
  await page.getByRole('button', { name: `Watch ${video.title}` }).click();

  await expect(page).toHaveURL(new RegExp(`/video/${video.id}`));
  await expect(page.getByRole('heading', { name: video.title })).toBeVisible();
});

test('shows error on detail page when video does not exist', async ({ page }) => {
  await page.goto('/video/nonexistent-id');

  await expect(page.getByText(/video not found|failed to load/i)).toBeVisible();
});
