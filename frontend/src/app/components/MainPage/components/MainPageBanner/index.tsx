import { clsx } from 'clsx';

import styles from './styles.module.scss';

import { hasAuthCookie } from '@/app/lib/hasAuthCookie';

export default function MainPageBanner() {
  const hasAuthToken = hasAuthCookie();

  const hideBannerCls = hasAuthToken ? styles['banner__hidden'] : undefined;
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