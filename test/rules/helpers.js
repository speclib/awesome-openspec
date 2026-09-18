import { remark } from 'remark';

/**
 * Run a lint rule over markdown and return its messages as plain strings.
 */
export async function lint(rule, markdown) {
  const file = await remark().use(rule).process(markdown);
  return file.messages.map((m) => m.reason);
}
