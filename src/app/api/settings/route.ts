import {NextRequest, NextResponse} from "next/server";
import {PrismaClient} from "@prisma/client";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const {
            openAiKey,
            githubAccessToken,
        } = body as {
            openAiKey: string;
            githubAccessToken: string;
        };

            if (!githubAccessToken) {
                throw new Error("GitHub key is required");
        }

        const db = new PrismaClient();
        await db.storeSettings.upsert({
            where: {id: 1},
            update: {
                openAiKey,
                githubAccessToken,
            },
            create: {
                    openAiKey: openAiKey ?? "",
                githubAccessToken
            }
        });

        return NextResponse.json({success: true});

    } catch (e: unknown) {
        const error = e as { message: string; status?: number };
        return NextResponse.json({error: error.message}, {status: error.status ?? 500});
    }
}