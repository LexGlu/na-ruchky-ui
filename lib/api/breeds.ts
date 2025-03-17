import { NextRequest, NextResponse } from "next/server";
import { getBreeds } from "@/lib/services/breeds-service";

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const speciesParam = searchParams.get("species") || undefined;
    const species =
      speciesParam === "dog" || speciesParam === "cat"
        ? speciesParam
        : undefined;
    const search = searchParams.get("search") || undefined;
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!)
      : undefined;

    // Call the service function
    const data = await getBreeds({
      species,
      search,
      limit,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in breeds API route:", error);
    return NextResponse.json(
      { error: "Failed to fetch breeds" },
      { status: 500 }
    );
  }
}
