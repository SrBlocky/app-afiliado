import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Generate Full Custom Outfit via Gemini
app.post('/api/ai/generate-outfit', async (req, res) => {
  try {
    const {
      prompt,
      occasion,
      aesthetic,
      season,
      gender,
      budgetTier,
      colorPreference,
    } = req.body;

    const userInstructions = `
Actúa como un Personal Shopper y Estilista de Moda experto en crear conjuntos (outfits), clones de pasarela y hallazgos coordinados 100% de la tienda SHEIN y sus colecciones exclusivas (MOTF, DAZY, GLOWMODE, SHEIN Privé, SHEIN MOD, SHEIN ICON, ROMWE, SHEIN Men, CUCCOO calzado) para México.
Crea un conjunto completo, armonioso, moderno y súper favorecedor según estas preferencias:
- Ocasión: ${occasion || 'Casual Chic'}
- Estilo / Estética: ${aesthetic || 'Elegante y Moderno'}
- Temporada / Clima: ${season || 'Todo el Año'}
- Género: ${gender || 'Mujer'}
- Rango de Presupuesto: ${budgetTier || 'Equilibrado / Medio ($1,200 - $2,500 MXN)'}
- Preferencia de color o detalle adicional: ${colorPreference || 'No especificado'}
- Petición del usuario: ${prompt || 'Crear el mejor conjunto o clon de tendencia en SHEIN'}

Devuelve un conjunto completo que contenga entre 4 y 5 prendas o accesorios complementarios de SHEIN (por ejemplo: Top/Blusa, Pantalón/Falda, Calzado CUCCOO/SHEIN, Chaqueta/Blazer MOTF o SHEIN, Bolso y Accesorio).
Para cada prenda, asigna la submarca o línea de SHEIN más adecuada (MOTF, DAZY, GLOWMODE, SHEIN Privé, SHEIN MOD, SHEIN ICON, ROMWE, SHEIN Men, CUCCOO, SHEIN), un precio realista y competitivo de SHEIN en Pesos Mexicanos (MXN) (ej: 189, 299, 399, 499, 699 MXN), y consejos de estilo precisos.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: userInstructions,
      config: {
        systemInstruction: 'Eres un estilista digital y curador de clones y hallazgos de moda especializado EXCLUSIVAMENTE en SHEIN México y sus líneas premium (MOTF, DAZY, GLOWMODE, SHEIN Privé, SHEIN MOD, ROMWE, SHEIN Men). Generas conjuntos de ropa ultra detallados, con combinaciones de color impecables, precios en pesos mexicanos (MXN) y piezas fáciles de encontrar en shein.com.mx.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Título atractivo del conjunto o clon SHEIN' },
            description: { type: Type.STRING, description: 'Breve explicación de por qué este conjunto de SHEIN funciona y transmite sofisticación' },
            occasion: { type: Type.STRING, description: 'Ocasión recomendada' },
            aesthetic: { type: Type.STRING, description: 'Estética del look' },
            season: { type: Type.STRING, description: 'Temporada adecuada' },
            gender: { type: Type.STRING, description: 'Género' },
            stylingTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Consejos de cómo lucir, abotonar, o combinar las prendas de SHEIN',
            },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Etiquetas de tendencia del look (ej: MOTF SHEIN, Dupe Zara, Viral TikTok)',
            },
            colorPalette: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  hex: { type: Type.STRING, description: 'Código HEX del color (ej #2B2B2A)' },
                  name: { type: Type.STRING, description: 'Nombre poético o descriptivo del tono' },
                },
                required: ['hex', 'name'],
              },
            },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: 'Nombre descriptivo de la prenda SHEIN' },
                  category: {
                    type: Type.STRING,
                    description: 'Categoría: top, bottom, shoes, outerwear, accessory, bag, jewelry',
                  },
                  brand: { type: Type.STRING, description: 'Línea de SHEIN (MOTF by SHEIN, DAZY by SHEIN, GLOWMODE, SHEIN Privé, SHEIN MOD, ROMWE, SHEIN Men)' },
                  store: {
                    type: Type.STRING,
                    description: 'Tienda/Línea: Shein, MOTF (Shein), DAZY (Shein), GLOWMODE (Shein), SHEIN Privé, SHEIN MOD, SHEIN ICON, ROMWE, SHEIN Man',
                  },
                  price: { type: Type.NUMBER, description: 'Precio estimado en pesos mexicanos en SHEIN (ej 199 - 699 MXN)' },
                  originalPrice: { type: Type.NUMBER, description: 'Precio original si tiene descuento en MXN' },
                  color: { type: Type.STRING, description: 'Color de la pieza' },
                  rating: { type: Type.NUMBER, description: 'Calificación de 4.5 a 5.0' },
                  commissionRatePct: { type: Type.NUMBER, description: 'Porcentaje estimado de comisión de afiliado SHEIN (entre 10.0 y 15.0)' },
                },
                required: ['name', 'category', 'brand', 'store', 'price', 'color'],
              },
            },
          },
          required: ['title', 'description', 'items', 'colorPalette', 'stylingTips', 'tags'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    
    // Enrich with IDs and search links on SHEIN Mexico
    const enrichedItems = (parsed.items || []).map((item: any, idx: number) => {
      const buyUrl = `https://www.shein.com.mx/pdsearch/${encodeURIComponent(item.name)}/`;

      // Category-based aesthetic fallback images
      const catImages: Record<string, string> = {
        top: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80',
        bottom: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=80',
        shoes: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&auto=format&fit=crop&q=80',
        outerwear: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&auto=format&fit=crop&q=80',
        bag: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80',
        accessory: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&auto=format&fit=crop&q=80',
        jewelry: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80',
      };

      return {
        id: `ai-item-${Date.now()}-${idx}`,
        name: item.name,
        category: item.category || 'top',
        brand: item.brand || 'SHEIN',
        store: item.store || 'Shein',
        price: Number(item.price) || 399,
        originalPrice: item.originalPrice ? Number(item.originalPrice) : undefined,
        currency: 'MXN',
        color: item.color || 'Neutro',
        imageUrl: catImages[item.category] || catImages.top,
        buyUrl,
        rating: item.rating ? Number(item.rating) : 4.8,
        reviewsCount: Math.floor(Math.random() * 400) + 120,
        inStock: true,
        commissionRatePct: Number(item.commissionRatePct) || 12.0,
        promoCode: 'SHEIN15',
      };
    });

    const totalPrice = Number(
      enrichedItems.reduce((sum: number, it: any) => sum + (it.price || 0), 0).toFixed(2)
    );

    const fullOutfit = {
      id: `ai-outfit-${Date.now()}`,
      title: parsed.title || 'Conjunto Personalizado por IA',
      description: parsed.description || 'Look exclusivo seleccionado por el estilista inteligente para maximizar armonía y elegancia.',
      occasion: parsed.occasion || occasion || 'Casual Chic',
      aesthetic: parsed.aesthetic || aesthetic || 'Contemporáneo',
      season: parsed.season || season || 'Todo el Año',
      gender: parsed.gender || gender || 'Mujer',
      coverImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=900&auto=format&fit=crop&q=80',
      totalPrice,
      likesCount: 1,
      createdAt: new Date().toISOString().split('T')[0],
      tags: parsed.tags || ['IA Estilista', 'Look Personalizado', 'Tendencia'],
      stylingTips: parsed.stylingTips || [
        'Añade un accesorio de acento para contrastar con los tonos principales.',
        'Mantén proporciones balanceadas entre prendas holgadas y entalladas.'
      ],
      colorPalette: parsed.colorPalette && parsed.colorPalette.length > 0 ? parsed.colorPalette : [
        { hex: '#2A2A2A', name: 'Carbón' },
        { hex: '#E6E0D4', name: 'Crema Arena' },
        { hex: '#A3704C', name: 'Camel' },
        { hex: '#C5A880', name: 'Oro Viejo' }
      ],
      items: enrichedItems,
      isAIGenerated: true,
      matchScore: 98,
    };

    res.json({ success: true, outfit: fullOutfit });
  } catch (error: any) {
    console.error('Error generating AI outfit:', error);
    res.status(500).json({
      success: false,
      error: 'No se pudo generar el conjunto en este momento. Inténtalo de nuevo.',
      details: error?.message,
    });
  }
});

// Match a Specific Piece Owned by User
app.post('/api/ai/match-piece', async (req, res) => {
  try {
    const { pieceDescription, occasion, gender } = req.body;
    if (!pieceDescription) {
      return res.status(400).json({ error: 'La descripción de la prenda es obligatoria' });
    }

    const prompt = `
El usuario (mujer joven, Gen Z / Millennial) tiene la siguiente prenda en su armario o desea combinarla:
"${pieceDescription}"
Ocasión deseada: ${occasion || 'Salida con amigas / Universidad'}
Género: ${gender || 'Mujer'}

Genera 2 conjuntos completos y diferentes creados ALREDEDOR de esta prenda base, utilizando EXCLUSIVAMENTE prendas y accesorios disponibles en SHEIN México y sus submarcas juveniles (DAZY, ROMWE, SHEIN ICON, SHEIN MOD, CUCCOO, etc).
Conjunto 1: Estilo de día (ej. Clean Girl, Casual, Universidad) en SHEIN.
Conjunto 2: Estilo de noche/salida (ej. Baddie, Coquette, Y2K) en SHEIN.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction: 'Eres un estilista personal experto en tendencias de TikTok (Coquette, Y2K, Acubi, Clean Girl) para mujeres de 16 a 30 años, utilizando exclusivamente SHEIN México. Para cada prenda complementaria, indica línea de SHEIN (DAZY, ROMWE, etc.), precio realista en Pesos Mexicanos (MXN ej 199 - 599 MXN) y consejo de combinación aesthetic.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              occasion: { type: Type.STRING },
              aesthetic: { type: Type.STRING },
              stylingTips: { type: Type.ARRAY, items: { type: Type.STRING } },
              colorPalette: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    hex: { type: Type.STRING },
                    name: { type: Type.STRING },
                  },
                  required: ['hex', 'name'],
                },
              },
              items: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    category: { type: Type.STRING },
                    brand: { type: Type.STRING },
                    store: { type: Type.STRING },
                    price: { type: Type.NUMBER, description: 'Precio en MXN de SHEIN' },
                    color: { type: Type.STRING },
                  },
                  required: ['name', 'category', 'brand', 'store', 'price'],
                },
              },
            },
            required: ['title', 'description', 'items', 'stylingTips'],
          },
        },
      },
    });

    const parsedArray = JSON.parse(response.text || '[]');
    const results = parsedArray.map((look: any, lookIdx: number) => {
      const items = (look.items || []).map((it: any, iIdx: number) => {
        const buyUrl = `https://www.shein.com.mx/pdsearch/${encodeURIComponent(it.name)}/`;
        const catImages: Record<string, string> = {
          top: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80',
          bottom: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=80',
          shoes: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&auto=format&fit=crop&q=80',
          outerwear: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&auto=format&fit=crop&q=80',
          bag: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=80',
          accessory: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&auto=format&fit=crop&q=80',
        };

        return {
          id: `match-item-${Date.now()}-${lookIdx}-${iIdx}`,
          name: it.name,
          category: it.category || 'top',
          brand: it.brand || 'SHEIN',
          store: it.store || 'Shein',
          price: Number(it.price) || 349,
          currency: 'MXN',
          color: it.color || 'Combinable',
          imageUrl: catImages[it.category] || catImages.top,
          buyUrl,
          rating: 4.8,
          reviewsCount: 220,
          inStock: true,
          commissionRatePct: 12.0,
          promoCode: 'SHEIN15',
        };
      });

      const totalPrice = Number(items.reduce((s: number, i: any) => s + i.price, 0).toFixed(2));

      return {
        id: `match-outfit-${Date.now()}-${lookIdx}`,
        title: look.title,
        description: look.description,
        occasion: look.occasion || 'Versátil',
        aesthetic: look.aesthetic || 'Armonioso',
        season: 'Todo el Año',
        gender: gender || 'Mujer',
        coverImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=900&auto=format&fit=crop&q=80',
        totalPrice,
        likesCount: 12,
        createdAt: new Date().toISOString().split('T')[0],
        tags: ['Match Armario', 'Prenda Base', 'Estilismo IA'],
        stylingTips: look.stylingTips || [],
        colorPalette: look.colorPalette || [
          { hex: '#333333', name: 'Base Neutra' },
          { hex: '#CCCCCC', name: 'Complemento Claro' },
        ],
        items,
        isAIGenerated: true,
      };
    });

    res.json({ success: true, outfits: results });
  } catch (error: any) {
    console.error('Error matching piece:', error);
    res.status(500).json({ success: false, error: 'Error al armar el conjunto con tu prenda' });
  }
});

// Quick AI Styling Advice
app.post('/api/ai/styling-advice', async (req, res) => {
  try {
    const { question, currentOutfitTitle } = req.body;
    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: `El usuario pregunta al estilista: "${question}". Contexto del look actual: "${currentOutfitTitle || 'General'}". Responde de forma cálida, concisa (máximo 3 párrafos), inspiradora y con consejos de estilismo prácticos aplicables de inmediato.`,
    });
    res.json({ success: true, advice: response.text });
  } catch (error: any) {
    res.status(500).json({ success: false, error: 'Error al obtener consejo de estilismo' });
  }
});

// Vite middleware & Static Serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ModaMatch Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
