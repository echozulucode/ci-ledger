# FastAPI Intranet Demo - Project Context

## Quick Reference

**Project Type**: Full-stack enterprise intranet web application  
**Status**: Phase 1 - Planning & Setup  
**Created**: October 2025  
**License**: MIT

## What is This Project?

This is a production-ready demonstration of a modern intranet application built with:
- **Backend**: FastAPI (Python) with SQLModel/SQLAlchemy
- **Frontend**: React + TypeScript + Vite
- **Database**: SQLite (dev) → SQL Server (production)
- **Deployment**: Docker Compose on Azure GCC High

The application showcases common enterprise features:
- 🔐 Multi-method authentication (username/password, LDAP, future SSO)
- 👥 User management with role-based access control (RBAC)
- 🎫 Personal Access Token (PAT) generation and management
- 📝 Sample CRUD operations (Items/Projects entity)
- 👨‍💼 Admin dashboard for user administration
- 🔒 Enterprise-grade security practices

## Why This Project Exists

**Purpose**: To demonstrate best practices for building secure, maintainable intranet applications suitable for deployment in government cloud environments (Azure GCC High).

**Use Cases**:
- Template for internal enterprise applications
- Reference implementation for FastAPI + React architecture
- Example of LDAP/Active Directory integration
- Demonstration of security best practices (JWT, PAT management)
- Docker containerization and deployment patterns

## Key Features

### Core Functionality
1. **Authentication & Authorization**
   - Local username/password authentication with JWT tokens
   - LDAP integration for Active Directory
   - Role-based access control (Admin/User roles)
   - Future: SAML/OIDC single sign-on (SSO)

2. **User Management**
   - Self-service profile management
   - Password change functionality
   - Email-based password reset
   - Admin user CRUD operations
   - User status management (active/disabled)

3. **Personal Access Tokens**
   - GitHub-style PAT generation
   - Scoped permissions
   - Token expiration management
   - Secure token storage (hashed)

4. **Sample Data Entity**
   - Full CRUD operations
   - Ownership-based access control
   - Pagination and filtering
   - RESTful API design

### Technical Highlights
- **Type Safety**: Pydantic validation, TypeScript throughout
- **Testing**: PyTest (backend), Vitest + Playwright (frontend)
- **Security**: HTTPS/TLS, password hashing, token management, CSRF protection
- **Documentation**: Auto-generated OpenAPI/Swagger docs
- **CI/CD**: Automated testing and deployment
- **Compliance**: Azure GCC High ready

## Project Structure

```
fastapi-demo/
├── backend/              # FastAPI application
│   ├── app/
│   │   ├── api/         # API endpoints (auth, users, admin, tokens, items)
│   │   ├── core/        # Configuration, security, dependencies
│   │   ├── models/      # SQLModel database models
│   │   ├── crud/        # Database operations
│   │   └── tests/       # PyTest test suite
│   ├── alembic/         # Database migrations
│   └── requirements.txt
├── frontend/            # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components (login, dashboard, etc.)
│   │   ├── services/    # API client code
│   │   └── types/       # TypeScript type definitions
│   └── package.json
├── docs/                # Documentation
│   ├── ai/             # AI-generated project materials
│   ├── api/            # API documentation
│   └── user-guide/     # User documentation
├── .github/            # GitHub Actions CI/CD
├── docker-compose.yml  # Development orchestration
├── plan-001-implementation.md  # Phased implementation plan
└── CONTEXT.md          # This file
```

## Technology Stack

### Backend
- **Framework**: FastAPI 0.104+
- **Language**: Python 3.10+
- **ORM**: SQLModel (SQLAlchemy-based)
- **Validation**: Pydantic
- **Authentication**: python-jose (JWT), ldap3 (LDAP)
- **Password Hashing**: bcrypt or argon2
- **Testing**: PyTest, pytest-asyncio
- **Database Migrations**: Alembic
- **ASGI Server**: Uvicorn

### Frontend
- **Framework**: React 18+
- **Language**: TypeScript (strict mode)
- **Build Tool**: Vite
- **Routing**: React Router v6
- **HTTP Client**: Axios or TanStack Query
- **UI Framework**: Tailwind CSS or Chakra UI (TBD)
- **Testing**: Vitest (unit), Playwright (E2E)

### Database
- **Development**: SQLite (file-based)
- **Production**: SQL Server (Azure SQL or on-premises)
- **Why Both?**: SQLite for easy local dev, SQL Server for production scalability

### Infrastructure
- **Containerization**: Docker (multi-stage builds)
- **Orchestration**: Docker Compose
- **Deployment Platform**: Azure Government Cloud (GCC High)
- **CI/CD**: GitHub Actions or Jenkins
- **Reverse Proxy**: nginx (production)

## Security Model

### Authentication Methods
1. **Local Authentication**: Username/password stored securely (bcrypt hashed)
2. **LDAP Authentication**: Active Directory integration via ldap3
3. **JWT Tokens**: Short-lived access tokens with expiration
4. **Personal Access Tokens**: Long-lived API tokens (hashed storage)

### Authorization Model
- **Role-Based Access Control (RBAC)**
  - **User Role**: Standard access (own profile, own data)
  - **Admin Role**: Full access (user management, all data)
- **Resource Ownership**: Users can only modify their own resources
- **Endpoint Protection**: FastAPI dependency injection for auth checks

### Security Best Practices
- All passwords hashed with bcrypt/argon2
- JWTs include expiration claims
- PATs treated like passwords (hashed, scoped, expiring)
- HTTPS/TLS required in production
- SQL injection prevention (parameterized queries)
- XSS prevention (React auto-escaping, CSP headers)
- CSRF protection for state-changing operations
- No secrets in code (environment variables only)
- Regular dependency updates and vulnerability scans

## Development Workflow

### Getting Started
1. Clone repository
2. Copy `.env.example` to `.env` and configure
3. Run `docker-compose up` for local development
4. Backend: http://localhost:8000
5. Frontend: http://localhost:3000
6. API Docs: http://localhost:8000/docs

### Development Process
1. Create feature branch from main
2. Implement changes with tests
3. Run linters and tests locally
4. Submit pull request
5. CI/CD runs automated tests
6. Code review and merge
7. Automated deployment to staging
8. Manual approval for production deployment

### Testing Strategy
- **Backend**: Unit tests for business logic, integration tests for API endpoints
- **Frontend**: Component unit tests, E2E tests for critical user flows
- **Target Coverage**: >80% code coverage
- **CI/CD**: All tests must pass before merge

## Deployment Architecture

### Development Environment
- Local Docker Compose
- SQLite database
- Hot-reloading enabled
- Debug logging

### Staging Environment
- Azure VM (Linux)
- Docker Compose orchestration
- SQL Server database (optional)
- HTTPS with self-signed cert
- CI/CD auto-deploys on main branch merge

### Production Environment
- Azure GCC High (Linux VM)
- Docker Compose or Kubernetes
- SQL Server (managed by IT)
- HTTPS with valid certificates
- nginx reverse proxy
- Monitoring and alerting
- Automated backups
- Manual deployment approval

## Implementation Timeline

See `plan-001-implementation.md` for detailed phased rollout:

- **Phase 1 (Weeks 1-2)**: Foundation & Project Setup
- **Phase 2 (Weeks 3-4)**: Authentication & Security
- **Phase 3 (Weeks 5-6)**: User Management
- **Phase 4 (Week 7)**: Personal Access Tokens
- **Phase 5 (Week 8)**: Sample CRUD Entity
- **Phase 6 (Weeks 9-10)**: Testing & QA
- **Phase 7 (Week 11)**: UI/UX & Documentation
- **Phase 8 (Weeks 12-13)**: Deployment & DevOps
- **Phase 9 (Weeks 14-15)**: Advanced Features (SSO, etc.)
- **Phase 10 (Week 16+)**: Launch & Maintenance

**Total Initial Development**: ~4 months

## Key Design Decisions

### Why FastAPI?
- Modern Python framework with automatic API documentation
- Built-in data validation with Pydantic
- Excellent performance (async support)
- Strong typing and IDE support
- Extensive authentication/security utilities

### Why React + Vite?
- Modern, fast development experience
- TypeScript support out-of-the-box
- Large ecosystem and community
- Excellent developer tools
- Fast hot-reloading

### Why SQLite → SQL Server?
- SQLite: Zero-config development, perfect for demos
- SQL Server: Enterprise-grade for production, IT-supported
- SQLModel/SQLAlchemy: Works seamlessly with both

### Why Docker?
- Consistent environments (dev/staging/prod)
- Easy deployment and scaling
- Isolation and security
- Works well in Azure GCC High

## Common Development Tasks

### Backend Tasks
```bash
# Run backend locally
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload

# Run tests
pytest

# Create database migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head
```

### Frontend Tasks
```bash
# Run frontend locally
cd frontend
npm install
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### Docker Tasks
```bash
# Start all services
docker-compose up

# Rebuild after code changes
docker-compose up --build

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

## Environment Configuration

### Required Environment Variables (Backend)
- `SECRET_KEY`: JWT signing key (generate with `openssl rand -hex 32`)
- `DATABASE_URL`: Database connection string
- `LDAP_SERVER`: LDAP server address (if using LDAP)
- `LDAP_BIND_DN`: Service account DN
- `LDAP_BIND_PASSWORD`: Service account password

### Required Environment Variables (Frontend)
- `VITE_API_BASE_URL`: Backend API URL

See `.env.example` files for complete configuration templates.

## Compliance & Governance

### Azure GCC High Requirements
- Use FedRAMP-authorized services only
- All network traffic encrypted (HTTPS/TLS)
- No unapproved external network calls
- Azure AD (GCC) for SSO when implemented
- Follow government security compliance standards
- Audit logging for compliance tracking

### Data Handling
- User passwords: Never stored in plain text (bcrypt hashed)
- Personal Access Tokens: Hashed storage, scoped permissions
- User data: Encrypted at rest (database-level)
- Data in transit: TLS 1.2+ encryption
- Backups: Managed by IT, encrypted

### License & Usage
- **License**: MIT (open source)
- **Commercial Use**: Permitted
- **Modification**: Permitted
- **Distribution**: Permitted
- **Warranty**: None (as-is)

## Troubleshooting

### Common Issues

**Backend won't start**
- Check Python version (3.10+ required)
- Verify all dependencies installed: `pip install -r requirements.txt`
- Check database connection in `.env`

**Frontend won't start**
- Check Node.js version (18+ recommended)
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check VITE_API_BASE_URL in `.env`

**Database migration issues**
- Ensure database is accessible
- Check Alembic configuration in `alembic.ini`
- Try: `alembic downgrade -1` then `alembic upgrade head`

**LDAP authentication not working**
- Verify LDAP server is accessible from your network
- Check LDAP credentials and search base in `.env`
- Test LDAP connection with ldapsearch tool
- Check firewall rules

**Docker issues**
- Ensure Docker Desktop is running
- Check port conflicts (8000, 3000)
- Clear Docker cache: `docker system prune -a`

## Resources & References

### Documentation
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLModel Documentation](https://sqlmodel.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Docker Documentation](https://docs.docker.com/)

### Project Templates
- [FastAPI Full-Stack Template](https://github.com/fastapi/full-stack-fastapi-template) - Official reference implementation

### Libraries
- [ldap3](https://ldap3.readthedocs.io/) - LDAP integration
- [python-jose](https://python-jose.readthedocs.io/) - JWT implementation
- [Alembic](https://alembic.sqlalchemy.org/) - Database migrations
- [PyTest](https://docs.pytest.org/) - Python testing
- [Playwright](https://playwright.dev/) - E2E testing

### Azure GCC High
- [Azure Government Documentation](https://docs.microsoft.com/en-us/azure/azure-government/)
- [FedRAMP Compliance](https://www.fedramp.gov/)

## Contributing

This project follows standard Git workflow:

1. Fork or clone the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make changes and commit: `git commit -am 'Add feature'`
4. Write or update tests for your changes
5. Ensure all tests pass: `pytest` and `npm test`
6. Push to branch: `git push origin feature/your-feature`
7. Create pull request

### Code Review Guidelines
- Code follows project conventions (see `.github/copilot-instructions.md`)
- Tests added/updated and passing
- No hardcoded secrets or sensitive data
- Error handling implemented
- Documentation updated if needed
- Type safety maintained (TypeScript/Python type hints)

## Support & Contact

**Project Owner**: Development Team  
**Status**: Active Development  
**Current Phase**: Phase 1 - Foundation & Setup

For questions or issues:
1. Check this CONTEXT.md file
2. Review implementation plan (`plan-001-implementation.md`)
3. Check project documentation in `docs/`
4. Contact project maintainers

---

**Document Version**: 1.0  
**Last Updated**: 2025-10-30  
**Next Review**: After Phase 1 completion
