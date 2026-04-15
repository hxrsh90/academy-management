const fs = require('fs');
const path = require('path');

const PLUGINS_DIR = path.join(__dirname, '..', 'claude-plugins-official', 'plugins');

class SkillLoader {
  constructor() {
    this.skills = new Map();
    this.agents = new Map();
    this.commands = new Map();
    this.loaded = false;
  }

  loadAll() {
    if (this.loaded) return this.skills;
    
    const pluginDirs = fs.readdirSync(PLUGINS_DIR, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const pluginName of pluginDirs) {
      this.loadPlugin(pluginName);
    }

    this.loaded = true;
    console.log(`Loaded ${this.skills.size} skills, ${this.agents.size} agents, ${this.commands.size} commands`);
    return this.skills;
  }

  loadPlugin(pluginName) {
    const pluginPath = path.join(PLUGINS_DIR, pluginName);
    
    // Load skills
    const skillsDir = path.join(pluginPath, 'skills');
    if (fs.existsSync(skillsDir)) {
      const skillDirs = fs.readdirSync(skillsDir, { withFileTypes: true })
        .filter(d => d.isDirectory())
        .map(d => d.name);
      
      for (const skillName of skillDirs) {
        this.loadSkill(pluginName, skillName, path.join(skillsDir, skillName));
      }
    }

    // Load agents
    const agentsDir = path.join(pluginPath, 'agents');
    if (fs.existsSync(agentsDir)) {
      const agentFiles = fs.readdirSync(agentsDir)
        .filter(f => f.endsWith('.md'));
      
      for (const agentFile of agentFiles) {
        this.loadAgent(pluginName, agentFile, path.join(agentsDir, agentFile));
      }
    }

    // Load commands
    const commandsDir = path.join(pluginPath, 'commands');
    if (fs.existsSync(commandsDir)) {
      const commandFiles = fs.readdirSync(commandsDir)
        .filter(f => f.endsWith('.md'));
      
      for (const cmdFile of commandFiles) {
        this.loadCommand(pluginName, cmdFile, path.join(commandsDir, cmdFile));
      }
    }
  }

  loadSkill(pluginName, skillName, skillPath) {
    const skillFile = path.join(skillPath, 'SKILL.md') || path.join(skillPath, 'skill.md');
    if (!fs.existsSync(skillFile)) return;

    const content = fs.readFileSync(skillFile, 'utf-8');
    const parsed = this.parseFrontmatter(content);
    
    const skill = {
      name: parsed.frontmatter.name || skillName,
      description: parsed.frontmatter.description || '',
      version: parsed.frontmatter.version || '1.0.0',
      plugin: pluginName,
      content: parsed.content,
      path: skillPath,
      references: this.loadReferences(skillPath),
      examples: this.loadExamples(skillPath)
    };

    this.skills.set(`${pluginName}/${skillName}`, skill);
  }

  loadAgent(pluginName, agentFile, agentPath) {
    const content = fs.readFileSync(agentPath, 'utf-8');
    const parsed = this.parseFrontmatter(content);
    const agentName = path.basename(agentFile, '.md');
    
    this.agents.set(`${pluginName}/${agentName}`, {
      name: parsed.frontmatter.name || agentName,
      description: parsed.frontmatter.description || '',
      plugin: pluginName,
      content: parsed.content,
      instructions: parsed.frontmatter.instructions || []
    });
  }

  loadCommand(pluginName, cmdFile, cmdPath) {
    const content = fs.readFileSync(cmdPath, 'utf-8');
    const parsed = this.parseFrontmatter(content);
    const cmdName = path.basename(cmdFile, '.md');
    
    this.commands.set(`${pluginName}/${cmdName}`, {
      name: parsed.frontmatter.name || cmdName,
      description: parsed.frontmatter.description || '',
      plugin: pluginName,
      content: parsed.content,
      usage: parsed.frontmatter.usage || ''
    });
  }

  loadReferences(skillPath) {
    const refsDir = path.join(skillPath, 'references');
    if (!fs.existsSync(refsDir)) return [];
    
    return fs.readdirSync(refsDir)
      .filter(f => f.endsWith('.md'))
      .map(f => ({
        name: path.basename(f, '.md'),
        content: fs.readFileSync(path.join(refsDir, f), 'utf-8')
      }));
  }

  loadExamples(skillPath) {
    const examplesDir = path.join(skillPath, 'examples');
    if (!fs.existsSync(examplesDir)) return [];
    
    return fs.readdirSync(examplesDir)
      .filter(f => f.endsWith('.md'))
      .map(f => ({
        name: path.basename(f, '.md'),
        content: fs.readFileSync(path.join(examplesDir, f), 'utf-8')
      }));
  }

  parseFrontmatter(content) {
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
    const match = content.match(frontmatterRegex);
    
    if (!match) {
      return { frontmatter: {}, content };
    }

    const frontmatterText = match[1];
    const bodyContent = match[2].trim();
    
    const frontmatter = {};
    const lines = frontmatterText.split('\n');
    
    for (const line of lines) {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.slice(0, colonIndex).trim();
        const value = line.slice(colonIndex + 1).trim();
        frontmatter[key] = value.replace(/^["']|["']$/g, '');
      }
    }

    return { frontmatter, content: bodyContent };
  }

  findSkill(query) {
    // Search by name or description match
    const lowerQuery = query.toLowerCase();
    const matches = [];
    
    for (const [key, skill] of this.skills) {
      if (skill.name.toLowerCase().includes(lowerQuery) ||
          skill.description.toLowerCase().includes(lowerQuery)) {
        matches.push(skill);
      }
    }
    
    return matches;
  }

  getSkill(pluginName, skillName) {
    return this.skills.get(`${pluginName}/${skillName}`);
  }

  listAllSkills() {
    return Array.from(this.skills.values()).map(s => ({
      name: s.name,
      plugin: s.plugin,
      description: s.description
    }));
  }
}

// Singleton instance
const skillLoader = new SkillLoader();

// Auto-load on require
skillLoader.loadAll();

module.exports = skillLoader;

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args[0] === 'list') {
    console.log('\n=== Available Skills ===\n');
    for (const skill of skillLoader.listAllSkills()) {
      console.log(`${skill.plugin}/${skill.name}`);
      console.log(`  ${skill.description.slice(0, 100)}...\n`);
    }
  } else if (args[0] === 'search' && args[1]) {
    const matches = skillLoader.findSkill(args[1]);
    console.log(`\n=== Skills matching "${args[1]}" ===\n`);
    for (const skill of matches) {
      console.log(`${skill.plugin}/${skill.name}`);
      console.log(`  ${skill.description}\n`);
    }
  } else if (args[0] === 'show' && args[1] && args[2]) {
    const skill = skillLoader.getSkill(args[1], args[2]);
    if (skill) {
      console.log(`\n=== ${skill.name} ===\n`);
      console.log(`Plugin: ${skill.plugin}`);
      console.log(`Description: ${skill.description}`);
      console.log(`\n${skill.content.slice(0, 2000)}...`);
    } else {
      console.log(`Skill not found: ${args[1]}/${args[2]}`);
    }
  } else {
    console.log(`
Usage:
  node skill-loader.js list                    - List all skills
  node skill-loader.js search <query>           - Search skills
  node skill-loader.js show <plugin> <skill>    - Show skill content
    `);
  }
}
