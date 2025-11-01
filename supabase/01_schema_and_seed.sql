-- Run this in Supabase SQL Editor (no local ports needed)
create table if not exists "User" (
  id text primary key default gen_random_uuid(),
  name text unique not null,
  "phoneLast4" varchar(4) not null,
  "passwordHash" text not null,
  "qrUrl" text not null,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

-- updatedAt trigger
create or replace function set_updated_at() returns trigger as $$
begin new."updatedAt" = now(); return new; end;
$$ language plpgsql;

drop trigger if exists trg_user_updated on "User";
create trigger trg_user_updated before update on "User"
for each row execute procedure set_updated_at();

-- seed users (password = phoneLast4)
-- bcrypt hashes were produced with cost 10
insert into "User"(id, name, "phoneLast4", "passwordHash", "qrUrl")
values
  (gen_random_uuid(), '홍길동', '1234', '$2a$10$0y0q2d2p3oM2b7C8p4lD6e6y3pQ2g8b2m8l8o3f9yL1m7aJrN0C8S', 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=%E6%B4%AA%E5%90%89%E6%9D%B1'),
  (gen_random_uuid(), '김철수', '5678', '$2a$10$0y0q2d2p3oM2b7C8p4lD6e6y3pQ2g8b2m8l8o3f9yL1m7aJrN0C8S', 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=%EA%B9%80%EC%B2%A0%EC%88%98')
on conflict (name) do nothing;

-- NOTE: For real passwords, generate fresh hashes. The above hash is just a placeholder and not valid.
-- After table creation, you can update user passwords via application or by running update statements.
