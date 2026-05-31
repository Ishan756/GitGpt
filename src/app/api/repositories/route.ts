import {NextRequest, NextResponse} from "next/server";
import {PrismaClient} from "@prisma/client";

export async function POST(req: NextRequest) {
    const db = new PrismaClient();

    try {
        const body = await req.json();

        const {
            url,
            branch,
        } = body as {
            url: string;
            branch?: string;
        };

        if (!url) {
            throw new Error("URL is required");
        }

        // Get a name from the Github URL
        const name = url.split('/').slice(-2).join('/');

        const repository = await db.repository.create({
            data: {
                name,
                url,
                status: "LOADING",
            },
        })

        // Lazy-load the Indexer to avoid importing heavy modules at build-time
        // (this prevents Next.js from failing to collect page data during build).
        const IndexerModule = await import('@/services/indexer');
        const indexer = new IndexerModule.Indexer();

        // Run indexing in background (don't await) so the request returns quickly.
        indexer.run(repository.id, branch).catch(err => console.error('Indexer error:', err));

        return NextResponse.json({
            success: true, repository: {
                name,
                url,
                status: "LOADING",
            }
        });

    } catch (e: unknown) {
        const error = e as { message: string; status?: number };
        console.error(error.message);
        return NextResponse.json({error: error.message}, {status: error.status ?? 500});
    }
}

export async function GET() {
    try {
        const db = new PrismaClient();
        const repositories = await db.repository.findMany();

        return NextResponse.json({repositories});
    } catch (e: unknown) {
        const error = e as { message: string; status?: number };
        console.error(error.message);
        return NextResponse.json({error: error.message}, {status: error.status ?? 500});
    }
}