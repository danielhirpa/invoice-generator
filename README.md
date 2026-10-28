# Freelance Invoice Generator

I built this project to make it easy to create, preview, and save invoices as a freelance developer. It's a full-stack web app with a Next.js frontend and a Django REST Framework backend connected to a PostgreSQL database.

## What I Built Into This
- **Live Preview Editor**: A split-screen layout where filling out form fields updates a clean, professional invoice preview in real time.
- **PDF Export**: Uses `html2canvas` and `jsPDF` so you can download a clean PDF copy directly from the browser.
- **Django REST API**: Connected the Next.js frontend to a custom Django backend to handle data persistence for invoices and line items.
- **Saved Invoices Dashboard**: Fetches and lists all records saved in the database right inside the sidebar.

## Tech Stack
- **Frontend**: Next.js (App Router, TypeScript), Tailwind CSS, Lucide React
- **Backend**: Python, Django, Django REST Framework, PostgreSQL (with SQLite for local testing)

## How to Run It Locally

### 1. Clone the repo
```bash
git clone [https://github.com/danielhirpa/invoice-generator.git](https://github.com/danielhirpa/invoice-generator.git)
cd invoice-generator