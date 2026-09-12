# Endless AI Product Realization

A learning and product-realization workspace for moving from an idea to a researched, simulated, specified, quoted, tested, and deliverable product.

## Connected workflow

- **GitHub:** technical documentation, code, simulation, testing, and version history
- **HubSpot:** people, commercial projects, suppliers, approvals, tasks, and delivery
- **Figma:** visual system and whiteboard
- **Site:** creator-facing playground

The first demonstration project is `EAI-LAMP-0001`, a conceptual custom wall-plug lamp.

## Mercy Network

The second demonstration, `EAI-MERCY-0001`, explores a community where people can ask for help and offer money, time, items, or prayer. It is rooted in the fourteen Catholic works of mercy and welcomes people of every faith and background.

- [Open the public Mercy Network](https://maestro-student777.github.io/endless-ai-product-realization/mercy/)
- [Share the project page](https://maestro-student777.github.io/endless-ai-product-realization/mercy/project.html)
- [Read the implementation and pilot brief](docs/projects/EAI-MERCY-0001/brief.md)

It works in a regular browser without ChatGPT, an installation, or an account. The preview includes nine fictional need profiles, fourteen first-party resource links, the works of mercy, and device-local need drafts and giving plans. No requests are published and no payments are collected. The project page explains the proposed path toward a pilot with a participating organization.

The dependency-free source is in `mercy/`. Run `node scripts/build-mercy.mjs` after updating page templates or the resource catalog, and `node --test tests/mercy.test.mjs` to check the core behavior. The existing GitHub Pages workflow publishes both demonstrations from `main`.

> Learning demonstration only. This public repository must not contain private customer information, payment data, confidential supplier quotations, contracts, passwords, or API secrets.
