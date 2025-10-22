import { NextRequest, NextResponse } from "next/server";
import { sign } from "jsonwebtoken";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { message: "Username and password are required" },
        { status: 400 }
      );
    }

    // For development/demo, allow default admin credentials
    if (username === "admin" && password === "admin123") {
      const token = sign(
        { username: "admin", role: "admin" },
        process.env.JWT_SECRET || "default-secret-key",
        { expiresIn: "1h" }
      );

      return NextResponse.json({
        message: "Login successful",
        token,
        user: { username: "admin", role: "admin" }
      });
    }

    // Invalid credentials
    return NextResponse.json(
      { message: "Invalid credentials" },
      { status: 401 }
    );

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}