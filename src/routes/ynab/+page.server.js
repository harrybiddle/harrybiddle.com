import { redirect } from '@sveltejs/kit';

export function load() {
  // 301 for permanent, 302 for temporary, 307 for temp keeping method
  throw redirect(301, 'https://tiger-budget.vercel.app');
}