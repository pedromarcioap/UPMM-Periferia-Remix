import { NextRequest, NextResponse } from "next/server";

// Pexels API integration - server-side proxy to hide API key
const PEXELS_API_KEY = process.env.PEXELS_API_KEY || "";

interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  photographer_id: number;
  avg_color: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
  liked: boolean;
  alt: string;
}

interface PexelsResponse {
  total_results: number;
  page: number;
  per_page: number;
  photos: PexelsPhoto[];
  next_page?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "urban";
    const page = searchParams.get("page") || "1";
    const perPage = searchParams.get("per_page") || "15";

    // If no API key, return curated sample results
    if (!PEXELS_API_KEY) {
      console.log("Pexels API key not found, using sample results");
      return NextResponse.json({
        photos: generateSampleResults(query),
        totalResults: 30,
        page: parseInt(page),
        perPage: parseInt(perPage),
        success: true,
      });
    }

    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`,
      {
        headers: {
          Authorization: PEXELS_API_KEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Pexels API error: ${response.status}`);
    }

    const data: PexelsResponse = await response.json();

    // Transform the response to match our Photo interface
    const photos = data.photos.map((photo) => ({
      id: `pexels-${photo.id}`,
      title: photo.alt || `Photo by ${photo.photographer}`,
      description: `Fonte: Pexels - Foto por ${photo.photographer}`,
      imageUrl: photo.src.large,
      thumbnailUrl: photo.src.medium,
      tags: "pexels,externa",
      vibeCount: 0,
      commentCount: 0,
      remixCount: 0,
      isGoldStandard: false,
      isSynced: false,
      communityGold: false,
      latitude: null,
      longitude: null,
      location: null,
      neighborhood: null,
      city: null,
      state: null,
      country: null,
      battleWins: 0,
      battleLosses: 0,
      createdAt: new Date().toISOString(),
      author: {
        id: "pexels",
        name: photo.photographer,
        username: photo.photographer,
        avatar: null,
        level: 1,
      },
      _count: {
        likes: 0,
        comments: 0,
        remixes: 0,
      },
      src: {
        original: photo.src.original,
        large: photo.src.large,
        medium: photo.src.medium,
        small: photo.src.small,
        portrait: photo.src.portrait,
      },
    }));

    return NextResponse.json({
      photos,
      totalResults: data.total_results,
      page: data.page,
      perPage: data.per_page,
      nextPage: data.next_page,
      success: true,
    });
  } catch (error) {
    console.error("Pexels API error:", error);
    
    // Return sample results on error
    return NextResponse.json({
      photos: generateSampleResults("urban"),
      totalResults: 30,
      page: 1,
      perPage: 15,
      success: true,
    });
  }
}

// Generate sample results when API key is not available
function generateSampleResults(query: string) {
  // Use Lorem Picsum for demo images (no API key needed)
  return Array.from({ length: 12 }, (_, i) => ({
    id: 1000000 + i,
    width: 1920,
    height: 1080,
    photographer: "Lorem Picsum",
    photographerUrl: "https://picsum.photos",
    avgColor: "#2D2A26",
    alt: `${query} photo ${i + 1}`,
    src: {
      original: `https://picsum.photos/seed/${query.replace(/\s/g, "")}${i}/1920/1080`,
      large: `https://picsum.photos/seed/${query.replace(/\s/g, "")}${i}/1280/720`,
      medium: `https://picsum.photos/seed/${query.replace(/\s/g, "")}${i}/640/480`,
      small: `https://picsum.photos/seed/${query.replace(/\s/g, "")}${i}/320/240`,
      portrait: `https://picsum.photos/seed/${query.replace(/\s/g, "")}${i}/480/640`,
    },
  }));
}
