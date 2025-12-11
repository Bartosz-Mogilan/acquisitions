echo "Starting Acquisitions App in Production Mode"

# Checking if .env.production file exists
if [ ! -f .env.production ]; then
    echo "Error .env.production file not found"
    exit 1
fi

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "Error: Docker is not running"
    exit 1
fi

# Creating a neon_local directory if it does not exist
mkdir -p .neon_local

# Adding neon_local to .gitignore
if ! grep -q ".neon_local/" .gitignore 2>/dev/null; then
    echo ".neon_local/" >> .gitignore
    echo "Added .neon_local/ to .gitignore"
fi

echo "Building production image(s)..."
docker compose -f docker-compose.prod.yml build

echo ""
echo "Applying latest schema with Drizzle..."
docker compose -f docker-compose.prod.yml run --rm app npm run db:migrate

echo ""
echo "Starting production environment..."
docker compose -f docker-compose.prod.yml up --build

echo ""
echo "Production environment started"
echo "Application running on: http://localhost:3000"
echo "To stop environment, press Ctrl+C or run: docker compose -f docker-compose.prod.yml down"
