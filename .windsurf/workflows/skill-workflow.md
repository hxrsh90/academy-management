---
description: Use Claude Code plugin skills in Windsurf
---

# Using Claude Code Skills in Windsurf

This workflow allows Cascade to access and use skills from the Claude Code plugins repository.

## How to Use Skills

### Method 1: Direct Skill Reference
When you want me to use a specific skill, mention it:
- "Use the skill-creator skill to help me build a new skill"
- "Apply code-review patterns from the plugins"
- "Use feature-dev workflow for this task"

### Method 2: Search Skills
I can search available skills:
```javascript
const skills = skillLoader.findSkill('code review');
```

### Method 3: List Available Skills
Run: `node .windsurf/skill-loader.js list`

## Available Skill Categories

### Development Skills
- **skill-creator** - Create new skills with proper structure
- **feature-dev** - Structured feature development workflow
- **code-review** - Code review patterns and checklists
- **mcp-server-dev** - MCP server development
- **plugin-dev** - Plugin development tools

### LSP/Language Support
- typescript-lsp
- pyright-lsp
- rust-analyzer-lsp
- clangd-lsp
- gopls-lsp
- And more...

### Output Styles
- **explanatory-output-style** - Detailed explanations
- **learning-output-style** - Educational approach

## Skill Structure

Skills follow this format:
```markdown
---
name: skill-name
description: When to use this skill
version: 1.0.0
---

# Skill Content
Guidance for Claude...
```

## Example Usage

**Task:** "Create a new API endpoint"

I can apply patterns from:
- `feature-dev` skill for structured development
- `skill-creator` if building reusable patterns
- `code-review` for quality checks

**Task:** "Review this code"

I can apply patterns from:
- `code-review` skill
- `explanatory-output-style` for detailed feedback
- `security-guidance` for security checks
