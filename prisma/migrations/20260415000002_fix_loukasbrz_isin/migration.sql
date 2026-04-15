-- Fix loukasbrz emerging market ISIN: FR006174348 → FR0006174348 (missing leading zero)
-- Also clear stale ticker so Yahoo Finance re-discovers the correct one

UPDATE "InvestETF"
SET isin   = 'FR0006174348',
    ticker = ''
WHERE "userId" = 'loukasbrz'
  AND isin IN ('FR006174348', 'FR0006174348');
