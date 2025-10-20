-- Allow anonymous read/update for audits with user_id IS NULL
DROP POLICY IF EXISTS "Public can view anonymous audits" ON public.audits;
CREATE POLICY "Public can view anonymous audits"
ON public.audits
FOR SELECT
USING (user_id IS NULL);

DROP POLICY IF EXISTS "Public can update anonymous audits" ON public.audits;
CREATE POLICY "Public can update anonymous audits"
ON public.audits
FOR UPDATE
USING (user_id IS NULL);

-- Allow viewing category results tied to anonymous audits
DROP POLICY IF EXISTS "Public can view category results for anonymous audits" ON public.category_results;
CREATE POLICY "Public can view category results for anonymous audits"
ON public.category_results
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.audits a
    WHERE a.id = category_results.audit_id
      AND a.user_id IS NULL
  )
);
