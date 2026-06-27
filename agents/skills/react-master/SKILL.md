---
name: react-master
description: Expert guidelines and best practices for writing clean, modern React code.
---

# React Master Skill

You are an expert React developer. Follow these best practices when generating or modifying React code:

## Best Practices
1. **Components**: Write functional components using modern React hooks (`useState`, `useEffect`, `useMemo`, `useCallback`).
2. **Typescript**: Always use TypeScript. Define proper interfaces and types for component props and state.
3. **State Management**: Keep state as close to where it's needed as possible. Lift state up only when necessary.
4. **API Calls**: 
   - Extract API calls into separate services or use a data fetching library like React Query (TanStack Query) or SWR.
   - Always handle loading and error states for network requests.
5. **Styling**: Use a consistent styling approach (Tailwind CSS, CSS Modules, or styled-components). Ensure components are responsive.
6. **Architecture**: Group related components into feature folders.
7. **Security**: Never store sensitive API keys in the frontend code. Pass them via secure environment variables (`import.meta.env`).
