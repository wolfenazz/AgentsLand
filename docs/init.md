# Initialize Workspace — Project Templates

A reference of CLI commands to scaffold new projects across frameworks, languages, and platforms.

---

## React

```bash
npx create-react-app my-app                          # CRA (legacy)
npx create-react-app my-app --template typescript     # CRA + TypeScript
npm create vite@latest my-app -- --template react     # Vite + React
npm create vite@latest my-app -- --template react-ts  # Vite + React + TypeScript
```

## Next.js

```bash
npx create-next-app@latest my-app                     # Next.js (interactive)
npx create-next-app@latest my-app --typescript        # Next.js + TypeScript
npx create-next-app@latest my-app --ts --tailwind --eslint --app --src-dir --import-alias "@/*"
```

## Remix

```bash
npx create-remix@latest my-app                        # Remix (interactive)
npx create-remix@latest my-app --template remix-run/grunge-stack   # Remix + AWS
```

## Gatsby

```bash
npx gatsby new my-app                                 # Gatsby static site
npx gatsby new my-app https://github.com/gatsbyjs/gatsby-starter-blog
```

## Angular

```bash
npx @angular/cli new my-app                           # Angular
npx @angular/cli new my-app --style=scss --routing    # Angular + SCSS + Routing
npx @angular/cli new my-app --standalone              # Angular standalone components
```

## Vue

```bash
npm create vue@latest my-app                          # Vue 3 (interactive)
npm create vite@latest my-app -- --template vue       # Vite + Vue
npm create vite@latest my-app -- --template vue-ts    # Vite + Vue + TypeScript
```

## Nuxt

```bash
npx nuxi@latest init my-app                           # Nuxt 3
npx nuxi@latest init my-app --template v3-compat      # Nuxt 3 + compatibility
```

## Svelte / SvelteKit

```bash
npx sv create my-app                                  # SvelteKit (new)
npm create vite@latest my-app -- --template svelte    # Vite + Svelte
npm create vite@latest my-app -- --template svelte-ts # Vite + Svelte + TypeScript
```

## Solid

```bash
npx degit solidjs/templates/ts my-app                 # SolidStart + TypeScript
npx degit solidjs/templates/js my-app                 # SolidStart + JavaScript
npm create vite@latest my-app -- --template solid-ts  # Vite + Solid + TypeScript
```

## Qwik

```bash
npm create qwik@latest my-app                         # Qwik City (interactive)
```

## Astro

```bash
npm create astro@latest my-app                        # Astro (interactive)
npm create astro@latest my-app --template basics      # Astro basics
npm create astro@latest my-app --template blog        # Astro blog
```

## React Native

```bash
npx react-native@latest init my-app                   # React Native CLI
npx react-native@latest init my-app --template skip-typescript-check
npx @react-native-community/cli init my-app           # RN Community CLI
```

## Expo

```bash
npx create-expo-app@latest my-app                     # Expo (default)
npx create-expo-app@latest my-app --template blank    # Expo blank
npx create-expo-app@latest my-app --template tabs     # Expo with tabs
npx create-expo-app@latest my-app --template blank-typescript  # Expo + TypeScript
npx create-expo-app@latest my-app -t expo-template-blank-sdk50  # Specific SDK
```

## Flutter

```bash
flutter create my_app                                 # Flutter (default)
flutter create --org com.example my_app               # Flutter + org
flutter create --platforms android,ios,web my_app     # Flutter specific platforms
flutter create -t app --platforms android,ios my_app  # Flutter app template
flutter create -t plugin my_plugin                    # Flutter plugin
flutter create -t package my_package                  # Flutter package
```

## Ionic / Capacitor

```bash
npm init @ionic/cli my-app                            # Ionic (interactive)
npm init @ionic/cli my-app --type react               # Ionic + React
npm init @ionic/cli my-app --type vue                 # Ionic + Vue
npm init @ionic/cli my-app --type angular             # Ionic + Angular
npx cap init MyApp com.example.myapp                  # Capacitor init
```

## Electron

```bash
npm init electron-app@latest my-app                   # Electron Forge
npx @electron-forge/cli init my-app                   # Electron Forge (manual)
npx create-electron-app my-app                        # Electron Quick Start
```

## Tauri

```bash
npm create tauri-app@latest my-app                    # Tauri 2 (interactive)
npm create tauri-app@latest -- --template react       # Tauri + React
npm create tauri-app@latest -- --template vue         # Tauri + Vue
npm create tauri-app@latest -- --template svelte      # Tauri + Svelte
npm create tauri-app@latest -- --template vanilla     # Tauri + Vanilla
cargo create-tauri-app my-app                         # Tauri via Cargo
```

## Node.js / Backend

```bash
npm init -y                                           # Basic package.json
npx fastify generate my-app                           # Fastify project
npx @nestjs/cli new my-app                            # NestJS
npx @hono/node-server init my-app                     # Hono + Node
npx @remix-run/cloudflare create my-app               # Remix + Cloudflare
```

## Express

```bash
npx express-generator my-app                          # Express (JavaScript)
npx express-generator my-app --view=ejs               # Express + EJS
npx express-generator --css=tailwindcss my-app         # Express + Tailwind
```

## Fastify

```bash
npm init fastify my-app                               # Fastify (interactive)
npx fastify-cli generate my-app                       # Fastify CLI generate
```

## NestJS

```bash
npx @nestjs/cli new my-app                            # NestJS (interactive)
npx @nestjs/cli new my-app -p npm                     # NestJS + npm
npx @nestjs/cli new my-app --skip-git                 # NestJS skip git
```

## tRPC

```bash
npx create-trpc-app@latest                            # tRPC (interactive)
npx create-trpc-appx@latest my-app                    # tRPC Next.js starter
```

## Hono

```bash
npx create-hono my-app                                # Hono (interactive — pick runtime)
npx create-hono my-app --template cloudflare-workers  # Hono + Cloudflare Workers
npx create-hono my-app --template bun                 # Hono + Bun
npx create-hono my-app --template deno                # Hono + Deno
npx create-hono my-app --template vercel              # Hono + Vercel
npx create-hono my-app --template aws-lambda          # Hono + AWS Lambda
```

## Django

```bash
pip install django && django-admin startproject mysite # Django project
django-admin startapp myapp                            # Django app
pip install cookiecutter && cookiecutter https://github.com/cookiecutter/cookiecutter-django  # Django full stack
```

## FastAPI

```bash
pip install fastapi uvicorn                            # Install FastAPI
# No official scaffolding tool — use:
npx @fastapi/cli new my-app                            # FastAPI CLI (if available)
# Manual:
mkdir my-app && cd my-app && python -m venv venv
```

## Flask

```bash
pip install flask                                      # Install Flask
# No official scaffolding — use cookiecutter:
pip install cookiecutter && cookiecutter https://github.com/sloria/cookiecutter-flask
```

## Python (General)

```bash
pip install poetry && poetry new my-project            # Poetry project
pip install hatch && hatch new my-project              # Hatch project
python -m venv venv                                    # Virtual environment
conda create -n myenv python=3.12                      # Conda environment
```

## Rust

```bash
cargo init my-app                                     # Rust binary project
cargo init --lib my-lib                               # Rust library
cargo new my-app                                      # Rust new project (outside dir)
```

## Tauri (Rust + Web)

```bash
npm create tauri-app@latest my-app -- --template react-ts   # Tauri 2 + React + TS
cargo install tauri-cli && tauri init                        # Tauri init in existing project
```

## Go

```bash
go mod init github.com/user/my-app                    # Go module
go install github.com/golang-standards/project-layout@latest  # Project layout helper
```

## Gin (Go)

```bash
go mod init my-app && go get -u github.com/gin-gonic/gin  # Gin framework
```

## .NET

```bash
dotnet new console -n MyApp                           # .NET Console
dotnet new webapi -n MyApp                            # .NET Web API
dotnet new mvc -n MyApp                               # .NET MVC
dotnet new blazor -n MyApp                            # .NET Blazor
dotnet new react -n MyApp                             # .NET + React
dotnet new angular -n MyApp                           # .NET + Angular
dotnet new vue -n MyApp                               # .NET + Vue
```

## Swift / iOS

```bash
swift package init --type executable                  # Swift package
# Xcode: File > New > Project > iOS App              # iOS app (Xcode GUI)
```

## Kotlin / Android

```bash
# Android Studio: New Project > Empty Activity        # Android app (Studio GUI)
# KMP:
kotlin native                                         # Kotlin/Native
```

## Ktor (Kotlin)

```bash
# https://start.ktor.io                                # Ktor project generator (web)
mvn archetype:generate -DarchetypeGroupId=io.ktor -DarchetypeArtifactId=ktor-archetype  # Maven
```

## Ruby on Rails

```bash
gem install rails && rails new my-app                 # Rails project
rails new my-app -j esbuild -c tailwind               # Rails + esbuild + Tailwind
rails new my-app -d postgresql                        # Rails + PostgreSQL
rails new my-app --api                                # Rails API-only
```

## Laravel (PHP)

```bash
composer create-project laravel/laravel my-app        # Laravel
laravel new my-app                                    # Laravel (via installer)
laravel new my-app --jet                              # Laravel + Jetstream
laravel new my-app --breeze                           # Laravel + Breeze
```

## Symfony (PHP)

```bash
composer create-project symfony/skeleton my-app       # Symfony minimal
composer create-project symfony/website-skeleton my-app  # Symfony full
symfony new my-app                                    # Symfony CLI
```

## Spring Boot (Java)

```bash
# https://start.spring.io/                             # Spring Initializr (web)
curl https://start.spring.io/starter.zip -d dependencies=web -d type=maven-project -o my-app.zip
mvn archetype:generate -DgroupId=com.example -DartifactId=my-app -DarchetypeArtifactId=maven-archetype-quickstart
```

## Vite (Universal)

```bash
npm create vite@latest my-app -- --template react         # React
npm create vite@latest my-app -- --template react-ts      # React + TypeScript
npm create vite@latest my-app -- --template vue            # Vue
npm create vite@latest my-app -- --template vue-ts         # Vue + TypeScript
npm create vite@latest my-app -- --template svelte         # Svelte
npm create vite@latest my-app -- --template svelte-ts      # Svelte + TypeScript
npm create vite@latest my-app -- --template solid-ts       # Solid + TypeScript
npm create vite@latest my-app -- --template preact         # Preact
npm create vite@latest my-app -- --template preact-ts      # Preact + TypeScript
npm create vite@latest my-app -- --template lit            # Lit
npm create vite@latest my-app -- --template lit-ts         # Lit + TypeScript
npm create vite@latest my-app -- --template vanilla        # Vanilla JS
npm create vite@latest my-app -- --template vanilla-ts     # Vanilla TypeScript
```

## Full-Stack Starters

```bash
npx create-t3-app@latest my-app                       # T3 Stack (Next + tRPC + Prisma + Tailwind)
npx create-next-app@latest my-app --example with-supabase  # Next.js + Supabase
npx create-next-app@latest my-app --example with-prisma    # Next.js + Prisma
npx create-next-app@latest my-app --example with-mongodb   # Next.js + MongoDB
npx create-wasm-app my-app                            # Rust + WebAssembly + Webpack
```

## Static Site Generators

```bash
npx @11ty/eleventy --init                             # Eleventy
npm create hono@latest my-app --template pages            # Hono Pages
npx @cloudflare/next-on-pages                          # Next.js → Cloudflare Pages
```

## Monorepo

```bash
npx create-nx-workspace@latest my-app                 # Nx monorepo
npx turbo@latest create-turbo my-app                   # Turborepo
npx @pnpm/create                                      # pnpm workspace
```

## Package Managers (Init)

```bash
npm init -y                                           # npm
yarn init -y                                          # Yarn
pnpm init                                             # pnpm
bun init                                              # Bun
deno init my-app                                      # Deno
```

## Database / ORM

```bash
npx prisma init                                       # Prisma init
npx prisma init --datasource-provider sqlite           # Prisma + SQLite
npx prisma init --datasource-provider postgresql       # Prisma + PostgreSQL
npx supabase init                                     # Supabase local
npx @drizzle-labs/cli init                            # Drizzle ORM
```

## Testing

```bash
npm init @vitest@latest                                # Vitest
npx playwright install                                 # Playwright
npx @cypress/create-cypress@latest                     # Cypress
```

## CSS / UI

```bash
npx tailwindcss init -p                                # Tailwind CSS config
npx sb@latest init                                     # Storybook
```

## Docker

```bash
docker init                                            # Docker init (interactive)
docker compose init                                    # Docker Compose init
```

## GitHub / CI

```bash
gh repo create my-app --public --clone                # GitHub repo
gh repo create --template owner/template-repo         # From template
```

---

## Categories Reference

| Category | Templates |
|----------|-----------|
| **Frontend Frameworks** | React, Vue, Angular, Svelte, Solid, Qwik, Astro, Solid |
| **Full-Stack Frameworks** | Next.js, Nuxt, Remix, Gatsby, SvelteKit, Astro |
| **Mobile** | React Native, Expo, Flutter, Ionic, Capacitor |
| **Desktop** | Electron, Tauri |
| **Backend (JS/TS)** | Express, Fastify, NestJS, Hono, tRPC |
| **Backend (Python)** | Django, FastAPI, Flask |
| **Backend (Go)** | Gin, net/http |
| **Backend (Rust)** | Actix, Axum |
| **Backend (Java)** | Spring Boot |
| **Backend (Ruby)** | Rails |
| **Backend (PHP)** | Laravel, Symfony |
| **Backend (C#)** | .NET Web API, .NET MVC |
| **Build Tools** | Vite, Webpack, esbuild, Turbopack |
| **Monorepo** | Nx, Turborepo, pnpm workspaces |
| **Static Site** | Astro, Eleventy, Gatsby |
| **Database** | Prisma, Supabase, Drizzle |
