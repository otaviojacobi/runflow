# Getting Started with RunFlow

Welcome! This guide will help you set up and run the RunFlow application locally on your computer. This guide is designed for beginners with basic computer science knowledge.

## Table of Contents

- [What You'll Install](#what-youll-install)
- [Installation Steps](#installation-steps)
- [Running the Application](#running-the-application)
- [Accessing the Applications](#accessing-the-applications)
- [Troubleshooting](#troubleshooting)
- [Next Steps](#next-steps)

## What You'll Install

RunFlow is a **monorepo** (multiple apps in one repository) with:
- **Web App**: A Next.js application (runs in your browser)
- **Mobile App**: An Expo/React Native app (runs on phones or simulators)
- **Backend Services**: Supabase stack running in Docker containers

You'll need to install the following tools:

### 1. VS Code (Visual Studio Code)
A powerful code editor with an integrated terminal that we'll use for all subsequent steps.

### 2. Git
Version control system to download the code.

### 3. Node.js (v18 or higher)
JavaScript runtime required to run the applications.

### 4. npm (v11.6.0)
Package manager for installing JavaScript dependencies.

### 5. Docker & Docker Compose
Container platform to run the backend services (database, authentication, etc.).

## Installation Steps

### Step 1: Install VS Code

**Why VS Code first?**
VS Code includes an integrated terminal that makes running commands easier. Once installed, you'll use VS Code's terminal for all remaining steps.

**macOS:**
1. Download from [code.visualstudio.com](https://code.visualstudio.com/)
2. Open the downloaded `.dmg` file
3. Drag VS Code to your Applications folder
4. Open VS Code from Applications

**Linux (Ubuntu/Debian):**
```bash
# Download the .deb package
wget -O code.deb 'https://code.visualstudio.com/sha/download?build=stable&os=linux-deb-x64'

# Install it
sudo apt install ./code.deb

# Launch VS Code
code
```

**Windows:**
1. Download from [code.visualstudio.com](https://code.visualstudio.com/)
2. Run the installer
3. Check "Add to PATH" during installation (important!)
4. Complete the installation and open VS Code

**Open the Integrated Terminal in VS Code:**
- Press `` Ctrl+` `` (backtick key, usually below Esc)
- Or use the menu: **View → Terminal**
- Or press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac), type "terminal", and select "Terminal: Create New Terminal"

**Install Recommended Extensions:**

Once VS Code is open:
1. Click the Extensions icon in the left sidebar (or press `Ctrl+Shift+X`)
2. Search for and install these extensions:
   - **ESLint** - JavaScript linting
   - **Prettier - Code formatter** - Code formatting
   - **Prisma** - Database schema support
   - **Tailwind CSS IntelliSense** - CSS autocomplete

### Step 2: Install Git

**Now use VS Code's integrated terminal for all remaining commands!**

**macOS:**
```bash
# Check if Git is already installed
git --version

# If not installed, install Homebrew first
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Then install Git
brew install git
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install git
```

**Windows:**
Git may already be installed with VS Code. Check first:
```bash
git --version
```

If not installed, download from [git-scm.com](https://git-scm.com/download/win), install it, then **restart VS Code**.

**Verify installation:**
```bash
git --version
```

### Step 3: Install Node.js and npm

**macOS:**
```bash
# Using Homebrew
brew install node@20
```

**Linux (Ubuntu/Debian):**
```bash
# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Windows:**
1. Download from [nodejs.org](https://nodejs.org/) (choose the LTS version)
2. Run the installer (accept all defaults)
3. **Restart VS Code** after installation

**Verify installation:**
```bash
node --version  # Should show v18 or higher
npm --version   # Should show 10 or higher
```

**Update npm to v11.6.0:**
```bash
npm install -g npm@11.6.0
```

### Step 4: Install Docker and Docker Compose

**macOS:**
1. Download [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop/)
2. Open the downloaded `.dmg` file and drag Docker to Applications
3. Launch Docker Desktop from Applications
4. Wait for Docker to start (whale icon appears in menu bar)

**Linux (Ubuntu/Debian):**
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to the docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt-get update
sudo apt-get install docker-compose-plugin

# Log out and log back in for group changes to take effect
# Or run: newgrp docker
```

**Windows:**
1. Download [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/)
2. Run the installer
3. Restart your computer when prompted
4. Launch Docker Desktop
5. Wait for Docker to start

**Verify installation:**
```bash
docker --version
docker compose version
```

### Step 5: Clone the Repository

In VS Code's terminal, navigate to where you want to store the project:

```bash
# Navigate to your preferred directory (example)
cd ~                    # macOS/Linux: go to home directory
cd Documents            # or wherever you want the project

# For Windows:
# cd C:\Users\YourUsername\Documents

# Clone the repository (replace with actual repository URL)
git clone <repository-url>

# Navigate into the project folder
cd runflow
```

**Open the project in VS Code:**

```bash
# Open the current directory in VS Code
code .
```

Or use the VS Code menu: **File → Open Folder** and select the `runflow` folder.

### Step 6: Install Project Dependencies

In VS Code's terminal, make sure you're in the `runflow` directory, then run:

```bash
npm install
```

This will install dependencies for:
- The root workspace
- The web app
- The mobile app
- All shared packages

**Note:** This may take 5-10 minutes depending on your internet connection. You'll see lots of output - this is normal!

### Step 7: Set Up Environment Variables

The project needs environment variables to configure connections to the database and other services. A `.env` file already exists in the root directory with development defaults.

**For most local development, you don't need to change anything!** The default `.env` file is already configured for local development.

You can view the `.env` file in VS Code by clicking on it in the Explorer sidebar (left side of VS Code).

If you need to customize, here's what the main variables mean:
- `DATABASE_URL`: Connection string for PostgreSQL database
- `NEXT_PUBLIC_SUPABASE_URL`: URL for Supabase API
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Public key for Supabase authentication

### Step 8: Start Docker Services

The backend services (PostgreSQL database, authentication server, etc.) run in Docker containers.

**Make sure Docker Desktop is running!** (You should see the Docker icon in your system tray/menu bar)

**Start all backend services:**
```bash
npm run docker:up
```

This command will:
- Download necessary Docker images (first time only, may take a few minutes)
- Start PostgreSQL database
- Start Supabase authentication (GoTrue)
- Start API gateway (Kong)
- Start Supabase Studio (database management UI)
- Start email testing service (Inbucket)

**Wait for services to be ready** (about 30-60 seconds). You can check the logs:
```bash
npm run docker:logs
```

Press `Ctrl+C` to stop viewing logs (services keep running in background).

**Verify services are running:**
```bash
docker ps
```

You should see containers named:
- `runflow_postgres`
- `runflow_gotrue`
- `runflow_kong`
- `runflow_studio`
- `runflow_inbucket`
- `runflow_templates`

## Running the Application

Now that everything is installed and the backend services are running, you can start the applications!

### Option 1: Run Everything Together

To run both web and mobile apps simultaneously:
```bash
npm run dev
```

### Option 2: Run Apps Separately

**Run only the Web App:**
```bash
npm run dev:web
```

**Run only the Mobile App:**
```bash
npm run dev:mobile
```

### First-time Web App Setup

The web app uses Prisma for database management. The first time you run it, you need to set up the database schema:

```bash
cd apps/web
npx prisma migrate deploy
cd ../..
```

Then start the web app:
```bash
npm run dev:web
```

**Pro Tip:** You can open multiple terminals in VS Code by clicking the `+` button in the terminal panel. This lets you run multiple services at once!

## Accessing the Applications

Once the development servers are running, you can access:

### Web Application
- **Main App**: [http://localhost:3000](http://localhost:3000)
- Open this URL in your web browser (Chrome, Firefox, Safari, etc.)

### Mobile Application
- After running `npm run dev:mobile`, you'll see a QR code in your terminal
- Install **Expo Go** app on your phone:
  - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
  - [Android Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
- Scan the QR code with your phone's camera (iOS) or Expo Go app (Android)
- **For web preview**: Press `w` in the terminal

### Development Tools

- **Supabase Studio** (Database UI): [http://localhost:3001](http://localhost:3001)
  - View and edit database tables
  - Manage authentication users
  - View API logs

- **Inbucket** (Email Testing): [http://localhost:9000](http://localhost:9000)
  - View emails sent by the application (like sign-up confirmations, password resets)
  - All emails sent locally are caught here instead of being sent to real email addresses

- **API Gateway**: [http://localhost:8000](http://localhost:8000)
  - Backend API endpoint

## Troubleshooting

### Port Already in Use

If you see an error about a port already being in use:

```bash
# Stop all Docker services
npm run docker:down

# Check what's using the port (example for port 3000)
# macOS/Linux:
lsof -ti:3000

# Windows (PowerShell):
netstat -ano | findstr :3000

# Kill the process using the port
# macOS/Linux:
kill -9 <PID>

# Windows (PowerShell - run as Administrator):
taskkill /PID <PID> /F

# Start Docker services again
npm run docker:up
```

### Docker Services Won't Start

```bash
# Stop all services
npm run docker:down

# Remove all containers and volumes (WARNING: This deletes all data)
docker compose down -v

# Restart Docker Desktop completely

# Start services again
npm run docker:up
```

### npm install Fails

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Windows (PowerShell):
Remove-Item -Recurse -Force node_modules, package-lock.json

# Reinstall
npm install
```

### Database Connection Issues

Make sure:
1. Docker Desktop is running
2. Docker services are running: `docker ps`
3. PostgreSQL container is healthy: `docker ps | grep runflow_postgres`
4. Wait 30-60 seconds after starting Docker services for them to be fully ready

### TypeScript Errors

```bash
# Run type checking to see all errors
npm run check-types

# Regenerate Prisma client
cd apps/web
npx prisma generate
cd ../..
```

### Command Not Found

If you get "command not found" errors after installing Node.js or other tools:
1. Close and reopen VS Code
2. Open a new terminal in VS Code (`` Ctrl+` ``)
3. Try the command again

## Next Steps

Congratulations! You now have RunFlow running locally. Here's what you can do next:

### Learn the Codebase Structure

```
runflow/
├── apps/
│   ├── web/          # Next.js web application
│   └── mobile/       # Expo mobile application
├── packages/
│   ├── schemas/      # Shared Zod validation schemas
│   ├── ui/           # Shared UI components
│   ├── database/     # Database utilities
│   ├── eslint-config/    # Shared ESLint configuration
│   └── typescript-config/ # Shared TypeScript configuration
├── supabase/         # Supabase configuration and migrations
├── docker/           # Docker initialization scripts
├── package.json      # Root package.json with scripts
├── turbo.json        # TurboRepo configuration
└── docker-compose.yml # Docker services configuration
```

### Common Development Commands

All these commands should be run in VS Code's terminal:

```bash
# Run linting (check code style)
npm run lint

# Run type checking
npm run check-types

# Build all apps for production
npm run build

# Format code with Prettier
npm run format

# View Docker logs
npm run docker:logs

# Stop Docker services
npm run docker:down

# Restart Docker services
npm run docker:down && npm run docker:up
```

### Database Management

```bash
# Access Prisma Studio (database GUI)
cd apps/web
npx prisma studio

# Create a new migration
cd apps/web
npx prisma migrate dev --name your_migration_name

# Reset database (WARNING: deletes all data)
cd apps/web
npx prisma migrate reset
```

### Testing

```bash
# Run tests for web app
cd apps/web
npm test

# Run tests in watch mode
cd apps/web
npm run test:watch
```

### VS Code Tips

- **Split Terminal**: Click the split terminal icon to run multiple commands side-by-side
- **Multiple Terminals**: Click the `+` to open additional terminals (useful for running web and mobile simultaneously)
- **Quick Open**: Press `Ctrl+P` (or `Cmd+P` on Mac) to quickly open files
- **Command Palette**: Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac) to access all VS Code commands
- **Integrated Source Control**: Click the Git icon in the left sidebar to view changes and commit

### Getting Help

- Check existing documentation in the repository
- Look for `README.md` files in specific directories
- Review `TODO.md` for known issues and planned features
- Check `EMAIL_SETUP.md` for email configuration details

## Daily Development Workflow

Here's what you'll typically do each day:

1. **Open VS Code**
   - Open the `runflow` folder

2. **Start Docker services** (if not already running)
   ```bash
   npm run docker:up
   ```

3. **Start development servers**
   ```bash
   npm run dev        # Or npm run dev:web for web only
   ```

4. **Make your changes**
   - Edit code in VS Code
   - Changes will automatically reload in the browser/app

5. **When you're done**
   - Press `Ctrl+C` in the terminal to stop dev servers
   - Stop Docker services:
   ```bash
   npm run docker:down
   ```

## Project Overview

**RunFlow** is built with:
- **Frontend**: React 19, Next.js 15 (web), Expo (mobile)
- **Styling**: Tailwind CSS, Radix UI components
- **Backend**: Supabase (PostgreSQL + Auth)
- **Type Safety**: TypeScript, Zod schemas
- **Database ORM**: Prisma
- **Monorepo Tool**: TurboRepo
- **Package Manager**: npm workspaces

Happy coding! Welcome to the RunFlow project! 🚀
