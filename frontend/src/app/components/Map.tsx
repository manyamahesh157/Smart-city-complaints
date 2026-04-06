"use client";
import dynamic from 'next/dynamic';

const Map = dynamic(() => import('./MapUI'), {
  ssr: false
});

export default Map;
