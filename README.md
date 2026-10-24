# StaffSync

HR management app built on the MERN stack. Roles: HR, Manager, Employee.

```
staffsync/
├── server/   Express + MongoDB API (JWT auth)
├── client/   React (Vite) + Bootstrap
├── render.yaml, package.json   one-service deployment
```

## Run locally (VS Code)

Prerequisites: Node 18+, MongoDB running locally (or an Atlas connection string).

1. Open the `staffsync` folder in VS Code.
2. Terminal 1:
   ```
   cd server
   npm install
   npm run dev
   ```
   `server/.env` is already created. Edit `MONGO_URI` / `JWT_SECRET` if needed.
3. Terminal 2:
   ```
   cd client
   npm install
   npm run dev
   ```
4. Open http://localhost:5173, click **Create an account**, and choose a role.
   Create one HR account first. HR can then add employees and assign each employee a manager under **Employees → Edit → Reports to**. Managers only see leave requests from people assigned to them.

## Publish on the internet (Render + MongoDB Atlas, both free tiers)

The Express server serves the built React app, so you deploy one service.

1. **Database**: create a free cluster at mongodb.com/atlas. Create a database user, and under Network Access allow `0.0.0.0/0`. Copy the connection string and add a database name, e.g.
   `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/staffsync`
2. **Code**: push this folder to a new GitHub repository (`.gitignore` already excludes secrets).
3. **Render**: render.com → New → **Blueprint** → pick the repository (it reads `render.yaml`).
   When asked, set:
   - `MONGO_URI` = your Atlas string
   - `REGISTRATION_CODE` = a code only your HR/managers know
   `JWT_SECRET` is generated automatically.
4. After the build finishes, Render gives you a public `https://….onrender.com` URL. Open it and register your HR account with the code.

Manual setup instead of Blueprint: New → Web Service, Build command `npm run build`, Start command `npm start`, and add the same environment variables.

Free Render services sleep after inactivity, so the first visit can take about 30 seconds.

## API summary

| Area | Endpoints |
|---|---|
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` |
| Employees | `GET/POST /api/employees` (HR; managers list their team), `GET/PUT /api/employees/:id`, `DELETE` (HR) |
| Leaves | `POST /api/leaves`, `GET /api/leaves/mine`, `GET /api/leaves/team`, `PATCH /api/leaves/:id/status`, `DELETE /api/leaves/:id` |
| Attendance | `POST /api/attendance/check-in`, `POST /api/attendance/check-out`, `GET /api/attendance/mine`, `GET /api/attendance` (HR) |
| Announcements | `GET /api/announcements`, `POST/DELETE` (HR) |
| Training | `GET /api/trainings`, `POST` (manager/HR), `POST /api/trainings/:id/enroll`, `/unenroll`, `DELETE` |
