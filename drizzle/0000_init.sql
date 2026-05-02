CREATE TABLE IF NOT EXISTS "guestbook" (
  "id" serial PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "message" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
