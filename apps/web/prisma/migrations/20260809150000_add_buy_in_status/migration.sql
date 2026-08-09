-- Track buy-in collection for both returning teams and waitlist registrations.
ALTER TABLE "ReturnConfirmation"
ADD COLUMN IF NOT EXISTS "buyInStatus" TEXT NOT NULL DEFAULT 'UNPAID'
CHECK ("buyInStatus" IN ('UNPAID', 'PAID', 'PARTIAL', 'EXEMPT'));

ALTER TABLE "WaitlistEntry"
ADD COLUMN IF NOT EXISTS "buyInStatus" TEXT NOT NULL DEFAULT 'UNPAID'
CHECK ("buyInStatus" IN ('UNPAID', 'PAID', 'PARTIAL', 'EXEMPT'));

-- Name-only admin registrations use the existing placeholder-email convention.
INSERT INTO "WaitlistEntry" ("id", "email", "name", "notes", "buyInStatus", "createdAt")
VALUES
    ('admin_waitlist_lineeth_friend_20260809', 'lineeth.friend@gauntlet.invalid', 'Lineeth + friend', 'Added by admin request on 2026-08-09.', 'UNPAID', CURRENT_TIMESTAMP),
    ('admin_waitlist_sahil_modi_20260809', 'sahil.modi@gauntlet.invalid', 'Sahil Modi', 'Added by admin request on 2026-08-09.', 'PAID', CURRENT_TIMESTAMP + INTERVAL '1 millisecond')
ON CONFLICT ("email") DO UPDATE
SET "name" = EXCLUDED."name",
    "buyInStatus" = EXCLUDED."buyInStatus";

UPDATE "WaitlistEntry"
SET "buyInStatus" = CASE
    WHEN LOWER("name") IN ('brenden clerget', 'sean chokshi', 'ashwin dandapani', 'sahil modi') THEN 'PAID'
    WHEN LOWER("name") = 'dhruv modi' THEN 'PARTIAL'
    ELSE "buyInStatus"
END
WHERE LOWER("name") IN (
    'brenden clerget',
    'sean chokshi',
    'ashwin dandapani',
    'sahil modi',
    'dhruv modi'
);

UPDATE "ReturnConfirmation"
SET "buyInStatus" = CASE
    WHEN "email" = 'dmethi@gmail.com' THEN 'EXEMPT'
    ELSE 'PAID'
END
WHERE "id" IN (
    'cmpqcv9br0000bbogze2fo1t0',
    'cmrkv7lfw0002u97a18610tu0',
    'cmrkwmeao0004u97a1ssppoxp',
    'cmpq853fd00008zbh4n6vutb9'
);
