# Contributing to onTune

First off, thank you for considering contributing to onTune! It's people like you that make onTune such a great tool for Discord communities.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Style Guidelines](#style-guidelines)
- [Testing Guidelines](#testing-guidelines)
- [Documentation Guidelines](#documentation-guidelines)
- [Community](#community)

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [conduct@ontune.bot](mailto:conduct@ontune.bot).

## Getting Started

### Prerequisites

- Node.js 18.17.0 or higher
- npm 9.0.0 or higher
- Git
- A Discord application and bot token
- Basic knowledge of JavaScript and Discord.js

### First Time Setup

1. **Fork the repository**
   ```bash
   # Click the "Fork" button on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/onTune.git
   cd onTune
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/onTune.git
   ```

4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

6. **Run tests**
   ```bash
   npm test
   ```

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, please include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples to demonstrate the steps**
- **Describe the behavior you observed and what behavior you expected**
- **Include screenshots if applicable**
- **Include your environment details** (OS, Node.js version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a step-by-step description of the suggested enhancement**
- **Provide specific examples to demonstrate the enhancement**
- **Describe the current behavior and explain the behavior you expected**
- **Explain why this enhancement would be useful**

### Your First Code Contribution

Unsure where to begin? You can start by looking through these issues:

- **Good First Issue** - issues that are good for newcomers
- **Help Wanted** - issues that need assistance
- **Bug** - confirmed bugs that need fixing
- **Enhancement** - new features or improvements

### Pull Requests

Pull requests are the best way to propose changes to the codebase. We actively welcome your pull requests:

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. If you've changed APIs, update the documentation
4. Ensure the test suite passes
5. Make sure your code lints
6. Issue that pull request!

## Development Setup

### Environment Configuration

1. **Copy environment template**
   ```bash
   cp .env.example .env
   ```

2. **Configure your environment variables**
   ```env
   DISCORD_TOKEN=your_bot_token_here
   DISCORD_CLIENT_ID=your_client_id_here
   GUILD_ID=your_test_guild_id_here
   NODE_ENV=development
   ```

### Development Commands

```bash
# Start development server
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check

# Run type checking (if using TypeScript)
npm run type-check

# Build for production
npm run build

# Start production server
npm start
```

### Project Structure

```
onTune/
├── src/
│   ├── commands/          # Slash commands
│   ├── events/            # Discord event handlers
│   ├── services/          # Business logic services
│   ├── utils/             # Utility functions
│   ├── config/            # Configuration files
│   ├── middleware/        # Express middleware
│   ├── routes/            # API routes
│   └── bot.js             # Main bot file
├── tests/
│   ├── unit/              # Unit tests
│   ├── integration/       # Integration tests
│   └── e2e/               # End-to-end tests
├── docs/                  # Documentation
├── scripts/               # Build and utility scripts
└── public/                # Static web assets
```

## Pull Request Process

### Before Submitting

1. **Update your fork**
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Write clear, concise commit messages
   - Follow the coding style guidelines
   - Add tests for new functionality
   - Update documentation as needed

4. **Test your changes**
   ```bash
   npm test
   npm run lint
   npm run format:check
   ```

5. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new music command"
   ```

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

### Submitting the Pull Request

1. **Create the pull request**
   - Go to your fork on GitHub
   - Click "New pull request"
   - Select your feature branch
   - Fill out the pull request template

2. **Pull request checklist**
   - [ ] Tests pass locally
   - [ ] Code follows style guidelines
   - [ ] Self-review completed
   - [ ] Documentation updated
   - [ ] No merge conflicts
   - [ ] Descriptive title and description

### Review Process

1. **Automated checks**
   - CI/CD pipeline runs automatically
   - Code quality checks
   - Security scans
   - Test coverage reports

2. **Code review**
   - At least one maintainer review required
   - Address feedback promptly
   - Make requested changes
   - Re-request review when ready

3. **Merge**
   - Maintainer will merge when approved
   - Squash and merge is preferred
   - Delete feature branch after merge

## Style Guidelines

### JavaScript Style Guide

We use ESLint and Prettier to enforce consistent code style:

- **Indentation**: 2 spaces
- **Quotes**: Single quotes for strings
- **Semicolons**: Always use semicolons
- **Line length**: Maximum 120 characters
- **Naming**: camelCase for variables and functions, PascalCase for classes

### Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(music): add shuffle command
fix(queue): resolve queue persistence issue
docs(api): update API documentation
test(commands): add tests for play command
```

### Code Style Examples

```javascript
// Good
const musicService = new MusicService();
const queue = await musicService.getQueue(guildId);

if (queue.isEmpty()) {
  return interaction.reply('Queue is empty!');
}

// Bad
const music_service = new MusicService()
const queue = await music_service.getQueue(guildId)

if(queue.isEmpty()){
  return interaction.reply("Queue is empty!")
}
```

## Testing Guidelines

### Test Structure

- **Unit tests**: Test individual functions and classes
- **Integration tests**: Test component interactions
- **End-to-end tests**: Test complete user workflows

### Writing Tests

```javascript
// Example unit test
describe('MusicService', () => {
  describe('addToQueue', () => {
    it('should add song to queue', async () => {
      const service = new MusicService();
      const song = { title: 'Test Song', url: 'https://example.com' };
      
      await service.addToQueue('guild123', song);
      const queue = await service.getQueue('guild123');
      
      expect(queue.songs).toContain(song);
    });
  });
});
```

### Test Coverage

- Aim for at least 80% code coverage
- Focus on critical paths and edge cases
- Mock external dependencies
- Test error conditions

## Documentation Guidelines

### Code Documentation

- Use JSDoc for function and class documentation
- Include parameter types and return types
- Provide usage examples for complex functions

```javascript
/**
 * Adds a song to the guild's music queue
 * @param {string} guildId - The Discord guild ID
 * @param {Object} song - The song object to add
 * @param {string} song.title - The song title
 * @param {string} song.url - The song URL
 * @returns {Promise<Queue>} The updated queue
 * @throws {Error} When guild is not found
 */
async function addToQueue(guildId, song) {
  // Implementation
}
```

### README Updates

- Keep README.md up to date with new features
- Include clear installation and usage instructions
- Add examples for new commands or features

## Community

### Getting Help

- **Discord**: Join our [Discord server](https://discord.gg/ontune) for real-time help
- **GitHub Discussions**: Use GitHub Discussions for questions and ideas
- **Issues**: Create an issue for bugs or feature requests

### Communication Guidelines

- Be respectful and inclusive
- Use clear and descriptive language
- Provide context and examples
- Be patient with responses
- Help others when you can

### Recognition

Contributors are recognized in several ways:

- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Special role in Discord server
- Annual contributor appreciation

## Development Tips

### Debugging

```javascript
// Use debug logging
const debug = require('debug')('ontune:music');
debug('Adding song to queue: %o', song);

// Use breakpoints in VS Code
// Set NODE_ENV=development for detailed logs
```

### Performance

- Profile code with `console.time()`
- Use async/await properly
- Avoid blocking operations
- Cache frequently accessed data

### Security

- Never commit secrets or tokens
- Validate all user inputs
- Use parameterized queries
- Follow security best practices

## Release Process

### Versioning

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Checklist

- [ ] All tests pass
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version bumped
- [ ] Release notes prepared
- [ ] Security review completed

## Questions?

Don't hesitate to ask questions! We're here to help:

- **Discord**: [onTune Support Server](https://discord.gg/ontune)
- **Email**: [support@ontune.bot](mailto:support@ontune.bot)
- **GitHub**: Create an issue or discussion

Thank you for contributing to onTune! 🎵