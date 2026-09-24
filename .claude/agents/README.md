# Perfiles de desarrollo

Base de perfiles especializados para trabajar este proyecto por partes en lugar de como un único desarrollador generalista. Cada archivo de esta carpeta define un subagente con su criterio propio, sus reglas y su forma de entregar.

| Perfil | Para qué | Edita código |
| --- | --- | --- |
| `arquitecto-datos` | Esquema, migraciones, RLS, formas normales, decidir categoría contra etiqueta | Sí |
| `frontend-cms` | Componentes de React, panel `/admin`, formularios, estado de cliente | Sí |
| `ux-responsive` | Comportamiento por tamaño de pantalla, navegación, accesibilidad | Sí |
| `qa-evidencia` | Verificación, pruebas, recorridos en navegador | No |
| `auditor-codigo` | Diagnóstico de calidad, robustez y escalabilidad | No |

## Cómo se usan

```
Usa el perfil arquitecto-datos para diseñar el módulo de categorías.
```

O en paralelo, cuando las tareas no se pisan:

```
Lanza auditor-codigo sobre src/components/admin y arquitecto-datos sobre las migraciones.
```

Dos perfiles no deben editar los mismos archivos a la vez. Este repositorio ya sufrió colisiones por trabajo simultáneo: componentes duplicados, un selector CSS posicional roto al desaparecer un elemento hermano, y migraciones guardadas en Latin-1. Reparte por carpeta, no por tarea.

## Reglas que comparten todos

Están repetidas en cada perfil a propósito, porque un subagente arranca sin el contexto de la conversación:

1. **No se inventan datos.** Ni precios, ni propiedades, ni testimonios, ni contactos, ni disponibilidad. Sin evidencia documentada, el dato se guarda como pendiente y se publica como «por confirmar».
2. **Esta no es la versión de Next que el modelo memorizó.** Next 16 con React 19. Se lee `app/node_modules/next/dist/docs/` antes de escribir código nuevo, como exige `AGENTS.md`.
3. **No hay backend.** El sitio es un export estático; la seguridad la impone RLS, no el código del navegador.
4. **Se verifica contra `next build`**, no contra el servidor de desarrollo.
5. **Una afirmación sin medida no cuenta.**
