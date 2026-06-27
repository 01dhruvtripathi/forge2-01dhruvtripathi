# PulseDesk Architecture

## Data Model

The PulseDesk database is structured to support multi-tenancy at the Organization level. 

- **Organization**: The top-level tenant (e.g., a customer company).
- **User**: Belongs to an Organization. Users have roles (`admin`, `agent`, `customer`).
- **Ticket**: Belongs to an Organization and a User (creator), and can be assigned to an agent User.
- **Comment**: Belongs to a Ticket and a User (author).
- **SlaPolicy**: Defines the SLA rules for an Organization (e.g., response time).
- **ActivityLog**: Tracks status changes and assignments on a Ticket.

## API Routes

The backend provides a RESTful API with the following structure:

- `POST /api/login`: Authenticate and issue Sanctum token/session.
- `POST /api/logout`: Terminate session.
- `GET /api/user`: Retrieve the currently authenticated user and their organization.
- `GET /api/tickets`: List tickets for the user's organization (agents see all, customers see their own).
- `POST /api/tickets`: Create a new ticket.
- `GET /api/tickets/{id}`: View a specific ticket.
- `PUT /api/tickets/{id}`: Update ticket status/assignee.
- `GET /api/tickets/{id}/comments`: Get comments for a ticket.
- `POST /api/tickets/{id}/comments`: Add a comment to a ticket.

## Multi-tenancy Approach

We employ **Logical Isolation (Row-Level Tenancy)**.
Every tenant-scoped table (Users, Tickets, SlaPolicies) has an `organization_id` foreign key.

- **Global Scopes**: A Laravel Global Scope is applied to the `Ticket`, `User`, and `Comment` models to automatically append `WHERE organization_id = ?` to all queries based on the currently authenticated user's organization.
- **Policies**: Laravel Authorization Policies are used to ensure users cannot view or modify resources outside their organization, and to enforce role-based permissions (e.g., only agents can re-assign tickets).

## Frontend Architecture

The frontend is a React 19 Single Page Application (SPA) built with Vite and Tailwind CSS.
- **AuthContext**: Manages the global authentication state.
- **API Client**: Axios is configured to handle credentials (`withCredentials: true`) to seamlessly work with Laravel Sanctum's cookie-based authentication, retrieving CSRF tokens automatically on initialization.
