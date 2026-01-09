-- Update the table to use 768 dimensions
ALTER TABLE repo_embeddings ALTER COLUMN embedding TYPE vector(768);

-- Update the function to accept 768 dimensions
create or replace function match_repo_embeddings (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
stable
as $$
begin
  return query
  select
    repo_embeddings.id,
    repo_embeddings.content,
    jsonb_build_object('repository', repo_embeddings.repo, 'source', repo_embeddings.file_path) as metadata,
    1 - (repo_embeddings.embedding <=> query_embedding) as similarity
  from repo_embeddings
  where 1 - (repo_embeddings.embedding <=> query_embedding) > match_threshold
  order by similarity desc
  limit match_count;
end;
$$;
