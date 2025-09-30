# 📊 Guía del Sistema de Puntuaciones y Rankings

## 🎯 Descripción General

El sistema de puntuaciones está diseñado para:
- **Guardar únicamente el MEJOR puntaje** de cada usuario por juego
- **Actualizar automáticamente** cuando el usuario supera su récord
- **Mostrar rankings globales** ordenados del mejor al peor
- **Evitar llenar la base de datos** con múltiples partidas del mismo usuario

## 🗄️ Estructura de la Base de Datos

### Tabla: `game_results`

```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key a users.auth_uuid)
- game_name: TEXT (Nombre del juego)
- score: INTEGER (Puntuación)
- additional_data: JSONB (Datos extra)
- created_at: TIMESTAMPTZ (Fecha del récord)
```

**Restricción Única:** `(user_id, game_name)` - Cada usuario solo tiene UN registro por juego.

## 🔧 Cómo Implementar en un Nuevo Juego

### 1. Importar el Servicio y Componente

```typescript
import { GameResultsService } from '../../../../../shared/services/game-results.service';
import { GameRankingComponent } from '../../../../../shared/components/game-ranking/game-ranking.component';
```

### 2. Inyectar el Servicio

```typescript
@Component({
  selector: 'app-tu-juego',
  imports: [CommonModule, GameRankingComponent],
  // ...
})
export class TuJuegoComponent {
  private gameResultsService = inject(GameResultsService);
  private authService = inject(AuthService);
}
```

### 3. Guardar Resultado al Finalizar Partida

```typescript
async finalizarJuego() {
  const user = this.currentUser();
  const puntaje = this.calcularPuntaje(); // Tu lógica de puntuación
  
  if (user?.auth_uuid) {
    const resultado = await this.gameResultsService.saveGameResult({
      user_id: user.auth_uuid,
      game_name: 'nombre-del-juego', // Único por juego
      score: puntaje,
      additional_data: {
        // Datos adicionales opcionales
        duracion: this.duracion,
        nivel: this.nivelAlcanzado,
        // etc...
      }
    });

    // Mostrar mensaje según resultado
    if (resultado.isNewRecord) {
      console.log('¡Primer registro guardado!');
    } else if (resultado.improved) {
      console.log(`¡Nuevo récord! Anterior: ${resultado.previousScore}`);
    } else {
      console.log(`No superaste tu récord: ${resultado.currentBest}`);
    }
  }
}
```

### 4. Agregar Tabla de Rankings en el HTML

```html
<!-- Tabla de Clasificación -->
<div class="mt-8">
  <app-game-ranking 
    gameName="nombre-del-juego" 
    [limit]="10">
  </app-game-ranking>
</div>
```

## 📝 Nombres de Juegos Estándar

Para mantener consistencia, usa estos nombres:

- `'mayor-o-menor'` - Mayor o Menor
- `'ahorcado'` - Ahorcado
- `'preguntados'` - Preguntados
- `'adivina-numero'` - Adivina el Número

## 🎮 Lógica del Sistema

### ¿Cuándo se guarda/actualiza?

1. **Primera vez que juega**: Se crea un nuevo registro
2. **Puntaje mayor al anterior**: Se actualiza el registro existente
3. **Puntaje menor o igual**: NO se hace nada (no se guarda)

### Respuesta del `saveGameResult()`

```typescript
{
  data: any,              // Datos del registro
  error: any,             // Error si ocurrió
  isNewRecord: boolean,   // true si es primera vez
  improved: boolean,      // true si mejoró el puntaje
  previousScore?: number, // Puntaje anterior (si mejoró)
  currentBest?: number    // Mejor puntaje actual (si no mejoró)
}
```

## 💡 Consejos de Implementación

### Puntuaciones Altas vs Bajas

Para juegos donde **menor es mejor** (ej: tiempo, intentos):

```typescript
// En el componente del juego, usa lowerIsBetter: true
const resultado = await this.gameResultsService.saveGameResult({
  user_id: user.auth_uuid,
  game_name: 'mi-juego',
  score: intentos, // Guardar el valor directo
  additional_data: { duracion }
}, true); // true = menor es mejor

// En el HTML del juego
<app-game-ranking 
  gameName="mi-juego" 
  [limit]="10"
  [lowerIsBetter]="true">
</app-game-ranking>
```

### Datos Adicionales

Usa `additional_data` para guardar información extra:
```typescript
additional_data: {
  duracion: 120,        // segundos
  nivel: 5,             // nivel alcanzado
  vidas: 3,             // vidas restantes
  timestamp: Date.now() // marca de tiempo
}
```

### Testing

Para probar el sistema:
1. Juega y obtén un puntaje bajo
2. Verifica que se guarda en la BD
3. Juega y obtén un puntaje MAYOR
4. Verifica que se actualiza (no crea nuevo registro)
5. Juega y obtén un puntaje MENOR
6. Verifica que NO se actualiza

## 🔒 Seguridad

El sistema tiene Row Level Security (RLS) habilitado:
- ✅ Cualquiera puede **VER** todos los resultados (para rankings)
- ✅ Los usuarios solo pueden **INSERTAR** sus propios resultados
- ✅ Los usuarios solo pueden **ACTUALIZAR** sus propios resultados
- ❌ Los usuarios NO pueden modificar resultados de otros

## 🎨 Personalización del Ranking

El componente `GameRankingComponent` acepta:
- `gameName`: Nombre del juego (requerido)
- `limit`: Cantidad de resultados a mostrar (default: 10)

```html
<app-game-ranking 
  gameName="mi-juego" 
  [limit]="20">
</app-game-ranking>
```

## 🐛 Troubleshooting

### Error: "duplicate key value violates unique constraint"
- El sistema ya tiene un registro para ese usuario/juego
- Verifica que estés usando UPDATE en lugar de INSERT

### No se actualiza el ranking
- Verifica que el `gameName` sea exactamente el mismo
- Revisa que el usuario esté autenticado
- Chequea la consola por errores de Supabase

### Puntaje no se guarda
- Verifica que `user.auth_uuid` no sea null
- Asegúrate de llamar `saveGameResult()` después de calcular el puntaje
- Revisa las políticas de RLS en Supabase
