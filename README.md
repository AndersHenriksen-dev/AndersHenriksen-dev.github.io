# andershenriksen-dev.github.io

My portfolio and blog, live at <https://andershenriksen-dev.github.io/>.

It is a fork of the [Hugo Profile](https://github.com/gurusabarish/hugo-profile) theme by gurusabarish. The repository root is the Hugo site itself: the theme's layouts, CSS and JavaScript sit next to my content, so there is no theme submodule to keep in sync.

## What is where

| Path | What it holds |
|---|---|
| `hugo.yaml` | Everything on the homepage: hero, about, experience, education, contact, navbar and footer |
| `content/projects/` | One page per project. Each page is a write-up of what the project is and what I learned, with a link to its code |
| `content/blogs/` | Blog posts |
| `static/images/` | Photos, project screenshots and post images |
| `layouts/` | The theme's templates, with one change: links in a page's front matter show as buttons under its title |
| `archetypes/projects.md` | The template for a new project page |

## Run it locally

Install [Hugo](https://gohugo.io/installation/) (extended edition, 0.168.0 or newer), then:

```bash
hugo server
```

The site runs on <http://localhost:1313> and reloads on every change.

## Add a project

```bash
hugo new content projects/my-project.md
```

This creates a draft from `archetypes/projects.md` with the GitHub link, badges and the sections I use: what it does, how it works, results, what I learned and where it breaks. Put a screenshot in `static/images/projects/`, fill in the sections, and set `draft: false`. The text before `<!--more-->` becomes the summary on the project card.

## Add a blog post

```bash
hugo new content blogs/my-post.md
```

## Deployment

Every push to `master` runs [.github/workflows/pages.yml](.github/workflows/pages.yml), which builds the site with Hugo 0.168.0 and deploys it to GitHub Pages. It can also be started by hand from the Actions tab.

## Licence

The theme code is MIT licensed by gurusabarish (see [LICENSE](LICENSE)). The content, photos and project write-ups are mine.
