import Home from '../containers/Home';
import MasonryGrid from '../containers/MasonryGrid';
import Video from '../containers/Video';
import VList from '../containers/VList';

export default [{
  path: '/',
  exact: true,
  component: Home,
}, {
  path: '/masonry-grid',
  exact: true,
  component: MasonryGrid,
}, {
  path: '/video',
  exact: true,
  component: Video,
}, {
  path: '/vlist',
  exact: true,
  component: VList,
}];
