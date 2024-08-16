This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started
This is william typing, heres how to run the shit, i might still be sleeping

1. npm install to install all dependencies
2. go to .env.local and change the DATABASE_URL="mysql://root:JasonSQL20@@localhost:3306/trackjam" to DATABASE_URL="mysql://username:password@localhost:3306/databasename"
  dont be stupid. dont literally write username, password, and databasename. If you havent already, go to mysqlworkbench, make a new schema called "trackjam" (this will be databasename), and use your username and password for the "mysql://username:password part of the DATABASE_URL. username is usually root, password make yourself.
Sequelize will automatically create the tables and etc
3. Run the shit, do npm run dev
4. login through spotify
5. after logged in go /dashboard
6. and yeah its working, fuck u





First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
