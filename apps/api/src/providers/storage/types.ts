export interface DocumentStorage {
  /** Persists a buffer and returns a storage key that can later be used to retrieve it. */
  save(key: string, content: Buffer, contentType: string): Promise<string>;
  /** Retrieves a previously-saved buffer by its storage key. */
  read(key: string): Promise<Buffer>;
}
