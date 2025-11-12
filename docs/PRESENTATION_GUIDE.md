# TechGear Presentation Guide

## Overview

This directory contains an interactive Slidev presentation that teaches how to build ChatGPT apps using the Model Context Protocol (MCP). The presentation is based on the comprehensive `DEVELOPER_GUIDE.md` and provides a visual, slide-based learning experience.

## What's Included

### Presentation Structure

The presentation covers 40+ slides organized into these sections:

1. **Introduction (Slides 1-5)**
   - What is a ChatGPT App?
   - What really is a ChatGPT App?
   - Tool structure and architecture
   - TechGear demo overview

2. **Architecture (Slides 6-10)**
   - Basic parts of a ChatGPT app
   - MCP Server, Widget Package, Playground
   - Architecture diagrams
   - Project layout and structure
   - Monorepo benefits

3. **Building a Widget (Slides 11-25)**
   - Step 1: Data & Logic
   - Step 2: Zod Schemas (with deep dive on why Zod)
   - Step 3: ChatGPT Integration (event-driven reactivity)
   - Step 4: React Component
   - Step 5: AI-Facing Descriptions
   - Step 6: MCP Registration
   - Complete widget registration flow

4. **MCP Server Setup (Slides 26-30)**
   - Widget registry configuration
   - MCP endpoint implementation
   - Critical configuration: Asset Prefix
   - Configuration checklist

5. **Testing (Slides 31-36)**
   - Three-stage testing approach
   - Stage 1: Preview page testing
   - Stage 2: MCPJam Inspector
   - Stage 3: Real ChatGPT
   - Common issues and solutions

6. **Best Practices (Slides 37-40)**
   - Development workflow
   - Best practices for architecture and development
   - Scaling to multiple widgets
   - Key takeaways and resources

## Quick Start

### Install and Run

```bash
# From the project root
npm run slides

# Or from the docs directory
cd docs
npm install
npm run dev
```

The presentation will open automatically at `http://localhost:3030`

### Build for Distribution

```bash
# Export as PDF
npm run slides:export

# Build static site
npm run slides:build
```

## Presentation Features

### Interactive Elements

- **Code Highlighting**: Syntax highlighting with line-specific highlighting
- **Click-based Animations**: Progressive disclosure with `<v-click>`
- **Mermaid Diagrams**: Sequence diagrams and flow charts
- **Two-column Layouts**: Side-by-side comparisons
- **Live Code Examples**: Real TypeScript/JavaScript code from the project

### Navigation Tips

| Action | Shortcut |
|--------|----------|
| Next slide | Space, →, ↓ |
| Previous slide | ←, ↑ |
| Slide overview | O |
| Dark mode | D |
| Go to slide | G |
| Presenter mode | P |
| Fullscreen | F |

### Presenter Mode

Press `P` to enter presenter mode, which shows:
- Current slide
- Next slide preview
- Speaker notes (if added)
- Timer

## Key Topics Covered

### 1. What is MCP?

The presentation explains:
- Model Context Protocol fundamentals
- How ChatGPT apps differ from traditional apps
- Tool-based architecture
- Natural language intent interpretation

### 2. TechGear Architecture

Visual breakdown of:
- Three-part architecture (MCP/Widget/Playground)
- Monorepo structure benefits
- Why Next.js is required
- Package organization

### 3. Widget Development

Step-by-step guide through:
- Data modeling and filtering logic
- Zod schema creation and validation
- Event-driven React hooks (`useSyncExternalStore`)
- React component development
- AI prompt engineering
- MCP registration logic

### 4. Critical Configurations

Deep dives into:
- **Asset Prefix**: Why it's critical and how it works
- **Event-Driven Reactivity**: `useSyncExternalStore` vs polling
- **MIME Types**: The `text/html+skybridge` requirement
- **Metadata**: Complete `_meta` fields everywhere
- **Response Format**: Simplified structure with `structuredContent`

### 5. Testing Strategy

Three-stage approach:
- **Preview Pages**: Quick visual testing
- **MCPJam Inspector**: Full protocol testing with debugging
- **ChatGPT**: Real-world testing

### 6. Troubleshooting

Common issues covered:
- Blank widget (asset prefix missing)
- Loading forever (reactivity issue)
- Shows JSON (MIME type wrong)
- Tool not called (poor descriptions)

## Customization

### Modifying Content

Edit `slides.md` to update content. Each slide is separated by `---`.

Example:
```markdown
---
layout: center
---

# Your Title

Your content here

<v-click>

This appears on click

</v-click>

---

# Next Slide
```

### Adding Images

1. Place images in `./public/` directory
2. Reference in slides: `![alt text](/image.png)`
3. Or use HTML: `<img src="/image.png" class="mx-auto" />`

### Code Highlighting

Use triple backticks with language and line highlighting:

````markdown
```typescript {1-5|7-10|12}
// Code here
// Lines 1-5 highlight first
// Then lines 7-10
// Then line 12
```
````

### Layouts

Available layouts (specified in slide frontmatter):
- `default`: Standard layout
- `center`: Centered content
- `two-cols`: Two columns (use `::right::` separator)
- `image-right`: Content left, image right
- `quote`: Large quote display
- `end`: End slide

## Best Practices for Presenting

### For Live Presentations

1. **Open presenter mode** (P key) before starting
2. **Test navigation** beforehand
3. **Have fallback PDF** in case of technical issues
4. **Use overview mode** (O key) to jump to sections
5. **Enable dark mode** (D key) for better screen visibility

### For Self-Paced Learning

1. Read through slides at your own pace
2. Follow along with code examples in the actual project
3. Use the Developer Guide for deeper explanations
4. Try building the TechGear project alongside the presentation

### For Workshops

1. **Introduction (10 min)**: Slides 1-10
2. **Live Coding (30 min)**: Follow slides 11-25, build widget together
3. **Configuration (10 min)**: Slides 26-30, critical configs
4. **Testing Demo (15 min)**: Slides 31-36, show Inspector
5. **Q&A (15 min)**: Slides 37-40, best practices

## Integration with Developer Guide

The presentation is designed to complement the `DEVELOPER_GUIDE.md`:

| Presentation | Developer Guide |
|--------------|-----------------|
| Visual overview | Detailed explanations |
| Code snippets | Complete code listings |
| Key concepts | Step-by-step instructions |
| Quick reference | Comprehensive troubleshooting |
| 40 slides | 2800 lines of documentation |

**Recommended workflow:**
1. Watch/read presentation for overview
2. Follow Developer Guide for implementation
3. Reference presentation for quick lookups

## Technical Details

### Dependencies

- **Slidev**: Modern slide deck framework
- **Vue 3**: Powers Slidev's reactive features
- **Vite**: Fast development server
- **Shiki**: Code syntax highlighting
- **Mermaid**: Diagram rendering

### Browser Compatibility

Works in:
- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Opera

Requires JavaScript enabled.

### Export Formats

#### PDF Export
```bash
npm run slides:export
```
Generates: `slides-export.pdf`

Best for:
- Sharing with others
- Offline viewing
- Printing handouts

#### Static Site
```bash
npm run slides:build
```
Output: `dist/` folder

Best for:
- Hosting online
- Sharing via URL
- Self-paced learning

Deploy to:
- Vercel
- Netlify
- GitHub Pages
- Any static host

## Resources

### Slidev Resources
- [Official Documentation](https://sli.dev/)
- [Themes Gallery](https://sli.dev/themes/gallery.html)
- [Addons](https://sli.dev/addons/use.html)

### Related Project Docs
- [Developer Guide](../DEVELOPER_GUIDE.md) - Full implementation guide
- [Quick Reference](./QUICK_REFERENCE.md) - Command cheat sheet
- [Project README](../README.md) - Project overview

### Learning Resources
- [OpenAI Apps SDK](https://developers.openai.com/apps-sdk)
- [MCP Specification](https://spec.modelcontextprotocol.io/)
- [MCPJam Inspector](https://docs.mcpjam.com/)

## Contributing

To improve the presentation:

1. Edit `slides.md`
2. Test locally: `npm run dev`
3. Verify all code examples work
4. Check slide transitions
5. Test presenter mode
6. Export PDF to verify formatting

## Support

For issues with:
- **Presentation content**: Check Developer Guide for detailed info
- **Slidev features**: See [Slidev docs](https://sli.dev/)
- **TechGear project**: See main README

## License

Same as the TechGear project (MIT)

