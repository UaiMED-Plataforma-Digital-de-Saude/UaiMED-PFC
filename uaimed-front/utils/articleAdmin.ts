export const ARTICLE_ADMIN_EMAIL = 'admin@uaimed.com';

export function isArticleAdmin(user: { email: string } | null | undefined): boolean {
  return user?.email === ARTICLE_ADMIN_EMAIL;
}
