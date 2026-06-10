export const TestData = {
  users: {
    admin: {
      email: 'admin@cima.dev',
      password: 'Admin123!',
      firstName: 'Admin',
      lastName: 'CIMA',
    },
    worker: {
      email: 'ana.martinez@cima.dev',
      password: 'Demo123!',
      firstName: 'Ana',
      lastName: 'Martínez',
    },
    client: {
      email: 'contacto@restauranteelbuensabor.com',
      password: 'Demo123!',
      firstName: 'Contacto',
      lastName: 'El Buen Sabor',
    },
  },

  projects: {
    campaign: () => ({
      name: `Campaña QA ${Date.now()}`,
      type: 'campaign_service' as const,
      description: 'Proyecto de prueba automatizado',
      brief: 'Brief de prueba para validación E2E',
    }),
    order: () => ({
      name: `Orden QA ${Date.now()}`,
      type: 'product_order' as const,
      description: 'Orden de producto de prueba',
      brief: 'Brief de orden para validación E2E',
    }),
  },

  tasks: {
    highPriority: () => ({
      title: `Tarea Alta ${Date.now()}`,
      description: 'Tarea de prueba con prioridad alta',
      priority: 'high' as const,
    }),
    mediumPriority: () => ({
      title: `Tarea Media ${Date.now()}`,
      description: 'Tarea de prueba con prioridad media',
      priority: 'medium' as const,
    }),
    lowPriority: () => ({
      title: `Tarea Baja ${Date.now()}`,
      description: 'Tarea de prueba con prioridad baja',
      priority: 'low' as const,
    }),
  },

  chat: {
    internal: () => ({
      message: `Mensaje interno de prueba ${Date.now()}`,
    }),
    external: () => ({
      message: `Mensaje externo de prueba ${Date.now()}`,
    }),
  },

  comments: {
    task: () => ({
      text: `Comentario de prueba ${Date.now()}`,
    }),
  },

  files: {
    image: {
      name: 'test-image.png',
      path: 'test-files/test-image.png',
      mimeType: 'image/png',
    },
    document: {
      name: 'test-document.pdf',
      path: 'test-files/test-document.pdf',
      mimeType: 'application/pdf',
    },
  },

  changeRequests: {
    minor: () => ({
      description: `Solicitud menor de prueba ${Date.now()}`,
    }),
    formal: () => ({
      description: `Solicitud formal de prueba ${Date.now()}`,
    }),
  },

  strongPassword: 'Test123!@#',
}
