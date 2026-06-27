# PulseDesk

PulseDesk is an AI-built Helpdesk and Ticketing application, developed for the forge2 AI-agent workflow hackathon. It demonstrates a full-stack Laravel and React application with multi-tenancy, built entirely through the orchestration of AI agents (Hermes & OpenClaw).

## Stack
- **Backend**: Laravel 11 (REST API), PHP 8.2+, MySQL 8
- **Frontend**: React 19 + Vite, Tailwind CSS
- **Testing**: Pest (Feature Tests for API)
- **CI/CD**: GitHub Actions

## Models Used (Agents)
- **Hermes**: `deepseek/deepseek-v4-pro` (via EastRouter) - Acted as the Product Owner/Orchestrator.
- **OpenClaw**: `z-ai/glm-5.1` (via EastRouter) - Acted as the primary Coder/Workhorse.

## Exact Run Steps

### Prerequisites
- PHP 8.2+
- Composer
- Node.js 20+
- MySQL 8

### Backend Setup
1. `cd backend`
2. `cp .env.example .env`
3. Configure your database credentials in `.env`
4. `composer install`
5. `php artisan key:generate`
6. `php artisan migrate --seed` (This sets up the initial tenants, roles, and test data)
7. `php artisan serve` (Starts API on `http://localhost:8000`)

### Frontend Setup
1. `cd frontend`
2. `cp .env.example .env` (Ensure `VITE_API_URL=http://localhost:8000`)
3. `npm install`
4. `npm run dev` (Starts UI on `http://localhost:5173`)

### Running Tests
To verify the application functionality and tenancy isolation:
1. `cd backend`
2. `php artisan test`

## Tenancy Demo
To test multi-tenant isolation:
1. Login as `admin@acme.test` (password: `password`)
2. Observe 12 tickets belonging to Acme Corp.
3. Logout and login as `dave@beta.test` (password: `password`)
4. Observe that only Beta Inc's tickets are visible.

## Live URL
N/A - Run locally for demo.
