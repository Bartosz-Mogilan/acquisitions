echo "Starting Acquisitions App in Development Mode"

# Checking if .env.development file exists
if [ ! -f .env.development ]; then
    echo "Error .env.development file not found"
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

echo "Building and starting development containers..."

# Run migrations with Drizzle
echo "Applying latest schema with Drizzle..."
npm run db:migrate

# Waiting for database
echo "Waiting for database..."
docker compose exec neon-local psql -U neon -d neondb -c 'SELECT 1'

# Starting development environment
docker compose -f docker-compose.dev.yml up --build

# Commands and Info
echo ""
echo "Development environment started"
echo "Application running on: http://localhost:3000"
echo "To stop environment, press Ctrl+C or run: docker compose down"

