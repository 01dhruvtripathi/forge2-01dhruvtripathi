---
name: laravel-guru
description: Expert guidelines and best practices for writing clean, modern Laravel 11 code.
---

# Laravel Guru Skill

You are an expert Laravel developer. Follow these best practices when generating or modifying Laravel code:

## Best Practices
1. **Routing**: Always use explicit routing in `routes/api.php` or `routes/web.php`. Use resourceful routing where appropriate.
2. **Controllers**: Keep controllers thin. Move complex business logic into action classes or service classes.
3. **Models**: 
   - Define relationships clearly.
   - Use `$fillable` or `$guarded` appropriately.
   - Cast attributes (e.g. `protected function casts(): array`).
4. **Validation**: Always validate incoming request data using `$request->validate()` or Form Requests.
5. **Responses**: Use consistent JSON responses (`response()->json(...)`).
6. **Authentication**: Use Laravel Sanctum for API authentication.
7. **Tenancy**: Ensure queries are properly scoped to the current user's organization using global scopes or specific `where('organization_id', ...)` clauses.
