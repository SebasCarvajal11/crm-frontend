import type { Locator, Page } from '@playwright/test'

export async function chooseRadixSelectOption(
  page: Page,
  trigger: Locator,
  optionName: string | RegExp
): Promise<void> {
  await trigger.click()
  await page.getByRole('option', { name: optionName }).click()
}

export async function chooseUserSearchResult(
  page: Page,
  input: Locator,
  email: string
): Promise<void> {
  await input.fill(email)
  await page.getByRole('option', { name: new RegExp(email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') }).click()
}
