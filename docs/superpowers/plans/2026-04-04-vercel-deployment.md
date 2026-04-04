# Vercel Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Link the current Next.js project to Vercel and deploy it to production with Supabase environment variables.

**Architecture:** Use Vercel CLI for interactive project linking, environment variable configuration, and production deployment.

**Tech Stack:** Next.js, Vercel CLI, Supabase.

---

### Task 1: Project Linking and Initialization

**Files:**
- Modify: `.gitignore` (ensure `.vercel` is ignored)

- [ ] **Step 1: Check if .vercel is in .gitignore**

Run: `grep -q ".vercel" .gitignore || echo ".vercel" >> .gitignore`
Expected: `.vercel` is present in `.gitignore`.

- [ ] **Step 2: Initialize Vercel project**

Run: `npx vercel`
Expected: Follow interactive prompts to log in (if needed), set project name, and confirm Next.js settings. Note the project URL.

- [ ] **Step 3: Verify .vercel/project.json existence**

Run: `ls -a .vercel/project.json`
Expected: File exists, confirming the project is linked.

- [ ] **Step 4: Commit .gitignore changes**

```bash
git add .gitignore
git commit -m "chore: ensure .vercel is ignored"
```

### Task 2: Environment Variable Configuration

**Files:**
- No local files modified (remote configuration)

- [ ] **Step 1: Get Supabase credentials**

**Action:** User needs to provide `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

- [ ] **Step 2: Add Supabase URL to Vercel**

Run: `npx vercel env add NEXT_PUBLIC_SUPABASE_URL <value>`
Expected: Success message from Vercel CLI.

- [ ] **Step 3: Add Supabase Anon Key to Vercel**

Run: `npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY <value>`
Expected: Success message from Vercel CLI.

- [ ] **Step 4: List environment variables to verify**

Run: `npx vercel env ls`
Expected: Both variables appear in the list for the production environment.

### Task 3: Production Deployment

**Files:**
- No local files modified

- [ ] **Step 1: Trigger production deployment**

Run: `npx vercel --prod`
Expected: Full build process completes successfully. Vercel provides a production URL.

- [ ] **Step 2: Verify deployment status**

Run: `npx vercel inspect <deployment-url>`
Expected: Status is "READY".

### Task 4: Final Validation

**Files:**
- No local files modified

- [ ] **Step 1: Open production URL in browser**

**Action:** Navigate to the provided production URL.
Expected: Page loads without errors.

- [ ] **Step 2: Check data fetching**

**Action:** Verify that data (e.g., product series) is correctly fetched from Supabase.
Expected: Content is displayed on the page.

- [ ] **Step 3: Test Server Actions**

**Action:** Try publishing a series if logged in.
Expected: Operation succeeds and UI updates.
