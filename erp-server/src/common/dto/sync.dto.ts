export interface SyncableRecord {
  id: string;
  updatedAt: string | Date;
}

export interface SyncResponse<T> {
  synced: T[];
}
