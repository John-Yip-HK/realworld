export const YOUR_FEED_LINK_NAME = 'your-feed';
export const GLOBAL_FEED_LINK_NAME = 'global-feed';

export const tabs = [
  {
    linkName: YOUR_FEED_LINK_NAME,
    label: 'Your Feed',
    hideIfNoAuthToken: true,
  },
  {
    linkName: GLOBAL_FEED_LINK_NAME,
    label: 'Global Feed',
    hideIfNoAuthToken: false,
  },
];