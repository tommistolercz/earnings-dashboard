# Earnings Dashboard

**"Watching money grow is more fun than just earning it!"**

**[Earnings Dashboard](https://earnings-dashboard-5vw7.onrender.com/)** is a minimalist web application for freelancers who want to track their earnings in real time.

## Features

- **Current earnings** – in a current month in real time
- **Maximum earnings** - in a current month respecting weekends and holidays
- **Growth rate** – earnings per day, hour, minute, second
- **Settings** – manday rate, currency, VAT rate, country, time zone, work hours
- **Sign in** - with your Google account

## Development

### Tech stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express, TypeScript
- DB: PostgreSQL, Prisma, Redis
- API: REST
- Auth: Google oAuth2
- Testing: Vitest, Playwright

### How to set up local environment

PostgreSQL local server

```bash
brew install postgresql
brew services start postgresql
```

Redis local server

```bash
brew install redis
brew services start redis
```

### Automated deployment

- [Render.com](https://dashboard.render.com/project/prj-d1o1i97fte5s73c8u6pg)

### Google auth administration

- [Google Auth Platform](https://console.cloud.google.com/auth/overview?project=earnings-dashboard-465522)
