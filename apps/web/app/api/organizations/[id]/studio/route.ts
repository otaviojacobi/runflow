import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { getSignedLogoUrl } from "@/lib/blob";
import { NextRequest, NextResponse } from "next/server";
import * as z from "zod";

const ColorsSchema = z.strictObject({
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
        const id = (await params).id
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const membership = await prisma.organizationMember.findFirst({
            where: {
                organizationId: id,
                userId: user.id,
                role: 'OWNER'
            }
        })

        if (!membership) {
            return NextResponse.json(
                { error: 'Only organization owners can use the studio' },
                { status: 403 }
            )
        }

        const body = await req.json()

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

        return NextResponse.json({
            organization: {
                ...updatedOrganization,
                logo: getSignedLogoUrl(updatedOrganization.logo),
            }
        }, { status: 200 })
    } catch (error) {
        if(error instanceof z.ZodError){
            return NextResponse.json(
                { error: 'Invalid body'},
                { status: 400}
            )
        }
        return NextResponse.json(
            { error: 'Invalid body (not Json)' },
            { status: 400 }
        )
    }

}
