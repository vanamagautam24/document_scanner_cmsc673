import { ImageSourcePropType } from 'react-native';

// types.ts
export interface RecentFile {
    id?: string;
    title: string;
    timestamp: string;
    thumbnail: ImageSourcePropType; 
  }
  