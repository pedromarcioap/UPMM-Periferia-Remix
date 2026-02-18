import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Autenticação necessária" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const fileName = formData.get("fileName") as string;

    if (!file) {
      return NextResponse.json(
        { error: "Nenhum arquivo enviado" },
        { status: 400 }
      );
    }

    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipo de arquivo não permitido. Apenas imagens JPEG, PNG, GIF e WebP são aceitas." },
        { status: 400 }
      );
    }

    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Arquivo muito grande. O tamanho máximo permitido é 10MB." },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: "Configuração do Supabase ausente. Verifique as variáveis de ambiente." },
        { status: 500 }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Generate unique filename
    const fileExtension = file.name.split(".").pop();
    if (!fileExtension) {
      return NextResponse.json(
        { error: "Arquivo inválido. Não foi possível determinar a extensão do arquivo." },
        { status: 400 }
      );
    }
    
    const uniqueFileName = `${fileName}-${Date.now()}.${fileExtension}`;
    const filePath = `photos/${uniqueFileName}`;

    // Upload file to Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from("photos")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      return NextResponse.json(
        { error: "Erro ao fazer upload do arquivo" },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from("photos")
      .getPublicUrl(filePath);

    if (!publicUrlData?.publicUrl) {
      console.error("Error generating public URL: No public URL returned");
      return NextResponse.json(
        { error: "Erro ao gerar URL pública do arquivo" },
        { status: 500 }
      );
    }

    const publicUrl = publicUrlData.publicUrl;

    // Generate thumbnail URL (assuming you have a function to create thumbnails)
    const thumbnailUrl = publicUrl; // For now, use the same URL

    return NextResponse.json({
      success: true,
      imageUrl: publicUrl,
      thumbnailUrl,
      filePath,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}