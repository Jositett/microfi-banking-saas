# MicroFi Banking SaaS - Project Structure Rules

## 📁 **Directory Organization**

### **Root Directory**
- Keep only essential files in root:
  - `README.md` - Project overview (MUST stay in root)
  - `package.json` - Main project dependencies
  - `next.config.js` - Next.js configuration
  - `tailwind.config.js` - Tailwind CSS configuration
  - `tsconfig.json` - TypeScript configuration
  - `.gitignore` - Git ignore rules
  - `LICENSE` - Project license

### **Documentation Structure**
```
docs/
├── DEPLOYMENT-GUIDE.md          # Production deployment instructions
├── SECURITY-ARCHITECTURE-PLAN.md # Security implementation details
├── SECURITY-INCIDENT-RESPONSE.md # Security incident procedures
├── WEBAUTHN-ERROR-REPORT.md     # Technical error reports
├── API.md                       # API documentation
└── CONTRIBUTING.md              # Contribution guidelines
```

### **Configuration Structure**
```
config/
├── database/                    # Database configurations
├── security/                    # Security configurations
├── deployment/                  # Deployment configurations
└── environments/                # Environment-specific configs
```

### **Scripts Structure**
```
scripts/
├── build/                       # Build scripts
├── deploy/                      # Deployment scripts
├── database/                    # Database migration scripts
└── security/                    # Security audit scripts
```

### **Testing Structure**
```
tests/
├── __tests__/                   # Moved from root
├── e2e/                        # End-to-end tests
├── integration/                # Integration tests
├── unit/                       # Unit tests
└── fixtures/                   # Test data and fixtures
```

### **Backend Structure**
```
backend/
├── src/
│   ├── routes/                 # API route handlers
│   ├── services/               # Business logic services
│   ├── middleware/             # Custom middleware
│   ├── types/                  # TypeScript type definitions
│   └── utils/                  # Utility functions
├── migrations/                 # Database migrations
├── tests/                      # Backend-specific tests
├── .dev.vars.example          # Environment variables template
├── wrangler.example.toml      # Wrangler configuration template
└── package.json               # Backend dependencies
```

### **Frontend Structure**
```
app/                            # Next.js App Router
components/                     # React components
lib/                           # Utility libraries
public/                        # Static assets
styles/                        # CSS and styling files
```

## 🧹 **File Organization Rules**

### **Documentation Files**
- **Location**: `docs/` directory
- **Naming**: UPPERCASE with hyphens (e.g., `DEPLOYMENT-GUIDE.md`)
- **Exception**: `README.md` stays in root for GitHub visibility

### **Configuration Files**
- **Location**: `config/` directory for complex configs
- **Root configs**: Only framework-specific configs (Next.js, Tailwind, TypeScript)
- **Environment configs**: Use `.example` suffix for templates

### **Script Files**
- **Location**: `scripts/` directory
- **Naming**: Lowercase with hyphens
- **Categories**: build, deploy, database, security

### **Test Files**
- **Location**: `tests/` directory
- **Structure**: Organized by test type (unit, integration, e2e)
- **Naming**: `*.test.ts` or `*.spec.ts`

### **Asset Files**
- **Images**: `public/images/`
- **Icons**: `public/icons/`
- **Fonts**: `public/fonts/`
- **Documents**: `public/docs/` (for downloadable docs)

## 🚫 **Root Directory Cleanup Rules**

### **Files to Keep in Root**
- `README.md` - Project overview
- `package.json` - Dependencies
- `package-lock.json` - Lock file
- Framework config files (Next.js, Tailwind, TypeScript)
- `.gitignore` - Git ignore rules
- `LICENSE` - Project license

### **Files to Move from Root**
- Documentation → `docs/`
- Test files → `tests/`
- Build scripts → `scripts/build/`
- Deployment configs → `config/deployment/`
- Database files → `config/database/`

### **Files to Remove from Root**
- Temporary files (`.tmp`, `.cache`)
- Build artifacts (`dist/`, `build/`)
- IDE files (`.vscode/`, `.idea/`)
- OS files (`.DS_Store`, `Thumbs.db`)

## 📝 **Naming Conventions**

### **Directories**
- Lowercase with hyphens: `user-management/`
- Plural for collections: `components/`, `services/`
- Singular for single purpose: `config/`, `lib/`

### **Files**
- **React Components**: PascalCase (`UserProfile.tsx`)
- **Utilities**: camelCase (`apiClient.ts`)
- **Constants**: UPPER_SNAKE_CASE (`API_ENDPOINTS.ts`)
- **Documentation**: UPPERCASE with hyphens (`API-GUIDE.md`)

### **Imports and Exports**
- Use absolute imports with `@/` prefix
- Group imports: external → internal → relative
- Export components as named exports when possible

## 🔄 **Maintenance Rules**

### **Regular Cleanup**
- Monthly review of root directory
- Remove unused files and dependencies
- Update documentation links after moves
- Verify import paths after restructuring

### **New File Guidelines**
- Determine appropriate directory before creating
- Follow naming conventions consistently
- Update relevant documentation
- Add to `.gitignore` if temporary/generated

### **Migration Guidelines**
- Update import statements after moving files
- Update documentation references
- Test build process after restructuring
- Update deployment scripts if paths change

---

**These rules ensure a clean, organized, and maintainable project structure for the MicroFi Banking SaaS platform.**