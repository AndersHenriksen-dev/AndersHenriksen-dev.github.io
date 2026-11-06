# CLAUDE.md

My portfolio and blog at <https://andershenriksen-dev.github.io/>: a Hugo site forked from the Hugo Profile theme. Public repo: everything here is read by recruiters.

## Run things

```bash
hugo server                                  # local preview on http://localhost:1313, reloads on change
hugo --gc --minify --panicOnWarning          # the build CI runs on every pull request; any warning fails it
hugo new content projects/my-project.md      # new project page from archetypes/projects.md
hugo new content blogs/my-post.md            # new blog post
uvx pre-commit install                       # once: line endings, whitespace and gitleaks on every commit
uvx pre-commit run --all-files               # the same checks on every file
```

Hugo is the extended edition, 0.168.0 or newer (`winget install Hugo.Hugo.Extended` on Windows). The deploy pins the version in `.github/workflows/pages.yml`.

## Index of `.claude/` and related files

| File | Read it when | What it covers |
|---|---|---|
| [.claude/reference/git-workflow.md](.claude/reference/git-workflow.md) | **Before creating a branch, a commit or a pull request** | Branch names (`category/description`), commit messages (`tag(scope): Header`, a body that says why), rebasing instead of merging `master` in, pull request bodies, attribution. |
| [.claude/reference/python-style.md](.claude/reference/python-style.md) | **Before writing or editing any `.py` file** | The single source of truth for Python: PEP 8 via ruff, typing checked by mypy, Google-style docstrings, Pydantic models at boundaries, module structure, KISS/DRY/LEAN, comments, testing. The site has no Python yet; helper scripts go in `scripts/`. |
| [.claude/commands/commit-push-pr.md](.claude/commands/commit-push-pr.md) | Committing and opening a pull request | Command that runs the checks, commits, pushes and opens the pull request by the workflow above. |
| [.claude/hooks/check_python_style_read.py](.claude/hooks/check_python_style_read.py) | Debugging why a Python edit was blocked | `PreToolUse` hook that blocks editing `.py`/`.ipynb` files until the style guide has been read in the session. |
| [.claude/settings.json](.claude/settings.json) | Changing permissions or hooks | Allowed, asked and denied commands (merging asks; force pushes that are not `--force-with-lease` are denied), and the hook above. |
| [.claude/launch.json](.claude/launch.json) | Previewing the site from Claude Code | Starts `hugo server` on port 1313. |
| [.pre-commit-config.yaml](.pre-commit-config.yaml) and [.github/workflows/ci.yml](.github/workflows/ci.yml) | Changing what runs on commit or in CI | Line endings, whitespace and the gitleaks secret scan on commit; the strict Hugo build and gitleaks on every pull request. |
| [.github/workflows/pages.yml](.github/workflows/pages.yml) | Changing the deploy | Builds and deploys the site to GitHub Pages on every push to `master`. |
| [.gitattributes](.gitattributes) | Never: it is automatic | Forces LF line endings on every text file, so files from Windows editors do not mix CRLF and LF. |

## Layout

- `hugo.yaml`: all homepage text (hero, about, skills, experience, education, contact), the navbar, footer, colors and theme settings.
- `content/projects/`: one page per project. A project is a write-up of what it is and what I learned, with a GitHub link in `links:` that shows as a button under the title. The text before `<!--more-->` is the summary on the project card.
- `content/blogs/`: blog posts.
- `static/images/`: the profile photo (`me.jpg`, square, black and white), project screenshots in `projects/`, post images in `blogs/`. `static/fav.png` is the logo and favicon.
- `layouts/`: the theme's templates. Change them here; there is no theme submodule. `layouts/_default/single.html` renders posts and project pages.
- `layouts/partials/card-carousel.html`: the sideways row of project and post cards on the homepage. Swiping uses the browser's own scrolling; `static/js/cardCarousel.js` only runs the desktop arrows.
- `static/css/`: the theme's CSS, left as it is. `static/style.css`: the site's own CSS, loaded last (`params.customCSS`), with every override.
- Colors: the whole palette is built from one color, `params.color.base` in `hugo.yaml`. Each role (page, card, border, text, link, button fill) has a fixed HSV value and a saturation cap, listed with its worst-case contrast at the top of `static/style.css`. `params.color.darkmode` holds the same palette as fixed colors for browsers without CSS relative colors.
- `archetypes/projects.md`: the template for a new project page.

## Rules

- The site is always dark (`params.theme.defaultTheme: dark`, no toggle). Check every change in dark mode, at desktop and at phone width (375 px).
- To change the colors, change `params.color.base`, not single colors. If a role's value or cap changes, check its contrast over every hue again: blue is the darkest hue at any HSV value. Update the `darkmode` fallbacks to match.
- Every page must build with `--panicOnWarning`.
- Contact email is `anhenr.dev@gmail.com`.
- Nothing private goes on the site: no salary, no internal workplace matters, no job search details. My notes outside this repo are private; only CV-level facts are public.
- Public job titles: Capital Four is exactly "Senior Data Analyst"; Danske Bank Group Treasury is "Data Analyst (Tech Lead)", which was not a promotion. Outside the Education section, the degree is "Master's in Artificial Intelligence from DTU". IFRS9 models are statistical models, not machine learning. Never name a weakness at a current or past employer.
- Project numbers must match the project's own README and eval results. Link to the repository rather than copying long sections.
- Images: compress before committing (photos under 100 KB, screenshots under 600 KB).

## Attribution: the agent never credits itself

I am the only author of everything here: commits, pull request bodies, comments and the site itself. No `Co-Authored-By:` trailer naming a tool, agent or model, no "Generated with" line, and no text on the site that says an AI tool built or helped with the work. Never override `user.name`, `user.email` or `--author`.

## Writing style (everything that is not Python)

- Never use em dashes anywhere: site text, README, docs, comments, commit messages. Use commas, colons, full stops or parentheses.
- Plain English, short sentences, numbers instead of adjectives, no hype words. Site text and README in first person singular.
- Write about the code and the site as they are now, not about how they got there.
- Git: follow [.claude/reference/git-workflow.md](.claude/reference/git-workflow.md). Branches `category/description`, one per task, rebased (never merged) onto `master`. Commits `tag(scope): Header` with a body that explains why, author `Anders Henriksen <anhenr.dev@gmail.com>`. Squash merge.
