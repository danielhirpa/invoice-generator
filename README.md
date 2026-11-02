 Full-Stack Invoice Generator

A modern, full-stack web application designed to streamline billing, real-time calculations, and persistent record-keeping for freelancers and small businesses.



 Key Features

Dynamic Invoice Creation:** Interactive form interface with real-time total, tax, and itemized calculations.
Persistent Record-Keeping:** Fully integrated backend ensuring every invoice and line item is stored securely in a relational database.
Clean PDF & Print Export:** Optimized CSS layout for seamless PDF generation and print formatting directly from the browser.
Decoupled Architecture:** Clean client-server separation using a Next.js frontend communicating with a Django REST API via JSON.



 Tech Stack

Frontend
Framework:Next.js (App Router, Turbopack)
Language:TypeScript / JavaScript
Styling: Tailwind CSS / Modern CSS

 Backend & Database
Framework: Python, Django, Django REST Framework (DRF)
Middleware:`django-cors-headers`
Database: PostgreSQL (via `psycopg2-binary`)



⚙️ Getting Started & Local Setup

Follow these steps to set up and run the project locally.

 Prerequisites
Node.js: v18.x or higher
Python: v3.10 or higher
PostgreSQL:Installed and running locally or on a cloud host



1. Repository Setup

```powershell
git clone [https://github.com/YOUR_USERNAME/invoice-generator.git](https://github.com/YOUR_USERNAME/invoice-generator.git)
cd invoice-generator
2. Backend Setup (Django & PostgreSQL)
Activate your Python virtual environment:

PowerShell
python -m venv venv
.\venv\Scripts\Activate.ps1
Install dependencies:

PowerShell
pip install -r requirements.txt
Ensure database migrations are applied:

PowerShell
python manage.py makemigrations
python manage.py migrate
Run the Django development server:

PowerShell
python manage.py runserver
Backend API runs at http://localhost:8000/.

3. Frontend Setup (Next.js)
Open a new terminal window in the project root:

Install Node modules:

PowerShell
npm install
Run the Next.js development server:

PowerShell
npm run dev
Frontend application runs at http://localhost:3000/.
 License
This project is open-source and available under the MIT License.