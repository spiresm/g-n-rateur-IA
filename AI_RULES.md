# AI Development Rules

This document outlines the technology stack and coding conventions for this application. Following these rules ensures consistency and maintainability.

## Technology Stack

The application is built with the following technologies:

*   **Backend:** A Python server using the **FastAPI** framework. It serves as an API and a proxy to the ComfyUI service.
*   **Frontend:** A static web interface built with **HTML, CSS, and vanilla JavaScript**. The focus is on simplicity and performance without a heavy client-side framework.
*   **Styling:** All styling is done with **plain CSS**, using custom properties (variables) for theming and consistency. No CSS frameworks are used.
*   **Real-time Communication:** **WebSockets** are used for real-time progress updates during image generation, proxied through the FastAPI backend.
*   **External AI Service:** The core functionality relies on **ComfyUI**, an external image generation service, which the backend communicates with via HTTP and WebSockets.
*   **Deployment:** The frontend is intended for static hosting (like Netlify), and the backend is designed to run on a service like Render.

## Library and Framework Usage Rules

### Backend (Python)

*   **Web Framework:** Exclusively use **FastAPI** for creating all API endpoints.
*   **HTTP Requests:** Use the `requests` library for all synchronous outbound HTTP calls to external services like the ComfyUI API.
*   **WebSocket Handling:** Use the `websockets` library for proxying WebSocket connections between the client and the ComfyUI service.
*   **File Handling:** Use Python's built-in `os` and `json` modules for managing workflows and files on the server.

### Frontend (JavaScript)

*   **Core Language:** Write all client-side logic in **vanilla JavaScript (ES6+)**. Do not introduce frameworks like React, Vue, or Svelte unless a major architectural change is requested.
*   **API Communication:** Use the native `fetch` API for all asynchronous requests to the backend.
*   **DOM Manipulation:** Use standard browser APIs like `document.querySelector()`, `element.addEventListener()`, and `element.classList` for interacting with the user interface. Avoid jQuery or other similar libraries.
*   **Real-time Updates:** Use the native `WebSocket` API to connect to the backend for progress updates.

### Styling (CSS)

*   **Methodology:** Continue using plain CSS as established in the existing stylesheets.
*   **Variables:** Leverage the CSS variables defined in `:root` for all colors, spacing, and radii to maintain a consistent design.
*   **Responsiveness:** Ensure all new components and layouts are responsive using media queries.