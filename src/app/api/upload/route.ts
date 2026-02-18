import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// POST - Upload image to storage
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = formData.get("folder") as string || "photos";

    if (!file) {
      return NextResponse.json({ error: "Arquivo não encontrado" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Tipo de arquivo inválido" }, { status: 400 });
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Arquivo muito grande (máx 10MB)" }, { status: 400 });
    }

    // Convert file to base64 for storage
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const ext = file.name.split(".").pop() || "jpg";
    const filename = `${folder}/${timestamp}-${randomStr}.${ext}`;

    // For Supabase Storage (if configured)
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      try {
        // Upload to Supabase Storage
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        const { data, error } = await supabase.storage
          .from("images")
          .upload(filename, buffer, {
            contentType: file.type,
            upsert: true,
          });

        if (error) {
          console.error("Supabase upload error:", error);
          // Fallback to base64
          return NextResponse.json({ 
            url: dataUrl,
            isBase64: true,
            message: "Usando armazenamento local (erro no Supabase)",
          });
        }

        const { data: urlData } = supabase.storage
          .from("images")
          .getPublicUrl(filename);

        return NextResponse.json({ 
          url: urlData.publicUrl,
          isBase64: false,
        });
      } catch (supabaseError) {
        console.error("Supabase client error:", supabaseError);
        // Fallback to base64
      }
    }

    // Fallback: return base64 data URL
    return NextResponse.json({ 
      url: dataUrl,
      isBase64: true,
      message: "Armazenamento em base64 (configure Supabase para URLs públicas)",
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ 
      error: "Erro no upload",
      details: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}
