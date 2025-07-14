/**
 * Tipos utilitarios globales para el metaverso
 */
export type Nullable<T> = T | null;
export type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
}; 