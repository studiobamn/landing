-- Seed the languages table.
-- Run this file any time translations change; ON CONFLICT UPDATE overwrites.
-- Keys in the "db" section mirror database content keyed by slug / role.

INSERT INTO languages (label, language, content) VALUES (
  'en',
  'English',
  $json${
    "common": {
      "close": "Close",
      "backToHome": "Back to home",
      "cancel": "Cancel"
    },
    "nav": {
      "projects": "Projects",
      "products": "Products",
      "about": "About",
      "contact": "Contact",
      "board": "Board"
    },
    "form": {
      "name": "Name",
      "email": "Email",
      "message": "Message",
      "sending": "Sending…",
      "sendInquiry": "Send inquiry"
    },
    "productModal": {
      "materials": "Materials",
      "dimensions": "Dimensions",
      "getInTouch": "Get in touch about this piece",
      "thankYou": "Thank you — we'll be in touch about the {{productName}}.",
      "interested": "I'm interested in {{productName}}.",
      "variant": "Variant {{number}}"
    },
    "contact": {
      "thankYou": "Thank you — we'll be in touch soon."
    },
    "location": {
      "phone": "Phone/",
      "email": "Email/",
      "address": "Address/"
    },
    "admin": {
      "commit": "Commit",
      "wipe": "Wipe",
      "nuke": "Nuke",
      "restorePointSet": "Restore point set.",
      "commitFailed": "Commit failed.",
      "wipedToCheckpoint": "Wiped to checkpoint.",
      "wipeFailed": "Wipe failed.",
      "boardNuked": "Board nuked.",
      "nukeFailed": "Nuke failed.",
      "nukeHeading": "Nuke the live board?",
      "nukeDescription": "This clears the live board to blank for everyone, immediately. The restore point will be kept — you can still wipe back to your last committed checkpoint.",
      "nukeConfirm": "Nuke it",
      "nuking": "Nuking…"
    },
    "projects": {
      "defaultQuote": "We do not decorate the world.\nWe take a position in it.",
      "attrLocation": "location",
      "attrYear": "year",
      "attrCategory": "category",
      "architectPlan": "2 architect plan"
    },
    "products": {
      "noProducts": "No products yet — run supabase/dummy.sql or add rows in Supabase.",
      "volFallback": "Vol. 01"
    },
    "about": {
      "noContent": "No about content yet."
    },
    "db": {
      "products": {
        "bend-chair": {
          "name": "Bend Chair",
          "description": "A single length of tube bent into a seat — one continuous gesture, no joints to hide.",
          "materials": "Powder-coated steel"
        },
        "loop-rug": {
          "name": "Loop Rug",
          "description": "A hand-tufted wool rug whose pattern is a single looping line, drawn once and never lifted.",
          "materials": "Hand-tufted wool"
        }
      },
      "productLine": {
        "lineName": "Cow Objects",
        "subtitle": "Products by BAMN, only this volume is available"
      },
      "projectCategories": {
        "Residential": "Residential",
        "Public": "Public",
        "Industrial": "Industrial",
        "Cultural": "Cultural",
        "Commercial": "Commercial",
        "Civic": "Civic",
        "Religious": "Religious",
        "Interior": "Interior",
        "Infrastructure": "Infrastructure"
      },
      "projectRoles": {
        "Structure": "Structure",
        "Architect": "Architect",
        "Project Lead": "Project Lead",
        "Facade": "Facade",
        "Build": "Build",
        "Site": "Site",
        "Program": "Program",
        "Engineering": "Engineering",
        "Curation": "Curation",
        "Liturgy": "Liturgy",
        "Interior": "Interior"
      },
      "projects": {
        "casa-talud": {
          "description": "A house cut into a hillside, where the retaining wall becomes the principal living surface and the roof returns the slope to the garden.",
          "descriptionShort": "A house cut into the hillside.",
          "phrases_0": "The wall becomes the house.",
          "phrases_1": "Ground as material."
        },
        "mercado-cubierto": {
          "description": "A market hall under a single folded canopy that shades without enclosing, keeping the street air moving through the stalls.",
          "descriptionShort": "One folded canopy over the stalls.",
          "phrases_0": "Shade without enclosure.",
          "phrases_1": "The air keeps moving."
        },
        "taller-norte": {
          "description": "A workshop and small foundry organized around a top-lit central bay, with services pushed to a heavy perimeter wall.",
          "descriptionShort": "A workshop around a top-lit bay.",
          "phrases_0": "Work needs north light.",
          "phrases_1": "Mass at the edges."
        },
        "pabellon-agua": {
          "description": "A small exhibition pavilion sited over a reflecting basin, its galleries reached by a sequence of low ramps.",
          "descriptionShort": "A pavilion over a reflecting basin.",
          "phrases_0": "Arrive by water.",
          "phrases_1": "Low ramps, slow rooms."
        },
        "edificio-cobre": {
          "description": "A mixed-use block clad in oxidizing copper, where the patina records the building's exposure to the city over time.",
          "descriptionShort": "A block clad in oxidizing copper.",
          "phrases_0": "The patina keeps time.",
          "phrases_1": "The city writes the surface."
        },
        "biblioteca-piedra": {
          "description": "A neighborhood library built from local stone, with reading rooms that step down toward a shaded courtyard.",
          "descriptionShort": "A library of local stone.",
          "phrases_0": "Read toward the shade.",
          "phrases_1": "Stone holds the cool."
        },
        "casa-patio": {
          "description": "A coastal house turned inward around a planted patio, trading the view for cross-ventilation and privacy.",
          "descriptionShort": "A coastal house turned inward.",
          "phrases_0": "Trade the view for air.",
          "phrases_1": "The patio is the room."
        },
        "nave-sur": {
          "description": "A long-span logistics shed whose structure is left exposed as the only architecture, lit by continuous clerestories.",
          "descriptionShort": "A shed where structure is the architecture.",
          "phrases_0": "Leave the frame exposed.",
          "phrases_1": "Light from the ridge."
        },
        "capilla-luz": {
          "description": "A chapel where a single oculus tracks the day across a bare concrete shell, the only ornament being the moving light.",
          "descriptionShort": "A chapel tracked by a single oculus.",
          "phrases_0": "Light is the only ornament.",
          "phrases_1": "The day moves the room."
        },
        "oficinas-trama": {
          "description": "An office interior built as a loose timber lattice, dividing space without sealing it, so light and sound carry through.",
          "descriptionShort": "An office built as a timber lattice.",
          "phrases_0": "Divide without sealing.",
          "phrases_1": "Let sound carry."
        },
        "puente-mirador": {
          "description": "A pedestrian bridge that widens at midspan into a small belvedere, giving the crossing a reason to pause.",
          "descriptionShort": "A bridge that widens into a belvedere.",
          "phrases_0": "A reason to pause.",
          "phrases_1": "Cross, and look."
        }
      },
      "siteContent": {
        "aboutManifesto": "We use the beauty of chaos and give it form. Every project begins with the willingness to not know the answer yet — to build as if the ground were never promised to us.",
        "aboutFooterMeta1": "EST. 2020  ·  MARCH",
        "aboutFooterMeta2": "CARACAS  ·  BY APPOINTMENT",
        "aboutVerticalLabelLine2": "STUDIO COLLECTION",
        "contactInquiry0Label": "New Business/",
        "contactInquiry0Text": "Please direct new project enquiries to studio@bamn.studio.",
        "contactInquiry1Label": "Job Applications/",
        "contactInquiry1Text": "Send your portfolio to jobs@bamn.studio. Max 10MB, PDF only.",
        "contactPhotoCaption": "The studio — Caracas"
      }
    }
  }$json$
) ON CONFLICT (label) DO UPDATE SET content = EXCLUDED.content, language = EXCLUDED.language;


INSERT INTO languages (label, language, content) VALUES (
  'es',
  'Español',
  $json${
    "common": {
      "close": "Cerrar",
      "backToHome": "Volver al inicio",
      "cancel": "Cancelar"
    },
    "nav": {
      "projects": "Proyectos",
      "products": "Productos",
      "about": "Nosotros",
      "contact": "Contacto",
      "board": "Tablero"
    },
    "form": {
      "name": "Nombre",
      "email": "Correo electrónico",
      "message": "Mensaje",
      "sending": "Enviando…",
      "sendInquiry": "Enviar consulta"
    },
    "productModal": {
      "materials": "Materiales",
      "dimensions": "Dimensiones",
      "getInTouch": "Contáctanos sobre esta pieza",
      "thankYou": "Gracias — nos pondremos en contacto sobre {{productName}}.",
      "interested": "Estoy interesado en {{productName}}.",
      "variant": "Variante {{number}}"
    },
    "contact": {
      "thankYou": "Gracias — nos pondremos en contacto pronto."
    },
    "location": {
      "phone": "Teléfono/",
      "email": "Correo/",
      "address": "Dirección/"
    },
    "admin": {
      "commit": "Guardar",
      "wipe": "Limpiar",
      "nuke": "Destruir",
      "restorePointSet": "Punto de restauración guardado.",
      "commitFailed": "Error al guardar.",
      "wipedToCheckpoint": "Restaurado al punto de control.",
      "wipeFailed": "Error al limpiar.",
      "boardNuked": "Tablero destruido.",
      "nukeFailed": "Error al destruir.",
      "nukeHeading": "¿Destruir el tablero en vivo?",
      "nukeDescription": "Esto borra el tablero para todos inmediatamente. El punto de restauración se conserva — aún puedes volver a tu último guardado.",
      "nukeConfirm": "Destruir",
      "nuking": "Destruyendo…"
    },
    "projects": {
      "defaultQuote": "No decoramos el mundo.\nTomamos una posición en él.",
      "attrLocation": "ubicación",
      "attrYear": "año",
      "attrCategory": "categoría",
      "architectPlan": "2 plano arquitectónico"
    },
    "products": {
      "noProducts": "Sin productos aún — ejecuta supabase/dummy.sql o agrega filas en Supabase.",
      "volFallback": "Vol. 01"
    },
    "about": {
      "noContent": "Aún no hay contenido de nosotros."
    },
    "db": {
      "products": {
        "bend-chair": {
          "name": "Silla Bend",
          "description": "Una longitud única de tubo doblada en un asiento — un gesto continuo, sin uniones que ocultar.",
          "materials": "Acero con recubrimiento en polvo"
        },
        "loop-rug": {
          "name": "Alfombra Loop",
          "description": "Una alfombra de lana tufteada a mano cuyo patrón es una sola línea continua, trazada de una vez y sin levantar el trazo.",
          "materials": "Lana tufteada a mano"
        }
      },
      "productLine": {
        "lineName": "Cow Objects",
        "subtitle": "Productos por BAMN, solo este volumen está disponible"
      },
      "projectCategories": {
        "Residential": "Residencial",
        "Public": "Público",
        "Industrial": "Industrial",
        "Cultural": "Cultural",
        "Commercial": "Comercial",
        "Civic": "Cívico",
        "Religious": "Religioso",
        "Interior": "Interior",
        "Infrastructure": "Infraestructura"
      },
      "projectRoles": {
        "Structure": "Estructura",
        "Architect": "Arquitecto",
        "Project Lead": "Líder de Proyecto",
        "Facade": "Fachada",
        "Build": "Construcción",
        "Site": "Obra",
        "Program": "Programa",
        "Engineering": "Ingeniería",
        "Curation": "Curaduría",
        "Liturgy": "Liturgia",
        "Interior": "Interior"
      },
      "projects": {
        "casa-talud": {
          "description": "Una casa excavada en una ladera, donde el muro de contención se convierte en la principal superficie habitable y la cubierta devuelve la pendiente al jardín.",
          "descriptionShort": "Una casa excavada en la ladera.",
          "phrases_0": "El muro se convierte en la casa.",
          "phrases_1": "El suelo como material."
        },
        "mercado-cubierto": {
          "description": "Un pabellón de mercado bajo una única cubierta plegada que da sombra sin cerrar, manteniendo el aire de la calle circulando entre los puestos.",
          "descriptionShort": "Una cubierta plegada sobre los puestos.",
          "phrases_0": "Sombra sin cerramiento.",
          "phrases_1": "El aire sigue moviéndose."
        },
        "taller-norte": {
          "description": "Un taller y pequeña fundición organizados en torno a una nave central iluminada por arriba, con servicios desplazados hacia un pesado muro perimetral.",
          "descriptionShort": "Un taller en torno a una nave con luz cenital.",
          "phrases_0": "El trabajo necesita luz norte.",
          "phrases_1": "La masa en los bordes."
        },
        "pabellon-agua": {
          "description": "Un pequeño pabellón de exposición emplazado sobre un estanque reflectante, con galerías a las que se accede por una secuencia de rampas bajas.",
          "descriptionShort": "Un pabellón sobre un estanque reflectante.",
          "phrases_0": "Llegar por el agua.",
          "phrases_1": "Rampas bajas, salas lentas."
        },
        "edificio-cobre": {
          "description": "Un bloque de uso mixto revestido en cobre oxidante, donde la pátina registra la exposición del edificio a la ciudad a lo largo del tiempo.",
          "descriptionShort": "Un bloque revestido en cobre oxidante.",
          "phrases_0": "La pátina mide el tiempo.",
          "phrases_1": "La ciudad escribe la superficie."
        },
        "biblioteca-piedra": {
          "description": "Una biblioteca de barrio construida con piedra local, con salas de lectura que descienden hacia un patio sombreado.",
          "descriptionShort": "Una biblioteca de piedra local.",
          "phrases_0": "Leer hacia la sombra.",
          "phrases_1": "La piedra conserva el fresco."
        },
        "casa-patio": {
          "description": "Una casa costera vuelta hacia adentro en torno a un patio plantado, que cambia la vista por ventilación cruzada y privacidad.",
          "descriptionShort": "Una casa costera vuelta hacia adentro.",
          "phrases_0": "Cambiar la vista por el aire.",
          "phrases_1": "El patio es la habitación."
        },
        "nave-sur": {
          "description": "Una nave de gran luz cuya estructura queda expuesta como única arquitectura, iluminada por lucernarios corridos.",
          "descriptionShort": "Una nave donde la estructura es la arquitectura.",
          "phrases_0": "Dejar la estructura expuesta.",
          "phrases_1": "Luz desde la cumbrera."
        },
        "capilla-luz": {
          "description": "Una capilla donde un único óculo sigue el paso del día sobre una cáscara de hormigón desnudo, siendo la luz en movimiento el único ornamento.",
          "descriptionShort": "Una capilla seguida por un único óculo.",
          "phrases_0": "La luz es el único ornamento.",
          "phrases_1": "El día mueve la sala."
        },
        "oficinas-trama": {
          "description": "Un interior de oficinas construido como una trama de madera abierta, que divide el espacio sin sellarlo, permitiendo que la luz y el sonido circulen.",
          "descriptionShort": "Una oficina construida como una trama de madera.",
          "phrases_0": "Dividir sin sellar.",
          "phrases_1": "Que el sonido circule."
        },
        "puente-mirador": {
          "description": "Un puente peatonal que se ensancha en su punto medio en un pequeño mirador, dando a la travesía un motivo para detenerse.",
          "descriptionShort": "Un puente que se ensancha en un mirador.",
          "phrases_0": "Un motivo para detenerse.",
          "phrases_1": "Cruza, y mira."
        }
      },
      "siteContent": {
        "aboutManifesto": "Usamos la belleza del caos y le damos forma. Cada proyecto comienza con la disposición a no saber todavía la respuesta — a construir como si el suelo nunca nos hubiera sido prometido.",
        "aboutFooterMeta1": "EST. 2020  ·  MARZO",
        "aboutFooterMeta2": "CARACAS  ·  CON CITA PREVIA",
        "aboutVerticalLabelLine2": "COLECCIÓN DE ESTUDIO",
        "contactInquiry0Label": "Nuevos Proyectos/",
        "contactInquiry0Text": "Por favor dirija las consultas de nuevos proyectos a studio@bamn.studio.",
        "contactInquiry1Label": "Aplicaciones de Empleo/",
        "contactInquiry1Text": "Envíe su portafolio a jobs@bamn.studio. Máximo 10MB, solo PDF.",
        "contactPhotoCaption": "El estudio — Caracas"
      }
    }
  }$json$
) ON CONFLICT (label) DO UPDATE SET content = EXCLUDED.content, language = EXCLUDED.language;
