# 🌟 SHG Platform - Frontend (React + ShadCN UI)

This is the frontend for the Digital Saving Group (DSG) platform. It allows group members, presidents, treasurers, and admins to manage loans, savings, group activities, and SDG tracking in an intuitive UI built with **React**, **Vite**, **ShadCN**, and **TailwindCSS**.

---

## 🛠️ Tech Stack

- ⚛️ React + TypeScript
- ⚡ Vite (build tool)
- 🎨 TailwindCSS + ShadCN UI
- 🍔 ShadCN components (Sheet, Dropdown, Button, etc.)
- 🔐 JWT Auth + Role-based UI rendering
- 🌐 API connection to Spring Boot backend

---

## 🚀 Getting Started

### ✅ Prerequisites

- Node.js `>=18.x`
- NPM `>=9.x` or Yarn
- Backend API running on `http://localhost:8080`

---

### 📦 Installation

```bash
# Clone the repo
git clone https://github.com/techasutos/hackathonui
cd hackathonuis

# Install dependencies
npm install
# OR
yarn

⚙️ Environment Setup (optional)
Create a .env file in the root with the following:


VITE_API_BASE_URL=http://localhost:8080/api
Change the value if your backend is running on a different host or port.

▶️ Running the App (Dev Mode)

cd client 
npm run dev

# OR
yarn dev
The UI will be available at: http://localhost:5000



🏗️ Build for Production
bash
Copy
Edit
npm run build
# OR
yarn build
🔥 Start Preview (Built App)
bash
Copy
Edit
npm run preview
# OR
yarn preview
🔑 Auth & Roles
MEMBER: Can apply & repay loans

PRESIDENT: Can approve/reject loans

TREASURER: Can disburse loans

SUPER_ADMIN: Full access

Roles are automatically applied via JWT after login.

🧩 Folder Structure
bash
Copy
Edit
src/
├── components/
│   ├── layout/         # Navbar, Sidebar, Footer, MainFrame
│   └── loans/          # LoanTable, LoanLogsModal
├── hooks/              # useAuth, useGroup, etc.
├── pages/              # loan-approvals, dashboard, etc.
├── services/           # loanService.ts, authService.ts
├── App.tsx             # App entry
└── main.tsx            # Vite entry point
🧪 Testing (Optional)
You can add Vitest or Jest for component testing.

🐞 Troubleshooting
CORS issues?
Ensure the backend Spring Boot app allows http://localhost:5000 in its CORS config.

Login not working?
Confirm backend is running, and JWT secret matches both frontend and backend.

Sidebar rendering twice?
Ensure only Navbar contains Sidebar via burger menu. MainFrame should not directly render it unless responsive.

📸 Screenshots
Coming soon...

🧠 Contributing
Fork this repo

Create your branch: git checkout -b feature/xyz

Commit changes: git commit -am 'Add xyz'

Push and create PR

📝 License
MIT © 2025 DigitalSavingGroup

📬 Contact
For queries, contact: support@digitalsavinggroup.org