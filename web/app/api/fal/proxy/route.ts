import { route } from '@fal-ai/server-proxy/nextjs';
import { loadRepoSecretsEnv } from '@/app/api/_lib/repo-secrets';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

loadRepoSecretsEnv();

export const { GET, POST } = route;

