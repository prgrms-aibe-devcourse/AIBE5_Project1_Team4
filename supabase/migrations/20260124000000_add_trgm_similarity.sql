-- Enable pg_trgm extension for trigram similarity search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add GIN index for fast similarity search on ai_query_suggestions
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_query_trgm
ON ai_query_suggestions USING GIN (original_query gin_trgm_ops);

-- Function to find similar cached queries
CREATE OR REPLACE FUNCTION find_similar_query_suggestion(
  p_query text,
  p_similarity_threshold float DEFAULT 0.3,
  p_max_age_hours int DEFAULT 24
)
RETURNS TABLE (
  normalized_query text,
  suggestions jsonb,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    aqs.normalized_query,
    aqs.suggestions,
    similarity(aqs.original_query, p_query) as sim
  FROM ai_query_suggestions aqs
  WHERE
    aqs.created_at > now() - (p_max_age_hours || ' hours')::interval
    AND similarity(aqs.original_query, p_query) > p_similarity_threshold
  ORDER BY sim DESC
  LIMIT 1;
END;
$$;
