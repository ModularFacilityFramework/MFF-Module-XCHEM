# MFF-Module-template

Reusable starting point for an [MFF-core](../mff-core) feature module (chemicals inventory, SLURM monitoring, imaging, booking systems, etc.). Clone or copy this repo per new module, then rename it — see `docs/MFF-Module-template_module-manifest.md`.

## Why this exists

MFF-core's own architecture reserves `src/core/<moduleName>/` for modules, but gives no reusable starting point and no way to develop one without an mff-core checkout physically present. This template provides both:

- A documented, versioned contract (`coreApi`, see `docs/MFF-Core_module-core-api.md`) — the *only* way a module talks to core, so this repo never needs an mff-core checkout open alongside it during development.
- A local dev harness (`dev/`) that stands in for real core, so `npm run dev` works with nothing but this repo checked out.
- Installing means `git clone`-ing this repo directly to `App_frontend/src/core/<id>/` inside a real mff-core checkout (see `docs/MFF-Core_module-database-provisioning.md`) — a real checkout, `git pull`ed in place to update, never a copy or symlink of one. That's mff-core's own decision (its Modules admin page, or a plain `git clone`), not something this repo needs any tooling for.

## Quick start

```bash
nvm use
npm install
cp dev/.env.dev.example dev/.env.dev   # edit if your local MariaDB isn't localhost/root/no-password
npm run dev:db:setup
npm run dev
```

Backend harness on `http://localhost:4100`, frontend harness on `http://localhost:3000`. See `docs/MFF-Module-template_dev-setup.md`.

## Structure

```
module.manifest.json    # id, label, version, tablePrefix, mountPath - single source of truth
backend/                 # this module's real Express router + own DB tables
frontend/                 # this module's real React components
dev/                       # local dev harness ONLY - never installed into core, see docs/MFF-Module-template_dev-setup.md
docs/                       # symlink to mff-core's own docs/ (a shared space core and every
                            # module link to) - this repo's own docs live there too, prefixed
                            # MFF-Module-template_*.md: module-manifest.md, install.md,
                            # dev-setup.md. coreApi/manifest-schema/UI-guide are core's own
                            # MFF-Core_*.md files in that same shared folder, not duplicated here.
```

## Renaming this into a real module

See `docs/MFF-Module-template_module-manifest.md`.

## Installing into a real mff-core checkout

How installing/updating actually works is core's own mechanism — see `docs/MFF-Core_module-database-provisioning.md`. `docs/MFF-Module-template_install.md` only covers why this repo has no install script of its own.
