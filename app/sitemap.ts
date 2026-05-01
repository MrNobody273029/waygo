import { MetadataRoute } from 'next';import { cars } from '@/lib/sample-data';
export default function sitemap():MetadataRoute.Sitemap{const base=process.env.NEXT_PUBLIC_APP_URL||'http://localhost:3000';return [{url:base,lastModified:new Date()},{url:`${base}/cars`,lastModified:new Date()},...cars.map(c=>({url:`${base}/cars/${c.id}`,lastModified:new Date()}))]}
