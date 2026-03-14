import { 
  Baby, 
  Cross, 
  Home, 
  Wallet, 
  FileText, 
  Users, 
  User, 
  Wheat, 
  CreditCard,
  MoreHorizontal,
  type LucideIcon
} from 'lucide-react';

export interface Service {
  id: string;
  icon: LucideIcon;
  nameHi: string;
  nameEn: string;
}

export const services: Service[] = [
  { id: 'birth', icon: Baby, nameHi: 'जन्म प्रमाण पत्र', nameEn: 'Birth Certificate' },
  { id: 'death', icon: Cross, nameHi: 'मृत्यु प्रमाण पत्र', nameEn: 'Death Certificate' },
  { id: 'domicile', icon: Home, nameHi: 'मूल निवास', nameEn: 'Domicile Certificate' },
  { id: 'income', icon: Wallet, nameHi: 'आय प्रमाण पत्र', nameEn: 'Income Certificate' },
  { id: 'caste', icon: FileText, nameHi: 'जाति प्रमाण पत्र', nameEn: 'Caste Certificate' },
  { id: 'pension-old', icon: Users, nameHi: 'वृद्धावस्था पेंशन', nameEn: 'Old Age Pension' },
  { id: 'pension-widow', icon: User, nameHi: 'विधवा पेंशन', nameEn: 'Widow Pension' },
  { id: 'kisan', icon: Wheat, nameHi: 'किसान पंजीयन', nameEn: 'Kisan Registration' },
  { id: 'ration', icon: CreditCard, nameHi: 'राशन कार्ड', nameEn: 'Ration Card' },
  { id: 'other', icon: MoreHorizontal, nameHi: 'अन्य सेवाएं', nameEn: 'Other Services' },
];

export function getServiceById(id: string): Service | undefined {
  return services.find(s => s.id === id);
}
