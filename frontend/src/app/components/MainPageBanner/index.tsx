import { clsx } from 'clsx';

import styles from './styles.module.scss';

type MainPageBannerProps = {
  hasAuthToken: boolean;
}

export default function MainPageBanner({
  hasAuthToken
}: MainPageBannerProps) {
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