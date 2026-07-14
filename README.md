# Awesome OpenSpec [![Awesome](https://awesome.re/badge.svg)](https://awesome.re)

> A curated list of awesome OpenSpec resources, tools, and Spec-Driven Development (SDD) resources.

OpenSpec is a lightweight, open-source spec-driven development framework that
helps AI coding assistants follow instructions more effectively. It works with
30+ tools including Claude Code, Cursor, GitHub Copilot, and more.

Browse this list as a searchable website with live star counts at
[speclib.github.io/awesome-openspec](https://speclib.github.io/awesome-openspec/).

## Contents

- [Key Concepts](#key-concepts)
- [Official Resources](#official-resources)
- [UIs](#uis)
- [Tools](#tools)
- [OpenSpec as Integration or Plugin](#openspec-as-integration-or-plugin)
- [Schemas & Extensions](#schemas--extensions)
- [Templates & Starters](#templates--starters)
- [GitHub Actions](#github-actions)
- [Videos](#videos)
- [Articles & Tutorials](#articles--tutorials)
- [Community](#community)
- [Exotic Use Cases](#exotic-use-cases)
- [Competitors & Comparisons](#competitors--comparisons)
- [Related Projects](#related-projects)

## Key Concepts

### What is Spec-Driven Development

<!--lint disable awesome-list-item-->

Spec-Driven Development (SDD) is a methodology where you and your AI coding assistant agree on what to build before any code is written. OpenSpec implements this through:

- **Proposals** - Structured change requests with technical designs
- **Specifications** - Living documentation that captures functional requirements
- **Task Checklists** - Implementation tasks with AI guidance
- **Archives** - Completed changes preserved for reference

### Core Workflow

```
/opsx:explore → /opsx:propose → /opsx:apply → /opsx:verify → /opsx:archive
```

### Why OpenSpec

- **Universal** - Works with 30+ AI coding assistants
- **Open Source** - MIT licensed, no vendor lock-in
- **No API Keys** - Runs locally without external dependencies
- **Brownfield-First** - Designed for mature codebases, not just greenfield projects
- **Persistent Context** - Specs live in your repo alongside code

 <!--lint enable awesome-list-item-->

## Official Resources

- [Getting Started Guide](https://github.com/Fission-AI/OpenSpec/blob/main/docs/getting-started.md) - Official getting started documentation.
- [npm Package](https://www.npmjs.com/package/@fission-ai/openspec) - Official npm package for installation.
- [OpenSpec](https://github.com/Fission-AI/OpenSpec/) - Official OpenSpec CLI. Spec-driven development (SDD) for AI coding assistants.
- [OpenSpec Pro](https://openspec.pro/) - Additional OpenSpec resources and documentation.
- [OpenSpec Website](https://openspec.dev/) - Official website with documentation and getting started guide.

## UIs

- [dossier](https://github.com/fselich/dossier) - Keyboard-driven TUI for navigating proposals, designs, specs, and tasks.
- [openspec-ui](https://github.com/ToruAI/openspec-ui) - Real-time Kanban dashboard for tracking changes across multiple repositories.
- [openspec-viewer](https://github.com/MusicAdam/openspec-viewer) - Browser viewer with live reload, markdown rendering, and full-text search.
- [openspec-webui](https://github.com/oioi555/openspec-webui) - Interactive browser UI for browsing and managing specifications.
- [OpenSpecUI](https://github.com/jixoai/openspecui) - Web interface for OpenSpec workflows with live mode and static export support.
- [Specboard](https://github.com/sflueckiger/specboard) - Web dashboard for monitoring progress across workspaces with swimlane visualization.
- [speclens](https://github.com/dansreis/speclens) - Desktop reader for tracing requirement evolution and commenting on specs.
- [Spek](https://github.com/spekhq/spek) - Read-only viewer with BDD highlighting and full-text search for web, VS Code, and IntelliJ.

## Tools

- [Coding Corgi Flow](https://github.com/ricoyudog/Coding_Corgi_flow) - OpenSpec GitFlow with structured AI workflows and issue tracking.
- [gitguardex](https://github.com/opencue/gitguardex) - Runs parallel coding agents in isolated worktrees with OpenSpec auto-wired.
- [OmniDev Kit](https://github.com/zy-eagle/omnidev-kit) - Toolkit combining OpenSpec with cross-session memory and project intelligence.
- [openspec-agents](https://github.com/gmf520/openspec-agents) - State-machine multi-agent framework built on OpenSpec docs. (Chinese)
- [openspec-playwright](https://github.com/wxhou/openspec-playwright) - Playwright E2E testing with a self-healing three-agent pipeline.
- [OpenSpec.sh](https://github.com/biancalana/OpenSpec.sh) - Minimal POSIX shell implementation of OpenSpec CLI for environments without Node.js.
- [ralphy-openspec](https://github.com/wenqingyu/ralphy-openspec) - Combines OpenSpec with Ralph Loop for iterative AI-assisted coding.
- [spec-gen](https://github.com/clay-good/spec-gen) - Reverse-engineers OpenSpec specs from existing codebases via static analysis and LLMs.
- [veriplan](https://github.com/autonomous-toaster/veriplan) - Formal verification of plans by translating requirements to LTL for SPIN.

## OpenSpec as Integration or Plugin

- [claude-connoisseur](https://github.com/eugeniosegala/claude-connoisseur) - Claude Code plugin uniting skills, rules, and hooks with OpenSpec.
- [claude-plugin-sdd](https://github.com/joestump/claude-plugin-sdd) - Claude Code plugin for SDD with ADRs, OpenSpec specs, and sprint planning.
- [ClawSpec](https://github.com/bytegh/clawspec) - OpenClaw plugin bringing OpenSpec workflows into chat with background execution.
- [Flokay](https://github.com/pacaplan/flokay) - Claude Code and Cursor plugin with plan-then-implement workflow and subagent dispatch.
- [intellij-openspec](https://github.com/johnnyblabs/intellij-openspec) - IntelliJ IDEA plugin for OpenSpec, available on the JetBrains Marketplace.
- [opencode-openspec](https://github.com/AngDrew/opencode-openspec) - OpenSpec spec-driven development plugin for OpenCode.
- [opencode-plugin-openspec](https://github.com/Octane0411/opencode-plugin-openspec) - OpenCode plugin with Architect mode for spec-only writes.
- [openflow](https://github.com/fastknifes/openflow) - OpenCode companion plugin combining OpenSpec with Superpowers.
- [openspec-ext](https://github.com/RandyZ/openspec-ext) - VS Code and Cursor extension with a visual dashboard for changes and specs.
- [openspec-ui-vscode](https://github.com/coderj001/openspec-ui-vscode) - VS Code and Cursor extension with a visual dashboard for changes and specs along with mermaid diagrams view and direct artifact comments.
- [openspec-for-copilot](https://github.com/atman-33/openspec-for-copilot) - VS Code extension integrating OpenSpec with GitHub Copilot Chat.
- [openspec-mcp](https://github.com/Lumiaqian/openspec-mcp) - MCP server exposing the OpenSpec CLI as tools, with a Kanban web dashboard.
- [openspec-skills](https://github.com/chyiiiiiiiiiiii/openspec-skills) - Spec-Driven Development skills for Claude Code.
- [openspec-superpowers-opencode](https://github.com/moyaspace/openspec-superpowers-opencode) - Superpowers and OpenSpec combined in OpenCode.
- [openspec-tdd](https://github.com/yuritoledo/openspec-tdd) - Plugin for Claude Code, OpenCode, and Pi generating failing tests from specs.
- [OpenSpec-Zed](https://github.com/uwzis/OpenSpec-Zed) - Zed editor extension adding OpenSpec workflow slash commands to the Assistant panel.
- [openspec.el](https://github.com/Zacalot/openspec.el) - Emacs interface for OpenSpec workflows.
- [openspec.nvim](https://github.com/ctchen222/openspec.nvim) - Neovim control surface for OpenSpec workflows.
- [opsx-feature-dev](https://github.com/mbertani/opsx-feature-dev) - Claude Code and Copilot plugin with a 7-phase feature development workflow.
- [vitepress-plugin-openspec](https://github.com/stritti/vitepress-plugin-openspec) - VitePress plugin rendering OpenSpec folders as doc pages.

## Schemas & Extensions

- [e2e-runbooks](https://github.com/Lukk17/openspec-schemas) - Capability-level e2e runbooks with behaviour-only assertions and token accounting.
- [flow-kit](https://github.com/rihebty/flow-kit) - Workflow kit merging BMAD, Spec-Kit, OpenSpec, GSD, and Superpowers. (Chinese)
- [HyperSpec](https://github.com/wind7rui/HyperSpec) - Workflow skill coordinating OpenSpec specs with Superpowers TDD. (Chinese)
- [openspec-plus](https://github.com/sudokar/openspec-plus) - Agentic skills improving discovery, requirements, design decisions, and execution.
- [openspec-reviewed-workflow](https://github.com/griffithkk3-del/openspec-reviewed-workflow) - Adds a review gate between proposal and spec phases.
- [openspec-schemas](https://github.com/intent-driven-dev/openspec-schemas) - Custom workflow schemas including minimalist and event-driven templates.
- [openspec-schemas by JiangWay](https://github.com/JiangWay/openspec-schemas) - Community schemas including a superpowers-bridge integration.
- [openspec-schemas by kmhalvin](https://github.com/kmhalvin/openspec-schemas) - Subagent-driven development and QRSPI multi-phase reasoning schemas.
- [openspec-spec-driven-superpowers](https://github.com/Veath/openspec-spec-driven-superpowers) - Adds superpowers-style planning and readiness gates.
- [spec-superflow](https://github.com/MageByte-Zero/spec-superflow) - OpenSpec planning with Superpowers execution across 17 platforms. (Chinese)
- [superpowers-openspec-team-skills](https://github.com/SYZ-Coder/superpowers-openspec-team-skills) - Self-learning team skill library. (Chinese)
- [SuperSpec](https://github.com/danielhanold/superspec) - Drop-in schema integrating Superpowers execution discipline for traceable workflows.

## Templates & Starters

- [Harness-Starter](https://github.com/chenklein26-maker/Harness-Starter) - Claude Code harness template with OpenSpec SDD workflow. (Chinese)
- [intent-driven-template](https://github.com/intent-driven-dev/intent-driven-template) - Template with ADRs, C4 diagrams, Gherkin, and TDD.
- [nuxt-supabase-starter](https://github.com/YuDefine/nuxt-supabase-starter) - Nuxt and Supabase starter with OpenSpec-based AI workflow. (Chinese)
- [opencode-onboard](https://github.com/CKGrafico/opencode-onboard) - Prepares codebases for AI by wiring OpenCode, OpenSpec, and codegraph.
- [speccoding-template](https://github.com/beautifulSoup/speccoding-template) - Full-stack AI dev template with OpenSpec and Superpowers. (Chinese)

## GitHub Actions

- [OpenSpec Badge Action](https://github.com/wearetechnative/openspec-badge-action) - GitHub Action generating SVG badges for OpenSpec metrics.

## Videos

- [I Found the Simplest AI Dev Tool Ever](https://www.youtube.com/watch?v=cQv3ocbsKHY) - Short introduction video to OpenSpec.
- [Launch Video](https://youtu.be/N-MftbmnmMo) - An introduction to OpenSpec by Tabish Bidiwale.
- [OpenSpec Changes Everything / No More Vibe Coding](https://www.youtube.com/watch?v=5oUmpdpbejk) - Full tutorial on OpenSpec workflow.
- [OpenSpec Will Change How You Vibe Code Forever](https://www.youtube.com/watch?v=nFq4POtqom4) - Overview of OpenSpec and SDD by Sean Kochel.
- [OpenSpec: NEW Toolkit Ends Vibe Coding!](https://www.youtube.com/watch?v=gHkdrO6IExM) - Full tutorial by WorldofAI covering the complete workflow.

## Articles & Tutorials

- [Cursor Forum](https://forum.cursor.com/t/openspec-lightweight-portable-spec-driven-framework-for-ai-coding-assistants/134052) - OpenSpec + Cursor.
- [Dev.to Intro](https://dev.to/webdeveloperhyper/how-to-make-ai-follow-your-instructions-more-for-free-openspec-2c85) - Getting started tutorial.
- [genai-development-techniques](https://github.com/olivomarco/genai-development-techniques) - Evidence-based comparison of AI coding methodologies.
- [OpenSpec + Beads](https://github.com/cameronsjo/spec-compare/blob/main/docs/cheatsheet-beads-openspec.md) - Cheatsheet for OpenSpec with Beads.
- [OpenSpec on IntentDriven](https://intent-driven.dev/knowledge/openspec/) - IntentDriven development resource with a focus on OpenSpec.
- [OpenSpec-cn](https://github.com/sohaha/studyzy-OpenSpec-cn) - Chinese translation of the OpenSpec documentation.
- [OpenSpec-Docs-zh](https://github.com/radebit/OpenSpec-Docs-zh) - Chinese community documentation for OpenSpec.
- [openspec-learning-guide](https://github.com/xiaojian98/openspec-learning-guide) - Chinese learning guide for getting started with OpenSpec.
- [openspec-practice](https://github.com/gqcn/openspec-practice) - Practice project demonstrating the OpenSpec workflow.
- [OpenSpec-practise](https://github.com/ForceInjection/OpenSpec-practise) - Practical guide to OpenSpec v1.3.0 with SDD examples. (Chinese/English)
- [openspec-tutorial](https://github.com/aiyinluya/openspec-tutorial) - Beginner tutorial for OpenSpec. (Taiwanese)
- [spec-compare](https://github.com/cameronsjo/spec-compare) - Comparison of six SDD tools with decision frameworks and scoring matrices.
- [What Is Spec-Driven Development?](https://felipefontoura.com/articles/what-is-spec-driven-development/) - A practitioner's guide to SDD.

## Community

- [Discord](https://discord.gg/YctCnvvshC) - Official OpenSpec Discord community for support and discussions.

## Exotic Use Cases

- [novel-writer-openspec](https://github.com/wordflowlab/novel-writer-openspec) - OpenSpec for fiction with character and plot specs. (Chinese)
- [OpenSpec-Video](https://github.com/mr7thing/openspec-video) - Spec-as-Code framework compiling Markdown specs into AI video generation job queues.

## Competitors & Comparisons

- [BMAD-METHOD](https://github.com/bmad-code-org/BMAD-METHOD) - Agile AI-driven development using formal specs as single source of truth.
- [ContractSpec](https://github.com/Pluviobyte/ContractSpec) - OpenSpec-compatible contract-driven workflow for AI full-stack development.
- [dataspec](https://github.com/raydez/dataspec) - AI-native data development tool, an OpenSpec for data teams. (Chinese)
- [FullSpec](https://github.com/NSEvteev/FullSpec) - Spec-driven framework turning ideas into code through formal analysis chains.
- [Get Shit Done](https://github.com/gsd-build/get-shit-done) - Spec-driven workflow with multi-agent orchestration and wave-based parallel execution.
- [Kiro](https://github.com/kirodotdev/Kiro) - AWS agentic IDE converting natural language into structured specs.
- [OpenSpecification](https://github.com/spenceriam/OpenSpecification) - Web-based take on Kiro IDE's Spec Mode.
- [pi-sdd-kit](https://github.com/felipefontoura/pi-sdd-kit) - Spec-driven development as skills for the Pi coding agent, with approval gates.
- [ProductSpec](https://github.com/gokulrajaram/ProductSpec) - Open standard for capturing software intent before implementation.
- [Spec Kitty](https://github.com/Priivacy-ai/spec-kitty) - SDD CLI workflow with Kanban dashboard, Git worktree isolation, and auto-merge.
- [Spec-Kit](https://github.com/github/spec-kit) - GitHub's official SDD toolkit with CLI, templates, scaffolding, and AI integrations.
- [spectr](https://github.com/connerohnesorge/spectr) - Validatable spec-driven development inspired by OpenSpec and Kiro.
- [Tessl SDD Tile](https://github.com/tesslio/spec-driven-development-tile) - Tile teaching MCP-compatible AI agents to write specs before coding.

## Related Projects

- [Awesome AI-Driven Development](https://github.com/eltociear/awesome-AI-driven-development) - Curated list of 500+ AI-powered development tools.

## Contributing

Contributions welcome! Please read the [contribution guidelines](CONTRIBUTING.md) first.
