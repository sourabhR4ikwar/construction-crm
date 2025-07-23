# PowerTech Construction CRM Platform

A comprehensive Construction Customer Relationship Management (CRM) platform built for managing construction projects, companies, contacts, documents, and project interactions. This platform provides a complete solution for construction companies to streamline their project management, client relationships, and document workflows.

## About the Platform

PowerTech Construction CRM is designed specifically for the construction industry, offering a robust set of tools to manage the entire project lifecycle from initial planning to project completion. The platform emphasizes security, user experience, and comprehensive data management while providing powerful analytics and reporting capabilities.

## Core Features

### 🔐 Authentication & User Management
- **Secure Authentication System**: Complete login/logout with BetterAuth integration
- **Role-Based Access Control**: Three-tier permission system (Admin, Staff, Read-only)
- **User Management**: Admin-controlled user creation, role assignment, and profile management
- **Session Security**: Secure session handling with middleware protection
- **Password Reset**: forgot password and reset functionality

### 🏗️ Project Management
- **Complete Project Lifecycle**: Full CRUD operations for construction projects
- **Project Stages**: Design, Construction, Hand-off workflow management
- **Status Tracking**: Planning, Active, On Hold, Completed status management
- **Budget Management**: Decimal precision budget tracking and monitoring
- **Timeline Management**: Start and end date management with validation
- **Location Tracking**: Complete address management (city, state, zip, country)

### 🏢 Company & Contact Management
- **Company Management**: Full company lifecycle with categorization by type
  - Developer, Contractor, Architect/Consultant, Supplier/Vendor
- **Contact Management**: Comprehensive contact database with role assignment
  - Primary Contact, Project Manager, Technical Lead, Finance Contact, Sales Contact, Support Contact, Executive, Other
- **Project Role Assignment**: Dynamic assignment of contacts to project-specific roles
- **Relationship Tracking**: Link companies to projects and assign contacts to specific project roles

### 📋 Project Interaction Tracking
- **Interaction Types**: Meeting, Phone Call, Email, Site Visit, Document Shared, Milestone Update, Issue Reported, Other
- **Activity Timeline**: Complete chronological history of all project activities
- **Contact Association**: Link interactions to specific contacts and projects
- **Detailed Logging**: Track who created interactions and when for audit purposes

### 📁 Document Management System
- **Document Organization**: Categorized document storage and management
  - Drawings/Plans, Contracts, Permits, Reports, Specifications, Correspondence, Photos, Other
- **Access Control**: Public, Project Members, Admin Only access levels
- **Version Control**: Multiple document versions with detailed version notes
- **Cloud Storage**: Integration with Cloudflare R2/AWS S3 for secure file storage
- **File Security**: Presigned URLs, checksum validation, and access logging
- **Document Preview**: Built-in document preview capabilities

### 📊 Analytics & Reporting Dashboard
- **KPI Tracking**: Active projects count, total budget, average budget metrics
- **Visual Analytics**: Project distribution charts by stage and status
- **Budget Analytics**: Comprehensive budget analysis and tracking
- **Deadline Management**: Upcoming deadlines within 30 days
- **Activity Feed**: Recent project interactions and updates
- **Data Visualization**: Interactive charts using Recharts library
- **Export Capabilities**: Dashboard data and comprehensive reporting exports

### 🔍 Global Search System
- **Multi-Entity Search**: Search across projects, contacts, companies, and documents
- **Advanced Filtering**: Dynamic filters based on entity types and metadata
- **Real-Time Results**: User-friendly search interface with instant results
- **Organized Results**: Structured search results with relevant metadata

### 🎨 User Interface & Experience
- **Modern Design System**: Built with Shadcn/UI component library
- **Responsive Design**: Mobile-first responsive layout for all devices
- **Theme Support**: Dark/light theme infrastructure
- **Intuitive Navigation**: Sidebar navigation with role-based menu items
- **Loading States**: Skeleton loaders for all async operations
- **Personalized Dashboard**: User-specific welcome messages and role display

## Technical Stack

### Frontend & Backend
- **Framework**: Next.js 15 with React 19
- **Language**: TypeScript for full type safety
- **Styling**: Tailwind CSS with Shadcn/UI components
- **Architecture**: Server Components with selective client components

### Database & ORM
- **Database**: PostgreSQL for robust data management
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema**: UUID-based system with proper referential integrity
- **Migrations**: Automated database migration system

### Authentication & Security
- **Authentication**: BetterAuth for secure user management
- **Authorization**: Repository-level authorization enforcement
- **Session Management**: Secure session handling with expiration
- **Input Validation**: Comprehensive Zod schema validation
- **Access Control**: Role-based permissions throughout the application

### File Storage & Management
- **Cloud Storage**: Cloudflare R2/AWS S3 integration
- **File Security**: Presigned URLs for secure upload/download
- **Version Control**: Complete file version tracking
- **Access Logging**: Document access tracking for compliance

### Data Visualization & Analytics
- **Charts**: Recharts library for interactive data visualization
- **Export**: Data export capabilities for reporting
- **KPIs**: Real-time key performance indicator tracking

## Architecture Patterns

### Clean Architecture Implementation
```
📁 src/
├── app/                  # Presentation Layer (Next.js App Router)
├── components/           # UI Components (Shadcn/UI + Custom)
├── usecases/            # Application Layer (Pure Business Logic)
├── repo/                # Data Access Layer (Database & API Integration)
├── lib/                 # Shared Utilities & Configurations
└── scripts/             # Development & Deployment Scripts
```

### Key Design Principles
- **Separation of Concerns**: Clear separation between presentation, business logic, and data access
- **Authorization at Data Layer**: Security enforced in repository layer
- **Type Safety**: Full TypeScript coverage throughout the application
- **Server-First**: Server components by default with selective client components
- **Clean Code**: Minimal logic in page components, business logic in usecases

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- pnpm package manager
- Cloudflare R2 or AWS S3 account (for file storage)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd construction-crm
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Setup**
   Create a `.env.local` file with the following variables:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/construction_crm"
   
   # Authentication
   BETTER_AUTH_SECRET="your-secret-key"
   BETTER_AUTH_URL="http://localhost:3000"
   
   # File Storage (Cloudflare R2 or AWS S3)
   AWS_ACCESS_KEY_ID="your-access-key"
   AWS_SECRET_ACCESS_KEY="your-secret-key"
   AWS_REGION="your-region"
   AWS_BUCKET_NAME="your-bucket-name"
   ```

4. **Database Setup**
   ```bash
   # Generate database schema
   pnpm db:generate
   
   # Run migrations
   pnpm db:migrate
   
   # Seed admin user (optional)
   pnpm seed:admin
   
   # Seed demo data (optional)
   pnpm seed:demo
   ```

5. **Start Development Server**
   ```bash
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the application.

### Available Scripts

- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build production application
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint code analysis
- `pnpm db:generate` - Generate Drizzle database schema
- `pnpm db:migrate` - Run database migrations
- `pnpm db:push` - Push schema changes to database
- `pnpm seed:admin` - Create admin user
- `pnpm seed:demo` - Populate database with demo data
- `pnpm check:roles` - Verify user roles and permissions

## Project Structure

```
📁 src/
├── 📁 app/                    # Next.js App Router pages
│   ├── 📁 (auth)/            # Authentication routes
│   ├── 📁 dashboard/         # Main dashboard pages
│   ├── 📁 projects/          # Project management pages
│   ├── 📁 companies/         # Company management pages
│   ├── 📁 contacts/          # Contact management pages
│   ├── 📁 documents/         # Document management pages
│   ├── 📁 search/            # Global search interface
│   └── 📁 users/             # User management (Admin only)
├── 📁 components/            # Reusable UI components
│   ├── 📁 ui/               # Shadcn/UI primitives
│   └── shared-components.ts  # Async-loaded components
├── 📁 usecases/             # Business logic layer
│   ├── 📁 auth/             # Authentication use cases
│   ├── 📁 projects/         # Project management logic
│   ├── 📁 companies/        # Company management logic
│   ├── 📁 contacts/         # Contact management logic
│   └── 📁 documents/        # Document management logic
├── 📁 repo/                 # Data access layer
│   ├── 📁 users/            # User repository
│   ├── 📁 projects/         # Project repository
│   ├── 📁 companies/        # Company repository
│   ├── 📁 contacts/         # Contact repository
│   └── 📁 documents/        # Document repository
├── 📁 lib/                  # Shared utilities
│   ├── 📁 db/               # Database configuration
│   ├── 📁 auth/             # Authentication helpers
│   ├── 📁 storage/          # File storage utilities
│   └── 📁 utils/            # General utilities
├── 📁 scripts/              # Development scripts
└── middleware.ts            # Global middleware
```

## Development Guidelines

### Code Style & Conventions
- **TypeScript**: Full type safety throughout the application
- **Server Components**: Use server components by default, client components only when needed
- **Clean Architecture**: Business logic in usecases, data access in repositories
- **Authorization**: Always enforce permissions at the repository layer
- **Validation**: Use Zod schemas for all input validation
- **UUIDs**: Use UUIDs for all entity identifiers

### Key Development Patterns
- **Actions Pattern**: Use `actions.ts` files for server actions, minimal logic in page components
- **Repository Pattern**: All external system communication through repositories
- **Use Case Pattern**: Pure business logic with dependency injection
- **Component Architecture**: Async-loaded components with skeleton fallbacks

## Security Features

- **Role-Based Access Control**: Three-tier permission system with middleware enforcement
- **Input Validation**: Comprehensive Zod schema validation for all inputs
- **Session Security**: Secure session handling with automatic expiration
- **File Security**: Presigned URLs and checksum validation for file operations
- **Audit Logging**: Complete activity tracking for compliance and security
- **Authorization Layer**: Permissions enforced at the data access layer

## Contributing

This project follows clean architecture principles and emphasizes code quality, security, and maintainability. When contributing:

1. Follow the established folder structure and naming conventions
2. Ensure all new features include proper authorization checks
3. Write comprehensive tests for business logic
4. Use TypeScript strictly - no `any` types
5. Follow the repository pattern for data access
6. Implement proper error handling and validation

## License

This project is proprietary software developed for PowerTech Construction CRM Platform.

