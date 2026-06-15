CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"from_user" "owner" NOT NULL,
	"to_user" "owner" NOT NULL,
	"project_id" integer,
	"text" text NOT NULL,
	"read_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;