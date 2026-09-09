/**
 * Canal de eventos desacoplado entre o interceptor do axios (uaiMedApi.ts,
 * fora da árvore React) e o AuthContext. Evita import circular, já que
 * AuthContext.tsx importa uaiMedApi.ts.
 */

type Listener = () => void;

let listeners: Listener[] = [];

export function onForceLogout(cb: Listener): () => void {
  listeners.push(cb);
  return () => {
    listeners = listeners.filter((l) => l !== cb);
  };
}

export function emitForceLogout(): void {
  listeners.forEach((cb) => cb());
}
