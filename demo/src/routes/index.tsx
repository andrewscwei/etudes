import Home from '../containers/Home';
import MasonryGrid from '../containers/MasonryGrid';

export default [{
  path: '/',
  exact: true,
  component: Home,
}, {
  path: '/masonry-grid',
  exact: true,
  component: MasonryGrid,
}];
