// 0x4d1600 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 418f60=2tc, 456740=2tc, 4b02e0=2, 4cf5f0=2tc, 4d0c60=5c, 53ca90=1, 540a50=3, 5431e0=2, 5444a0=2, 544520=2, 544600=2, 54cdb0=2tc, 5986b0=0t, 5a0590=1tc, 5fd210=1c, 5fea50=2c, 600a50=5, 6e86d0=5t, 849ce0=4tc, 8676f0=0t, 867b50=0t, 8c7560=3tc, 945ff0=0f
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x4d1600, 0x4d165a, 0x4d1676, 0x4d1683, 0x4d168e, 0x4d16a3, 0x4d16bc, 0x4d16d7, 0x4d16dd, 0x4d16ea, 0x4d16f5, 0x4d1700, 0x4d1719, 0x4d1726, 0x4d172e, 0x4d1743, 0x4d1746, 0x4d174e, 0x4d1754, 0x4d177e, 0x4d1785, 0x4d179e, 0x4d17ab, 0x4d17b3, 0x4d17bc, 0x4d17bf, 0x4d17c7, 0x4d17c9, 0x4d17f6, 0x4d17fc, 0x4d1829, 0x4d183d, 0x4d184a, 0x4d185a, 0x4d1865, 0x4d188e, 0x4d18aa, 0x4d18b1, 0x4d18ca, 0x4d18e3, 0x4d18fc, 0x4d1915, 0x4d1929, 0x4d1932, 0x4d1934, 0x4d194d, 0x4d195a, 0x4d1968, 0x4d1978, 0x4d1998, 0x4d19a2, 0x4d19c0, 0x4d19c6, 0x4d19cd, 0x4d19d4, 0x4d19e7, 0x4d19f8, 0x4d1a05, 0x4d1a0d, 0x4d1a13, 0x4d1a6f, 0x4d1a7e, 0x4d1a97, 0x4d1ab0, 0x4d1ac5, 0x4d1ace, 0x4d1ada, 0x4d1ae1, 0x4d1ae9, 0x4d1af1, 0x4d1af9, 0x4d1aff, 0x4d1b2d, 0x4d1b34, 0x4d1b3e, 0x4d1b43, 0x4d1b4b, 0x4d1b6b, 0x4d1b7c, 0x4d1b80, 0x4d1bb4, 0x4d1bc9, 0x4d1bfb, 0x4d1bff, 0x4d1c05, 0x4d1c0b, 0x4d1c11, 0x4d1c15, 0x4d1c29, 0x4d1c31, 0x4d1c33, 0x4d1c64, 0x4d1c81, 0x4d1c97, 0x4d1ca6, 0x4d1cae, 0x4d1cbc, 0x4d1cbe, 0x4d1d12, 0x4d1d20, 0x4d1d2c, 0x4d1d4b, 0x4d1d51, 0x4d1d64, 0x4d1d74, 0x4d1d83, 0x4d1d8d, 0x4d1d98, 0x4d1da9, 0x4d1dbb, 0x4d1dbf, 0x4d1dca, 0x4d1dd2, 0x4d1de4, 0x4d1deb, 0x4d1df2, 0x4d1dfc, 0x4d1e26, 0x4d1e30, 0x4d1e5a, 0x4d1e62, 0x4d1e66, 0x4d1e6e, 0x4d1e7f, 0x4d1e88, 0x4d1e94, 0x4d1ea0, 0x4d1ea8, 0x4d1eb3, 0x4d1ec3, 0x4d1ecc, 0x4d1ef6, 0x4d1f02, 0x4d1f0a, 0x4d1f1b, 0x4d1f24, 0x4d1f2b, 0x4d1f32, 0x4d1f3c, 0x4d1f66, 0x4d1f68, 0x4d1f92, 0x4d1f9e, 0x4d1fa2, 0x4d1faf, 0x4d1fb5, 0x4d1fdf, 0x4d1feb, 0x4d1fef, 0x4d1ffc, 0x4d2002, 0x4d2006, 0x4d2043, 0x4d2052, 0x4d205b, 0x4d2066, 0x4d2077, 0x4d208b, 0x4d208f, 0x4d2099, 0x4d20a2, 0x4d20ed, 0x4d20f9, 0x4d2101, 0x4d210b, 0x4d210f, 0x4d211c, 0x4d2122, 0x4d2124, 0x4d213b, 0x4d2145, 0x4d2154, 0x4d215c, 0x4d2186, 0x4d218c, 0x4d219e, 0x4d21b5, 0x4d21bb, 0x4d21bd, 0x4d222d, 0x4d2237, 0x4d223e, 0x4d2246, 0x4d22a3, 0x4d22b6, 0x4d22c7, 0x4d22d9, 0x4d22ea, 0x4d22fa, 0x4d232e, 0x4d234d, 0x4d2356, 0x4d2369, 0x4d2373, 0x4d2390, 0x4d2399, 0x4d23b9, 0x4d23c1, 0x4d23d8, 0x4d23dc, 0x4d23f2, 0x4d2403, 0x4d240b, 0x4d2410, 0x4d242b, 0x4d2449, 0x4d2462, 0x4d2469, 0x4d2482, 0x4d2499, 0x4d24a1, 0x4d24aa, 0x4d24c4, 0x4d24d0, 0x4d24d5, 0x4d24e4, 0x4d24e8, 0x4d24f3, 0x4d250d, 0x4d250f, 0x4d2516, 0x4d252a, 0x4d2532, 0x4d253f, 0x4d2543, 0x4d2547, 0x4d254b, 0x4d254f, 0x4d255a, 0x4d2574, 0x4d257a, 0x4d257f, 0x4d2585, 0x4d259e, 0x4d25a2, 0x4d25b0, 0x4d25bb, 0x4d25c1, 0x4d25d0, 0x4d25df, 0x4d25ea, 0x4d2603, 0x4d261f, 0x4d2634, 0x4d2638, 0x4d2653, 0x4d265d, 0x4d2661, 0x4d266d, 0x4d2684, 0x4d268f, 0x4d2698, 0x4d26cc, 0x4d26d2, 0x4d26e7, 0x4d270a, 0x4d2714, 0x4d2723, 0x4d272b, 0x4d2773, 0x4d277b, 0x4d2796, 0x4d27a0, 0x4d27af, 0x4d27b7, 0x4d27e7, 0x4d281b, 0x4d2826, 0x4d2832, 0x4d283a, 0x4d2842, 0x4d284a, 0x4d2852, 0x4d285a, 0x4d2862, 0x4d286a, 0x4d2872, 0x4d287e, 0x4d2887, 0x4d2891, 0x4d289d, 0x4d28ac, 0x4d28bb, 0x4d28d5, 0x4d28e7, 0x4d28eb, 0x4d28f4, 0x4d28fe, 0x4d290b, 0x4d291c, 0x4d2929, 0x4d2931, 0x4d294d, 0x4d29a3, 0x4d29a9, 0x4d29b4, 0x4d29c3, 0x4d29ca, 0x4d29d5, 0x4d29e0, 0x4d29eb, 0x4d29f6, 0x4d2a16, 0x4d2a23, 0x4d2a4a, 0x4d2a50, 0x4d2a6a, 0x4d2a78, 0x4d2a9f, 0x4d2aa5, 0x4d2aaf, 0x4d2ab7, 0x4d2ade, 0x4d2ae4, 0x4d2afe, 0x4d2b0c, 0x4d2b33, 0x4d2b39, 0x4d2b43, 0x4d2b50, 0x4d2b77, 0x4d2b7d, 0x4d2b97, 0x4d2ba0, 0x4d2bc7, 0x4d2bcd, 0x4d2bd7, 0x4d2bdf, 0x4d2c06, 0x4d2c0c, 0x4d2c26, 0x4d2c2f, 0x4d2c56, 0x4d2c5c, 0x4d2c66, 0x4d2c6e, 0x4d2c95, 0x4d2c9b, 0x4d2cb5, 0x4d2cbe, 0x4d2ce5, 0x4d2ceb, 0x4d2cf5, 0x4d2d00, 0x4d2d0a, 0x4d2d15, 0x4d2d35, 0x4d2d3e, 0x4d2d4a, 0x4d2d4c, 0x4d2d5f, 0x4d2d6d, 0x4d2d7d, 0x4d2d82, 0x4d2d8a, 0x4d2db1, 0x4d2db7, 0x4d2dd1, 0x4d2ddf, 0x4d2e06, 0x4d2e0c, 0x4d2e16, 0x4d2e1e, 0x4d2e45, 0x4d2e4b, 0x4d2e65, 0x4d2e73, 0x4d2e9a, 0x4d2ea0, 0x4d2eaa, 0x4d2eb9, 0x4d2edd, 0x4d2eee, 0x4d2eff, 0x4d2f0c, 0x4d2f17, 0x4d2f23, 0x4d2f32, 0x4d2f3e, 0x4d2f46, 0x4d2f6d, 0x4d2f73, 0x4d2f91, 0x4d2fa5, 0x4d2fcc, 0x4d2fd2, 0x4d2fdc, 0x4d2fe5, 0x4d2ff2, 0x4d2ff4, 0x4d3007, 0x4d3015, 0x4d3025, 0x4d302a, 0x4d3032, 0x4d305f, 0x4d3068, 0x4d3082, 0x4d3090, 0x4d30b7, 0x4d30bd, 0x4d30c7, 0x4d30cf, 0x4d30db, 0x4d30dd, 0x4d30f0, 0x4d3103, 0x4d312a, 0x4d3130, 0x4d313a, 0x4d3142, 0x4d314c, 0x4d3159, 0x4d316a, 0x4d3172, 0x4d318e, 0x4d31e4, 0x4d31ea, 0x4d31f5, 0x4d3204, 0x4d320b, 0x4d3216, 0x4d3221, 0x4d322c, 0x4d3239, 0x4d3260, 0x4d3266, 0x4d3280, 0x4d328b, 0x4d32b2, 0x4d32b8, 0x4d32c2, 0x4d32c6, 0x4d32e4, 0x4d330b, 0x4d3311, 0x4d332b, 0x4d3334, 0x4d335b, 0x4d3361, 0x4d336b, 0x4d337a, 0x4d3385, 0x4d3390, 0x4d33b0, 0x4d33bd, 0x4d33e4, 0x4d33ea, 0x4d3404, 0x4d3412, 0x4d3439, 0x4d343f, 0x4d3449, 0x4d3451, 0x4d3478, 0x4d347e, 0x4d3498, 0x4d34a6, 0x4d34cd, 0x4d34d3, 0x4d34dd, 0x4d34e5, 0x4d350c, 0x4d3512, 0x4d352c, 0x4d353a, 0x4d3561, 0x4d3567, 0x4d3571, 0x4d3591, 0x4d35a4, 0x4d35c0, 0x4d35d2, 0x4d35de, 0x4d35ef, 0x4d35f8, 0x4d3601, 0x4d3628, 0x4d362e, 0x4d3648, 0x4d3656, 0x4d367d, 0x4d3683, 0x4d368d, 0x4d3696, 0x4d36a2, 0x4d36a4, 0x4d36b7, 0x4d36c5, 0x4d36ec, 0x4d36f2, 0x4d36fc, 0x4d3704, 0x4d372b, 0x4d3731, 0x4d374b, 0x4d3759, 0x4d3780, 0x4d3786, 0x4d3790, 0x4d3798, 0x4d37bf, 0x4d37c5, 0x4d37df, 0x4d37f2, 0x4d3819, 0x4d381f, 0x4d3826, 0x4d382a, 0x4d3830, 0x4d3838, 0x4d3855, 0x4d3880, 0x4d3882, 0x4d3886, 0x4d3891, 0x4d38a0, 0x4d38ae, 0x4d38c0, 0x4d38d3, 0x4d38ef, 0x4d39a4, 0x4d39a9, 0x4d39cc, 0x4d39d2, 0x4d39db, 0x4d39e0, 0x4d39e9, 0x4d39f2, 0x4d39f7, 0x4d3a00, 0x4d3a05, 0x4d3a0e, 0x4d3a13, 0x4d3a1c, 0x4d3a21, 0x4d3a28, 0x4d3a31, 0x4d3a3f, 0x4d3a47, 0x4d3a5a, 0x4d3a63, 0x4d3a6c, 0x4d3a75, 0x4d3a7a, 0x4d3a83, 0x4d3a88, 0x4d3a91, 0x4d3a96, 0x4d3a9d, 0x4d3aa6, 0x4d3ab4, 0x4d3abc, 0x4d3ae3, 0x4d3aec, 0x4d3af5, 0x4d3afe, 0x4d3b03, 0x4d3b0c, 0x4d3b11, 0x4d3b1a, 0x4d3b1f, 0x4d3b26, 0x4d3b2f, 0x4d3b53, 0x4d3b57, 0x4d3b7b, 0x4d3b80, 0x4d3b88, 0x4d3b91, 0x4d3b95, 0x4d3b9e, 0x4d3ba5, 0x4d3bad, 0x4d3bb7, 0x4d3bda, 0x4d3be1, 0x4d3bee, 0x4d3bf8, 0x4d3c1e, 0x4d3c25, 0x4d3c2d, 0x4d3c35, 0x4d3c3b, 0x4d3c3f, 0x4d3c59, 0x4d3c5b, 0x4d3c61, 0x4d3c6b, 0x4d3c85, 0x4d3c8d, 0x4d3c94, 0x4d3c9c, 0x4d3ca6, 0x4d3cad, 0x4d3cc2, 0x4d3cd4, 0x4d3cee, 0x4d3cfa, 0x4d3d17, 0x4d3d21, 0x4d3d57, 0x4d3d61, 0x4d3d6b, 0x4d3d88, 0x4d3d97, 0x4d3d9f, 0x4d3da9, 0x4d3dab, 0x4d3db2, 0x4d3dba, 0x4d3dc1, 0x4d3dcd, 0x4d3dde, 0x4d3de3, 0x4d3e11, 0x4d3e13, 0x4d3e5d, 0x4d3e67, 0x4d3e76, 0x4d3e7c, 0x4d3e92, 0x4d3e97, 0x4d3e9d, 0x4d3ec2, 0x4d3ec8, 0x4d3ee8, 0x4d3ef7, 0x4d3eff, 0x4d3f14, 0x4d3f1c, 0x4d3f31, 0x4d3f3c, 0x4d3f51, 0x4d3f5d, 0x4d3f72, 0x4d3f77, 0x4d3f8c, 0x4d3f9a, 0x4d3fa0, 0x4d3fab, 0x4d3fc0, 0x4d3fcb, 0x4d3fe9, 0x4d3ff5, 0x4d3ff9, 0x4d4004, 0x4d400e, 0x4d4015, 0x4d4019, 0x4d402a, 0x4d402e, 0x4d4043, 0x4d4045, 0x4d404d, 0x4d405c, 0x4d4063, 0x4d4075, 0x4d4080, 0x4d4092, 0x4d409d, 0x4d40af, 0x4d40ba, 0x4d40cc, 0x4d40d7, 0x4d40e5, 0x4d40ed, 0x4d40fb, 0x4d4103, 0x4d4111, 0x4d4119, 0x4d4127, 0x4d412f, 0x4d413d, 0x4d4145, 0x4d414d, 0x4d4155, 0x4d4159, 0x4d416b, 0x4d4177, 0x4d417f, 0x4d418f, 0x4d41bc, 0x4d41c7, 0x4d41e2, 0x4d41ed, 0x4d41f1, 0x4d41fd, 0x4d4201, 0x4d4209, 0x4d4223, 0x4d422a, 0x4d4239, 0x4d4240, 0x4d424c, 0x4d424e]);
const CH = new Uint8Array([0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 6, 6, 7, 7, 7, 7, 7, 7, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 9, 9, 9, 9, 9, 9, 9, 9, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 11, 11, 11, 11, 11, 11, 11, 12, 12, 12, 12, 12, 12, 12, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 16, 16, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 17, 17, 17, 18, 18, 18, 18, 18, 18, 18, 18, 19, 19, 19, 19, 19, 19, 19, 19, 20, 20, 20, 20, 20, 20, 20, 20, 20, 21, 21, 21, 21, 21, 22, 22, 22, 22, 22, 22, 23, 23, 23, 23, 23, 23, 23, 24, 24, 24, 24, 24, 24, 24, 24, 24, 25, 25, 25, 25, 25, 25, 25, 25, 25, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 28, 28, 28, 28, 28, 28, 28, 28, 28, 29, 29, 29, 29, 29, 29, 29, 29, 30, 30, 30, 30, 30, 30, 30, 31, 31, 31, 31, 31, 31, 32, 32, 32, 32, 32, 32, 32, 32, 32, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 34, 34, 34, 34, 34, 34, 34, 34, 35, 35, 35, 35, 35, 35, 35, 36, 36, 36, 36, 36, 36, 36, 36, 37, 37, 37, 37, 37, 37, 37, 37, 38, 38, 38, 38, 38, 38, 38, 38, 39, 39, 39, 39, 39, 39, 39, 39, 40, 40, 40, 40, 40, 40, 40, 40, 41, 41, 41, 41, 41, 41, 41, 41, 41, 41, 42, 42, 42, 42, 42, 42, 42, 42, 42, 43, 43, 43, 43, 43, 43, 43, 43, 44, 44, 44, 44, 44, 44, 44, 44, 44, 45, 45, 45, 45, 45, 45, 45, 45, 46, 46, 46, 46, 46, 46, 46, 46, 46, 46, 46, 47, 47, 47, 47, 47, 47, 47, 47, 47, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 49, 49, 49, 49, 49, 49, 50, 50, 50, 50, 50, 50, 50, 50, 51, 51, 51, 51, 51, 51, 51, 51, 51, 52, 52, 52, 52, 52, 52, 52, 52, 53, 53, 53, 53, 53, 53, 53, 53, 54, 54, 54, 54, 54, 54, 54, 54, 55, 55, 55, 55, 55, 55, 55, 55, 56, 56, 56, 56, 56, 56, 56, 56, 56, 57, 57, 57, 57, 57, 57, 57, 57, 57, 57, 58, 58, 58, 58, 58, 58, 58, 58, 59, 59, 59, 59, 59, 59, 59, 59, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 61, 61, 61, 61, 61, 61, 62, 62, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 63, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 64, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 65, 66, 66, 66, 66, 66, 66, 66, 66, 66, 66, 67, 67, 67, 67, 67, 67, 67, 67, 67, 68, 68, 68, 68, 68, 68, 68, 68, 68, 68, 69, 69, 69, 69, 69, 69, 69, 69, 70, 70, 70, 70, 70, 70, 70, 71, 71, 71, 71, 71, 71, 71, 71, 71, 71, 71, 72, 72, 72, 72, 72, 72, 73, 73, 73, 73, 73, 73, 73, 73, 73, 74, 74, 74, 74, 74, 74, 74, 74, 74, 74, 75, 75, 75, 75, 75, 75, 75, 75, 75, 75, 75, 76, 76, 76, 76, 76, 76, 76, 76, 76, 76, 76, 76, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 77, 78, 78, 78, 78, 78, 78, 78, 78, 78, 78, 79, 79, 79, 79, 79, 79, 79, 79, 79, 79, 79, 80]);
function f_4d1600_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 4d1600
        R.esp = (R.sub((R.esp >>> 0), 0x7c, 32)) | 0; // 4d1600: sub esp, 0x7c
        R.push((R.ebx >>> 0)); // 4d1603: push ebx
        R.push((R.ebp >>> 0)); // 4d1604: push ebp
        R.ebp = (R.m.u32(((R.esp + 0x88) | 0) >>> 0)) | 0; // 4d1605: mov ebp, dword ptr [esp + 0x88]
        R.push((R.esi >>> 0)); // 4d160c: push esi
        R.logic((R.ebp >>> 0) & (R.ebp >>> 0), 32); // 4d160d: test ebp, ebp
        R.push((R.edi >>> 0)); // 4d160f: push edi
        R.m.w32(((R.esp + 0x2c) | 0) >>> 0, (R.ecx >>> 0)); // 4d1610: mov dword ptr [esp + 0x2c], ecx
        R.m.w32(((R.esp + 0x4c) | 0) >>> 0, 0x0); // 4d1614: mov dword ptr [esp + 0x4c], 0
        R.m.w32(((R.esp + 0x50) | 0) >>> 0, 0x3ff00000); // 4d161c: mov dword ptr [esp + 0x50], 0x3ff00000
        R.m.w32(((R.esp + 0x74) | 0) >>> 0, 0x0); // 4d1624: mov dword ptr [esp + 0x74], 0
        R.m.w32(((R.esp + 0x78) | 0) >>> 0, 0x3ff00000); // 4d162c: mov dword ptr [esp + 0x78], 0x3ff00000
        R.m.w32(((R.esp + 0x44) | 0) >>> 0, 0x0); // 4d1634: mov dword ptr [esp + 0x44], 0
        R.m.w32(((R.esp + 0x48) | 0) >>> 0, 0x3ff00000); // 4d163c: mov dword ptr [esp + 0x48], 0x3ff00000
        R.m.w32(((R.esp + 0x54) | 0) >>> 0, 0x0); // 4d1644: mov dword ptr [esp + 0x54], 0
        R.m.w32(((R.esp + 0x58) | 0) >>> 0, 0x3ff00000); // 4d164c: mov dword ptr [esp + 0x58], 0x3ff00000
        if (R.zf) { pc = 694; continue; } // 4d1654: je 0x4d424c
        pc = 1; continue;
      case 1: // 4d165a
        R.esi = (R.m.u32(((R.esp + 0x98) | 0) >>> 0)) | 0; // 4d165a: mov esi, dword ptr [esp + 0x98]
        R.push((R.ebp >>> 0)); // 4d1661: push ebp
        R.push((R.esi >>> 0)); // 4d1662: push esi
        R.call(0x4cf5f0, { n: 2, thisEcx: true, calleeClean: true }); // 4d1663: call 0x4cf5f0
        R.edi = ((R.eax >>> 0)) | 0; // 4d1668: mov edi, eax
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 4d166a: test edi, edi
        R.m.w32(((R.esp + 0x18) | 0) >>> 0, (R.edi >>> 0)); // 4d166c: mov dword ptr [esp + 0x18], edi
        if (R.zf) { pc = 694; continue; } // 4d1670: je 0x4d424c
        pc = 2; continue;
      case 2: // 4d1676
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.edi + 0x35) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d1676: mov al, byte ptr [edi + 0x35]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0x3f, 8)) & 0xff) << 0)) | 0; // 4d1679: and al, 0x3f
        R.sub(((R.eax >>> 0) & 0xff), 0x2, 8); // 4d167b: cmp al, 2
        if (!R.zf) { pc = 694; continue; } // 4d167d: jne 0x4d424c
        pc = 3; continue;
      case 3: // 4d1683
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.edi + 0x49) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d1683: mov al, byte ptr [edi + 0x49]
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 4d1686: test al, al
        if (!R.zf) { pc = 694; continue; } // 4d1688: jne 0x4d424c
        pc = 4; continue;
      case 4: // 4d168e
        R.push(0x0); // 4d168e: push 0
        R.push(0x0); // 4d1690: push 0
        R.push(0x1); // 4d1692: push 1
        R.push(0x1); // 4d1694: push 1
        R.push((R.ebp >>> 0)); // 4d1696: push ebp
        R.call(0x600a50, { n: 5, thisEcx: false, calleeClean: false }); // 4d1697: call 0x600a50
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 4d169c: add esp, 0x14
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d169f: test eax, eax
        if (R.zf) { pc = 9; continue; } // 4d16a1: je 0x4d16ea
        pc = 5; continue;
      default: return pc;
    }
  }
}
function f_4d1600_1(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 5: // 4d16a3
        R.push((R.ebp >>> 0)); // 4d16a3: push ebp
        R.call(0x53ca90, { n: 1, thisEcx: false, calleeClean: false }); // 4d16a4: call 0x53ca90
        R.ecx = (R.m.u32(((0xb63c98) | 0) >>> 0)) | 0; // 4d16a9: mov ecx, dword ptr [0xb63c98]
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 4d16af: add esp, 4
        R.push((R.eax >>> 0)); // 4d16b2: push eax
        R.call(0x5fd210, { n: 1, thisEcx: false, calleeClean: true }); // 4d16b3: call 0x5fd210
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d16b8: test eax, eax
        if (R.zf) { pc = 9; continue; } // 4d16ba: je 0x4d16ea
        pc = 6; continue;
      case 6: // 4d16bc
        R.push((R.ebp >>> 0)); // 4d16bc: push ebp
        R.call(0x53ca90, { n: 1, thisEcx: false, calleeClean: false }); // 4d16bd: call 0x53ca90
        R.ecx = (R.m.u32(((0xb63c98) | 0) >>> 0)) | 0; // 4d16c2: mov ecx, dword ptr [0xb63c98]
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 4d16c8: add esp, 4
        R.push((R.eax >>> 0)); // 4d16cb: push eax
        R.push(0x0); // 4d16cc: push 0
        R.call(0x5fea50, { n: 2, thisEcx: false, calleeClean: true }); // 4d16ce: call 0x5fea50
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 4d16d3: test al, al
        if (R.zf) { pc = 9; continue; } // 4d16d5: je 0x4d16ea
        pc = 7; continue;
      case 7: // 4d16d7
        R.logic(R.m.u8(((R.edi + 0x4e) | 0) >>> 0) & 0x4, 8); // 4d16d7: test byte ptr [edi + 0x4e], 4
        if (!R.zf) { pc = 9; continue; } // 4d16db: jne 0x4d16ea
        pc = 8; continue;
      case 8: // 4d16dd
        R.eax = (R.m.u32(((R.esi + 0x52) | 0) >>> 0)) | 0; // 4d16dd: mov eax, dword ptr [esi + 0x52]
        R.edi = (R.pop()) | 0; // 4d16e0: pop edi
        R.esi = (R.pop()) | 0; // 4d16e1: pop esi
        R.ebp = (R.pop()) | 0; // 4d16e2: pop ebp
        R.ebx = (R.pop()) | 0; // 4d16e3: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x7c, 32)) | 0; // 4d16e4: add esp, 0x7c
        R.rv = R.ret(6); return -1; // 4d16e7: ret 0x18
      case 9: // 4d16ea
        R.ecx = (R.m.u32(((R.ebp + 0x57) | 0) >>> 0)) | 0; // 4d16ea: mov ecx, dword ptr [ebp + 0x57]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 4d16ed: test ecx, ecx
        if (R.zf) { pc = 19; continue; } // 4d16ef: je 0x4d177e
        pc = 10; continue;
      case 10: // 4d16f5
        R.eax = (R.m.u32(((R.ebp + 0x53) | 0) >>> 0)) | 0; // 4d16f5: mov eax, dword ptr [ebp + 0x53]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d16f8: test eax, eax
        if (R.zf) { pc = 28; continue; } // 4d16fa: je 0x4d17f6
        pc = 11; continue;
      case 11: // 4d1700
        R.edx = (((R.m.u8(((R.eax + 0x7e) | 0) >>> 0)) << 24 >> 24)) | 0; // 4d1700: movsx edx, byte ptr [eax + 0x7e]
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, (R.edx >>> 0)); // 4d1704: mov dword ptr [esp + 0x34], edx
        R.fpush(R.m.s32(((R.esp + 0x34) | 0) >>> 0)); // 4d1708: fild dword ptr [esp + 0x34]
        R.fcom(R.st[0], 1.0); // 4d170c: fcom qword ptr [0x967890]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d1712: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d1714: test ah, 1
        if (!R.zf) { pc = 13; continue; } // 4d1717: jne 0x4d1726
        pc = 12; continue;
      case 12: // 4d1719
        R.fcom(R.st[0], 3.0); // 4d1719: fcom qword ptr [0x968930]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d171f: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 4d1721: test ah, 0x41
        if (!R.zf) { pc = 14; continue; } // 4d1724: jne 0x4d172e
        pc = 13; continue;
      default: return pc;
    }
  }
}
function f_4d1600_2(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 13: // 4d1726
        R.fpop(); // 4d1726: fstp st(0)
        R.fpush(3.0); // 4d1728: fld qword ptr [0x968930]
        pc = 14; continue;
      case 14: // 4d172e
        R.st[0] = R.st[0] + 1.0; // 4d172e: fadd qword ptr [0x967890]
        R.eax = (((R.m.u8(((R.ebp + 0x64) | 0) >>> 0)) << 24 >> 24)) | 0; // 4d1734: movsx eax, byte ptr [ebp + 0x64]
        R.st[0] = R.st[0] * 0.5; // 4d1738: fmul qword ptr [0x968968]
        R.eax = (R.sub((R.eax >>> 0), 0x2, 32)) | 0; // 4d173e: sub eax, 2
        if (R.zf) { pc = 17; continue; } // 4d1741: je 0x4d174e
        pc = 15; continue;
      case 15: // 4d1743
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 4d1743: dec eax
        if (!R.zf) { pc = 18; continue; } // 4d1744: jne 0x4d1754
        pc = 16; continue;
      case 16: // 4d1746
        R.st[0] = R.st[0] * 7.5; // 4d1746: fmul qword ptr [0x968eb0]
        pc = 18; continue; // 4d174c: jmp 0x4d1754
      case 17: // 4d174e
        R.st[0] = R.st[0] * 4.0; // 4d174e: fmul qword ptr [0x968938]
        pc = 18; continue;
      case 18: // 4d1754
        R.eax = (((R.m.u16(((R.ecx + 0x69) | 0) >>> 0)) << 16 >> 16)) | 0; // 4d1754: movsx eax, word ptr [ecx + 0x69]
        { const p = BigInt((((R.eax >>> 0)) | 0)) * BigInt((((R.eax >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.eax = (Number(BigInt.asIntN(32, p))) | 0; } // 4d1758: imul eax, eax
        R.ecx = (((R.m.u16(((R.ebp + 0x80) | 0) >>> 0)) << 16 >> 16)) | 0; // 4d175b: movsx ecx, word ptr [ebp + 0x80]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 4d1762: lea eax, [eax + eax*4]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 4d1765: lea eax, [eax + eax*4]
        R.eax = (R.add((R.eax >>> 0), (R.ecx >>> 0), 32)) | 0; // 4d1768: add eax, ecx
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, (R.eax >>> 0)); // 4d176a: mov dword ptr [esp + 0x34], eax
        R.fpush(R.m.s32(((R.esp + 0x34) | 0) >>> 0)); // 4d176e: fild dword ptr [esp + 0x34]
        { const t = R.st[0]; R.st[0] = R.st[1]; R.st[1] = t; } // 4d1772: fxch st(1)
        R.st[0] = R.st[0] * 1000.0; // 4d1774: fmul qword ptr [0x968908]
        R.st[1] = R.st[1] / R.st[0]; R.fpop(); // 4d177a: fdivp st(1)
        pc = 29; continue; // 4d177c: jmp 0x4d17fc
      case 19: // 4d177e
        R.ecx = (R.m.u32(((R.ebp + 0x53) | 0) >>> 0)) | 0; // 4d177e: mov ecx, dword ptr [ebp + 0x53]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 4d1781: test ecx, ecx
        if (R.zf) { pc = 28; continue; } // 4d1783: je 0x4d17f6
        pc = 20; continue;
      case 20: // 4d1785
        R.edx = (((R.m.u8(((R.ecx + 0x7e) | 0) >>> 0)) << 24 >> 24)) | 0; // 4d1785: movsx edx, byte ptr [ecx + 0x7e]
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, (R.edx >>> 0)); // 4d1789: mov dword ptr [esp + 0x34], edx
        R.fpush(R.m.s32(((R.esp + 0x34) | 0) >>> 0)); // 4d178d: fild dword ptr [esp + 0x34]
        R.fcom(R.st[0], 1.0); // 4d1791: fcom qword ptr [0x967890]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d1797: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d1799: test ah, 1
        if (!R.zf) { pc = 22; continue; } // 4d179c: jne 0x4d17ab
        pc = 21; continue;
      case 21: // 4d179e
        R.fcom(R.st[0], 3.0); // 4d179e: fcom qword ptr [0x968930]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d17a4: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 4d17a6: test ah, 0x41
        if (!R.zf) { pc = 23; continue; } // 4d17a9: jne 0x4d17b3
        pc = 22; continue;
      case 22: // 4d17ab
        R.fpop(); // 4d17ab: fstp st(0)
        R.fpush(3.0); // 4d17ad: fld qword ptr [0x968930]
        pc = 23; continue;
      default: return pc;
    }
  }
}
function f_4d1600_3(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 23: // 4d17b3
        R.eax = (((R.m.u8(((R.ebp + 0x64) | 0) >>> 0)) << 24 >> 24)) | 0; // 4d17b3: movsx eax, byte ptr [ebp + 0x64]
        R.eax = (R.sub((R.eax >>> 0), 0x2, 32)) | 0; // 4d17b7: sub eax, 2
        if (R.zf) { pc = 26; continue; } // 4d17ba: je 0x4d17c7
        pc = 24; continue;
      case 24: // 4d17bc
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 4d17bc: dec eax
        if (!R.zf) { pc = 27; continue; } // 4d17bd: jne 0x4d17c9
        pc = 25; continue;
      case 25: // 4d17bf
        R.st[0] = R.st[0] * 7.5; // 4d17bf: fmul qword ptr [0x968eb0]
        pc = 27; continue; // 4d17c5: jmp 0x4d17c9
      case 26: // 4d17c7
        R.st[0] = R.st[0] + R.st[0]; // 4d17c7: fadd st(0), st(0)
        pc = 27; continue;
      case 27: // 4d17c9
        R.eax = (((R.m.u8(((R.ecx + 0x85) | 0) >>> 0)) << 24 >> 24)) | 0; // 4d17c9: movsx eax, byte ptr [ecx + 0x85]
        { const p = BigInt((((R.eax >>> 0)) | 0)) * BigInt((((R.eax >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.eax = (Number(BigInt.asIntN(32, p))) | 0; } // 4d17d0: imul eax, eax
        R.ecx = (((R.m.u16(((R.ebp + 0x80) | 0) >>> 0)) << 16 >> 16)) | 0; // 4d17d3: movsx ecx, word ptr [ebp + 0x80]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 4d17da: lea eax, [eax + eax*4]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 4d17dd: lea eax, [eax + eax*4]
        R.eax = (R.add((R.eax >>> 0), (R.ecx >>> 0), 32)) | 0; // 4d17e0: add eax, ecx
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, (R.eax >>> 0)); // 4d17e2: mov dword ptr [esp + 0x34], eax
        R.fpush(R.m.s32(((R.esp + 0x34) | 0) >>> 0)); // 4d17e6: fild dword ptr [esp + 0x34]
        { const t = R.st[0]; R.st[0] = R.st[1]; R.st[1] = t; } // 4d17ea: fxch st(1)
        R.st[0] = R.st[0] * 1000.0; // 4d17ec: fmul qword ptr [0x968908]
        R.st[1] = R.st[1] / R.st[0]; R.fpop(); // 4d17f2: fdivp st(1)
        pc = 29; continue; // 4d17f4: jmp 0x4d17fc
      case 28: // 4d17f6
        R.fpush(1.0); // 4d17f6: fld qword ptr [0x967890]
        pc = 29; continue;
      case 29: // 4d17fc
        R.st[0] = 20.0 - R.st[0]; // 4d17fc: fsubr qword ptr [0x968ea8]
        R.fpush(R.st[0]); // 4d1802: fld st(0)
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 4d1804: fmulp st(1)
        R.st[0] = R.st[0] * 0.2; // 4d1806: fmul qword ptr [0x968918]
        R.st[0] = R.st[0] * 0.016666666666666666; // 4d180c: fmul qword ptr [0x968958]
        R.st[0] = 1.0 - R.st[0]; // 4d1812: fsubr qword ptr [0x967890]
        R.fcom(R.st[0], 0.1); // 4d1818: fcom qword ptr [0x967880]
        R.m.wf64(((R.esp + 0x64) | 0) >>> 0, R.st[0]); // 4d181e: fst qword ptr [esp + 0x64]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d1822: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d1824: test ah, 1
        if (R.zf) { pc = 31; continue; } // 4d1827: je 0x4d183d
        pc = 30; continue;
      case 30: // 4d1829
        R.fpop(); // 4d1829: fstp st(0)
        R.m.w32(((R.esp + 0x64) | 0) >>> 0, 0x9999999a); // 4d182b: mov dword ptr [esp + 0x64], 0x9999999a
        R.m.w32(((R.esp + 0x68) | 0) >>> 0, 0x3fb99999); // 4d1833: mov dword ptr [esp + 0x68], 0x3fb99999
        pc = 33; continue; // 4d183b: jmp 0x4d185a
      case 31: // 4d183d
        R.fcom(R.st[0], 1.1); R.fpop(); // 4d183d: fcomp qword ptr [0x9689c0]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d1843: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 4d1845: test ah, 0x41
        if (!R.zf) { pc = 33; continue; } // 4d1848: jne 0x4d185a
        pc = 32; continue;
      case 32: // 4d184a
        R.m.w32(((R.esp + 0x64) | 0) >>> 0, 0x9999999a); // 4d184a: mov dword ptr [esp + 0x64], 0x9999999a
        R.m.w32(((R.esp + 0x68) | 0) >>> 0, 0x3ff19999); // 4d1852: mov dword ptr [esp + 0x68], 0x3ff19999
        pc = 33; continue;
      default: return pc;
    }
  }
}
function f_4d1600_4(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 33: // 4d185a
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi + 0x18) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d185a: mov al, byte ptr [esi + 0x18]
        R.sub(((R.eax >>> 0) & 0xff), 0x1c, 8); // 4d185d: cmp al, 0x1c
        R.m.w8(((R.esp + 0x10) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 4d185f: mov byte ptr [esp + 0x10], al
        if (R.cLE) { pc = 35; continue; } // 4d1863: jle 0x4d188e
        pc = 34; continue;
      case 34: // 4d1865
        R.edx = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 4d1865: movsx edx, al
        R.edx = (R.sub((R.edx >>> 0), 0x1c, 32)) | 0; // 4d1868: sub edx, 0x1c
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, (R.edx >>> 0)); // 4d186b: mov dword ptr [esp + 0x34], edx
        R.fpush(R.m.s32(((R.esp + 0x34) | 0) >>> 0)); // 4d186f: fild dword ptr [esp + 0x34]
        R.st[0] = R.st[0] * 0.1; // 4d1873: fmul qword ptr [0x967880]
        R.st[0] = 1.0 - R.st[0]; // 4d1879: fsubr qword ptr [0x967890]
        R.fpush(2.0); // 4d187f: fld qword ptr [0x968950]
        R.call(0x945ff0, { n: 0, thisEcx: false, calleeClean: false, float: true }); // 4d1885: call 0x945ff0
        R.m.wf64(((R.esp + 0x74) | 0) >>> 0, R.st[0]); R.fpop(); // 4d188a: fstp qword ptr [esp + 0x74]
        pc = 35; continue;
      case 35: // 4d188e
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.edi + 0x4f) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d188e: mov al, byte ptr [edi + 0x4f]
        R.ebx = ((R.ebx & 0xffff0000) | (((((R.m.u8(((R.edi + 0x3d) | 0) >>> 0)) << 24 >> 24)) & 0xffff) << 0)) | 0; // 4d1891: movsx bx, byte ptr [edi + 0x3d]
        R.eax = ((R.eax & 0xffffff00) | (((R.shr(((R.eax >>> 0) & 0xff), 0x4, 8)) & 0xff) << 0)) | 0; // 4d1896: shr al, 4
        R.eax = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 4d1899: movsx eax, al
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 4d189c: dec eax
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.ebx >>> 0)); // 4d189d: mov dword ptr [esp + 0x24], ebx
        R.sub((R.eax >>> 0), 0x6, 32); // 4d18a1: cmp eax, 6
        if (!R.cBE) { pc = 43; continue; } // 4d18a4: ja 0x4d1932
        pc = 36; continue;
      case 36: // 4d18aa
        pc = [37, 39, 40, 38, 39, 41, 42][R.eax >>> 0] ?? -2; continue; // 4d18aa: jmp dword ptr [eax*4 + 0x4d4258]
      case 37: // 4d18b1
        R.ecx = (((((R.ebx >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 4d18b1: movsx ecx, bx
        R.eax = (0x4b) | 0; // 4d18b4: mov eax, 0x4b
        R.edx = (0x0) | 0; // 4d18b9: mov edx, 0
        R.eax = (R.sub((R.eax >>> 0), (R.ecx >>> 0), 32)) | 0; // 4d18be: sub eax, ecx
        R.edx = ((R.edx & 0xffffff00) | (((R.sf ? 1 : 0) & 0xff) << 0)) | 0; // 4d18c0: sets dl
        R.edx = (R.incdec((R.edx >>> 0), -1, 32)) | 0; // 4d18c3: dec edx
        R.edx = (R.logic((R.edx >>> 0) & (R.eax >>> 0), 32)) | 0; // 4d18c4: and edx, eax
        R.esi = ((R.edx >>> 0)) | 0; // 4d18c6: mov esi, edx
        pc = 44; continue; // 4d18c8: jmp 0x4d1934
      case 38: // 4d18ca
        R.ecx = (((((R.ebx >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 4d18ca: movsx ecx, bx
        R.eax = (0x19) | 0; // 4d18cd: mov eax, 0x19
        R.edx = (0x0) | 0; // 4d18d2: mov edx, 0
        R.eax = (R.sub((R.eax >>> 0), (R.ecx >>> 0), 32)) | 0; // 4d18d7: sub eax, ecx
        R.edx = ((R.edx & 0xffffff00) | (((R.sf ? 1 : 0) & 0xff) << 0)) | 0; // 4d18d9: sets dl
        R.edx = (R.incdec((R.edx >>> 0), -1, 32)) | 0; // 4d18dc: dec edx
        R.edx = (R.logic((R.edx >>> 0) & (R.eax >>> 0), 32)) | 0; // 4d18dd: and edx, eax
        R.esi = ((R.edx >>> 0)) | 0; // 4d18df: mov esi, edx
        pc = 44; continue; // 4d18e1: jmp 0x4d1934
      case 39: // 4d18e3
        R.ecx = (((((R.ebx >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 4d18e3: movsx ecx, bx
        R.eax = (0x32) | 0; // 4d18e6: mov eax, 0x32
        R.edx = (0x0) | 0; // 4d18eb: mov edx, 0
        R.eax = (R.sub((R.eax >>> 0), (R.ecx >>> 0), 32)) | 0; // 4d18f0: sub eax, ecx
        R.edx = ((R.edx & 0xffffff00) | (((R.sf ? 1 : 0) & 0xff) << 0)) | 0; // 4d18f2: sets dl
        R.edx = (R.incdec((R.edx >>> 0), -1, 32)) | 0; // 4d18f5: dec edx
        R.edx = (R.logic((R.edx >>> 0) & (R.eax >>> 0), 32)) | 0; // 4d18f6: and edx, eax
        R.esi = ((R.edx >>> 0)) | 0; // 4d18f8: mov esi, edx
        pc = 44; continue; // 4d18fa: jmp 0x4d1934
      default: return pc;
    }
  }
}
function f_4d1600_5(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 40: // 4d18fc
        R.ecx = (((((R.ebx >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 4d18fc: movsx ecx, bx
        R.eax = (0x28) | 0; // 4d18ff: mov eax, 0x28
        R.edx = (0x0) | 0; // 4d1904: mov edx, 0
        R.eax = (R.sub((R.eax >>> 0), (R.ecx >>> 0), 32)) | 0; // 4d1909: sub eax, ecx
        R.edx = ((R.edx & 0xffffff00) | (((R.sf ? 1 : 0) & 0xff) << 0)) | 0; // 4d190b: sets dl
        R.edx = (R.incdec((R.edx >>> 0), -1, 32)) | 0; // 4d190e: dec edx
        R.edx = (R.logic((R.edx >>> 0) & (R.eax >>> 0), 32)) | 0; // 4d190f: and edx, eax
        R.esi = ((R.edx >>> 0)) | 0; // 4d1911: mov esi, edx
        pc = 44; continue; // 4d1913: jmp 0x4d1934
      case 41: // 4d1915
        R.eax = (((((R.ebx >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 4d1915: movsx eax, bx
        R.eax = (R.neg((R.eax >>> 0), 32)) | 0; // 4d1918: neg eax
        R.ecx = (0x0) | 0; // 4d191a: mov ecx, 0
        R.ecx = ((R.ecx & 0xffffff00) | (((R.sf ? 1 : 0) & 0xff) << 0)) | 0; // 4d191f: sets cl
        R.ecx = (R.incdec((R.ecx >>> 0), -1, 32)) | 0; // 4d1922: dec ecx
        R.ecx = (R.logic((R.ecx >>> 0) & (R.eax >>> 0), 32)) | 0; // 4d1923: and ecx, eax
        R.esi = ((R.ecx >>> 0)) | 0; // 4d1925: mov esi, ecx
        pc = 44; continue; // 4d1927: jmp 0x4d1934
      case 42: // 4d1929
        R.ebx = (0xffffff9c) | 0; // 4d1929: mov ebx, 0xffffff9c
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.ebx >>> 0)); // 4d192e: mov dword ptr [esp + 0x24], ebx
        pc = 43; continue;
      case 43: // 4d1932
        R.esi = (R.logic((R.esi >>> 0) ^ (R.esi >>> 0), 32)) | 0; // 4d1932: xor esi, esi
        pc = 44; continue;
      case 44: // 4d1934
        R.edx = (R.m.u32(((R.esp + 0x98) | 0) >>> 0)) | 0; // 4d1934: mov edx, dword ptr [esp + 0x98]
        R.ecx = (R.m.u32(((0xad9c6c) | 0) >>> 0)) | 0; // 4d193b: mov ecx, dword ptr [0xad9c6c]
        R.push(0x1); // 4d1941: push 1
        R.push((R.edx >>> 0)); // 4d1943: push edx
        R.call(0x418f60, { n: 2, thisEcx: true, calleeClean: true }); // 4d1944: call 0x418f60
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 4d1949: test al, al
        if (R.zf) { pc = 52; continue; } // 4d194b: je 0x4d19c6
        pc = 45; continue;
      case 45: // 4d194d
        R.push((R.ebp >>> 0)); // 4d194d: push ebp
        R.call(0x53ca90, { n: 1, thisEcx: false, calleeClean: false }); // 4d194e: call 0x53ca90
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 4d1953: add esp, 4
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d1956: test eax, eax
        if (!R.zf) { pc = 47; continue; } // 4d1958: jne 0x4d1968
        pc = 46; continue;
      case 46: // 4d195a
        R.esi = (R.logic((R.esi >>> 0) ^ (R.esi >>> 0), 32)) | 0; // 4d195a: xor esi, esi
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, 0xffffff9c); // 4d195c: mov dword ptr [esp + 0x24], 0xffffff9c
        R.ebx = ((R.ebx & 0xffffff00) | (((R.logic(((R.ebx >>> 0) & 0xff) ^ ((R.ebx >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 4d1964: xor bl, bl
        pc = 53; continue; // 4d1966: jmp 0x4d19cd
      case 47: // 4d1968
        R.push((R.ebp >>> 0)); // 4d1968: push ebp
        R.call(0x53ca90, { n: 1, thisEcx: false, calleeClean: false }); // 4d1969: call 0x53ca90
        R.ecx = (R.m.u32(((R.eax + 0x69) | 0) >>> 0)) | 0; // 4d196e: mov ecx, dword ptr [eax + 0x69]
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 4d1971: add esp, 4
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 4d1974: test ecx, ecx
        if (R.zf) { pc = 51; continue; } // 4d1976: je 0x4d19c0
        pc = 48; continue;
      default: return pc;
    }
  }
}
function f_4d1600_6(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 48: // 4d1978
        R.push((R.ebp >>> 0)); // 4d1978: push ebp
        R.esi = (((((R.ebx >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 4d1979: movsx esi, bx
        R.call(0x53ca90, { n: 1, thisEcx: false, calleeClean: false }); // 4d197c: call 0x53ca90
        R.eax = (R.m.u32(((R.eax + 0x69) | 0) >>> 0)) | 0; // 4d1981: mov eax, dword ptr [eax + 0x69]
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 4d1984: add esp, 4
        R.eax = (((R.m.u8(((R.eax + 0x14) | 0) >>> 0)) << 24 >> 24)) | 0; // 4d1987: movsx eax, byte ptr [eax + 0x14]
        R.ecx = ((R.eax >>> 0)) | 0; // 4d198b: mov ecx, eax
        R.ecx = (R.neg((R.ecx >>> 0), 32)) | 0; // 4d198d: neg ecx
        R.ecx = (R.shl((R.ecx >>> 0), 0x2, 32)) | 0; // 4d198f: shl ecx, 2
        R.ecx = (R.sub((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 4d1992: sub ecx, eax
        R.sub((R.esi >>> 0), (R.ecx >>> 0), 32); // 4d1994: cmp esi, ecx
        if (!R.cL) { pc = 50; continue; } // 4d1996: jge 0x4d19a2
        pc = 49; continue;
      case 49: // 4d1998
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.esi >>> 0)); // 4d1998: mov dword ptr [esp + 0x24], esi
        R.esi = (R.logic((R.esi >>> 0) ^ (R.esi >>> 0), 32)) | 0; // 4d199c: xor esi, esi
        R.ebx = ((R.ebx & 0xffffff00) | (((R.logic(((R.ebx >>> 0) & 0xff) ^ ((R.ebx >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 4d199e: xor bl, bl
        pc = 53; continue; // 4d19a0: jmp 0x4d19cd
      case 50: // 4d19a2
        R.push((R.ebp >>> 0)); // 4d19a2: push ebp
        R.call(0x53ca90, { n: 1, thisEcx: false, calleeClean: false }); // 4d19a3: call 0x53ca90
        R.edx = (R.m.u32(((R.eax + 0x69) | 0) >>> 0)) | 0; // 4d19a8: mov edx, dword ptr [eax + 0x69]
        R.esp = (R.add((R.esp >>> 0), 0x4, 32)) | 0; // 4d19ab: add esp, 4
        R.eax = ((R.eax & 0xffff0000) | (((((R.m.u8(((R.edx + 0x14) | 0) >>> 0)) << 24 >> 24)) & 0xffff) << 0)) | 0; // 4d19ae: movsx ax, byte ptr [edx + 0x14]
        R.ecx = ((R.eax >>> 0)) | 0; // 4d19b3: mov ecx, eax
        R.ecx = (R.neg((R.ecx >>> 0), 32)) | 0; // 4d19b5: neg ecx
        R.ecx = (R.shl((R.ecx >>> 0), 0x2, 32)) | 0; // 4d19b7: shl ecx, 2
        R.ecx = (R.sub((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 4d19ba: sub ecx, eax
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.ecx >>> 0)); // 4d19bc: mov dword ptr [esp + 0x24], ecx
        pc = 51; continue;
      case 51: // 4d19c0
        R.esi = (R.logic((R.esi >>> 0) ^ (R.esi >>> 0), 32)) | 0; // 4d19c0: xor esi, esi
        R.ebx = ((R.ebx & 0xffffff00) | (((R.logic(((R.ebx >>> 0) & 0xff) ^ ((R.ebx >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 4d19c2: xor bl, bl
        pc = 53; continue; // 4d19c4: jmp 0x4d19cd
      case 52: // 4d19c6
        R.ebx = ((R.ebx & 0xffffff00) | (((R.m.u8(((R.esp + 0xa0) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d19c6: mov bl, byte ptr [esp + 0xa0]
        pc = 53; continue;
      case 53: // 4d19cd
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.edi + 0x44) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d19cd: mov al, byte ptr [edi + 0x44]
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 4d19d0: test al, al
        if (R.cLE) { pc = 55; continue; } // 4d19d2: jle 0x4d19e7
        pc = 54; continue;
      case 54: // 4d19d4
        R.eax = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 4d19d4: movsx eax, al
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, (R.eax >>> 0)); // 4d19d7: mov dword ptr [esp + 0x34], eax
        R.fpush(R.m.s32(((R.esp + 0x34) | 0) >>> 0)); // 4d19db: fild dword ptr [esp + 0x34]
        R.st[0] = R.st[0] * 0.0033333333333333335; // 4d19df: fmul qword ptr [0x968e60]
        pc = 56; continue; // 4d19e5: jmp 0x4d19f8
      case 55: // 4d19e7
        R.ecx = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 4d19e7: movsx ecx, al
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, (R.ecx >>> 0)); // 4d19ea: mov dword ptr [esp + 0x34], ecx
        R.fpush(R.m.s32(((R.esp + 0x34) | 0) >>> 0)); // 4d19ee: fild dword ptr [esp + 0x34]
        R.st[0] = R.st[0] * 0.007462686567164179; // 4d19f2: fmul qword ptr [0x969090]
        pc = 56; continue;
      default: return pc;
    }
  }
}
function f_4d1600_7(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 56: // 4d19f8
        R.st[0] = R.st[0] + 1.0; // 4d19f8: fadd qword ptr [0x967890]
        R.eax = (R.m.u32(((R.edi + 0x45) | 0) >>> 0)) | 0; // 4d19fe: mov eax, dword ptr [edi + 0x45]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d1a01: test eax, eax
        if (!R.zf) { pc = 58; continue; } // 4d1a03: jne 0x4d1a0d
        pc = 57; continue;
      case 57: // 4d1a05
        R.st[0] = R.st[0] * 1.2; // 4d1a05: fmul qword ptr [0x968978]
        pc = 59; continue; // 4d1a0b: jmp 0x4d1a13
      case 58: // 4d1a0d
        R.st[0] = R.st[0] * 0.8333333333333334; // 4d1a0d: fmul qword ptr [0x969088]
        pc = 59; continue;
      case 59: // 4d1a13
        R.edi = (R.m.u32(((R.esp + 0x98) | 0) >>> 0)) | 0; // 4d1a13: mov edi, dword ptr [esp + 0x98]
        R.m.wf64(((R.esp + 0x84) | 0) >>> 0, R.st[0]); R.fpop(); // 4d1a1a: fstp qword ptr [esp + 0x84]
        R.ecx = (R.m.u32(((R.edi + 0x61) | 0) >>> 0)) | 0; // 4d1a21: mov ecx, dword ptr [edi + 0x61]
        R.eax = (((R.m.u16(((R.ecx + 0xb) | 0) >>> 0)) << 16 >> 16)) | 0; // 4d1a24: movsx eax, word ptr [ecx + 0xb]
        R.edx = R.eax < 0 ? -1 : 0; // 4d1a28: cdq 
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 4d1a29: sub eax, edx
        R.edx = ((R.edx & 0xffff0000) | (((R.m.u16(((R.ecx + 0x7) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 4d1a2b: mov dx, word ptr [ecx + 7]
        { const p = BigInt(((((R.edx >>> 0) & 0xffff)) << 16 >> 16)) * BigInt(25); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.edx = ((R.edx & 0xffff0000) | (((Number(BigInt.asIntN(32, p))) & 0xffff) << 0)) | 0; } // 4d1a2f: imul dx, dx, 0x19
        R.eax = (R.sar((R.eax >>> 0), 0x1, 32)) | 0; // 4d1a33: sar eax, 1
        R.eax = (R.add((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 4d1a35: add eax, edx
        R.push((R.eax >>> 0)); // 4d1a37: push eax
        R.eax = (R.m.u32(((R.ebp + 0xcf) | 0) >>> 0)) | 0; // 4d1a38: mov eax, dword ptr [ebp + 0xcf]
        R.push(0x1); // 4d1a3e: push 1
        R.push((R.ebp >>> 0)); // 4d1a40: push ebp
        R.push((R.edi >>> 0)); // 4d1a41: push edi
        R.push((R.eax >>> 0)); // 4d1a42: push eax
        R.call(0x6e86d0, { n: 5, thisEcx: true, calleeClean: false }); // 4d1a43: call 0x6e86d0
        R.ecx = (R.m.u32(((R.esp + 0x40) | 0) >>> 0)) | 0; // 4d1a48: mov ecx, dword ptr [esp + 0x40]
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 4d1a4c: add esp, 0x14
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, (R.eax >>> 0)); // 4d1a4f: mov dword ptr [esp + 0x20], eax
        R.push(0x0); // 4d1a53: push 0
        R.push((R.eax >>> 0)); // 4d1a55: push eax
        R.push(0x0); // 4d1a56: push 0
        R.push((R.ebp >>> 0)); // 4d1a58: push ebp
        R.push((R.edi >>> 0)); // 4d1a59: push edi
        R.call(0x4d0c60, { n: 5, thisEcx: false, calleeClean: true }); // 4d1a5a: call 0x4d0c60
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d1a5f: test eax, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.eax >>> 0)); // 4d1a61: mov dword ptr [esp + 0x14], eax
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.eax >>> 0)); // 4d1a65: mov dword ptr [esp + 0x1c], eax
        if (R.zf) { pc = 694; continue; } // 4d1a69: je 0x4d424c
        pc = 60; continue;
      case 60: // 4d1a6f
        R.edi = (R.m.u32(((R.esp + 0x9c) | 0) >>> 0)) | 0; // 4d1a6f: mov edi, dword ptr [esp + 0x9c]
        R.logic(((R.ebx >>> 0) & 0xff) & ((R.ebx >>> 0) & 0xff), 8); // 4d1a76: test bl, bl
        if (R.zf) { pc = 79; continue; } // 4d1a78: je 0x4d1b80
        pc = 61; continue;
      case 61: // 4d1a7e
        R.push(0x0); // 4d1a7e: push 0
        R.push(0x0); // 4d1a80: push 0
        R.push(0x1); // 4d1a82: push 1
        R.push(0x0); // 4d1a84: push 0
        R.push((R.ebp >>> 0)); // 4d1a86: push ebp
        R.call(0x600a50, { n: 5, thisEcx: false, calleeClean: false }); // 4d1a87: call 0x600a50
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 4d1a8c: add esp, 0x14
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d1a8f: test eax, eax
        if (!R.zf) { pc = 79; continue; } // 4d1a91: jne 0x4d1b80
        pc = 62; continue;
      default: return pc;
    }
  }
}
function f_4d1600_8(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 62: // 4d1a97
        R.ebx = (R.m.u32(((R.esp + 0x98) | 0) >>> 0)) | 0; // 4d1a97: mov ebx, dword ptr [esp + 0x98]
        R.push((R.eax >>> 0)); // 4d1a9e: push eax
        R.push((R.ebx >>> 0)); // 4d1a9f: push ebx
        R.call(0x544520, { n: 2, thisEcx: false, calleeClean: false }); // 4d1aa0: call 0x544520
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 4d1aa5: add esp, 8
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d1aa8: test eax, eax
        if (!R.zf) { pc = 79; continue; } // 4d1aaa: jne 0x4d1b80
        pc = 63; continue;
      case 63: // 4d1ab0
        R.ecx = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 4d1ab0: mov ecx, dword ptr [esp + 0x18]
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ecx + 0x4f) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d1ab4: mov al, byte ptr [ecx + 0x4f]
        R.ecx = ((R.ecx & 0xffffff00) | (((((R.eax >>> 0) & 0xff)) & 0xff) << 0)) | 0; // 4d1ab7: mov cl, al
        R.ecx = ((R.ecx & 0xffffff00) | (((R.logic(((R.ecx >>> 0) & 0xff) & 0xf0, 8)) & 0xff) << 0)) | 0; // 4d1ab9: and cl, 0xf0
        R.sub(((R.ecx >>> 0) & 0xff), 0x70, 8); // 4d1abc: cmp cl, 0x70
        if (R.zf) { pc = 79; continue; } // 4d1abf: je 0x4d1b80
        pc = 64; continue;
      case 64: // 4d1ac5
        R.sub(((R.ecx >>> 0) & 0xff), 0x80, 8); // 4d1ac5: cmp cl, 0x80
        if (R.zf) { pc = 79; continue; } // 4d1ac8: je 0x4d1b80
        pc = 65; continue;
      case 65: // 4d1ace
        R.eax = ((R.eax & 0xffffff00) | (((R.shr(((R.eax >>> 0) & 0xff), 0x4, 8)) & 0xff) << 0)) | 0; // 4d1ace: shr al, 4
        R.eax = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 4d1ad1: movsx eax, al
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 4d1ad4: dec eax
        R.sub((R.eax >>> 0), 0x4, 32); // 4d1ad5: cmp eax, 4
        if (!R.cBE) { pc = 70; continue; } // 4d1ad8: ja 0x4d1af9
        pc = 66; continue;
      case 66: // 4d1ada
        pc = [70, 67, 69, 68, 68][R.eax >>> 0] ?? -2; continue; // 4d1ada: jmp dword ptr [eax*4 + 0x4d4274]
      case 67: // 4d1ae1
        R.fpush(6.0); // 4d1ae1: fld dword ptr [0x969084]
        pc = 71; continue; // 4d1ae7: jmp 0x4d1aff
      case 68: // 4d1ae9
        R.fpush(3.5); // 4d1ae9: fld dword ptr [0x969080]
        pc = 71; continue; // 4d1aef: jmp 0x4d1aff
      case 69: // 4d1af1
        R.fpush(5.5); // 4d1af1: fld dword ptr [0x96907c]
        pc = 71; continue; // 4d1af7: jmp 0x4d1aff
      case 70: // 4d1af9
        R.fpush(7.5); // 4d1af9: fld dword ptr [0x969078]
        pc = 71; continue;
      case 71: // 4d1aff
        R.edx = (R.logic((R.edx >>> 0) ^ (R.edx >>> 0), 32)) | 0; // 4d1aff: xor edx, edx
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 4d1b01: xor eax, eax
        R.edx = ((R.edx & 0xffff0000) | (((R.m.u16(((R.ebx + 0x40) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 4d1b03: mov dx, word ptr [ebx + 0x40]
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((0xae2c92) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 4d1b07: mov ax, word ptr [0xae2c92]
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 4d1b0d: sub eax, edx
        R.edx = (((R.m.u16(((R.ebx + 0x3e) | 0) >>> 0)) << 16 >> 16)) | 0; // 4d1b0f: movsx edx, word ptr [ebx + 0x3e]
        R.ecx = (((R.eax + R.eax * 8) | 0)) | 0; // 4d1b13: lea ecx, [eax + eax*8]
        R.eax = (((R.eax + R.ecx * 8) | 0)) | 0; // 4d1b16: lea eax, [eax + ecx*8]
        R.ecx = (((R.m.u16(((0xae2c90) | 0) >>> 0)) << 16 >> 16)) | 0; // 4d1b19: movsx ecx, word ptr [0xae2c90]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 4d1b20: lea eax, [eax + eax*4]
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 4d1b23: sub eax, edx
        R.eax = (R.add((R.eax >>> 0), (R.ecx >>> 0), 32)) | 0; // 4d1b25: add eax, ecx
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, (R.eax >>> 0)); // 4d1b27: mov dword ptr [esp + 0x28], eax
        if (R.sf) { pc = 75; continue; } // 4d1b2b: js 0x4d1b43
        pc = 72; continue;
      default: return pc;
    }
  }
}
function f_4d1600_9(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 72: // 4d1b2d
        R.sub((R.eax >>> 0), 0x16d, 32); // 4d1b2d: cmp eax, 0x16d
        if (R.cLE) { pc = 74; continue; } // 4d1b32: jle 0x4d1b3e
        pc = 73; continue;
      case 73: // 4d1b34
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, 0x16d); // 4d1b34: mov dword ptr [esp + 0x28], 0x16d
        pc = 76; continue; // 4d1b3c: jmp 0x4d1b4b
      case 74: // 4d1b3e
        R.sub((R.eax >>> 0), 0x79, 32); // 4d1b3e: cmp eax, 0x79
        if (!R.cLE) { pc = 76; continue; } // 4d1b41: jg 0x4d1b4b
        pc = 75; continue;
      case 75: // 4d1b43
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, 0x79); // 4d1b43: mov dword ptr [esp + 0x28], 0x79
        pc = 76; continue;
      case 76: // 4d1b4b
        R.fpush(R.m.s32(((R.esp + 0x28) | 0) >>> 0)); // 4d1b4b: fild dword ptr [esp + 0x28]
        R.fpush(R.st[1]); // 4d1b4f: fld st(1)
        R.st[0] = R.st[0] - 1.0; // 4d1b51: fsub qword ptr [0x967890]
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 4d1b57: test edi, edi
        R.st[0] = 365.0 / R.st[0]; // 4d1b59: fdivr qword ptr [0x969070]
        R.st[1] = R.st[1] / R.st[0]; R.fpop(); // 4d1b5f: fdivp st(1)
        R.st[0] = R.st[1] - R.st[0]; // 4d1b61: fsubr st(1)
        R.m.wf64(((R.esp + 0x4c) | 0) >>> 0, R.st[0]); R.fpop(); // 4d1b63: fstp qword ptr [esp + 0x4c]
        R.fpop(); // 4d1b67: fstp st(0)
        if (R.zf) { pc = 79; continue; } // 4d1b69: je 0x4d1b80
        pc = 77; continue;
      case 77: // 4d1b6b
        R.fpush(R.f64(((R.esp + 0x4c) | 0))); // 4d1b6b: fld qword ptr [esp + 0x4c]
        R.fcom(R.st[0], 2.0); R.fpop(); // 4d1b6f: fcomp qword ptr [0x968950]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d1b75: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 4d1b77: test ah, 0x41
        if (!R.zf) { pc = 79; continue; } // 4d1b7a: jne 0x4d1b80
        pc = 78; continue;
      case 78: // 4d1b7c
        R.m.w8(((R.edi + 0x1) | 0) >>> 0, R.logic(R.m.u8(((R.edi + 0x1) | 0) >>> 0) | 0x1, 8)); // 4d1b7c: or byte ptr [edi + 1], 1
        pc = 79; continue;
      case 79: // 4d1b80
        R.ebx = (R.m.u32(((R.esp + 0x24) | 0) >>> 0)) | 0; // 4d1b80: mov ebx, dword ptr [esp + 0x24]
        R.eax = (((((R.esi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 4d1b84: movsx eax, si
        R.edx = R.eax < 0 ? -1 : 0; // 4d1b87: cdq 
        R.ecx = (((((R.ebx >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 4d1b88: movsx ecx, bx
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 4d1b8b: sub eax, edx
        R.m.w32(((R.esp + 0x2c) | 0) >>> 0, (R.ecx >>> 0)); // 4d1b8d: mov dword ptr [esp + 0x2c], ecx
        R.eax = (R.sar((R.eax >>> 0), 0x1, 32)) | 0; // 4d1b91: sar eax, 1
        R.sub(((R.ebx >>> 0) & 0xffff), 0x32, 16); // 4d1b93: cmp bx, 0x32
        R.esi = (((R.eax + R.ecx) | 0)) | 0; // 4d1b97: lea esi, [eax + ecx]
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, (R.esi >>> 0)); // 4d1b9a: mov dword ptr [esp + 0x34], esi
        R.fpush(R.m.s32(((R.esp + 0x34) | 0) >>> 0)); // 4d1b9e: fild dword ptr [esp + 0x34]
        R.st[0] = R.st[0] * 0.01167; // 4d1ba2: fmul qword ptr [0x969068]
        R.st[0] = R.st[0] + 1.4165; // 4d1ba8: fadd qword ptr [0x969060]
        R.m.wf64(((R.esp + 0x5c) | 0) >>> 0, R.st[0]); R.fpop(); // 4d1bae: fstp qword ptr [esp + 0x5c]
        if (R.cL) { pc = 82; continue; } // 4d1bb2: jl 0x4d1bfb
        pc = 80; continue;
      default: return pc;
    }
  }
}
function f_4d1600_10(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 80: // 4d1bb4
        R.push(0x0); // 4d1bb4: push 0
        R.push(0x0); // 4d1bb6: push 0
        R.push(0x1); // 4d1bb8: push 1
        R.push(0x0); // 4d1bba: push 0
        R.push((R.ebp >>> 0)); // 4d1bbc: push ebp
        R.call(0x600a50, { n: 5, thisEcx: false, calleeClean: false }); // 4d1bbd: call 0x600a50
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 4d1bc2: add esp, 0x14
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d1bc5: test eax, eax
        if (!R.zf) { pc = 82; continue; } // 4d1bc7: jne 0x4d1bfb
        pc = 81; continue;
      case 81: // 4d1bc9
        R.ecx = ((R.esi >>> 0)) | 0; // 4d1bc9: mov ecx, esi
        R.eax = (0x51eb851f) | 0; // 4d1bcb: mov eax, 0x51eb851f
        { const p = BigInt((((R.esi >>> 0)) | 0)) * BigInt((((R.ecx >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.ecx = (Number(BigInt.asIntN(32, p))) | 0; } // 4d1bd0: imul ecx, esi
        { const p = BigInt(R.eax | 0) * BigInt((((R.ecx >>> 0)) | 0)); R.eax = Number(BigInt.asIntN(32, p)); R.edx = Number(BigInt.asIntN(32, p >> 32n)); R.cf = R.of = BigInt.asIntN(32, p) !== p; } // 4d1bd3: imul ecx
        R.edx = (R.sar((R.edx >>> 0), 0x4, 32)) | 0; // 4d1bd5: sar edx, 4
        R.eax = ((R.edx >>> 0)) | 0; // 4d1bd8: mov eax, edx
        R.eax = (R.shr((R.eax >>> 0), 0x1f, 32)) | 0; // 4d1bda: shr eax, 0x1f
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 4d1bdd: add edx, eax
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, (R.edx >>> 0)); // 4d1bdf: mov dword ptr [esp + 0x34], edx
        R.fpush(R.m.s32(((R.esp + 0x34) | 0) >>> 0)); // 4d1be3: fild dword ptr [esp + 0x34]
        R.st[0] = R.st[0] * 0.006; // 4d1be7: fmul qword ptr [0x969058]
        R.st[0] = R.st[0] + 0.7; // 4d1bed: fadd qword ptr [0x968e40]
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x5c) | 0)); // 4d1bf3: fmul qword ptr [esp + 0x5c]
        R.m.wf64(((R.esp + 0x5c) | 0) >>> 0, R.st[0]); R.fpop(); // 4d1bf7: fstp qword ptr [esp + 0x5c]
        pc = 82; continue;
      case 82: // 4d1bfb
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 4d1bfb: test edi, edi
        if (R.zf) { pc = 87; continue; } // 4d1bfd: je 0x4d1c15
        pc = 83; continue;
      case 83: // 4d1bff
        R.sub(((R.ebx >>> 0) & 0xffff), 0x3c, 16); // 4d1bff: cmp bx, 0x3c
        if (R.cLE) { pc = 85; continue; } // 4d1c03: jle 0x4d1c0b
        pc = 84; continue;
      case 84: // 4d1c05
        R.m.w8(((R.edi + 0x1) | 0) >>> 0, R.logic(R.m.u8(((R.edi + 0x1) | 0) >>> 0) | 0x2, 8)); // 4d1c05: or byte ptr [edi + 1], 2
        pc = 87; continue; // 4d1c09: jmp 0x4d1c15
      case 85: // 4d1c0b
        R.sub(((R.ebx >>> 0) & 0xffff), 0x14, 16); // 4d1c0b: cmp bx, 0x14
        if (R.cLE) { pc = 87; continue; } // 4d1c0f: jle 0x4d1c15
        pc = 86; continue;
      case 86: // 4d1c11
        R.m.w8(((R.edi + 0x1) | 0) >>> 0, R.logic(R.m.u8(((R.edi + 0x1) | 0) >>> 0) | 0x4, 8)); // 4d1c11: or byte ptr [edi + 1], 4
        pc = 87; continue;
      case 87: // 4d1c15
        R.ecx = (R.m.u32(((0xae2a38) | 0) >>> 0)) | 0; // 4d1c15: mov ecx, dword ptr [0xae2a38]
        R.push((R.ebp >>> 0)); // 4d1c1b: push ebp
        R.call(0x5a0590, { n: 1, thisEcx: true, calleeClean: true }); // 4d1c1c: call 0x5a0590
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d1c21: test eax, eax
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, (R.eax >>> 0)); // 4d1c23: mov dword ptr [esp + 0x34], eax
        if (!R.zf) { pc = 89; continue; } // 4d1c27: jne 0x4d1c31
        pc = 88; continue;
      case 88: // 4d1c29
        R.fpush(0.0); // 4d1c29: fld qword ptr [0x9689a0]
        pc = 90; continue; // 4d1c2f: jmp 0x4d1c33
      case 89: // 4d1c31
        R.fpush(R.i64(((R.eax) | 0))); // 4d1c31: fild qword ptr [eax]
        pc = 90; continue;
      default: return pc;
    }
  }
}
function f_4d1600_11(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 90: // 4d1c33
        R.ecx = (((R.m.u16(((R.ebp + 0x80) | 0) >>> 0)) << 16 >> 16)) | 0; // 4d1c33: movsx ecx, word ptr [ebp + 0x80]
        R.m.wf64(((R.esp + 0x7c) | 0) >>> 0, R.st[0]); // 4d1c3a: fst qword ptr [esp + 0x7c]
        R.eax = (0x10624dd3) | 0; // 4d1c3e: mov eax, 0x10624dd3
        { const p = BigInt(R.eax | 0) * BigInt((((R.ecx >>> 0)) | 0)); R.eax = Number(BigInt.asIntN(32, p)); R.edx = Number(BigInt.asIntN(32, p >> 32n)); R.cf = R.of = BigInt.asIntN(32, p) !== p; } // 4d1c43: imul ecx
        R.edx = (R.sar((R.edx >>> 0), 0x5, 32)) | 0; // 4d1c45: sar edx, 5
        R.ecx = ((R.edx >>> 0)) | 0; // 4d1c48: mov ecx, edx
        R.ecx = (R.shr((R.ecx >>> 0), 0x1f, 32)) | 0; // 4d1c4a: shr ecx, 0x1f
        R.edx = (R.add((R.edx >>> 0), (R.ecx >>> 0), 32)) | 0; // 4d1c4d: add edx, ecx
        R.fcom(R.st[0], R.f64(((R.edx * 8 + 0x9a7f48) | 0))); // 4d1c4f: fcom qword ptr [edx*8 + 0x9a7f48]
        R.edx = (((R.edx * 8 + 0x9a7f48) | 0)) | 0; // 4d1c56: lea edx, [edx*8 + 0x9a7f48]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d1c5d: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d1c5f: test ah, 1
        if (R.zf) { pc = 96; continue; } // 4d1c62: je 0x4d1cbc
        pc = 91; continue;
      case 91: // 4d1c64
        R.st[0] = R.st[0] - R.f64(((R.edx) | 0)); // 4d1c64: fsub qword ptr [edx]
        R.st[0] = R.st[0] / R.f64(((R.edx) | 0)); // 4d1c66: fdiv qword ptr [edx]
        R.fpush(R.f64(((R.esp + 0x7c) | 0))); // 4d1c68: fld qword ptr [esp + 0x7c]
        R.st[0] = R.st[0] * 1.25e-06; // 4d1c6c: fmul qword ptr [0x969050]
        R.fpush(0.0); // 4d1c72: fld qword ptr [0x9689a0]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 4d1c78: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d1c7a: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 4d1c7c: test ah, 0x41
        if (!R.zf) { pc = 93; continue; } // 4d1c7f: jne 0x4d1c97
        pc = 92; continue;
      case 92: // 4d1c81
        R.fpop(); // 4d1c81: fstp st(0)
        R.fpush(0.0); // 4d1c83: fld qword ptr [0x9689a0]
        R.fpush(R.st[0]); // 4d1c89: fld st(0)
        R.st[2] = R.st[2] + R.st[0]; R.fpop(); // 4d1c8b: faddp st(2)
        R.st[0] = R.st[0] + 1.0; // 4d1c8d: fadd qword ptr [0x967890]
        R.st[1] = R.st[1] / R.st[0]; R.fpop(); // 4d1c93: fdivp st(1)
        pc = 97; continue; // 4d1c95: jmp 0x4d1cbe
      case 93: // 4d1c97
        R.fpush(10.0); // 4d1c97: fld qword ptr [0x9688b0]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 4d1c9d: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d1c9f: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d1ca1: test ah, 1
        if (R.zf) { pc = 95; continue; } // 4d1ca4: je 0x4d1cae
        pc = 94; continue;
      case 94: // 4d1ca6
        R.fpop(); // 4d1ca6: fstp st(0)
        R.fpush(10.0); // 4d1ca8: fld qword ptr [0x9688b0]
        pc = 95; continue;
      case 95: // 4d1cae
        R.fpush(R.st[0]); // 4d1cae: fld st(0)
        R.st[2] = R.st[2] + R.st[0]; R.fpop(); // 4d1cb0: faddp st(2)
        R.st[0] = R.st[0] + 1.0; // 4d1cb2: fadd qword ptr [0x967890]
        R.st[1] = R.st[1] / R.st[0]; R.fpop(); // 4d1cb8: fdivp st(1)
        pc = 97; continue; // 4d1cba: jmp 0x4d1cbe
      case 96: // 4d1cbc
        R.st[0] = R.st[0] / R.f64(((R.edx) | 0)); // 4d1cbc: fdiv qword ptr [edx]
        pc = 97; continue;
      default: return pc;
    }
  }
}
function f_4d1600_12(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 97: // 4d1cbe
        R.edx = (R.m.u32(((R.esp + 0x98) | 0) >>> 0)) | 0; // 4d1cbe: mov edx, dword ptr [esp + 0x98]
        R.fpush(R.m.s32(((R.esp + 0x2c) | 0) >>> 0)); // 4d1cc5: fild dword ptr [esp + 0x2c]
        R.eax = (R.m.u32(((R.edx) | 0) >>> 0)) | 0; // 4d1cc9: mov eax, dword ptr [edx]
        R.edx = (R.m.u32(((0xae2d0c) | 0) >>> 0)) | 0; // 4d1ccb: mov edx, dword ptr [0xae2d0c]
        R.ecx = (((R.eax + R.eax * 4) | 0)) | 0; // 4d1cd1: lea ecx, [eax + eax*4]
        R.ecx = (R.shl((R.ecx >>> 0), 0x4, 32)) | 0; // 4d1cd4: shl ecx, 4
        R.ecx = (R.sub((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 4d1cd7: sub ecx, eax
        R.m.wf64(((R.esp + 0x6c) | 0) >>> 0, R.st[0]); R.fpop(); // 4d1cd9: fstp qword ptr [esp + 0x6c]
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ecx + R.edx + 0xb) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d1cdd: mov al, byte ptr [ecx + edx + 0xb]
        R.eax = (R.logic((R.eax >>> 0) & 0xf, 32)) | 0; // 4d1ce1: and eax, 0xf
        R.ecx = ((R.eax >>> 0)) | 0; // 4d1ce4: mov ecx, eax
        { const p = BigInt((((R.eax >>> 0)) | 0)) * BigInt((((R.ecx >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.ecx = (Number(BigInt.asIntN(32, p))) | 0; } // 4d1ce6: imul ecx, eax
        R.m.w32(((R.esp + 0x2c) | 0) >>> 0, (R.ecx >>> 0)); // 4d1ce9: mov dword ptr [esp + 0x2c], ecx
        R.fpush(R.m.s32(((R.esp + 0x2c) | 0) >>> 0)); // 4d1ced: fild dword ptr [esp + 0x2c]
        R.st[0] = R.st[0] * 0.05; // 4d1cf1: fmul qword ptr [0x967888]
        R.st[1] = R.st[1] + R.st[0]; R.fpop(); // 4d1cf7: faddp st(1)
        R.fpush(R.f64(((R.esp + 0x6c) | 0))); // 4d1cf9: fld qword ptr [esp + 0x6c]
        R.st[0] = R.st[0] * 0.002; // 4d1cfd: fmul qword ptr [0x969048]
        R.st[1] = R.st[1] + R.st[0]; R.fpop(); // 4d1d03: faddp st(1)
        R.fcom(R.st[0], 1.0); // 4d1d05: fcom qword ptr [0x967890]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d1d0b: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 4d1d0d: test ah, 0x41
        if (!R.zf) { pc = 99; continue; } // 4d1d10: jne 0x4d1d20
        pc = 98; continue;
      case 98: // 4d1d12
        R.st[0] = R.st[0] * 0.25; // 4d1d12: fmul qword ptr [0x9689e0]
        R.st[0] = R.st[0] + 0.75; // 4d1d18: fadd qword ptr [0x969040]
        pc = 100; continue; // 4d1d1e: jmp 0x4d1d2c
      case 99: // 4d1d20
        R.st[0] = R.st[0] * 0.2125; // 4d1d20: fmul qword ptr [0x969038]
        R.st[0] = R.st[0] + 0.7875; // 4d1d26: fadd qword ptr [0x969030]
        pc = 100; continue;
      case 100: // 4d1d2c
        R.m.wf64(((R.esp + 0x38) | 0) >>> 0, R.st[0]); R.fpop(); // 4d1d2c: fstp qword ptr [esp + 0x38]
        R.fpush(R.f64(((R.esp + 0x6c) | 0))); // 4d1d30: fld qword ptr [esp + 0x6c]
        R.st[0] = R.st[0] * 0.0025; // 4d1d34: fmul qword ptr [0x969028]
        R.st[0] = R.st[0] + 0.5; // 4d1d3a: fadd qword ptr [0x968968]
        R.fcom(R.st[0], R.f64(((R.esp + 0x38) | 0))); // 4d1d40: fcom qword ptr [esp + 0x38]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d1d44: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 4d1d46: test ah, 0x41
        if (!R.zf) { pc = 102; continue; } // 4d1d49: jne 0x4d1d51
        pc = 101; continue;
      case 101: // 4d1d4b
        R.m.wf64(((R.esp + 0x38) | 0) >>> 0, R.st[0]); R.fpop(); // 4d1d4b: fstp qword ptr [esp + 0x38]
        pc = 104; continue; // 4d1d4f: jmp 0x4d1d74
      case 102: // 4d1d51
        R.fpop(); // 4d1d51: fstp st(0)
        R.fpush(2.5); // 4d1d53: fld qword ptr [0x968e18]
        R.fcom(R.st[0], R.f64(((R.esp + 0x38) | 0))); R.fpop(); // 4d1d59: fcomp qword ptr [esp + 0x38]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d1d5d: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d1d5f: test ah, 1
        if (R.zf) { pc = 104; continue; } // 4d1d62: je 0x4d1d74
        pc = 103; continue;
      case 103: // 4d1d64
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, 0x0); // 4d1d64: mov dword ptr [esp + 0x38], 0
        R.m.w32(((R.esp + 0x3c) | 0) >>> 0, 0x40040000); // 4d1d6c: mov dword ptr [esp + 0x3c], 0x40040000
        pc = 104; continue;
      default: return pc;
    }
  }
}
function f_4d1600_13(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 104: // 4d1d74
        R.ebx = (R.m.u32(((R.esp + 0x94) | 0) >>> 0)) | 0; // 4d1d74: mov ebx, dword ptr [esp + 0x94]
        R.logic((R.ebx >>> 0) & (R.ebx >>> 0), 32); // 4d1d7b: test ebx, ebx
        if (R.zf) { pc = 150; continue; } // 4d1d7d: je 0x4d2002
        pc = 105; continue;
      case 105: // 4d1d83
        R.esi = (R.m.u32(((R.esp + 0x24) | 0) >>> 0)) | 0; // 4d1d83: mov esi, dword ptr [esp + 0x24]
        R.sub(((R.esi >>> 0) & 0xffff), 0x14, 16); // 4d1d87: cmp si, 0x14
        if (R.cLE) { pc = 108; continue; } // 4d1d8b: jle 0x4d1da9
        pc = 106; continue;
      case 106: // 4d1d8d
        R.edx = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 4d1d8d: mov edx, dword ptr [esp + 0x18]
        R.eax = (R.m.u32(((R.edx + 0x45) | 0) >>> 0)) | 0; // 4d1d91: mov eax, dword ptr [edx + 0x45]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d1d94: test eax, eax
        if (!R.zf) { pc = 108; continue; } // 4d1d96: jne 0x4d1da9
        pc = 107; continue;
      case 107: // 4d1d98
        R.fpush(R.f64(((R.esp + 0x6c) | 0))); // 4d1d98: fld qword ptr [esp + 0x6c]
        R.st[0] = R.st[0] * 1.5; // 4d1d9c: fmul qword ptr [0x968940]
        R.ftol(); // 4d1da2: call 0x945640
        R.esi = ((R.eax >>> 0)) | 0; // 4d1da7: mov esi, eax
        pc = 108; continue;
      case 108: // 4d1da9
        R.eax = (R.m.u32(((R.ebx) | 0) >>> 0)) | 0; // 4d1da9: mov eax, dword ptr [ebx]
        R.ecx = (R.m.u32(((0x9d0118) | 0) >>> 0)) | 0; // 4d1dab: mov ecx, dword ptr [0x9d0118]
        R.edx = (R.m.u32(((0x9d011c) | 0) >>> 0)) | 0; // 4d1db1: mov edx, dword ptr [0x9d011c]
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 4d1db7: cmp eax, ecx
        if (R.zf) { pc = 110; continue; } // 4d1db9: je 0x4d1dbf
        pc = 109; continue;
      case 109: // 4d1dbb
        R.sub((R.eax >>> 0), (R.edx >>> 0), 32); // 4d1dbb: cmp eax, edx
        if (!R.zf) { pc = 112; continue; } // 4d1dbd: jne 0x4d1dd2
        pc = 110; continue;
      case 110: // 4d1dbf
        R.eax = (R.m.u32(((R.ebp) | 0) >>> 0)) | 0; // 4d1dbf: mov eax, dword ptr [ebp]
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 4d1dc2: cmp eax, ecx
        if (R.zf) { pc = 145; continue; } // 4d1dc4: je 0x4d1fb5
        pc = 111; continue;
      case 111: // 4d1dca
        R.sub((R.eax >>> 0), (R.edx >>> 0), 32); // 4d1dca: cmp eax, edx
        if (R.zf) { pc = 145; continue; } // 4d1dcc: je 0x4d1fb5
        pc = 112; continue;
      case 112: // 4d1dd2
        R.push((R.ebp >>> 0)); // 4d1dd2: push ebp
        R.push((R.ebx >>> 0)); // 4d1dd3: push ebx
        R.call(0x4b02e0, { n: 2, thisEcx: false, calleeClean: false }); // 4d1dd4: call 0x4b02e0
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 4d1dd9: add esp, 8
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 4d1ddc: test al, al
        if (R.zf) { pc = 124; continue; } // 4d1dde: je 0x4d1e88
        pc = 113; continue;
      case 113: // 4d1de4
        R.ecx = (R.m.u32(((R.ebx + 0x69) | 0) >>> 0)) | 0; // 4d1de4: mov ecx, dword ptr [ebx + 0x69]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 4d1de7: test ecx, ecx
        if (R.zf) { pc = 118; continue; } // 4d1de9: je 0x4d1e30
        pc = 114; continue;
      case 114: // 4d1deb
        R.eax = (R.m.u32(((R.ebp + 0x69) | 0) >>> 0)) | 0; // 4d1deb: mov eax, dword ptr [ebp + 0x69]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d1dee: test eax, eax
        if (R.zf) { pc = 118; continue; } // 4d1df0: je 0x4d1e30
        pc = 115; continue;
      default: return pc;
    }
  }
}
function f_4d1600_14(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 115: // 4d1df2
        R.ecx = (R.m.u32(((R.ecx + 0x38) | 0) >>> 0)) | 0; // 4d1df2: mov ecx, dword ptr [ecx + 0x38]
        R.edx = (R.m.u32(((R.eax + 0x38) | 0) >>> 0)) | 0; // 4d1df5: mov edx, dword ptr [eax + 0x38]
        R.sub((R.ecx >>> 0), (R.edx >>> 0), 32); // 4d1df8: cmp ecx, edx
        if (!R.zf) { pc = 118; continue; } // 4d1dfa: jne 0x4d1e30
        pc = 116; continue;
      case 116: // 4d1dfc
        R.edx = (((((R.esi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 4d1dfc: movsx edx, si
        R.m.w32(((R.esp + 0x2c) | 0) >>> 0, (R.edx >>> 0)); // 4d1dff: mov dword ptr [esp + 0x2c], edx
        R.fpush(R.m.s32(((R.esp + 0x2c) | 0) >>> 0)); // 4d1e03: fild dword ptr [esp + 0x2c]
        R.st[0] = R.st[0] * 0.03333333333333333; // 4d1e07: fmul qword ptr [0x969020]
        R.st[0] = R.st[0] + 2.0; // 4d1e0d: fadd qword ptr [0x968950]
        R.m.wf64(((R.esp + 0x44) | 0) >>> 0, R.st[0]); // 4d1e13: fst qword ptr [esp + 0x44]
        R.fpush(2.0); // 4d1e17: fld qword ptr [0x968950]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 4d1e1d: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d1e1f: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 4d1e21: test ah, 0x41
        if (!R.zf) { pc = 121; continue; } // 4d1e24: jne 0x4d1e66
        pc = 117; continue;
      case 117: // 4d1e26
        R.fpop(); // 4d1e26: fstp st(0)
        R.fpush(2.0); // 4d1e28: fld qword ptr [0x968950]
        pc = 120; continue; // 4d1e2e: jmp 0x4d1e62
      case 118: // 4d1e30
        R.eax = (((((R.esi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 4d1e30: movsx eax, si
        R.m.w32(((R.esp + 0x2c) | 0) >>> 0, (R.eax >>> 0)); // 4d1e33: mov dword ptr [esp + 0x2c], eax
        R.fpush(R.m.s32(((R.esp + 0x2c) | 0) >>> 0)); // 4d1e37: fild dword ptr [esp + 0x2c]
        R.st[0] = R.st[0] * 0.02; // 4d1e3b: fmul qword ptr [0x968a98]
        R.st[0] = R.st[0] + 1.6; // 4d1e41: fadd qword ptr [0x969018]
        R.m.wf64(((R.esp + 0x44) | 0) >>> 0, R.st[0]); // 4d1e47: fst qword ptr [esp + 0x44]
        R.fpush(1.3); // 4d1e4b: fld qword ptr [0x968de8]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 4d1e51: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d1e53: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 4d1e55: test ah, 0x41
        if (!R.zf) { pc = 121; continue; } // 4d1e58: jne 0x4d1e66
        pc = 119; continue;
      case 119: // 4d1e5a
        R.fpop(); // 4d1e5a: fstp st(0)
        R.fpush(1.3); // 4d1e5c: fld qword ptr [0x968de8]
        pc = 120; continue;
      case 120: // 4d1e62
        R.m.wf64(((R.esp + 0x44) | 0) >>> 0, R.st[0]); // 4d1e62: fst qword ptr [esp + 0x44]
        pc = 121; continue;
      case 121: // 4d1e66
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 4d1e66: test edi, edi
        if (R.zf) { pc = 151; continue; } // 4d1e68: je 0x4d2006
        pc = 122; continue;
      case 122: // 4d1e6e
        R.fcom(R.st[0], 1.3); // 4d1e6e: fcom qword ptr [0x968de8]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d1e74: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d1e76: test ah, 1
        if (!R.zf) { pc = 151; continue; } // 4d1e79: jne 0x4d2006
        pc = 123; continue;
      case 123: // 4d1e7f
        R.m.w8(((R.edi + 0x1) | 0) >>> 0, R.logic(R.m.u8(((R.edi + 0x1) | 0) >>> 0) | 0x8, 8)); // 4d1e7f: or byte ptr [edi + 1], 8
        pc = 151; continue; // 4d1e83: jmp 0x4d2006
      case 124: // 4d1e88
        R.sub((R.ebx >>> 0), R.m.u32(((R.ebp + 0xb3) | 0) >>> 0), 32); // 4d1e88: cmp ebx, dword ptr [ebp + 0xb3]
        if (R.zf) { pc = 135; continue; } // 4d1e8e: je 0x4d1f24
        pc = 125; continue;
      default: return pc;
    }
  }
}
function f_4d1600_15(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 125: // 4d1e94
        R.sub((R.ebx >>> 0), R.m.u32(((R.ebp + 0xb7) | 0) >>> 0), 32); // 4d1e94: cmp ebx, dword ptr [ebp + 0xb7]
        if (R.zf) { pc = 135; continue; } // 4d1e9a: je 0x4d1f24
        pc = 126; continue;
      case 126: // 4d1ea0
        R.sub((R.ebx >>> 0), R.m.u32(((R.ebp + 0xbb) | 0) >>> 0), 32); // 4d1ea0: cmp ebx, dword ptr [ebp + 0xbb]
        if (R.zf) { pc = 135; continue; } // 4d1ea6: je 0x4d1f24
        pc = 127; continue;
      case 127: // 4d1ea8
        R.eax = (R.m.u32(((R.ebx + 0x57) | 0) >>> 0)) | 0; // 4d1ea8: mov eax, dword ptr [ebx + 0x57]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d1eab: test eax, eax
        if (R.zf) { pc = 150; continue; } // 4d1ead: je 0x4d2002
        pc = 128; continue;
      case 128: // 4d1eb3
        R.ecx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 4d1eb3: mov ecx, dword ptr [eax]
        R.edx = (R.m.u32(((0x9cf764) | 0) >>> 0)) | 0; // 4d1eb5: mov edx, dword ptr [0x9cf764]
        R.sub((R.ecx >>> 0), (R.edx >>> 0), 32); // 4d1ebb: cmp ecx, edx
        if (R.zf) { pc = 150; continue; } // 4d1ebd: je 0x4d2002
        pc = 129; continue;
      case 129: // 4d1ec3
        R.sub((R.eax >>> 0), R.m.u32(((R.ebp + 0x57) | 0) >>> 0), 32); // 4d1ec3: cmp eax, dword ptr [ebp + 0x57]
        if (!R.zf) { pc = 150; continue; } // 4d1ec6: jne 0x4d2002
        pc = 130; continue;
      case 130: // 4d1ecc
        R.edx = (((((R.esi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 4d1ecc: movsx edx, si
        R.m.w32(((R.esp + 0x2c) | 0) >>> 0, (R.edx >>> 0)); // 4d1ecf: mov dword ptr [esp + 0x2c], edx
        R.fpush(R.m.s32(((R.esp + 0x2c) | 0) >>> 0)); // 4d1ed3: fild dword ptr [esp + 0x2c]
        R.st[0] = R.st[0] * 0.005; // 4d1ed7: fmul qword ptr [0x968ef0]
        R.st[0] = R.st[0] + 1.0; // 4d1edd: fadd qword ptr [0x967890]
        R.m.wf64(((R.esp + 0x44) | 0) >>> 0, R.st[0]); // 4d1ee3: fst qword ptr [esp + 0x44]
        R.fpush(1.0); // 4d1ee7: fld qword ptr [0x967890]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 4d1eed: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d1eef: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 4d1ef1: test ah, 0x41
        if (!R.zf) { pc = 132; continue; } // 4d1ef4: jne 0x4d1f02
        pc = 131; continue;
      case 131: // 4d1ef6
        R.fpop(); // 4d1ef6: fstp st(0)
        R.fpush(1.0); // 4d1ef8: fld qword ptr [0x967890]
        R.m.wf64(((R.esp + 0x44) | 0) >>> 0, R.st[0]); // 4d1efe: fst qword ptr [esp + 0x44]
        pc = 132; continue;
      case 132: // 4d1f02
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 4d1f02: test edi, edi
        if (R.zf) { pc = 151; continue; } // 4d1f04: je 0x4d2006
        pc = 133; continue;
      case 133: // 4d1f0a
        R.fcom(R.st[0], 1.3); // 4d1f0a: fcom qword ptr [0x968de8]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d1f10: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 4d1f12: test ah, 0x41
        if (!R.zf) { pc = 151; continue; } // 4d1f15: jne 0x4d2006
        pc = 134; continue;
      case 134: // 4d1f1b
        R.m.w8(((R.edi + 0x1) | 0) >>> 0, R.logic(R.m.u8(((R.edi + 0x1) | 0) >>> 0) | 0x10, 8)); // 4d1f1b: or byte ptr [edi + 1], 0x10
        pc = 151; continue; // 4d1f1f: jmp 0x4d2006
      case 135: // 4d1f24
        R.ecx = (R.m.u32(((R.ebx + 0x69) | 0) >>> 0)) | 0; // 4d1f24: mov ecx, dword ptr [ebx + 0x69]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 4d1f27: test ecx, ecx
        if (R.zf) { pc = 140; continue; } // 4d1f29: je 0x4d1f68
        pc = 136; continue;
      default: return pc;
    }
  }
}
function f_4d1600_16(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 136: // 4d1f2b
        R.eax = (R.m.u32(((R.ebp + 0x69) | 0) >>> 0)) | 0; // 4d1f2b: mov eax, dword ptr [ebp + 0x69]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d1f2e: test eax, eax
        if (R.zf) { pc = 140; continue; } // 4d1f30: je 0x4d1f68
        pc = 137; continue;
      case 137: // 4d1f32
        R.ecx = (R.m.u32(((R.ecx + 0x38) | 0) >>> 0)) | 0; // 4d1f32: mov ecx, dword ptr [ecx + 0x38]
        R.edx = (R.m.u32(((R.eax + 0x38) | 0) >>> 0)) | 0; // 4d1f35: mov edx, dword ptr [eax + 0x38]
        R.sub((R.ecx >>> 0), (R.edx >>> 0), 32); // 4d1f38: cmp ecx, edx
        if (!R.zf) { pc = 140; continue; } // 4d1f3a: jne 0x4d1f68
        pc = 138; continue;
      case 138: // 4d1f3c
        R.edx = (((((R.esi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 4d1f3c: movsx edx, si
        R.m.w32(((R.esp + 0x2c) | 0) >>> 0, (R.edx >>> 0)); // 4d1f3f: mov dword ptr [esp + 0x2c], edx
        R.fpush(R.m.s32(((R.esp + 0x2c) | 0) >>> 0)); // 4d1f43: fild dword ptr [esp + 0x2c]
        R.st[0] = R.st[0] * 0.02; // 4d1f47: fmul qword ptr [0x968a98]
        R.st[0] = R.st[0] + 1.6; // 4d1f4d: fadd qword ptr [0x969018]
        R.m.wf64(((R.esp + 0x44) | 0) >>> 0, R.st[0]); // 4d1f53: fst qword ptr [esp + 0x44]
        R.fpush(1.3); // 4d1f57: fld qword ptr [0x968de8]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 4d1f5d: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d1f5f: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 4d1f61: test ah, 0x41
        if (!R.zf) { pc = 142; continue; } // 4d1f64: jne 0x4d1f9e
        pc = 139; continue;
      case 139: // 4d1f66
        pc = 141; continue; // 4d1f66: jmp 0x4d1f92
      case 140: // 4d1f68
        R.eax = (((((R.esi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 4d1f68: movsx eax, si
        R.m.w32(((R.esp + 0x2c) | 0) >>> 0, (R.eax >>> 0)); // 4d1f6b: mov dword ptr [esp + 0x2c], eax
        R.fpush(R.m.s32(((R.esp + 0x2c) | 0) >>> 0)); // 4d1f6f: fild dword ptr [esp + 0x2c]
        R.st[0] = R.st[0] * 0.01; // 4d1f73: fmul qword ptr [0x967898]
        R.st[0] = R.st[0] + 1.3; // 4d1f79: fadd qword ptr [0x968de8]
        R.m.wf64(((R.esp + 0x44) | 0) >>> 0, R.st[0]); // 4d1f7f: fst qword ptr [esp + 0x44]
        R.fpush(1.3); // 4d1f83: fld qword ptr [0x968de8]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 4d1f89: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d1f8b: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 4d1f8d: test ah, 0x41
        if (!R.zf) { pc = 142; continue; } // 4d1f90: jne 0x4d1f9e
        pc = 141; continue;
      case 141: // 4d1f92
        R.fpop(); // 4d1f92: fstp st(0)
        R.fpush(1.3); // 4d1f94: fld qword ptr [0x968de8]
        R.m.wf64(((R.esp + 0x44) | 0) >>> 0, R.st[0]); // 4d1f9a: fst qword ptr [esp + 0x44]
        pc = 142; continue;
      case 142: // 4d1f9e
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 4d1f9e: test edi, edi
        if (R.zf) { pc = 151; continue; } // 4d1fa0: je 0x4d2006
        pc = 143; continue;
      case 143: // 4d1fa2
        R.fcom(R.st[0], 1.3); // 4d1fa2: fcom qword ptr [0x968de8]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d1fa8: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d1faa: test ah, 1
        if (!R.zf) { pc = 151; continue; } // 4d1fad: jne 0x4d2006
        pc = 144; continue;
      case 144: // 4d1faf
        R.m.w8(((R.edi + 0x1) | 0) >>> 0, R.logic(R.m.u8(((R.edi + 0x1) | 0) >>> 0) | 0x8, 8)); // 4d1faf: or byte ptr [edi + 1], 8
        pc = 151; continue; // 4d1fb3: jmp 0x4d2006
      default: return pc;
    }
  }
}
function f_4d1600_17(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 145: // 4d1fb5
        R.ecx = (((((R.esi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 4d1fb5: movsx ecx, si
        R.m.w32(((R.esp + 0x2c) | 0) >>> 0, (R.ecx >>> 0)); // 4d1fb8: mov dword ptr [esp + 0x2c], ecx
        R.fpush(R.m.s32(((R.esp + 0x2c) | 0) >>> 0)); // 4d1fbc: fild dword ptr [esp + 0x2c]
        R.st[0] = R.st[0] * 0.04; // 4d1fc0: fmul qword ptr [0x968a90]
        R.st[0] = R.st[0] + 2.3; // 4d1fc6: fadd qword ptr [0x969010]
        R.m.wf64(((R.esp + 0x44) | 0) >>> 0, R.st[0]); // 4d1fcc: fst qword ptr [esp + 0x44]
        R.fpush(2.3); // 4d1fd0: fld qword ptr [0x969010]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 4d1fd6: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d1fd8: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 4d1fda: test ah, 0x41
        if (!R.zf) { pc = 147; continue; } // 4d1fdd: jne 0x4d1feb
        pc = 146; continue;
      case 146: // 4d1fdf
        R.fpop(); // 4d1fdf: fstp st(0)
        R.fpush(2.3); // 4d1fe1: fld qword ptr [0x969010]
        R.m.wf64(((R.esp + 0x44) | 0) >>> 0, R.st[0]); // 4d1fe7: fst qword ptr [esp + 0x44]
        pc = 147; continue;
      case 147: // 4d1feb
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 4d1feb: test edi, edi
        if (R.zf) { pc = 151; continue; } // 4d1fed: je 0x4d2006
        pc = 148; continue;
      case 148: // 4d1fef
        R.fcom(R.st[0], 1.3); // 4d1fef: fcom qword ptr [0x968de8]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d1ff5: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d1ff7: test ah, 1
        if (!R.zf) { pc = 151; continue; } // 4d1ffa: jne 0x4d2006
        pc = 149; continue;
      case 149: // 4d1ffc
        R.m.w8(((R.edi + 0x1) | 0) >>> 0, R.logic(R.m.u8(((R.edi + 0x1) | 0) >>> 0) | 0x8, 8)); // 4d1ffc: or byte ptr [edi + 1], 8
        pc = 151; continue; // 4d2000: jmp 0x4d2006
      case 150: // 4d2002
        R.fpush(R.f64(((R.esp + 0x44) | 0))); // 4d2002: fld qword ptr [esp + 0x44]
        pc = 151; continue;
      case 151: // 4d2006
        R.ecx = (((R.m.u16(((R.ebp + 0x80) | 0) >>> 0)) << 16 >> 16)) | 0; // 4d2006: movsx ecx, word ptr [ebp + 0x80]
        R.eax = (0x51eb851f) | 0; // 4d200d: mov eax, 0x51eb851f
        { const p = BigInt(R.eax | 0) * BigInt((((R.ecx >>> 0)) | 0)); R.eax = Number(BigInt.asIntN(32, p)); R.edx = Number(BigInt.asIntN(32, p >> 32n)); R.cf = R.of = BigInt.asIntN(32, p) !== p; } // 4d2012: imul ecx
        R.edx = (R.sar((R.edx >>> 0), 0x4, 32)) | 0; // 4d2014: sar edx, 4
        R.eax = ((R.edx >>> 0)) | 0; // 4d2017: mov eax, edx
        R.eax = (R.shr((R.eax >>> 0), 0x1f, 32)) | 0; // 4d2019: shr eax, 0x1f
        R.eax = (((R.edx + R.eax + 0x1) | 0)) | 0; // 4d201c: lea eax, [edx + eax + 1]
        R.eax = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 4d2020: movsx eax, ax
        R.ecx = ((R.eax >>> 0)) | 0; // 4d2023: mov ecx, eax
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, (R.eax >>> 0)); // 4d2025: mov dword ptr [esp + 0x28], eax
        R.ecx = (R.shl((R.ecx >>> 0), 0x4, 32)) | 0; // 4d2029: shl ecx, 4
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 4d202c: add ecx, eax
        R.eax = (0x66666667) | 0; // 4d202e: mov eax, 0x66666667
        { const p = BigInt(R.eax | 0) * BigInt((((R.ecx >>> 0)) | 0)); R.eax = Number(BigInt.asIntN(32, p)); R.edx = Number(BigInt.asIntN(32, p >> 32n)); R.cf = R.of = BigInt.asIntN(32, p) !== p; } // 4d2033: imul ecx
        R.edx = (R.sar((R.edx >>> 0), 0x3, 32)) | 0; // 4d2035: sar edx, 3
        R.ecx = ((R.edx >>> 0)) | 0; // 4d2038: mov ecx, edx
        R.ecx = (R.shr((R.ecx >>> 0), 0x1f, 32)) | 0; // 4d203a: shr ecx, 0x1f
        R.edx = (R.add((R.edx >>> 0), (R.ecx >>> 0), 32)) | 0; // 4d203d: add edx, ecx
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 4d203f: test edi, edi
        if (R.zf) { pc = 154; continue; } // 4d2041: je 0x4d205b
        pc = 152; continue;
      default: return pc;
    }
  }
}
function f_4d1600_18(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 152: // 4d2043
        R.eax = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 4d2043: mov eax, dword ptr [esp + 0x18]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.eax + 0x4f) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d2047: mov cl, byte ptr [eax + 0x4f]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.logic(((R.ecx >>> 0) & 0xff) & 0xf0, 8)) & 0xff) << 0)) | 0; // 4d204a: and cl, 0xf0
        R.sub(((R.ecx >>> 0) & 0xff), 0x50, 8); // 4d204d: cmp cl, 0x50
        if (!R.zf) { pc = 154; continue; } // 4d2050: jne 0x4d205b
        pc = 153; continue;
      case 153: // 4d2052
        R.m.w8(((R.edi + 0x1) | 0) >>> 0, R.logic(R.m.u8(((R.edi + 0x1) | 0) >>> 0) | 0x20, 8)); // 4d2052: or byte ptr [edi + 1], 0x20
        pc = 168; continue; // 4d2056: jmp 0x4d2124
      case 154: // 4d205b
        R.sub(R.m.u16(((R.esp + 0x20) | 0) >>> 0), ((R.edx >>> 0) & 0xffff), 16); // 4d205b: cmp word ptr [esp + 0x20], dx
        if (R.cLE) { pc = 168; continue; } // 4d2060: jle 0x4d2124
        pc = 155; continue;
      case 155: // 4d2066
        R.eax = (R.m.u32(((R.esp + 0x98) | 0) >>> 0)) | 0; // 4d2066: mov eax, dword ptr [esp + 0x98]
        R.sub(R.m.u8(((R.eax + 0x18) | 0) >>> 0), 0x19, 8); // 4d206d: cmp byte ptr [eax + 0x18], 0x19
        if (!R.cL) { pc = 168; continue; } // 4d2071: jge 0x4d2124
        pc = 156; continue;
      case 156: // 4d2077
        R.ecx = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 4d2077: mov ecx, dword ptr [esp + 0x18]
        R.ebx = ((R.ebx & 0xffffff00) | (((R.m.u8(((R.ecx + 0x4f) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d207b: mov bl, byte ptr [ecx + 0x4f]
        R.eax = ((R.eax & 0xffffff00) | (((((R.ebx >>> 0) & 0xff)) & 0xff) << 0)) | 0; // 4d207e: mov al, bl
        R.eax = ((R.eax & 0xffffff00) | (((R.shr(((R.eax >>> 0) & 0xff), 0x4, 8)) & 0xff) << 0)) | 0; // 4d2080: shr al, 4
        R.sub(((R.eax >>> 0) & 0xff), 0x7, 8); // 4d2083: cmp al, 7
        if (!R.cL) { pc = 168; continue; } // 4d2085: jge 0x4d2124
        pc = 157; continue;
      case 157: // 4d208b
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 4d208b: test edi, edi
        if (R.zf) { pc = 160; continue; } // 4d208d: je 0x4d20a2
        pc = 158; continue;
      case 158: // 4d208f
        R.ecx = ((R.ecx & 0xffffff00) | (((((R.ebx >>> 0) & 0xff)) & 0xff) << 0)) | 0; // 4d208f: mov cl, bl
        R.ecx = ((R.ecx & 0xffffff00) | (((R.logic(((R.ecx >>> 0) & 0xff) & 0xf0, 8)) & 0xff) << 0)) | 0; // 4d2091: and cl, 0xf0
        R.sub(((R.ecx >>> 0) & 0xff), 0x60, 8); // 4d2094: cmp cl, 0x60
        if (!R.zf) { pc = 160; continue; } // 4d2097: jne 0x4d20a2
        pc = 159; continue;
      case 159: // 4d2099
        R.m.w8(((R.edi + 0x1) | 0) >>> 0, R.logic(R.m.u8(((R.edi + 0x1) | 0) >>> 0) | 0x20, 8)); // 4d2099: or byte ptr [edi + 1], 0x20
        pc = 168; continue; // 4d209d: jmp 0x4d2124
      default: return pc;
    }
  }
}
function f_4d1600_19(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 160: // 4d20a2
        R.eax = (((R.m.u16(((R.esp + 0x20) | 0) >>> 0)) << 16 >> 16)) | 0; // 4d20a2: movsx eax, word ptr [esp + 0x20]
        R.edx = (((((R.edx >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 4d20a7: movsx edx, dx
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 4d20aa: sub eax, edx
        R.m.w32(((R.esp + 0x2c) | 0) >>> 0, (R.eax >>> 0)); // 4d20ac: mov dword ptr [esp + 0x2c], eax
        R.fpush(R.m.s32(((R.esp + 0x2c) | 0) >>> 0)); // 4d20b0: fild dword ptr [esp + 0x2c]
        R.fpush(R.m.s32(((R.esp + 0x28) | 0) >>> 0)); // 4d20b4: fild dword ptr [esp + 0x28]
        R.st[0] = R.st[0] * 0.005; // 4d20b8: fmul qword ptr [0x968ef0]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 4d20be: fmulp st(1)
        R.ftol(); // 4d20c0: call 0x945640
        R.ecx = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 4d20c5: movsx ecx, ax
        R.m.w32(((R.esp + 0x2c) | 0) >>> 0, (R.ecx >>> 0)); // 4d20c8: mov dword ptr [esp + 0x2c], ecx
        R.fpush(R.m.s32(((R.esp + 0x2c) | 0) >>> 0)); // 4d20cc: fild dword ptr [esp + 0x2c]
        R.st[0] = R.st[0] * 0.04; // 4d20d0: fmul qword ptr [0x968a90]
        R.st[0] = R.st[0] + 1.0; // 4d20d6: fadd qword ptr [0x967890]
        R.fcom(R.st[0], 1.0); // 4d20dc: fcom qword ptr [0x967890]
        R.m.wf64(((R.esp + 0x54) | 0) >>> 0, R.st[0]); // 4d20e2: fst qword ptr [esp + 0x54]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d20e6: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d20e8: test ah, 1
        if (R.zf) { pc = 162; continue; } // 4d20eb: je 0x4d20f9
        pc = 161; continue;
      case 161: // 4d20ed
        R.fpop(); // 4d20ed: fstp st(0)
        R.fpush(1.0); // 4d20ef: fld qword ptr [0x967890]
        R.m.wf64(((R.esp + 0x54) | 0) >>> 0, R.st[0]); // 4d20f5: fst qword ptr [esp + 0x54]
        pc = 162; continue;
      case 162: // 4d20f9
        R.ebx = ((R.ebx & 0xffffff00) | (((R.logic(((R.ebx >>> 0) & 0xff) & 0xf0, 8)) & 0xff) << 0)) | 0; // 4d20f9: and bl, 0xf0
        R.sub(((R.ebx >>> 0) & 0xff), 0x40, 8); // 4d20fc: cmp bl, 0x40
        if (!R.zf) { pc = 164; continue; } // 4d20ff: jne 0x4d210b
        pc = 163; continue;
      case 163: // 4d2101
        R.fpush(R.f64(((R.esp + 0x5c) | 0))); // 4d2101: fld qword ptr [esp + 0x5c]
        R.st[0] = R.st[0] * R.st[1]; // 4d2105: fmul st(1)
        R.m.wf64(((R.esp + 0x5c) | 0) >>> 0, R.st[0]); R.fpop(); // 4d2107: fstp qword ptr [esp + 0x5c]
        pc = 164; continue;
      case 164: // 4d210b
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 4d210b: test edi, edi
        if (R.zf) { pc = 167; continue; } // 4d210d: je 0x4d2122
        pc = 165; continue;
      case 165: // 4d210f
        R.fcom(R.st[0], 1.6); R.fpop(); // 4d210f: fcomp qword ptr [0x969018]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d2115: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 4d2117: test ah, 0x41
        if (!R.zf) { pc = 168; continue; } // 4d211a: jne 0x4d2124
        pc = 166; continue;
      case 166: // 4d211c
        R.m.w8(((R.edi + 0x1) | 0) >>> 0, R.logic(R.m.u8(((R.edi + 0x1) | 0) >>> 0) | 0x20, 8)); // 4d211c: or byte ptr [edi + 1], 0x20
        pc = 168; continue; // 4d2120: jmp 0x4d2124
      case 167: // 4d2122
        R.fpop(); // 4d2122: fstp st(0)
        pc = 168; continue;
      default: return pc;
    }
  }
}
function f_4d1600_20(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 168: // 4d2124
        R.fpush(R.st[0]); // 4d2124: fld st(0)
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 4d2126: fmulp st(1)
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x4c) | 0)); // 4d2128: fmul qword ptr [esp + 0x4c]
        R.fpush(4.25); // 4d212c: fld qword ptr [0x969008]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 4d2132: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d2134: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 4d2136: test ah, 0x41
        if (!R.zf) { pc = 170; continue; } // 4d2139: jne 0x4d2145
        pc = 169; continue;
      case 169: // 4d213b
        R.fpop(); // 4d213b: fstp st(0)
        R.fpush(4.25); // 4d213d: fld qword ptr [0x969008]
        pc = 172; continue; // 4d2143: jmp 0x4d215c
      case 170: // 4d2145
        R.fpush(10.0); // 4d2145: fld qword ptr [0x9688b0]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 4d214b: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d214d: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d214f: test ah, 1
        if (R.zf) { pc = 172; continue; } // 4d2152: je 0x4d215c
        pc = 171; continue;
      case 171: // 4d2154
        R.fpop(); // 4d2154: fstp st(0)
        R.fpush(10.0); // 4d2156: fld qword ptr [0x9688b0]
        pc = 172; continue;
      case 172: // 4d215c
        R.fpush(R.f64(((R.esp + 0x38) | 0))); // 4d215c: fld qword ptr [esp + 0x38]
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x5c) | 0)); // 4d2160: fmul qword ptr [esp + 0x5c]
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x84) | 0)); // 4d2164: fmul qword ptr [esp + 0x84]
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x54) | 0)); // 4d216b: fmul qword ptr [esp + 0x54]
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x44) | 0)); // 4d216f: fmul qword ptr [esp + 0x44]
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x4c) | 0)); // 4d2173: fmul qword ptr [esp + 0x4c]
        R.m.wf64(((R.esp + 0x5c) | 0) >>> 0, R.st[0]); R.fpop(); // 4d2177: fstp qword ptr [esp + 0x5c]
        R.fcom(R.st[0], R.f64(((R.esp + 0x5c) | 0))); // 4d217b: fcom qword ptr [esp + 0x5c]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d217f: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d2181: test ah, 1
        if (R.zf) { pc = 174; continue; } // 4d2184: je 0x4d218c
        pc = 173; continue;
      case 173: // 4d2186
        R.m.wf64(((R.esp + 0x5c) | 0) >>> 0, R.st[0]); R.fpop(); // 4d2186: fstp qword ptr [esp + 0x5c]
        pc = 175; continue; // 4d218a: jmp 0x4d219e
      case 174: // 4d218c
        R.edx = (R.m.u32(((R.esp + 0x5c) | 0) >>> 0)) | 0; // 4d218c: mov edx, dword ptr [esp + 0x5c]
        R.eax = (R.m.u32(((R.esp + 0x60) | 0) >>> 0)) | 0; // 4d2190: mov eax, dword ptr [esp + 0x60]
        R.fpop(); // 4d2194: fstp st(0)
        R.m.w32(((R.esp + 0x5c) | 0) >>> 0, (R.edx >>> 0)); // 4d2196: mov dword ptr [esp + 0x5c], edx
        R.m.w32(((R.esp + 0x60) | 0) >>> 0, (R.eax >>> 0)); // 4d219a: mov dword ptr [esp + 0x60], eax
        pc = 175; continue;
      case 175: // 4d219e
        R.fpush(R.f64(((R.esp + 0x38) | 0))); // 4d219e: fld qword ptr [esp + 0x38]
        R.st[0] = R.st[0] * 6.0; // 4d21a2: fmul qword ptr [0x969000]
        R.fpush(R.f64(((R.esp + 0x5c) | 0))); // 4d21a8: fld qword ptr [esp + 0x5c]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 4d21ac: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d21ae: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 4d21b0: test ah, 0x41
        if (!R.zf) { pc = 177; continue; } // 4d21b3: jne 0x4d21bb
        pc = 176; continue;
      case 176: // 4d21b5
        R.m.wf64(((R.esp + 0x5c) | 0) >>> 0, R.st[0]); R.fpop(); // 4d21b5: fstp qword ptr [esp + 0x5c]
        pc = 178; continue; // 4d21b9: jmp 0x4d21bd
      default: return pc;
    }
  }
}
function f_4d1600_21(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 177: // 4d21bb
        R.fpop(); // 4d21bb: fstp st(0)
        pc = 178; continue;
      case 178: // 4d21bd
        R.ecx = (R.m.u32(((R.esp + 0x98) | 0) >>> 0)) | 0; // 4d21bd: mov ecx, dword ptr [esp + 0x98]
        R.eax = (R.m.u32(((R.ecx + 0x61) | 0) >>> 0)) | 0; // 4d21c4: mov eax, dword ptr [ecx + 0x61]
        R.edx = (((R.m.u16(((R.eax + 0xb) | 0) >>> 0)) << 16 >> 16)) | 0; // 4d21c7: movsx edx, word ptr [eax + 0xb]
        R.ecx = (((R.m.u16(((R.eax + 0x9) | 0) >>> 0)) << 16 >> 16)) | 0; // 4d21cb: movsx ecx, word ptr [eax + 9]
        R.m.w32(((R.esp + 0x2c) | 0) >>> 0, (R.edx >>> 0)); // 4d21cf: mov dword ptr [esp + 0x2c], edx
        R.fpush(R.m.s32(((R.esp + 0x2c) | 0) >>> 0)); // 4d21d3: fild dword ptr [esp + 0x2c]
        R.edx = (((R.m.u16(((R.eax + 0xd) | 0) >>> 0)) << 16 >> 16)) | 0; // 4d21d7: movsx edx, word ptr [eax + 0xd]
        R.m.w32(((R.esp + 0x2c) | 0) >>> 0, (R.ecx >>> 0)); // 4d21db: mov dword ptr [esp + 0x2c], ecx
        R.fpush(R.m.s32(((R.esp + 0x2c) | 0) >>> 0)); // 4d21df: fild dword ptr [esp + 0x2c]
        R.m.w32(((R.esp + 0x2c) | 0) >>> 0, (R.edx >>> 0)); // 4d21e3: mov dword ptr [esp + 0x2c], edx
        R.st[1] = R.st[1] + R.st[0]; R.fpop(); // 4d21e7: faddp st(1)
        R.st[0] = R.st[0] * 0.3; // 4d21e9: fmul qword ptr [0x968e80]
        R.fpush(R.m.s32(((R.esp + 0x2c) | 0) >>> 0)); // 4d21ef: fild dword ptr [esp + 0x2c]
        R.st[0] = R.st[0] * 0.4; // 4d21f3: fmul qword ptr [0x968e00]
        R.st[1] = R.st[1] + R.st[0]; R.fpop(); // 4d21f9: faddp st(1)
        R.ftol(); // 4d21fb: call 0x945640
        R.ecx = (((R.m.u16(((R.ebp + 0x80) | 0) >>> 0)) << 16 >> 16)) | 0; // 4d2200: movsx ecx, word ptr [ebp + 0x80]
        R.eax = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 4d2207: movsx eax, ax
        R.m.w32(((R.esp + 0x2c) | 0) >>> 0, (R.eax >>> 0)); // 4d220a: mov dword ptr [esp + 0x2c], eax
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.ecx >>> 0)); // 4d220e: mov dword ptr [esp + 0x38], ecx
        R.eax = (((R.ecx + R.eax + -0xfa0) | 0)) | 0; // 4d2212: lea eax, [ecx + eax - 0xfa0]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 4d2219: lea eax, [eax + eax*4]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 4d221c: lea eax, [eax + eax*4]
        R.eax = (((R.eax + R.eax * 8) | 0)) | 0; // 4d221f: lea eax, [eax + eax*8]
        R.sub((R.eax >>> 0), 0x249f0, 32); // 4d2222: cmp eax, 0x249f0
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, (R.eax >>> 0)); // 4d2227: mov dword ptr [esp + 0x28], eax
        if (!R.cL) { pc = 180; continue; } // 4d222b: jge 0x4d2237
        pc = 179; continue;
      case 179: // 4d222d
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, 0x249f0); // 4d222d: mov dword ptr [esp + 0x28], 0x249f0
        pc = 182; continue; // 4d2235: jmp 0x4d2246
      case 180: // 4d2237
        R.sub((R.eax >>> 0), 0x1e8480, 32); // 4d2237: cmp eax, 0x1e8480
        if (R.cLE) { pc = 182; continue; } // 4d223c: jle 0x4d2246
        pc = 181; continue;
      case 181: // 4d223e
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, 0x1e8480); // 4d223e: mov dword ptr [esp + 0x28], 0x1e8480
        pc = 182; continue;
      default: return pc;
    }
  }
}
function f_4d1600_22(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 182: // 4d2246
        R.fpush(R.f64(((R.esp + 0x6c) | 0))); // 4d2246: fld qword ptr [esp + 0x6c]
        R.st[0] = R.st[0] * 0.5; // 4d224a: fmul qword ptr [0x968968]
        R.st[0] = R.st[0] + 50.0; // 4d2250: fadd qword ptr [0x968ff8]
        R.fpush(R.m.s32(((R.esp + 0x2c) | 0) >>> 0)); // 4d2256: fild dword ptr [esp + 0x2c]
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d225a: fild dword ptr [esp + 0x38]
        R.st[0] = R.st[0] * 1.2; // 4d225e: fmul qword ptr [0x968978]
        R.st[0] = R.st[0] - 2000.0; // 4d2264: fsub qword ptr [0x9688f8]
        R.st[0] = R.st[1] - R.st[0]; // 4d226a: fsubr st(1)
        { const t = R.st[0]; R.st[0] = R.st[1]; R.st[1] = t; } // 4d226c: fxch st(1)
        R.st[0] = R.st[0] * 5e-08; // 4d226e: fmul qword ptr [0x968ff0]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 4d2274: fmulp st(1)
        R.st[0] = R.st[0] + 1.0; // 4d2276: fadd qword ptr [0x967890]
        R.st[0] = R.st[0] * R.st[1]; // 4d227c: fmul st(1)
        R.st[0] = R.st[0] + 100.0; // 4d227e: fadd qword ptr [0x9688a8]
        R.st[0] = R.st[0] - R.st[1]; // 4d2284: fsub st(1)
        R.st[0] = R.st[0] * 0.01; // 4d2286: fmul qword ptr [0x967898]
        R.m.wf64(((R.esp + 0x2c) | 0) >>> 0, R.st[0]); R.fpop(); // 4d228c: fstp qword ptr [esp + 0x2c]
        R.fpop(); // 4d2290: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x2c) | 0))); // 4d2292: fld qword ptr [esp + 0x2c]
        R.fcom(R.st[0], 1.0); R.fpop(); // 4d2296: fcomp qword ptr [0x967890]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d229c: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 4d229e: test ah, 0x41
        if (!R.zf) { pc = 184; continue; } // 4d22a1: jne 0x4d22b6
        pc = 183; continue;
      case 183: // 4d22a3
        R.fpush(R.f64(((R.esp + 0x2c) | 0))); // 4d22a3: fld qword ptr [esp + 0x2c]
        R.fpush(5.0); // 4d22a7: fld qword ptr [0x9688a0]
        R.call(0x945ff0, { n: 0, thisEcx: false, calleeClean: false, float: true }); // 4d22ad: call 0x945ff0
        R.m.wf64(((R.esp + 0x2c) | 0) >>> 0, R.st[0]); R.fpop(); // 4d22b2: fstp qword ptr [esp + 0x2c]
        pc = 184; continue;
      case 184: // 4d22b6
        R.fpush(1.0); // 4d22b6: fld qword ptr [0x967890]
        R.fcom(R.st[0], R.f64(((R.esp + 0x2c) | 0))); R.fpop(); // 4d22bc: fcomp qword ptr [esp + 0x2c]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d22c0: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 4d22c2: test ah, 0x41
        if (!R.zf) { pc = 186; continue; } // 4d22c5: jne 0x4d22d9
        pc = 185; continue;
      case 185: // 4d22c7
        R.m.w32(((R.esp + 0x2c) | 0) >>> 0, 0x0); // 4d22c7: mov dword ptr [esp + 0x2c], 0
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, 0x3ff00000); // 4d22cf: mov dword ptr [esp + 0x30], 0x3ff00000
        pc = 188; continue; // 4d22d7: jmp 0x4d22fa
      case 186: // 4d22d9
        R.fpush(3.0); // 4d22d9: fld qword ptr [0x968930]
        R.fcom(R.st[0], R.f64(((R.esp + 0x2c) | 0))); R.fpop(); // 4d22df: fcomp qword ptr [esp + 0x2c]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d22e3: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d22e5: test ah, 1
        if (R.zf) { pc = 188; continue; } // 4d22e8: je 0x4d22fa
        pc = 187; continue;
      case 187: // 4d22ea
        R.m.w32(((R.esp + 0x2c) | 0) >>> 0, 0x0); // 4d22ea: mov dword ptr [esp + 0x2c], 0
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, 0x40080000); // 4d22f2: mov dword ptr [esp + 0x30], 0x40080000
        pc = 188; continue;
      default: return pc;
    }
  }
}
function f_4d1600_23(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 188: // 4d22fa
        R.fpush(R.m.s32(((R.esp + 0x28) | 0) >>> 0)); // 4d22fa: fild dword ptr [esp + 0x28]
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x5c) | 0)); // 4d22fe: fmul qword ptr [esp + 0x5c]
        R.ftol(); // 4d2302: call 0x945640
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d2307: fild dword ptr [esp + 0x14]
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.eax >>> 0)); // 4d230b: mov dword ptr [esp + 0x38], eax
        R.m.wf64(((R.esp + 0x54) | 0) >>> 0, R.st[0]); // 4d230f: fst qword ptr [esp + 0x54]
        R.fpush(R.st[0]); // 4d2313: fld st(0)
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x5c) | 0)); // 4d2315: fmul qword ptr [esp + 0x5c]
        R.st[0] = R.st[0] - R.st[1]; // 4d2319: fsub st(1)
        R.ftol(); // 4d231b: call 0x945640
        R.fpop(); // 4d2320: fstp st(0)
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, (R.eax >>> 0)); // 4d2322: mov dword ptr [esp + 0x28], eax
        R.fpush(R.m.s32(((R.esp + 0x28) | 0) >>> 0)); // 4d2326: fild dword ptr [esp + 0x28]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d232a: test eax, eax
        if (!R.cL) { pc = 193; continue; } // 4d232c: jge 0x4d2373
        pc = 189; continue;
      case 189: // 4d232e
        R.fpush(R.f64(((R.esp + 0x54) | 0))); // 4d232e: fld qword ptr [esp + 0x54]
        R.st[0] = R.st[0] * -0.4; // 4d2332: fmul qword ptr [0x968fe8]
        R.m.wf64(((R.esp + 0x84) | 0) >>> 0, R.st[0]); R.fpop(); // 4d2338: fstp qword ptr [esp + 0x84]
        R.fcom(R.st[0], R.f64(((R.esp + 0x84) | 0))); // 4d233f: fcom qword ptr [esp + 0x84]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d2346: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 4d2348: test ah, 0x41
        if (R.zf) { pc = 191; continue; } // 4d234b: je 0x4d2356
        pc = 190; continue;
      case 190: // 4d234d
        R.fpop(); // 4d234d: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x84) | 0))); // 4d234f: fld qword ptr [esp + 0x84]
        pc = 191; continue;
      case 191: // 4d2356
        R.ftol(); // 4d2356: call 0x945640
        R.esi = ((R.eax >>> 0)) | 0; // 4d235b: mov esi, eax
        R.sub((R.esi >>> 0), 0xffd23940, 32); // 4d235d: cmp esi, 0xffd23940
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, (R.esi >>> 0)); // 4d2363: mov dword ptr [esp + 0x28], esi
        if (!R.cL) { pc = 198; continue; } // 4d2367: jge 0x4d23d8
        pc = 192; continue;
      case 192: // 4d2369
        R.esi = (0xffd23940) | 0; // 4d2369: mov esi, 0xffd23940
        pc = 203; continue; // 4d236e: jmp 0x4d2410
      case 193: // 4d2373
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x4c) | 0)); // 4d2373: fmul qword ptr [esp + 0x4c]
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d2377: fild dword ptr [esp + 0x38]
        R.m.wf64(((R.esp + 0x84) | 0) >>> 0, R.st[0]); R.fpop(); // 4d237b: fstp qword ptr [esp + 0x84]
        R.fcom(R.st[0], R.f64(((R.esp + 0x84) | 0))); // 4d2382: fcom qword ptr [esp + 0x84]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d2389: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d238b: test ah, 1
        if (!R.zf) { pc = 195; continue; } // 4d238e: jne 0x4d2399
        pc = 194; continue;
      case 194: // 4d2390
        R.fpop(); // 4d2390: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x84) | 0))); // 4d2392: fld qword ptr [esp + 0x84]
        pc = 195; continue;
      default: return pc;
    }
  }
}
function f_4d1600_24(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 195: // 4d2399
        R.ftol(); // 4d2399: call 0x945640
        R.fpush(R.f64(((R.esp + 0x4c) | 0))); // 4d239e: fld qword ptr [esp + 0x4c]
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x4c) | 0)); // 4d23a2: fmul qword ptr [esp + 0x4c]
        R.fpush(25.0); // 4d23a6: fld qword ptr [0x968890]
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, (R.eax >>> 0)); // 4d23ac: mov dword ptr [esp + 0x28], eax
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 4d23b0: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d23b2: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d23b4: test ah, 1
        if (R.zf) { pc = 197; continue; } // 4d23b7: je 0x4d23c1
        pc = 196; continue;
      case 196: // 4d23b9
        R.fpop(); // 4d23b9: fstp st(0)
        R.fpush(25.0); // 4d23bb: fld qword ptr [0x968890]
        pc = 197; continue;
      case 197: // 4d23c1
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x64) | 0)); // 4d23c1: fmul qword ptr [esp + 0x64]
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x74) | 0)); // 4d23c5: fmul qword ptr [esp + 0x74]
        R.st[0] = R.st[0] * R.m.s32(((R.esp + 0x28) | 0) >>> 0); // 4d23c9: fimul dword ptr [esp + 0x28]
        R.ftol(); // 4d23cd: call 0x945640
        R.esi = ((R.eax >>> 0)) | 0; // 4d23d2: mov esi, eax
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, (R.esi >>> 0)); // 4d23d4: mov dword ptr [esp + 0x28], esi
        pc = 198; continue;
      case 198: // 4d23d8
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 4d23d8: test esi, esi
        if (R.cLE) { pc = 201; continue; } // 4d23da: jle 0x4d2403
        pc = 199; continue;
      case 199: // 4d23dc
        R.eax = (R.m.u32(((R.esp + 0x98) | 0) >>> 0)) | 0; // 4d23dc: mov eax, dword ptr [esp + 0x98]
        R.push(0x0); // 4d23e3: push 0
        R.push((R.eax >>> 0)); // 4d23e5: push eax
        R.call(0x544520, { n: 2, thisEcx: false, calleeClean: false }); // 4d23e6: call 0x544520
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 4d23eb: add esp, 8
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d23ee: test eax, eax
        if (R.zf) { pc = 201; continue; } // 4d23f0: je 0x4d2403
        pc = 200; continue;
      case 200: // 4d23f2
        R.fpush(R.m.s32(((R.esp + 0x28) | 0) >>> 0)); // 4d23f2: fild dword ptr [esp + 0x28]
        R.st[0] = R.st[0] * 0.5; // 4d23f6: fmul qword ptr [0x968968]
        R.ftol(); // 4d23fc: call 0x945640
        R.esi = ((R.eax >>> 0)) | 0; // 4d2401: mov esi, eax
        pc = 201; continue;
      case 201: // 4d2403
        R.sub((R.esi >>> 0), 0x2faf080, 32); // 4d2403: cmp esi, 0x2faf080
        if (R.cLE) { pc = 203; continue; } // 4d2409: jle 0x4d2410
        pc = 202; continue;
      case 202: // 4d240b
        R.esi = (0x2faf080) | 0; // 4d240b: mov esi, 0x2faf080
        pc = 203; continue;
      case 203: // 4d2410
        R.fpush(R.f64(((R.esp + 0x2c) | 0))); // 4d2410: fld qword ptr [esp + 0x2c]
        R.fcom(R.st[0], 1.0); R.fpop(); // 4d2414: fcomp qword ptr [0x967890]
        R.ebx = (R.m.u32(((R.esp + 0x14) | 0) >>> 0)) | 0; // 4d241a: mov ebx, dword ptr [esp + 0x14]
        R.ebx = (R.add((R.ebx >>> 0), (R.esi >>> 0), 32)) | 0; // 4d241e: add ebx, esi
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.ebx >>> 0)); // 4d2420: mov dword ptr [esp + 0x14], ebx
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d2424: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 4d2426: test ah, 0x41
        if (!R.zf) { pc = 209; continue; } // 4d2429: jne 0x4d2499
        pc = 204; continue;
      default: return pc;
    }
  }
}
function f_4d1600_25(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 204: // 4d242b
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d242b: fild dword ptr [esp + 0x14]
        R.fpush(R.st[0]); // 4d242f: fld st(0)
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x2c) | 0)); // 4d2431: fmul qword ptr [esp + 0x2c]
        R.st[0] = R.st[0] - R.st[1]; // 4d2435: fsub st(1)
        R.ftol(); // 4d2437: call 0x945640
        R.sub((R.eax >>> 0), 0x4c4b40, 32); // 4d243c: cmp eax, 0x4c4b40
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, (R.eax >>> 0)); // 4d2441: mov dword ptr [esp + 0x28], eax
        R.fpop(); // 4d2445: fstp st(0)
        if (R.cLE) { pc = 206; continue; } // 4d2447: jle 0x4d2462
        pc = 205; continue;
      case 205: // 4d2449
        R.fpush(R.m.s32(((R.esp + 0x28) | 0) >>> 0)); // 4d2449: fild dword ptr [esp + 0x28]
        R.st[0] = R.st[0] * 0.625; // 4d244d: fmul qword ptr [0x968fe0]
        R.st[0] = R.st[0] + 1875000.0; // 4d2453: fadd qword ptr [0x968fd8]
        R.ftol(); // 4d2459: call 0x945640
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, (R.eax >>> 0)); // 4d245e: mov dword ptr [esp + 0x28], eax
        pc = 206; continue;
      case 206: // 4d2462
        R.sub((R.eax >>> 0), 0x989680, 32); // 4d2462: cmp eax, 0x989680
        if (R.cLE) { pc = 208; continue; } // 4d2467: jle 0x4d2482
        pc = 207; continue;
      case 207: // 4d2469
        R.fpush(R.m.s32(((R.esp + 0x28) | 0) >>> 0)); // 4d2469: fild dword ptr [esp + 0x28]
        R.st[0] = R.st[0] * 0.125; // 4d246d: fmul qword ptr [0x968fd0]
        R.st[0] = R.st[0] + 8750000.0; // 4d2473: fadd qword ptr [0x968fc8]
        R.ftol(); // 4d2479: call 0x945640
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, (R.eax >>> 0)); // 4d247e: mov dword ptr [esp + 0x28], eax
        pc = 208; continue;
      case 208: // 4d2482
        R.fpush(R.f64(((R.esp + 0x64) | 0))); // 4d2482: fld qword ptr [esp + 0x64]
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x74) | 0)); // 4d2486: fmul qword ptr [esp + 0x74]
        R.st[0] = R.st[0] * R.m.s32(((R.esp + 0x28) | 0) >>> 0); // 4d248a: fimul dword ptr [esp + 0x28]
        R.ftol(); // 4d248e: call 0x945640
        R.ebx = (R.add((R.ebx >>> 0), (R.eax >>> 0), 32)) | 0; // 4d2493: add ebx, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.ebx >>> 0)); // 4d2495: mov dword ptr [esp + 0x14], ebx
        pc = 209; continue;
      case 209: // 4d2499
        R.sub((R.ebx >>> 0), 0x3e8, 32); // 4d2499: cmp ebx, 0x3e8
        if (!R.cL) { pc = 211; continue; } // 4d249f: jge 0x4d24aa
        pc = 210; continue;
      case 210: // 4d24a1
        R.ebx = (0x3e8) | 0; // 4d24a1: mov ebx, 0x3e8
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.ebx >>> 0)); // 4d24a6: mov dword ptr [esp + 0x14], ebx
        pc = 211; continue;
      case 211: // 4d24aa
        R.esi = (R.m.u32(((R.esp + 0x98) | 0) >>> 0)) | 0; // 4d24aa: mov esi, dword ptr [esp + 0x98]
        R.ecx = (R.m.u32(((0xde1f54) | 0) >>> 0)) | 0; // 4d24b1: mov ecx, dword ptr [0xde1f54]
        R.push(0x0); // 4d24b7: push 0
        R.push((R.ebp >>> 0)); // 4d24b9: push ebp
        R.push((R.esi >>> 0)); // 4d24ba: push esi
        R.call(0x8c7560, { n: 3, thisEcx: true, calleeClean: true }); // 4d24bb: call 0x8c7560
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d24c0: test eax, eax
        if (R.zf) { pc = 214; continue; } // 4d24c2: je 0x4d24d5
        pc = 212; continue;
      case 212: // 4d24c4
        R.eax = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 4d24c4: mov eax, dword ptr [esp + 0x1c]
        R.sub((R.ebx >>> 0), (R.eax >>> 0), 32); // 4d24c8: cmp ebx, eax
        if (R.cL) { pc = 232; continue; } // 4d24ca: jl 0x4d2585
        pc = 213; continue;
      default: return pc;
    }
  }
}
function f_4d1600_26(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 213: // 4d24d0
        pc = 231; continue; // 4d24d0: jmp 0x4d257f
      case 214: // 4d24d5
        R.push(0x0); // 4d24d5: push 0
        R.push((R.esi >>> 0)); // 4d24d7: push esi
        R.call(0x544520, { n: 2, thisEcx: false, calleeClean: false }); // 4d24d8: call 0x544520
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 4d24dd: add esp, 8
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d24e0: test eax, eax
        if (R.zf) { pc = 219; continue; } // 4d24e2: je 0x4d250f
        pc = 215; continue;
      case 215: // 4d24e4
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 4d24e4: test edi, edi
        if (R.zf) { pc = 217; continue; } // 4d24e6: je 0x4d24f3
        pc = 216; continue;
      case 216: // 4d24e8
        R.ecx = ((R.ecx & 0xffff0000) | (((R.m.u16(((R.edi) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 4d24e8: mov cx, word ptr [edi]
        R.ecx = ((R.ecx & 0xffff0000) | (((R.logic(((R.ecx >>> 0) & 0xffff) & 0x800, 16)) & 0xffff) << 0)) | 0; // 4d24eb: and cx, 0x800
        R.m.w16(((R.edi) | 0) >>> 0, ((R.ecx >>> 0) & 0xffff)); // 4d24f0: mov word ptr [edi], cx
        pc = 217; continue;
      case 217: // 4d24f3
        R.fpush(R.m.s32(((R.esi + 0x52) | 0) >>> 0)); // 4d24f3: fild dword ptr [esi + 0x52]
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x44) | 0)); // 4d24f6: fmul qword ptr [esp + 0x44]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d24fa: fild dword ptr [esp + 0x14]
        R.m.wf64(((R.esp + 0x54) | 0) >>> 0, R.st[0]); R.fpop(); // 4d24fe: fstp qword ptr [esp + 0x54]
        R.fcom(R.st[0], R.f64(((R.esp + 0x54) | 0))); // 4d2502: fcom qword ptr [esp + 0x54]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d2506: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d2508: test ah, 1
        if (!R.zf) { pc = 230; continue; } // 4d250b: jne 0x4d257a
        pc = 218; continue;
      case 218: // 4d250d
        pc = 229; continue; // 4d250d: jmp 0x4d2574
      case 219: // 4d250f
        R.eax = (R.m.u32(((R.esi + 0x39) | 0) >>> 0)) | 0; // 4d250f: mov eax, dword ptr [esi + 0x39]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d2512: test eax, eax
        if (R.zf) { pc = 232; continue; } // 4d2514: je 0x4d2585
        pc = 220; continue;
      case 220: // 4d2516
        R.edx = (((R.esp + 0x40) | 0)) | 0; // 4d2516: lea edx, [esp + 0x40]
        R.push(0x1); // 4d251a: push 1
        R.push((R.edx >>> 0)); // 4d251c: push edx
        R.push((R.eax >>> 0)); // 4d251d: push eax
        R.call(0x540a50, { n: 3, thisEcx: false, calleeClean: false }); // 4d251e: call 0x540a50
        R.esp = (R.add((R.esp >>> 0), 0xc, 32)) | 0; // 4d2523: add esp, 0xc
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d2526: test eax, eax
        if (R.zf) { pc = 232; continue; } // 4d2528: je 0x4d2585
        pc = 221; continue;
      case 221: // 4d252a
        R.eax = (R.m.u32(((R.esp + 0x40) | 0) >>> 0)) | 0; // 4d252a: mov eax, dword ptr [esp + 0x40]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d252e: test eax, eax
        if (!R.zf) { pc = 232; continue; } // 4d2530: jne 0x4d2585
        pc = 222; continue;
      case 222: // 4d2532
        R.eax = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 4d2532: mov eax, dword ptr [esp + 0x18]
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.eax + 0x4f) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d2536: mov al, byte ptr [eax + 0x4f]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0xf0, 8)) & 0xff) << 0)) | 0; // 4d2539: and al, 0xf0
        R.sub(((R.eax >>> 0) & 0xff), 0x10, 8); // 4d253b: cmp al, 0x10
        if (R.zf) { pc = 232; continue; } // 4d253d: je 0x4d2585
        pc = 223; continue;
      default: return pc;
    }
  }
}
function f_4d1600_27(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 223: // 4d253f
        R.sub(((R.eax >>> 0) & 0xff), 0x50, 8); // 4d253f: cmp al, 0x50
        if (R.zf) { pc = 232; continue; } // 4d2541: je 0x4d2585
        pc = 224; continue;
      case 224: // 4d2543
        R.sub(((R.eax >>> 0) & 0xff), 0x20, 8); // 4d2543: cmp al, 0x20
        if (R.zf) { pc = 232; continue; } // 4d2545: je 0x4d2585
        pc = 225; continue;
      case 225: // 4d2547
        R.sub(((R.eax >>> 0) & 0xff), 0x30, 8); // 4d2547: cmp al, 0x30
        if (R.zf) { pc = 232; continue; } // 4d2549: je 0x4d2585
        pc = 226; continue;
      case 226: // 4d254b
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 4d254b: test edi, edi
        if (R.zf) { pc = 228; continue; } // 4d254d: je 0x4d255a
        pc = 227; continue;
      case 227: // 4d254f
        R.ecx = ((R.ecx & 0xffff0000) | (((R.m.u16(((R.edi) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 4d254f: mov cx, word ptr [edi]
        R.ecx = ((R.ecx & 0xffff0000) | (((R.logic(((R.ecx >>> 0) & 0xffff) & 0x800, 16)) & 0xffff) << 0)) | 0; // 4d2552: and cx, 0x800
        R.m.w16(((R.edi) | 0) >>> 0, ((R.ecx >>> 0) & 0xffff)); // 4d2557: mov word ptr [edi], cx
        pc = 228; continue;
      case 228: // 4d255a
        R.fpush(R.m.s32(((R.esi + 0x52) | 0) >>> 0)); // 4d255a: fild dword ptr [esi + 0x52]
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x44) | 0)); // 4d255d: fmul qword ptr [esp + 0x44]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d2561: fild dword ptr [esp + 0x14]
        R.m.wf64(((R.esp + 0x54) | 0) >>> 0, R.st[0]); R.fpop(); // 4d2565: fstp qword ptr [esp + 0x54]
        R.fcom(R.st[0], R.f64(((R.esp + 0x54) | 0))); // 4d2569: fcom qword ptr [esp + 0x54]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d256d: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d256f: test ah, 1
        if (!R.zf) { pc = 230; continue; } // 4d2572: jne 0x4d257a
        pc = 229; continue;
      case 229: // 4d2574
        R.fpop(); // 4d2574: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x54) | 0))); // 4d2576: fld qword ptr [esp + 0x54]
        pc = 230; continue;
      case 230: // 4d257a
        R.ftol(); // 4d257a: call 0x945640
        pc = 231; continue;
      case 231: // 4d257f
        R.ebx = ((R.eax >>> 0)) | 0; // 4d257f: mov ebx, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.ebx >>> 0)); // 4d2581: mov dword ptr [esp + 0x14], ebx
        pc = 232; continue;
      case 232: // 4d2585
        R.push(0x0); // 4d2585: push 0
        R.push(0x0); // 4d2587: push 0
        R.push(0x1); // 4d2589: push 1
        R.push(0x0); // 4d258b: push 0
        R.push((R.ebp >>> 0)); // 4d258d: push ebp
        R.call(0x600a50, { n: 5, thisEcx: false, calleeClean: false }); // 4d258e: call 0x600a50
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 4d2593: add esp, 0x14
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d2596: test eax, eax
        if (!R.zf) { pc = 242; continue; } // 4d2598: jne 0x4d261f
        pc = 233; continue;
      case 233: // 4d259e
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 4d259e: test edi, edi
        if (R.zf) { pc = 242; continue; } // 4d25a0: je 0x4d261f
        pc = 234; continue;
      default: return pc;
    }
  }
}
function f_4d1600_28(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 234: // 4d25a2
        R.edx = ((R.edx & 0xffff0000) | (((R.m.u16(((R.edi) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 4d25a2: mov dx, word ptr [edi]
        R.edx = (R.logic((R.edx >>> 0) & 0x800, 32)) | 0; // 4d25a5: and edx, 0x800
        R.logic(((R.edx >>> 0) & 0xffff) & ((R.edx >>> 0) & 0xffff), 16); // 4d25ab: test dx, dx
        if (R.zf) { pc = 242; continue; } // 4d25ae: je 0x4d261f
        pc = 235; continue;
      case 235: // 4d25b0
        R.sub(R.m.u16(((R.ebp + 0x80) | 0) >>> 0), 0x109a, 16); // 4d25b0: cmp word ptr [ebp + 0x80], 0x109a
        if (R.cLE) { pc = 242; continue; } // 4d25b9: jle 0x4d261f
        pc = 236; continue;
      case 236: // 4d25bb
        R.sub(R.m.u8(((R.esi + 0x18) | 0) >>> 0), 0x12, 8); // 4d25bb: cmp byte ptr [esi + 0x18], 0x12
        if (R.cLE) { pc = 242; continue; } // 4d25bf: jle 0x4d261f
        pc = 237; continue;
      case 237: // 4d25c1
        R.eax = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 4d25c1: mov eax, dword ptr [esp + 0x18]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.eax + 0x4f) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d25c5: mov cl, byte ptr [eax + 0x4f]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.logic(((R.ecx >>> 0) & 0xff) & 0xf0, 8)) & 0xff) << 0)) | 0; // 4d25c8: and cl, 0xf0
        R.sub(((R.ecx >>> 0) & 0xff), 0x70, 8); // 4d25cb: cmp cl, 0x70
        if (R.zf) { pc = 242; continue; } // 4d25ce: je 0x4d261f
        pc = 238; continue;
      case 238: // 4d25d0
        R.edi = (R.m.u32(((R.esp + 0x34) | 0) >>> 0)) | 0; // 4d25d0: mov edi, dword ptr [esp + 0x34]
        R.ecx = ((R.edi >>> 0)) | 0; // 4d25d4: mov ecx, edi
        R.call(0x5986b0, { n: 0, thisEcx: true, calleeClean: false }); // 4d25d6: call 0x5986b0
        R.sub(((R.eax >>> 0) & 0xff), 0xff, 8); // 4d25db: cmp al, 0xff
        if (R.zf) { pc = 242; continue; } // 4d25dd: je 0x4d261f
        pc = 239; continue;
      case 239: // 4d25df
        R.ecx = ((R.edi >>> 0)) | 0; // 4d25df: mov ecx, edi
        R.call(0x5986b0, { n: 0, thisEcx: true, calleeClean: false }); // 4d25e1: call 0x5986b0
        R.sub(((R.eax >>> 0) & 0xff), 0xfe, 8); // 4d25e6: cmp al, 0xfe
        if (R.zf) { pc = 242; continue; } // 4d25e8: je 0x4d261f
        pc = 240; continue;
      case 240: // 4d25ea
        R.eax = (((R.m.u16(((R.ebp + 0x80) | 0) >>> 0)) << 16 >> 16)) | 0; // 4d25ea: movsx eax, word ptr [ebp + 0x80]
        R.eax = (R.add((R.eax >>> 0), 0x61a8, 32)) | 0; // 4d25f1: add eax, 0x61a8
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 4d25f6: lea eax, [eax + eax*4]
        R.edx = (((R.eax + R.eax * 4) | 0)) | 0; // 4d25f9: lea edx, [eax + eax*4]
        R.edx = (R.shl((R.edx >>> 0), 0x2, 32)) | 0; // 4d25fc: shl edx, 2
        R.sub((R.ebx >>> 0), (R.edx >>> 0), 32); // 4d25ff: cmp ebx, edx
        if (!R.cL) { pc = 242; continue; } // 4d2601: jge 0x4d261f
        pc = 241; continue;
      case 241: // 4d2603
        R.eax = (R.m.u32(((R.esi + 0x39) | 0) >>> 0)) | 0; // 4d2603: mov eax, dword ptr [esi + 0x39]
        R.eax = (((R.m.u16(((R.eax + 0x80) | 0) >>> 0)) << 16 >> 16)) | 0; // 4d2606: movsx eax, word ptr [eax + 0x80]
        R.eax = (R.add((R.eax >>> 0), 0x61a8, 32)) | 0; // 4d260d: add eax, 0x61a8
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 4d2612: lea eax, [eax + eax*4]
        R.ecx = (((R.eax + R.eax * 4) | 0)) | 0; // 4d2615: lea ecx, [eax + eax*4]
        R.ecx = (R.shl((R.ecx >>> 0), 0x2, 32)) | 0; // 4d2618: shl ecx, 2
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.ecx >>> 0)); // 4d261b: mov dword ptr [esp + 0x14], ecx
        pc = 242; continue;
      case 242: // 4d261f
        R.ecx = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 4d261f: mov ecx, dword ptr [esp + 0x1c]
        R.edx = (((R.ecx + 0x4c4b40) | 0)) | 0; // 4d2623: lea edx, [ecx + 0x4c4b40]
        R.ecx = (((R.ecx + R.ecx * 2) | 0)) | 0; // 4d2629: lea ecx, [ecx + ecx*2]
        R.sub((R.ecx >>> 0), (R.edx >>> 0), 32); // 4d262c: cmp ecx, edx
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, (R.ecx >>> 0)); // 4d262e: mov dword ptr [esp + 0x28], ecx
        if (!R.cLE) { pc = 244; continue; } // 4d2632: jg 0x4d2638
        pc = 243; continue;
      default: return pc;
    }
  }
}
function f_4d1600_29(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 243: // 4d2634
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, (R.edx >>> 0)); // 4d2634: mov dword ptr [esp + 0x28], edx
        pc = 244; continue;
      case 244: // 4d2638
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d2638: fild dword ptr [esp + 0x14]
        R.fpush(R.m.s32(((R.esp + 0x28) | 0) >>> 0)); // 4d263c: fild dword ptr [esp + 0x28]
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x44) | 0)); // 4d2640: fmul qword ptr [esp + 0x44]
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x4c) | 0)); // 4d2644: fmul qword ptr [esp + 0x4c]
        R.fpush(R.st[1]); // 4d2648: fld st(1)
        R.fcom(R.st[0], R.st[1]); R.fpop(); R.fpop(); // 4d264a: fcompp 
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d264c: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d264e: test ah, 1
        if (!R.zf) { pc = 248; continue; } // 4d2651: jne 0x4d266d
        pc = 245; continue;
      case 245: // 4d2653
        R.sub((R.ecx >>> 0), (R.edx >>> 0), 32); // 4d2653: cmp ecx, edx
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, (R.ecx >>> 0)); // 4d2655: mov dword ptr [esp + 0x28], ecx
        R.fpop(); // 4d2659: fstp st(0)
        if (!R.cLE) { pc = 247; continue; } // 4d265b: jg 0x4d2661
        pc = 246; continue;
      case 246: // 4d265d
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, (R.edx >>> 0)); // 4d265d: mov dword ptr [esp + 0x28], edx
        pc = 247; continue;
      case 247: // 4d2661
        R.fpush(R.m.s32(((R.esp + 0x28) | 0) >>> 0)); // 4d2661: fild dword ptr [esp + 0x28]
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x44) | 0)); // 4d2665: fmul qword ptr [esp + 0x44]
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x4c) | 0)); // 4d2669: fmul qword ptr [esp + 0x4c]
        pc = 248; continue;
      case 248: // 4d266d
        R.ftol(); // 4d266d: call 0x945640
        R.edi = ((R.eax >>> 0)) | 0; // 4d2672: mov edi, eax
        R.eax = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 4d2674: mov eax, dword ptr [esp + 0x1c]
        R.sub((R.edi >>> 0), (R.eax >>> 0), 32); // 4d2678: cmp edi, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 4d267a: mov dword ptr [esp + 0x14], edi
        if (R.cLE) { pc = 265; continue; } // 4d267e: jle 0x4d27e7
        pc = 249; continue;
      case 249: // 4d2684
        R.ecx = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 4d2684: mov ecx, dword ptr [esp + 0x18]
        R.eax = (R.m.u32(((R.ecx + 0x45) | 0) >>> 0)) | 0; // 4d2688: mov eax, dword ptr [ecx + 0x45]
        R.logic(((R.eax >>> 0) & 0xff) & 0x6b, 8); // 4d268b: test al, 0x6b
        if (!R.zf) { pc = 251; continue; } // 4d268d: jne 0x4d2698
        pc = 250; continue;
      case 250: // 4d268f
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d268f: test ah, 1
        if (R.zf) { pc = 265; continue; } // 4d2692: je 0x4d27e7
        pc = 251; continue;
      default: return pc;
    }
  }
}
function f_4d1600_30(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 251: // 4d2698
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 4d2698: xor eax, eax
        R.edx = (R.logic((R.edx >>> 0) ^ (R.edx >>> 0), 32)) | 0; // 4d269a: xor edx, edx
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.ecx + 0x2f) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 4d269c: mov ax, word ptr [ecx + 0x2f]
        R.edx = ((R.edx & 0xffff0000) | (((R.m.u16(((0xae2c92) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 4d26a0: mov dx, word ptr [0xae2c92]
        R.ecx = (((R.m.u16(((R.ecx + 0x2d) | 0) >>> 0)) << 16 >> 16)) | 0; // 4d26a7: movsx ecx, word ptr [ecx + 0x2d]
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 4d26ab: sub eax, edx
        R.edx = (((R.eax + R.eax * 8) | 0)) | 0; // 4d26ad: lea edx, [eax + eax*8]
        R.eax = (((R.eax + R.edx * 8) | 0)) | 0; // 4d26b0: lea eax, [eax + edx*8]
        R.edx = (((R.m.u16(((0xae2c90) | 0) >>> 0)) << 16 >> 16)) | 0; // 4d26b3: movsx edx, word ptr [0xae2c90]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 4d26ba: lea eax, [eax + eax*4]
        R.eax = (R.add((R.eax >>> 0), (R.ecx >>> 0), 32)) | 0; // 4d26bd: add eax, ecx
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 4d26bf: sub eax, edx
        R.sub((R.eax >>> 0), 0x16d, 32); // 4d26c1: cmp eax, 0x16d
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, (R.eax >>> 0)); // 4d26c6: mov dword ptr [esp + 0x28], eax
        if (R.cL) { pc = 253; continue; } // 4d26ca: jl 0x4d26d2
        pc = 252; continue;
      case 252: // 4d26cc
        R.esi = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 4d26cc: mov esi, dword ptr [esp + 0x1c]
        pc = 254; continue; // 4d26d0: jmp 0x4d26e7
      case 253: // 4d26d2
        R.fpush(R.m.s32(((R.esp + 0x28) | 0) >>> 0)); // 4d26d2: fild dword ptr [esp + 0x28]
        R.st[0] = R.st[0] * 0.0027397260273972603; // 4d26d6: fmul qword ptr [0x968e10]
        R.st[0] = R.st[0] * R.m.s32(((R.esp + 0x1c) | 0) >>> 0); // 4d26dc: fimul dword ptr [esp + 0x1c]
        R.ftol(); // 4d26e0: call 0x945640
        R.esi = ((R.eax >>> 0)) | 0; // 4d26e5: mov esi, eax
        pc = 254; continue;
      case 254: // 4d26e7
        R.fpush(R.m.s32(((R.esp + 0x28) | 0) >>> 0)); // 4d26e7: fild dword ptr [esp + 0x28]
        R.m.w32(((R.esp + 0x2c) | 0) >>> 0, (R.esi >>> 0)); // 4d26eb: mov dword ptr [esp + 0x2c], esi
        R.st[0] = R.st[0] * 0.0027; // 4d26ef: fmul qword ptr [0x968fc0]
        R.st[0] = R.st[0] - 0.485; // 4d26f5: fsub qword ptr [0x968fb8]
        R.fpush(0.0); // 4d26fb: fld qword ptr [0x9689a0]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 4d2701: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d2703: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 4d2705: test ah, 0x41
        if (!R.zf) { pc = 256; continue; } // 4d2708: jne 0x4d2714
        pc = 255; continue;
      case 255: // 4d270a
        R.fpop(); // 4d270a: fstp st(0)
        R.fpush(0.0); // 4d270c: fld qword ptr [0x9689a0]
        pc = 258; continue; // 4d2712: jmp 0x4d272b
      case 256: // 4d2714
        R.fpush(1.0); // 4d2714: fld qword ptr [0x967890]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 4d271a: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d271c: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d271e: test ah, 1
        if (R.zf) { pc = 258; continue; } // 4d2721: je 0x4d272b
        pc = 257; continue;
      case 257: // 4d2723
        R.fpop(); // 4d2723: fstp st(0)
        R.fpush(1.0); // 4d2725: fld qword ptr [0x967890]
        pc = 258; continue;
      default: return pc;
    }
  }
}
function f_4d1600_31(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 258: // 4d272b
        R.fpush(R.m.s32(((R.esp + 0x2c) | 0) >>> 0)); // 4d272b: fild dword ptr [esp + 0x2c]
        R.m.wf64(((R.esp + 0x84) | 0) >>> 0, R.st[0]); R.fpop(); // 4d272f: fstp qword ptr [esp + 0x84]
        R.fpush(1.0); // 4d2736: fld qword ptr [0x967890]
        R.st[0] = R.st[0] - R.st[1]; // 4d273c: fsub st(1)
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x84) | 0)); // 4d273e: fmul qword ptr [esp + 0x84]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d2745: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * R.st[2]; // 4d2749: fmul st(2)
        R.st[1] = R.st[1] + R.st[0]; R.fpop(); // 4d274b: faddp st(1)
        R.ftol(); // 4d274d: call 0x945640
        R.fpop(); // 4d2752: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x7c) | 0))); // 4d2754: fld qword ptr [esp + 0x7c]
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x44) | 0)); // 4d2758: fmul qword ptr [esp + 0x44]
        R.ecx = ((R.eax >>> 0)) | 0; // 4d275c: mov ecx, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.ecx >>> 0)); // 4d275e: mov dword ptr [esp + 0x14], ecx
        R.st[0] = R.st[0] + R.st[0]; // 4d2762: fadd st(0), st(0)
        R.fpush(1.0); // 4d2764: fld qword ptr [0x967890]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 4d276a: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d276c: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 4d276e: test ah, 0x41
        if (!R.zf) { pc = 260; continue; } // 4d2771: jne 0x4d277b
        pc = 259; continue;
      case 259: // 4d2773
        R.fpop(); // 4d2773: fstp st(0)
        R.fpush(1.0); // 4d2775: fld qword ptr [0x967890]
        pc = 260; continue;
      case 260: // 4d277b
        R.esi = (R.add((R.esi >>> 0), (R.ecx >>> 0), 32)) | 0; // 4d277b: add esi, ecx
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.esi >>> 0)); // 4d277d: mov dword ptr [esp + 0x38], esi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d2781: fild dword ptr [esp + 0x38]
        R.st[1] = R.st[0] / R.st[1]; R.fpop(); // 4d2785: fdivrp st(1)
        R.fpush(1.0); // 4d2787: fld qword ptr [0x967890]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 4d278d: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d278f: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 4d2791: test ah, 0x41
        if (!R.zf) { pc = 262; continue; } // 4d2794: jne 0x4d27a0
        pc = 261; continue;
      case 261: // 4d2796
        R.fpop(); // 4d2796: fstp st(0)
        R.fpush(1.0); // 4d2798: fld qword ptr [0x967890]
        pc = 264; continue; // 4d279e: jmp 0x4d27b7
      case 262: // 4d27a0
        R.fpush(3.0); // 4d27a0: fld qword ptr [0x968930]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 4d27a6: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d27a8: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d27aa: test ah, 1
        if (R.zf) { pc = 264; continue; } // 4d27ad: je 0x4d27b7
        pc = 263; continue;
      case 263: // 4d27af
        R.fpop(); // 4d27af: fstp st(0)
        R.fpush(3.0); // 4d27b1: fld qword ptr [0x968930]
        pc = 264; continue;
      default: return pc;
    }
  }
}
function f_4d1600_32(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 264: // 4d27b7
        R.st[0] = R.st[0] * 0.375; // 4d27b7: fmul qword ptr [0x968fb0]
        R.st[0] = 1.375 - R.st[0]; // 4d27bd: fsubr qword ptr [0x968fa8]
        R.fpush(1.0); // 4d27c3: fld qword ptr [0x967890]
        R.st[0] = R.st[0] - R.st[1]; // 4d27c9: fsub st(1)
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x84) | 0)); // 4d27cb: fmul qword ptr [esp + 0x84]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d27d2: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * R.st[2]; // 4d27d6: fmul st(2)
        R.st[1] = R.st[1] + R.st[0]; R.fpop(); // 4d27d8: faddp st(1)
        R.ftol(); // 4d27da: call 0x945640
        R.edi = ((R.eax >>> 0)) | 0; // 4d27df: mov edi, eax
        R.fpop(); // 4d27e1: fstp st(0)
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 4d27e3: mov dword ptr [esp + 0x14], edi
        pc = 265; continue;
      case 265: // 4d27e7
        R.eax = (R.m.u32(((0xde1f54) | 0) >>> 0)) | 0; // 4d27e7: mov eax, dword ptr [0xde1f54]
        R.edx = (R.m.u32(((R.esp + 0x98) | 0) >>> 0)) | 0; // 4d27ec: mov edx, dword ptr [esp + 0x98]
        R.push(0x1); // 4d27f3: push 1
        R.push(0x0); // 4d27f5: push 0
        R.ecx = (R.m.u32(((R.eax + 0x856) | 0) >>> 0)) | 0; // 4d27f7: mov ecx, dword ptr [eax + 0x856]
        R.push((R.edx >>> 0)); // 4d27fd: push edx
        R.push((R.ebp >>> 0)); // 4d27fe: push ebp
        R.call(0x849ce0, { n: 4, thisEcx: true, calleeClean: true }); // 4d27ff: call 0x849ce0
        R.esi = ((R.eax >>> 0)) | 0; // 4d2804: mov esi, eax
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.ebp + 0x80) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 4d2806: mov ax, word ptr [ebp + 0x80]
        R.sub(((R.eax >>> 0) & 0xffff), 0xfa0, 16); // 4d280d: cmp ax, 0xfa0
        R.m.w32(((R.esp + 0x2c) | 0) >>> 0, (R.esi >>> 0)); // 4d2811: mov dword ptr [esp + 0x2c], esi
        if (R.cLE) { pc = 507; continue; } // 4d2815: jle 0x4d3826
        pc = 266; continue;
      case 266: // 4d281b
        R.edx = (R.m.u32(((R.ebp + 0x53) | 0) >>> 0)) | 0; // 4d281b: mov edx, dword ptr [ebp + 0x53]
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 4d281e: test edx, edx
        if (R.zf) { pc = 507; continue; } // 4d2820: je 0x4d3826
        pc = 267; continue;
      case 267: // 4d2826
        R.ecx = (R.m.u32(((R.edx) | 0) >>> 0)) | 0; // 4d2826: mov ecx, dword ptr [edx]
        R.ebx = (R.m.u32(((0x9cf2e4) | 0) >>> 0)) | 0; // 4d2828: mov ebx, dword ptr [0x9cf2e4]
        R.sub((R.ecx >>> 0), (R.ebx >>> 0), 32); // 4d282e: cmp ecx, ebx
        if (R.zf) { pc = 277; continue; } // 4d2830: je 0x4d287e
        pc = 268; continue;
      case 268: // 4d2832
        R.sub((R.ecx >>> 0), R.m.u32(((0x9cf360) | 0) >>> 0), 32); // 4d2832: cmp ecx, dword ptr [0x9cf360]
        if (R.zf) { pc = 277; continue; } // 4d2838: je 0x4d287e
        pc = 269; continue;
      case 269: // 4d283a
        R.sub((R.ecx >>> 0), R.m.u32(((0x9cf488) | 0) >>> 0), 32); // 4d283a: cmp ecx, dword ptr [0x9cf488]
        if (R.zf) { pc = 277; continue; } // 4d2840: je 0x4d287e
        pc = 270; continue;
      case 270: // 4d2842
        R.sub((R.ecx >>> 0), R.m.u32(((0x9cf300) | 0) >>> 0), 32); // 4d2842: cmp ecx, dword ptr [0x9cf300]
        if (R.zf) { pc = 277; continue; } // 4d2848: je 0x4d287e
        pc = 271; continue;
      case 271: // 4d284a
        R.sub((R.ecx >>> 0), R.m.u32(((0x9cf314) | 0) >>> 0), 32); // 4d284a: cmp ecx, dword ptr [0x9cf314]
        if (R.zf) { pc = 277; continue; } // 4d2850: je 0x4d287e
        pc = 272; continue;
      case 272: // 4d2852
        R.sub((R.ecx >>> 0), R.m.u32(((0x9cf45c) | 0) >>> 0), 32); // 4d2852: cmp ecx, dword ptr [0x9cf45c]
        if (R.zf) { pc = 277; continue; } // 4d2858: je 0x4d287e
        pc = 273; continue;
      default: return pc;
    }
  }
}
function f_4d1600_33(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 273: // 4d285a
        R.sub((R.ecx >>> 0), R.m.u32(((0x9cf4f8) | 0) >>> 0), 32); // 4d285a: cmp ecx, dword ptr [0x9cf4f8]
        if (R.zf) { pc = 277; continue; } // 4d2860: je 0x4d287e
        pc = 274; continue;
      case 274: // 4d2862
        R.sub((R.ecx >>> 0), R.m.u32(((0x9cf36c) | 0) >>> 0), 32); // 4d2862: cmp ecx, dword ptr [0x9cf36c]
        if (R.zf) { pc = 277; continue; } // 4d2868: je 0x4d287e
        pc = 275; continue;
      case 275: // 4d286a
        R.sub((R.ecx >>> 0), R.m.u32(((0x9cf338) | 0) >>> 0), 32); // 4d286a: cmp ecx, dword ptr [0x9cf338]
        if (R.zf) { pc = 277; continue; } // 4d2870: je 0x4d287e
        pc = 276; continue;
      case 276: // 4d2872
        R.sub((R.ecx >>> 0), R.m.u32(((0x9cf434) | 0) >>> 0), 32); // 4d2872: cmp ecx, dword ptr [0x9cf434]
        if (!R.zf) { pc = 507; continue; } // 4d2878: jne 0x4d3826
        pc = 277; continue;
      case 277: // 4d287e
        R.sub(R.m.u8(((R.edx + 0x85) | 0) >>> 0), 0xc, 8); // 4d287e: cmp byte ptr [edx + 0x85], 0xc
        if (!R.cLE) { pc = 279; continue; } // 4d2885: jg 0x4d2891
        pc = 278; continue;
      case 278: // 4d2887
        R.sub(((R.eax >>> 0) & 0xffff), 0x1b58, 16); // 4d2887: cmp ax, 0x1b58
        if (R.cL) { pc = 507; continue; } // 4d288b: jl 0x4d3826
        pc = 279; continue;
      case 279: // 4d2891
        R.ebx = (R.m.u32(((R.esp + 0x34) | 0) >>> 0)) | 0; // 4d2891: mov ebx, dword ptr [esp + 0x34]
        R.logic((R.ebx >>> 0) & (R.ebx >>> 0), 32); // 4d2895: test ebx, ebx
        if (R.zf) { pc = 507; continue; } // 4d2897: je 0x4d3826
        pc = 280; continue;
      case 280: // 4d289d
        R.ecx = ((R.ebx >>> 0)) | 0; // 4d289d: mov ecx, ebx
        R.call(0x5986b0, { n: 0, thisEcx: true, calleeClean: false }); // 4d289f: call 0x5986b0
        R.sub(((R.eax >>> 0) & 0xff), 0xff, 8); // 4d28a4: cmp al, 0xff
        if (R.zf) { pc = 507; continue; } // 4d28a6: je 0x4d3826
        pc = 281; continue;
      case 281: // 4d28ac
        R.ecx = ((R.ebx >>> 0)) | 0; // 4d28ac: mov ecx, ebx
        R.call(0x5986b0, { n: 0, thisEcx: true, calleeClean: false }); // 4d28ae: call 0x5986b0
        R.sub(((R.eax >>> 0) & 0xff), 0xfe, 8); // 4d28b3: cmp al, 0xfe
        if (R.zf) { pc = 507; continue; } // 4d28b5: je 0x4d3826
        pc = 282; continue;
      case 282: // 4d28bb
        R.ebx = (R.m.u32(((R.esp + 0x98) | 0) >>> 0)) | 0; // 4d28bb: mov ebx, dword ptr [esp + 0x98]
        R.push(0x0); // 4d28c2: push 0
        R.push((R.ebx >>> 0)); // 4d28c4: push ebx
        R.call(0x5444a0, { n: 2, thisEcx: false, calleeClean: false }); // 4d28c5: call 0x5444a0
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 4d28ca: add esp, 8
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d28cd: test eax, eax
        if (!R.zf) { pc = 507; continue; } // 4d28cf: jne 0x4d3826
        pc = 283; continue;
      case 283: // 4d28d5
        R.push((R.eax >>> 0)); // 4d28d5: push eax
        R.push((R.ebx >>> 0)); // 4d28d6: push ebx
        R.call(0x544600, { n: 2, thisEcx: false, calleeClean: false }); // 4d28d7: call 0x544600
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 4d28dc: add esp, 8
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d28df: test eax, eax
        if (!R.zf) { pc = 507; continue; } // 4d28e1: jne 0x4d3826
        pc = 284; continue;
      default: return pc;
    }
  }
}
function f_4d1600_34(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 284: // 4d28e7
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 4d28e7: test esi, esi
        if (R.zf) { pc = 286; continue; } // 4d28e9: je 0x4d28f4
        pc = 285; continue;
      case 285: // 4d28eb
        R.eax = (R.m.u32(((R.esi + 0xf) | 0) >>> 0)) | 0; // 4d28eb: mov eax, dword ptr [esi + 0xf]
        R.ecx = (R.m.u32(((R.ebx) | 0) >>> 0)) | 0; // 4d28ee: mov ecx, dword ptr [ebx]
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 4d28f0: cmp eax, ecx
        if (R.zf) { pc = 288; continue; } // 4d28f2: je 0x4d290b
        pc = 286; continue;
      case 286: // 4d28f4
        R.sub(R.m.u8(((R.ebx + 0x6d) | 0) >>> 0), 0x2, 8); // 4d28f4: cmp byte ptr [ebx + 0x6d], 2
        if (!R.zf) { pc = 409; continue; } // 4d28f8: jne 0x4d313a
        pc = 287; continue;
      case 287: // 4d28fe
        R.sub(R.m.u32(((R.ebp + 0x1db) | 0) >>> 0), 0xffffffff, 32); // 4d28fe: cmp dword ptr [ebp + 0x1db], -1
        if (R.cLE) { pc = 409; continue; } // 4d2905: jle 0x4d313a
        pc = 288; continue;
      case 288: // 4d290b
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.esp + 0x10) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d290b: mov cl, byte ptr [esp + 0x10]
        R.ebx = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 4d290f: mov ebx, dword ptr [esp + 0x18]
        R.sub(((R.ecx >>> 0) & 0xff), 0x19, 8); // 4d2913: cmp cl, 0x19
        if (!R.cL) { pc = 295; continue; } // 4d2916: jge 0x4d29b4
        pc = 289; continue;
      case 289: // 4d291c
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ebx + 0x4f) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d291c: mov al, byte ptr [ebx + 0x4f]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0xf0, 8)) & 0xff) << 0)) | 0; // 4d291f: and al, 0xf0
        R.sub(((R.eax >>> 0) & 0xff), 0x70, 8); // 4d2921: cmp al, 0x70
        if (R.zf) { pc = 295; continue; } // 4d2923: je 0x4d29b4
        pc = 290; continue;
      case 290: // 4d2929
        R.sub(((R.eax >>> 0) & 0xff), 0x60, 8); // 4d2929: cmp al, 0x60
        if (R.zf) { pc = 295; continue; } // 4d292b: je 0x4d29b4
        pc = 291; continue;
      case 291: // 4d2931
        R.eax = (((R.m.u16(((R.esp + 0x20) | 0) >>> 0)) << 16 >> 16)) | 0; // 4d2931: movsx eax, word ptr [esp + 0x20]
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, (R.eax >>> 0)); // 4d2936: mov dword ptr [esp + 0x28], eax
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 4d293a: lea eax, [eax + eax*4]
        R.edx = (((R.eax + R.eax * 4) | 0)) | 0; // 4d293d: lea edx, [eax + eax*4]
        R.eax = (((R.m.u16(((R.ebp + 0x80) | 0) >>> 0)) << 16 >> 16)) | 0; // 4d2940: movsx eax, word ptr [ebp + 0x80]
        R.edx = (R.shl((R.edx >>> 0), 0x1, 32)) | 0; // 4d2947: shl edx, 1
        R.sub((R.edx >>> 0), (R.eax >>> 0), 32); // 4d2949: cmp edx, eax
        if (R.cLE) { pc = 295; continue; } // 4d294b: jle 0x4d29b4
        pc = 292; continue;
      default: return pc;
    }
  }
}
function f_4d1600_35(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 292: // 4d294d
        R.eax = (((R.m.u8(((R.ebx + 0x44) | 0) >>> 0)) << 24 >> 24)) | 0; // 4d294d: movsx eax, byte ptr [ebx + 0x44]
        R.fpush(R.m.s32(((R.esp + 0x28) | 0) >>> 0)); // 4d2951: fild dword ptr [esp + 0x28]
        R.edx = R.eax < 0 ? -1 : 0; // 4d2955: cdq 
        R.edx = (R.logic((R.edx >>> 0) & 0x3, 32)) | 0; // 4d2956: and edx, 3
        R.eax = (R.add((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 4d2959: add eax, edx
        R.edx = (0x7d) | 0; // 4d295b: mov edx, 0x7d
        R.eax = (R.sar((R.eax >>> 0), 0x2, 32)) | 0; // 4d2960: sar eax, 2
        R.edx = (R.sub((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 4d2963: sub edx, eax
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edx >>> 0)); // 4d2965: mov dword ptr [esp + 0x38], edx
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d2969: fild dword ptr [esp + 0x38]
        R.eax = (((((R.ecx >>> 0) & 0xff)) << 24 >> 24)) | 0; // 4d296d: movsx eax, cl
        R.st[1] = R.st[1] / R.st[0]; R.fpop(); // 4d2970: fdivp st(1)
        R.eax = (R.sub((R.eax >>> 0), 0x14, 32)) | 0; // 4d2972: sub eax, 0x14
        R.edx = R.eax < 0 ? -1 : 0; // 4d2975: cdq 
        R.eax = (R.logic((R.eax >>> 0) ^ (R.edx >>> 0), 32)) | 0; // 4d2976: xor eax, edx
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 4d2978: sub eax, edx
        { const p = BigInt((((R.eax >>> 0)) | 0)) * BigInt(1333333); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.eax = (Number(BigInt.asIntN(32, p))) | 0; } // 4d297a: imul eax, eax, 0x145855
        R.st[0] = R.st[0] * R.m.s32(((R.esp + 0x14) | 0) >>> 0); // 4d2980: fimul dword ptr [esp + 0x14]
        R.edi = (R.sub((R.edi >>> 0), (R.eax >>> 0), 32)) | 0; // 4d2984: sub edi, eax
        R.edi = (R.add((R.edi >>> 0), 0x4c4b40, 32)) | 0; // 4d2986: add edi, 0x4c4b40
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 4d298c: mov dword ptr [esp + 0x38], edi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d2990: fild dword ptr [esp + 0x38]
        R.m.wf64(((R.esp + 0x6c) | 0) >>> 0, R.st[0]); R.fpop(); // 4d2994: fstp qword ptr [esp + 0x6c]
        R.fcom(R.st[0], R.f64(((R.esp + 0x6c) | 0))); // 4d2998: fcom qword ptr [esp + 0x6c]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d299c: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d299e: test ah, 1
        if (!R.zf) { pc = 294; continue; } // 4d29a1: jne 0x4d29a9
        pc = 293; continue;
      case 293: // 4d29a3
        R.fpop(); // 4d29a3: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x6c) | 0))); // 4d29a5: fld qword ptr [esp + 0x6c]
        pc = 294; continue;
      case 294: // 4d29a9
        R.ftol(); // 4d29a9: call 0x945640
        R.edi = ((R.eax >>> 0)) | 0; // 4d29ae: mov edi, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 4d29b0: mov dword ptr [esp + 0x14], edi
        pc = 295; continue;
      case 295: // 4d29b4
        R.sub(R.m.u16(((R.ebp + 0x80) | 0) >>> 0), 0x1a5e, 16); // 4d29b4: cmp word ptr [ebp + 0x80], 0x1a5e
        if (!R.cLE) { pc = 342; continue; } // 4d29bd: jg 0x4d2cf5
        pc = 296; continue;
      case 296: // 4d29c3
        R.esi = (R.m.u32(((R.ebp + 0x57) | 0) >>> 0)) | 0; // 4d29c3: mov esi, dword ptr [ebp + 0x57]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 4d29c6: test esi, esi
        if (R.zf) { pc = 298; continue; } // 4d29c8: je 0x4d29d5
        pc = 297; continue;
      case 297: // 4d29ca
        R.sub(R.m.u16(((R.esi + 0x69) | 0) >>> 0), 0xf, 16); // 4d29ca: cmp word ptr [esi + 0x69], 0xf
        if (!R.cLE) { pc = 342; continue; } // 4d29cf: jg 0x4d2cf5
        pc = 298; continue;
      case 298: // 4d29d5
        R.eax = (R.m.u32(((R.ebx + 0x45) | 0) >>> 0)) | 0; // 4d29d5: mov eax, dword ptr [ebx + 0x45]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d29d8: test eax, eax
        if (R.zf) { pc = 318; continue; } // 4d29da: je 0x4d2b43
        pc = 299; continue;
      default: return pc;
    }
  }
}
function f_4d1600_36(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 299: // 4d29e0
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.ebx + 0x44) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d29e0: mov cl, byte ptr [ebx + 0x44]
        R.logic(((R.ecx >>> 0) & 0xff) & ((R.ecx >>> 0) & 0xff), 8); // 4d29e3: test cl, cl
        if (!R.cLE) { pc = 318; continue; } // 4d29e5: jg 0x4d2b43
        pc = 300; continue;
      case 300: // 4d29eb
        R.logic((R.eax >>> 0) & 0x101, 32); // 4d29eb: test eax, 0x101
        if (R.zf) { pc = 514; continue; } // 4d29f0: je 0x4d3886
        pc = 301; continue;
      case 301: // 4d29f6
        R.eax = (R.m.u32(((0xae2c94) | 0) >>> 0)) | 0; // 4d29f6: mov eax, dword ptr [0xae2c94]
        R.ecx = (R.m.u32(((0xae2c90) | 0) >>> 0)) | 0; // 4d29fb: mov ecx, dword ptr [0xae2c90]
        R.push((R.eax >>> 0)); // 4d2a01: push eax
        R.push((R.ecx >>> 0)); // 4d2a02: push ecx
        R.ecx = (((R.ebx + 0x2d) | 0)) | 0; // 4d2a03: lea ecx, [ebx + 0x2d]
        R.call(0x54cdb0, { n: 2, thisEcx: true, calleeClean: true }); // 4d2a06: call 0x54cdb0
        R.sub((R.eax >>> 0), 0x1a9, 32); // 4d2a0b: cmp eax, 0x1a9
        if (R.cLE) { pc = 514; continue; } // 4d2a10: jle 0x4d3886
        pc = 302; continue;
      case 302: // 4d2a16
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ebx + 0x4f) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d2a16: mov al, byte ptr [ebx + 0x4f]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0xf0, 8)) & 0xff) << 0)) | 0; // 4d2a19: and al, 0xf0
        R.sub(((R.eax >>> 0) & 0xff), 0x10, 8); // 4d2a1b: cmp al, 0x10
        if (!R.zf) { pc = 310; continue; } // 4d2a1d: jne 0x4d2aaf
        pc = 303; continue;
      case 303: // 4d2a23
        R.edi = (R.add((R.edi >>> 0), 0x5b8d8, 32)) | 0; // 4d2a23: add edi, 0x5b8d8
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 4d2a29: mov dword ptr [esp + 0x38], edi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d2a2d: fild dword ptr [esp + 0x38]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d2a31: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 1.25; // 4d2a35: fmul qword ptr [0x968928]
        R.m.wf64(((R.esp + 0x44) | 0) >>> 0, R.st[0]); R.fpop(); // 4d2a3b: fstp qword ptr [esp + 0x44]
        R.fcom(R.st[0], R.f64(((R.esp + 0x44) | 0))); // 4d2a3f: fcom qword ptr [esp + 0x44]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d2a43: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d2a45: test ah, 1
        if (!R.zf) { pc = 305; continue; } // 4d2a48: jne 0x4d2a50
        pc = 304; continue;
      case 304: // 4d2a4a
        R.fpop(); // 4d2a4a: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x44) | 0))); // 4d2a4c: fld qword ptr [esp + 0x44]
        pc = 305; continue;
      case 305: // 4d2a50
        R.ftol(); // 4d2a50: call 0x945640
        R.edi = ((R.eax >>> 0)) | 0; // 4d2a55: mov edi, eax
        R.eax = (R.m.u32(((R.esp + 0x94) | 0) >>> 0)) | 0; // 4d2a57: mov eax, dword ptr [esp + 0x94]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d2a5e: test eax, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 4d2a60: mov dword ptr [esp + 0x14], edi
        if (R.zf) { pc = 514; continue; } // 4d2a64: je 0x4d3886
        pc = 306; continue;
      case 306: // 4d2a6a
        R.edx = (R.m.u32(((R.ebp + 0x57) | 0) >>> 0)) | 0; // 4d2a6a: mov edx, dword ptr [ebp + 0x57]
        R.ecx = (R.m.u32(((R.eax + 0x57) | 0) >>> 0)) | 0; // 4d2a6d: mov ecx, dword ptr [eax + 0x57]
        R.sub((R.edx >>> 0), (R.ecx >>> 0), 32); // 4d2a70: cmp edx, ecx
        if (!R.zf) { pc = 514; continue; } // 4d2a72: jne 0x4d3886
        pc = 307; continue;
      default: return pc;
    }
  }
}
function f_4d1600_37(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 307: // 4d2a78
        R.edi = (R.add((R.edi >>> 0), 0xc350, 32)) | 0; // 4d2a78: add edi, 0xc350
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 4d2a7e: mov dword ptr [esp + 0x38], edi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d2a82: fild dword ptr [esp + 0x38]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d2a86: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 1.05; // 4d2a8a: fmul qword ptr [0x9689b8]
        R.m.wf64(((R.esp + 0x4c) | 0) >>> 0, R.st[0]); R.fpop(); // 4d2a90: fstp qword ptr [esp + 0x4c]
        R.fcom(R.st[0], R.f64(((R.esp + 0x4c) | 0))); // 4d2a94: fcom qword ptr [esp + 0x4c]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d2a98: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d2a9a: test ah, 1
        if (!R.zf) { pc = 309; continue; } // 4d2a9d: jne 0x4d2aa5
        pc = 308; continue;
      case 308: // 4d2a9f
        R.fpop(); // 4d2a9f: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x4c) | 0))); // 4d2aa1: fld qword ptr [esp + 0x4c]
        pc = 309; continue;
      case 309: // 4d2aa5
        R.ftol(); // 4d2aa5: call 0x945640
        pc = 512; continue; // 4d2aaa: jmp 0x4d3880
      case 310: // 4d2aaf
        R.sub(((R.eax >>> 0) & 0xff), 0x20, 8); // 4d2aaf: cmp al, 0x20
        if (!R.zf) { pc = 514; continue; } // 4d2ab1: jne 0x4d3886
        pc = 311; continue;
      case 311: // 4d2ab7
        R.edi = (R.add((R.edi >>> 0), 0x30d40, 32)) | 0; // 4d2ab7: add edi, 0x30d40
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 4d2abd: mov dword ptr [esp + 0x38], edi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d2ac1: fild dword ptr [esp + 0x38]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d2ac5: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 1.2; // 4d2ac9: fmul qword ptr [0x968978]
        R.m.wf64(((R.esp + 0x6c) | 0) >>> 0, R.st[0]); R.fpop(); // 4d2acf: fstp qword ptr [esp + 0x6c]
        R.fcom(R.st[0], R.f64(((R.esp + 0x6c) | 0))); // 4d2ad3: fcom qword ptr [esp + 0x6c]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d2ad7: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d2ad9: test ah, 1
        if (!R.zf) { pc = 313; continue; } // 4d2adc: jne 0x4d2ae4
        pc = 312; continue;
      case 312: // 4d2ade
        R.fpop(); // 4d2ade: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x6c) | 0))); // 4d2ae0: fld qword ptr [esp + 0x6c]
        pc = 313; continue;
      case 313: // 4d2ae4
        R.ftol(); // 4d2ae4: call 0x945640
        R.edi = ((R.eax >>> 0)) | 0; // 4d2ae9: mov edi, eax
        R.eax = (R.m.u32(((R.esp + 0x94) | 0) >>> 0)) | 0; // 4d2aeb: mov eax, dword ptr [esp + 0x94]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d2af2: test eax, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 4d2af4: mov dword ptr [esp + 0x14], edi
        if (R.zf) { pc = 514; continue; } // 4d2af8: je 0x4d3886
        pc = 314; continue;
      case 314: // 4d2afe
        R.ecx = (R.m.u32(((R.ebp + 0x57) | 0) >>> 0)) | 0; // 4d2afe: mov ecx, dword ptr [ebp + 0x57]
        R.edx = (R.m.u32(((R.eax + 0x57) | 0) >>> 0)) | 0; // 4d2b01: mov edx, dword ptr [eax + 0x57]
        R.sub((R.ecx >>> 0), (R.edx >>> 0), 32); // 4d2b04: cmp ecx, edx
        if (!R.zf) { pc = 514; continue; } // 4d2b06: jne 0x4d3886
        pc = 315; continue;
      default: return pc;
    }
  }
}
function f_4d1600_38(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 315: // 4d2b0c
        R.edi = (R.add((R.edi >>> 0), 0x927c, 32)) | 0; // 4d2b0c: add edi, 0x927c
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 4d2b12: mov dword ptr [esp + 0x38], edi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d2b16: fild dword ptr [esp + 0x38]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d2b1a: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 1.025; // 4d2b1e: fmul qword ptr [0x968fa0]
        R.m.wf64(((R.esp + 0x4c) | 0) >>> 0, R.st[0]); R.fpop(); // 4d2b24: fstp qword ptr [esp + 0x4c]
        R.fcom(R.st[0], R.f64(((R.esp + 0x4c) | 0))); // 4d2b28: fcom qword ptr [esp + 0x4c]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d2b2c: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d2b2e: test ah, 1
        if (!R.zf) { pc = 317; continue; } // 4d2b31: jne 0x4d2b39
        pc = 316; continue;
      case 316: // 4d2b33
        R.fpop(); // 4d2b33: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x4c) | 0))); // 4d2b35: fld qword ptr [esp + 0x4c]
        pc = 317; continue;
      case 317: // 4d2b39
        R.ftol(); // 4d2b39: call 0x945640
        pc = 512; continue; // 4d2b3e: jmp 0x4d3880
      case 318: // 4d2b43
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ebx + 0x4f) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d2b43: mov al, byte ptr [ebx + 0x4f]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0xf0, 8)) & 0xff) << 0)) | 0; // 4d2b46: and al, 0xf0
        R.sub(((R.eax >>> 0) & 0xff), 0x10, 8); // 4d2b48: cmp al, 0x10
        if (!R.zf) { pc = 326; continue; } // 4d2b4a: jne 0x4d2bd7
        pc = 319; continue;
      case 319: // 4d2b50
        R.edi = (R.add((R.edi >>> 0), 0xb71b0, 32)) | 0; // 4d2b50: add edi, 0xb71b0
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 4d2b56: mov dword ptr [esp + 0x38], edi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d2b5a: fild dword ptr [esp + 0x38]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d2b5e: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 1.75; // 4d2b62: fmul qword ptr [0x968f98]
        R.m.wf64(((R.esp + 0x4c) | 0) >>> 0, R.st[0]); R.fpop(); // 4d2b68: fstp qword ptr [esp + 0x4c]
        R.fcom(R.st[0], R.f64(((R.esp + 0x4c) | 0))); // 4d2b6c: fcom qword ptr [esp + 0x4c]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d2b70: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d2b72: test ah, 1
        if (!R.zf) { pc = 321; continue; } // 4d2b75: jne 0x4d2b7d
        pc = 320; continue;
      case 320: // 4d2b77
        R.fpop(); // 4d2b77: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x4c) | 0))); // 4d2b79: fld qword ptr [esp + 0x4c]
        pc = 321; continue;
      case 321: // 4d2b7d
        R.ftol(); // 4d2b7d: call 0x945640
        R.edi = ((R.eax >>> 0)) | 0; // 4d2b82: mov edi, eax
        R.eax = (R.m.u32(((R.esp + 0x94) | 0) >>> 0)) | 0; // 4d2b84: mov eax, dword ptr [esp + 0x94]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d2b8b: test eax, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 4d2b8d: mov dword ptr [esp + 0x14], edi
        if (R.zf) { pc = 514; continue; } // 4d2b91: je 0x4d3886
        pc = 322; continue;
      case 322: // 4d2b97
        R.sub((R.esi >>> 0), R.m.u32(((R.eax + 0x57) | 0) >>> 0), 32); // 4d2b97: cmp esi, dword ptr [eax + 0x57]
        if (!R.zf) { pc = 514; continue; } // 4d2b9a: jne 0x4d3886
        pc = 323; continue;
      default: return pc;
    }
  }
}
function f_4d1600_39(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 323: // 4d2ba0
        R.edi = (R.add((R.edi >>> 0), 0x186a0, 32)) | 0; // 4d2ba0: add edi, 0x186a0
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 4d2ba6: mov dword ptr [esp + 0x38], edi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d2baa: fild dword ptr [esp + 0x38]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d2bae: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 1.1; // 4d2bb2: fmul qword ptr [0x9689c0]
        R.m.wf64(((R.esp + 0x44) | 0) >>> 0, R.st[0]); R.fpop(); // 4d2bb8: fstp qword ptr [esp + 0x44]
        R.fcom(R.st[0], R.f64(((R.esp + 0x44) | 0))); // 4d2bbc: fcom qword ptr [esp + 0x44]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d2bc0: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d2bc2: test ah, 1
        if (!R.zf) { pc = 325; continue; } // 4d2bc5: jne 0x4d2bcd
        pc = 324; continue;
      case 324: // 4d2bc7
        R.fpop(); // 4d2bc7: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x44) | 0))); // 4d2bc9: fld qword ptr [esp + 0x44]
        pc = 325; continue;
      case 325: // 4d2bcd
        R.ftol(); // 4d2bcd: call 0x945640
        pc = 512; continue; // 4d2bd2: jmp 0x4d3880
      case 326: // 4d2bd7
        R.sub(((R.eax >>> 0) & 0xff), 0x20, 8); // 4d2bd7: cmp al, 0x20
        if (!R.zf) { pc = 334; continue; } // 4d2bd9: jne 0x4d2c66
        pc = 327; continue;
      case 327: // 4d2bdf
        R.edi = (R.add((R.edi >>> 0), 0x61a80, 32)) | 0; // 4d2bdf: add edi, 0x61a80
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 4d2be5: mov dword ptr [esp + 0x38], edi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d2be9: fild dword ptr [esp + 0x38]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d2bed: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 1.4; // 4d2bf1: fmul qword ptr [0x968dc0]
        R.m.wf64(((R.esp + 0x6c) | 0) >>> 0, R.st[0]); R.fpop(); // 4d2bf7: fstp qword ptr [esp + 0x6c]
        R.fcom(R.st[0], R.f64(((R.esp + 0x6c) | 0))); // 4d2bfb: fcom qword ptr [esp + 0x6c]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d2bff: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d2c01: test ah, 1
        if (!R.zf) { pc = 329; continue; } // 4d2c04: jne 0x4d2c0c
        pc = 328; continue;
      case 328: // 4d2c06
        R.fpop(); // 4d2c06: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x6c) | 0))); // 4d2c08: fld qword ptr [esp + 0x6c]
        pc = 329; continue;
      case 329: // 4d2c0c
        R.ftol(); // 4d2c0c: call 0x945640
        R.edi = ((R.eax >>> 0)) | 0; // 4d2c11: mov edi, eax
        R.eax = (R.m.u32(((R.esp + 0x94) | 0) >>> 0)) | 0; // 4d2c13: mov eax, dword ptr [esp + 0x94]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d2c1a: test eax, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 4d2c1c: mov dword ptr [esp + 0x14], edi
        if (R.zf) { pc = 514; continue; } // 4d2c20: je 0x4d3886
        pc = 330; continue;
      case 330: // 4d2c26
        R.sub((R.esi >>> 0), R.m.u32(((R.eax + 0x57) | 0) >>> 0), 32); // 4d2c26: cmp esi, dword ptr [eax + 0x57]
        if (!R.zf) { pc = 514; continue; } // 4d2c29: jne 0x4d3886
        pc = 331; continue;
      default: return pc;
    }
  }
}
function f_4d1600_40(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 331: // 4d2c2f
        R.edi = (R.add((R.edi >>> 0), 0x124f8, 32)) | 0; // 4d2c2f: add edi, 0x124f8
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 4d2c35: mov dword ptr [esp + 0x38], edi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d2c39: fild dword ptr [esp + 0x38]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d2c3d: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 1.075; // 4d2c41: fmul qword ptr [0x968f90]
        R.m.wf64(((R.esp + 0x6c) | 0) >>> 0, R.st[0]); R.fpop(); // 4d2c47: fstp qword ptr [esp + 0x6c]
        R.fcom(R.st[0], R.f64(((R.esp + 0x6c) | 0))); // 4d2c4b: fcom qword ptr [esp + 0x6c]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d2c4f: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d2c51: test ah, 1
        if (!R.zf) { pc = 333; continue; } // 4d2c54: jne 0x4d2c5c
        pc = 332; continue;
      case 332: // 4d2c56
        R.fpop(); // 4d2c56: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x6c) | 0))); // 4d2c58: fld qword ptr [esp + 0x6c]
        pc = 333; continue;
      case 333: // 4d2c5c
        R.ftol(); // 4d2c5c: call 0x945640
        pc = 512; continue; // 4d2c61: jmp 0x4d3880
      case 334: // 4d2c66
        R.sub(((R.eax >>> 0) & 0xff), 0x30, 8); // 4d2c66: cmp al, 0x30
        if (!R.zf) { pc = 514; continue; } // 4d2c68: jne 0x4d3886
        pc = 335; continue;
      case 335: // 4d2c6e
        R.edi = (R.add((R.edi >>> 0), 0x249f0, 32)) | 0; // 4d2c6e: add edi, 0x249f0
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 4d2c74: mov dword ptr [esp + 0x38], edi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d2c78: fild dword ptr [esp + 0x38]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d2c7c: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 1.15; // 4d2c80: fmul qword ptr [0x968980]
        R.m.wf64(((R.esp + 0x4c) | 0) >>> 0, R.st[0]); R.fpop(); // 4d2c86: fstp qword ptr [esp + 0x4c]
        R.fcom(R.st[0], R.f64(((R.esp + 0x4c) | 0))); // 4d2c8a: fcom qword ptr [esp + 0x4c]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d2c8e: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d2c90: test ah, 1
        if (!R.zf) { pc = 337; continue; } // 4d2c93: jne 0x4d2c9b
        pc = 336; continue;
      case 336: // 4d2c95
        R.fpop(); // 4d2c95: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x4c) | 0))); // 4d2c97: fld qword ptr [esp + 0x4c]
        pc = 337; continue;
      case 337: // 4d2c9b
        R.ftol(); // 4d2c9b: call 0x945640
        R.edi = ((R.eax >>> 0)) | 0; // 4d2ca0: mov edi, eax
        R.eax = (R.m.u32(((R.esp + 0x94) | 0) >>> 0)) | 0; // 4d2ca2: mov eax, dword ptr [esp + 0x94]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d2ca9: test eax, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 4d2cab: mov dword ptr [esp + 0x14], edi
        if (R.zf) { pc = 514; continue; } // 4d2caf: je 0x4d3886
        pc = 338; continue;
      case 338: // 4d2cb5
        R.sub((R.esi >>> 0), R.m.u32(((R.eax + 0x57) | 0) >>> 0), 32); // 4d2cb5: cmp esi, dword ptr [eax + 0x57]
        if (!R.zf) { pc = 514; continue; } // 4d2cb8: jne 0x4d3886
        pc = 339; continue;
      default: return pc;
    }
  }
}
function f_4d1600_41(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 339: // 4d2cbe
        R.edi = (R.add((R.edi >>> 0), 0x61a8, 32)) | 0; // 4d2cbe: add edi, 0x61a8
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 4d2cc4: mov dword ptr [esp + 0x38], edi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d2cc8: fild dword ptr [esp + 0x38]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d2ccc: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 1.025; // 4d2cd0: fmul qword ptr [0x968fa0]
        R.m.wf64(((R.esp + 0x4c) | 0) >>> 0, R.st[0]); R.fpop(); // 4d2cd6: fstp qword ptr [esp + 0x4c]
        R.fcom(R.st[0], R.f64(((R.esp + 0x4c) | 0))); // 4d2cda: fcom qword ptr [esp + 0x4c]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d2cde: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d2ce0: test ah, 1
        if (!R.zf) { pc = 341; continue; } // 4d2ce3: jne 0x4d2ceb
        pc = 340; continue;
      case 340: // 4d2ce5
        R.fpop(); // 4d2ce5: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x4c) | 0))); // 4d2ce7: fld qword ptr [esp + 0x4c]
        pc = 341; continue;
      case 341: // 4d2ceb
        R.ftol(); // 4d2ceb: call 0x945640
        pc = 512; continue; // 4d2cf0: jmp 0x4d3880
      case 342: // 4d2cf5
        R.eax = (R.m.u32(((R.ebx + 0x45) | 0) >>> 0)) | 0; // 4d2cf5: mov eax, dword ptr [ebx + 0x45]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d2cf8: test eax, eax
        if (R.zf) { pc = 386; continue; } // 4d2cfa: je 0x4d2fdc
        pc = 343; continue;
      case 343: // 4d2d00
        R.sub(R.m.u8(((R.ebx + 0x44) | 0) >>> 0), 0xce, 8); // 4d2d00: cmp byte ptr [ebx + 0x44], 0xce
        if (!R.cLE) { pc = 386; continue; } // 4d2d04: jg 0x4d2fdc
        pc = 344; continue;
      case 344: // 4d2d0a
        R.logic((R.eax >>> 0) & 0x101, 32); // 4d2d0a: test eax, 0x101
        if (R.zf) { pc = 369; continue; } // 4d2d0f: je 0x4d2eaa
        pc = 345; continue;
      case 345: // 4d2d15
        R.edx = (R.m.u32(((0xae2c94) | 0) >>> 0)) | 0; // 4d2d15: mov edx, dword ptr [0xae2c94]
        R.eax = (R.m.u32(((0xae2c90) | 0) >>> 0)) | 0; // 4d2d1b: mov eax, dword ptr [0xae2c90]
        R.push((R.edx >>> 0)); // 4d2d20: push edx
        R.push((R.eax >>> 0)); // 4d2d21: push eax
        R.ecx = (((R.ebx + 0x2d) | 0)) | 0; // 4d2d22: lea ecx, [ebx + 0x2d]
        R.call(0x54cdb0, { n: 2, thisEcx: true, calleeClean: true }); // 4d2d25: call 0x54cdb0
        R.sub((R.eax >>> 0), 0x1a9, 32); // 4d2d2a: cmp eax, 0x1a9
        if (R.cLE) { pc = 369; continue; } // 4d2d2f: jle 0x4d2eaa
        pc = 346; continue;
      case 346: // 4d2d35
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ebx + 0x4f) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d2d35: mov al, byte ptr [ebx + 0x4f]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0xf0, 8)) & 0xff) << 0)) | 0; // 4d2d38: and al, 0xf0
        R.sub(((R.eax >>> 0) & 0xff), 0x10, 8); // 4d2d3a: cmp al, 0x10
        if (!R.zf) { pc = 353; continue; } // 4d2d3c: jne 0x4d2d82
        pc = 347; continue;
      case 347: // 4d2d3e
        R.eax = (((R.edi + 0x2625a0) | 0)) | 0; // 4d2d3e: lea eax, [edi + 0x2625a0]
        R.edi = (R.add((R.edi >>> 0), (R.edi >>> 0), 32)) | 0; // 4d2d44: add edi, edi
        R.sub((R.eax >>> 0), (R.edi >>> 0), 32); // 4d2d46: cmp eax, edi
        if (!R.cL) { pc = 349; continue; } // 4d2d48: jge 0x4d2d4c
        pc = 348; continue;
      case 348: // 4d2d4a
        R.edi = ((R.eax >>> 0)) | 0; // 4d2d4a: mov edi, eax
        pc = 349; continue;
      default: return pc;
    }
  }
}
function f_4d1600_42(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 349: // 4d2d4c
        R.eax = (R.m.u32(((R.esp + 0x94) | 0) >>> 0)) | 0; // 4d2d4c: mov eax, dword ptr [esp + 0x94]
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 4d2d53: mov dword ptr [esp + 0x14], edi
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d2d57: test eax, eax
        if (R.zf) { pc = 514; continue; } // 4d2d59: je 0x4d3886
        pc = 350; continue;
      case 350: // 4d2d5f
        R.ecx = (R.m.u32(((R.ebp + 0x57) | 0) >>> 0)) | 0; // 4d2d5f: mov ecx, dword ptr [ebp + 0x57]
        R.edx = (R.m.u32(((R.eax + 0x57) | 0) >>> 0)) | 0; // 4d2d62: mov edx, dword ptr [eax + 0x57]
        R.sub((R.ecx >>> 0), (R.edx >>> 0), 32); // 4d2d65: cmp ecx, edx
        if (!R.zf) { pc = 514; continue; } // 4d2d67: jne 0x4d3886
        pc = 351; continue;
      case 351: // 4d2d6d
        R.eax = (((R.edi + 0xf4240) | 0)) | 0; // 4d2d6d: lea eax, [edi + 0xf4240]
        R.edi = (R.add((R.edi >>> 0), (R.edi >>> 0), 32)) | 0; // 4d2d73: add edi, edi
        R.sub((R.eax >>> 0), (R.edi >>> 0), 32); // 4d2d75: cmp eax, edi
        if (R.cL) { pc = 512; continue; } // 4d2d77: jl 0x4d3880
        pc = 352; continue;
      case 352: // 4d2d7d
        pc = 513; continue; // 4d2d7d: jmp 0x4d3882
      case 353: // 4d2d82
        R.sub(((R.eax >>> 0) & 0xff), 0x20, 8); // 4d2d82: cmp al, 0x20
        if (!R.zf) { pc = 361; continue; } // 4d2d84: jne 0x4d2e16
        pc = 354; continue;
      case 354: // 4d2d8a
        R.edi = (R.add((R.edi >>> 0), 0x16e360, 32)) | 0; // 4d2d8a: add edi, 0x16e360
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 4d2d90: mov dword ptr [esp + 0x38], edi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d2d94: fild dword ptr [esp + 0x38]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d2d98: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 1.5; // 4d2d9c: fmul qword ptr [0x968940]
        R.m.wf64(((R.esp + 0x4c) | 0) >>> 0, R.st[0]); R.fpop(); // 4d2da2: fstp qword ptr [esp + 0x4c]
        R.fcom(R.st[0], R.f64(((R.esp + 0x4c) | 0))); // 4d2da6: fcom qword ptr [esp + 0x4c]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d2daa: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d2dac: test ah, 1
        if (!R.zf) { pc = 356; continue; } // 4d2daf: jne 0x4d2db7
        pc = 355; continue;
      case 355: // 4d2db1
        R.fpop(); // 4d2db1: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x4c) | 0))); // 4d2db3: fld qword ptr [esp + 0x4c]
        pc = 356; continue;
      case 356: // 4d2db7
        R.ftol(); // 4d2db7: call 0x945640
        R.edi = ((R.eax >>> 0)) | 0; // 4d2dbc: mov edi, eax
        R.eax = (R.m.u32(((R.esp + 0x94) | 0) >>> 0)) | 0; // 4d2dbe: mov eax, dword ptr [esp + 0x94]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d2dc5: test eax, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 4d2dc7: mov dword ptr [esp + 0x14], edi
        if (R.zf) { pc = 514; continue; } // 4d2dcb: je 0x4d3886
        pc = 357; continue;
      case 357: // 4d2dd1
        R.edx = (R.m.u32(((R.ebp + 0x57) | 0) >>> 0)) | 0; // 4d2dd1: mov edx, dword ptr [ebp + 0x57]
        R.ecx = (R.m.u32(((R.eax + 0x57) | 0) >>> 0)) | 0; // 4d2dd4: mov ecx, dword ptr [eax + 0x57]
        R.sub((R.edx >>> 0), (R.ecx >>> 0), 32); // 4d2dd7: cmp edx, ecx
        if (!R.zf) { pc = 514; continue; } // 4d2dd9: jne 0x4d3886
        pc = 358; continue;
      default: return pc;
    }
  }
}
function f_4d1600_43(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 358: // 4d2ddf
        R.edi = (R.add((R.edi >>> 0), 0xb71b0, 32)) | 0; // 4d2ddf: add edi, 0xb71b0
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 4d2de5: mov dword ptr [esp + 0x38], edi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d2de9: fild dword ptr [esp + 0x38]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d2ded: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 1.75; // 4d2df1: fmul qword ptr [0x968f98]
        R.m.wf64(((R.esp + 0x4c) | 0) >>> 0, R.st[0]); R.fpop(); // 4d2df7: fstp qword ptr [esp + 0x4c]
        R.fcom(R.st[0], R.f64(((R.esp + 0x4c) | 0))); // 4d2dfb: fcom qword ptr [esp + 0x4c]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d2dff: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d2e01: test ah, 1
        if (!R.zf) { pc = 360; continue; } // 4d2e04: jne 0x4d2e0c
        pc = 359; continue;
      case 359: // 4d2e06
        R.fpop(); // 4d2e06: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x4c) | 0))); // 4d2e08: fld qword ptr [esp + 0x4c]
        pc = 360; continue;
      case 360: // 4d2e0c
        R.ftol(); // 4d2e0c: call 0x945640
        pc = 512; continue; // 4d2e11: jmp 0x4d3880
      case 361: // 4d2e16
        R.sub(((R.eax >>> 0) & 0xff), 0x30, 8); // 4d2e16: cmp al, 0x30
        if (!R.zf) { pc = 514; continue; } // 4d2e18: jne 0x4d3886
        pc = 362; continue;
      case 362: // 4d2e1e
        R.edi = (R.add((R.edi >>> 0), 0xf4240, 32)) | 0; // 4d2e1e: add edi, 0xf4240
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 4d2e24: mov dword ptr [esp + 0x38], edi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d2e28: fild dword ptr [esp + 0x38]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d2e2c: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 1.25; // 4d2e30: fmul qword ptr [0x968928]
        R.m.wf64(((R.esp + 0x44) | 0) >>> 0, R.st[0]); R.fpop(); // 4d2e36: fstp qword ptr [esp + 0x44]
        R.fcom(R.st[0], R.f64(((R.esp + 0x44) | 0))); // 4d2e3a: fcom qword ptr [esp + 0x44]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d2e3e: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d2e40: test ah, 1
        if (!R.zf) { pc = 364; continue; } // 4d2e43: jne 0x4d2e4b
        pc = 363; continue;
      case 363: // 4d2e45
        R.fpop(); // 4d2e45: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x44) | 0))); // 4d2e47: fld qword ptr [esp + 0x44]
        pc = 364; continue;
      case 364: // 4d2e4b
        R.ftol(); // 4d2e4b: call 0x945640
        R.edi = ((R.eax >>> 0)) | 0; // 4d2e50: mov edi, eax
        R.eax = (R.m.u32(((R.esp + 0x94) | 0) >>> 0)) | 0; // 4d2e52: mov eax, dword ptr [esp + 0x94]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d2e59: test eax, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 4d2e5b: mov dword ptr [esp + 0x14], edi
        if (R.zf) { pc = 514; continue; } // 4d2e5f: je 0x4d3886
        pc = 365; continue;
      case 365: // 4d2e65
        R.ecx = (R.m.u32(((R.ebp + 0x57) | 0) >>> 0)) | 0; // 4d2e65: mov ecx, dword ptr [ebp + 0x57]
        R.edx = (R.m.u32(((R.eax + 0x57) | 0) >>> 0)) | 0; // 4d2e68: mov edx, dword ptr [eax + 0x57]
        R.sub((R.ecx >>> 0), (R.edx >>> 0), 32); // 4d2e6b: cmp ecx, edx
        if (!R.zf) { pc = 514; continue; } // 4d2e6d: jne 0x4d3886
        pc = 366; continue;
      default: return pc;
    }
  }
}
function f_4d1600_44(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 366: // 4d2e73
        R.edi = (R.add((R.edi >>> 0), 0x61a80, 32)) | 0; // 4d2e73: add edi, 0x61a80
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 4d2e79: mov dword ptr [esp + 0x38], edi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d2e7d: fild dword ptr [esp + 0x38]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d2e81: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 1.25; // 4d2e85: fmul qword ptr [0x968928]
        R.m.wf64(((R.esp + 0x44) | 0) >>> 0, R.st[0]); R.fpop(); // 4d2e8b: fstp qword ptr [esp + 0x44]
        R.fcom(R.st[0], R.f64(((R.esp + 0x44) | 0))); // 4d2e8f: fcom qword ptr [esp + 0x44]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d2e93: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d2e95: test ah, 1
        if (!R.zf) { pc = 368; continue; } // 4d2e98: jne 0x4d2ea0
        pc = 367; continue;
      case 367: // 4d2e9a
        R.fpop(); // 4d2e9a: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x44) | 0))); // 4d2e9c: fld qword ptr [esp + 0x44]
        pc = 368; continue;
      case 368: // 4d2ea0
        R.ftol(); // 4d2ea0: call 0x945640
        pc = 512; continue; // 4d2ea5: jmp 0x4d3880
      case 369: // 4d2eaa
        R.eax = (R.m.u32(((R.esp + 0x94) | 0) >>> 0)) | 0; // 4d2eaa: mov eax, dword ptr [esp + 0x94]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d2eb1: test eax, eax
        if (R.zf) { pc = 514; continue; } // 4d2eb3: je 0x4d3886
        pc = 370; continue;
      case 370: // 4d2eb9
        R.edx = (R.m.u32(((0xae2c94) | 0) >>> 0)) | 0; // 4d2eb9: mov edx, dword ptr [0xae2c94]
        R.eax = (R.m.u32(((0xae2c90) | 0) >>> 0)) | 0; // 4d2ebf: mov eax, dword ptr [0xae2c90]
        R.ecx = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 4d2ec4: mov ecx, dword ptr [esp + 0x18]
        R.push((R.edx >>> 0)); // 4d2ec8: push edx
        R.push((R.eax >>> 0)); // 4d2ec9: push eax
        R.ecx = (R.add((R.ecx >>> 0), 0x2d, 32)) | 0; // 4d2eca: add ecx, 0x2d
        R.call(0x54cdb0, { n: 2, thisEcx: true, calleeClean: true }); // 4d2ecd: call 0x54cdb0
        R.sub((R.eax >>> 0), 0xe1, 32); // 4d2ed2: cmp eax, 0xe1
        if (R.cLE) { pc = 514; continue; } // 4d2ed7: jle 0x4d3886
        pc = 371; continue;
      case 371: // 4d2edd
        R.edx = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 4d2edd: mov edx, dword ptr [esp + 0x18]
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.edx + 0x4f) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d2ee1: mov al, byte ptr [edx + 0x4f]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0xf0, 8)) & 0xff) << 0)) | 0; // 4d2ee4: and al, 0xf0
        R.sub(((R.eax >>> 0) & 0xff), 0x70, 8); // 4d2ee6: cmp al, 0x70
        if (R.zf) { pc = 514; continue; } // 4d2ee8: je 0x4d3886
        pc = 372; continue;
      case 372: // 4d2eee
        R.ecx = (R.m.u32(((R.esp + 0x98) | 0) >>> 0)) | 0; // 4d2eee: mov ecx, dword ptr [esp + 0x98]
        R.sub(R.m.u8(((R.ecx + 0x5b) | 0) >>> 0), 0x5, 8); // 4d2ef5: cmp byte ptr [ecx + 0x5b], 5
        if (R.cLE) { pc = 514; continue; } // 4d2ef9: jle 0x4d3886
        pc = 373; continue;
      case 373: // 4d2eff
        R.edx = ((R.ecx >>> 0)) | 0; // 4d2eff: mov edx, ecx
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.edx + 0x59) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d2f01: mov al, byte ptr [edx + 0x59]
        R.sub(((R.eax >>> 0) & 0xff), 0x5, 8); // 4d2f04: cmp al, 5
        if (R.cLE) { pc = 514; continue; } // 4d2f06: jle 0x4d3886
        pc = 374; continue;
      case 374: // 4d2f0c
        R.ecx = (R.m.u32(((R.ecx + 0x61) | 0) >>> 0)) | 0; // 4d2f0c: mov ecx, dword ptr [ecx + 0x61]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 4d2f0f: test ecx, ecx
        if (R.zf) { pc = 514; continue; } // 4d2f11: je 0x4d3886
        pc = 375; continue;
      default: return pc;
    }
  }
}
function f_4d1600_45(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 375: // 4d2f17
        R.sub(R.m.u16(((R.ecx + 0xb) | 0) >>> 0), 0x186a, 16); // 4d2f17: cmp word ptr [ecx + 0xb], 0x186a
        if (R.cLE) { pc = 514; continue; } // 4d2f1d: jle 0x4d3886
        pc = 376; continue;
      case 376: // 4d2f23
        R.edx = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 4d2f23: mov edx, dword ptr [esp + 0x18]
        R.eax = ((R.eax & 0xffffff00) | (((R.neg(((R.eax >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 4d2f27: neg al
        R.sub(R.m.u8(((R.edx + 0x3d) | 0) >>> 0), ((R.eax >>> 0) & 0xff), 8); // 4d2f29: cmp byte ptr [edx + 0x3d], al
        if (R.cLE) { pc = 514; continue; } // 4d2f2c: jle 0x4d3886
        pc = 377; continue;
      case 377: // 4d2f32
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esp + 0x10) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d2f32: mov al, byte ptr [esp + 0x10]
        R.sub(((R.eax >>> 0) & 0xff), 0x16, 8); // 4d2f36: cmp al, 0x16
        if (R.cLE) { pc = 514; continue; } // 4d2f38: jle 0x4d3886
        pc = 378; continue;
      case 378: // 4d2f3e
        R.sub(((R.eax >>> 0) & 0xff), 0x1f, 8); // 4d2f3e: cmp al, 0x1f
        if (!R.cL) { pc = 514; continue; } // 4d2f40: jge 0x4d3886
        pc = 379; continue;
      case 379: // 4d2f46
        R.edi = (R.add((R.edi >>> 0), 0xf4240, 32)) | 0; // 4d2f46: add edi, 0xf4240
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 4d2f4c: mov dword ptr [esp + 0x38], edi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d2f50: fild dword ptr [esp + 0x38]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d2f54: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 1.25; // 4d2f58: fmul qword ptr [0x968928]
        R.m.wf64(((R.esp + 0x44) | 0) >>> 0, R.st[0]); R.fpop(); // 4d2f5e: fstp qword ptr [esp + 0x44]
        R.fcom(R.st[0], R.f64(((R.esp + 0x44) | 0))); // 4d2f62: fcom qword ptr [esp + 0x44]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d2f66: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d2f68: test ah, 1
        if (!R.zf) { pc = 381; continue; } // 4d2f6b: jne 0x4d2f73
        pc = 380; continue;
      case 380: // 4d2f6d
        R.fpop(); // 4d2f6d: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x44) | 0))); // 4d2f6f: fld qword ptr [esp + 0x44]
        pc = 381; continue;
      case 381: // 4d2f73
        R.ftol(); // 4d2f73: call 0x945640
        R.ecx = (R.m.u32(((R.esp + 0x94) | 0) >>> 0)) | 0; // 4d2f78: mov ecx, dword ptr [esp + 0x94]
        R.edi = ((R.eax >>> 0)) | 0; // 4d2f7f: mov edi, eax
        R.eax = (R.m.u32(((R.ebp + 0x57) | 0) >>> 0)) | 0; // 4d2f81: mov eax, dword ptr [ebp + 0x57]
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 4d2f84: mov dword ptr [esp + 0x14], edi
        R.sub((R.eax >>> 0), R.m.u32(((R.ecx + 0x57) | 0) >>> 0), 32); // 4d2f88: cmp eax, dword ptr [ecx + 0x57]
        if (!R.zf) { pc = 514; continue; } // 4d2f8b: jne 0x4d3886
        pc = 382; continue;
      case 382: // 4d2f91
        R.edx = ((R.ecx >>> 0)) | 0; // 4d2f91: mov edx, ecx
        R.push((R.edx >>> 0)); // 4d2f93: push edx
        R.push((R.ebp >>> 0)); // 4d2f94: push ebp
        R.call(0x4b02e0, { n: 2, thisEcx: false, calleeClean: false }); // 4d2f95: call 0x4b02e0
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 4d2f9a: add esp, 8
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 4d2f9d: test al, al
        if (R.zf) { pc = 514; continue; } // 4d2f9f: je 0x4d3886
        pc = 383; continue;
      default: return pc;
    }
  }
}
function f_4d1600_46(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 383: // 4d2fa5
        R.edi = (R.add((R.edi >>> 0), 0x61a80, 32)) | 0; // 4d2fa5: add edi, 0x61a80
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 4d2fab: mov dword ptr [esp + 0x38], edi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d2faf: fild dword ptr [esp + 0x38]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d2fb3: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 1.25; // 4d2fb7: fmul qword ptr [0x968928]
        R.m.wf64(((R.esp + 0x44) | 0) >>> 0, R.st[0]); R.fpop(); // 4d2fbd: fstp qword ptr [esp + 0x44]
        R.fcom(R.st[0], R.f64(((R.esp + 0x44) | 0))); // 4d2fc1: fcom qword ptr [esp + 0x44]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d2fc5: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d2fc7: test ah, 1
        if (!R.zf) { pc = 385; continue; } // 4d2fca: jne 0x4d2fd2
        pc = 384; continue;
      case 384: // 4d2fcc
        R.fpop(); // 4d2fcc: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x44) | 0))); // 4d2fce: fld qword ptr [esp + 0x44]
        pc = 385; continue;
      case 385: // 4d2fd2
        R.ftol(); // 4d2fd2: call 0x945640
        pc = 512; continue; // 4d2fd7: jmp 0x4d3880
      case 386: // 4d2fdc
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ebx + 0x4f) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d2fdc: mov al, byte ptr [ebx + 0x4f]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0xf0, 8)) & 0xff) << 0)) | 0; // 4d2fdf: and al, 0xf0
        R.sub(((R.eax >>> 0) & 0xff), 0x10, 8); // 4d2fe1: cmp al, 0x10
        if (!R.zf) { pc = 393; continue; } // 4d2fe3: jne 0x4d302a
        pc = 387; continue;
      case 387: // 4d2fe5
        R.eax = (((R.edi + 0x4c4b40) | 0)) | 0; // 4d2fe5: lea eax, [edi + 0x4c4b40]
        R.edi = (((R.edi + R.edi * 4) | 0)) | 0; // 4d2feb: lea edi, [edi + edi*4]
        R.sub((R.eax >>> 0), (R.edi >>> 0), 32); // 4d2fee: cmp eax, edi
        if (!R.cL) { pc = 389; continue; } // 4d2ff0: jge 0x4d2ff4
        pc = 388; continue;
      case 388: // 4d2ff2
        R.edi = ((R.eax >>> 0)) | 0; // 4d2ff2: mov edi, eax
        pc = 389; continue;
      case 389: // 4d2ff4
        R.eax = (R.m.u32(((R.esp + 0x94) | 0) >>> 0)) | 0; // 4d2ff4: mov eax, dword ptr [esp + 0x94]
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 4d2ffb: mov dword ptr [esp + 0x14], edi
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d2fff: test eax, eax
        if (R.zf) { pc = 514; continue; } // 4d3001: je 0x4d3886
        pc = 390; continue;
      case 390: // 4d3007
        R.ecx = (R.m.u32(((R.ebp + 0x57) | 0) >>> 0)) | 0; // 4d3007: mov ecx, dword ptr [ebp + 0x57]
        R.edx = (R.m.u32(((R.eax + 0x57) | 0) >>> 0)) | 0; // 4d300a: mov edx, dword ptr [eax + 0x57]
        R.sub((R.ecx >>> 0), (R.edx >>> 0), 32); // 4d300d: cmp ecx, edx
        if (!R.zf) { pc = 514; continue; } // 4d300f: jne 0x4d3886
        pc = 391; continue;
      case 391: // 4d3015
        R.eax = (((R.edi + 0xf4240) | 0)) | 0; // 4d3015: lea eax, [edi + 0xf4240]
        R.edi = (R.add((R.edi >>> 0), (R.edi >>> 0), 32)) | 0; // 4d301b: add edi, edi
        R.sub((R.eax >>> 0), (R.edi >>> 0), 32); // 4d301d: cmp eax, edi
        if (R.cL) { pc = 512; continue; } // 4d301f: jl 0x4d3880
        pc = 392; continue;
      case 392: // 4d3025
        pc = 513; continue; // 4d3025: jmp 0x4d3882
      case 393: // 4d302a
        R.sub(((R.eax >>> 0) & 0xff), 0x20, 8); // 4d302a: cmp al, 0x20
        if (!R.zf) { pc = 401; continue; } // 4d302c: jne 0x4d30c7
        pc = 394; continue;
      default: return pc;
    }
  }
}
function f_4d1600_47(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 394: // 4d3032
        R.edi = (R.add((R.edi >>> 0), 0x2625a0, 32)) | 0; // 4d3032: add edi, 0x2625a0
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 4d3038: mov dword ptr [esp + 0x38], edi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d303c: fild dword ptr [esp + 0x38]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d3040: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 2.5; // 4d3044: fmul qword ptr [0x968e18]
        R.m.wf64(((R.esp + 0x84) | 0) >>> 0, R.st[0]); R.fpop(); // 4d304a: fstp qword ptr [esp + 0x84]
        R.fcom(R.st[0], R.f64(((R.esp + 0x84) | 0))); // 4d3051: fcom qword ptr [esp + 0x84]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d3058: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d305a: test ah, 1
        if (!R.zf) { pc = 396; continue; } // 4d305d: jne 0x4d3068
        pc = 395; continue;
      case 395: // 4d305f
        R.fpop(); // 4d305f: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x84) | 0))); // 4d3061: fld qword ptr [esp + 0x84]
        pc = 396; continue;
      case 396: // 4d3068
        R.ftol(); // 4d3068: call 0x945640
        R.edi = ((R.eax >>> 0)) | 0; // 4d306d: mov edi, eax
        R.eax = (R.m.u32(((R.esp + 0x94) | 0) >>> 0)) | 0; // 4d306f: mov eax, dword ptr [esp + 0x94]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d3076: test eax, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 4d3078: mov dword ptr [esp + 0x14], edi
        if (R.zf) { pc = 514; continue; } // 4d307c: je 0x4d3886
        pc = 397; continue;
      case 397: // 4d3082
        R.edx = (R.m.u32(((R.ebp + 0x57) | 0) >>> 0)) | 0; // 4d3082: mov edx, dword ptr [ebp + 0x57]
        R.ecx = (R.m.u32(((R.eax + 0x57) | 0) >>> 0)) | 0; // 4d3085: mov ecx, dword ptr [eax + 0x57]
        R.sub((R.edx >>> 0), (R.ecx >>> 0), 32); // 4d3088: cmp edx, ecx
        if (!R.zf) { pc = 514; continue; } // 4d308a: jne 0x4d3886
        pc = 398; continue;
      case 398: // 4d3090
        R.edi = (R.add((R.edi >>> 0), 0xb71b0, 32)) | 0; // 4d3090: add edi, 0xb71b0
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 4d3096: mov dword ptr [esp + 0x38], edi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d309a: fild dword ptr [esp + 0x38]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d309e: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 1.75; // 4d30a2: fmul qword ptr [0x968f98]
        R.m.wf64(((R.esp + 0x4c) | 0) >>> 0, R.st[0]); R.fpop(); // 4d30a8: fstp qword ptr [esp + 0x4c]
        R.fcom(R.st[0], R.f64(((R.esp + 0x4c) | 0))); // 4d30ac: fcom qword ptr [esp + 0x4c]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d30b0: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d30b2: test ah, 1
        if (!R.zf) { pc = 400; continue; } // 4d30b5: jne 0x4d30bd
        pc = 399; continue;
      case 399: // 4d30b7
        R.fpop(); // 4d30b7: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x4c) | 0))); // 4d30b9: fld qword ptr [esp + 0x4c]
        pc = 400; continue;
      case 400: // 4d30bd
        R.ftol(); // 4d30bd: call 0x945640
        pc = 512; continue; // 4d30c2: jmp 0x4d3880
      case 401: // 4d30c7
        R.sub(((R.eax >>> 0) & 0xff), 0x30, 8); // 4d30c7: cmp al, 0x30
        if (!R.zf) { pc = 514; continue; } // 4d30c9: jne 0x4d3886
        pc = 402; continue;
      case 402: // 4d30cf
        R.eax = (((R.edi + 0x16e360) | 0)) | 0; // 4d30cf: lea eax, [edi + 0x16e360]
        R.edi = (R.add((R.edi >>> 0), (R.edi >>> 0), 32)) | 0; // 4d30d5: add edi, edi
        R.sub((R.eax >>> 0), (R.edi >>> 0), 32); // 4d30d7: cmp eax, edi
        if (!R.cL) { pc = 404; continue; } // 4d30d9: jge 0x4d30dd
        pc = 403; continue;
      default: return pc;
    }
  }
}
function f_4d1600_48(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 403: // 4d30db
        R.edi = ((R.eax >>> 0)) | 0; // 4d30db: mov edi, eax
        pc = 404; continue;
      case 404: // 4d30dd
        R.eax = (R.m.u32(((R.esp + 0x94) | 0) >>> 0)) | 0; // 4d30dd: mov eax, dword ptr [esp + 0x94]
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 4d30e4: mov dword ptr [esp + 0x14], edi
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d30e8: test eax, eax
        if (R.zf) { pc = 514; continue; } // 4d30ea: je 0x4d3886
        pc = 405; continue;
      case 405: // 4d30f0
        R.ecx = (R.m.u32(((R.esp + 0x94) | 0) >>> 0)) | 0; // 4d30f0: mov ecx, dword ptr [esp + 0x94]
        R.eax = (R.m.u32(((R.ebp + 0x57) | 0) >>> 0)) | 0; // 4d30f7: mov eax, dword ptr [ebp + 0x57]
        R.sub((R.eax >>> 0), R.m.u32(((R.ecx + 0x57) | 0) >>> 0), 32); // 4d30fa: cmp eax, dword ptr [ecx + 0x57]
        if (!R.zf) { pc = 514; continue; } // 4d30fd: jne 0x4d3886
        pc = 406; continue;
      case 406: // 4d3103
        R.edi = (R.add((R.edi >>> 0), 0x61a80, 32)) | 0; // 4d3103: add edi, 0x61a80
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 4d3109: mov dword ptr [esp + 0x38], edi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d310d: fild dword ptr [esp + 0x38]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d3111: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 1.4; // 4d3115: fmul qword ptr [0x968dc0]
        R.m.wf64(((R.esp + 0x6c) | 0) >>> 0, R.st[0]); R.fpop(); // 4d311b: fstp qword ptr [esp + 0x6c]
        R.fcom(R.st[0], R.f64(((R.esp + 0x6c) | 0))); // 4d311f: fcom qword ptr [esp + 0x6c]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d3123: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d3125: test ah, 1
        if (!R.zf) { pc = 408; continue; } // 4d3128: jne 0x4d3130
        pc = 407; continue;
      case 407: // 4d312a
        R.fpop(); // 4d312a: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x6c) | 0))); // 4d312c: fld qword ptr [esp + 0x6c]
        pc = 408; continue;
      case 408: // 4d3130
        R.ftol(); // 4d3130: call 0x945640
        pc = 512; continue; // 4d3135: jmp 0x4d3880
      case 409: // 4d313a
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 4d313a: test esi, esi
        if (R.zf) { pc = 508; continue; } // 4d313c: je 0x4d382a
        pc = 410; continue;
      case 410: // 4d3142
        R.sub(R.m.u32(((R.esi + 0xf) | 0) >>> 0), 0xffffffff, 32); // 4d3142: cmp dword ptr [esi + 0xf], -1
        if (!R.zf) { pc = 514; continue; } // 4d3146: jne 0x4d3886
        pc = 411; continue;
      case 411: // 4d314c
        R.ebx = ((R.ebx & 0xffffff00) | (((R.m.u8(((R.esp + 0x10) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d314c: mov bl, byte ptr [esp + 0x10]
        R.sub(((R.ebx >>> 0) & 0xff), 0x16, 8); // 4d3150: cmp bl, 0x16
        if (!R.cL) { pc = 418; continue; } // 4d3153: jge 0x4d31f5
        pc = 412; continue;
      case 412: // 4d3159
        R.ecx = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 4d3159: mov ecx, dword ptr [esp + 0x18]
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ecx + 0x4f) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d315d: mov al, byte ptr [ecx + 0x4f]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0xf0, 8)) & 0xff) << 0)) | 0; // 4d3160: and al, 0xf0
        R.sub(((R.eax >>> 0) & 0xff), 0x70, 8); // 4d3162: cmp al, 0x70
        if (R.zf) { pc = 418; continue; } // 4d3164: je 0x4d31f5
        pc = 413; continue;
      case 413: // 4d316a
        R.sub(((R.eax >>> 0) & 0xff), 0x60, 8); // 4d316a: cmp al, 0x60
        if (R.zf) { pc = 418; continue; } // 4d316c: je 0x4d31f5
        pc = 414; continue;
      default: return pc;
    }
  }
}
function f_4d1600_49(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 414: // 4d3172
        R.eax = (((R.m.u16(((R.esp + 0x20) | 0) >>> 0)) << 16 >> 16)) | 0; // 4d3172: movsx eax, word ptr [esp + 0x20]
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, (R.eax >>> 0)); // 4d3177: mov dword ptr [esp + 0x28], eax
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 4d317b: lea eax, [eax + eax*4]
        R.edx = (((R.eax + R.eax * 4) | 0)) | 0; // 4d317e: lea edx, [eax + eax*4]
        R.eax = (((R.m.u16(((R.ebp + 0x80) | 0) >>> 0)) << 16 >> 16)) | 0; // 4d3181: movsx eax, word ptr [ebp + 0x80]
        R.edx = (R.shl((R.edx >>> 0), 0x1, 32)) | 0; // 4d3188: shl edx, 1
        R.sub((R.edx >>> 0), (R.eax >>> 0), 32); // 4d318a: cmp edx, eax
        if (R.cLE) { pc = 418; continue; } // 4d318c: jle 0x4d31f5
        pc = 415; continue;
      case 415: // 4d318e
        R.eax = (((R.m.u8(((R.ecx + 0x44) | 0) >>> 0)) << 24 >> 24)) | 0; // 4d318e: movsx eax, byte ptr [ecx + 0x44]
        R.fpush(R.m.s32(((R.esp + 0x28) | 0) >>> 0)); // 4d3192: fild dword ptr [esp + 0x28]
        R.edx = R.eax < 0 ? -1 : 0; // 4d3196: cdq 
        R.edx = (R.logic((R.edx >>> 0) & 0x3, 32)) | 0; // 4d3197: and edx, 3
        R.ecx = (0x7d) | 0; // 4d319a: mov ecx, 0x7d
        R.eax = (R.add((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 4d319f: add eax, edx
        R.eax = (R.sar((R.eax >>> 0), 0x2, 32)) | 0; // 4d31a1: sar eax, 2
        R.ecx = (R.sub((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 4d31a4: sub ecx, eax
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.ecx >>> 0)); // 4d31a6: mov dword ptr [esp + 0x38], ecx
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d31aa: fild dword ptr [esp + 0x38]
        R.eax = (((((R.ebx >>> 0) & 0xff)) << 24 >> 24)) | 0; // 4d31ae: movsx eax, bl
        R.st[1] = R.st[1] / R.st[0]; R.fpop(); // 4d31b1: fdivp st(1)
        R.eax = (R.sub((R.eax >>> 0), 0x14, 32)) | 0; // 4d31b3: sub eax, 0x14
        R.edx = R.eax < 0 ? -1 : 0; // 4d31b6: cdq 
        R.eax = (R.logic((R.eax >>> 0) ^ (R.edx >>> 0), 32)) | 0; // 4d31b7: xor eax, edx
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 4d31b9: sub eax, edx
        { const p = BigInt((((R.eax >>> 0)) | 0)) * BigInt(1333333); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.eax = (Number(BigInt.asIntN(32, p))) | 0; } // 4d31bb: imul eax, eax, 0x145855
        R.st[0] = R.st[0] * R.m.s32(((R.esp + 0x14) | 0) >>> 0); // 4d31c1: fimul dword ptr [esp + 0x14]
        R.edi = (R.sub((R.edi >>> 0), (R.eax >>> 0), 32)) | 0; // 4d31c5: sub edi, eax
        R.edi = (R.add((R.edi >>> 0), 0x4c4b40, 32)) | 0; // 4d31c7: add edi, 0x4c4b40
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 4d31cd: mov dword ptr [esp + 0x38], edi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d31d1: fild dword ptr [esp + 0x38]
        R.m.wf64(((R.esp + 0x6c) | 0) >>> 0, R.st[0]); R.fpop(); // 4d31d5: fstp qword ptr [esp + 0x6c]
        R.fcom(R.st[0], R.f64(((R.esp + 0x6c) | 0))); // 4d31d9: fcom qword ptr [esp + 0x6c]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d31dd: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d31df: test ah, 1
        if (!R.zf) { pc = 417; continue; } // 4d31e2: jne 0x4d31ea
        pc = 416; continue;
      case 416: // 4d31e4
        R.fpop(); // 4d31e4: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x6c) | 0))); // 4d31e6: fld qword ptr [esp + 0x6c]
        pc = 417; continue;
      case 417: // 4d31ea
        R.ftol(); // 4d31ea: call 0x945640
        R.edi = ((R.eax >>> 0)) | 0; // 4d31ef: mov edi, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 4d31f1: mov dword ptr [esp + 0x14], edi
        pc = 418; continue;
      case 418: // 4d31f5
        R.sub(R.m.u16(((R.ebp + 0x80) | 0) >>> 0), 0x1a5e, 16); // 4d31f5: cmp word ptr [ebp + 0x80], 0x1a5e
        if (!R.cLE) { pc = 440; continue; } // 4d31fe: jg 0x4d336b
        pc = 419; continue;
      case 419: // 4d3204
        R.esi = (R.m.u32(((R.ebp + 0x57) | 0) >>> 0)) | 0; // 4d3204: mov esi, dword ptr [ebp + 0x57]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 4d3207: test esi, esi
        if (R.zf) { pc = 421; continue; } // 4d3209: je 0x4d3216
        pc = 420; continue;
      default: return pc;
    }
  }
}
function f_4d1600_50(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 420: // 4d320b
        R.sub(R.m.u16(((R.esi + 0x69) | 0) >>> 0), 0xf, 16); // 4d320b: cmp word ptr [esi + 0x69], 0xf
        if (!R.cLE) { pc = 440; continue; } // 4d3210: jg 0x4d336b
        pc = 421; continue;
      case 421: // 4d3216
        R.ecx = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 4d3216: mov ecx, dword ptr [esp + 0x18]
        R.eax = (R.m.u32(((R.ecx + 0x45) | 0) >>> 0)) | 0; // 4d321a: mov eax, dword ptr [ecx + 0x45]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d321d: test eax, eax
        if (R.zf) { pc = 423; continue; } // 4d321f: je 0x4d322c
        pc = 422; continue;
      case 422: // 4d3221
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ecx + 0x44) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d3221: mov al, byte ptr [ecx + 0x44]
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 4d3224: test al, al
        if (R.cLE) { pc = 514; continue; } // 4d3226: jle 0x4d3886
        pc = 423; continue;
      case 423: // 4d322c
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ecx + 0x4f) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d322c: mov al, byte ptr [ecx + 0x4f]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0xf0, 8)) & 0xff) << 0)) | 0; // 4d322f: and al, 0xf0
        R.sub(((R.eax >>> 0) & 0xff), 0x10, 8); // 4d3231: cmp al, 0x10
        if (!R.zf) { pc = 431; continue; } // 4d3233: jne 0x4d32c2
        pc = 424; continue;
      case 424: // 4d3239
        R.edi = (R.add((R.edi >>> 0), 0x3d090, 32)) | 0; // 4d3239: add edi, 0x3d090
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 4d323f: mov dword ptr [esp + 0x38], edi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d3243: fild dword ptr [esp + 0x38]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d3247: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 1.25; // 4d324b: fmul qword ptr [0x968928]
        R.m.wf64(((R.esp + 0x44) | 0) >>> 0, R.st[0]); R.fpop(); // 4d3251: fstp qword ptr [esp + 0x44]
        R.fcom(R.st[0], R.f64(((R.esp + 0x44) | 0))); // 4d3255: fcom qword ptr [esp + 0x44]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d3259: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d325b: test ah, 1
        if (!R.zf) { pc = 426; continue; } // 4d325e: jne 0x4d3266
        pc = 425; continue;
      case 425: // 4d3260
        R.fpop(); // 4d3260: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x44) | 0))); // 4d3262: fld qword ptr [esp + 0x44]
        pc = 426; continue;
      case 426: // 4d3266
        R.ftol(); // 4d3266: call 0x945640
        R.edi = ((R.eax >>> 0)) | 0; // 4d326b: mov edi, eax
        R.eax = (R.m.u32(((R.esp + 0x94) | 0) >>> 0)) | 0; // 4d326d: mov eax, dword ptr [esp + 0x94]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d3274: test eax, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 4d3276: mov dword ptr [esp + 0x14], edi
        if (R.zf) { pc = 514; continue; } // 4d327a: je 0x4d3886
        pc = 427; continue;
      case 427: // 4d3280
        R.edx = ((R.eax >>> 0)) | 0; // 4d3280: mov edx, eax
        R.sub((R.esi >>> 0), R.m.u32(((R.edx + 0x57) | 0) >>> 0), 32); // 4d3282: cmp esi, dword ptr [edx + 0x57]
        if (!R.zf) { pc = 514; continue; } // 4d3285: jne 0x4d3886
        pc = 428; continue;
      default: return pc;
    }
  }
}
function f_4d1600_51(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 428: // 4d328b
        R.edi = (R.add((R.edi >>> 0), 0xc350, 32)) | 0; // 4d328b: add edi, 0xc350
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 4d3291: mov dword ptr [esp + 0x38], edi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d3295: fild dword ptr [esp + 0x38]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d3299: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 1.05; // 4d329d: fmul qword ptr [0x9689b8]
        R.m.wf64(((R.esp + 0x4c) | 0) >>> 0, R.st[0]); R.fpop(); // 4d32a3: fstp qword ptr [esp + 0x4c]
        R.fcom(R.st[0], R.f64(((R.esp + 0x4c) | 0))); // 4d32a7: fcom qword ptr [esp + 0x4c]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d32ab: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d32ad: test ah, 1
        if (!R.zf) { pc = 430; continue; } // 4d32b0: jne 0x4d32b8
        pc = 429; continue;
      case 429: // 4d32b2
        R.fpop(); // 4d32b2: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x4c) | 0))); // 4d32b4: fld qword ptr [esp + 0x4c]
        pc = 430; continue;
      case 430: // 4d32b8
        R.ftol(); // 4d32b8: call 0x945640
        pc = 512; continue; // 4d32bd: jmp 0x4d3880
      case 431: // 4d32c2
        R.sub(((R.eax >>> 0) & 0xff), 0x20, 8); // 4d32c2: cmp al, 0x20
        if (R.zf) { pc = 433; continue; } // 4d32c4: je 0x4d32e4
        pc = 432; continue;
      case 432: // 4d32c6
        R.eax = (R.m.u32(((R.esp + 0x98) | 0) >>> 0)) | 0; // 4d32c6: mov eax, dword ptr [esp + 0x98]
        R.ecx = (((R.m.u8(((R.ecx + 0x3d) | 0) >>> 0)) << 24 >> 24)) | 0; // 4d32cd: movsx ecx, byte ptr [ecx + 0x3d]
        R.edx = (((R.m.u8(((R.eax + 0x59) | 0) >>> 0)) << 24 >> 24)) | 0; // 4d32d1: movsx edx, byte ptr [eax + 0x59]
        R.eax = (0x28) | 0; // 4d32d5: mov eax, 0x28
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 4d32da: sub eax, edx
        R.sub((R.ecx >>> 0), (R.eax >>> 0), 32); // 4d32dc: cmp ecx, eax
        if (R.cLE) { pc = 514; continue; } // 4d32de: jle 0x4d3886
        pc = 433; continue;
      case 433: // 4d32e4
        R.edi = (R.add((R.edi >>> 0), 0x186a0, 32)) | 0; // 4d32e4: add edi, 0x186a0
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 4d32ea: mov dword ptr [esp + 0x38], edi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d32ee: fild dword ptr [esp + 0x38]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d32f2: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 1.1; // 4d32f6: fmul qword ptr [0x9689c0]
        R.m.wf64(((R.esp + 0x44) | 0) >>> 0, R.st[0]); R.fpop(); // 4d32fc: fstp qword ptr [esp + 0x44]
        R.fcom(R.st[0], R.f64(((R.esp + 0x44) | 0))); // 4d3300: fcom qword ptr [esp + 0x44]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d3304: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d3306: test ah, 1
        if (!R.zf) { pc = 435; continue; } // 4d3309: jne 0x4d3311
        pc = 434; continue;
      case 434: // 4d330b
        R.fpop(); // 4d330b: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x44) | 0))); // 4d330d: fld qword ptr [esp + 0x44]
        pc = 435; continue;
      case 435: // 4d3311
        R.ftol(); // 4d3311: call 0x945640
        R.edi = ((R.eax >>> 0)) | 0; // 4d3316: mov edi, eax
        R.eax = (R.m.u32(((R.esp + 0x94) | 0) >>> 0)) | 0; // 4d3318: mov eax, dword ptr [esp + 0x94]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d331f: test eax, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 4d3321: mov dword ptr [esp + 0x14], edi
        if (R.zf) { pc = 514; continue; } // 4d3325: je 0x4d3886
        pc = 436; continue;
      case 436: // 4d332b
        R.sub((R.esi >>> 0), R.m.u32(((R.eax + 0x57) | 0) >>> 0), 32); // 4d332b: cmp esi, dword ptr [eax + 0x57]
        if (!R.zf) { pc = 514; continue; } // 4d332e: jne 0x4d3886
        pc = 437; continue;
      default: return pc;
    }
  }
}
function f_4d1600_52(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 437: // 4d3334
        R.edi = (R.add((R.edi >>> 0), 0x61a8, 32)) | 0; // 4d3334: add edi, 0x61a8
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 4d333a: mov dword ptr [esp + 0x38], edi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d333e: fild dword ptr [esp + 0x38]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d3342: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 1.025; // 4d3346: fmul qword ptr [0x968fa0]
        R.m.wf64(((R.esp + 0x4c) | 0) >>> 0, R.st[0]); R.fpop(); // 4d334c: fstp qword ptr [esp + 0x4c]
        R.fcom(R.st[0], R.f64(((R.esp + 0x4c) | 0))); // 4d3350: fcom qword ptr [esp + 0x4c]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d3354: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d3356: test ah, 1
        if (!R.zf) { pc = 439; continue; } // 4d3359: jne 0x4d3361
        pc = 438; continue;
      case 438: // 4d335b
        R.fpop(); // 4d335b: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x4c) | 0))); // 4d335d: fld qword ptr [esp + 0x4c]
        pc = 439; continue;
      case 439: // 4d3361
        R.ftol(); // 4d3361: call 0x945640
        pc = 512; continue; // 4d3366: jmp 0x4d3880
      case 440: // 4d336b
        R.esi = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 4d336b: mov esi, dword ptr [esp + 0x18]
        R.eax = (R.m.u32(((R.esi + 0x45) | 0) >>> 0)) | 0; // 4d336f: mov eax, dword ptr [esi + 0x45]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d3372: test eax, eax
        if (R.zf) { pc = 483; continue; } // 4d3374: je 0x4d368d
        pc = 441; continue;
      case 441: // 4d337a
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.esi + 0x44) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d337a: mov cl, byte ptr [esi + 0x44]
        R.logic(((R.ecx >>> 0) & 0xff) & ((R.ecx >>> 0) & 0xff), 8); // 4d337d: test cl, cl
        if (!R.cLE) { pc = 483; continue; } // 4d337f: jg 0x4d368d
        pc = 442; continue;
      case 442: // 4d3385
        R.logic((R.eax >>> 0) & 0x101, 32); // 4d3385: test eax, 0x101
        if (R.zf) { pc = 468; continue; } // 4d338a: je 0x4d3571
        pc = 443; continue;
      case 443: // 4d3390
        R.edx = (R.m.u32(((0xae2c94) | 0) >>> 0)) | 0; // 4d3390: mov edx, dword ptr [0xae2c94]
        R.eax = (R.m.u32(((0xae2c90) | 0) >>> 0)) | 0; // 4d3396: mov eax, dword ptr [0xae2c90]
        R.push((R.edx >>> 0)); // 4d339b: push edx
        R.push((R.eax >>> 0)); // 4d339c: push eax
        R.ecx = (((R.esi + 0x2d) | 0)) | 0; // 4d339d: lea ecx, [esi + 0x2d]
        R.call(0x54cdb0, { n: 2, thisEcx: true, calleeClean: true }); // 4d33a0: call 0x54cdb0
        R.sub((R.eax >>> 0), 0x1a9, 32); // 4d33a5: cmp eax, 0x1a9
        if (R.cLE) { pc = 468; continue; } // 4d33aa: jle 0x4d3571
        pc = 444; continue;
      case 444: // 4d33b0
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi + 0x4f) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d33b0: mov al, byte ptr [esi + 0x4f]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0xf0, 8)) & 0xff) << 0)) | 0; // 4d33b3: and al, 0xf0
        R.sub(((R.eax >>> 0) & 0xff), 0x10, 8); // 4d33b5: cmp al, 0x10
        if (!R.zf) { pc = 452; continue; } // 4d33b7: jne 0x4d3449
        pc = 445; continue;
      default: return pc;
    }
  }
}
function f_4d1600_53(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 445: // 4d33bd
        R.edi = (R.add((R.edi >>> 0), 0x7a120, 32)) | 0; // 4d33bd: add edi, 0x7a120
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 4d33c3: mov dword ptr [esp + 0x38], edi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d33c7: fild dword ptr [esp + 0x38]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d33cb: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 1.25; // 4d33cf: fmul qword ptr [0x968928]
        R.m.wf64(((R.esp + 0x44) | 0) >>> 0, R.st[0]); R.fpop(); // 4d33d5: fstp qword ptr [esp + 0x44]
        R.fcom(R.st[0], R.f64(((R.esp + 0x44) | 0))); // 4d33d9: fcom qword ptr [esp + 0x44]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d33dd: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d33df: test ah, 1
        if (!R.zf) { pc = 447; continue; } // 4d33e2: jne 0x4d33ea
        pc = 446; continue;
      case 446: // 4d33e4
        R.fpop(); // 4d33e4: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x44) | 0))); // 4d33e6: fld qword ptr [esp + 0x44]
        pc = 447; continue;
      case 447: // 4d33ea
        R.ftol(); // 4d33ea: call 0x945640
        R.edi = ((R.eax >>> 0)) | 0; // 4d33ef: mov edi, eax
        R.eax = (R.m.u32(((R.esp + 0x94) | 0) >>> 0)) | 0; // 4d33f1: mov eax, dword ptr [esp + 0x94]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d33f8: test eax, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 4d33fa: mov dword ptr [esp + 0x14], edi
        if (R.zf) { pc = 514; continue; } // 4d33fe: je 0x4d3886
        pc = 448; continue;
      case 448: // 4d3404
        R.ecx = (R.m.u32(((R.ebp + 0x57) | 0) >>> 0)) | 0; // 4d3404: mov ecx, dword ptr [ebp + 0x57]
        R.edx = (R.m.u32(((R.eax + 0x57) | 0) >>> 0)) | 0; // 4d3407: mov edx, dword ptr [eax + 0x57]
        R.sub((R.ecx >>> 0), (R.edx >>> 0), 32); // 4d340a: cmp ecx, edx
        if (!R.zf) { pc = 514; continue; } // 4d340c: jne 0x4d3886
        pc = 449; continue;
      case 449: // 4d3412
        R.edi = (R.add((R.edi >>> 0), 0x3d090, 32)) | 0; // 4d3412: add edi, 0x3d090
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 4d3418: mov dword ptr [esp + 0x38], edi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d341c: fild dword ptr [esp + 0x38]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d3420: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 1.1; // 4d3424: fmul qword ptr [0x9689c0]
        R.m.wf64(((R.esp + 0x44) | 0) >>> 0, R.st[0]); R.fpop(); // 4d342a: fstp qword ptr [esp + 0x44]
        R.fcom(R.st[0], R.f64(((R.esp + 0x44) | 0))); // 4d342e: fcom qword ptr [esp + 0x44]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d3432: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d3434: test ah, 1
        if (!R.zf) { pc = 451; continue; } // 4d3437: jne 0x4d343f
        pc = 450; continue;
      case 450: // 4d3439
        R.fpop(); // 4d3439: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x44) | 0))); // 4d343b: fld qword ptr [esp + 0x44]
        pc = 451; continue;
      case 451: // 4d343f
        R.ftol(); // 4d343f: call 0x945640
        pc = 512; continue; // 4d3444: jmp 0x4d3880
      case 452: // 4d3449
        R.sub(((R.eax >>> 0) & 0xff), 0x20, 8); // 4d3449: cmp al, 0x20
        if (!R.zf) { pc = 460; continue; } // 4d344b: jne 0x4d34dd
        pc = 453; continue;
      default: return pc;
    }
  }
}
function f_4d1600_54(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 453: // 4d3451
        R.edi = (R.add((R.edi >>> 0), 0xf4240, 32)) | 0; // 4d3451: add edi, 0xf4240
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 4d3457: mov dword ptr [esp + 0x38], edi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d345b: fild dword ptr [esp + 0x38]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d345f: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 1.2; // 4d3463: fmul qword ptr [0x968978]
        R.m.wf64(((R.esp + 0x6c) | 0) >>> 0, R.st[0]); R.fpop(); // 4d3469: fstp qword ptr [esp + 0x6c]
        R.fcom(R.st[0], R.f64(((R.esp + 0x6c) | 0))); // 4d346d: fcom qword ptr [esp + 0x6c]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d3471: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d3473: test ah, 1
        if (!R.zf) { pc = 455; continue; } // 4d3476: jne 0x4d347e
        pc = 454; continue;
      case 454: // 4d3478
        R.fpop(); // 4d3478: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x6c) | 0))); // 4d347a: fld qword ptr [esp + 0x6c]
        pc = 455; continue;
      case 455: // 4d347e
        R.ftol(); // 4d347e: call 0x945640
        R.edi = ((R.eax >>> 0)) | 0; // 4d3483: mov edi, eax
        R.eax = (R.m.u32(((R.esp + 0x94) | 0) >>> 0)) | 0; // 4d3485: mov eax, dword ptr [esp + 0x94]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d348c: test eax, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 4d348e: mov dword ptr [esp + 0x14], edi
        if (R.zf) { pc = 514; continue; } // 4d3492: je 0x4d3886
        pc = 456; continue;
      case 456: // 4d3498
        R.edx = (R.m.u32(((R.ebp + 0x57) | 0) >>> 0)) | 0; // 4d3498: mov edx, dword ptr [ebp + 0x57]
        R.ecx = (R.m.u32(((R.eax + 0x57) | 0) >>> 0)) | 0; // 4d349b: mov ecx, dword ptr [eax + 0x57]
        R.sub((R.edx >>> 0), (R.ecx >>> 0), 32); // 4d349e: cmp edx, ecx
        if (!R.zf) { pc = 514; continue; } // 4d34a0: jne 0x4d3886
        pc = 457; continue;
      case 457: // 4d34a6
        R.edi = (R.add((R.edi >>> 0), 0x30d40, 32)) | 0; // 4d34a6: add edi, 0x30d40
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 4d34ac: mov dword ptr [esp + 0x38], edi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d34b0: fild dword ptr [esp + 0x38]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d34b4: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 1.05; // 4d34b8: fmul qword ptr [0x9689b8]
        R.m.wf64(((R.esp + 0x4c) | 0) >>> 0, R.st[0]); R.fpop(); // 4d34be: fstp qword ptr [esp + 0x4c]
        R.fcom(R.st[0], R.f64(((R.esp + 0x4c) | 0))); // 4d34c2: fcom qword ptr [esp + 0x4c]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d34c6: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d34c8: test ah, 1
        if (!R.zf) { pc = 459; continue; } // 4d34cb: jne 0x4d34d3
        pc = 458; continue;
      case 458: // 4d34cd
        R.fpop(); // 4d34cd: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x4c) | 0))); // 4d34cf: fld qword ptr [esp + 0x4c]
        pc = 459; continue;
      case 459: // 4d34d3
        R.ftol(); // 4d34d3: call 0x945640
        pc = 512; continue; // 4d34d8: jmp 0x4d3880
      case 460: // 4d34dd
        R.sub(((R.eax >>> 0) & 0xff), 0x30, 8); // 4d34dd: cmp al, 0x30
        if (!R.zf) { pc = 514; continue; } // 4d34df: jne 0x4d3886
        pc = 461; continue;
      default: return pc;
    }
  }
}
function f_4d1600_55(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 461: // 4d34e5
        R.edi = (R.add((R.edi >>> 0), 0xb71b0, 32)) | 0; // 4d34e5: add edi, 0xb71b0
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 4d34eb: mov dword ptr [esp + 0x38], edi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d34ef: fild dword ptr [esp + 0x38]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d34f3: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 1.15; // 4d34f7: fmul qword ptr [0x968980]
        R.m.wf64(((R.esp + 0x4c) | 0) >>> 0, R.st[0]); R.fpop(); // 4d34fd: fstp qword ptr [esp + 0x4c]
        R.fcom(R.st[0], R.f64(((R.esp + 0x4c) | 0))); // 4d3501: fcom qword ptr [esp + 0x4c]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d3505: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d3507: test ah, 1
        if (!R.zf) { pc = 463; continue; } // 4d350a: jne 0x4d3512
        pc = 462; continue;
      case 462: // 4d350c
        R.fpop(); // 4d350c: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x4c) | 0))); // 4d350e: fld qword ptr [esp + 0x4c]
        pc = 463; continue;
      case 463: // 4d3512
        R.ftol(); // 4d3512: call 0x945640
        R.edi = ((R.eax >>> 0)) | 0; // 4d3517: mov edi, eax
        R.eax = (R.m.u32(((R.esp + 0x94) | 0) >>> 0)) | 0; // 4d3519: mov eax, dword ptr [esp + 0x94]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d3520: test eax, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 4d3522: mov dword ptr [esp + 0x14], edi
        if (R.zf) { pc = 514; continue; } // 4d3526: je 0x4d3886
        pc = 464; continue;
      case 464: // 4d352c
        R.ecx = (R.m.u32(((R.ebp + 0x57) | 0) >>> 0)) | 0; // 4d352c: mov ecx, dword ptr [ebp + 0x57]
        R.edx = (R.m.u32(((R.eax + 0x57) | 0) >>> 0)) | 0; // 4d352f: mov edx, dword ptr [eax + 0x57]
        R.sub((R.ecx >>> 0), (R.edx >>> 0), 32); // 4d3532: cmp ecx, edx
        if (!R.zf) { pc = 514; continue; } // 4d3534: jne 0x4d3886
        pc = 465; continue;
      case 465: // 4d353a
        R.edi = (R.add((R.edi >>> 0), 0x249f0, 32)) | 0; // 4d353a: add edi, 0x249f0
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 4d3540: mov dword ptr [esp + 0x38], edi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d3544: fild dword ptr [esp + 0x38]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d3548: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 1.02; // 4d354c: fmul qword ptr [0x968f88]
        R.m.wf64(((R.esp + 0x4c) | 0) >>> 0, R.st[0]); R.fpop(); // 4d3552: fstp qword ptr [esp + 0x4c]
        R.fcom(R.st[0], R.f64(((R.esp + 0x4c) | 0))); // 4d3556: fcom qword ptr [esp + 0x4c]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d355a: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d355c: test ah, 1
        if (!R.zf) { pc = 467; continue; } // 4d355f: jne 0x4d3567
        pc = 466; continue;
      case 466: // 4d3561
        R.fpop(); // 4d3561: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x4c) | 0))); // 4d3563: fld qword ptr [esp + 0x4c]
        pc = 467; continue;
      case 467: // 4d3567
        R.ftol(); // 4d3567: call 0x945640
        pc = 512; continue; // 4d356c: jmp 0x4d3880
      case 468: // 4d3571
        R.edx = (R.m.u32(((0xae2c94) | 0) >>> 0)) | 0; // 4d3571: mov edx, dword ptr [0xae2c94]
        R.eax = (R.m.u32(((0xae2c90) | 0) >>> 0)) | 0; // 4d3577: mov eax, dword ptr [0xae2c90]
        R.push((R.edx >>> 0)); // 4d357c: push edx
        R.push((R.eax >>> 0)); // 4d357d: push eax
        R.ecx = (((R.esi + 0x2d) | 0)) | 0; // 4d357e: lea ecx, [esi + 0x2d]
        R.call(0x54cdb0, { n: 2, thisEcx: true, calleeClean: true }); // 4d3581: call 0x54cdb0
        R.sub((R.eax >>> 0), 0xe1, 32); // 4d3586: cmp eax, 0xe1
        if (R.cLE) { pc = 514; continue; } // 4d358b: jle 0x4d3886
        pc = 469; continue;
      default: return pc;
    }
  }
}
function f_4d1600_56(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 469: // 4d3591
        R.ecx = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 4d3591: mov ecx, dword ptr [esp + 0x18]
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.ecx + 0x4f) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d3595: mov dl, byte ptr [ecx + 0x4f]
        R.edx = ((R.edx & 0xffffff00) | (((R.logic(((R.edx >>> 0) & 0xff) & 0xf0, 8)) & 0xff) << 0)) | 0; // 4d3598: and dl, 0xf0
        R.sub(((R.edx >>> 0) & 0xff), 0x70, 8); // 4d359b: cmp dl, 0x70
        if (R.zf) { pc = 514; continue; } // 4d359e: je 0x4d3886
        pc = 470; continue;
      case 470: // 4d35a4
        R.eax = (R.m.u32(((R.esp + 0x98) | 0) >>> 0)) | 0; // 4d35a4: mov eax, dword ptr [esp + 0x98]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.eax + 0x59) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d35ab: mov cl, byte ptr [eax + 0x59]
        R.eax = (((R.m.u8(((R.eax + 0x5b) | 0) >>> 0)) << 24 >> 24)) | 0; // 4d35ae: movsx eax, byte ptr [eax + 0x5b]
        R.edx = (((((R.ecx >>> 0) & 0xff)) << 24 >> 24)) | 0; // 4d35b2: movsx edx, cl
        R.eax = (R.add((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 4d35b5: add eax, edx
        R.sub((R.eax >>> 0), 0xa, 32); // 4d35b7: cmp eax, 0xa
        if (R.cLE) { pc = 514; continue; } // 4d35ba: jle 0x4d3886
        pc = 471; continue;
      case 471: // 4d35c0
        R.eax = (R.m.u32(((R.esp + 0x98) | 0) >>> 0)) | 0; // 4d35c0: mov eax, dword ptr [esp + 0x98]
        R.eax = (R.m.u32(((R.eax + 0x61) | 0) >>> 0)) | 0; // 4d35c7: mov eax, dword ptr [eax + 0x61]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d35ca: test eax, eax
        if (R.zf) { pc = 514; continue; } // 4d35cc: je 0x4d3886
        pc = 472; continue;
      case 472: // 4d35d2
        R.sub(R.m.u16(((R.eax + 0xb) | 0) >>> 0), 0x1482, 16); // 4d35d2: cmp word ptr [eax + 0xb], 0x1482
        if (R.cLE) { pc = 514; continue; } // 4d35d8: jle 0x4d3886
        pc = 473; continue;
      case 473: // 4d35de
        R.eax = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 4d35de: mov eax, dword ptr [esp + 0x18]
        R.edx = ((R.edx & 0xffffff00) | (((0xa) & 0xff) << 0)) | 0; // 4d35e2: mov dl, 0xa
        R.edx = ((R.edx & 0xffffff00) | (((R.sub(((R.edx >>> 0) & 0xff), ((R.ecx >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 4d35e4: sub dl, cl
        R.sub(R.m.u8(((R.eax + 0x3d) | 0) >>> 0), ((R.edx >>> 0) & 0xff), 8); // 4d35e6: cmp byte ptr [eax + 0x3d], dl
        if (R.cLE) { pc = 514; continue; } // 4d35e9: jle 0x4d3886
        pc = 474; continue;
      case 474: // 4d35ef
        R.sub(((R.ebx >>> 0) & 0xff), 0x16, 8); // 4d35ef: cmp bl, 0x16
        if (R.cLE) { pc = 514; continue; } // 4d35f2: jle 0x4d3886
        pc = 475; continue;
      case 475: // 4d35f8
        R.sub(((R.ebx >>> 0) & 0xff), 0x1f, 8); // 4d35f8: cmp bl, 0x1f
        if (!R.cL) { pc = 514; continue; } // 4d35fb: jge 0x4d3886
        pc = 476; continue;
      case 476: // 4d3601
        R.edi = (R.add((R.edi >>> 0), 0xb71b0, 32)) | 0; // 4d3601: add edi, 0xb71b0
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 4d3607: mov dword ptr [esp + 0x38], edi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d360b: fild dword ptr [esp + 0x38]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d360f: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 1.15; // 4d3613: fmul qword ptr [0x968980]
        R.m.wf64(((R.esp + 0x4c) | 0) >>> 0, R.st[0]); R.fpop(); // 4d3619: fstp qword ptr [esp + 0x4c]
        R.fcom(R.st[0], R.f64(((R.esp + 0x4c) | 0))); // 4d361d: fcom qword ptr [esp + 0x4c]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d3621: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d3623: test ah, 1
        if (!R.zf) { pc = 478; continue; } // 4d3626: jne 0x4d362e
        pc = 477; continue;
      case 477: // 4d3628
        R.fpop(); // 4d3628: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x4c) | 0))); // 4d362a: fld qword ptr [esp + 0x4c]
        pc = 478; continue;
      default: return pc;
    }
  }
}
function f_4d1600_57(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 478: // 4d362e
        R.ftol(); // 4d362e: call 0x945640
        R.edi = ((R.eax >>> 0)) | 0; // 4d3633: mov edi, eax
        R.eax = (R.m.u32(((R.esp + 0x94) | 0) >>> 0)) | 0; // 4d3635: mov eax, dword ptr [esp + 0x94]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d363c: test eax, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 4d363e: mov dword ptr [esp + 0x14], edi
        if (R.zf) { pc = 514; continue; } // 4d3642: je 0x4d3886
        pc = 479; continue;
      case 479: // 4d3648
        R.ecx = (R.m.u32(((R.ebp + 0x57) | 0) >>> 0)) | 0; // 4d3648: mov ecx, dword ptr [ebp + 0x57]
        R.edx = ((R.eax >>> 0)) | 0; // 4d364b: mov edx, eax
        R.sub((R.ecx >>> 0), R.m.u32(((R.edx + 0x57) | 0) >>> 0), 32); // 4d364d: cmp ecx, dword ptr [edx + 0x57]
        if (!R.zf) { pc = 514; continue; } // 4d3650: jne 0x4d3886
        pc = 480; continue;
      case 480: // 4d3656
        R.edi = (R.add((R.edi >>> 0), 0x249f0, 32)) | 0; // 4d3656: add edi, 0x249f0
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 4d365c: mov dword ptr [esp + 0x38], edi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d3660: fild dword ptr [esp + 0x38]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d3664: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 1.02; // 4d3668: fmul qword ptr [0x968f88]
        R.m.wf64(((R.esp + 0x4c) | 0) >>> 0, R.st[0]); R.fpop(); // 4d366e: fstp qword ptr [esp + 0x4c]
        R.fcom(R.st[0], R.f64(((R.esp + 0x4c) | 0))); // 4d3672: fcom qword ptr [esp + 0x4c]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d3676: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d3678: test ah, 1
        if (!R.zf) { pc = 482; continue; } // 4d367b: jne 0x4d3683
        pc = 481; continue;
      case 481: // 4d367d
        R.fpop(); // 4d367d: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x4c) | 0))); // 4d367f: fld qword ptr [esp + 0x4c]
        pc = 482; continue;
      case 482: // 4d3683
        R.ftol(); // 4d3683: call 0x945640
        pc = 512; continue; // 4d3688: jmp 0x4d3880
      case 483: // 4d368d
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi + 0x4f) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d368d: mov al, byte ptr [esi + 0x4f]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0xf0, 8)) & 0xff) << 0)) | 0; // 4d3690: and al, 0xf0
        R.sub(((R.eax >>> 0) & 0xff), 0x10, 8); // 4d3692: cmp al, 0x10
        if (!R.zf) { pc = 491; continue; } // 4d3694: jne 0x4d36fc
        pc = 484; continue;
      case 484: // 4d3696
        R.eax = (((R.edi + 0x1e8480) | 0)) | 0; // 4d3696: lea eax, [edi + 0x1e8480]
        R.edi = (R.add((R.edi >>> 0), (R.edi >>> 0), 32)) | 0; // 4d369c: add edi, edi
        R.sub((R.eax >>> 0), (R.edi >>> 0), 32); // 4d369e: cmp eax, edi
        if (!R.cL) { pc = 486; continue; } // 4d36a0: jge 0x4d36a4
        pc = 485; continue;
      case 485: // 4d36a2
        R.edi = ((R.eax >>> 0)) | 0; // 4d36a2: mov edi, eax
        pc = 486; continue;
      case 486: // 4d36a4
        R.eax = (R.m.u32(((R.esp + 0x94) | 0) >>> 0)) | 0; // 4d36a4: mov eax, dword ptr [esp + 0x94]
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 4d36ab: mov dword ptr [esp + 0x14], edi
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d36af: test eax, eax
        if (R.zf) { pc = 514; continue; } // 4d36b1: je 0x4d3886
        pc = 487; continue;
      case 487: // 4d36b7
        R.ecx = (R.m.u32(((R.ebp + 0x57) | 0) >>> 0)) | 0; // 4d36b7: mov ecx, dword ptr [ebp + 0x57]
        R.edx = (R.m.u32(((R.eax + 0x57) | 0) >>> 0)) | 0; // 4d36ba: mov edx, dword ptr [eax + 0x57]
        R.sub((R.ecx >>> 0), (R.edx >>> 0), 32); // 4d36bd: cmp ecx, edx
        if (!R.zf) { pc = 514; continue; } // 4d36bf: jne 0x4d3886
        pc = 488; continue;
      default: return pc;
    }
  }
}
function f_4d1600_58(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 488: // 4d36c5
        R.edi = (R.add((R.edi >>> 0), 0x186a0, 32)) | 0; // 4d36c5: add edi, 0x186a0
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 4d36cb: mov dword ptr [esp + 0x38], edi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d36cf: fild dword ptr [esp + 0x38]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d36d3: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 1.1; // 4d36d7: fmul qword ptr [0x9689c0]
        R.m.wf64(((R.esp + 0x44) | 0) >>> 0, R.st[0]); R.fpop(); // 4d36dd: fstp qword ptr [esp + 0x44]
        R.fcom(R.st[0], R.f64(((R.esp + 0x44) | 0))); // 4d36e1: fcom qword ptr [esp + 0x44]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d36e5: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d36e7: test ah, 1
        if (!R.zf) { pc = 490; continue; } // 4d36ea: jne 0x4d36f2
        pc = 489; continue;
      case 489: // 4d36ec
        R.fpop(); // 4d36ec: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x44) | 0))); // 4d36ee: fld qword ptr [esp + 0x44]
        pc = 490; continue;
      case 490: // 4d36f2
        R.ftol(); // 4d36f2: call 0x945640
        pc = 512; continue; // 4d36f7: jmp 0x4d3880
      case 491: // 4d36fc
        R.sub(((R.eax >>> 0) & 0xff), 0x20, 8); // 4d36fc: cmp al, 0x20
        if (!R.zf) { pc = 499; continue; } // 4d36fe: jne 0x4d3790
        pc = 492; continue;
      case 492: // 4d3704
        R.edi = (R.add((R.edi >>> 0), 0x16e360, 32)) | 0; // 4d3704: add edi, 0x16e360
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 4d370a: mov dword ptr [esp + 0x38], edi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d370e: fild dword ptr [esp + 0x38]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d3712: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 1.5; // 4d3716: fmul qword ptr [0x968940]
        R.m.wf64(((R.esp + 0x4c) | 0) >>> 0, R.st[0]); R.fpop(); // 4d371c: fstp qword ptr [esp + 0x4c]
        R.fcom(R.st[0], R.f64(((R.esp + 0x4c) | 0))); // 4d3720: fcom qword ptr [esp + 0x4c]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d3724: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d3726: test ah, 1
        if (!R.zf) { pc = 494; continue; } // 4d3729: jne 0x4d3731
        pc = 493; continue;
      case 493: // 4d372b
        R.fpop(); // 4d372b: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x4c) | 0))); // 4d372d: fld qword ptr [esp + 0x4c]
        pc = 494; continue;
      case 494: // 4d3731
        R.ftol(); // 4d3731: call 0x945640
        R.edi = ((R.eax >>> 0)) | 0; // 4d3736: mov edi, eax
        R.eax = (R.m.u32(((R.esp + 0x94) | 0) >>> 0)) | 0; // 4d3738: mov eax, dword ptr [esp + 0x94]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d373f: test eax, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 4d3741: mov dword ptr [esp + 0x14], edi
        if (R.zf) { pc = 514; continue; } // 4d3745: je 0x4d3886
        pc = 495; continue;
      case 495: // 4d374b
        R.edx = (R.m.u32(((R.ebp + 0x57) | 0) >>> 0)) | 0; // 4d374b: mov edx, dword ptr [ebp + 0x57]
        R.ecx = (R.m.u32(((R.eax + 0x57) | 0) >>> 0)) | 0; // 4d374e: mov ecx, dword ptr [eax + 0x57]
        R.sub((R.edx >>> 0), (R.ecx >>> 0), 32); // 4d3751: cmp edx, ecx
        if (!R.zf) { pc = 514; continue; } // 4d3753: jne 0x4d3886
        pc = 496; continue;
      default: return pc;
    }
  }
}
function f_4d1600_59(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 496: // 4d3759
        R.edi = (R.add((R.edi >>> 0), 0x124f8, 32)) | 0; // 4d3759: add edi, 0x124f8
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 4d375f: mov dword ptr [esp + 0x38], edi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d3763: fild dword ptr [esp + 0x38]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d3767: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 1.075; // 4d376b: fmul qword ptr [0x968f90]
        R.m.wf64(((R.esp + 0x6c) | 0) >>> 0, R.st[0]); R.fpop(); // 4d3771: fstp qword ptr [esp + 0x6c]
        R.fcom(R.st[0], R.f64(((R.esp + 0x6c) | 0))); // 4d3775: fcom qword ptr [esp + 0x6c]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d3779: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d377b: test ah, 1
        if (!R.zf) { pc = 498; continue; } // 4d377e: jne 0x4d3786
        pc = 497; continue;
      case 497: // 4d3780
        R.fpop(); // 4d3780: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x6c) | 0))); // 4d3782: fld qword ptr [esp + 0x6c]
        pc = 498; continue;
      case 498: // 4d3786
        R.ftol(); // 4d3786: call 0x945640
        pc = 512; continue; // 4d378b: jmp 0x4d3880
      case 499: // 4d3790
        R.sub(((R.eax >>> 0) & 0xff), 0x30, 8); // 4d3790: cmp al, 0x30
        if (!R.zf) { pc = 514; continue; } // 4d3792: jne 0x4d3886
        pc = 500; continue;
      case 500: // 4d3798
        R.edi = (R.add((R.edi >>> 0), 0xf4240, 32)) | 0; // 4d3798: add edi, 0xf4240
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 4d379e: mov dword ptr [esp + 0x38], edi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d37a2: fild dword ptr [esp + 0x38]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d37a6: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 1.5; // 4d37aa: fmul qword ptr [0x968940]
        R.m.wf64(((R.esp + 0x4c) | 0) >>> 0, R.st[0]); R.fpop(); // 4d37b0: fstp qword ptr [esp + 0x4c]
        R.fcom(R.st[0], R.f64(((R.esp + 0x4c) | 0))); // 4d37b4: fcom qword ptr [esp + 0x4c]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d37b8: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d37ba: test ah, 1
        if (!R.zf) { pc = 502; continue; } // 4d37bd: jne 0x4d37c5
        pc = 501; continue;
      case 501: // 4d37bf
        R.fpop(); // 4d37bf: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x4c) | 0))); // 4d37c1: fld qword ptr [esp + 0x4c]
        pc = 502; continue;
      case 502: // 4d37c5
        R.ftol(); // 4d37c5: call 0x945640
        R.edi = ((R.eax >>> 0)) | 0; // 4d37ca: mov edi, eax
        R.eax = (R.m.u32(((R.esp + 0x94) | 0) >>> 0)) | 0; // 4d37cc: mov eax, dword ptr [esp + 0x94]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d37d3: test eax, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 4d37d5: mov dword ptr [esp + 0x14], edi
        if (R.zf) { pc = 514; continue; } // 4d37d9: je 0x4d3886
        pc = 503; continue;
      case 503: // 4d37df
        R.ecx = (R.m.u32(((R.esp + 0x94) | 0) >>> 0)) | 0; // 4d37df: mov ecx, dword ptr [esp + 0x94]
        R.eax = (R.m.u32(((R.ebp + 0x57) | 0) >>> 0)) | 0; // 4d37e6: mov eax, dword ptr [ebp + 0x57]
        R.sub((R.eax >>> 0), R.m.u32(((R.ecx + 0x57) | 0) >>> 0), 32); // 4d37e9: cmp eax, dword ptr [ecx + 0x57]
        if (!R.zf) { pc = 514; continue; } // 4d37ec: jne 0x4d3886
        pc = 504; continue;
      default: return pc;
    }
  }
}
function f_4d1600_60(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 504: // 4d37f2
        R.edi = (R.add((R.edi >>> 0), 0x4e20, 32)) | 0; // 4d37f2: add edi, 0x4e20
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 4d37f8: mov dword ptr [esp + 0x38], edi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d37fc: fild dword ptr [esp + 0x38]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d3800: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 1.02; // 4d3804: fmul qword ptr [0x968f88]
        R.m.wf64(((R.esp + 0x4c) | 0) >>> 0, R.st[0]); R.fpop(); // 4d380a: fstp qword ptr [esp + 0x4c]
        R.fcom(R.st[0], R.f64(((R.esp + 0x4c) | 0))); // 4d380e: fcom qword ptr [esp + 0x4c]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d3812: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d3814: test ah, 1
        if (!R.zf) { pc = 506; continue; } // 4d3817: jne 0x4d381f
        pc = 505; continue;
      case 505: // 4d3819
        R.fpop(); // 4d3819: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x4c) | 0))); // 4d381b: fld qword ptr [esp + 0x4c]
        pc = 506; continue;
      case 506: // 4d381f
        R.ftol(); // 4d381f: call 0x945640
        pc = 512; continue; // 4d3824: jmp 0x4d3880
      case 507: // 4d3826
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 4d3826: test esi, esi
        if (!R.zf) { pc = 514; continue; } // 4d3828: jne 0x4d3886
        pc = 508; continue;
      case 508: // 4d382a
        R.sub((R.edi >>> 0), R.m.u32(((R.esp + 0x1c) | 0) >>> 0), 32); // 4d382a: cmp edi, dword ptr [esp + 0x1c]
        if (R.cLE) { pc = 514; continue; } // 4d382e: jle 0x4d3886
        pc = 509; continue;
      case 509: // 4d3830
        R.sub(R.m.u16(((R.esp + 0x24) | 0) >>> 0), 0x3c, 16); // 4d3830: cmp word ptr [esp + 0x24], 0x3c
        if (!R.cL) { pc = 511; continue; } // 4d3836: jge 0x4d3855
        pc = 510; continue;
      case 510: // 4d3838
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 4d3838: fild dword ptr [esp + 0x1c]
        R.st[0] = R.st[0] * 0.67; // 4d383c: fmul qword ptr [0x968f80]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d3842: fild dword ptr [esp + 0x14]
        R.st[0] = R.st[0] * 0.33; // 4d3846: fmul qword ptr [0x968f78]
        R.st[1] = R.st[1] + R.st[0]; R.fpop(); // 4d384c: faddp st(1)
        R.ftol(); // 4d384e: call 0x945640
        pc = 512; continue; // 4d3853: jmp 0x4d3880
      case 511: // 4d3855
        R.fpush(R.f64(((R.esp + 0x6c) | 0))); // 4d3855: fld qword ptr [esp + 0x6c]
        R.st[0] = R.st[0] * 0.01; // 4d3859: fmul qword ptr [0x967898]
        R.st[0] = 1.27 - R.st[0]; // 4d385f: fsubr qword ptr [0x968f70]
        R.fpush(1.0); // 4d3865: fld qword ptr [0x967890]
        R.st[0] = R.st[0] - R.st[1]; // 4d386b: fsub st(1)
        R.st[0] = R.st[0] * R.m.s32(((R.esp + 0x14) | 0) >>> 0); // 4d386d: fimul dword ptr [esp + 0x14]
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 4d3871: fild dword ptr [esp + 0x1c]
        R.st[0] = R.st[0] * R.st[2]; // 4d3875: fmul st(2)
        R.st[1] = R.st[1] + R.st[0]; R.fpop(); // 4d3877: faddp st(1)
        R.ftol(); // 4d3879: call 0x945640
        R.fpop(); // 4d387e: fstp st(0)
        pc = 512; continue;
      case 512: // 4d3880
        R.edi = ((R.eax >>> 0)) | 0; // 4d3880: mov edi, eax
        pc = 513; continue;
      case 513: // 4d3882
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 4d3882: mov dword ptr [esp + 0x14], edi
        pc = 514; continue;
      default: return pc;
    }
  }
}
function f_4d1600_61(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 514: // 4d3886
        R.sub(R.m.u8(((R.esp + 0x10) | 0) >>> 0), 0x18, 8); // 4d3886: cmp byte ptr [esp + 0x10], 0x18
        if (!R.cL) { pc = 651; continue; } // 4d388b: jge 0x4d402e
        pc = 515; continue;
      case 515: // 4d3891
        R.eax = (R.m.u32(((R.esp + 0xa4) | 0) >>> 0)) | 0; // 4d3891: mov eax, dword ptr [esp + 0xa4]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d3898: test eax, eax
        if (R.zf) { pc = 651; continue; } // 4d389a: je 0x4d402e
        pc = 516; continue;
      case 516: // 4d38a0
        R.esi = (R.m.u32(((R.esp + 0x20) | 0) >>> 0)) | 0; // 4d38a0: mov esi, dword ptr [esp + 0x20]
        R.sub(((R.esi >>> 0) & 0xffff), 0x6e, 16); // 4d38a4: cmp si, 0x6e
        if (R.cLE) { pc = 651; continue; } // 4d38a8: jle 0x4d402e
        pc = 517; continue;
      case 517: // 4d38ae
        R.edx = (R.m.u32(((R.esp + 0x90) | 0) >>> 0)) | 0; // 4d38ae: mov edx, dword ptr [esp + 0x90]
        R.eax = (R.m.u32(((R.edx + 0x53) | 0) >>> 0)) | 0; // 4d38b5: mov eax, dword ptr [edx + 0x53]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d38b8: test eax, eax
        if (R.zf) { pc = 651; continue; } // 4d38ba: je 0x4d402e
        pc = 518; continue;
      case 518: // 4d38c0
        R.eax = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 4d38c0: mov eax, dword ptr [esp + 0x18]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.eax + 0x4f) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d38c4: mov cl, byte ptr [eax + 0x4f]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.logic(((R.ecx >>> 0) & 0xff) & 0xf0, 8)) & 0xff) << 0)) | 0; // 4d38c7: and cl, 0xf0
        R.sub(((R.ecx >>> 0) & 0xff), 0x70, 8); // 4d38ca: cmp cl, 0x70
        if (R.zf) { pc = 651; continue; } // 4d38cd: je 0x4d402e
        pc = 519; continue;
      case 519: // 4d38d3
        R.ebp = (R.m.u32(((R.esp + 0x98) | 0) >>> 0)) | 0; // 4d38d3: mov ebp, dword ptr [esp + 0x98]
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, 0x0); // 4d38da: mov dword ptr [esp + 0x34], 0
        R.eax = (R.m.u32(((R.ebp + 0x61) | 0) >>> 0)) | 0; // 4d38e2: mov eax, dword ptr [ebp + 0x61]
        R.sub(R.m.u8(((R.eax + 0xf) | 0) >>> 0), 0x14, 8); // 4d38e5: cmp byte ptr [eax + 0xf], 0x14
        if (R.zf) { pc = 572; continue; } // 4d38e9: je 0x4d3ba5
        pc = 520; continue;
      default: return pc;
    }
  }
}
function f_4d1600_62(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 520: // 4d38ef
        R.edx = (((R.m.u8(((R.esp + 0x10) | 0) >>> 0)) << 24 >> 24)) | 0; // 4d38ef: movsx edx, byte ptr [esp + 0x10]
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edx >>> 0)); // 4d38f4: mov dword ptr [esp + 0x38], edx
        R.ebx = ((R.ebx & 0xffffff00) | (((R.m.u8(((R.eax + 0x36) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d38f8: mov bl, byte ptr [eax + 0x36]
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d38fb: fild dword ptr [esp + 0x38]
        R.ecx = (((R.m.u8(((R.eax + 0x3c) | 0) >>> 0)) << 24 >> 24)) | 0; // 4d38ff: movsx ecx, byte ptr [eax + 0x3c]
        R.st[0] = R.st[0] * 0.07; // 4d3903: fmul qword ptr [0x968f68]
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.eax + 0x1b) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d3909: mov dl, byte ptr [eax + 0x1b]
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.ecx >>> 0)); // 4d390c: mov dword ptr [esp + 0x38], ecx
        R.ebx = ((R.ebx & 0xffffff00) | (((R.add(((R.ebx >>> 0) & 0xff), ((R.edx >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 4d3910: add bl, dl
        R.st[0] = 2.6 - R.st[0]; // 4d3912: fsubr qword ptr [0x968f60]
        R.edx = (((R.m.u8(((R.eax + 0x3d) | 0) >>> 0)) << 24 >> 24)) | 0; // 4d3918: movsx edx, byte ptr [eax + 0x3d]
        R.m.wf64(((R.esp + 0x7c) | 0) >>> 0, R.st[0]); R.fpop(); // 4d391c: fstp qword ptr [esp + 0x7c]
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d3920: fild dword ptr [esp + 0x38]
        R.ecx = (((R.m.u8(((R.eax + 0x3f) | 0) >>> 0)) << 24 >> 24)) | 0; // 4d3924: movsx ecx, byte ptr [eax + 0x3f]
        R.st[0] = R.st[0] * 1.2; // 4d3928: fmul qword ptr [0x968978]
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edx >>> 0)); // 4d392e: mov dword ptr [esp + 0x38], edx
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d3932: fild dword ptr [esp + 0x38]
        R.edx = (((R.m.u8(((R.eax + 0x44) | 0) >>> 0)) << 24 >> 24)) | 0; // 4d3936: movsx edx, byte ptr [eax + 0x44]
        R.st[1] = R.st[1] + R.st[0]; R.fpop(); // 4d393a: faddp st(1)
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.ecx >>> 0)); // 4d393c: mov dword ptr [esp + 0x38], ecx
        R.eax = (((R.m.u8(((R.eax + 0x2e) | 0) >>> 0)) << 24 >> 24)) | 0; // 4d3940: movsx eax, byte ptr [eax + 0x2e]
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x7c) | 0)); // 4d3944: fmul qword ptr [esp + 0x7c]
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d3948: fild dword ptr [esp + 0x38]
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edx >>> 0)); // 4d394c: mov dword ptr [esp + 0x38], edx
        R.st[0] = R.st[0] * 0.8; // 4d3950: fmul qword ptr [0x9689b0]
        R.st[1] = R.st[1] + R.st[0]; R.fpop(); // 4d3956: faddp st(1)
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d3958: fild dword ptr [esp + 0x38]
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.eax >>> 0)); // 4d395c: mov dword ptr [esp + 0x38], eax
        R.st[0] = R.st[0] * 1.2; // 4d3960: fmul qword ptr [0x968978]
        R.st[1] = R.st[1] + R.st[0]; R.fpop(); // 4d3966: faddp st(1)
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d3968: fild dword ptr [esp + 0x38]
        R.st[0] = R.st[0] * 0.75; // 4d396c: fmul qword ptr [0x969040]
        R.st[1] = R.st[1] + R.st[0]; R.fpop(); // 4d3972: faddp st(1)
        R.ftol(); // 4d3974: call 0x945640
        R.push(0xb); // 4d3979: push 0xb
        R.push((R.ebp >>> 0)); // 4d397b: push ebp
        R.m.w8(((R.esp + 0x1b) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 4d397c: mov byte ptr [esp + 0x1b], al
        R.call(0x5431e0, { n: 2, thisEcx: false, calleeClean: false }); // 4d3980: call 0x5431e0
        R.ecx = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 4d3985: movsx ecx, al
        R.m.w32(((R.esp + 0x40) | 0) >>> 0, (R.ecx >>> 0)); // 4d3988: mov dword ptr [esp + 0x40], ecx
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 4d398c: add esp, 8
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d398f: fild dword ptr [esp + 0x38]
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x7c) | 0)); // 4d3993: fmul qword ptr [esp + 0x7c]
        R.ftol(); // 4d3997: call 0x945640
        R.sub(((R.eax >>> 0) & 0xff), 0x14, 8); // 4d399c: cmp al, 0x14
        R.m.w8(((R.esp + 0x11) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 4d399e: mov byte ptr [esp + 0x11], al
        if (R.cL) { pc = 522; continue; } // 4d39a2: jl 0x4d39a9
        pc = 521; continue;
      case 521: // 4d39a4
        R.m.w8(((R.esp + 0x11) | 0) >>> 0, 0x14); // 4d39a4: mov byte ptr [esp + 0x11], 0x14
        pc = 522; continue;
      default: return pc;
    }
  }
}
function f_4d1600_63(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 522: // 4d39a9
        R.push(0xc); // 4d39a9: push 0xc
        R.push((R.ebp >>> 0)); // 4d39ab: push ebp
        R.call(0x5431e0, { n: 2, thisEcx: false, calleeClean: false }); // 4d39ac: call 0x5431e0
        R.edx = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 4d39b1: movsx edx, al
        R.m.w32(((R.esp + 0x40) | 0) >>> 0, (R.edx >>> 0)); // 4d39b4: mov dword ptr [esp + 0x40], edx
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 4d39b8: add esp, 8
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d39bb: fild dword ptr [esp + 0x38]
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x7c) | 0)); // 4d39bf: fmul qword ptr [esp + 0x7c]
        R.ftol(); // 4d39c3: call 0x945640
        R.sub(((R.eax >>> 0) & 0xff), 0x14, 8); // 4d39c8: cmp al, 0x14
        if (!R.cL) { pc = 524; continue; } // 4d39ca: jge 0x4d39d2
        pc = 523; continue;
      case 523: // 4d39cc
        R.m.w8(((R.esp + 0x12) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 4d39cc: mov byte ptr [esp + 0x12], al
        pc = 525; continue; // 4d39d0: jmp 0x4d39db
      case 524: // 4d39d2
        R.m.w8(((R.esp + 0x12) | 0) >>> 0, 0x14); // 4d39d2: mov byte ptr [esp + 0x12], 0x14
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esp + 0x12) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d39d7: mov al, byte ptr [esp + 0x12]
        pc = 525; continue;
      case 525: // 4d39db
        R.sub(((R.ebx >>> 0) & 0xff), 0x28, 8); // 4d39db: cmp bl, 0x28
        if (!R.zf) { pc = 540; continue; } // 4d39de: jne 0x4d3a5a
        pc = 526; continue;
      case 526: // 4d39e0
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.esp + 0x13) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d39e0: mov cl, byte ptr [esp + 0x13]
        R.sub(((R.ecx >>> 0) & 0xff), 0x55, 8); // 4d39e4: cmp cl, 0x55
        if (R.cLE) { pc = 528; continue; } // 4d39e7: jle 0x4d39f2
        pc = 527; continue;
      case 527: // 4d39e9
        R.ecx = (R.m.u32(((R.esp + 0x20) | 0) >>> 0)) | 0; // 4d39e9: mov ecx, dword ptr [esp + 0x20]
        R.esi = (((R.ecx + 0xf) | 0)) | 0; // 4d39ed: lea esi, [ecx + 0xf]
        pc = 536; continue; // 4d39f0: jmp 0x4d3a28
      case 528: // 4d39f2
        R.sub(((R.ecx >>> 0) & 0xff), 0x4b, 8); // 4d39f2: cmp cl, 0x4b
        if (R.cLE) { pc = 530; continue; } // 4d39f5: jle 0x4d3a00
        pc = 529; continue;
      case 529: // 4d39f7
        R.edx = (R.m.u32(((R.esp + 0x20) | 0) >>> 0)) | 0; // 4d39f7: mov edx, dword ptr [esp + 0x20]
        R.esi = (((R.edx + 0xa) | 0)) | 0; // 4d39fb: lea esi, [edx + 0xa]
        pc = 536; continue; // 4d39fe: jmp 0x4d3a28
      case 530: // 4d3a00
        R.sub(((R.ecx >>> 0) & 0xff), 0x41, 8); // 4d3a00: cmp cl, 0x41
        if (R.cLE) { pc = 532; continue; } // 4d3a03: jle 0x4d3a0e
        pc = 531; continue;
      case 531: // 4d3a05
        R.ecx = (R.m.u32(((R.esp + 0x20) | 0) >>> 0)) | 0; // 4d3a05: mov ecx, dword ptr [esp + 0x20]
        R.esi = (((R.ecx + 0x8) | 0)) | 0; // 4d3a09: lea esi, [ecx + 8]
        pc = 536; continue; // 4d3a0c: jmp 0x4d3a28
      case 532: // 4d3a0e
        R.sub(((R.ecx >>> 0) & 0xff), 0x32, 8); // 4d3a0e: cmp cl, 0x32
        if (R.cLE) { pc = 534; continue; } // 4d3a11: jle 0x4d3a1c
        pc = 533; continue;
      case 533: // 4d3a13
        R.edx = (R.m.u32(((R.esp + 0x20) | 0) >>> 0)) | 0; // 4d3a13: mov edx, dword ptr [esp + 0x20]
        R.esi = (((R.edx + 0x5) | 0)) | 0; // 4d3a17: lea esi, [edx + 5]
        pc = 536; continue; // 4d3a1a: jmp 0x4d3a28
      default: return pc;
    }
  }
}
function f_4d1600_64(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 534: // 4d3a1c
        R.sub(((R.ecx >>> 0) & 0xff), 0x23, 8); // 4d3a1c: cmp cl, 0x23
        if (R.cLE) { pc = 536; continue; } // 4d3a1f: jle 0x4d3a28
        pc = 535; continue;
      case 535: // 4d3a21
        R.ecx = (R.m.u32(((R.esp + 0x20) | 0) >>> 0)) | 0; // 4d3a21: mov ecx, dword ptr [esp + 0x20]
        R.esi = (((R.ecx + 0x3) | 0)) | 0; // 4d3a25: lea esi, [ecx + 3]
        pc = 536; continue;
      case 536: // 4d3a28
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.esp + 0x11) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d3a28: mov cl, byte ptr [esp + 0x11]
        R.sub(((R.ecx >>> 0) & 0xff), 0xf, 8); // 4d3a2c: cmp cl, 0xf
        if (R.cLE) { pc = 538; continue; } // 4d3a2f: jle 0x4d3a3f
        pc = 537; continue;
      case 537: // 4d3a31
        R.edx = ((R.edx & 0xffff0000) | (((((((R.ecx >>> 0) & 0xff)) << 24 >> 24)) & 0xffff) << 0)) | 0; // 4d3a31: movsx dx, cl
        R.ecx = (((R.edx + -0xd) | 0)) | 0; // 4d3a35: lea ecx, [edx - 0xd]
        R.edx = ((R.ecx >>> 0)) | 0; // 4d3a38: mov edx, ecx
        { const p = BigInt((((R.ecx >>> 0)) | 0)) * BigInt((((R.edx >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.edx = (Number(BigInt.asIntN(32, p))) | 0; } // 4d3a3a: imul edx, ecx
        R.esi = (R.add((R.esi >>> 0), (R.edx >>> 0), 32)) | 0; // 4d3a3d: add esi, edx
        pc = 538; continue;
      case 538: // 4d3a3f
        R.sub(((R.eax >>> 0) & 0xff), 0xf, 8); // 4d3a3f: cmp al, 0xf
        if (R.cLE) { pc = 572; continue; } // 4d3a41: jle 0x4d3ba5
        pc = 539; continue;
      case 539: // 4d3a47
        R.eax = ((R.eax & 0xffff0000) | (((((((R.eax >>> 0) & 0xff)) << 24 >> 24)) & 0xffff) << 0)) | 0; // 4d3a47: movsx ax, al
        R.eax = (R.add((R.eax >>> 0), 0xfffffff2, 32)) | 0; // 4d3a4b: add eax, -0xe
        R.ecx = ((R.eax >>> 0)) | 0; // 4d3a4e: mov ecx, eax
        { const p = BigInt((((R.eax >>> 0)) | 0)) * BigInt((((R.ecx >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.ecx = (Number(BigInt.asIntN(32, p))) | 0; } // 4d3a50: imul ecx, eax
        R.esi = (R.add((R.esi >>> 0), (R.ecx >>> 0), 32)) | 0; // 4d3a53: add esi, ecx
        pc = 572; continue; // 4d3a55: jmp 0x4d3ba5
      case 540: // 4d3a5a
        R.sub(((R.ebx >>> 0) & 0xff), 0x22, 8); // 4d3a5a: cmp bl, 0x22
        if (R.cLE) { pc = 553; continue; } // 4d3a5d: jle 0x4d3ae3
        pc = 541; continue;
      case 541: // 4d3a63
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.esp + 0x13) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d3a63: mov cl, byte ptr [esp + 0x13]
        R.sub(((R.ecx >>> 0) & 0xff), 0x4b, 8); // 4d3a67: cmp cl, 0x4b
        if (R.cLE) { pc = 543; continue; } // 4d3a6a: jle 0x4d3a75
        pc = 542; continue;
      case 542: // 4d3a6c
        R.edx = (R.m.u32(((R.esp + 0x20) | 0) >>> 0)) | 0; // 4d3a6c: mov edx, dword ptr [esp + 0x20]
        R.esi = (((R.edx + 0x8) | 0)) | 0; // 4d3a70: lea esi, [edx + 8]
        pc = 549; continue; // 4d3a73: jmp 0x4d3a9d
      case 543: // 4d3a75
        R.sub(((R.ecx >>> 0) & 0xff), 0x41, 8); // 4d3a75: cmp cl, 0x41
        if (R.cLE) { pc = 545; continue; } // 4d3a78: jle 0x4d3a83
        pc = 544; continue;
      case 544: // 4d3a7a
        R.ecx = (R.m.u32(((R.esp + 0x20) | 0) >>> 0)) | 0; // 4d3a7a: mov ecx, dword ptr [esp + 0x20]
        R.esi = (((R.ecx + 0x5) | 0)) | 0; // 4d3a7e: lea esi, [ecx + 5]
        pc = 549; continue; // 4d3a81: jmp 0x4d3a9d
      case 545: // 4d3a83
        R.sub(((R.ecx >>> 0) & 0xff), 0x32, 8); // 4d3a83: cmp cl, 0x32
        if (R.cLE) { pc = 547; continue; } // 4d3a86: jle 0x4d3a91
        pc = 546; continue;
      case 546: // 4d3a88
        R.edx = (R.m.u32(((R.esp + 0x20) | 0) >>> 0)) | 0; // 4d3a88: mov edx, dword ptr [esp + 0x20]
        R.esi = (((R.edx + 0x3) | 0)) | 0; // 4d3a8c: lea esi, [edx + 3]
        pc = 549; continue; // 4d3a8f: jmp 0x4d3a9d
      default: return pc;
    }
  }
}
function f_4d1600_65(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 547: // 4d3a91
        R.sub(((R.ecx >>> 0) & 0xff), 0x23, 8); // 4d3a91: cmp cl, 0x23
        if (R.cLE) { pc = 549; continue; } // 4d3a94: jle 0x4d3a9d
        pc = 548; continue;
      case 548: // 4d3a96
        R.ecx = (R.m.u32(((R.esp + 0x20) | 0) >>> 0)) | 0; // 4d3a96: mov ecx, dword ptr [esp + 0x20]
        R.esi = (((R.ecx + 0x1) | 0)) | 0; // 4d3a9a: lea esi, [ecx + 1]
        pc = 549; continue;
      case 549: // 4d3a9d
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.esp + 0x11) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d3a9d: mov cl, byte ptr [esp + 0x11]
        R.sub(((R.ecx >>> 0) & 0xff), 0xf, 8); // 4d3aa1: cmp cl, 0xf
        if (R.cLE) { pc = 551; continue; } // 4d3aa4: jle 0x4d3ab4
        pc = 550; continue;
      case 550: // 4d3aa6
        R.edx = ((R.edx & 0xffff0000) | (((((((R.ecx >>> 0) & 0xff)) << 24 >> 24)) & 0xffff) << 0)) | 0; // 4d3aa6: movsx dx, cl
        R.ecx = (((R.edx + -0xf) | 0)) | 0; // 4d3aaa: lea ecx, [edx - 0xf]
        R.edx = ((R.ecx >>> 0)) | 0; // 4d3aad: mov edx, ecx
        { const p = BigInt((((R.ecx >>> 0)) | 0)) * BigInt((((R.edx >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.edx = (Number(BigInt.asIntN(32, p))) | 0; } // 4d3aaf: imul edx, ecx
        R.esi = (R.add((R.esi >>> 0), (R.edx >>> 0), 32)) | 0; // 4d3ab2: add esi, edx
        pc = 551; continue;
      case 551: // 4d3ab4
        R.sub(((R.eax >>> 0) & 0xff), 0xf, 8); // 4d3ab4: cmp al, 0xf
        if (R.cLE) { pc = 572; continue; } // 4d3ab6: jle 0x4d3ba5
        pc = 552; continue;
      case 552: // 4d3abc
        R.eax = (((R.m.u8(((R.esp + 0x12) | 0) >>> 0)) << 24 >> 24)) | 0; // 4d3abc: movsx eax, byte ptr [esp + 0x12]
        R.eax = (R.add((R.eax >>> 0), 0xfffffff1, 32)) | 0; // 4d3ac1: add eax, -0xf
        R.ecx = ((R.eax >>> 0)) | 0; // 4d3ac4: mov ecx, eax
        { const p = BigInt((((R.eax >>> 0)) | 0)) * BigInt((((R.ecx >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.ecx = (Number(BigInt.asIntN(32, p))) | 0; } // 4d3ac6: imul ecx, eax
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.ecx >>> 0)); // 4d3ac9: mov dword ptr [esp + 0x38], ecx
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d3acd: fild dword ptr [esp + 0x38]
        R.st[0] = R.st[0] * 0.8; // 4d3ad1: fmul qword ptr [0x9689b0]
        R.ftol(); // 4d3ad7: call 0x945640
        R.esi = (R.add((R.esi >>> 0), (R.eax >>> 0), 32)) | 0; // 4d3adc: add esi, eax
        pc = 572; continue; // 4d3ade: jmp 0x4d3ba5
      case 553: // 4d3ae3
        R.sub(((R.ebx >>> 0) & 0xff), 0x19, 8); // 4d3ae3: cmp bl, 0x19
        if (R.cLE) { pc = 566; continue; } // 4d3ae6: jle 0x4d3b7b
        pc = 554; continue;
      case 554: // 4d3aec
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.esp + 0x13) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d3aec: mov cl, byte ptr [esp + 0x13]
        R.sub(((R.ecx >>> 0) & 0xff), 0x4b, 8); // 4d3af0: cmp cl, 0x4b
        if (R.cLE) { pc = 556; continue; } // 4d3af3: jle 0x4d3afe
        pc = 555; continue;
      case 555: // 4d3af5
        R.edx = (R.m.u32(((R.esp + 0x20) | 0) >>> 0)) | 0; // 4d3af5: mov edx, dword ptr [esp + 0x20]
        R.esi = (((R.edx + 0x5) | 0)) | 0; // 4d3af9: lea esi, [edx + 5]
        pc = 562; continue; // 4d3afc: jmp 0x4d3b26
      case 556: // 4d3afe
        R.sub(((R.ecx >>> 0) & 0xff), 0x41, 8); // 4d3afe: cmp cl, 0x41
        if (R.cLE) { pc = 558; continue; } // 4d3b01: jle 0x4d3b0c
        pc = 557; continue;
      case 557: // 4d3b03
        R.ecx = (R.m.u32(((R.esp + 0x20) | 0) >>> 0)) | 0; // 4d3b03: mov ecx, dword ptr [esp + 0x20]
        R.esi = (((R.ecx + 0x3) | 0)) | 0; // 4d3b07: lea esi, [ecx + 3]
        pc = 562; continue; // 4d3b0a: jmp 0x4d3b26
      case 558: // 4d3b0c
        R.sub(((R.ecx >>> 0) & 0xff), 0x32, 8); // 4d3b0c: cmp cl, 0x32
        if (R.cLE) { pc = 560; continue; } // 4d3b0f: jle 0x4d3b1a
        pc = 559; continue;
      default: return pc;
    }
  }
}
function f_4d1600_66(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 559: // 4d3b11
        R.edx = (R.m.u32(((R.esp + 0x20) | 0) >>> 0)) | 0; // 4d3b11: mov edx, dword ptr [esp + 0x20]
        R.esi = (((R.edx + 0x1) | 0)) | 0; // 4d3b15: lea esi, [edx + 1]
        pc = 562; continue; // 4d3b18: jmp 0x4d3b26
      case 560: // 4d3b1a
        R.sub(((R.ecx >>> 0) & 0xff), 0x23, 8); // 4d3b1a: cmp cl, 0x23
        if (!R.cL) { pc = 562; continue; } // 4d3b1d: jge 0x4d3b26
        pc = 561; continue;
      case 561: // 4d3b1f
        R.ecx = (R.m.u32(((R.esp + 0x20) | 0) >>> 0)) | 0; // 4d3b1f: mov ecx, dword ptr [esp + 0x20]
        R.esi = (((R.ecx + -0x3) | 0)) | 0; // 4d3b23: lea esi, [ecx - 3]
        pc = 562; continue;
      case 562: // 4d3b26
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.esp + 0x11) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d3b26: mov cl, byte ptr [esp + 0x11]
        R.sub(((R.ecx >>> 0) & 0xff), 0xf, 8); // 4d3b2a: cmp cl, 0xf
        if (R.cLE) { pc = 564; continue; } // 4d3b2d: jle 0x4d3b53
        pc = 563; continue;
      case 563: // 4d3b2f
        R.eax = (((((R.ecx >>> 0) & 0xff)) << 24 >> 24)) | 0; // 4d3b2f: movsx eax, cl
        R.eax = (R.add((R.eax >>> 0), 0xfffffff1, 32)) | 0; // 4d3b32: add eax, -0xf
        R.edx = ((R.eax >>> 0)) | 0; // 4d3b35: mov edx, eax
        { const p = BigInt((((R.eax >>> 0)) | 0)) * BigInt((((R.edx >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.edx = (Number(BigInt.asIntN(32, p))) | 0; } // 4d3b37: imul edx, eax
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edx >>> 0)); // 4d3b3a: mov dword ptr [esp + 0x38], edx
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d3b3e: fild dword ptr [esp + 0x38]
        R.st[0] = R.st[0] * 0.8; // 4d3b42: fmul qword ptr [0x9689b0]
        R.ftol(); // 4d3b48: call 0x945640
        R.esi = (R.add((R.esi >>> 0), (R.eax >>> 0), 32)) | 0; // 4d3b4d: add esi, eax
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esp + 0x12) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d3b4f: mov al, byte ptr [esp + 0x12]
        pc = 564; continue;
      case 564: // 4d3b53
        R.sub(((R.eax >>> 0) & 0xff), 0xf, 8); // 4d3b53: cmp al, 0xf
        if (R.cLE) { pc = 572; continue; } // 4d3b55: jle 0x4d3ba5
        pc = 565; continue;
      case 565: // 4d3b57
        R.eax = (((R.m.u8(((R.esp + 0x12) | 0) >>> 0)) << 24 >> 24)) | 0; // 4d3b57: movsx eax, byte ptr [esp + 0x12]
        R.eax = (R.add((R.eax >>> 0), 0xfffffff1, 32)) | 0; // 4d3b5c: add eax, -0xf
        R.ecx = ((R.eax >>> 0)) | 0; // 4d3b5f: mov ecx, eax
        { const p = BigInt((((R.eax >>> 0)) | 0)) * BigInt((((R.ecx >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.ecx = (Number(BigInt.asIntN(32, p))) | 0; } // 4d3b61: imul ecx, eax
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.ecx >>> 0)); // 4d3b64: mov dword ptr [esp + 0x38], ecx
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d3b68: fild dword ptr [esp + 0x38]
        R.st[0] = R.st[0] * 0.5; // 4d3b6c: fmul qword ptr [0x968968]
        R.ftol(); // 4d3b72: call 0x945640
        R.esi = (R.add((R.esi >>> 0), (R.eax >>> 0), 32)) | 0; // 4d3b77: add esi, eax
        pc = 572; continue; // 4d3b79: jmp 0x4d3ba5
      case 566: // 4d3b7b
        R.sub(((R.ebx >>> 0) & 0xff), 0xf, 8); // 4d3b7b: cmp bl, 0xf
        if (!R.cL) { pc = 572; continue; } // 4d3b7e: jge 0x4d3ba5
        pc = 567; continue;
      case 567: // 4d3b80
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esp + 0x13) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d3b80: mov al, byte ptr [esp + 0x13]
        R.sub(((R.eax >>> 0) & 0xff), 0x32, 8); // 4d3b84: cmp al, 0x32
        if (R.cLE) { pc = 569; continue; } // 4d3b86: jle 0x4d3b91
        pc = 568; continue;
      case 568: // 4d3b88
        R.edx = (R.m.u32(((R.esp + 0x20) | 0) >>> 0)) | 0; // 4d3b88: mov edx, dword ptr [esp + 0x20]
        R.esi = (((R.edx + -0x5) | 0)) | 0; // 4d3b8c: lea esi, [edx - 5]
        pc = 572; continue; // 4d3b8f: jmp 0x4d3ba5
      default: return pc;
    }
  }
}
function f_4d1600_67(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 569: // 4d3b91
        R.sub(((R.eax >>> 0) & 0xff), 0x23, 8); // 4d3b91: cmp al, 0x23
        if (R.cLE) { pc = 571; continue; } // 4d3b93: jle 0x4d3b9e
        pc = 570; continue;
      case 570: // 4d3b95
        R.eax = (R.m.u32(((R.esp + 0x20) | 0) >>> 0)) | 0; // 4d3b95: mov eax, dword ptr [esp + 0x20]
        R.esi = (((R.eax + -0x8) | 0)) | 0; // 4d3b99: lea esi, [eax - 8]
        pc = 572; continue; // 4d3b9c: jmp 0x4d3ba5
      case 571: // 4d3b9e
        R.ecx = (R.m.u32(((R.esp + 0x20) | 0) >>> 0)) | 0; // 4d3b9e: mov ecx, dword ptr [esp + 0x20]
        R.esi = (((R.ecx + -0xa) | 0)) | 0; // 4d3ba2: lea esi, [ecx - 0xa]
        pc = 572; continue;
      case 572: // 4d3ba5
        R.eax = (R.m.u32(((R.esp + 0x2c) | 0) >>> 0)) | 0; // 4d3ba5: mov eax, dword ptr [esp + 0x2c]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d3ba9: test eax, eax
        if (R.zf) { pc = 575; continue; } // 4d3bab: je 0x4d3bda
        pc = 573; continue;
      case 573: // 4d3bad
        R.edx = (R.m.u32(((R.eax + 0xf) | 0) >>> 0)) | 0; // 4d3bad: mov edx, dword ptr [eax + 0xf]
        R.eax = (R.m.u32(((R.ebp) | 0) >>> 0)) | 0; // 4d3bb0: mov eax, dword ptr [ebp]
        R.sub((R.edx >>> 0), (R.eax >>> 0), 32); // 4d3bb3: cmp edx, eax
        if (!R.zf) { pc = 575; continue; } // 4d3bb5: jne 0x4d3bda
        pc = 574; continue;
      case 574: // 4d3bb7
        R.ebx = (R.m.u32(((R.esp + 0x90) | 0) >>> 0)) | 0; // 4d3bb7: mov ebx, dword ptr [esp + 0x90]
        R.eax = (0x10624dd3) | 0; // 4d3bbe: mov eax, 0x10624dd3
        R.ecx = (((R.m.u16(((R.ebx + 0x80) | 0) >>> 0)) << 16 >> 16)) | 0; // 4d3bc3: movsx ecx, word ptr [ebx + 0x80]
        { const p = BigInt(R.eax | 0) * BigInt((((R.ecx >>> 0)) | 0)); R.eax = Number(BigInt.asIntN(32, p)); R.edx = Number(BigInt.asIntN(32, p >> 32n)); R.cf = R.of = BigInt.asIntN(32, p) !== p; } // 4d3bca: imul ecx
        R.edx = (R.sar((R.edx >>> 0), 0x6, 32)) | 0; // 4d3bcc: sar edx, 6
        R.eax = ((R.edx >>> 0)) | 0; // 4d3bcf: mov eax, edx
        R.eax = (R.shr((R.eax >>> 0), 0x1f, 32)) | 0; // 4d3bd1: shr eax, 0x1f
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 4d3bd4: add edx, eax
        R.esi = (R.add((R.esi >>> 0), (R.edx >>> 0), 32)) | 0; // 4d3bd6: add esi, edx
        pc = 576; continue; // 4d3bd8: jmp 0x4d3be1
      case 575: // 4d3bda
        R.ebx = (R.m.u32(((R.esp + 0x90) | 0) >>> 0)) | 0; // 4d3bda: mov ebx, dword ptr [esp + 0x90]
        pc = 576; continue;
      case 576: // 4d3be1
        R.ecx = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 4d3be1: mov ecx, dword ptr [esp + 0x18]
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ecx + 0x4f) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d3be5: mov al, byte ptr [ecx + 0x4f]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0xf0, 8)) & 0xff) << 0)) | 0; // 4d3be8: and al, 0xf0
        R.sub(((R.eax >>> 0) & 0xff), 0x10, 8); // 4d3bea: cmp al, 0x10
        if (!R.zf) { pc = 580; continue; } // 4d3bec: jne 0x4d3c25
        pc = 577; continue;
      case 577: // 4d3bee
        R.sub(R.m.u8(((R.ebp + 0x18) | 0) >>> 0), 0x13, 8); // 4d3bee: cmp byte ptr [ebp + 0x18], 0x13
        if (!R.cL) { pc = 603; continue; } // 4d3bf2: jge 0x4d3d6b
        pc = 578; continue;
      default: return pc;
    }
  }
}
function f_4d1600_68(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 578: // 4d3bf8
        R.ecx = (((R.m.u16(((R.ebx + 0x80) | 0) >>> 0)) << 16 >> 16)) | 0; // 4d3bf8: movsx ecx, word ptr [ebx + 0x80]
        R.eax = (0x10624dd3) | 0; // 4d3bff: mov eax, 0x10624dd3
        { const p = BigInt(R.eax | 0) * BigInt((((R.ecx >>> 0)) | 0)); R.eax = Number(BigInt.asIntN(32, p)); R.edx = Number(BigInt.asIntN(32, p >> 32n)); R.cf = R.of = BigInt.asIntN(32, p) !== p; } // 4d3c04: imul ecx
        R.edx = (R.sar((R.edx >>> 0), 0x5, 32)) | 0; // 4d3c06: sar edx, 5
        R.eax = ((R.edx >>> 0)) | 0; // 4d3c09: mov eax, edx
        R.eax = (R.shr((R.eax >>> 0), 0x1f, 32)) | 0; // 4d3c0b: shr eax, 0x1f
        R.ecx = (((((R.esi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 4d3c0e: movsx ecx, si
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 4d3c11: add edx, eax
        R.edx = (R.add((R.edx >>> 0), (R.ecx >>> 0), 32)) | 0; // 4d3c13: add edx, ecx
        R.sub((R.edx >>> 0), 0x79, 32); // 4d3c15: cmp edx, 0x79
        if (!R.cL) { pc = 603; continue; } // 4d3c18: jge 0x4d3d6b
        pc = 579; continue;
      case 579: // 4d3c1e
        R.esi = (0x79) | 0; // 4d3c1e: mov esi, 0x79
        pc = 586; continue; // 4d3c23: jmp 0x4d3c5b
      case 580: // 4d3c25
        R.sub(((R.eax >>> 0) & 0xff), 0x20, 8); // 4d3c25: cmp al, 0x20
        if (R.zf) { pc = 602; continue; } // 4d3c27: je 0x4d3d61
        pc = 581; continue;
      case 581: // 4d3c2d
        R.sub(((R.eax >>> 0) & 0xff), 0x30, 8); // 4d3c2d: cmp al, 0x30
        if (R.zf) { pc = 602; continue; } // 4d3c2f: je 0x4d3d61
        pc = 582; continue;
      case 582: // 4d3c35
        R.sub(R.m.u8(((R.ebp + 0x18) | 0) >>> 0), 0x13, 8); // 4d3c35: cmp byte ptr [ebp + 0x18], 0x13
        if (!R.cL) { pc = 586; continue; } // 4d3c39: jge 0x4d3c5b
        pc = 583; continue;
      case 583: // 4d3c3b
        R.sub(((R.eax >>> 0) & 0xff), 0x40, 8); // 4d3c3b: cmp al, 0x40
        if (!R.zf) { pc = 586; continue; } // 4d3c3d: jne 0x4d3c5b
        pc = 584; continue;
      case 584: // 4d3c3f
        R.ecx = (((R.m.u16(((R.ebx + 0x80) | 0) >>> 0)) << 16 >> 16)) | 0; // 4d3c3f: movsx ecx, word ptr [ebx + 0x80]
        R.eax = (0xc3a13de7) | 0; // 4d3c46: mov eax, 0xc3a13de7
        { const p = BigInt(R.eax | 0) * BigInt((((R.ecx >>> 0)) | 0)); R.eax = Number(BigInt.asIntN(32, p)); R.edx = Number(BigInt.asIntN(32, p >> 32n)); R.cf = R.of = BigInt.asIntN(32, p) !== p; } // 4d3c4b: imul ecx
        R.edx = (R.add((R.edx >>> 0), (R.ecx >>> 0), 32)) | 0; // 4d3c4d: add edx, ecx
        R.edx = (R.sar((R.edx >>> 0), 0x9, 32)) | 0; // 4d3c4f: sar edx, 9
        R.ecx = ((R.edx >>> 0)) | 0; // 4d3c52: mov ecx, edx
        R.ecx = (R.shr((R.ecx >>> 0), 0x1f, 32)) | 0; // 4d3c54: shr ecx, 0x1f
        R.edx = (R.add((R.edx >>> 0), (R.ecx >>> 0), 32)) | 0; // 4d3c57: add edx, ecx
        pc = 585; continue;
      case 585: // 4d3c59
        R.esi = (R.add((R.esi >>> 0), (R.edx >>> 0), 32)) | 0; // 4d3c59: add esi, edx
        pc = 586; continue;
      case 586: // 4d3c5b
        R.sub(R.m.u8(((R.ebp + 0x18) | 0) >>> 0), 0x14, 8); // 4d3c5b: cmp byte ptr [ebp + 0x18], 0x14
        if (R.cLE) { pc = 589; continue; } // 4d3c5f: jle 0x4d3c85
        pc = 587; continue;
      case 587: // 4d3c61
        R.edx = (R.m.u32(((R.ebp + 0x61) | 0) >>> 0)) | 0; // 4d3c61: mov edx, dword ptr [ebp + 0x61]
        R.sub(R.m.u16(((R.edx + 0x5) | 0) >>> 0), 0x2d, 16); // 4d3c64: cmp word ptr [edx + 5], 0x2d
        if (!R.cL) { pc = 589; continue; } // 4d3c69: jge 0x4d3c85
        pc = 588; continue;
      default: return pc;
    }
  }
}
function f_4d1600_69(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 588: // 4d3c6b
        R.ecx = (((R.m.u16(((R.ebx + 0x80) | 0) >>> 0)) << 16 >> 16)) | 0; // 4d3c6b: movsx ecx, word ptr [ebx + 0x80]
        R.eax = (0xef9db22d) | 0; // 4d3c72: mov eax, 0xef9db22d
        { const p = BigInt(R.eax | 0) * BigInt((((R.ecx >>> 0)) | 0)); R.eax = Number(BigInt.asIntN(32, p)); R.edx = Number(BigInt.asIntN(32, p >> 32n)); R.cf = R.of = BigInt.asIntN(32, p) !== p; } // 4d3c77: imul ecx
        R.edx = (R.sar((R.edx >>> 0), 0x6, 32)) | 0; // 4d3c79: sar edx, 6
        R.eax = ((R.edx >>> 0)) | 0; // 4d3c7c: mov eax, edx
        R.eax = (R.shr((R.eax >>> 0), 0x1f, 32)) | 0; // 4d3c7e: shr eax, 0x1f
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 4d3c81: add edx, eax
        R.esi = (R.add((R.esi >>> 0), (R.edx >>> 0), 32)) | 0; // 4d3c83: add esi, edx
        pc = 589; continue;
      case 589: // 4d3c85
        R.sub(R.m.u16(((R.esp + 0x20) | 0) >>> 0), 0x78, 16); // 4d3c85: cmp word ptr [esp + 0x20], 0x78
        if (R.cLE) { pc = 592; continue; } // 4d3c8b: jle 0x4d3c9c
        pc = 590; continue;
      case 590: // 4d3c8d
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ebx + 0x7f) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d3c8d: mov al, byte ptr [ebx + 0x7f]
        R.sub(((R.eax >>> 0) & 0xff), 0xa, 8); // 4d3c90: cmp al, 0xa
        if (R.cLE) { pc = 592; continue; } // 4d3c92: jle 0x4d3c9c
        pc = 591; continue;
      case 591: // 4d3c94
        R.ecx = ((R.ecx & 0xffff0000) | (((((((R.eax >>> 0) & 0xff)) << 24 >> 24)) & 0xffff) << 0)) | 0; // 4d3c94: movsx cx, al
        R.esi = (((R.esi + R.ecx + -0xa) | 0)) | 0; // 4d3c98: lea esi, [esi + ecx - 0xa]
        pc = 592; continue;
      case 592: // 4d3c9c
        R.eax = (R.m.u32(((R.ebx + 0xcf) | 0) >>> 0)) | 0; // 4d3c9c: mov eax, dword ptr [ebx + 0xcf]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d3ca2: test eax, eax
        if (R.zf) { pc = 599; continue; } // 4d3ca4: je 0x4d3d17
        pc = 593; continue;
      case 593: // 4d3ca6
        R.ecx = (R.m.u32(((R.eax + 0x69) | 0) >>> 0)) | 0; // 4d3ca6: mov ecx, dword ptr [eax + 0x69]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 4d3ca9: test ecx, ecx
        if (R.zf) { pc = 599; continue; } // 4d3cab: je 0x4d3d17
        pc = 594; continue;
      case 594: // 4d3cad
        R.push(0x0); // 4d3cad: push 0
        R.push(0x0); // 4d3caf: push 0
        R.push(0x1); // 4d3cb1: push 1
        R.push(0x1); // 4d3cb3: push 1
        R.push((R.ebx >>> 0)); // 4d3cb5: push ebx
        R.call(0x600a50, { n: 5, thisEcx: false, calleeClean: false }); // 4d3cb6: call 0x600a50
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 4d3cbb: add esp, 0x14
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d3cbe: test eax, eax
        if (!R.zf) { pc = 596; continue; } // 4d3cc0: jne 0x4d3cd4
        pc = 595; continue;
      case 595: // 4d3cc2
        R.edx = (R.m.u32(((R.ebx + 0xcf) | 0) >>> 0)) | 0; // 4d3cc2: mov edx, dword ptr [ebx + 0xcf]
        R.eax = (R.m.u32(((R.edx + 0x69) | 0) >>> 0)) | 0; // 4d3cc8: mov eax, dword ptr [edx + 0x69]
        R.ecx = ((R.ecx & 0xffff0000) | (((((R.m.u8(((R.eax + 0x22) | 0) >>> 0)) << 24 >> 24)) & 0xffff) << 0)) | 0; // 4d3ccb: movsx cx, byte ptr [eax + 0x22]
        R.esi = (((R.esi + R.ecx + -0xa) | 0)) | 0; // 4d3cd0: lea esi, [esi + ecx - 0xa]
        pc = 596; continue;
      default: return pc;
    }
  }
}
function f_4d1600_70(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 596: // 4d3cd4
        R.edx = (R.m.u32(((R.ebx + 0xcf) | 0) >>> 0)) | 0; // 4d3cd4: mov edx, dword ptr [ebx + 0xcf]
        R.eax = (R.m.u32(((R.edx + 0x42) | 0) >>> 0)) | 0; // 4d3cda: mov eax, dword ptr [edx + 0x42]
        R.push((R.eax >>> 0)); // 4d3cdd: push eax
        R.ecx = (R.m.u32(((R.edx + 0x3e) | 0) >>> 0)) | 0; // 4d3cde: mov ecx, dword ptr [edx + 0x3e]
        R.push((R.ecx >>> 0)); // 4d3ce1: push ecx
        R.ecx = (((R.ebp + 0x3e) | 0)) | 0; // 4d3ce2: lea ecx, [ebp + 0x3e]
        R.call(0x456740, { n: 2, thisEcx: true, calleeClean: true }); // 4d3ce5: call 0x456740
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d3cea: test eax, eax
        if (R.zf) { pc = 599; continue; } // 4d3cec: je 0x4d3d17
        pc = 597; continue;
      case 597: // 4d3cee
        R.edx = (R.m.u32(((R.ebp + 0x61) | 0) >>> 0)) | 0; // 4d3cee: mov edx, dword ptr [ebp + 0x61]
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.edx + 0x7) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 4d3cf1: mov ax, word ptr [edx + 7]
        R.sub(((R.esi >>> 0) & 0xffff), ((R.eax >>> 0) & 0xffff), 16); // 4d3cf5: cmp si, ax
        if (!R.cL) { pc = 599; continue; } // 4d3cf8: jge 0x4d3d17
        pc = 598; continue;
      case 598: // 4d3cfa
        R.ecx = (((((R.esi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 4d3cfa: movsx ecx, si
        R.edx = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 4d3cfd: movsx edx, ax
        R.edx = (R.sub((R.edx >>> 0), (R.ecx >>> 0), 32)) | 0; // 4d3d00: sub edx, ecx
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edx >>> 0)); // 4d3d02: mov dword ptr [esp + 0x38], edx
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d3d06: fild dword ptr [esp + 0x38]
        R.st[0] = R.st[0] * 0.5; // 4d3d0a: fmul qword ptr [0x968968]
        R.ftol(); // 4d3d10: call 0x945640
        R.esi = (R.add((R.esi >>> 0), (R.eax >>> 0), 32)) | 0; // 4d3d15: add esi, eax
        pc = 599; continue;
      case 599: // 4d3d17
        R.sub(((R.esi >>> 0) & 0xffff), 0x78, 16); // 4d3d17: cmp si, 0x78
        if (R.cLE) { pc = 651; continue; } // 4d3d1b: jle 0x4d402e
        pc = 600; continue;
      case 600: // 4d3d21
        R.ebp = (R.m.u32(((R.esp + 0x90) | 0) >>> 0)) | 0; // 4d3d21: mov ebp, dword ptr [esp + 0x90]
        R.ebx = ((R.ebx & 0xffff0000) | (((R.m.u16(((R.ebp + 0x80) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 4d3d28: mov bx, word ptr [ebp + 0x80]
        R.eax = (((((R.ebx >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 4d3d2f: movsx eax, bx
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.eax >>> 0)); // 4d3d32: mov dword ptr [esp + 0x38], eax
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d3d36: fild dword ptr [esp + 0x38]
        R.fpush(R.st[0]); // 4d3d3a: fld st(0)
        R.st[0] = R.st[0] * 0.0167; // 4d3d3c: fmul qword ptr [0x968f58]
        R.st[0] = R.st[0] + 100.0; // 4d3d42: fadd qword ptr [0x9688a8]
        R.fpush(150.0); // 4d3d48: fld qword ptr [0x968f50]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 4d3d4e: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d3d50: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 4d3d52: test ah, 0x41
        if (!R.zf) { pc = 604; continue; } // 4d3d55: jne 0x4d3d88
        pc = 601; continue;
      case 601: // 4d3d57
        R.fpop(); // 4d3d57: fstp st(0)
        R.fpush(150.0); // 4d3d59: fld qword ptr [0x968f50]
        pc = 606; continue; // 4d3d5f: jmp 0x4d3d9f
      case 602: // 4d3d61
        R.sub(R.m.u8(((R.ebp + 0x18) | 0) >>> 0), 0x13, 8); // 4d3d61: cmp byte ptr [ebp + 0x18], 0x13
        if (!R.cL) { pc = 584; continue; } // 4d3d65: jge 0x4d3c3f
        pc = 603; continue;
      default: return pc;
    }
  }
}
function f_4d1600_71(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 603: // 4d3d6b
        R.ecx = (((R.m.u16(((R.ebx + 0x80) | 0) >>> 0)) << 16 >> 16)) | 0; // 4d3d6b: movsx ecx, word ptr [ebx + 0x80]
        R.eax = (0x10624dd3) | 0; // 4d3d72: mov eax, 0x10624dd3
        { const p = BigInt(R.eax | 0) * BigInt((((R.ecx >>> 0)) | 0)); R.eax = Number(BigInt.asIntN(32, p)); R.edx = Number(BigInt.asIntN(32, p >> 32n)); R.cf = R.of = BigInt.asIntN(32, p) !== p; } // 4d3d77: imul ecx
        R.edx = (R.sar((R.edx >>> 0), 0x5, 32)) | 0; // 4d3d79: sar edx, 5
        R.eax = ((R.edx >>> 0)) | 0; // 4d3d7c: mov eax, edx
        R.eax = (R.shr((R.eax >>> 0), 0x1f, 32)) | 0; // 4d3d7e: shr eax, 0x1f
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 4d3d81: add edx, eax
        pc = 585; continue; // 4d3d83: jmp 0x4d3c59
      case 604: // 4d3d88
        R.fpush(220.0); // 4d3d88: fld qword ptr [0x968f48]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 4d3d8e: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d3d90: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 4d3d92: test ah, 1
        if (R.zf) { pc = 606; continue; } // 4d3d95: je 0x4d3d9f
        pc = 605; continue;
      case 605: // 4d3d97
        R.fpop(); // 4d3d97: fstp st(0)
        R.fpush(220.0); // 4d3d99: fld qword ptr [0x968f48]
        pc = 606; continue;
      case 606: // 4d3d9f
        R.ftol(); // 4d3d9f: call 0x945640
        R.sub(((R.esi >>> 0) & 0xffff), ((R.eax >>> 0) & 0xffff), 16); // 4d3da4: cmp si, ax
        if (R.cL) { pc = 608; continue; } // 4d3da7: jl 0x4d3dab
        pc = 607; continue;
      case 607: // 4d3da9
        R.esi = ((R.eax >>> 0)) | 0; // 4d3da9: mov esi, eax
        pc = 608; continue;
      case 608: // 4d3dab
        R.sub(((R.esi >>> 0) & 0xffff), 0x96, 16); // 4d3dab: cmp si, 0x96
        if (R.cLE) { pc = 615; continue; } // 4d3db0: jle 0x4d3e11
        pc = 609; continue;
      case 609: // 4d3db2
        R.eax = (R.m.u32(((R.esp + 0x2c) | 0) >>> 0)) | 0; // 4d3db2: mov eax, dword ptr [esp + 0x2c]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d3db6: test eax, eax
        if (R.zf) { pc = 615; continue; } // 4d3db8: je 0x4d3e11
        pc = 610; continue;
      case 610: // 4d3dba
        R.sub(((R.ebx >>> 0) & 0xffff), 0x9c4, 16); // 4d3dba: cmp bx, 0x9c4
        if (R.cL) { pc = 615; continue; } // 4d3dbf: jl 0x4d3e11
        pc = 611; continue;
      case 611: // 4d3dc1
        R.ecx = (R.m.u32(((R.ebp + 0x53) | 0) >>> 0)) | 0; // 4d3dc1: mov ecx, dword ptr [ebp + 0x53]
        R.sub(R.m.u8(((R.ecx + 0x85) | 0) >>> 0), 0xa, 8); // 4d3dc4: cmp byte ptr [ecx + 0x85], 0xa
        if (R.cLE) { pc = 615; continue; } // 4d3dcb: jle 0x4d3e11
        pc = 612; continue;
      case 612: // 4d3dcd
        R.edx = (((((R.esi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 4d3dcd: movsx edx, si
        R.eax = (((R.edx * 4 + -0x258) | 0)) | 0; // 4d3dd0: lea eax, [edx*4 - 0x258]
        R.sub((R.eax >>> 0), 0xc8, 32); // 4d3dd7: cmp eax, 0xc8
        if (R.cL) { pc = 614; continue; } // 4d3ddc: jl 0x4d3de3
        pc = 613; continue;
      case 613: // 4d3dde
        R.eax = (0xc8) | 0; // 4d3dde: mov eax, 0xc8
        pc = 614; continue;
      default: return pc;
    }
  }
}
function f_4d1600_72(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 614: // 4d3de3
        R.eax = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 4d3de3: movsx eax, ax
        { const p = BigInt((((R.eax >>> 0)) | 0)) * BigInt((((R.eax >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.eax = (Number(BigInt.asIntN(32, p))) | 0; } // 4d3de6: imul eax, eax
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 4d3de9: lea eax, [eax + eax*4]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 4d3dec: lea eax, [eax + eax*4]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 4d3def: lea eax, [eax + eax*4]
        R.eax = (R.shl((R.eax >>> 0), 0x1, 32)) | 0; // 4d3df2: shl eax, 1
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.eax >>> 0)); // 4d3df4: mov dword ptr [esp + 0x38], eax
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d3df8: fild dword ptr [esp + 0x38]
        { const t = R.st[0]; R.st[0] = R.st[1]; R.st[1] = t; } // 4d3dfc: fxch st(1)
        R.st[0] = R.st[0] * 0.00016666666666666666; // 4d3dfe: fmul qword ptr [0x968f40]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 4d3e04: fmulp st(1)
        R.ftol(); // 4d3e06: call 0x945640
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, (R.eax >>> 0)); // 4d3e0b: mov dword ptr [esp + 0x34], eax
        pc = 616; continue; // 4d3e0f: jmp 0x4d3e13
      case 615: // 4d3e11
        R.fpop(); // 4d3e11: fstp st(0)
        pc = 616; continue;
      case 616: // 4d3e13
        R.eax = (((((R.esi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 4d3e13: movsx eax, si
        { const p = BigInt((((R.eax >>> 0)) | 0)) * BigInt((((R.eax >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.eax = (Number(BigInt.asIntN(32, p))) | 0; } // 4d3e16: imul eax, eax
        R.eax = (R.sub((R.eax >>> 0), 0x3840, 32)) | 0; // 4d3e19: sub eax, 0x3840
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 4d3e1e: lea eax, [eax + eax*4]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 4d3e21: lea eax, [eax + eax*4]
        R.ecx = (((R.eax + R.eax * 4) | 0)) | 0; // 4d3e24: lea ecx, [eax + eax*4]
        R.ecx = (R.shl((R.ecx >>> 0), 0x1, 32)) | 0; // 4d3e27: shl ecx, 1
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.ecx >>> 0)); // 4d3e29: mov dword ptr [esp + 0x38], ecx
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d3e2d: fild dword ptr [esp + 0x38]
        R.st[0] = R.st[0] * 0.6153846153846154; // 4d3e31: fmul qword ptr [0x968f38]
        R.st[0] = R.st[0] + R.m.s32(((R.esp + 0x34) | 0) >>> 0); // 4d3e37: fiadd dword ptr [esp + 0x34]
        R.ftol(); // 4d3e3b: call 0x945640
        R.edx = (R.m.u32(((R.esp + 0x90) | 0) >>> 0)) | 0; // 4d3e40: mov edx, dword ptr [esp + 0x90]
        R.ebp = ((R.eax >>> 0)) | 0; // 4d3e47: mov ebp, eax
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, (R.ebp >>> 0)); // 4d3e49: mov dword ptr [esp + 0x20], ebp
        R.ecx = ((R.edx >>> 0)) | 0; // 4d3e4d: mov ecx, edx
        R.eax = (R.m.u32(((R.edx + 0x53) | 0) >>> 0)) | 0; // 4d3e4f: mov eax, dword ptr [edx + 0x53]
        R.ebx = ((R.ebx & 0xffffff00) | (((R.m.u8(((R.eax + 0x85) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d3e52: mov bl, byte ptr [eax + 0x85]
        R.sub(((R.ebx >>> 0) & 0xff), 0xd, 8); // 4d3e58: cmp bl, 0xd
        if (R.cL) { pc = 618; continue; } // 4d3e5b: jl 0x4d3e67
        pc = 617; continue;
      case 617: // 4d3e5d
        R.sub(R.m.u8(((R.ecx + 0x64) | 0) >>> 0), 0x3, 8); // 4d3e5d: cmp byte ptr [ecx + 0x64], 3
        if (!R.zf) { pc = 626; continue; } // 4d3e61: jne 0x4d3ee8
        pc = 618; continue;
      case 618: // 4d3e67
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.ecx + 0x64) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d3e67: mov dl, byte ptr [ecx + 0x64]
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.ecx + 0x80) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 4d3e6a: mov ax, word ptr [ecx + 0x80]
        R.sub(((R.edx >>> 0) & 0xff), 0x3, 8); // 4d3e71: cmp dl, 3
        if (!R.zf) { pc = 621; continue; } // 4d3e74: jne 0x4d3e92
        pc = 619; continue;
      case 619: // 4d3e76
        R.sub(((R.eax >>> 0) & 0xffff), 0x1482, 16); // 4d3e76: cmp ax, 0x1482
        if (!R.cL) { pc = 621; continue; } // 4d3e7a: jge 0x4d3e92
        pc = 620; continue;
      default: return pc;
    }
  }
}
function f_4d1600_73(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 620: // 4d3e7c
        R.ecx = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 4d3e7c: movsx ecx, ax
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.ecx >>> 0)); // 4d3e7f: mov dword ptr [esp + 0x38], ecx
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d3e83: fild dword ptr [esp + 0x38]
        R.st[0] = R.st[0] * 0.75; // 4d3e87: fmul qword ptr [0x969040]
        R.ftol(); // 4d3e8d: call 0x945640
        pc = 621; continue;
      case 621: // 4d3e92
        R.sub(((R.ebx >>> 0) & 0xff), 0x5, 8); // 4d3e92: cmp bl, 5
        if (!R.cL) { pc = 624; continue; } // 4d3e95: jge 0x4d3ec2
        pc = 622; continue;
      case 622: // 4d3e97
        R.sub(((R.eax >>> 0) & 0xffff), 0xfa0, 16); // 4d3e97: cmp ax, 0xfa0
        if (R.cLE) { pc = 624; continue; } // 4d3e9b: jle 0x4d3ec2
        pc = 623; continue;
      case 623: // 4d3e9d
        R.edx = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 4d3e9d: movsx edx, ax
        R.edx = (R.sub((R.edx >>> 0), 0xfa0, 32)) | 0; // 4d3ea0: sub edx, 0xfa0
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edx >>> 0)); // 4d3ea6: mov dword ptr [esp + 0x38], edx
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d3eaa: fild dword ptr [esp + 0x38]
        R.st[0] = R.st[0] * -0.2; // 4d3eae: fmul qword ptr [0x968f30]
        R.ftol(); // 4d3eb4: call 0x945640
        R.ecx = (0xfa0) | 0; // 4d3eb9: mov ecx, 0xfa0
        R.ecx = (R.sub((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 4d3ebe: sub ecx, eax
        R.eax = ((R.ecx >>> 0)) | 0; // 4d3ec0: mov eax, ecx
        pc = 624; continue;
      case 624: // 4d3ec2
        R.sub(((R.eax >>> 0) & 0xffff), 0x1482, 16); // 4d3ec2: cmp ax, 0x1482
        if (!R.cL) { pc = 626; continue; } // 4d3ec6: jge 0x4d3ee8
        pc = 625; continue;
      case 625: // 4d3ec8
        R.edx = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 4d3ec8: movsx edx, ax
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edx >>> 0)); // 4d3ecb: mov dword ptr [esp + 0x38], edx
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d3ecf: fild dword ptr [esp + 0x38]
        R.st[0] = R.st[0] * 0.00019047619047619048; // 4d3ed3: fmul qword ptr [0x968f28]
        R.st[0] = R.st[0] * R.m.s32(((R.esp + 0x20) | 0) >>> 0); // 4d3ed9: fimul dword ptr [esp + 0x20]
        R.ftol(); // 4d3edd: call 0x945640
        R.ebp = ((R.eax >>> 0)) | 0; // 4d3ee2: mov ebp, eax
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, (R.ebp >>> 0)); // 4d3ee4: mov dword ptr [esp + 0x20], ebp
        pc = 626; continue;
      case 626: // 4d3ee8
        R.eax = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 4d3ee8: mov eax, dword ptr [esp + 0x18]
        R.esi = (R.m.u32(((R.eax + 0x45) | 0) >>> 0)) | 0; // 4d3eec: mov esi, dword ptr [eax + 0x45]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 4d3eef: test esi, esi
        if (R.zf) { pc = 637; continue; } // 4d3ef1: je 0x4d3f8c
        pc = 627; continue;
      case 627: // 4d3ef7
        R.ebx = ((R.eax >>> 0)) | 0; // 4d3ef7: mov ebx, eax
        R.sub(R.m.u8(((R.ebx + 0x44) | 0) >>> 0), 0xce, 8); // 4d3ef9: cmp byte ptr [ebx + 0x44], 0xce
        if (!R.cL) { pc = 629; continue; } // 4d3efd: jge 0x4d3f14
        pc = 628; continue;
      case 628: // 4d3eff
        R.fpush(R.m.s32(((R.esp + 0x20) | 0) >>> 0)); // 4d3eff: fild dword ptr [esp + 0x20]
        R.st[0] = R.st[0] * 0.75; // 4d3f03: fmul qword ptr [0x969040]
        R.ftol(); // 4d3f09: call 0x945640
        R.ebp = ((R.eax >>> 0)) | 0; // 4d3f0e: mov ebp, eax
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, (R.ebp >>> 0)); // 4d3f10: mov dword ptr [esp + 0x20], ebp
        pc = 629; continue;
      default: return pc;
    }
  }
}
function f_4d1600_74(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 629: // 4d3f14
        R.logic((R.esi >>> 0) & 0x800000, 32); // 4d3f14: test esi, 0x800000
        if (R.zf) { pc = 631; continue; } // 4d3f1a: je 0x4d3f31
        pc = 630; continue;
      case 630: // 4d3f1c
        R.fpush(R.m.s32(((R.esp + 0x20) | 0) >>> 0)); // 4d3f1c: fild dword ptr [esp + 0x20]
        R.st[0] = R.st[0] * 0.8; // 4d3f20: fmul qword ptr [0x9689b0]
        R.ftol(); // 4d3f26: call 0x945640
        R.ebp = ((R.eax >>> 0)) | 0; // 4d3f2b: mov ebp, eax
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, (R.ebp >>> 0)); // 4d3f2d: mov dword ptr [esp + 0x20], ebp
        pc = 631; continue;
      case 631: // 4d3f31
        R.ecx = ((R.ebx >>> 0)) | 0; // 4d3f31: mov ecx, ebx
        R.call(0x8676f0, { n: 0, thisEcx: true, calleeClean: false }); // 4d3f33: call 0x8676f0
        R.logic(((R.eax >>> 0) & 0xff) & 0x8, 8); // 4d3f38: test al, 8
        if (R.zf) { pc = 633; continue; } // 4d3f3a: je 0x4d3f51
        pc = 632; continue;
      case 632: // 4d3f3c
        R.fpush(R.m.s32(((R.esp + 0x20) | 0) >>> 0)); // 4d3f3c: fild dword ptr [esp + 0x20]
        R.st[0] = R.st[0] * 0.95; // 4d3f40: fmul qword ptr [0x9689d0]
        R.ftol(); // 4d3f46: call 0x945640
        R.ebp = ((R.eax >>> 0)) | 0; // 4d3f4b: mov ebp, eax
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, (R.ebp >>> 0)); // 4d3f4d: mov dword ptr [esp + 0x20], ebp
        pc = 633; continue;
      case 633: // 4d3f51
        R.ecx = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 4d3f51: mov ecx, dword ptr [esp + 0x18]
        R.ebx = (R.m.u32(((R.ecx + 0x45) | 0) >>> 0)) | 0; // 4d3f55: mov ebx, dword ptr [ecx + 0x45]
        R.logic(((R.ebx >>> 0) & 0xff) & 0x1, 8); // 4d3f58: test bl, 1
        if (R.zf) { pc = 635; continue; } // 4d3f5b: je 0x4d3f72
        pc = 634; continue;
      case 634: // 4d3f5d
        R.fpush(R.m.s32(((R.esp + 0x20) | 0) >>> 0)); // 4d3f5d: fild dword ptr [esp + 0x20]
        R.st[0] = R.st[0] * 0.9; // 4d3f61: fmul qword ptr [0x9689d8]
        R.ftol(); // 4d3f67: call 0x945640
        R.ebp = ((R.eax >>> 0)) | 0; // 4d3f6c: mov ebp, eax
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, (R.ebp >>> 0)); // 4d3f6e: mov dword ptr [esp + 0x20], ebp
        pc = 635; continue;
      case 635: // 4d3f72
        R.logic(((R.ebx >>> 0) & 0xff) & 0x40, 8); // 4d3f72: test bl, 0x40
        if (R.zf) { pc = 637; continue; } // 4d3f75: je 0x4d3f8c
        pc = 636; continue;
      case 636: // 4d3f77
        R.fpush(R.m.s32(((R.esp + 0x20) | 0) >>> 0)); // 4d3f77: fild dword ptr [esp + 0x20]
        R.st[0] = R.st[0] * 0.9; // 4d3f7b: fmul qword ptr [0x9689d8]
        R.ftol(); // 4d3f81: call 0x945640
        R.ebp = ((R.eax >>> 0)) | 0; // 4d3f86: mov ebp, eax
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, (R.ebp >>> 0)); // 4d3f88: mov dword ptr [esp + 0x20], ebp
        pc = 637; continue;
      case 637: // 4d3f8c
        R.ecx = (R.m.u32(((R.esp + 0x98) | 0) >>> 0)) | 0; // 4d3f8c: mov ecx, dword ptr [esp + 0x98]
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ecx + 0x59) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d3f93: mov al, byte ptr [ecx + 0x59]
        R.sub(((R.eax >>> 0) & 0xff), 0x6, 8); // 4d3f96: cmp al, 6
        if (!R.cL) { pc = 644; continue; } // 4d3f98: jge 0x4d3ff5
        pc = 638; continue;
      case 638: // 4d3f9a
        R.sub(R.m.u8(((R.ecx + 0x5b) | 0) >>> 0), 0xa, 8); // 4d3f9a: cmp byte ptr [ecx + 0x5b], 0xa
        if (!R.cL) { pc = 644; continue; } // 4d3f9e: jge 0x4d3ff5
        pc = 639; continue;
      default: return pc;
    }
  }
}
function f_4d1600_75(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 639: // 4d3fa0
        R.edx = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 4d3fa0: mov edx, dword ptr [esp + 0x18]
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.edx + 0x44) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d3fa4: mov al, byte ptr [edx + 0x44]
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 4d3fa7: test al, al
        if (!R.cL) { pc = 641; continue; } // 4d3fa9: jge 0x4d3fc0
        pc = 640; continue;
      case 640: // 4d3fab
        R.fpush(R.m.s32(((R.esp + 0x20) | 0) >>> 0)); // 4d3fab: fild dword ptr [esp + 0x20]
        R.st[0] = R.st[0] * 0.9; // 4d3faf: fmul qword ptr [0x9689d8]
        R.ftol(); // 4d3fb5: call 0x945640
        R.ebp = ((R.eax >>> 0)) | 0; // 4d3fba: mov ebp, eax
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, (R.ebp >>> 0)); // 4d3fbc: mov dword ptr [esp + 0x20], ebp
        pc = 641; continue;
      case 641: // 4d3fc0
        R.eax = (R.m.u32(((R.esp + 0x94) | 0) >>> 0)) | 0; // 4d3fc0: mov eax, dword ptr [esp + 0x94]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d3fc7: test eax, eax
        if (R.zf) { pc = 648; continue; } // 4d3fc9: je 0x4d4015
        pc = 642; continue;
      case 642: // 4d3fcb
        R.ecx = (R.m.u32(((R.esp + 0x90) | 0) >>> 0)) | 0; // 4d3fcb: mov ecx, dword ptr [esp + 0x90]
        R.eax = (((R.m.u16(((R.eax + 0x80) | 0) >>> 0)) << 16 >> 16)) | 0; // 4d3fd2: movsx eax, word ptr [eax + 0x80]
        R.edx = (((R.m.u16(((R.ecx + 0x80) | 0) >>> 0)) << 16 >> 16)) | 0; // 4d3fd9: movsx edx, word ptr [ecx + 0x80]
        R.eax = (R.sub((R.eax >>> 0), 0x2ee, 32)) | 0; // 4d3fe0: sub eax, 0x2ee
        R.sub((R.eax >>> 0), (R.edx >>> 0), 32); // 4d3fe5: cmp eax, edx
        if (R.cLE) { pc = 648; continue; } // 4d3fe7: jle 0x4d4015
        pc = 643; continue;
      case 643: // 4d3fe9
        R.fpush(R.m.s32(((R.esp + 0x20) | 0) >>> 0)); // 4d3fe9: fild dword ptr [esp + 0x20]
        R.st[0] = R.st[0] * 0.9; // 4d3fed: fmul qword ptr [0x9689d8]
        pc = 647; continue; // 4d3ff3: jmp 0x4d400e
      case 644: // 4d3ff5
        R.sub(((R.eax >>> 0) & 0xff), 0xf, 8); // 4d3ff5: cmp al, 0xf
        if (R.cLE) { pc = 648; continue; } // 4d3ff7: jle 0x4d4015
        pc = 645; continue;
      case 645: // 4d3ff9
        R.eax = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 4d3ff9: mov eax, dword ptr [esp + 0x18]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.eax + 0x44) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d3ffd: mov cl, byte ptr [eax + 0x44]
        R.logic(((R.ecx >>> 0) & 0xff) & ((R.ecx >>> 0) & 0xff), 8); // 4d4000: test cl, cl
        if (R.cL) { pc = 648; continue; } // 4d4002: jl 0x4d4015
        pc = 646; continue;
      case 646: // 4d4004
        R.fpush(R.m.s32(((R.esp + 0x20) | 0) >>> 0)); // 4d4004: fild dword ptr [esp + 0x20]
        R.st[0] = R.st[0] * 1.1; // 4d4008: fmul qword ptr [0x9689c0]
        pc = 647; continue;
      case 647: // 4d400e
        R.ftol(); // 4d400e: call 0x945640
        R.ebp = ((R.eax >>> 0)) | 0; // 4d4013: mov ebp, eax
        pc = 648; continue;
      case 648: // 4d4015
        R.sub((R.edi >>> 0), (R.ebp >>> 0), 32); // 4d4015: cmp edi, ebp
        if (!R.cL) { pc = 651; continue; } // 4d4017: jge 0x4d402e
        pc = 649; continue;
      case 649: // 4d4019
        R.eax = (R.m.u32(((R.esp + 0x9c) | 0) >>> 0)) | 0; // 4d4019: mov eax, dword ptr [esp + 0x9c]
        R.edi = ((R.ebp >>> 0)) | 0; // 4d4020: mov edi, ebp
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d4022: test eax, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 4d4024: mov dword ptr [esp + 0x14], edi
        if (R.zf) { pc = 651; continue; } // 4d4028: je 0x4d402e
        pc = 650; continue;
      default: return pc;
    }
  }
}
function f_4d1600_76(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 650: // 4d402a
        R.m.w8(((R.eax + 0x1) | 0) >>> 0, R.logic(R.m.u8(((R.eax + 0x1) | 0) >>> 0) | 0x20, 8)); // 4d402a: or byte ptr [eax + 1], 0x20
        pc = 651; continue;
      case 651: // 4d402e
        R.ecx = (R.m.u32(((R.esp + 0x98) | 0) >>> 0)) | 0; // 4d402e: mov ecx, dword ptr [esp + 0x98]
        R.edx = (R.m.u32(((R.ecx + 0x61) | 0) >>> 0)) | 0; // 4d4035: mov edx, dword ptr [ecx + 0x61]
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.edx + 0xf) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d4038: mov al, byte ptr [edx + 0xf]
        R.sub(((R.eax >>> 0) & 0xff), 0x14, 8); // 4d403b: cmp al, 0x14
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esp + 0x10) | 0) >>> 0)) & 0xff) << 0)) | 0; // 4d403d: mov al, byte ptr [esp + 0x10]
        if (!R.zf) { pc = 653; continue; } // 4d4041: jne 0x4d4045
        pc = 652; continue;
      case 652: // 4d4043
        R.eax = ((R.eax & 0xffffff00) | (((R.add(((R.eax >>> 0) & 0xff), 0xfd, 8)) & 0xff) << 0)) | 0; // 4d4043: add al, 0xfd
        pc = 653; continue;
      case 653: // 4d4045
        R.sub(((R.eax >>> 0) & 0xff), 0x1c, 8); // 4d4045: cmp al, 0x1c
        if (R.cLE) { pc = 676; continue; } // 4d4047: jle 0x4d4155
        pc = 654; continue;
      case 654: // 4d404d
        R.eax = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 4d404d: movsx eax, al
        R.eax = (R.add((R.eax >>> 0), 0xffffffe3, 32)) | 0; // 4d4050: add eax, -0x1d
        R.sub((R.eax >>> 0), 0x10, 32); // 4d4053: cmp eax, 0x10
        if (!R.cBE) { pc = 676; continue; } // 4d4056: ja 0x4d4155
        pc = 655; continue;
      case 655: // 4d405c
        pc = [656, 658, 660, 662, 664, 666, 668, 670, 672, 674, 674, 674, 674, 674, 674, 674, 674][R.eax >>> 0] ?? -2; continue; // 4d405c: jmp dword ptr [eax*4 + 0x4d4288]
      case 656: // 4d4063
        R.ecx = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 4d4063: mov ecx, dword ptr [esp + 0x1c]
        R.eax = (((R.ecx + 0x4c4b40) | 0)) | 0; // 4d4067: lea eax, [ecx + 0x4c4b40]
        R.sub((R.edi >>> 0), (R.eax >>> 0), 32); // 4d406d: cmp edi, eax
        if (R.cL) { pc = 677; continue; } // 4d406f: jl 0x4d4159
        pc = 657; continue;
      case 657: // 4d4075
        R.edi = ((R.eax >>> 0)) | 0; // 4d4075: mov edi, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 4d4077: mov dword ptr [esp + 0x14], edi
        pc = 677; continue; // 4d407b: jmp 0x4d4159
      case 658: // 4d4080
        R.ecx = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 4d4080: mov ecx, dword ptr [esp + 0x1c]
        R.eax = (((R.ecx + 0x3d0900) | 0)) | 0; // 4d4084: lea eax, [ecx + 0x3d0900]
        R.sub((R.edi >>> 0), (R.eax >>> 0), 32); // 4d408a: cmp edi, eax
        if (R.cL) { pc = 677; continue; } // 4d408c: jl 0x4d4159
        pc = 659; continue;
      case 659: // 4d4092
        R.edi = ((R.eax >>> 0)) | 0; // 4d4092: mov edi, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 4d4094: mov dword ptr [esp + 0x14], edi
        pc = 677; continue; // 4d4098: jmp 0x4d4159
      case 660: // 4d409d
        R.ecx = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 4d409d: mov ecx, dword ptr [esp + 0x1c]
        R.eax = (((R.ecx + 0x319750) | 0)) | 0; // 4d40a1: lea eax, [ecx + 0x319750]
        R.sub((R.edi >>> 0), (R.eax >>> 0), 32); // 4d40a7: cmp edi, eax
        if (R.cL) { pc = 677; continue; } // 4d40a9: jl 0x4d4159
        pc = 661; continue;
      case 661: // 4d40af
        R.edi = ((R.eax >>> 0)) | 0; // 4d40af: mov edi, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 4d40b1: mov dword ptr [esp + 0x14], edi
        pc = 677; continue; // 4d40b5: jmp 0x4d4159
      default: return pc;
    }
  }
}
function f_4d1600_77(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 662: // 4d40ba
        R.ecx = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 4d40ba: mov ecx, dword ptr [esp + 0x1c]
        R.eax = (((R.ecx + 0x2625a0) | 0)) | 0; // 4d40be: lea eax, [ecx + 0x2625a0]
        R.sub((R.edi >>> 0), (R.eax >>> 0), 32); // 4d40c4: cmp edi, eax
        if (R.cL) { pc = 677; continue; } // 4d40c6: jl 0x4d4159
        pc = 663; continue;
      case 663: // 4d40cc
        R.edi = ((R.eax >>> 0)) | 0; // 4d40cc: mov edi, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 4d40ce: mov dword ptr [esp + 0x14], edi
        pc = 677; continue; // 4d40d2: jmp 0x4d4159
      case 664: // 4d40d7
        R.ecx = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 4d40d7: mov ecx, dword ptr [esp + 0x1c]
        R.eax = (((R.ecx + 0x1ab3f0) | 0)) | 0; // 4d40db: lea eax, [ecx + 0x1ab3f0]
        R.sub((R.edi >>> 0), (R.eax >>> 0), 32); // 4d40e1: cmp edi, eax
        if (R.cL) { pc = 677; continue; } // 4d40e3: jl 0x4d4159
        pc = 665; continue;
      case 665: // 4d40e5
        R.edi = ((R.eax >>> 0)) | 0; // 4d40e5: mov edi, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 4d40e7: mov dword ptr [esp + 0x14], edi
        pc = 677; continue; // 4d40eb: jmp 0x4d4159
      case 666: // 4d40ed
        R.ecx = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 4d40ed: mov ecx, dword ptr [esp + 0x1c]
        R.eax = (((R.ecx + 0xf4240) | 0)) | 0; // 4d40f1: lea eax, [ecx + 0xf4240]
        R.sub((R.edi >>> 0), (R.eax >>> 0), 32); // 4d40f7: cmp edi, eax
        if (R.cL) { pc = 677; continue; } // 4d40f9: jl 0x4d4159
        pc = 667; continue;
      case 667: // 4d40fb
        R.edi = ((R.eax >>> 0)) | 0; // 4d40fb: mov edi, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 4d40fd: mov dword ptr [esp + 0x14], edi
        pc = 677; continue; // 4d4101: jmp 0x4d4159
      case 668: // 4d4103
        R.ecx = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 4d4103: mov ecx, dword ptr [esp + 0x1c]
        R.eax = (((R.ecx + 0x7a120) | 0)) | 0; // 4d4107: lea eax, [ecx + 0x7a120]
        R.sub((R.edi >>> 0), (R.eax >>> 0), 32); // 4d410d: cmp edi, eax
        if (R.cL) { pc = 677; continue; } // 4d410f: jl 0x4d4159
        pc = 669; continue;
      case 669: // 4d4111
        R.edi = ((R.eax >>> 0)) | 0; // 4d4111: mov edi, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 4d4113: mov dword ptr [esp + 0x14], edi
        pc = 677; continue; // 4d4117: jmp 0x4d4159
      case 670: // 4d4119
        R.ecx = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 4d4119: mov ecx, dword ptr [esp + 0x1c]
        R.eax = (((R.ecx + 0x30d40) | 0)) | 0; // 4d411d: lea eax, [ecx + 0x30d40]
        R.sub((R.edi >>> 0), (R.eax >>> 0), 32); // 4d4123: cmp edi, eax
        if (R.cL) { pc = 677; continue; } // 4d4125: jl 0x4d4159
        pc = 671; continue;
      case 671: // 4d4127
        R.edi = ((R.eax >>> 0)) | 0; // 4d4127: mov edi, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 4d4129: mov dword ptr [esp + 0x14], edi
        pc = 677; continue; // 4d412d: jmp 0x4d4159
      case 672: // 4d412f
        R.ecx = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 4d412f: mov ecx, dword ptr [esp + 0x1c]
        R.eax = (((R.ecx + 0x186a0) | 0)) | 0; // 4d4133: lea eax, [ecx + 0x186a0]
        R.sub((R.edi >>> 0), (R.eax >>> 0), 32); // 4d4139: cmp edi, eax
        if (R.cL) { pc = 677; continue; } // 4d413b: jl 0x4d4159
        pc = 673; continue;
      case 673: // 4d413d
        R.edi = ((R.eax >>> 0)) | 0; // 4d413d: mov edi, eax
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 4d413f: mov dword ptr [esp + 0x14], edi
        pc = 677; continue; // 4d4143: jmp 0x4d4159
      default: return pc;
    }
  }
}
function f_4d1600_78(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 674: // 4d4145
        R.ecx = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 4d4145: mov ecx, dword ptr [esp + 0x1c]
        R.sub((R.edi >>> 0), (R.ecx >>> 0), 32); // 4d4149: cmp edi, ecx
        if (R.cL) { pc = 677; continue; } // 4d414b: jl 0x4d4159
        pc = 675; continue;
      case 675: // 4d414d
        R.edi = ((R.ecx >>> 0)) | 0; // 4d414d: mov edi, ecx
        R.m.w32(((R.esp + 0x14) | 0) >>> 0, (R.edi >>> 0)); // 4d414f: mov dword ptr [esp + 0x14], edi
        pc = 677; continue; // 4d4153: jmp 0x4d4159
      case 676: // 4d4155
        R.ecx = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 4d4155: mov ecx, dword ptr [esp + 0x1c]
        pc = 677; continue;
      case 677: // 4d4159
        R.eax = (R.m.u32(((R.esp + 0x90) | 0) >>> 0)) | 0; // 4d4159: mov eax, dword ptr [esp + 0x90]
        R.eax = (R.m.u32(((R.eax + 0x53) | 0) >>> 0)) | 0; // 4d4160: mov eax, dword ptr [eax + 0x53]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d4163: test eax, eax
        if (R.zf) { pc = 691; continue; } // 4d4165: je 0x4d422a
        pc = 678; continue;
      case 678: // 4d416b
        R.edx = (R.m.u32(((0x9cf434) | 0) >>> 0)) | 0; // 4d416b: mov edx, dword ptr [0x9cf434]
        R.esi = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 4d4171: mov esi, dword ptr [eax]
        R.sub((R.esi >>> 0), (R.edx >>> 0), 32); // 4d4173: cmp esi, edx
        if (!R.zf) { pc = 685; continue; } // 4d4175: jne 0x4d41ed
        pc = 679; continue;
      case 679: // 4d4177
        R.sub((R.edi >>> 0), (R.ecx >>> 0), 32); // 4d4177: cmp edi, ecx
        if (R.cLE) { pc = 691; continue; } // 4d4179: jle 0x4d422a
        pc = 680; continue;
      case 680: // 4d417f
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 4d417f: fild dword ptr [esp + 0x1c]
        R.fpush(R.m.s32(((R.esp + 0x14) | 0) >>> 0)); // 4d4183: fild dword ptr [esp + 0x14]
        R.sub((R.edi >>> 0), 0x5b8d80, 32); // 4d4187: cmp edi, 0x5b8d80
        if (!R.cL) { pc = 683; continue; } // 4d418d: jge 0x4d41c7
        pc = 681; continue;
      case 681: // 4d418f
        R.fpush(R.st[0]); // 4d418f: fld st(0)
        R.st[0] = R.st[0] * 1.6666666666666668e-07; // 4d4191: fmul qword ptr [0x968e88]
        R.st[0] = R.st[0] * 0.6; // 4d4197: fmul qword ptr [0x968e48]
        R.st[0] = R.st[0] + 0.3; // 4d419d: fadd qword ptr [0x968e80]
        R.st[0] = R.st[0] * R.st[1]; // 4d41a3: fmul st(1)
        R.m.wf64(((R.esp + 0x84) | 0) >>> 0, R.st[0]); R.fpop(); // 4d41a5: fstp qword ptr [esp + 0x84]
        R.fpop(); // 4d41ac: fstp st(0)
        R.fcom(R.st[0], R.f64(((R.esp + 0x84) | 0))); // 4d41ae: fcom qword ptr [esp + 0x84]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d41b5: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 4d41b7: test ah, 0x41
        if (R.zf) { pc = 690; continue; } // 4d41ba: je 0x4d4223
        pc = 682; continue;
      case 682: // 4d41bc
        R.fpop(); // 4d41bc: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x84) | 0))); // 4d41be: fld qword ptr [esp + 0x84]
        pc = 690; continue; // 4d41c5: jmp 0x4d4223
      case 683: // 4d41c7
        R.st[0] = R.st[0] * 0.9; // 4d41c7: fmul qword ptr [0x9689d8]
        R.m.wf64(((R.esp + 0x84) | 0) >>> 0, R.st[0]); R.fpop(); // 4d41cd: fstp qword ptr [esp + 0x84]
        R.fcom(R.st[0], R.f64(((R.esp + 0x84) | 0))); // 4d41d4: fcom qword ptr [esp + 0x84]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 4d41db: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 4d41dd: test ah, 0x41
        if (R.zf) { pc = 690; continue; } // 4d41e0: je 0x4d4223
        pc = 684; continue;
      default: return pc;
    }
  }
}
function f_4d1600_79(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 684: // 4d41e2
        R.fpop(); // 4d41e2: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x84) | 0))); // 4d41e4: fld qword ptr [esp + 0x84]
        pc = 690; continue; // 4d41eb: jmp 0x4d4223
      case 685: // 4d41ed
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d41ed: test eax, eax
        if (R.zf) { pc = 691; continue; } // 4d41ef: je 0x4d422a
        pc = 686; continue;
      case 686: // 4d41f1
        R.eax = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 4d41f1: mov eax, dword ptr [eax]
        R.edx = (R.m.u32(((0x9cf484) | 0) >>> 0)) | 0; // 4d41f3: mov edx, dword ptr [0x9cf484]
        R.sub((R.eax >>> 0), (R.edx >>> 0), 32); // 4d41f9: cmp eax, edx
        if (!R.zf) { pc = 691; continue; } // 4d41fb: jne 0x4d422a
        pc = 687; continue;
      case 687: // 4d41fd
        R.sub((R.edi >>> 0), (R.ecx >>> 0), 32); // 4d41fd: cmp edi, ecx
        if (R.cLE) { pc = 691; continue; } // 4d41ff: jle 0x4d422a
        pc = 688; continue;
      case 688: // 4d4201
        R.sub((R.edi >>> 0), 0xc350, 32); // 4d4201: cmp edi, 0xc350
        if (R.cLE) { pc = 691; continue; } // 4d4207: jle 0x4d422a
        pc = 689; continue;
      case 689: // 4d4209
        R.edi = (R.add((R.edi >>> 0), 0xffff3cb0, 32)) | 0; // 4d4209: add edi, 0xffff3cb0
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, (R.edi >>> 0)); // 4d420f: mov dword ptr [esp + 0x38], edi
        R.fpush(R.m.s32(((R.esp + 0x38) | 0) >>> 0)); // 4d4213: fild dword ptr [esp + 0x38]
        R.st[0] = R.st[0] * 0.15; // 4d4217: fmul qword ptr [0x968f20]
        R.st[0] = R.st[0] + 50000.0; // 4d421d: fadd qword ptr [0x968880]
        pc = 690; continue;
      case 690: // 4d4223
        R.ftol(); // 4d4223: call 0x945640
        R.edi = ((R.eax >>> 0)) | 0; // 4d4228: mov edi, eax
        pc = 691; continue;
      case 691: // 4d422a
        R.esi = (R.m.u32(((R.esp + 0x18) | 0) >>> 0)) | 0; // 4d422a: mov esi, dword ptr [esp + 0x18]
        R.ecx = ((R.esi >>> 0)) | 0; // 4d422e: mov ecx, esi
        R.call(0x867b50, { n: 0, thisEcx: true, calleeClean: false }); // 4d4230: call 0x867b50
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 4d4235: test eax, eax
        if (R.zf) { pc = 693; continue; } // 4d4237: je 0x4d4240
        pc = 692; continue;
      case 692: // 4d4239
        R.eax = (R.m.u32(((R.esi + 0x21) | 0) >>> 0)) | 0; // 4d4239: mov eax, dword ptr [esi + 0x21]
        R.sub((R.edi >>> 0), (R.eax >>> 0), 32); // 4d423c: cmp edi, eax
        if (!R.cL) { pc = 695; continue; } // 4d423e: jge 0x4d424e
        pc = 693; continue;
      case 693: // 4d4240
        R.eax = ((R.edi >>> 0)) | 0; // 4d4240: mov eax, edi
        R.edi = (R.pop()) | 0; // 4d4242: pop edi
        R.esi = (R.pop()) | 0; // 4d4243: pop esi
        R.ebp = (R.pop()) | 0; // 4d4244: pop ebp
        R.ebx = (R.pop()) | 0; // 4d4245: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x7c, 32)) | 0; // 4d4246: add esp, 0x7c
        R.rv = R.ret(6); return -1; // 4d4249: ret 0x18
      case 694: // 4d424c
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 4d424c: xor eax, eax
        pc = 695; continue;
      default: return pc;
    }
  }
}
function f_4d1600_80(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 695: // 4d424e
        R.edi = (R.pop()) | 0; // 4d424e: pop edi
        R.esi = (R.pop()) | 0; // 4d424f: pop esi
        R.ebp = (R.pop()) | 0; // 4d4250: pop ebp
        R.ebx = (R.pop()) | 0; // 4d4251: pop ebx
        R.esp = (R.add((R.esp >>> 0), 0x7c, 32)) | 0; // 4d4252: add esp, 0x7c
        R.rv = R.ret(6); return -1; // 4d4255: ret 0x18
      default: return pc;
    }
  }
}
export function f_4d1600(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 696) throw new Error(`f_4d1600: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_4d1600_0(R, pc); break;
      case 1: np = f_4d1600_1(R, pc); break;
      case 2: np = f_4d1600_2(R, pc); break;
      case 3: np = f_4d1600_3(R, pc); break;
      case 4: np = f_4d1600_4(R, pc); break;
      case 5: np = f_4d1600_5(R, pc); break;
      case 6: np = f_4d1600_6(R, pc); break;
      case 7: np = f_4d1600_7(R, pc); break;
      case 8: np = f_4d1600_8(R, pc); break;
      case 9: np = f_4d1600_9(R, pc); break;
      case 10: np = f_4d1600_10(R, pc); break;
      case 11: np = f_4d1600_11(R, pc); break;
      case 12: np = f_4d1600_12(R, pc); break;
      case 13: np = f_4d1600_13(R, pc); break;
      case 14: np = f_4d1600_14(R, pc); break;
      case 15: np = f_4d1600_15(R, pc); break;
      case 16: np = f_4d1600_16(R, pc); break;
      case 17: np = f_4d1600_17(R, pc); break;
      case 18: np = f_4d1600_18(R, pc); break;
      case 19: np = f_4d1600_19(R, pc); break;
      case 20: np = f_4d1600_20(R, pc); break;
      case 21: np = f_4d1600_21(R, pc); break;
      case 22: np = f_4d1600_22(R, pc); break;
      case 23: np = f_4d1600_23(R, pc); break;
      case 24: np = f_4d1600_24(R, pc); break;
      case 25: np = f_4d1600_25(R, pc); break;
      case 26: np = f_4d1600_26(R, pc); break;
      case 27: np = f_4d1600_27(R, pc); break;
      case 28: np = f_4d1600_28(R, pc); break;
      case 29: np = f_4d1600_29(R, pc); break;
      case 30: np = f_4d1600_30(R, pc); break;
      case 31: np = f_4d1600_31(R, pc); break;
      case 32: np = f_4d1600_32(R, pc); break;
      case 33: np = f_4d1600_33(R, pc); break;
      case 34: np = f_4d1600_34(R, pc); break;
      case 35: np = f_4d1600_35(R, pc); break;
      case 36: np = f_4d1600_36(R, pc); break;
      case 37: np = f_4d1600_37(R, pc); break;
      case 38: np = f_4d1600_38(R, pc); break;
      case 39: np = f_4d1600_39(R, pc); break;
      case 40: np = f_4d1600_40(R, pc); break;
      case 41: np = f_4d1600_41(R, pc); break;
      case 42: np = f_4d1600_42(R, pc); break;
      case 43: np = f_4d1600_43(R, pc); break;
      case 44: np = f_4d1600_44(R, pc); break;
      case 45: np = f_4d1600_45(R, pc); break;
      case 46: np = f_4d1600_46(R, pc); break;
      case 47: np = f_4d1600_47(R, pc); break;
      case 48: np = f_4d1600_48(R, pc); break;
      case 49: np = f_4d1600_49(R, pc); break;
      case 50: np = f_4d1600_50(R, pc); break;
      case 51: np = f_4d1600_51(R, pc); break;
      case 52: np = f_4d1600_52(R, pc); break;
      case 53: np = f_4d1600_53(R, pc); break;
      case 54: np = f_4d1600_54(R, pc); break;
      case 55: np = f_4d1600_55(R, pc); break;
      case 56: np = f_4d1600_56(R, pc); break;
      case 57: np = f_4d1600_57(R, pc); break;
      case 58: np = f_4d1600_58(R, pc); break;
      case 59: np = f_4d1600_59(R, pc); break;
      case 60: np = f_4d1600_60(R, pc); break;
      case 61: np = f_4d1600_61(R, pc); break;
      case 62: np = f_4d1600_62(R, pc); break;
      case 63: np = f_4d1600_63(R, pc); break;
      case 64: np = f_4d1600_64(R, pc); break;
      case 65: np = f_4d1600_65(R, pc); break;
      case 66: np = f_4d1600_66(R, pc); break;
      case 67: np = f_4d1600_67(R, pc); break;
      case 68: np = f_4d1600_68(R, pc); break;
      case 69: np = f_4d1600_69(R, pc); break;
      case 70: np = f_4d1600_70(R, pc); break;
      case 71: np = f_4d1600_71(R, pc); break;
      case 72: np = f_4d1600_72(R, pc); break;
      case 73: np = f_4d1600_73(R, pc); break;
      case 74: np = f_4d1600_74(R, pc); break;
      case 75: np = f_4d1600_75(R, pc); break;
      case 76: np = f_4d1600_76(R, pc); break;
      case 77: np = f_4d1600_77(R, pc); break;
      case 78: np = f_4d1600_78(R, pc); break;
      case 79: np = f_4d1600_79(R, pc); break;
      case 80: np = f_4d1600_80(R, pc); break;
      default: throw new Error(`f_4d1600: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_4d1600: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_4d1600.shared = true;
