// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { auth } from '@/auth';

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    // Vérification de l'authentification admin
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé - Admin requis' },
        { status: 401 }
      );
    }

    // Récupération du fichier
    const formData = await request.formData();
    const file = formData.get('image') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      );
    }

    // Validation du type de fichier
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Type de fichier non supporté. Utilisez JPG, PNG ou WebP.' },
        { status: 400 }
      );
    }

    // Validation de la taille (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Fichier trop volumineux. Maximum 5MB.' },
        { status: 400 }
      );
    }

    // Conversion en buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Génération d'un nom unique
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileName = `moses-cafe-${timestamp}-${randomString}`;

    console.log('🔄 Upload vers Cloudinary...', {
      fileName,
      fileSize: file.size,
      fileType: file.type
    });

    // Upload vers Cloudinary avec optimisations
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'moses-cafe/products', // Dossier organisé
          public_id: fileName,
          resource_type: 'image',
          format: 'webp', // Conversion automatique en WebP
          quality: 'auto:good', // Optimisation qualité automatique
          fetch_format: 'auto', // Format optimal selon le navigateur
          transformation: [
            {
              width: 800,
              height: 600,
              crop: 'fill',
              gravity: 'center'
            },
            {
              quality: 'auto:good'
            }
          ],
          eager: [
            // Générer des versions optimisées
            { width: 400, height: 300, crop: 'fill', format: 'webp', quality: 'auto' },
            { width: 200, height: 150, crop: 'fill', format: 'webp', quality: 'auto' },
          ]
        },
        (error, result) => {
          if (error) {
            console.error('❌ Erreur Cloudinary:', error);
            reject(error);
          } else {
            console.log('✅ Upload Cloudinary réussi:', result?.public_id);
            resolve(result);
          }
        }
      ).end(buffer);
    });

    const result = uploadResult as any;

    // Réponse avec multiple URLs
    const response = {
      success: true,
      url: result.secure_url, // URL principale
      public_id: result.public_id,
      optimized_urls: {
        original: result.secure_url,
        medium: result.eager?.[0]?.secure_url || result.secure_url,
        thumbnail: result.eager?.[1]?.secure_url || result.secure_url,
      },
      metadata: {
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes,
        created_at: result.created_at
      }
    };

    console.log('📤 Réponse upload:', {
      public_id: result.public_id,
      url: result.secure_url,
      size: result.bytes
    });

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Erreur upload:', error);
    
    return NextResponse.json(
      { 
        error: 'Erreur lors de l\'upload de l\'image',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

// API pour supprimer une image
export async function DELETE(request: NextRequest) {
  try {
    // Vérification admin
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get('public_id');

    if (!publicId) {
      return NextResponse.json(
        { error: 'Public ID requis pour la suppression' },
        { status: 400 }
      );
    }

    console.log('🗑️ Suppression Cloudinary:', publicId);

    // Suppression de Cloudinary
    const deleteResult = await cloudinary.uploader.destroy(publicId);

    if (deleteResult.result === 'ok') {
      console.log('✅ Image supprimée:', publicId);
      return NextResponse.json({
        success: true,
        message: 'Image supprimée avec succès'
      });
    } else {
      return NextResponse.json(
        { error: 'Erreur lors de la suppression' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('❌ Erreur suppression:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}