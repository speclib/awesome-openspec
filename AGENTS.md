# awesome-openspec

A curated awesome list of OpenSpec and Spec-Driven Development resources,
published at [speclib.github.io/awesome-openspec](https://speclib.github.io/awesome-openspec/).

`README.md` is the single source of truth. Everything else reads from it:

- **Linting.** remark with awesome-lint, plus two custom rules in `rules/`:
  `alphabetical-order.js` and `list-item-length.js` (entries stay under 150
  characters so they render on one line on GitHub). Wired up in `.remarkrc.js`
  and run on every pull request by `.github/workflows/lint.yml`.
- **Enrichment.** `scripts/fetch-entries.js` extracts entries from the README,
  `scripts/fetch-github-stats.js` attaches live star counts.
- **Website.** An Astro site under `site/`, generated from the README data and
  deployed by `.github/workflows/deploy-site.yml` on every push to main and
  daily. Site data is never edited by hand; update the README and the site
  follows.

Contributions arrive as pull requests that add entries. `.inbox.md` is a
backlog of candidate resources still to be triaged.

## Commands

| Command                              | What it does                                    |
|--------------------------------------|-------------------------------------------------|
| `npm run lint`                       | Lint `README.md` (awesome-lint + custom rules)   |
| `node scripts/fetch-entries.js`      | Extract entries from the README into entry data  |
| `node scripts/fetch-github-stats.js` | Attach live GitHub star counts to the entries    |
| `npm --prefix site run dev`          | Serve the site locally                           |
| `npm --prefix site run build`        | Build the static site                            |
| `nix flake check`                    | The ship gate: lint, build, tests, coverage      |
| `scripts/ship-change.sh <change>`    | Ship one OpenSpec change, gate before archiving  |
| `beans list`                         | Show the work tracked in this repo               |

## Beans

When I refer to issues like awesome-openspec-rn3b checkout the task
in @.beans/awesome-openspec-rn3b-*.md

In this project we will use these tasks as epics for making openspec proposals.

WHEN you create a proposal at a link to this task in the proposal.md.
WHEN a bean is used to create an proposal change the status to "in-progress"
WHEN a proposal is archived add the link to the archived proposal in the frontmatter of this task like this:

```
openspec-link: openspec/changes/archive/....
```

You are allowed to update these statuses in the task frontmatter:

- in-progress
- todo
- draft
- completed
- scrapped

When making changes you are allowed to update the date/time in `updated_at` in the task frontmatter

Besides updating status and openspec-link, you are NOT ALLOWED to modify the contents of the task file.
