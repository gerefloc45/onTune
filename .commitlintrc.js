module.exports = {
  extends: ['@commitlint/config-conventional'],
  
  rules: {
    // Tipo di commit obbligatorio
    'type-enum': [
      2,
      'always',
      [
        'feat',     // Nuova funzionalità
        'fix',      // Correzione bug
        'docs',     // Documentazione
        'style',    // Formattazione, punto e virgola mancanti, ecc.
        'refactor', // Refactoring del codice
        'perf',     // Miglioramenti delle performance
        'test',     // Aggiunta o correzione test
        'build',    // Modifiche al sistema di build
        'ci',       // Modifiche ai file di CI
        'chore',    // Manutenzione generale
        'revert',   // Revert di commit precedenti
        'hotfix',   // Correzioni urgenti
        'release',  // Release/versioning
        'config',   // Modifiche configurazione
        'deps',     // Aggiornamento dipendenze
        'security', // Correzioni di sicurezza
        'ui',       // Modifiche interfaccia utente
        'ux',       // Miglioramenti user experience
        'a11y',     // Miglioramenti accessibilità
        'i18n',     // Internazionalizzazione
        'analytics',// Analytics e tracking
        'seo',      // Ottimizzazioni SEO
        'db',       // Modifiche database
        'api',      // Modifiche API
        'wip'       // Work in progress (da evitare in main)
      ]
    ],
    
    // Lunghezza massima del subject
    'subject-max-length': [2, 'always', 72],
    
    // Lunghezza minima del subject
    'subject-min-length': [2, 'always', 10],
    
    // Il subject non deve finire con un punto
    'subject-full-stop': [2, 'never', '.'],
    
    // Il subject deve essere in lowercase
    'subject-case': [2, 'always', 'lower-case'],
    
    // Il tipo deve essere in lowercase
    'type-case': [2, 'always', 'lower-case'],
    
    // Il tipo è obbligatorio
    'type-empty': [2, 'never'],
    
    // Il subject è obbligatorio
    'subject-empty': [2, 'never'],
    
    // Lunghezza massima dell'header
    'header-max-length': [2, 'always', 100],
    
    // Lunghezza massima delle righe del body
    'body-max-line-length': [2, 'always', 100],
    
    // Lunghezza massima delle righe del footer
    'footer-max-line-length': [2, 'always', 100],
    
    // Riga vuota obbligatoria prima del body
    'body-leading-blank': [2, 'always'],
    
    // Riga vuota obbligatoria prima del footer
    'footer-leading-blank': [2, 'always']
  },
  
  // Configurazione per scope personalizzati
  'scope-enum': [
    2,
    'always',
    [
      'bot',        // Core bot functionality
      'music',      // Sistema musicale
      'queue',      // Gestione code
      'voice',      // Connessioni vocali
      'web',        // Dashboard web
      'api',        // API endpoints
      'config',     // Configurazione
      'cache',      // Sistema di cache
      'db',         // Database
      'auth',       // Autenticazione
      'security',   // Sicurezza
      'logging',    // Sistema di logging
      'monitoring', // Monitoraggio
      'metrics',    // Metriche
      'performance',// Performance
      'memory',     // Gestione memoria
      'error',      // Gestione errori
      'validation', // Validazione
      'utils',      // Utilities
      'helpers',    // Helper functions
      'middleware', // Middleware
      'routes',     // Route web
      'commands',   // Comandi Discord
      'events',     // Event handlers
      'managers',   // Manager classes
      'services',   // Services
      'controllers',// Controllers
      'models',     // Data models
      'schemas',    // Validation schemas
      'types',      // Type definitions
      'interfaces', // Interfaces
      'constants',  // Costanti
      'enums',      // Enumerazioni
      'tests',      // Test
      'mocks',      // Mock objects
      'fixtures',   // Test fixtures
      'docs',       // Documentazione
      'readme',     // README files
      'changelog',  // Changelog
      'license',    // Licenza
      'package',    // Package.json
      'deps',       // Dipendenze
      'scripts',    // Scripts
      'build',      // Build system
      'ci',         // Continuous Integration
      'cd',         // Continuous Deployment
      'docker',     // Docker
      'k8s',        // Kubernetes
      'deploy',     // Deployment
      'env',        // Environment
      'lint',       // Linting
      'format',     // Formatting
      'git',        // Git configuration
      'github',     // GitHub specific
      'vscode',     // VS Code configuration
      'editor',     // Editor configuration
      'workflow',   // GitHub workflows
      'release',    // Release process
      'version',    // Versioning
      'migration',  // Data migration
      'backup',     // Backup system
      'restore',    // Restore system
      'cleanup',    // Cleanup tasks
      'maintenance',// Manutenzione
      'health',     // Health checks
      'status',     // Status monitoring
      'dashboard',  // Dashboard
      'ui',         // User Interface
      'ux',         // User Experience
      'design',     // Design
      'style',      // Styling
      'theme',      // Theming
      'responsive', // Responsive design
      'mobile',     // Mobile specific
      'desktop',    // Desktop specific
      'accessibility', // Accessibilità
      'i18n',       // Internazionalizzazione
      'l10n',       // Localizzazione
      'analytics',  // Analytics
      'tracking',   // Tracking
      'seo',        // SEO
      'meta',       // Meta tags
      'social',     // Social media
      'embed',      // Embeds
      'webhook',    // Webhooks
      'integration',// Integrazioni
      'plugin',     // Plugin
      'extension',  // Estensioni
      'addon',      // Add-ons
      'feature',    // Feature flags
      'experiment', // Esperimenti
      'beta',       // Funzionalità beta
      'alpha',      // Funzionalità alpha
      'prototype',  // Prototipi
      'poc',        // Proof of concept
      'demo',       // Demo
      'example',    // Esempi
      'tutorial',   // Tutorial
      'guide',      // Guide
      'reference',  // Riferimenti
      'spec',       // Specifiche
      'rfc',        // Request for Comments
      'proposal',   // Proposte
      'discussion', // Discussioni
      'feedback',   // Feedback
      'review',     // Review
      'audit',      // Audit
      'compliance', // Compliance
      'legal',      // Aspetti legali
      'privacy',    // Privacy
      'gdpr',       // GDPR
      'terms',      // Termini di servizio
      'policy',     // Policy
      'guidelines', // Linee guida
      'standards',  // Standard
      'conventions',// Convenzioni
      'best-practices', // Best practices
      'optimization',   // Ottimizzazioni
      'refactoring',    // Refactoring
      'cleanup',        // Pulizia codice
      'debt',           // Technical debt
      'legacy',         // Codice legacy
      'deprecated',     // Funzionalità deprecate
      'breaking',       // Breaking changes
      'migration-guide',// Guide di migrazione
      'upgrade',        // Upgrade
      'downgrade',      // Downgrade
      'rollback',       // Rollback
      'hotfix',         // Hotfix
      'patch',          // Patch
      'emergency',      // Emergenza
      'critical',       // Critico
      'urgent',         // Urgente
      'blocker',        // Blocker
      'regression',     // Regressione
      'workaround',     // Workaround
      'temporary',      // Temporaneo
      'experimental',   // Sperimentale
      'research',       // Ricerca
      'investigation',  // Investigazione
      'analysis',       // Analisi
      'benchmark',      // Benchmark
      'profiling',      // Profiling
      'debugging',      // Debugging
      'troubleshooting',// Troubleshooting
      'support',        // Supporto
      'help',           // Aiuto
      'faq',            // FAQ
      'community',      // Community
      'contribution',   // Contributi
      'collaboration',  // Collaborazione
      'team',           // Team
      'process',        // Processi
      'workflow',       // Workflow
      'automation',     // Automazione
      'tooling',        // Tooling
      'infrastructure', // Infrastruttura
      'devops',         // DevOps
      'ops',            // Operations
      'monitoring',     // Monitoraggio
      'alerting',       // Alerting
      'notification',   // Notifiche
      'communication',  // Comunicazione
      'messaging',      // Messaging
      'email',          // Email
      'sms',            // SMS
      'push',           // Push notifications
      'realtime',       // Real-time
      'websocket',      // WebSocket
      'sse',            // Server-Sent Events
      'streaming',      // Streaming
      'batch',          // Batch processing
      'queue',          // Queue processing
      'worker',         // Worker processes
      'scheduler',      // Scheduler
      'cron',           // Cron jobs
      'task',           // Tasks
      'job',            // Jobs
      'background',     // Background processes
      'async',          // Async operations
      'sync',           // Sync operations
      'concurrent',     // Concurrency
      'parallel',       // Parallelism
      'distributed',    // Distributed systems
      'microservice',   // Microservices
      'monolith',       // Monolith
      'architecture',   // Architettura
      'design-pattern', // Design patterns
      'solid',          // SOLID principles
      'dry',            // DRY principle
      'kiss',           // KISS principle
      'yagni',          // YAGNI principle
      'clean-code',     // Clean code
      'readable',       // Leggibilità
      'maintainable',   // Manutenibilità
      'scalable',       // Scalabilità
      'extensible',     // Estensibilità
      'flexible',       // Flessibilità
      'robust',         // Robustezza
      'reliable',       // Affidabilità
      'stable',         // Stabilità
      'consistent',     // Consistenza
      'predictable',    // Prevedibilità
      'deterministic',  // Deterministico
      'idempotent',     // Idempotente
      'stateless',      // Stateless
      'stateful',       // Stateful
      'immutable',      // Immutabile
      'functional',     // Programmazione funzionale
      'oop',            // Object-Oriented Programming
      'procedural',     // Programmazione procedurale
      'declarative',    // Programmazione dichiarativa
      'imperative',     // Programmazione imperativa
      'reactive',       // Programmazione reattiva
      'event-driven',   // Event-driven
      'data-driven',    // Data-driven
      'model-driven',   // Model-driven
      'test-driven',    // Test-driven development
      'behavior-driven',// Behavior-driven development
      'domain-driven',  // Domain-driven design
      'api-first',      // API-first
      'mobile-first',   // Mobile-first
      'cloud-first',    // Cloud-first
      'security-first', // Security-first
      'privacy-first',  // Privacy-first
      'performance-first', // Performance-first
      'accessibility-first', // Accessibility-first
      'user-first',     // User-first
      'developer-experience', // Developer experience
      'user-experience',      // User experience
      'customer-experience',  // Customer experience
      'business-logic',       // Business logic
      'domain-logic',         // Domain logic
      'application-logic',    // Application logic
      'presentation-logic',   // Presentation logic
      'data-access',          // Data access
      'persistence',          // Persistence
      'serialization',        // Serialization
      'deserialization',      // Deserialization
      'encoding',             // Encoding
      'decoding',             // Decoding
      'compression',          // Compression
      'decompression',        // Decompression
      'encryption',           // Encryption
      'decryption',           // Decryption
      'hashing',              // Hashing
      'signing',              // Digital signing
      'verification',         // Verification
      'authentication',       // Authentication
      'authorization',        // Authorization
      'permission',           // Permissions
      'role',                 // Roles
      'access-control',       // Access control
      'session',              // Session management
      'token',                // Token management
      'jwt',                  // JSON Web Tokens
      'oauth',                // OAuth
      'saml',                 // SAML
      'sso',                  // Single Sign-On
      'mfa',                  // Multi-Factor Authentication
      '2fa',                  // Two-Factor Authentication
      'captcha',              // CAPTCHA
      'rate-limiting',        // Rate limiting
      'throttling',           // Throttling
      'circuit-breaker',      // Circuit breaker
      'retry',                // Retry logic
      'timeout',              // Timeout handling
      'fallback',             // Fallback mechanisms
      'graceful-degradation', // Graceful degradation
      'fault-tolerance',      // Fault tolerance
      'disaster-recovery',    // Disaster recovery
      'high-availability',    // High availability
      'load-balancing',       // Load balancing
      'auto-scaling',         // Auto scaling
      'horizontal-scaling',   // Horizontal scaling
      'vertical-scaling',     // Vertical scaling
      'capacity-planning',    // Capacity planning
      'resource-management',  // Resource management
      'memory-management',    // Memory management
      'garbage-collection',   // Garbage collection
      'leak-detection',       // Memory leak detection
      'profiling',            // Performance profiling
      'benchmarking',         // Benchmarking
      'load-testing',         // Load testing
      'stress-testing',       // Stress testing
      'penetration-testing',  // Penetration testing
      'vulnerability-testing',// Vulnerability testing
      'security-testing',     // Security testing
      'usability-testing',    // Usability testing
      'accessibility-testing',// Accessibility testing
      'compatibility-testing',// Compatibility testing
      'cross-browser',        // Cross-browser testing
      'cross-platform',       // Cross-platform testing
      'regression-testing',   // Regression testing
      'smoke-testing',        // Smoke testing
      'sanity-testing',       // Sanity testing
      'integration-testing',  // Integration testing
      'end-to-end-testing',   // End-to-end testing
      'unit-testing',         // Unit testing
      'component-testing',    // Component testing
      'contract-testing',     // Contract testing
      'property-testing',     // Property-based testing
      'mutation-testing',     // Mutation testing
      'fuzz-testing',         // Fuzz testing
      'chaos-engineering',    // Chaos engineering
      'canary-deployment',    // Canary deployment
      'blue-green-deployment',// Blue-green deployment
      'rolling-deployment',   // Rolling deployment
      'feature-flag',         // Feature flags
      'a-b-testing',          // A/B testing
      'multivariate-testing', // Multivariate testing
      'experimentation',      // Experimentation
      'data-science',         // Data science
      'machine-learning',     // Machine learning
      'artificial-intelligence', // Artificial intelligence
      'natural-language-processing', // Natural language processing
      'computer-vision',      // Computer vision
      'deep-learning',        // Deep learning
      'neural-network',       // Neural networks
      'algorithm',            // Algorithms
      'data-structure',       // Data structures
      'optimization',         // Optimization
      'complexity',           // Complexity analysis
      'big-o',                // Big O notation
      'time-complexity',      // Time complexity
      'space-complexity',     // Space complexity
      'trade-off',            // Trade-offs
      'decision',             // Decision making
      'strategy',             // Strategy
      'pattern',              // Patterns
      'anti-pattern',         // Anti-patterns
      'smell',                // Code smells
      'violation',            // Violations
      'warning',              // Warnings
      'error',                // Errors
      'exception',            // Exceptions
      'bug',                  // Bugs
      'defect',               // Defects
      'issue',                // Issues
      'problem',              // Problems
      'solution',             // Solutions
      'fix',                  // Fixes
      'patch',                // Patches
      'update',               // Updates
      'upgrade',              // Upgrades
      'enhancement',          // Enhancements
      'improvement',          // Improvements
      'feature',              // Features
      'functionality',        // Functionality
      'capability',           // Capabilities
      'requirement',          // Requirements
      'specification',        // Specifications
      'acceptance-criteria',  // Acceptance criteria
      'user-story',           // User stories
      'epic',                 // Epics
      'milestone',            // Milestones
      'roadmap',              // Roadmap
      'planning',             // Planning
      'estimation',           // Estimation
      'tracking',             // Tracking
      'reporting',            // Reporting
      'dashboard',            // Dashboard
      'visualization',        // Visualization
      'chart',                // Charts
      'graph',                // Graphs
      'table',                // Tables
      'list',                 // Lists
      'grid',                 // Grids
      'form',                 // Forms
      'input',                // Inputs
      'output',               // Outputs
      'display',              // Display
      'render',               // Rendering
      'layout',               // Layout
      'positioning',          // Positioning
      'alignment',            // Alignment
      'spacing',              // Spacing
      'margin',               // Margins
      'padding',              // Padding
      'border',               // Borders
      'background',           // Backgrounds
      'color',                // Colors
      'typography',           // Typography
      'font',                 // Fonts
      'icon',                 // Icons
      'image',                // Images
      'video',                // Videos
      'audio',                // Audio
      'media',                // Media
      'content',              // Content
      'text',                 // Text
      'copy',                 // Copy
      'label',                // Labels
      'placeholder',          // Placeholders
      'tooltip',              // Tooltips
      'modal',                // Modals
      'dialog',               // Dialogs
      'popup',                // Popups
      'dropdown',             // Dropdowns
      'menu',                 // Menus
      'navigation',           // Navigation
      'breadcrumb',           // Breadcrumbs
      'pagination',           // Pagination
      'search',               // Search
      'filter',               // Filters
      'sort',                 // Sorting
      'group',                // Grouping
      'category',             // Categories
      'tag',                  // Tags
      'label',                // Labels
      'badge',                // Badges
      'status',               // Status
      'state',                // State
      'condition',            // Conditions
      'flag',                 // Flags
      'toggle',               // Toggles
      'switch',               // Switches
      'button',               // Buttons
      'link',                 // Links
      'anchor',               // Anchors
      'reference',            // References
      'pointer',              // Pointers
      'cursor',               // Cursors
      'selection',            // Selection
      'highlight',            // Highlighting
      'focus',                // Focus
      'hover',                // Hover
      'active',               // Active state
      'disabled',             // Disabled state
      'enabled',              // Enabled state
      'visible',              // Visibility
      'hidden',               // Hidden
      'show',                 // Show
      'hide',                 // Hide
      'toggle',               // Toggle
      'expand',               // Expand
      'collapse',             // Collapse
      'open',                 // Open
      'close',                // Close
      'minimize',             // Minimize
      'maximize',             // Maximize
      'resize',               // Resize
      'move',                 // Move
      'drag',                 // Drag
      'drop',                 // Drop
      'scroll',               // Scroll
      'zoom',                 // Zoom
      'pan',                  // Pan
      'rotate',               // Rotate
      'transform',            // Transform
      'transition',           // Transitions
      'animation',            // Animations
      'effect',               // Effects
      'interaction',          // Interactions
      'gesture',              // Gestures
      'touch',                // Touch
      'mouse',                // Mouse
      'keyboard',             // Keyboard
      'voice',                // Voice
      'speech',               // Speech
      'accessibility',        // Accessibility
      'screen-reader',        // Screen readers
      'keyboard-navigation',  // Keyboard navigation
      'high-contrast',        // High contrast
      'large-text',           // Large text
      'reduced-motion',       // Reduced motion
      'color-blind',          // Color blindness
      'internationalization', // Internationalization
      'localization',         // Localization
      'translation',          // Translation
      'language',             // Language
      'locale',               // Locale
      'region',               // Region
      'timezone',             // Timezone
      'date',                 // Date
      'time',                 // Time
      'datetime',             // DateTime
      'format',               // Formatting
      'parse',                // Parsing
      'validate',             // Validation
      'sanitize',             // Sanitization
      'normalize',            // Normalization
      'transform',            // Transformation
      'convert',              // Conversion
      'map',                  // Mapping
      'reduce',               // Reduction
      'filter',               // Filtering
      'sort',                 // Sorting
      'search',               // Searching
      'index',                // Indexing
      'cache',                // Caching
      'store',                // Storage
      'persist',              // Persistence
      'session',              // Session
      'cookie',               // Cookies
      'local-storage',        // Local storage
      'session-storage',      // Session storage
      'database',             // Database
      'sql',                  // SQL
      'nosql',                // NoSQL
      'query',                // Queries
      'transaction',          // Transactions
      'migration',            // Migrations
      'seed',                 // Seeding
      'fixture',              // Fixtures
      'mock',                 // Mocks
      'stub',                 // Stubs
      'spy',                  // Spies
      'fake',                 // Fakes
      'dummy',                // Dummies
      'placeholder',          // Placeholders
      'sample',               // Samples
      'example',              // Examples
      'demo',                 // Demos
      'prototype',            // Prototypes
      'proof-of-concept',     // Proof of concept
      'experiment',           // Experiments
      'research',             // Research
      'investigation',        // Investigation
      'analysis',             // Analysis
      'study',                // Studies
      'survey',               // Surveys
      'feedback',             // Feedback
      'review',               // Reviews
      'audit',                // Audits
      'assessment',           // Assessments
      'evaluation',           // Evaluations
      'measurement',          // Measurements
      'metric',               // Metrics
      'kpi',                  // Key Performance Indicators
      'benchmark',            // Benchmarks
      'baseline',             // Baselines
      'target',               // Targets
      'goal',                 // Goals
      'objective',            // Objectives
      'outcome',              // Outcomes
      'result',               // Results
      'output',               // Outputs
      'deliverable',          // Deliverables
      'artifact',             // Artifacts
      'asset',                // Assets
      'resource',             // Resources
      'tool',                 // Tools
      'utility',              // Utilities
      'helper',               // Helpers
      'library',              // Libraries
      'framework',            // Frameworks
      'platform',             // Platforms
      'service',              // Services
      'component',            // Components
      'module',               // Modules
      'package',              // Packages
      'bundle',               // Bundles
      'build',                // Builds
      'compile',              // Compilation
      'transpile',            // Transpilation
      'minify',               // Minification
      'optimize',             // Optimization
      'compress',             // Compression
      'bundle',               // Bundling
      'split',                // Code splitting
      'lazy-load',            // Lazy loading
      'preload',              // Preloading
      'prefetch',             // Prefetching
      'cache',                // Caching
      'cdn',                  // Content Delivery Network
      'edge',                 // Edge computing
      'cloud',                // Cloud computing
      'serverless',           // Serverless
      'container',            // Containers
      'docker',               // Docker
      'kubernetes',           // Kubernetes
      'orchestration',        // Orchestration
      'deployment',           // Deployment
      'provisioning',         // Provisioning
      'configuration',        // Configuration
      'environment',          // Environment
      'infrastructure',       // Infrastructure
      'network',              // Networking
      'security',             // Security
      'compliance',           // Compliance
      'governance',           // Governance
      'policy',               // Policies
      'procedure',            // Procedures
      'process',              // Processes
      'workflow',             // Workflows
      'pipeline',             // Pipelines
      'automation',           // Automation
      'orchestration',        // Orchestration
      'integration',          // Integration
      'synchronization',      // Synchronization
      'coordination',         // Coordination
      'collaboration',        // Collaboration
      'communication',        // Communication
      'documentation',        // Documentation
      'knowledge',            // Knowledge
      'training',             // Training
      'education',            // Education
      'learning',             // Learning
      'development',          // Development
      'growth',               // Growth
      'improvement',          // Improvement
      'evolution',            // Evolution
      'innovation',           // Innovation
      'creativity',           // Creativity
      'inspiration',          // Inspiration
      'motivation',           // Motivation
      'engagement',           // Engagement
      'satisfaction',         // Satisfaction
      'happiness',            // Happiness
      'well-being',           // Well-being
      'health',               // Health
      'wellness',             // Wellness
      'balance',              // Balance
      'harmony',              // Harmony
      'peace',                // Peace
      'calm',                 // Calm
      'focus',                // Focus
      'concentration',        // Concentration
      'attention',            // Attention
      'mindfulness',          // Mindfulness
      'awareness',            // Awareness
      'consciousness',        // Consciousness
      'understanding',        // Understanding
      'comprehension',        // Comprehension
      'insight',              // Insight
      'wisdom',               // Wisdom
      'knowledge',            // Knowledge
      'expertise',            // Expertise
      'skill',                // Skills
      'competency',           // Competencies
      'capability',           // Capabilities
      'capacity',             // Capacity
      'potential',            // Potential
      'opportunity',          // Opportunities
      'possibility',          // Possibilities
      'chance',               // Chances
      'risk',                 // Risks
      'threat',               // Threats
      'challenge',            // Challenges
      'obstacle',             // Obstacles
      'barrier',              // Barriers
      'limitation',           // Limitations
      'constraint',           // Constraints
      'restriction',          // Restrictions
      'boundary',             // Boundaries
      'scope',                // Scope
      'range',                // Range
      'scale',                // Scale
      'size',                 // Size
      'dimension',            // Dimensions
      'aspect',               // Aspects
      'perspective',          // Perspectives
      'viewpoint',            // Viewpoints
      'angle',                // Angles
      'approach',             // Approaches
      'method',               // Methods
      'technique',            // Techniques
      'strategy',             // Strategies
      'tactic',               // Tactics
      'plan',                 // Plans
      'scheme',               // Schemes
      'design',               // Design
      'architecture',         // Architecture
      'structure',            // Structure
      'organization',         // Organization
      'arrangement',          // Arrangement
      'layout',               // Layout
      'format',               // Format
      'style',                // Style
      'appearance',           // Appearance
      'look',                 // Look
      'feel',                 // Feel
      'experience',           // Experience
      'journey',              // Journey
      'path',                 // Path
      'route',                // Route
      'direction',            // Direction
      'destination',          // Destination
      'goal',                 // Goal
      'target',               // Target
      'aim',                  // Aim
      'purpose',              // Purpose
      'intention',            // Intention
      'objective',            // Objective
      'mission',              // Mission
      'vision',               // Vision
      'dream',                // Dream
      'aspiration',           // Aspiration
      'ambition',             // Ambition
      'desire',               // Desire
      'want',                 // Want
      'need',                 // Need
      'requirement',          // Requirement
      'demand',               // Demand
      'request',              // Request
      'ask',                  // Ask
      'question',             // Question
      'inquiry',              // Inquiry
      'investigation',        // Investigation
      'exploration',          // Exploration
      'discovery',            // Discovery
      'finding',              // Finding
      'result',               // Result
      'outcome',              // Outcome
      'consequence',          // Consequence
      'effect',               // Effect
      'impact',               // Impact
      'influence',            // Influence
      'change',               // Change
      'transformation',       // Transformation
      'evolution',            // Evolution
      'development',          // Development
      'progress',             // Progress
      'advancement',          // Advancement
      'improvement',          // Improvement
      'enhancement',          // Enhancement
      'upgrade',              // Upgrade
      'update',               // Update
      'revision',             // Revision
      'modification',         // Modification
      'adjustment',           // Adjustment
      'tweak',                // Tweak
      'fine-tune',            // Fine-tuning
      'calibration',          // Calibration
      'configuration',        // Configuration
      'setup',                // Setup
      'installation',         // Installation
      'deployment',           // Deployment
      'release',              // Release
      'launch',               // Launch
      'start',                // Start
      'begin',                // Begin
      'initiate',             // Initiate
      'commence',             // Commence
      'kick-off',             // Kick-off
      'bootstrap',            // Bootstrap
      'initialize',           // Initialize
      'create',               // Create
      'generate',             // Generate
      'produce',              // Produce
      'make',                 // Make
      'build',                // Build
      'construct',            // Construct
      'assemble',             // Assemble
      'compose',              // Compose
      'craft',                // Craft
      'design',               // Design
      'develop',              // Develop
      'implement',            // Implement
      'execute',              // Execute
      'run',                  // Run
      'operate',              // Operate
      'function',             // Function
      'work',                 // Work
      'perform',              // Perform
      'act',                  // Act
      'behave',               // Behave
      'respond',              // Respond
      'react',                // React
      'interact',             // Interact
      'engage',               // Engage
      'participate',          // Participate
      'contribute',           // Contribute
      'collaborate',          // Collaborate
      'cooperate',            // Cooperate
      'coordinate',           // Coordinate
      'synchronize',          // Synchronize
      'align',                // Align
      'match',                // Match
      'fit',                  // Fit
      'suit',                 // Suit
      'adapt',                // Adapt
      'adjust',               // Adjust
      'modify',               // Modify
      'change',               // Change
      'alter',                // Alter
      'transform',            // Transform
      'convert',              // Convert
      'translate',            // Translate
      'interpret',            // Interpret
      'understand',           // Understand
      'comprehend',           // Comprehend
      'grasp',                // Grasp
      'realize',              // Realize
      'recognize',            // Recognize
      'identify',             // Identify
      'detect',               // Detect
      'discover',             // Discover
      'find',                 // Find
      'locate',               // Locate
      'search',               // Search
      'seek',                 // Seek
      'look',                 // Look
      'see',                  // See
      'view',                 // View
      'observe',              // Observe
      'watch',                // Watch
      'monitor',              // Monitor
      'track',                // Track
      'follow',               // Follow
      'trace',                // Trace
      'record',               // Record
      'log',                  // Log
      'capture',              // Capture
      'collect',              // Collect
      'gather',               // Gather
      'accumulate',           // Accumulate
      'aggregate',            // Aggregate
      'combine',              // Combine
      'merge',                // Merge
      'join',                 // Join
      'connect',              // Connect
      'link',                 // Link
      'associate',            // Associate
      'relate',               // Relate
      'correlate',            // Correlate
      'compare',              // Compare
      'contrast',             // Contrast
      'differentiate',        // Differentiate
      'distinguish',          // Distinguish
      'separate',             // Separate
      'divide',               // Divide
      'split',                // Split
      'break',                // Break
      'fragment',             // Fragment
      'decompose',            // Decompose
      'analyze',              // Analyze
      'examine',              // Examine
      'inspect',              // Inspect
      'review',               // Review
      'evaluate',             // Evaluate
      'assess',               // Assess
      'judge',                // Judge
      'measure',              // Measure
      'quantify',             // Quantify
      'calculate',            // Calculate
      'compute',              // Compute
      'process',              // Process
      'handle',               // Handle
      'manage',               // Manage
      'control',              // Control
      'govern',               // Govern
      'regulate',             // Regulate
      'rule',                 // Rule
      'guide',                // Guide
      'direct',               // Direct
      'lead',                 // Lead
      'command',              // Command
      'instruct',             // Instruct
      'teach',                // Teach
      'educate',              // Educate
      'train',                // Train
      'coach',                // Coach
      'mentor',               // Mentor
      'advise',               // Advise
      'counsel',              // Counsel
      'consult',              // Consult
      'recommend',            // Recommend
      'suggest',              // Suggest
      'propose',              // Propose
      'offer',                // Offer
      'provide',              // Provide
      'supply',               // Supply
      'deliver',              // Deliver
      'give',                 // Give
      'grant',                // Grant
      'allow',                // Allow
      'permit',               // Permit
      'enable',               // Enable
      'empower',              // Empower
      'facilitate',           // Facilitate
      'support',              // Support
      'assist',               // Assist
      'help',                 // Help
      'aid',                  // Aid
      'serve',                // Serve
      'benefit',              // Benefit
      'advantage',            // Advantage
      'value',                // Value
      'worth',                // Worth
      'importance',           // Importance
      'significance',         // Significance
      'relevance',            // Relevance
      'meaning',              // Meaning
      'purpose',              // Purpose
      'reason',               // Reason
      'cause',                // Cause
      'source',               // Source
      'origin',               // Origin
      'root',                 // Root
      'foundation',           // Foundation
      'base',                 // Base
      'core',                 // Core
      'center',               // Center
      'heart',                // Heart
      'essence',              // Essence
      'spirit',               // Spirit
      'soul',                 // Soul
      'character',            // Character
      'nature',               // Nature
      'quality',              // Quality
      'attribute',            // Attribute
      'property',             // Property
      'feature',              // Feature
      'characteristic',       // Characteristic
      'trait',                // Trait
      'aspect',               // Aspect
      'element',              // Element
      'component',            // Component
      'part',                 // Part
      'piece',                // Piece
      'section',              // Section
      'segment',              // Segment
      'portion',              // Portion
      'fraction',             // Fraction
      'share',                // Share
      'percentage',           // Percentage
      'ratio',                // Ratio
      'proportion',           // Proportion
      'balance',              // Balance
      'equilibrium',          // Equilibrium
      'stability',            // Stability
      'consistency',          // Consistency
      'reliability',          // Reliability
      'dependability',        // Dependability
      'trustworthiness',      // Trustworthiness
      'credibility',          // Credibility
      'authenticity',         // Authenticity
      'integrity',            // Integrity
      'honesty',              // Honesty
      'transparency',         // Transparency
      'openness',             // Openness
      'clarity',              // Clarity
      'simplicity',           // Simplicity
      'elegance',             // Elegance
      'beauty',               // Beauty
      'aesthetics',           // Aesthetics
      'design',               // Design
      'art',                  // Art
      'creativity',           // Creativity
      'innovation',           // Innovation
      'originality',          // Originality
      'uniqueness',           // Uniqueness
      'distinctiveness',      // Distinctiveness
      'individuality',        // Individuality
      'personality',          // Personality
      'identity',             // Identity
      'brand',                // Brand
      'image',                // Image
      'reputation',           // Reputation
      'status',               // Status
      'position',             // Position
      'rank',                 // Rank
      'level',                // Level
      'grade',                // Grade
      'class',                // Class
      'category',             // Category
      'type',                 // Type
      'kind',                 // Kind
      'sort',                 // Sort
      'variety',              // Variety
      'diversity',            // Diversity
      'range',                // Range
      'spectrum',             // Spectrum
      'scope',                // Scope
      'extent',               // Extent
      'reach',                // Reach
      'coverage',             // Coverage
      'span',                 // Span
      'breadth',              // Breadth
      'width',                // Width
      'depth',                // Depth
      'height',               // Height
      'length',               // Length
      'size',                 // Size
      'scale',                // Scale
      'magnitude',            // Magnitude
      'volume',               // Volume
      'capacity',             // Capacity
      'space',                // Space
      'room',                 // Room
      'area',                 // Area
      'zone',                 // Zone
      'region',               // Region
      'territory',            // Territory
      'domain',               // Domain
      'field',                // Field
      'sphere',               // Sphere
      'realm',                // Realm
      'world',                // World
      'universe',             // Universe
      'cosmos',               // Cosmos
      'infinity',             // Infinity
      'eternity',             // Eternity
      'forever',              // Forever
      'always',               // Always
      'never',                // Never
      'sometimes',            // Sometimes
      'often',                // Often
      'rarely',               // Rarely
      'seldom',               // Seldom
      'occasionally',         // Occasionally
      'frequently',           // Frequently
      'regularly',            // Regularly
      'consistently',         // Consistently
      'constantly',           // Constantly
      'continuously',         // Continuously
      'persistently',         // Persistently
      'steadily',             // Steadily
      'gradually',            // Gradually
      'slowly',               // Slowly
      'quickly',              // Quickly
      'rapidly',              // Rapidly
      'fast',                 // Fast
      'slow',                 // Slow
      'speed',                // Speed
      'velocity',             // Velocity
      'acceleration',         // Acceleration
      'momentum',             // Momentum
      'force',                // Force
      'power',                // Power
      'energy',               // Energy
      'strength',             // Strength
      'intensity',            // Intensity
      'pressure',             // Pressure
      'tension',              // Tension
      'stress',               // Stress
      'strain',               // Strain
      'load',                 // Load
      'burden',               // Burden
      'weight',               // Weight
      'mass',                 // Mass
      'density',              // Density
      'concentration',        // Concentration
      'focus',                // Focus
      'attention',            // Attention
      'awareness',            // Awareness
      'consciousness',        // Consciousness
      'mindfulness',          // Mindfulness
      'presence',             // Presence
      'existence',            // Existence
      'being',                // Being
      'life',                 // Life
      'living',               // Living
      'alive',                // Alive
      'active',               // Active
      'dynamic',              // Dynamic
      'vibrant',              // Vibrant
      'energetic',            // Energetic
      'lively',               // Lively
      'animated',             // Animated
      'spirited',             // Spirited
      'enthusiastic',         // Enthusiastic
      'passionate',           // Passionate
      'excited',              // Excited
      'thrilled',             // Thrilled
      'delighted',            // Delighted
      'pleased',              // Pleased
      'happy',                // Happy
      'joyful',               // Joyful
      'cheerful',             // Cheerful
      'positive',             // Positive
      'optimistic',           // Optimistic
      'hopeful',              // Hopeful
      'confident',            // Confident
      'assured',              // Assured
      'certain',              // Certain
      'sure',                 // Sure
      'definite',             // Definite
      'absolute',             // Absolute
      'complete',             // Complete
      'total',                // Total
      'full',                 // Full
      'entire',               // Entire
      'whole',                // Whole
      'all',                  // All
      'everything',           // Everything
      'nothing',              // Nothing
      'something',            // Something
      'anything',             // Anything
      'everyone',             // Everyone
      'nobody',               // Nobody
      'somebody',             // Somebody
      'anybody',              // Anybody
      'everywhere',           // Everywhere
      'nowhere',              // Nowhere
      'somewhere',            // Somewhere
      'anywhere',             // Anywhere
      'always',               // Always
      'never',                // Never
      'sometimes',            // Sometimes
      'anytime',              // Anytime
      'here',                 // Here
      'there',                // There
      'where',                // Where
      'when',                 // When
      'why',                  // Why
      'how',                  // How
      'what',                 // What
      'which',                // Which
      'who',                  // Who
      'whom',                 // Whom
      'whose',                // Whose
      'this',                 // This
      'that',                 // That
      'these',                // These
      'those',                // Those
      'such',                 // Such
      'same',                 // Same
      'different',            // Different
      'other',                // Other
      'another',              // Another
      'next',                 // Next
      'previous',             // Previous
      'first',                // First
      'last',                 // Last
      'initial',              // Initial
      'final',                // Final
      'beginning',            // Beginning
      'end',                  // End
      'start',                // Start
      'finish',               // Finish
      'complete',             // Complete
      'done',                 // Done
      'ready',                // Ready
      'prepared',             // Prepared
      'set',                  // Set
      'go',                   // Go
      'stop',                 // Stop
      'pause',                // Pause
      'wait',                 // Wait
      'continue',             // Continue
      'proceed',              // Proceed
      'advance',              // Advance
      'move',                 // Move
      'shift',                // Shift
      'change',               // Change
      'switch',               // Switch
      'turn',                 // Turn
      'rotate',               // Rotate
      'flip',                 // Flip
      'reverse',              // Reverse
      'invert',               // Invert
      'opposite',             // Opposite
      'contrary',             // Contrary
      'inverse',              // Inverse
      'backward',             // Backward
      'forward',              // Forward
      'up',                   // Up
      'down',                 // Down
      'left',                 // Left
      'right',                // Right
      'north',                // North
      'south',                // South
      'east',                 // East
      'west',                 // West
      'inside',               // Inside
      'outside',              // Outside
      'within',               // Within
      'without',              // Without
      'above',                // Above
      'below',                // Below
      'over',                 // Over
      'under',                // Under
      'on',                   // On
      'off',                  // Off
      'in',                   // In
      'out',                  // Out
      'into',                 // Into
      'onto',                 // Onto
      'from',                 // From
      'to',                   // To
      'toward',               // Toward
      'towards',              // Towards
      'away',                 // Away
      'near',                 // Near
      'far',                  // Far
      'close',                // Close
      'distant',              // Distant
      'remote',               // Remote
      'local',                // Local
      'global',               // Global
      'universal',            // Universal
      'general',              // General
      'specific',             // Specific
      'particular',           // Particular
      'special',              // Special
      'unique',               // Unique
      'common',               // Common
      'normal',               // Normal
      'regular',              // Regular
      'standard',             // Standard
      'typical',              // Typical
      'usual',                // Usual
      'ordinary',             // Ordinary
      'average',              // Average
      'medium',               // Medium
      'middle',               // Middle
      'center',               // Center
      'central',              // Central
      'main',                 // Main
      'primary',              // Primary
      'principal',            // Principal
      'major',                // Major
      'minor',                // Minor
      'secondary',            // Secondary
      'tertiary',             // Tertiary
      'important',            // Important
      'significant',          // Significant
      'critical',             // Critical
      'essential',            // Essential
      'vital',                // Vital
      'crucial',              // Crucial
      'key',                  // Key
      'fundamental',          // Fundamental
      'basic',                // Basic
      'elementary',           // Elementary
      'simple',               // Simple
      'complex',              // Complex
      'complicated',          // Complicated
      'difficult',            // Difficult
      'hard',                 // Hard
      'easy',                 // Easy
      'simple',               // Simple
      'straightforward',      // Straightforward
      'clear',                // Clear
      'obvious',              // Obvious
      'evident',              // Evident
      'apparent',             // Apparent
      'visible',              // Visible
      'hidden',               // Hidden
      'secret',               // Secret
      'private',              // Private
      'public',               // Public
      'open',                 // Open
      'closed',               // Closed
      'free',                 // Free
      'restricted',           // Restricted
      'limited',              // Limited
      'unlimited',            // Unlimited
      'infinite',             // Infinite
      'finite',               // Finite
      'bounded',              // Bounded
      'unbounded',            // Unbounded
      'constrained',          // Constrained
      'unconstrained',        // Unconstrained
      'flexible',             // Flexible
      'rigid',                // Rigid
      'fixed',                // Fixed
      'variable',             // Variable
      'dynamic',              // Dynamic
      'static',               // Static
      'stable',               // Stable
      'unstable',             // Unstable
      'steady',               // Steady
      'unsteady',             // Unsteady
      'consistent',           // Consistent
      'inconsistent',         // Inconsistent
      'reliable',             // Reliable
      'unreliable',           // Unreliable
      'predictable',          // Predictable
      'unpredictable',        // Unpredictable
      'certain',              // Certain
      'uncertain',            // Uncertain
      'sure',                 // Sure
      'unsure',               // Unsure
      'confident',            // Confident
      'doubtful',             // Doubtful
      'positive',             // Positive
      'negative',             // Negative
      'neutral',              // Neutral
      'good',                 // Good
      'bad',                  // Bad
      'better',               // Better
      'worse',                // Worse
      'best',                 // Best
      'worst',                // Worst
      'excellent',            // Excellent
      'poor',                 // Poor
      'great',                // Great
      'terrible',             // Terrible
      'amazing',              // Amazing
      'awful',                // Awful
      'wonderful',            // Wonderful
      'horrible',             // Horrible
      'fantastic',            // Fantastic
      'dreadful',             // Dreadful
      'superb',               // Superb
      'abysmal',              // Abysmal
      'outstanding',          // Outstanding
      'mediocre',             // Mediocre
      'exceptional',          // Exceptional
      'ordinary',             // Ordinary
      'extraordinary',        // Extraordinary
      'remarkable',           // Remarkable
      'unremarkable',         // Unremarkable
      'notable',              // Notable
      'insignificant',        // Insignificant
      'impressive',           // Impressive
      'unimpressive',         // Unimpressive
      'striking',             // Striking
      'bland',                // Bland
      'vivid',                // Vivid
      'dull',                 // Dull
      'bright',               // Bright
      'dark',                 // Dark
      'light',                // Light
      'heavy',                // Heavy
      'thick',                // Thick
      'thin',                 // Thin
      'wide',                 // Wide
      'narrow',               // Narrow
      'broad',                // Broad
      'tight',                // Tight
      'loose',                // Loose
      'firm',                 // Firm
      'soft',                 // Soft
      'hard',                 // Hard
      'smooth',               // Smooth
      'rough',                // Rough
      'sharp',                // Sharp
      'blunt',                // Blunt
      'pointed',              // Pointed
      'round',                // Round
      'square',               // Square
      'circular',             // Circular
      'rectangular',          // Rectangular
      'triangular',           // Triangular
      'oval',                 // Oval
      'curved',               // Curved
      'straight',             // Straight
      'bent',                 // Bent
      'twisted',              // Twisted
      'crooked',              // Crooked
      'aligned',              // Aligned
      'misaligned',           // Misaligned
      'balanced',             // Balanced
      'unbalanced',           // Unbalanced
      'symmetrical',          // Symmetrical
      'asymmetrical',         // Asymmetrical
      'proportional',         // Proportional
      'disproportional',      // Disproportional
      'harmonious',           // Harmonious
      'discordant',           // Discordant
      'coordinated',          // Coordinated
      'uncoordinated',        // Uncoordinated
      'organized',            // Organized
      'disorganized',         // Disorganized
      'structured',           // Structured
      'unstructured',         // Unstructured
      'systematic',           // Systematic
      'unsystematic',         // Unsystematic
      'methodical',           // Methodical
      'random',               // Random
      'ordered',              // Ordered
      'chaotic',              // Chaotic
      'neat',                 // Neat
      'messy',                // Messy
      'clean',                // Clean
      'dirty',                // Dirty
      'pure',                 // Pure
      'impure',               // Impure
      'fresh',                // Fresh
      'stale',                // Stale
      'new',                  // New
      'old',                  // Old
      'young',                // Young
      'ancient',              // Ancient
      'modern',               // Modern
      'contemporary',         // Contemporary
      'current',              // Current
      'outdated',             // Outdated
      'recent',               // Recent
      'past',                 // Past
      'present',              // Present
      'future',               // Future
      'temporary',            // Temporary
      'permanent',            // Permanent
      'lasting',              // Lasting
      'brief',                // Brief
      'short',                // Short
      'long',                 // Long
      'quick',                // Quick
      'slow',                 // Slow
      'fast',                 // Fast
      'rapid',                // Rapid
      'gradual',              // Gradual
      'sudden',               // Sudden
      'immediate',            // Immediate
      'delayed',              // Delayed
      'early',                // Early
      'late',                 // Late
      'timely',               // Timely
      'untimely',             // Untimely
      'prompt',               // Prompt
      'tardy',                // Tardy
      'punctual',             // Punctual
      'overdue',              // Overdue
      'ahead',                // Ahead
      'behind',               // Behind
      'before',               // Before
      'after',                // After
      'during',               // During
      'while',                // While
      'until',                // Until
      'since',                // Since
      'ago',                  // Ago
      'later',                // Later
      'earlier',              // Earlier
      'soon',                 // Soon
      'eventually',           // Eventually
      'finally',              // Finally
      'ultimately',           // Ultimately
      'initially',            // Initially
      'originally',           // Originally
      'previously',           // Previously
      'formerly',             // Formerly
      'currently',            // Currently
      'presently',            // Presently
      'now',                  // Now
      'then',                 // Then
      'today',                // Today
      'yesterday',            // Yesterday
      'tomorrow',             // Tomorrow
      'tonight',              // Tonight
      'morning',              // Morning
      'afternoon',            // Afternoon
      'evening',              // Evening
      'night',                // Night
      'day',                  // Day
      'week',                 // Week
      'month',                // Month
      'year',                 // Year
      'decade',               // Decade
      'century',              // Century
      'millennium',           // Millennium
    ]
  ],
  
  // Configurazione per messaggi personalizzati
  helpUrl: 'https://github.com/conventional-changelog/commitlint/#what-is-commitlint',
  
  // Configurazione per il formato del commit
  formatter: '@commitlint/format',
  
  // Configurazione per i plugin
  plugins: [
    '@commitlint/plugin-help-wanted'
  ],
  
  // Configurazione per ignorare certi commit
  ignores: [
    (commit) => commit.includes('WIP'),
    (commit) => commit.includes('[skip ci]'),
    (commit) => commit.includes('[ci skip]'),
    (commit) => commit.includes('Merge branch'),
    (commit) => commit.includes('Merge pull request'),
    (commit) => commit.startsWith('Revert "'),
    (commit) => commit.includes('Initial commit'),
    (commit) => commit.includes('chore(release):')
  ],
  
  // Configurazione per i warning
  defaultIgnores: true,
  
  // Configurazione per i prompt
  prompt: {
    questions: {
      type: {
        description: 'Seleziona il tipo di modifica che stai committando:',
        enum: {
          feat: {
            description: 'Una nuova funzionalità',
            title: 'Features',
            emoji: '✨'
          },
          fix: {
            description: 'Una correzione di bug',
            title: 'Bug Fixes',
            emoji: '🐛'
          },
          docs: {
            description: 'Solo modifiche alla documentazione',
            title: 'Documentation',
            emoji: '📚'
          },
          style: {
            description: 'Modifiche che non influenzano il significato del codice (spazi bianchi, formattazione, punto e virgola mancanti, ecc.)',
            title: 'Styles',
            emoji: '💎'
          },
          refactor: {
            description: 'Una modifica del codice che non corregge un bug né aggiunge una funzionalità',
            title: 'Code Refactoring',
            emoji: '📦'
          },
          perf: {
            description: 'Una modifica del codice che migliora le prestazioni',
            title: 'Performance Improvements',
            emoji: '🚀'
          },
          test: {
            description: 'Aggiunta di test mancanti o correzione di test esistenti',
            title: 'Tests',
            emoji: '🚨'
          },
          build: {
            description: 'Modifiche che influenzano il sistema di build o le dipendenze esterne (esempi di scope: gulp, broccoli, npm)',
            title: 'Builds',
            emoji: '🛠'
          },
          ci: {
            description: 'Modifiche ai file e agli script di configurazione CI (esempi di scope: Travis, Circle, BrowserStack, SauceLabs)',
            title: 'Continuous Integrations',
            emoji: '⚙️'
          },
          chore: {
            description: 'Altre modifiche che non modificano i file src o test',
            title: 'Chores',
            emoji: '♻️'
          },
          revert: {
            description: 'Reverte un commit precedente',
            title: 'Reverts',
            emoji: '🗑'
          }
        }
      },
      scope: {
        description: 'Qual è lo scope di questa modifica (es. componente o nome del file)?'
      },
      subject: {
        description: 'Scrivi una breve descrizione imperativa della modifica:'
      },
      body: {
        description: 'Fornisci una descrizione più lunga della modifica:'
      },
      isBreaking: {
        description: 'Ci sono breaking changes?'
      },
      breakingBody: {
        description: 'Un commit BREAKING CHANGE richiede un body. Inserisci una descrizione più lunga del commit stesso:'
      },
      breaking: {
        description: 'Descrivi i breaking changes:'
      },
      isIssueAffected: {
        description: 'Questa modifica influenza qualche issue aperto?'
      },
      issuesBody: {
        description: 'Se gli issue sono chiusi, il commit richiede un body. Inserisci una descrizione più lunga del commit stesso:'
      },
      issues: {
        description: 'Aggiungi i riferimenti agli issue (es. "fix #123", "re #123".):'
      }
    }
  }
};