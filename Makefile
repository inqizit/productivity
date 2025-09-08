# Productivity App Makefile
# Commands for running and deploying the multi-app productivity suite

.PHONY: help run deploy build install clean

# Default target
help:
	@echo "Available commands:"
	@echo "  make run       - Start development server in browser"
	@echo "  make deploy    - Build and deploy to GitHub Pages"
	@echo "  make build     - Build production version"
	@echo "  make install   - Install dependencies"
	@echo "  make clean     - Clean build files and dependencies"

# Start development server
run:
	@echo "🚀 Starting development server..."
	@echo "📱 App will open at http://localhost:3000"
	@echo "🎯 Countdown app: http://localhost:3000/productivity"
	npm start

# Build and deploy to GitHub Pages
deploy:
	@echo "🏗️  Building production version..."
	npm run build
	@echo "🚀 Deploying to GitHub Pages..."
	npm run deploy
	@echo "✅ Deployment complete!"
	@echo "🌐 Your app will be available at: https://inqizit.github.io/productivity"

# Build production version only
build:
	@echo "🏗️  Building production version..."
	npm run build
	@echo "✅ Build complete! Check the 'build' folder."

# Install dependencies
install:
	@echo "📦 Installing dependencies..."
	npm install
	@echo "✅ Dependencies installed!"

# Clean build files and dependencies
clean:
	@echo "🧹 Cleaning build files and dependencies..."
	rm -rf build/
	rm -rf node_modules/
	rm -f package-lock.json
	@echo "✅ Cleaned! Run 'make install' to reinstall dependencies."

# Quick setup for new developers
setup: install
	@echo "🎉 Setup complete!"
	@echo "📝 Next steps:"
	@echo "  1. Update homepage URL in package.json with your GitHub username"
	@echo "  2. Run 'make run' to start development"
	@echo "  3. Run 'make deploy' when ready to publish"
