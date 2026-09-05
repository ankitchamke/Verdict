CREATE TABLE "shared_verdicts" (
	"id" text PRIMARY KEY NOT NULL,
	"idea" text NOT NULL,
	"score" real NOT NULL,
	"score_reason" text NOT NULL,
	"target_user" text NOT NULL,
	"biggest_risk" text NOT NULL,
	"competitors" jsonb NOT NULL,
	"ten_x_suggestion" text NOT NULL,
	"roast_mode" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
