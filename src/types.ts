export type Activity = {
  id: string;
  family_id: string;
  title: string;
  note: string;
  who: string;
  occurred_at: string; // ISO string
};

export type Family = {
  id: string;
  name: string;
  invite_code: string;
};
