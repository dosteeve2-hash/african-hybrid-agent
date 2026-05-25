#!/bin/bash

# African Hybrid Agent - Project Validation Script
# This script validates the complete project setup

echo "🔍 African Hybrid Agent - Project Validation"
echo "==========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASS_COUNT=0
FAIL_COUNT=0

# Function to check file exists
check_file() {
  if [ -f "$1" ]; then
    echo -e "${GREEN}✓${NC} $1"
    ((PASS_COUNT++))
  else
    echo -e "${RED}✗${NC} $1"
    ((FAIL_COUNT++))
  fi
}

# Function to check directory exists
check_dir() {
  if [ -d "$1" ]; then
    echo -e "${GREEN}✓${NC} $1"
    ((PASS_COUNT++))
  else
    echo -e "${RED}✗${NC} $1"
    ((FAIL_COUNT++))
  fi
}

# 1. Check Core Files
echo "📋 Checking Core Files..."
check_file "package.json"
check_file "tsconfig.json"
check_file "next.config.ts"
check_file ".env.local"
echo ""

# 2. Check Application Structure
echo "🏗️  Checking Application Structure..."
check_dir "src/app"
check_dir "src/lib"
check_dir "src/lib/db"
check_dir "src/lib/rag"
check_dir "src/lib/agent"
check_dir "src/lib/types"
echo ""

# 3. Check Database Files
echo "🗄️  Checking Database Setup..."
check_file "src/lib/db/client.ts"
check_file "src/lib/db/config.ts"
check_file "src/lib/db/services.ts"
check_file "db/migrations/001_initial_schema.sql"
check_file "docker-compose.postgres.yml"
echo ""

# 4. Check Test Files
echo "🧪 Checking Test Suite..."
check_file "jest.config.ts"
check_file "jest.setup.ts"
check_file "src/lib/rag/__tests__/embeddings.test.ts"
check_file "src/lib/rag/__tests__/retrieve.test.ts"
check_file "src/lib/agent/__tests__/orchestrator.test.ts"
echo ""

# 5. Check API Routes
echo "🔌 Checking API Routes..."
check_file "src/app/api/chat/route.ts"
check_file "src/app/api/evidence/route.ts"
check_file "src/app/api/corpus/route.ts"
check_file "src/app/api/admin/corpus/route.ts"
echo ""

# 6. Check Admin Pages
echo "🔐 Checking Admin Interface..."
check_file "src/app/admin/page.tsx"
check_file "src/app/corpus/page.tsx"
echo ""

# 7. Check Corpus Data
echo "📚 Checking Corpus Sources..."
check_dir "data/corpus"
corpus_count=$(ls -1 data/corpus/*.md 2>/dev/null | wc -l)
echo -e "   Found ${YELLOW}$corpus_count${NC} corpus sources"
((PASS_COUNT+=1))
echo ""

# 8. Check Documentation
echo "📖 Checking Documentation..."
check_file "README.md"
check_file "QUICK_START.md"
check_file "docs/API_REFERENCE.md"
check_file "docs/DEPLOYMENT.md"
check_file "docs/GOVERNANCE.md"
check_file "docs/DATA_PIPELINE.md"
echo ""

# 9. Node Dependencies
echo "📦 Checking Node Dependencies..."
if [ -d "node_modules" ]; then
  echo -e "${GREEN}✓${NC} node_modules"
  ((PASS_COUNT++))
else
  echo -e "${YELLOW}⚠${NC} node_modules (run: npm install)"
fi
echo ""

# 10. TypeScript Compilation Check
echo "🔨 Checking TypeScript Build..."
if npx tsc --noEmit 2>/dev/null; then
  echo -e "${GREEN}✓${NC} TypeScript compilation successful"
  ((PASS_COUNT++))
else
  echo -e "${RED}✗${NC} TypeScript compilation errors"
  ((FAIL_COUNT++))
fi
echo ""

# Summary
echo "==========================================="
echo "📊 Validation Summary"
echo "==========================================="
echo -e "${GREEN}Passed:${NC} $PASS_COUNT"
echo -e "${RED}Failed:${NC} $FAIL_COUNT"
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
  echo -e "${GREEN}✓ All checks passed!${NC}"
  echo ""
  echo "🚀 Next steps:"
  echo "  1. npm run dev          # Start development server"
  echo "  2. npm test             # Run test suite"
  echo "  3. docker-compose -f docker-compose.postgres.yml up -d  # Start database"
  exit 0
else
  echo -e "${RED}✗ Some checks failed${NC}"
  echo ""
  echo "Run: npm install && npm run build"
  exit 1
fi
