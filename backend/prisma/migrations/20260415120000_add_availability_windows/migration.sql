CREATE TABLE "availability_windows" (
    "id" TEXT NOT NULL,
    "availability_id" TEXT NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "availability_windows_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "availability_windows_availability_id_idx" ON "availability_windows"("availability_id");

ALTER TABLE "availability_windows"
ADD CONSTRAINT "availability_windows_availability_id_fkey"
FOREIGN KEY ("availability_id") REFERENCES "availability"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
