'use client';

import { clsx } from 'clsx';

import styles from './styles.module.scss';
import { useAuthStore } from '@/app/lib/store/useAuthStore';

export default function MainPageBanner() {
  const authToken = useAuthStore((state) => state.authToken);
  
  const hideBannerCls = authToken !== undefined ? styles['banner__hidden'] : undefined;
  const bannerCls = clsx('banner', hideBannerCls);
  
  return (
    <div className={bannerCls}>
      <div className="container">
        <h1 className="logo-font">conduit</h1>
        <p>A place to share your knowledge.</p>
      </div>
    </div>
  )
}