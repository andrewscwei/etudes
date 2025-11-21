# [21.0.0](https://github.com/andrewscwei/etudes/compare/v20.4.0...v21.0.0) (2025-11-21)


### Features

* Create Form component ([528df4f](https://github.com/andrewscwei/etudes/commit/528df4f6a941af28faed0b416295cdb8075e3416))
* Create useAgent hook ([147b5ff](https://github.com/andrewscwei/etudes/commit/147b5ff418689b7ee4d9be752ba426c29a06eb92))
* Remove ColorSchemeProvider ([75dbafa](https://github.com/andrewscwei/etudes/commit/75dbafacadb92ced717810eab49ea9b003a2ec4b))


### BREAKING CHANGES

* Removed ColorSchemeProvider

# [20.4.0](https://github.com/andrewscwei/etudes/compare/v20.3.0...v20.4.0) (2025-11-13)


### Features

* Optimize useImageLoader ([5dcf3fe](https://github.com/andrewscwei/etudes/commit/5dcf3fe94c2a88213b636ae7266ed0a4322aa50b))

# [20.3.0](https://github.com/andrewscwei/etudes/compare/v20.2.0...v20.3.0) (2025-11-10)


### Features

* Support types in TextField ([3296b5a](https://github.com/andrewscwei/etudes/commit/3296b5aa388bb807667ca6317a4c58207c8fff40))

# [20.2.0](https://github.com/andrewscwei/etudes/compare/v20.1.1...v20.2.0) (2025-11-10)


### Features

* Support optional action for Button ([57533ea](https://github.com/andrewscwei/etudes/commit/57533eab454e0ecdfd4e964feef8f053671b8ced))

## [20.1.1](https://github.com/andrewscwei/etudes/compare/v20.1.0...v20.1.1) (2025-10-29)


### Bug Fixes

* Rename key to cacheKey for ColorSchemeProvider ([a10b535](https://github.com/andrewscwei/etudes/commit/a10b535d40cddcc30e58271cb504320b5ec3b93c))

# [20.1.0](https://github.com/andrewscwei/etudes/compare/v20.0.0...v20.1.0) (2025-10-29)


### Features

* Support optional local storage persistence and custom initial color scheme for ColorSchemeProvider ([9bfe8c8](https://github.com/andrewscwei/etudes/commit/9bfe8c8386366e6ee6d66b86ba195d5646bc9488))

# [20.0.0](https://github.com/andrewscwei/etudes/compare/v19.8.1...v20.0.0) (2025-10-29)


### Bug Fixes

* Clean up class names properly ([8346496](https://github.com/andrewscwei/etudes/commit/8346496f42c6aef17287ec6f73ebfa3c529ae6f6))


### Features

* Create getStyle and setStyle ([97593da](https://github.com/andrewscwei/etudes/commit/97593dae8e60736d10775a8ae3789e6e80c10b86))
* Create NoSSR ([56e06d1](https://github.com/andrewscwei/etudes/commit/56e06d1e6c31a79b124e899273d5864d9ab98a7c))
* Migrate useDocumentClassName to useClassName ([51b203c](https://github.com/andrewscwei/etudes/commit/51b203c5e377578600f850e48595818fe35a05f1))
* Migrate useDocumentStyle to useStyle ([a5debbb](https://github.com/andrewscwei/etudes/commit/a5debbb355637dbf67afefa4df834b75a805ab9c))
* Optimize useDPR ([2df8719](https://github.com/andrewscwei/etudes/commit/2df8719f6229ad74353b847e345f829a4c1ab9fd))
* Rename useMounted to useIsMounted ([fe1040a](https://github.com/andrewscwei/etudes/commit/fe1040af7262de1fc10fa9f12b4a1d9ae26f8bad))
* Update useStyle to target a specific property ([91271fc](https://github.com/andrewscwei/etudes/commit/91271fcd67e3c9d8bb8381f7e5ded6517e3e1192))


### BREAKING CHANGES

* Renamed useMounted to useIsMounted
* Removed useDocumentStyle
* Removed useCSSProperty and useSetCSSProperty

## [19.8.1](https://github.com/andrewscwei/etudes/compare/v19.8.0...v19.8.1) (2025-10-29)


### Bug Fixes

* Fix function signature of useSetCSSProperty ([1a61892](https://github.com/andrewscwei/etudes/commit/1a61892be609a9a285b8394166c7bb8daaaa8dcc))

# [19.8.0](https://github.com/andrewscwei/etudes/compare/v19.7.0...v19.8.0) (2025-10-29)


### Features

* Create useSetCSSProperty ([655e3ed](https://github.com/andrewscwei/etudes/commit/655e3edf32e0d63a777d463afb104b8bd60ffcfa))

# [19.7.0](https://github.com/andrewscwei/etudes/compare/v19.6.0...v19.7.0) (2025-10-23)


### Bug Fixes

* Add missing pure indicators ([99c761b](https://github.com/andrewscwei/etudes/commit/99c761bd1bb675b2e44fa77b8b5c5dfcb4aa427d))


### Features

* Support forwared ref for Button ([17251ae](https://github.com/andrewscwei/etudes/commit/17251ae0caa39383974379ef8ab578665672ddd6))

# [19.6.0](https://github.com/andrewscwei/etudes/compare/v19.5.3...v19.6.0) (2025-10-22)


### Features

* Remove useCSSColor ([7ac32c8](https://github.com/andrewscwei/etudes/commit/7ac32c81bbf2af86119521e8209e2c0f04c9842a))

## [19.5.3](https://github.com/andrewscwei/etudes/compare/v19.5.2...v19.5.3) (2025-10-15)


### Bug Fixes

* Don't format output for FlatSVG ([c0ae8b4](https://github.com/andrewscwei/etudes/commit/c0ae8b4e71b5df17c679ffce1e089321c7eed3ab))

## [19.5.2](https://github.com/andrewscwei/etudes/compare/v19.5.1...v19.5.2) (2025-08-21)


### Bug Fixes

* Fix useRect not accounting for changes in target element position ([78db327](https://github.com/andrewscwei/etudes/commit/78db32719958126d631d228333429b71b8c46853))

## [19.5.1](https://github.com/andrewscwei/etudes/compare/v19.5.0...v19.5.1) (2025-08-15)


### Bug Fixes

* Fix SSR environment for useCSSProperty ([4ff892f](https://github.com/andrewscwei/etudes/commit/4ff892f3d8ec72ae9c98dbf5bb532c815f858295))

# [19.5.0](https://github.com/andrewscwei/etudes/compare/v19.4.0...v19.5.0) (2025-08-14)


### Features

* Remove unnecessary window checks ([5d8f7bf](https://github.com/andrewscwei/etudes/commit/5d8f7bf1a88517958740eb0c0a29847aa07a4766))

# [19.4.0](https://github.com/andrewscwei/etudes/compare/v19.3.0...v19.4.0) (2025-08-14)


### Features

* Add useCSSColor hook ([3015732](https://github.com/andrewscwei/etudes/commit/3015732d48bcb770fa9cd833621d9a45b2b9d013))
* Add useCSSProperty hook ([e7efe45](https://github.com/andrewscwei/etudes/commit/e7efe450e9e6033f7ff08c78138ecdb3ac3e461b))
* Add useDocumentStyle and useDocumentClassName ([36cccd7](https://github.com/andrewscwei/etudes/commit/36cccd7dfb56a547f06a93a07a7f5e6e06a88c64))
* Add useDPR hook ([45542f4](https://github.com/andrewscwei/etudes/commit/45542f4d09fe56dc7bedf9503a1f56e6d80121c0))
* Add useLocalCache and useSessionCache hooks ([a70520f](https://github.com/andrewscwei/etudes/commit/a70520fea49e816dca518164490cf6b5623dfce8))
* Handle absence of ColorSchemeProvider ([97dfd34](https://github.com/andrewscwei/etudes/commit/97dfd3485061c4d31afa8811acf3cf44492553eb))

# [19.3.0](https://github.com/andrewscwei/etudes/compare/v19.2.0...v19.3.0) (2025-08-04)


### Features

* Set font size to 0 for Image and Video ([46e5da4](https://github.com/andrewscwei/etudes/commit/46e5da4af511ff75e436c4872db254a7f6d26469))

# [19.2.0](https://github.com/andrewscwei/etudes/compare/v19.1.1...v19.2.0) (2025-07-30)


### Features

* Make ColorSchemeProvider work in SSR ([5ab3efa](https://github.com/andrewscwei/etudes/commit/5ab3efa9d8288bf0931dd7781df9b24f17ac563c))

## [19.1.1](https://github.com/andrewscwei/etudes/compare/v19.1.0...v19.1.1) (2025-07-04)


### Bug Fixes

* Use display name when NODE_ENV is equal to "development" instead ([49bccd5](https://github.com/andrewscwei/etudes/commit/49bccd5559941bd9bd9c625975591a3701689c4b))

# [19.1.0](https://github.com/andrewscwei/etudes/compare/v19.0.0...v19.1.0) (2025-07-02)


### Features

* Create `useIsTouchDevice` hook and disable dragging in Carousel in touch devices ([5b568a4](https://github.com/andrewscwei/etudes/commit/5b568a4c4a6764f442d37b837e753f11020ac056))

# [19.0.0](https://github.com/andrewscwei/etudes/compare/v18.1.4...v19.0.0) (2025-07-02)


### Build System

* Bump version ([d6b4f9c](https://github.com/andrewscwei/etudes/commit/d6b4f9c1380b942d404e73e360a159abd86593e3))


### BREAKING CHANGES

* `usePosition` now expects a single `onChange` argument, `ScrollPositionProvider` is removed

## [18.1.4](https://github.com/andrewscwei/etudes/compare/v18.1.3...v18.1.4) (2025-07-02)


### Bug Fixes

* Fix smooth snapping into position after dragging ([05d6841](https://github.com/andrewscwei/etudes/commit/05d684199286574df31a8935b65e9f3ee7bdb989))
* Unlock scroll effects when dragging ([4c6e602](https://github.com/andrewscwei/etudes/commit/4c6e6028a91a9f24adcbbc35e1e4deb80b6c9eed))

## [18.1.3](https://github.com/andrewscwei/etudes/compare/v18.1.2...v18.1.3) (2025-07-01)


### Bug Fixes

* Fix missing key in picture sources ([55c4e21](https://github.com/andrewscwei/etudes/commit/55c4e21918c97b01fc6bc8675e40137b2e7da2d1))

## [18.1.2](https://github.com/andrewscwei/etudes/compare/v18.1.1...v18.1.2) (2025-07-01)


### Bug Fixes

* Fix typo for srcSet ([bac7d19](https://github.com/andrewscwei/etudes/commit/bac7d190377b5f16ccda54c16e168ad111f14a61))

## [18.1.1](https://github.com/andrewscwei/etudes/compare/v18.1.0...v18.1.1) (2025-07-01)


### Bug Fixes

* Make inner image of Picture full size ([6affae8](https://github.com/andrewscwei/etudes/commit/6affae804e6208f5c89d01e056d7084b8da84e54))

# [18.1.0](https://github.com/andrewscwei/etudes/compare/v18.0.0...v18.1.0) (2025-07-01)


### Features

* Export ImageSource ([3af4511](https://github.com/andrewscwei/etudes/commit/3af4511917b3ac037558c7a0a197575c15632a7e))

# [18.0.0](https://github.com/andrewscwei/etudes/compare/v17.1.0...v18.0.0) (2025-07-01)


### Features

* Create Picture component ([396c4f6](https://github.com/andrewscwei/etudes/commit/396c4f657edc55ea08678bf4320d867cbd4e8ab1))
* Update PictureDemo ([4b2ac0e](https://github.com/andrewscwei/etudes/commit/4b2ac0e02bb6166c9815d222474e349266c3f68a))


### BREAKING CHANGES

* Changed API for Image component
- `loadingMode` options changed
- removed `srcSet` and `sizes`, migrated to `source instead

# [17.1.0](https://github.com/andrewscwei/etudes/compare/v17.0.0...v17.1.0) (2025-06-27)


### Features

* Support dependency list for useInterval and useTimeout ([724da90](https://github.com/andrewscwei/etudes/commit/724da90110ad018b0dae6d8c3fb808944220dbaf))

# [17.0.0](https://github.com/andrewscwei/etudes/compare/v16.0.3...v17.0.0) (2025-05-20)


### Bug Fixes

* Fix typechecks for anchor button variant ([45b1628](https://github.com/andrewscwei/etudes/commit/45b16284df170f13aba5de56c99444bcad022fef))


### Features

* Remove Link and NavLink support from Button ([35f3413](https://github.com/andrewscwei/etudes/commit/35f341391ac061ff83ab466e312dd6d829dbdf47))
* Remove useSearchState ([2231587](https://github.com/andrewscwei/etudes/commit/2231587f8018e2d826ebedac06936cb2f022c736))


### BREAKING CHANGES

* Link and NavLink no longer supported in Button
* useSearchState hook is removed

## [16.0.3](https://github.com/andrewscwei/etudes/compare/v16.0.2...v16.0.3) (2025-05-20)


### Bug Fixes

* Fix extraneous warnings in asComponentDict ([5fd0189](https://github.com/andrewscwei/etudes/commit/5fd0189badc82fcd12f01b3a8a5a1adf2fd29e13))

## [16.0.2](https://github.com/andrewscwei/etudes/compare/v16.0.1...v16.0.2) (2025-05-20)


### Bug Fixes

* Fix FlatSVG using auto width/height ([bab21d2](https://github.com/andrewscwei/etudes/commit/bab21d23139db6c930bd70290d19fb8efb71dd47))

## [16.0.1](https://github.com/andrewscwei/etudes/compare/v16.0.0...v16.0.1) (2025-05-16)


### Bug Fixes

* Fix missing class name for Slider track ([b7bd35f](https://github.com/andrewscwei/etudes/commit/b7bd35fbc6c0967f00160b40cbb26dd605dec2ae))

# [16.0.0](https://github.com/andrewscwei/etudes/compare/v15.0.0...v16.0.0) (2025-05-16)


### Features

* Change `selected` class to `active` class for Collection ([10ad86b](https://github.com/andrewscwei/etudes/commit/10ad86b1822f5862a1bbc9b65422b32066ec1161))


### BREAKING CHANGES

* Collection `selected` class renamed to `active`

# [15.0.0](https://github.com/andrewscwei/etudes/compare/v14.7.0...v15.0.0) (2025-05-16)


### Features

* Rename on class to active for Toggle ([098b54f](https://github.com/andrewscwei/etudes/commit/098b54fff90369f2045b67f93ce501001418f7f5))


### BREAKING CHANGES

* Renamed on class to active for Toggle

# [14.7.0](https://github.com/andrewscwei/etudes/compare/v14.6.3...v14.7.0) (2025-05-15)


### Features

* Optimize components with useLayoutEffect ([f969893](https://github.com/andrewscwei/etudes/commit/f969893e6998d7f41c7516c5ed9a0326d4088bce))

## [14.6.3](https://github.com/andrewscwei/etudes/compare/v14.6.2...v14.6.3) (2025-05-15)


### Bug Fixes

* Fix toggle knob position ([dd466da](https://github.com/andrewscwei/etudes/commit/dd466da2ef15915ca74ccec4285a742c246c0ec7))

## [14.6.2](https://github.com/andrewscwei/etudes/compare/v14.6.1...v14.6.2) (2025-05-15)


### Bug Fixes

* Account for viewport rect in useRect hook ([f40816b](https://github.com/andrewscwei/etudes/commit/f40816ba4008b0c1c13c80a622576508f59087e6))

## [14.6.1](https://github.com/andrewscwei/etudes/compare/v14.6.0...v14.6.1) (2025-05-15)


### Bug Fixes

* Fix Toggle knob position ([508b7b5](https://github.com/andrewscwei/etudes/commit/508b7b5ac825dd85d53c2763a3e05032ab75582a))

# [14.6.0](https://github.com/andrewscwei/etudes/compare/v14.5.0...v14.6.0) (2025-05-15)


### Features

* Add TextArea component ([97d0796](https://github.com/andrewscwei/etudes/commit/97d07960de6ae6e48935b8716e5afcf152c7de4c))
* Create Select component ([ced3d45](https://github.com/andrewscwei/etudes/commit/ced3d451acc1a810159593357d1db5b68da1a3fb))

# [14.5.0](https://github.com/andrewscwei/etudes/compare/v14.4.1...v14.5.0) (2025-05-15)


### Features

* Add Toggle component ([0fbe683](https://github.com/andrewscwei/etudes/commit/0fbe6837c95aa1b681458c68c551f3747f74a08f))

## [14.4.1](https://github.com/andrewscwei/etudes/compare/v14.4.0...v14.4.1) (2025-05-14)


### Bug Fixes

* Fix position in Dropdown body ([c4d86b0](https://github.com/andrewscwei/etudes/commit/c4d86b0c39f1786a3a6ac3bfe2d329251cacf3b1))

# [14.4.0](https://github.com/andrewscwei/etudes/compare/v14.3.0...v14.4.0) (2025-05-14)


### Bug Fixes

* Fix Carousel not auto advancing ([94f149d](https://github.com/andrewscwei/etudes/commit/94f149d6b4d985d1563171b5dfa8750736fd34e3))


### Features

* Create Styled operator ([e9e22ad](https://github.com/andrewscwei/etudes/commit/e9e22ad7ed8eaabf0e9905b3fe4cd3e3df17c71b))
* Export AccordionSection for styling ([776adc5](https://github.com/andrewscwei/etudes/commit/776adc57182f0ac59019bb5cb4734f5c295593e8))
* Export DropdownCollection ([02654f3](https://github.com/andrewscwei/etudes/commit/02654f34a6fd149bd3c9b2fb79c78e5f9506add0))
* Gracefully handle errors ([b1fc3e2](https://github.com/andrewscwei/etudes/commit/b1fc3e278d0886f25fe1e6fb7c45c25cf8b9cd9b))
* Instead of throwing an error in asComponentDict, gracefully ignore unsupported children ([a028176](https://github.com/andrewscwei/etudes/commit/a02817605b01e404ec44dea4296c3d01d3485d96))

# [14.3.0](https://github.com/andrewscwei/etudes/compare/v14.2.0...v14.3.0) (2025-05-13)


### Features

* Upgrade spase to latest ([028cdff](https://github.com/andrewscwei/etudes/commit/028cdffba6161348225cd44759fb480adeff8a87))

# [14.2.0](https://github.com/andrewscwei/etudes/compare/v14.1.0...v14.2.0) (2025-05-13)


### Features

* Return default context values instead of throwing errors when the provider is not present ([8656dc0](https://github.com/andrewscwei/etudes/commit/8656dc04d18a2c8cc03a7ac869afdf6bb9268d36))

# [14.1.0](https://github.com/andrewscwei/etudes/compare/v14.0.0...v14.1.0) (2025-05-13)


### Bug Fixes

* Fix menu length of Dropdown when layout is grid ([f53e18e](https://github.com/andrewscwei/etudes/commit/f53e18eeb41ebc83d8d60ac27d040661d073e9c3))


### Features

* Support 2-way binding for isCollapsed in Dropdown ([a51fb17](https://github.com/andrewscwei/etudes/commit/a51fb170471907842b2147f8aeac566189f6747e))

# [14.0.0](https://github.com/andrewscwei/etudes/compare/v13.1.0...v14.0.0) (2025-05-13)


### Bug Fixes

* Fix infinite render loop in useSize ([1c3c5ca](https://github.com/andrewscwei/etudes/commit/1c3c5ca8fef50dd8a79302acc4e1dcf1629eb0ab))


### Code Refactoring

* Refactor more hooks ([0bba0b3](https://github.com/andrewscwei/etudes/commit/0bba0b3495414af66fddfa4ff72160298e91efca))


### Features

* Add AccordionItem sub-component to Accordion ([3460676](https://github.com/andrewscwei/etudes/commit/3460676c0e1c6bc255b80f1f06c4adf855302e37))
* Add CollectionItem sub-component to Collection ([9f8d5de](https://github.com/andrewscwei/etudes/commit/9f8d5def63a3fe9b6eeb30d87629510437357261))
* Add support for DropdownItem sub-component ([f7c0b52](https://github.com/andrewscwei/etudes/commit/f7c0b52a069317cee53dfaca7e15d9da48f8a7e4))
* Create useLatest ([713f731](https://github.com/andrewscwei/etudes/commit/713f7314e53c10947ecbe7872819d2c6f536d55e))
* Print component names properly in asComponentDict ([28dd661](https://github.com/andrewscwei/etudes/commit/28dd6619a83e7efb24799a89a5df05d3b80d21ca))
* Remove options in usePrevious ([651ae7f](https://github.com/andrewscwei/etudes/commit/651ae7fe9fab78fd692e4ded7727475c818e2244))


### BREAKING CHANGES

* useDragValue renamed to useIntertiaDragValue

# [13.1.0](https://github.com/andrewscwei/etudes/compare/v13.0.0...v13.1.0) (2025-05-10)


### Features

* Add ColorScheme toggling functions ([15a2be5](https://github.com/andrewscwei/etudes/commit/15a2be5b41f35d3159d05d630215e2bee5ae12d6))

# [13.0.0](https://github.com/andrewscwei/etudes/compare/v12.0.0...v13.0.0) (2025-05-09)


### Bug Fixes

* Fix Dropdown expand and collapse icons interfering with pointer events ([54e7d8a](https://github.com/andrewscwei/etudes/commit/54e7d8a7b58077a70dbf88c3a6a877de7f908775))
* FIx ImageDemo ([0756037](https://github.com/andrewscwei/etudes/commit/07560373ae9c14c4bcafc093182dccef71fe9ad2))
* Fix RangeSlider glitches ([4f78758](https://github.com/andrewscwei/etudes/commit/4f7875888b217d77972540edf6ed59fd5397dd7a))
* Fix RangeSlider knob not snapping into place upon release ([3efd75c](https://github.com/andrewscwei/etudes/commit/3efd75c17c6128c4fe43a79930307a7b38b06d20))
* Fix release transition in RangeSlider ([61ad0ac](https://github.com/andrewscwei/etudes/commit/61ad0acaa320c35ccb0dde04b90e5bde03997f32))
* Fix sliding issue in PanoramaSlider ([f767fc6](https://github.com/andrewscwei/etudes/commit/f767fc69a7e580caa592959adc93d18f54429964))
* Fix unused arg in StepSlider ([e1f42bf](https://github.com/andrewscwei/etudes/commit/e1f42bfc421898d8d73b7c908a54960b75d46d70))


### Code Refactoring

* Optimize useInterval and useTimeout ([029e1ce](https://github.com/andrewscwei/etudes/commit/029e1ced78bc16f640439d2d0346e2c1b1d8bf28))


### Documentation

* Add docs for useSearchState ([28c7562](https://github.com/andrewscwei/etudes/commit/28c75622ef4603dda502a12be99b2ad37c89db56))


### Features

* Add ColorSchemeProvider ([516b87a](https://github.com/andrewscwei/etudes/commit/516b87a1bf694f3d648e96b94bfa6cf48f6e10ba))
* Add knob padding to Slider and StepSlider ([8c0d71c](https://github.com/andrewscwei/etudes/commit/8c0d71cd285d594fc1a41a28992347a1f133af67))
* Create Switch operator component ([e4b1bec](https://github.com/andrewscwei/etudes/commit/e4b1bec2d8f90cef56f71fa00f829ec28da84d08))
* Export SliderKnobContainer ([558668a](https://github.com/andrewscwei/etudes/commit/558668a21a464e1c7770ce033a44f385d0efad8f))
* Export StepSliderKnobContainer ([363984f](https://github.com/andrewscwei/etudes/commit/363984f5c97a182013ad9cd7d77eb93e0e75b30b))
* Support manual transition in RangeSlider ([a788d48](https://github.com/andrewscwei/etudes/commit/a788d485aaf61ea45b335b6ace48039dc0099b88))


### refractor

* Change onPositionChange to onChange for Slider ([62ee5fa](https://github.com/andrewscwei/etudes/commit/62ee5fa2971f1c8c0cbf82fba4063a34a16f803b))


### BREAKING CHANGES

* Slider's onPositionChange is now renamed to onChange
* useInterval API changed
* Renamed useSearchParamState to useSearchState

# [12.0.0](https://github.com/andrewscwei/etudes/compare/v11.4.0...v12.0.0) (2025-05-07)


### Build System

* Improve tree shaking ([d73662f](https://github.com/andrewscwei/etudes/commit/d73662f52f6c843c25a95eefb9fa87738c6d4039))


### BREAKING CHANGES

* Removed barrel exports

# [11.4.0](https://github.com/andrewscwei/etudes/compare/v11.3.0...v11.4.0) (2025-05-06)


### Bug Fixes

* Handle track clicking for StepSlider properly ([aed139d](https://github.com/andrewscwei/etudes/commit/aed139dfc9d9cdc558b2bed544966294a55b397d))


### Features

* Optimize StepSlider ([bc5caff](https://github.com/andrewscwei/etudes/commit/bc5caff7d2df4d3359024bff264aceeed825de00))
* Optimize TextField ([b7b5cca](https://github.com/andrewscwei/etudes/commit/b7b5cca44a4587928292defc184dacafc06c4e1f))

# [11.3.0](https://github.com/andrewscwei/etudes/compare/v11.2.0...v11.3.0) (2025-05-05)


### Bug Fixes

* Remove unused params ([25b07e3](https://github.com/andrewscwei/etudes/commit/25b07e3b2488cf448845e6531a5db1a14a91c9ff))


### Features

* Support clipping for RangeSlider ([b76f100](https://github.com/andrewscwei/etudes/commit/b76f100dccb13e0fb187e3008b43e15eec300adf))
* Support clipping for Slider and StepSlider ([642a997](https://github.com/andrewscwei/etudes/commit/642a997cbe493d8e1635f7efea530f9160736696))

# [11.2.0](https://github.com/andrewscwei/etudes/compare/v11.1.0...v11.2.0) (2025-05-01)


### Features

* Handle any value that evaluates to true or false in Conditional ([4ae0c01](https://github.com/andrewscwei/etudes/commit/4ae0c01215f2b38e36bb361337f205c5ce55acbc))

# [11.1.0](https://github.com/andrewscwei/etudes/compare/v11.0.1...v11.1.0) (2025-05-01)


### Bug Fixes

* Proper effect cleanup for Carousel and useDrag ([4b1855d](https://github.com/andrewscwei/etudes/commit/4b1855d28e6849625962e47f25b04792bbe8ed88))
* **useClickOutside:** Use useCallback for handler ([b8fe879](https://github.com/andrewscwei/etudes/commit/b8fe879e258eee48647d5feb8a822b59a17ec487))


### Features

* **useInertiaDrag:** Add more params to handlers ([edb10db](https://github.com/andrewscwei/etudes/commit/edb10dbe18c6ac7a12070774fbab3c0ed40dab04))

## [11.0.1](https://github.com/andrewscwei/etudes/compare/v11.0.0...v11.0.1) (2025-05-01)


### Bug Fixes

* Fix slider glitches ([996e546](https://github.com/andrewscwei/etudes/commit/996e546efd1ee4668093bca977bd76a137b9334a))
* Optimize callbacks in components using useDragValue ([0f8142f](https://github.com/andrewscwei/etudes/commit/0f8142fabaa94198f27ec64be8c8c5d000ac00ec))

# [11.0.0](https://github.com/andrewscwei/etudes/compare/v10.2.1...v11.0.0) (2025-04-29)


### Code Refactoring

* Rename StepwiseSlider to StepSlider ([a32381f](https://github.com/andrewscwei/etudes/commit/a32381f467a84b3095af3a7990024fc8b6eb9855))
* Update hook names ([b122f92](https://github.com/andrewscwei/etudes/commit/b122f92c977518622f275e85b69c63260a43e9b7))


### BREAKING CHANGES

* Hook names are changed:
- `useClickOutsideEffect` -> `useClickOutside`
- `useDragEffect` -> `useDrag`
- `useDragValueEffect` -> `useDragValue`
- `useLoadImageEffect` -> `useImageLoader`
- `useLoadVideoMetadataEffect` -> `useVideoMetadataLoader`
- `useResizeEffect` -> `useSizeObserver`
- `useScrollPositionEffect` -> `usePosition`
* StepwiseSlider is renamed to StepSlider

## [10.2.1](https://github.com/andrewscwei/etudes/compare/v10.2.0...v10.2.1) (2025-04-28)


### Bug Fixes

* Fix incorrect exposure in Carousel when orientation changes ([42e4afe](https://github.com/andrewscwei/etudes/commit/42e4afe825310bfba5b9c89a629b6145c061191f))

# [10.2.0](https://github.com/andrewscwei/etudes/compare/v10.1.0...v10.2.0) (2025-04-28)


### Features

* Add option to set default param for useSearchParamState ([6169d34](https://github.com/andrewscwei/etudes/commit/6169d3425df54f7988c2de1cbec4eaae7a655837))
* Implement useDropZone ([de9ec71](https://github.com/andrewscwei/etudes/commit/de9ec716d9f59f3aee75be10e3dd7076daabf3a5))

# [10.1.0](https://github.com/andrewscwei/etudes/compare/v10.0.1...v10.1.0) (2025-04-28)


### Bug Fixes

* Don't strip fill-opacity and stroke-opacity in FlatSVG ([235ce0c](https://github.com/andrewscwei/etudes/commit/235ce0c15a2587bd904c2c3f70e633c350516192))
* Fix FOUC for Accordion ([7dad572](https://github.com/andrewscwei/etudes/commit/7dad57265ca00869080e3adb1c1aa1bc9cf5f33f))


### Features

* Add createShallowObjectKey ([64d9132](https://github.com/andrewscwei/etudes/commit/64d9132e22125b654e2691442f950a3565f1bb50))
* Handle NavLink in Button ([e0b7c15](https://github.com/andrewscwei/etudes/commit/e0b7c153b4e10c0b158201b0bbc41b9107444257))
* Implement createKey and createKeyDeep ([a0f91d3](https://github.com/andrewscwei/etudes/commit/a0f91d375c02c0237e30b7a9524a62584cc3f2a6))

## [10.0.1](https://github.com/andrewscwei/etudes/compare/v10.0.0...v10.0.1) (2025-03-29)


### Bug Fixes

* Fix Image ([1a2ace1](https://github.com/andrewscwei/etudes/commit/1a2ace1fac700ea0b06a71835cdeda02139b8419))

# [10.0.0](https://github.com/andrewscwei/etudes/compare/v9.0.0...v10.0.0) (2025-03-21)


### Features

* **Button:** Add `action` prop to Button ([4465705](https://github.com/andrewscwei/etudes/commit/4465705c31bdf61946ae82c8c96d57d43f06b808))


### BREAKING CHANGES

* **Button:** `to`, `href` and `onClick` props are deprecated in Button

# [9.0.0](https://github.com/andrewscwei/etudes/compare/v8.4.1...v9.0.0) (2025-03-19)


### Features

* Add ability to strip style attributes in FlatSVG ([9e2bc00](https://github.com/andrewscwei/etudes/commit/9e2bc00b2f7c089af8fbffc03670c62d462a58e7))
* Migrate TailwindCSS config file to CSS ([96dac7e](https://github.com/andrewscwei/etudes/commit/96dac7e124a7d470617adc954e6ea8e753466ffc))
* Use natural names for TextField properties ([b3557ed](https://github.com/andrewscwei/etudes/commit/b3557ed3491db7e26cc75c4edd68e50d853a3d0e))


### BREAKING CHANGES

* TextField API changes
* Removed shouldStripExtraneousAttributes from FlatSVG

## [8.4.1](https://github.com/andrewscwei/etudes/compare/v8.4.0...v8.4.1) (2025-03-13)


### Bug Fixes

* Explicitly define exports in package.json ([34c244a](https://github.com/andrewscwei/etudes/commit/34c244aa2ba77238525d76e99a8a539b7f3117bb))

# [8.4.0](https://github.com/andrewscwei/etudes/compare/v8.3.0...v8.4.0) (2025-03-13)


### Features

* Clip accordion regions ([6b4da6a](https://github.com/andrewscwei/etudes/commit/6b4da6a145751ba6207e8b306c8b1de03867b085))

# [8.3.0](https://github.com/andrewscwei/etudes/compare/v8.2.0...v8.3.0) (2025-03-13)


### Features

* Support animation when expanding/collapsing Accordion ([1b7123b](https://github.com/andrewscwei/etudes/commit/1b7123b0eaf2a5594fd1832d12d6cdff5f296f5b))

# [8.2.0](https://github.com/andrewscwei/etudes/compare/v8.1.0...v8.2.0) (2025-03-13)


### Features

* Change default fillMode of FlatSVG to 'preserve' ([6918764](https://github.com/andrewscwei/etudes/commit/6918764a57c7a2cbdf77adf94929bdc9c32b539e))

# [8.1.0](https://github.com/andrewscwei/etudes/compare/v8.0.0...v8.1.0) (2025-03-13)


### Features

* Add fillMode to FlatSVG ([ede56f6](https://github.com/andrewscwei/etudes/commit/ede56f6b7695049de66238a46f4fbbbfdbbf2f30))

# [8.0.0](https://github.com/andrewscwei/etudes/compare/v7.3.0...v8.0.0) (2025-03-13)


### Features

* Add conditional HLS support to Video ([080728d](https://github.com/andrewscwei/etudes/commit/080728df521bda1f6e89046b8816e3d504a3c5de))
* Add option to strip positioin and size attributes from FlatSVG ([64dea32](https://github.com/andrewscwei/etudes/commit/64dea322b3a42b2ec72315e7bf3a25e7287bf095))
* Support tree shaking ([4e94604](https://github.com/andrewscwei/etudes/commit/4e94604c2d4ea27b44638f0b6e1b483c0c650923))


### BREAKING CHANGES

* Dependency configuration changes to accommodate tree shaking

# [7.3.0](https://github.com/andrewscwei/etudes/compare/v7.2.1...v7.3.0) (2025-01-26)


### Features

* Create Burger component ([7ff6ae0](https://github.com/andrewscwei/etudes/commit/7ff6ae0ffcfeec0906619bee96561ddba07bae50))

## [7.2.1](https://github.com/andrewscwei/etudes/compare/v7.2.0...v7.2.1) (2025-01-13)


### Bug Fixes

* Update VideoProps ([b4264b4](https://github.com/andrewscwei/etudes/commit/b4264b4a6eec178bb71858ce1155e19e5a0ddc2a))

# [7.2.0](https://github.com/andrewscwei/etudes/compare/v7.1.0...v7.2.0) (2025-01-13)


### Features

* Add handler for time update in Video ([e170083](https://github.com/andrewscwei/etudes/commit/e170083256913b2685ea23a7be66be118033faec))

# [7.1.0](https://github.com/andrewscwei/etudes/compare/v7.0.3...v7.1.0) (2025-01-13)


### Features

* Handle multiple refs in useClickOutsideEffect ([a2a4f4f](https://github.com/andrewscwei/etudes/commit/a2a4f4fa4c35fa292cbdfc353d08d1d3f190f319))

## [7.0.3](https://github.com/andrewscwei/etudes/compare/v7.0.2...v7.0.3) (2025-01-12)


### Bug Fixes

* Remove unnecessary PropsWithChildren ([1970d05](https://github.com/andrewscwei/etudes/commit/1970d054c0cda843af618a3ba4cd2154f76f8e35))

## [7.0.2](https://github.com/andrewscwei/etudes/compare/v7.0.1...v7.0.2) (2024-12-21)


### Bug Fixes

* Fix Counter double rendering ([861678c](https://github.com/andrewscwei/etudes/commit/861678c54657ded92703aecccabe444386358ba8))

## [7.0.1](https://github.com/andrewscwei/etudes/compare/v7.0.0...v7.0.1) (2024-12-21)


### Bug Fixes

* Fix autoscrolling of Carousel ([df4f54c](https://github.com/andrewscwei/etudes/commit/df4f54c43cbbefd30c3b30261354745f5e592ea8))

# [7.0.0](https://github.com/andrewscwei/etudes/compare/v6.3.0...v7.0.0) (2024-12-19)


### Build System

* Upgrade dependencies ([9c07e95](https://github.com/andrewscwei/etudes/commit/9c07e954c09162dd2271c7ef90d7c1f6ea4d4e7b))


### BREAKING CHANGES

* Upgraded to React v19

# [6.3.0](https://github.com/andrewscwei/etudes/compare/v6.2.2...v6.3.0) (2024-10-25)


### Features

* Upgrade Node version, dependencies, and config files ([4d6976d](https://github.com/andrewscwei/etudes/commit/4d6976d8b019e9e18eaa961c91e1ed8148ae629f))

## [6.2.2](https://github.com/andrewscwei/etudes/compare/v6.2.1...v6.2.2) (2024-09-30)


### Bug Fixes

* useTImeout ([ce84b20](https://github.com/andrewscwei/etudes/commit/ce84b207ed14f6bd7a7fcba7be569b498ce9642f))

## [6.2.1](https://github.com/andrewscwei/etudes/compare/v6.2.0...v6.2.1) (2024-09-24)


### Bug Fixes

* Collection padding in Dropdown ([5edf959](https://github.com/andrewscwei/etudes/commit/5edf95957cf3cb18cd4f3eec3d6592016fa6850d))

# [6.2.0](https://github.com/andrewscwei/etudes/compare/v6.1.1...v6.2.0) (2024-09-13)


### Features

* Rename SwipeContainer to SwipeRegion ([3e7d680](https://github.com/andrewscwei/etudes/commit/3e7d6808ace3a4d1b69466adbc0c20dfaf95192d))

## [6.1.1](https://github.com/andrewscwei/etudes/compare/v6.1.0...v6.1.1) (2024-09-12)


### Bug Fixes

* BurgerButton ([042c227](https://github.com/andrewscwei/etudes/commit/042c22703f1a485d824168ade5a978c93f2c97cc))

# [6.1.0](https://github.com/andrewscwei/etudes/compare/v6.0.0...v6.1.0) (2024-09-12)


### Bug Fixes

* Remove `role` from BurgerButton ([7281811](https://github.com/andrewscwei/etudes/commit/7281811952a5f094c689c9b088a6766784ba4239))


### Features

* Add ARIA attributes for FlatSVG ([4844909](https://github.com/andrewscwei/etudes/commit/484490924df9f823a27220a3d9b1a4bc67d2991e))
* Add ARIA attributes to Carousel ([9cce3e3](https://github.com/andrewscwei/etudes/commit/9cce3e3f1142505e05c973cc754118e142f83a73))
* Add ARIA attributes to slider components ([ff5d717](https://github.com/andrewscwei/etudes/commit/ff5d7174d9a4cf122c48b8456c2c151ea9416591))
* Add ARIA attributes to text field components ([d176c17](https://github.com/andrewscwei/etudes/commit/d176c178a40726596faa2bd9a2212445942abec8))
* Add ARIA attributes to tooltip components ([c724ab1](https://github.com/andrewscwei/etudes/commit/c724ab15e15462ad58656ea04c36d09b640eb04f))
* Add ARIA attriutes to button type components ([bbd126b](https://github.com/andrewscwei/etudes/commit/bbd126b8c61111dbbb72e7d69a9f5507d2706a36))
* Add more ARIA attributes ([dcdf386](https://github.com/andrewscwei/etudes/commit/dcdf386eb6e0c188f2d1fb3957d2d94b5cb17e95))
* Make Accordion accessible ([e2c3043](https://github.com/andrewscwei/etudes/commit/e2c3043ddfe07ecc3744c1940ceae51071565ce1))
* Make BurgerButton accessible ([b6e87c7](https://github.com/andrewscwei/etudes/commit/b6e87c7f466641a8945136a73dce36b2eede06e4))
* Remove `data-` attributes ([afcbaa3](https://github.com/andrewscwei/etudes/commit/afcbaa30b4881632e4c2fae7a4192e462f44f56a))

# [6.0.0](https://github.com/andrewscwei/etudes/compare/v5.3.1...v6.0.0) (2024-09-11)


### Bug Fixes

* CI/CD ([386ff78](https://github.com/andrewscwei/etudes/commit/386ff78264ca20adc1a00269e8a4ce66845eb0a8))
* CI/CD ([9fa1fef](https://github.com/andrewscwei/etudes/commit/9fa1fefd1d385994d95d05ae72d819404dbeea4f))


### Features

* Add demo for Counter ([d5d1d89](https://github.com/andrewscwei/etudes/commit/d5d1d892b03c341c89395678aad1aef8d3c1dbdc))
* Add MasonryGrid demo ([85d6a6f](https://github.com/andrewscwei/etudes/commit/85d6a6ff914c2bc0713b9191cbada8966fb52283))
* Add WithTooltipDemo ([67756cd](https://github.com/andrewscwei/etudes/commit/67756cdfefdfe09142af155f8946e2d5fe80b0c3))
* Finalize demo ([ad9e893](https://github.com/andrewscwei/etudes/commit/ad9e893e28961b59b5e052341e34ccbf79418094))
* Optimize BurgerButton for use with class names ([720e42d](https://github.com/andrewscwei/etudes/commit/720e42d3356d26a753af52a94629a03a1446691c))
* Remove default styles from Accordon ([6e1db30](https://github.com/andrewscwei/etudes/commit/6e1db30179dd05cf56481974e041774c598d025c))
* Remove default styles from BurgerButton ([5891017](https://github.com/andrewscwei/etudes/commit/58910172b8253a55f52180c24340273519d94508))
* Remove default styles from Dial ([7d531c4](https://github.com/andrewscwei/etudes/commit/7d531c452dbe1da628c5fc139e3fbd55b750c792))
* Remove default styles from Dropdown ([da074ed](https://github.com/andrewscwei/etudes/commit/da074eda09bd692d5776f4657ad5ba71d44b1996))
* Remove default styles from PanoramaSlider ([d2c30f2](https://github.com/andrewscwei/etudes/commit/d2c30f290e60185f038957f39843375de51363d0))
* Remove default styles from RangeSlider ([181ad6f](https://github.com/andrewscwei/etudes/commit/181ad6f2e1ab517e66951967e8bed0059dc89fdb))
* Remove default styles from Slider ([6a2672b](https://github.com/andrewscwei/etudes/commit/6a2672b66a18e108859b95e56c7bdf9d943b28ed))
* Remove default styles from StepwiseSlider ([9657681](https://github.com/andrewscwei/etudes/commit/9657681920ee4c28be504143764ae5f428ba4b6a))
* Update Collection demo ([90217ba](https://github.com/andrewscwei/etudes/commit/90217ba26ae5c6194b898d47b7871c38bcfa557b))
* Update demo ([c25f571](https://github.com/andrewscwei/etudes/commit/c25f571139b0b76042bc58b98f7c758733b6b255))
* Update demo ([20c8701](https://github.com/andrewscwei/etudes/commit/20c8701d9abc38155ec39c07a35586e08871c8a1))
* Update demo ([151c0f8](https://github.com/andrewscwei/etudes/commit/151c0f87d502885c73c85962644eac209fe04fee))
* Update demo ([e2729b8](https://github.com/andrewscwei/etudes/commit/e2729b8ccf92d118133f21db01cfdb5ae2adae91))
* Update demo for RangeSlider ([25f1fed](https://github.com/andrewscwei/etudes/commit/25f1fed269331bf2ab8a2e09a62780d58d6c8e68))
* Update demo header ([3461394](https://github.com/andrewscwei/etudes/commit/3461394bf32e132065e3ce6c262c1dc57224f9eb))
* Update TailwindCSS config ([5c6228c](https://github.com/andrewscwei/etudes/commit/5c6228c588ad247e5a93f0e39f94ac6188eae067))


### BREAKING CHANGES

* Default styles are removed
* BurgerButton API change

## [5.3.1](https://github.com/andrewscwei/etudes/compare/v5.3.0...v5.3.1) (2024-09-05)

### Bug Fixes

- GitHub Pages ([d9ea507](https://github.com/andrewscwei/etudes/commit/d9ea50728236835495ee63f2ecc704a72615f7bf))

# [5.3.0](https://github.com/andrewscwei/etudes/compare/v5.2.0...v5.3.0) (2024-09-05)

### Features

- Better support for ESM ([13650d9](https://github.com/andrewscwei/etudes/commit/13650d9912fa5218054a0384fc97a0ac04f9e3f8))

# [5.2.0](https://github.com/andrewscwei/etudes/compare/v5.1.0...v5.2.0) (2024-06-22)

### Features

- Fix package and upgrade dependencies ([1261cbb](https://github.com/andrewscwei/etudes/commit/1261cbb026629d7ad069283aae6aa6f53177c14b))

# [5.1.0](https://github.com/andrewscwei/etudes/compare/v5.0.0...v5.1.0) (2024-06-06)

### Features

- Upgrade dependencies and tools ([1d5320c](https://github.com/andrewscwei/etudes/commit/1d5320c306db8d16c565a52c455a58e5244c321a))
