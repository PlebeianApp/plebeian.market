## Plebeian.market
### WIP!
In this repo we will develop the new plebeian app.

## Development

You'll need to have [pnpm](https://pnpm.io/) installed.

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