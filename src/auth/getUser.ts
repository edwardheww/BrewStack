import { type Request } from "express";
import { supabaseAuth } from "./supabase.js";

export async function getUserFromRequest(req: Request) { // Reads an incoming request and verifies it with Supabase.
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) { // If there is no Bearer token, the request is not logged in.
        return null;
    }

    const token = authHeader.replace("Bearer ", "");
    const { data, error } = await supabaseAuth.auth.getUser(token); // Ask Supabase Auth whether this token belongs to a real logged-in user.

    if (error || !data.user) {
        return null;
    }

    return data.user;
}