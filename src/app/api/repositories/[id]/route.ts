import {NextRequest, NextResponse} from "next/server";
import {PrismaClient} from "@prisma/client";


export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const db = new PrismaClient();
        await db.$transaction([
            db.document.deleteMany({
                where: {
                    namespace: params.id,
                },
            }),
            db.storeSettings.updateMany({
                where: {
                    selectedRepoId: params.id,
                },
                data: {
                    selectedRepoId: null,
                },
            }),
            db.repository.delete({
                where: {
                    id: params.id,
                },
            }),
        ]);

        return NextResponse.json({success: true});
    } catch (e: unknown) {
        const error = e as { message: string; status?: number };
        console.error(error.message);
        return NextResponse.json({error: error.message}, {status: error.status ?? 500});
    }
}