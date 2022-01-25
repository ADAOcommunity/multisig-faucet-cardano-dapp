<p align="center">
</p>

<br />

<div align="center"><strong>Token faucet Dapp with Next.js</strong></div>
<div align="center">Faucet for distribution of Cardano native tokens using multisig transactions</div>

<br />

<div align="center">
  <sub>Created by <a href="https://twitter.com/dzCodes">dzCodes</a> with the help of <a href="https://github.com/jpedroschmitz/typescript-nextjs-starter">Next.js starter </a> and <a href="https://github.com/dendorferpatrick/nami-wallet-examples/blob/master/Multi-Signature.md">multisignature examples</a> </sub>
</div>

<br />

## Features

- ⚡️ Next.js 12
- ⚛️ React 17
- ⛑ TypeScript
- 📏 ESLint — Find and fix problems in your code
- 💖 Prettier — Code Formatter for consistent style
- 🐶 Husky — For running scripts before committing
- 📄 Commitizen — To define a standard way of committing rules
- 🚓 Commitlint — Make sure your commit messages follow the convention
- 🖌 Renovate — Keep your dependencies up to date
- 🚫 lint-staged — To run ESLint and Prettier against staged Git files
- 👷 PR Workflow — Run Type Check & Linters on all Pull Requests
- ⚙️ EditorConfig - Maintain consistent coding styles across editors and IDEs
- 🗂 Path Mapping — Import components or images using the `@` prefix
- Tailwind css
- Cardano <a href="https://cips.cardano.org/cips/cip30/">cip30</a> enabled wallets

## Quick Start

The best way to start with this template is using [Create Next App](https://nextjs.org/docs/api-reference/create-next-app).

```
yarn create next-app -e https://github.com/jpedroschmitz/typescript-nextjs-starter
# or
npx create-next-app -e https://github.com/jpedroschmitz/typescript-nextjs-starter
```

### Development

To start the project locally, run:

```bash
yarn dev
```

Open `http://localhost:3000` with your browser to see the result.

## Documentation

### Requirements

- Node.js >= 12.22.0
- Yarn 1 (Classic)

### Directory Structure

- [`.github`](.github) — GitHub configuration including the CI workflow.<br>
- [`.husky`](.husky) — Husky configuration and hooks.<br>
- [`public`](./public) — Static assets such as robots.txt, images, and favicon.<br>
- [`src`](./src) — Application source code, including pages, components, styles.

### Scripts

- `yarn dev` — Starts the application in development mode at `http://localhost:3000`.
- `yarn build` — Creates an optimized production build of your application.
- `yarn start` — Starts the application in production mode.
- `yarn type-check` — Validate code using TypeScript compiler.
- `yarn lint` — Runs ESLint for all files in the `src` directory.
- `yarn format` — Runs Prettier for all files in the `src` directory.
- `yarn commit` — Run commitizen. Alternative to `git commit`.

### Path Mapping

TypeScript are pre-configured with custom path mappings. To import components or files, use the `@` prefix.

```tsx
import { Button } from '@/components/Button';

// To import images or other files from the public folder
import avatar from '@/public/avatar.png';
```

### Switch to npm

By default, this starter uses Yarn 1 (Classic), but this choice is yours. If you'd like to switch to npm, delete the `yarn.lock` file, install the dependencies with `npm install`, and change the CI workflows, Husky Git hooks, and lint-staged steps to use npm commands.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for more information.
