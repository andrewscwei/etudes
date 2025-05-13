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
