# TechGear Presentation

An interactive presentation on building ChatGPT apps with the Model Context Protocol (MCP).

## Overview

This presentation covers:

- What ChatGPT apps are and how they work
- The Model Context Protocol (MCP) fundamentals
- Architecture and project structure
- Step-by-step widget development
- Critical configurations and troubleshooting
- Testing strategies (Preview → Inspector → ChatGPT)
- Best practices and scaling

## Getting Started

### Install Dependencies

```bash
cd docs
npm install
```

### Run the Presentation

```bash
npm run dev
```

This will start the Slidev development server at `http://localhost:3030`

### Navigation

- **Space** or **→**: Next slide
- **←**: Previous slide
- **O**: Toggle slide overview
- **D**: Toggle dark mode
- **F**: Toggle fullscreen
- **G**: Go to specific slide
- **P**: Presenter mode (shows notes)

## Building for Production

### Export as PDF

```bash
npm run export
```

Generates `slides-export.pdf`

### Build Static Site

```bash
npm run build
```

Outputs to `dist/` folder for hosting

## Customization

### Theme

The presentation uses the default Slidev theme. You can customize it by:

1. Creating `./theme/` directory
2. Adding custom styles in `./style.css`
3. Modifying theme settings in the frontmatter of `slides.md`

### Content

Edit `slides.md` to modify the presentation content. Slides are separated by `---`.

## Tips

- **Images**: Place images in `./public/` and reference as `/image.png`
- **Code Highlighting**: Supported via Shiki with line numbers
- **Animations**: Use `<v-click>` for click-based animations
- **Diagrams**: Mermaid diagrams are supported with triple-backtick mermaid blocks
- **Layouts**: Use `layout:` frontmatter to change slide layouts

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `space` / `→` | Next slide |
| `←` | Previous slide |
| `↑` | Previous slide (alternative) |
| `↓` | Next slide (alternative) |
| `o` | Toggle overview |
| `d` | Toggle dark mode |
| `g` | Go to slide |
| `f` | Toggle fullscreen |

## Resources

- [Slidev Documentation](https://sli.dev/)
- [Developer Guide](../DEVELOPER_GUIDE.md)
- [Project README](../README.md)

## License

Same as the TechGear project

