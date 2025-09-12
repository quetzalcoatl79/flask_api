# Flask API + Next.js Frontend

This project has been converted from a traditional Flask template-based application to a modern API-first architecture with a Next.js frontend.

## Architecture

- **Backend**: Flask API (Python)
- **Frontend**: Next.js (TypeScript + React)
- **Database**: PostgreSQL (production) / SQLite (development)
- **Authentication**: Flask-Login with session-based auth
- **Styling**: Tailwind CSS

## Project Structure

```
├── app/                     # Flask API
│   ├── __init__.py         # App factory with CORS config
│   ├── auth.py             # Authentication API endpoints
│   ├── routes.py           # Main API routes
│   ├── models.py           # Database models
│   └── extensions.py       # Flask extensions
├── frontend/               # Next.js application
│   ├── src/
│   │   ├── app/            # Next.js app directory
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts (auth)
│   │   └── lib/            # API client
│   ├── Dockerfile          # Frontend Docker config
│   └── package.json
├── Dockerfile              # Backend Docker config
├── docker-compose.yml      # Multi-container setup
└── requirements.txt        # Python dependencies
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/status` - Check authentication status

### Main
- `GET /api/` - Home endpoint with user info
- `GET /api/user` - Get user details (authenticated)

## Frontend Features

- **Authentication Flow**: Login, register, logout with session management
- **Responsive Design**: Mobile-first with Tailwind CSS
- **Type Safety**: Full TypeScript implementation
- **State Management**: React Context for authentication state
- **API Integration**: Typed API client with proper error handling

## Development Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- Docker (optional)

### Backend Setup
```bash
cd /path/to/project
pip install -r requirements.txt
export DATABASE_URL=sqlite:///test.db
python -c "from app import create_app; from app.extensions import db; app = create_app(); app.app_context().push(); db.create_all()"
flask --app=app --debug run --host=0.0.0.0 --port=5000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at http://localhost:3000 and will communicate with the API at http://localhost:5000.

### Docker Setup
```bash
docker-compose up --build
```

This will start both backend (port 5000) and frontend (port 3000) services along with PostgreSQL and Redis.

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Backend
```
DATABASE_URL=postgresql://postgres:postgres@db:5432/postgres
REDIS_URL=redis://redis:6379/0
SECRET_KEY=your-secret-key
```

## Migration from Templates

The following Flask templates have been converted to Next.js components:

- `templates/base.html` → `layout.tsx` + `Navbar.tsx`
- `templates/index.html` → `page.tsx` (home)
- `templates/auth/login.html` → `components/Login.tsx`
- `templates/auth/register.html` → `components/Register.tsx`
- `templates/base/navbar.html` → `components/Navbar.tsx`

## Features

✅ **Complete Authentication System**
- User registration with validation
- Secure login/logout
- Session management with CORS
- User profile display

✅ **Modern UI/UX**
- Beautiful gradient login form
- Clean registration form
- Responsive navigation
- User dropdown menu

✅ **API-First Design**
- RESTful endpoints
- JSON request/response
- Proper error handling
- CORS configuration

✅ **Type Safety**
- TypeScript throughout
- Typed API client
- Proper interfaces

✅ **Production Ready**
- Docker containers
- Environment configuration
- Database migrations
- Error boundaries