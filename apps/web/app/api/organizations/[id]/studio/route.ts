import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { json } from "stream/consumers";
import * as z from "zod";

const ColorsSchema = z.object({
    primaryColor: z.string()
        .regex(/^#([0-9a-fA-F]{3}){1,2}$/, {
            message: "Invalid hex color format. Must be a 3 or 6 digit hex code starting with #",
        }).optional(),
    secondaryColor: z.string()
        .regex(/^#([0-9a-fA-F]{3}){1,2}$/, {
            message: "Invalid hex color format. Must be a 3 or 6 digit hex code starting with #",
        }).optional()
})

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const body = await req.json()
        const validatedData = ColorsSchema.safeParse(body)
        if (!validatedData.success) {
            return NextResponse.json(
                { error: validatedData.error },
                { status: 400 })
        }

        return NextResponse.json({ status: 200 })
    } catch (error) {
        return NextResponse.json(
            { error: 'Invalid body (not Json)' },
            { status: 400 }
        )
    }


}   

// descobrir como modificar a organization com o id passado para ter as cores do body
// se der certo, enviar um 200


