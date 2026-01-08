-- Enable pgvector extension
create extension if not exists vector;

-- Create table repo_embeddings
create table if not exists repo_embeddings (
  id uuid primary key default gen_random_uuid(),
  repo text,
  file_path text,
  content text,
  embedding vector(1536)
);

-- Create matching function for RAG
create or replace function match_repo_embeddings (
  query_embedding vector(1536),
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
