import { test, expect } from '@playwright/test';
import seed from '../../api/seed.json' with { type: 'json' };

const sortedVideos = [...seed.videos].sort(
  (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
);
const [firstVideo] = sortedVideos;

test('shows error when the video list fails to load', async ({ page }) => {
  // Simulate a network failure so the saga's catch path fires
  await page.route('http://localhost:3001/trpc/**', (route) => route.abort());

  await page.goto('/');

  await expect(page.getByText('Failed to load videos')).toBeVisible();
});

test('listing page loads and displays videos', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText(sortedVideos[0].title)).toBeVisible();
  await expect(page.getByText(sortedVideos[1].title)).toBeVisible();
});

test('shows error when creating a video fails', async ({ page }) => {
  await page.goto('/');

  await page.route('**/trpc/video.create**', (route) => route.abort());

  await page.getByRole('button', { name: '+ Add video' }).click();
  await page.getByPlaceholder('Video title').fill('Test Video');
  await page.getByPlaceholder('Duration (s)').fill('60');
  await page.getByRole('button', { name: 'Add video', exact: true }).click();

  await expect(page.getByRole('alert')).toBeVisible();
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

test('clicking a video navigates to the detail page', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: `Watch ${firstVideo.title}` }).click();

  await expect(page).toHaveURL(new RegExp(`/video/${firstVideo.id}`));
  await expect(page.getByRole('heading', { name: firstVideo.title })).toBeVisible();
});

test('shows error on detail page when video does not exist', async ({ page }) => {
  await page.goto('/video/nonexistent-id');

  await expect(page.getByText(/video not found|failed to load/i)).toBeVisible();
});
