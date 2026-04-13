import { useAppStore } from '@/store/appStore';
import { translations } from '@/utils/translations';

export const useTranslation = () => {
  const { jazyk } = useAppStore();
  
  const t = (key: string): string => {
    const keys = key.split('.');
    let result: any = translations[jazyk as keyof typeof translations] || translations['SK'];
    
    for (const k of keys) {
      if (result[k] !== undefined) {
        result = result[k];
      } else {
        // Fallback to SK if missing
        let fallback: any = translations['SK'];
        for (const fk of keys) {
             if (fallback[fk] !== undefined) fallback = fallback[fk];
             else return key;
        }
        return fallback;
      }
    }
    return result as string;
  };

  return { t, jazyk };
};
