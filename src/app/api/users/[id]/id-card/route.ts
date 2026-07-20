import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users, students, userProfiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateLibraryIDCardPDF } from "@/lib/generateLibraryIDCard";
import { getSystemSettings } from "@/actions/settings";
import { getSession } from "@/actions/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const requestedUserId = params.id;

    // Permissions: Student can only access their own. Admin/Librarian can access any.
    if (session.role === "student" && session.userId !== requestedUserId) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Fetch user details
    const userRecords = await db
      .select({
        user: users,
        student: students,
        profile: userProfiles,
      })
      .from(users)
      .leftJoin(students, eq(users.id, students.userId))
      .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
      .where(eq(users.id, requestedUserId));

    if (userRecords.length === 0) {
      return new NextResponse("User not found", { status: 404 });
    }

    const { user, student, profile } = userRecords[0];

    // Get global settings for Theme and Layout
    const settings = await getSystemSettings();

    // Prepare dates
    const issueDateStr = student?.enrollmentDate
      ? new Date(student.enrollmentDate).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : new Date(user.createdAt).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        });

    const expiryDateStr = student?.graduationDate
      ? new Date(student.graduationDate).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : undefined;

    // Handle profile image if stored as URL or binary. For this example, 
    // assuming no direct byte storage, we will fallback to standard generation.
    // If the avatarUrl is a full URL, we would normally fetch it to get ArrayBuffer.
    let photoBytes: ArrayBuffer | undefined;
    let photoType: "jpg" | "png" | undefined;

    if (profile?.avatarUrl) {
      try {
        const res = await fetch(profile.avatarUrl);
        if (res.ok) {
          photoBytes = await res.arrayBuffer();
          photoType = profile.avatarUrl.toLowerCase().endsWith(".png") ? "png" : "jpg";
        }
      } catch (e) {
        console.error("Failed to fetch avatar for ID card:", e);
      }
    }

    const pdfBytes = await generateLibraryIDCardPDF(
      {
        libraryName: settings.libraryName,
        memberName: `${user.firstName} ${user.lastName}`,
        memberId: user.id,
        department: student?.department || user.role,
        issueDate: issueDateStr.replace(/ /g, "-"),
        expiryDate: expiryDateStr?.replace(/ /g, "-"),
        photoBytes,
        photoType,
        verificationBaseUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/verify`,
        verificationSecret: process.env.CARD_SIGNING_SECRET || "default-secret",
      },
      {
        theme: settings.idCardTheme as any,
        layout: settings.idCardLayout as any,
      }
    );

    return new NextResponse(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Library-ID-${user.id}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Failed to generate ID card:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
