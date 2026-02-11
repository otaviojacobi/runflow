import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
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
        const id = (await params).id
        const validatedData = ColorsSchema.safeParse(body)
        if (!validatedData.success) {
            return NextResponse.json(
                { error: validatedData.error },
                { status: 400 })
        }
        
        const updatedOrganization = await prisma.organization.update({
            where: {
                id: id,
            },
            data: {
                primaryColor: validatedData.data.primaryColor,
                secondaryColor: validatedData.data.secondaryColor
            }
        })

        return NextResponse.json({ organization: updatedOrganization }, { status: 200 })
    } catch (error) {
        return NextResponse.json(
            { error: 'Invalid body (not Json)' },
            { status: 400 }
        )
    }


}
