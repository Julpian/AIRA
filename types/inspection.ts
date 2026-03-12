export type Inspection = {
  id: string;
  schedule_id: string;
  inspector_id: string;
  status: string;
  scanned_nfc_uid: string;
  inspected_at?: string;
  parent_id?: string | null;
};
