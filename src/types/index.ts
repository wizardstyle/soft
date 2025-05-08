export interface Client {
  name: string;
  surname: string;
  phone: string;
  ticketNumber: string;
  email: string;
  address: string;
}

export interface Repair {
  id: string;
  date: string;
  repairNumber: string;
  receivedBy: string;
  warranty: boolean;
  code: string;
  article: string;
  brand: string;
  model: string;
  serialImei: string;
  provider: string;
  requestBudget: boolean;
  content: string;
  problem: string;
  deliveryDate: string | null;
  client: Client;
  status: 'pending' | 'in_progress' | 'completed' | 'supplier_delivered';
}

export type RepairFormData = Omit<Repair, 'id' | 'date' | 'repairNumber' | 'status'>;