# 🔖 Smart Bookmark App

A real-time, secure bookmark manager built with **Next.js (App Router)** and **Supabase**.

Users can sign in using Google OAuth, add private bookmarks, and see updates instantly across multiple tabs without refreshing the page.

---

## 🚀 Live Demo

🔗 https://smart-bookmark-app-ten-nu.vercel.app/

---

## 🛠 Tech Stack

- **Frontend:** Next.js 16 (App Router)
- **Authentication:** Supabase Auth (Google OAuth only)
- **Database:** Supabase PostgreSQL
- **Realtime:** Supabase Realtime (Postgres changes)
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Deployment:** Vercel

---

## ✨ Features

### 🔐 Google Authentication

- Users sign in using Google OAuth
- No email/password login
- Secure session handling

### 📌 Private Bookmarks

- Each bookmark belongs to a specific user
- Row Level Security (RLS) ensures:
  - User A cannot see User B’s bookmarks
  - All queries are protected at database level

### ⚡ Real-Time Updates

- Uses Supabase `postgres_changes` subscription
- If two tabs are open:
  - Adding a bookmark in Tab A appears instantly in Tab B
  - Deleting a bookmark in Tab B disappears instantly in Tab A
- No page refresh required

### ➕ Add Bookmark

- Title + URL required
- Instant UI update (optimistic update)

### ❌ Delete Bookmark

- Users can delete only their own bookmarks
- Instant UI update

### 🎨 Modern UI

- Responsive grid layout
- Dark theme
- Smooth transitions

---

## 🧱 Database Structure

Table: `bookmarks`

| Column     | Type      | Description           |
| ---------- | --------- | --------------------- |
| id         | uuid      | Primary key           |
| user_id    | uuid      | References auth.users |
| title      | text      | Bookmark title        |
| url        | text      | Bookmark URL          |
| created_at | timestamp | Creation time         |

---

## 🔐 Row Level Security (RLS)

Enabled on `bookmarks` table.

Policies:

- SELECT → `auth.uid() = user_id`
- INSERT → `auth.uid() = user_id`
- DELETE → `auth.uid() = user_id`

This guarantees full user isolation at database level.

---

## ⚙️ How Realtime Works

The dashboard subscribes to:

```ts
supabase.channel('bookmarks')
.on('postgres_changes', ...)
```
