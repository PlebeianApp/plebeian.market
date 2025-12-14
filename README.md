## Plebeian.market
### WIP!
In this repo we will develop the new plebeian app.

## Development

You'll need Node.js 22 (see `.nvmrc`) and [pnpm](https://pnpm.io/) installed.

If you use [nvm](https://github.com/nvm-sh/nvm), run:

```bash
nvm install  # first time setup
nvm use      # subsequent sessions
```

Now install the dependencies.

```bash
pnpm install
```

We use [Drizzle](https://orm.drizzle.team/) to interact with the database. Create a new database and apply the migrations.

```bash
pnpm db:setup
```

Now, you can start the development server.

```bash
pnpm dev
```

You're in!

## Contributing

We use [Conventional Commits](https://www.conventionalcommits.org/) for our commit messages.

## Troubleshooting

If you have problems installing `better-sqlite3`, try using Node 22.