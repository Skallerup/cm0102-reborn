// 0x846920 – mekanisk oversat instruktion for instruktion fra cm0102.exe 3.9.68 af ~/cm0102-engine/tools/x86ts.py
// (transfer/kontrakt runde 2, 13/11-2026). Ret ikke i hånden – generér igen. Køretid: ./x86.ts.
// Kaldte funktioner (n argumenter, this, kaldte rydder, float): 4a4850=1tc, 4b02e0=2, 4ca470=2c, 4cbb60=2tc, 4cf5a0=1c, 4cf5f0=2tc, 53d980=3, 5407e0=3, 5444a0=2, 544520=2, 544590=2, 547810=2, 547840=2, 547d30=2, 547d60=2, 54a110=0t, 54c8e0=2tc, 54cdb0=2tc, 5968d0=2tc, 5986b0=0t, 5a0590=1tc, 600a50=5, 669bd0=3, 7c6830=4tc, 85e410=0t, 864550=6cf, 8cca10=2tc
/* eslint-disable */
import type { CmCtx } from '../cmMem';
import { enter, TRACE, type X86 } from './x86';

// (delt af scripts/split-cmgen.py)
const AD = new Int32Array([0x846920, 0x846999, 0x84699b, 0x8469a7, 0x8469b3, 0x8469bc, 0x8469d1, 0x8469ec, 0x846a5f, 0x846a7d, 0x846a82, 0x846a9f, 0x846ab4, 0x846aba, 0x846acf, 0x846ad8, 0x846adc, 0x846ae7, 0x846af3, 0x846aff, 0x846b50, 0x846b68, 0x846b6d, 0x846b71, 0x846b88, 0x846b96, 0x846b9e, 0x846bb8, 0x846bcd, 0x846bf2, 0x846c0f, 0x846c1e, 0x846c2a, 0x846c2e, 0x846c35, 0x846c3f, 0x846c49, 0x846c50, 0x846c57, 0x846c70, 0x846c8d, 0x846c90, 0x846ca8, 0x846cb3, 0x846d01, 0x846d24, 0x846d2a, 0x846d36, 0x846d3a, 0x846d8b, 0x846d93, 0x846d9d, 0x846da0, 0x846dab, 0x846db6, 0x846dc2, 0x846dcd, 0x846dd5, 0x846ddd, 0x846de8, 0x846df8, 0x846e00, 0x846e06, 0x846e12, 0x846e25, 0x846e34, 0x846e3c, 0x846e44, 0x846e4d, 0x846e6c, 0x846e6f, 0x846e75, 0x846e7d, 0x846e83, 0x846e8c, 0x846e93, 0x846ea2, 0x846eae, 0x846eba, 0x846ebd, 0x846ec3, 0x846ecb, 0x846ed6, 0x846edc, 0x846ee8, 0x846eef, 0x846efe, 0x846f0a, 0x846f14, 0x846f18, 0x846f29, 0x846f3b, 0x846f41, 0x846f4f, 0x846f60, 0x846f6c, 0x846f74, 0x846f7c, 0x846f7e, 0x846f86, 0x846f8c, 0x846f9a, 0x846fa8, 0x846fb3, 0x846fc5, 0x846fcb, 0x846fdc, 0x846fe0, 0x846fe6, 0x846ff4, 0x846fff, 0x847003, 0x84700d, 0x84701b, 0x84701f, 0x847023, 0x847038, 0x84703c, 0x847046, 0x84704e, 0x847069, 0x847074, 0x847082, 0x847094, 0x84709a, 0x84709d, 0x8470b4, 0x8470c2, 0x8470c8, 0x8470df, 0x8470f1, 0x8470f7, 0x8470fb, 0x84710f, 0x84711d, 0x847124, 0x847138, 0x84714a, 0x847154, 0x84715b, 0x84716a, 0x847172, 0x847183, 0x847186, 0x84718a, 0x847191, 0x847198, 0x8471ae, 0x8471b9, 0x8471c6, 0x8471ce, 0x8471d6, 0x8471de, 0x8471f8, 0x8471ff, 0x847209, 0x847210, 0x84721a, 0x847228, 0x847235, 0x84723d, 0x84723f, 0x847254, 0x847266, 0x847280, 0x847287, 0x847291, 0x847298, 0x8472a2, 0x8472b0, 0x8472c1, 0x8472cc, 0x8472d3, 0x8472dd, 0x8472e4, 0x8472fe, 0x847309, 0x847310, 0x847320, 0x84732c, 0x847352, 0x84738d, 0x84738f, 0x84739d, 0x8473b8, 0x8473c0, 0x8473eb, 0x8473f5, 0x8473fd, 0x84740b, 0x847410, 0x84741e, 0x847422, 0x847430, 0x847434, 0x847441, 0x847447, 0x847452, 0x84745f, 0x847468, 0x84746a, 0x84746e, 0x847478, 0x8474b4, 0x8474b6, 0x8474c4, 0x8474dc, 0x8474e6, 0x8474f4, 0x8474f9, 0x8474fb, 0x847500, 0x847504, 0x847508, 0x84750a, 0x84750e, 0x847520, 0x847533, 0x847542, 0x84756e, 0x84757b, 0x847583, 0x847585, 0x847592, 0x847599, 0x8475af, 0x8475be, 0x8475c8, 0x8475de, 0x8475ed, 0x8475f7, 0x847609, 0x847610, 0x847619, 0x847622, 0x84762c, 0x847635, 0x84763f, 0x847646, 0x847654, 0x84765d, 0x847665, 0x847667, 0x847673, 0x847683, 0x84769a, 0x8476a4, 0x8476b4, 0x8476c6, 0x8476cb, 0x8476cd, 0x8476d1, 0x8476e3, 0x8476ea, 0x8476f2, 0x8476f8, 0x847706, 0x847720, 0x84772e, 0x847741, 0x847749, 0x84774f, 0x847761, 0x84777b, 0x847789, 0x84779c, 0x8477a4, 0x8477aa, 0x8477b8, 0x8477c8, 0x8477d7, 0x8477de, 0x8477f6, 0x847802, 0x847806, 0x84780f, 0x84781f, 0x847827, 0x84782d, 0x847831, 0x847836, 0x84783b, 0x847849, 0x84784e, 0x847855, 0x847863, 0x847876, 0x84787d, 0x84788f, 0x847898, 0x8478a8, 0x8478b0, 0x8478b6, 0x8478ba, 0x8478bf, 0x8478c9, 0x8478d7, 0x8478e7, 0x8478ee, 0x847900, 0x847909, 0x847919, 0x847921, 0x847927, 0x84792b, 0x847930, 0x84793a, 0x847948, 0x847958, 0x847962, 0x847966, 0x847970, 0x847974, 0x847976, 0x847987, 0x84798e, 0x847995, 0x8479ab, 0x8479f6, 0x8479fc, 0x847a07, 0x847a27, 0x847a2e, 0x847a35, 0x847a3c, 0x847a45, 0x847a59, 0x847a5f, 0x847a65, 0x847a8e, 0x847a94, 0x847a9a, 0x847a9e, 0x847aa9, 0x847ab1, 0x847ab8, 0x847acf, 0x847aec, 0x847af8, 0x847aff, 0x847b08, 0x847b22, 0x847b29, 0x847b30, 0x847b34, 0x847b5c, 0x847b7c, 0x847b84, 0x847b8d, 0x847b97, 0x847b9e, 0x847ba5, 0x847bac, 0x847bcb, 0x847bcf, 0x847bd7, 0x847bf0, 0x847c2c, 0x847c71, 0x847c79, 0x847cbe, 0x847cc4, 0x847ccb, 0x847ce6, 0x847ced, 0x847cfa, 0x847cfd, 0x847d2a, 0x847d32, 0x847d5f, 0x847d65, 0x847d6c, 0x847d85, 0x847d87, 0x847dd5, 0x847ddd, 0x847e3b, 0x847e43, 0x847e49, 0x847e52, 0x847e64, 0x847e66, 0x847e6b, 0x847e7d, 0x847e7f, 0x847eac, 0x847efa, 0x847f0b, 0x847f1f, 0x847f4c, 0x847f52, 0x847f69, 0x847f76, 0x847f7e, 0x847f82, 0x847f85, 0x847f93, 0x847fa1, 0x847fac, 0x847fbb, 0x847fc1, 0x847fc8, 0x847fd0, 0x847fd6, 0x847fdc, 0x847fe4, 0x847fec, 0x847ff0, 0x847ff4, 0x847ff8, 0x848004, 0x848008, 0x848010, 0x848017, 0x848023, 0x848029, 0x848030, 0x84803b, 0x848041, 0x848049, 0x848054, 0x84805f, 0x848067, 0x848072, 0x84807d, 0x8480ac, 0x8480c0, 0x8480cb, 0x8480d8, 0x8480f8, 0x84810d, 0x848118, 0x848129, 0x848134, 0x848148, 0x848153, 0x84815f, 0x84816a, 0x848175, 0x848180, 0x84818b, 0x8481ba, 0x8481d2, 0x8481dd, 0x8481ea, 0x848208, 0x848219, 0x848224, 0x848226, 0x84822a, 0x848239, 0x848247, 0x848252, 0x848266, 0x84826d, 0x848278, 0x848286, 0x84828d, 0x84829c, 0x8482ac, 0x8482b3, 0x8482c9, 0x8482ce, 0x8482e4, 0x8482e9, 0x848322, 0x84835b, 0x848371, 0x848376, 0x84837d, 0x848388, 0x848396, 0x84839d, 0x8483a7, 0x8483b3, 0x8483be, 0x8483ce, 0x8483d5, 0x848408, 0x84841a, 0x84841c, 0x84844e, 0x848450, 0x848480, 0x848492, 0x848498, 0x8484a0, 0x8484a7, 0x8484ba, 0x8484d9, 0x8484e6, 0x8484f7, 0x848510, 0x848527, 0x848530, 0x848532, 0x848541, 0x848562, 0x848588, 0x848590, 0x84859e, 0x8485ab, 0x8485b3, 0x8485b5, 0x8485be, 0x8485d4, 0x8485f5, 0x8485fb, 0x848617, 0x848624, 0x84862c, 0x84862e, 0x848636, 0x848649, 0x84865c, 0x84866e, 0x848676, 0x848681, 0x8486b7, 0x8486d8, 0x8486df, 0x8486f1, 0x848703, 0x848708, 0x84870b, 0x848717, 0x84871e, 0x84873c, 0x848744, 0x84875a, 0x84876e, 0x8487a9, 0x8487ab, 0x8487b9, 0x8487cb, 0x8487d0, 0x8487d5, 0x8487dd, 0x8487e5, 0x8487ea, 0x8487f2, 0x8487f6, 0x8487fb, 0x848803, 0x848807, 0x84880c, 0x84880e, 0x848814, 0x848819, 0x848821, 0x848824, 0x848831, 0x848838, 0x848847, 0x84885d, 0x848861, 0x848871, 0x848883, 0x848887, 0x84888e, 0x84889a, 0x8488a6, 0x8488bb, 0x8488c2, 0x8488ce, 0x8488d8, 0x8488dc, 0x8488df, 0x8488eb, 0x8488f5, 0x8488f9, 0x8488fb, 0x848943, 0x848946, 0x848950, 0x84895b, 0x84896a, 0x848973, 0x84897e, 0x848989, 0x84899d, 0x8489a4, 0x8489ab, 0x8489af, 0x8489b1, 0x8489c2, 0x8489c9, 0x8489d0, 0x8489e7, 0x848a33, 0x848a39, 0x848a44, 0x848a65, 0x848a6d, 0x848a74, 0x848a7b, 0x848a84, 0x848a98, 0x848a9c, 0x848aa0, 0x848acf, 0x848ad3, 0x848ad5, 0x848ae4, 0x848aec, 0x848af3, 0x848b09, 0x848b23, 0x848b2f, 0x848b36, 0x848b43, 0x848b5d, 0x848b64, 0x848b6b, 0x848b6f, 0x848b9e, 0x848bbc, 0x848bc4, 0x848bcf, 0x848bd9, 0x848bf1, 0x848bf8, 0x848c10, 0x848c22, 0x848c74, 0x848cb9, 0x848cc1, 0x848d06, 0x848d0c, 0x848d13, 0x848d32, 0x848d3d, 0x848d49, 0x848d56, 0x848d65, 0x848d69, 0x848d71, 0x848d9e, 0x848da4, 0x848dad, 0x848dda, 0x848de0, 0x848de9, 0x848df0, 0x848df6, 0x848e13, 0x848e15, 0x848e9b, 0x848ead, 0x848ec5, 0x848ed1, 0x848ed9, 0x848edf, 0x848ee9, 0x848eeb, 0x848eee, 0x848f00, 0x848f02, 0x848f07, 0x848f19, 0x848f1d, 0x848f20, 0x848f31, 0x848f49, 0x848f76, 0x848f83, 0x848ff3, 0x848ff9, 0x84900c, 0x849010, 0x84901a, 0x849067, 0x84906f, 0x849075, 0x849088, 0x8490aa, 0x8490b5, 0x8490bd, 0x8490c5, 0x8490d0, 0x8490d8, 0x8490df, 0x8490e6, 0x8490f1, 0x8490fb, 0x849109, 0x849114, 0x84911e, 0x849126, 0x849147, 0x84914f, 0x849155, 0x84915e, 0x849173, 0x849186, 0x84918a, 0x84918d, 0x84918f, 0x849197, 0x84919d, 0x8491ba, 0x8491ee, 0x8491f4, 0x849211, 0x849226, 0x849231, 0x84923c, 0x849247, 0x849274, 0x84927a, 0x849280, 0x849295, 0x8492a5, 0x8492b6, 0x8492ca, 0x8492e0, 0x8492ea, 0x8492ff, 0x849309, 0x849318, 0x849320, 0x849334, 0x849346, 0x849353, 0x849367, 0x84937e, 0x849386, 0x8493ae, 0x8493bb, 0x8493c3, 0x8493c7, 0x8493ca, 0x8493e7, 0x8493f7, 0x8493ff, 0x849405, 0x849413, 0x849423, 0x849434, 0x849445, 0x84944d, 0x849458, 0x849465, 0x84946d, 0x849471, 0x849479, 0x84947f, 0x849488, 0x849491, 0x8494a2, 0x8494b3, 0x8494bb, 0x8494c6, 0x8494ce, 0x8494d9, 0x8494e0, 0x8494e4, 0x8494ec, 0x8494f2, 0x8494f9, 0x8494fb, 0x849502, 0x849506, 0x849512, 0x84951c, 0x849528, 0x849539, 0x84954a, 0x849552, 0x84955d, 0x84956a, 0x849572, 0x849576, 0x849580, 0x849589, 0x849592, 0x8495a3, 0x8495b4, 0x8495bc, 0x8495c7, 0x8495cf, 0x8495da, 0x8495e1, 0x8495e5, 0x8495ef, 0x8495f6, 0x8495f8, 0x849603, 0x84960f, 0x849614, 0x84963f, 0x84964f, 0x849677, 0x849688, 0x849693, 0x84969f, 0x8496af, 0x8496b9, 0x8496c2, 0x8496ca, 0x849706, 0x849710, 0x84971f, 0x849727, 0x84973e, 0x84974b, 0x849753, 0x849760, 0x84976c, 0x849779, 0x84977d, 0x849785, 0x84978b, 0x84978f, 0x849797, 0x849799, 0x8497a9, 0x8497ba, 0x8497c2, 0x8497c5, 0x8497d1, 0x8497dc, 0x8497f1, 0x84981a, 0x849825, 0x849846, 0x849852, 0x84985e, 0x84986f, 0x849871, 0x849886, 0x84988d, 0x849894, 0x8498ac, 0x8498b5, 0x8498d6, 0x8498de, 0x8498e9, 0x8498f4, 0x8498ff, 0x849914, 0x849941, 0x849998, 0x8499a0, 0x8499a2, 0x8499c1, 0x8499d1, 0x8499e9, 0x8499f9, 0x849a09, 0x849a1b, 0x849a29, 0x849a30, 0x849a49, 0x849a4d, 0x849a67, 0x849a78, 0x849a8a, 0x849a9b, 0x849aab, 0x849ab3, 0x849ac6, 0x849acf, 0x849ada, 0x849aef, 0x849af5, 0x849b15, 0x849b20, 0x849b2d, 0x849b3e, 0x849b5f, 0x849b65, 0x849b69, 0x849b79, 0x849b81, 0x849b8c, 0x849b90, 0x849b98, 0x849ba7, 0x849baf, 0x849bcb, 0x849be4, 0x849bf3, 0x849c14, 0x849c21, 0x849c3a]);
const CH = new Uint8Array([0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6, 6, 7, 7, 7, 7, 7, 7, 7, 7, 7, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 11, 11, 11, 11, 11, 11, 11, 11, 11, 11, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 12, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 13, 14, 14, 14, 14, 14, 14, 14, 14, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 16, 17, 17, 17, 17, 17, 17, 17, 17, 17, 17, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 18, 19, 19, 19, 19, 19, 19, 19, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 21, 21, 21, 21, 21, 21, 21, 21, 21, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 26, 27, 27, 27, 27, 27, 27, 27, 27, 27, 27, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 29, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 31, 31, 31, 31, 31, 31, 31, 31, 31, 32, 32, 32, 32, 32, 32, 32, 32, 33, 33, 33, 33, 33, 33, 33, 33, 33, 33, 34, 34, 34, 34, 34, 34, 34, 34, 34, 35, 35, 35, 35, 35, 35, 35, 35, 35, 36, 36, 36, 36, 36, 37, 37, 37, 37, 37, 37, 37, 37, 38, 38, 38, 38, 38, 38, 38, 39, 39, 39, 39, 40, 40, 40, 40, 40, 40, 40, 40, 41, 41, 41, 41, 41, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 43, 43, 43, 43, 43, 43, 43, 43, 43, 43, 43, 43, 43, 44, 44, 44, 44, 44, 44, 44, 44, 44, 44, 45, 45, 45, 45, 45, 45, 45, 45, 46, 46, 46, 46, 46, 46, 46, 46, 47, 47, 47, 47, 47, 47, 47, 47, 47, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 48, 49, 49, 49, 49, 49, 49, 49, 49, 49, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 51, 51, 51, 51, 51, 51, 51, 51, 52, 52, 52, 52, 52, 52, 52, 52, 52, 53, 53, 53, 53, 53, 53, 53, 53, 53, 53, 54, 54, 54, 54, 54, 54, 54, 54, 54, 54, 55, 55, 55, 55, 55, 55, 55, 56, 56, 56, 56, 56, 56, 56, 56, 57, 57, 57, 57, 57, 57, 57, 57, 57, 57, 57, 57, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 58, 59, 59, 59, 59, 59, 59, 59, 59, 59, 59, 59, 59, 59, 60, 60, 60, 60, 60, 60, 60, 60, 61, 61, 61, 61, 61, 61, 61, 61, 61, 62, 62, 62, 62, 62, 62, 62, 62, 63, 63, 63, 63, 63, 63, 63, 63, 63, 64, 64, 64, 64, 64, 64, 64, 64, 64, 65, 65, 65, 65, 65, 65, 65, 65, 65, 66, 66, 66, 67, 67, 67, 67, 67, 67, 67, 68, 68, 68, 68, 68, 68, 68, 68, 68, 69, 69, 69, 69, 69, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 71, 71, 71, 71, 71, 71, 71, 72, 72, 72, 72, 72, 73, 73, 73, 73, 73, 73, 74, 74, 74, 74, 74, 74, 74, 74, 74, 74, 74, 74, 75, 75, 75, 75, 75, 75, 75, 75, 75, 75, 75, 76, 76, 76, 76, 76, 76, 76, 76, 77, 77, 77, 77, 77, 77, 77, 77, 78, 78, 78, 78, 78, 78, 78, 78, 78, 79, 79, 79, 79, 79, 79, 79, 79, 79, 79, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 81, 81, 81, 81, 81, 81, 81, 81, 81, 81, 81, 81, 82, 82, 82, 82, 82, 82, 82, 82, 82, 82, 82, 82, 83, 83, 83, 83, 83, 83, 83, 83, 83, 83, 83, 84, 84, 84, 84, 84, 84, 84, 84, 84, 84, 84, 85, 85, 85, 85, 85, 85, 85, 85, 86, 86, 86, 86, 86, 86, 86, 87, 87, 87, 87, 87, 87, 87, 87, 87, 87, 87, 87, 88, 88, 88, 88, 88, 88, 88, 88, 88, 89, 89, 89, 89, 89, 89, 89, 89, 89, 90, 90, 90, 90, 90, 90, 91, 91, 91, 91, 91, 91, 91, 91, 91, 91, 92, 92, 92, 92, 92, 92, 92, 92, 92, 92, 93, 93, 93, 93, 93, 93, 93, 94, 94, 94, 94, 94, 94, 94, 94, 94, 94, 95, 95, 95, 95, 95, 95, 96]);
function f_846920_0(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 0: // 846920
        R.push((R.ebp >>> 0)); // 846920: push ebp
        R.ebp = ((R.esp >>> 0)) | 0; // 846921: mov ebp, esp
        R.esp = (R.logic((R.esp >>> 0) & 0xfffffff8, 32)) | 0; // 846923: and esp, 0xfffffff8
        R.push(0xffffffff); // 846926: push -1
        R.push(0x962568); // 846928: push 0x962568
        R.eax = (0) | 0; // 84692d: mov eax, dword ptr fs:[0]
        R.push((R.eax >>> 0)); // 846933: push eax
        /* fs */ // 846934: mov dword ptr fs:[0], esp
        R.esp = (R.sub((R.esp >>> 0), 0xe4, 32)) | 0; // 84693b: sub esp, 0xe4
        R.push((R.ebx >>> 0)); // 846941: push ebx
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.ecx >>> 0)); // 846942: mov dword ptr [esp + 0x1c], ecx
        R.push((R.esi >>> 0)); // 846946: push esi
        R.ebx = (R.logic((R.ebx >>> 0) ^ (R.ebx >>> 0), 32)) | 0; // 846947: xor ebx, ebx
        R.push((R.edi >>> 0)); // 846949: push edi
        R.ecx = (((R.esp + 0x98) | 0)) | 0; // 84694a: lea ecx, [esp + 0x98]
        R.m.w8(((R.esp + 0x57) | 0) >>> 0, ((R.ebx >>> 0) & 0xff)); // 846951: mov byte ptr [esp + 0x57], bl
        R.m.w32(((R.esp + 0x80) | 0) >>> 0, (R.ebx >>> 0)); // 846955: mov dword ptr [esp + 0x80], ebx
        R.m.w32(((R.esp + 0x78) | 0) >>> 0, (R.ebx >>> 0)); // 84695c: mov dword ptr [esp + 0x78], ebx
        R.call(0x54a110, { n: 0, thisEcx: true, calleeClean: false }); // 846960: call 0x54a110
        R.ecx = (((R.esp + 0x90) | 0)) | 0; // 846965: lea ecx, [esp + 0x90]
        R.m.w32(((R.esp + 0xf8) | 0) >>> 0, (R.ebx >>> 0)); // 84696c: mov dword ptr [esp + 0xf8], ebx
        R.call(0x54a110, { n: 0, thisEcx: true, calleeClean: false }); // 846973: call 0x54a110
        R.eax = (R.m.u32(((R.ebp + 0x1c) | 0) >>> 0)) | 0; // 846978: mov eax, dword ptr [ebp + 0x1c]
        R.m.w8(((R.esp + 0xf8) | 0) >>> 0, 0x1); // 84697b: mov byte ptr [esp + 0xf8], 1
        R.sub((R.eax >>> 0), (R.ebx >>> 0), 32); // 846983: cmp eax, ebx
        R.m.w32(((R.esp + 0x84) | 0) >>> 0, (R.ebx >>> 0)); // 846985: mov dword ptr [esp + 0x84], ebx
        R.m.w32(((R.esp + 0x88) | 0) >>> 0, 0x3ff00000); // 84698c: mov dword ptr [esp + 0x88], 0x3ff00000
        if (R.zf) { pc = 2; continue; } // 846997: je 0x84699b
        pc = 1; continue;
      case 1: // 846999
        R.m.w32(((R.eax) | 0) >>> 0, (R.ebx >>> 0)); // 846999: mov dword ptr [eax], ebx
        pc = 2; continue;
      case 2: // 84699b
        R.esi = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 84699b: mov esi, dword ptr [ebp + 8]
        R.sub(R.m.u32(((R.esi + 0x61) | 0) >>> 0), (R.ebx >>> 0), 32); // 84699e: cmp dword ptr [esi + 0x61], ebx
        if (R.zf) { pc = 39; continue; } // 8469a1: je 0x846c70
        pc = 3; continue;
      case 3: // 8469a7
        R.eax = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 8469a7: mov eax, dword ptr [ebp + 0xc]
        R.sub(R.m.u32(((R.eax + 0x53) | 0) >>> 0), (R.ebx >>> 0), 32); // 8469aa: cmp dword ptr [eax + 0x53], ebx
        if (R.zf) { pc = 39; continue; } // 8469ad: je 0x846c70
        pc = 4; continue;
      case 4: // 8469b3
        R.sub(R.m.u32(((R.esi + 0x1a) | 0) >>> 0), (R.ebx >>> 0), 32); // 8469b3: cmp dword ptr [esi + 0x1a], ebx
        if (R.zf) { pc = 39; continue; } // 8469b6: je 0x846c70
        pc = 5; continue;
      case 5: // 8469bc
        R.ecx = (R.m.u32(((0xde1f54) | 0) >>> 0)) | 0; // 8469bc: mov ecx, dword ptr [0xde1f54]
        R.push((R.ebx >>> 0)); // 8469c2: push ebx
        R.push((R.esi >>> 0)); // 8469c3: push esi
        R.call(0x8cca10, { n: 2, thisEcx: true, calleeClean: true }); // 8469c4: call 0x8cca10
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8469c9: test eax, eax
        if (!R.zf) { pc = 39; continue; } // 8469cb: jne 0x846c70
        pc = 6; continue;
      default: return pc;
    }
  }
}
function f_846920_1(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 6: // 8469d1
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 8469d1: mov eax, dword ptr [esi]
        R.edx = (R.m.u32(((0xae2d0c) | 0) >>> 0)) | 0; // 8469d3: mov edx, dword ptr [0xae2d0c]
        R.ecx = (((R.eax + R.eax * 4) | 0)) | 0; // 8469d9: lea ecx, [eax + eax*4]
        R.ecx = (R.shl((R.ecx >>> 0), 0x4, 32)) | 0; // 8469dc: shl ecx, 4
        R.ecx = (R.sub((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 8469df: sub ecx, eax
        R.logic(R.m.u8(((R.ecx + R.edx + 0xb) | 0) >>> 0) & 0x30, 8); // 8469e1: test byte ptr [ecx + edx + 0xb], 0x30
        if (!R.zf) { pc = 39; continue; } // 8469e6: jne 0x846c70
        pc = 7; continue;
      case 7: // 8469ec
        R.ecx = (((R.m.u8(((R.esi + 0x57) | 0) >>> 0)) << 24 >> 24)) | 0; // 8469ec: movsx ecx, byte ptr [esi + 0x57]
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.ecx >>> 0)); // 8469f0: mov dword ptr [esp + 0x1c], ecx
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi + 0x18) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8469f4: mov al, byte ptr [esi + 0x18]
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 8469f7: fild dword ptr [esp + 0x1c]
        R.edx = (((R.m.u8(((R.esi + 0x5b) | 0) >>> 0)) << 24 >> 24)) | 0; // 8469fb: movsx edx, byte ptr [esi + 0x5b]
        R.fpush(R.st[0]); // 8469ff: fld st(0)
        R.st[0] = R.st[0] * 0.025; // 846a01: fmul qword ptr [0x967878]
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.edx >>> 0)); // 846a07: mov dword ptr [esp + 0x1c], edx
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 846a0b: mov ecx, dword ptr [0xae1050]
        R.push((R.esi >>> 0)); // 846a11: push esi
        R.m.w8(((R.esp + 0x1f) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 846a12: mov byte ptr [esp + 0x1f], al
        R.st[0] = 1.4 - R.st[0]; // 846a16: fsubr qword ptr [0x968dc0]
        R.fpush(R.m.s32(((R.esp + 0x20) | 0) >>> 0)); // 846a1c: fild dword ptr [esp + 0x20]
        R.st[0] = R.st[0] * 0.025; // 846a20: fmul qword ptr [0x967878]
        R.st[1] = R.st[1] - R.st[0]; R.fpop(); // 846a26: fsubp st(1)
        R.m.wf32(((R.esp + 0x60) | 0) >>> 0, R.st[0]); R.fpop(); // 846a28: fstp dword ptr [esp + 0x60]
        R.fpush(R.st[0]); // 846a2c: fld st(0)
        R.st[0] = R.st[0] * 0.02; // 846a2e: fmul qword ptr [0x968a98]
        R.st[0] = R.st[0] + 0.8; // 846a34: fadd qword ptr [0x9689b0]
        R.m.wf32(((R.esp + 0x80) | 0) >>> 0, R.st[0]); R.fpop(); // 846a3a: fstp dword ptr [esp + 0x80]
        R.st[0] = R.st[0] * 0.05; // 846a41: fmul qword ptr [0x967888]
        R.st[0] = R.st[0] + 0.5; // 846a47: fadd qword ptr [0x968968]
        R.m.wf32(((R.esp + 0x54) | 0) >>> 0, R.st[0]); R.fpop(); // 846a4d: fstp dword ptr [esp + 0x54]
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 846a51: call 0x4cf5a0
        R.sub((R.eax >>> 0), (R.ebx >>> 0), 32); // 846a56: cmp eax, ebx
        R.m.w32(((0xae1080) | 0) >>> 0, (R.eax >>> 0)); // 846a58: mov dword ptr [0xae1080], eax
        if (R.zf) { pc = 12; continue; } // 846a5d: je 0x846ab4
        pc = 8; continue;
      case 8: // 846a5f
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 846a5f: mov eax, dword ptr [eax + 4]
        R.edx = (R.m.u32(((0xae23b4) | 0) >>> 0)) | 0; // 846a62: mov edx, dword ptr [0xae23b4]
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 846a68: add edx, eax
        R.ecx = (((R.eax + R.eax * 8) | 0)) | 0; // 846a6a: lea ecx, [eax + eax*8]
        R.ecx = (R.shl((R.ecx >>> 0), 0x4, 32)) | 0; // 846a6d: shl ecx, 4
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 846a70: add ecx, eax
        R.edi = (((R.edx + R.ecx * 4) | 0)) | 0; // 846a72: lea edi, [edx + ecx*4]
        R.sub((R.edi >>> 0), (R.ebx >>> 0), 32); // 846a75: cmp edi, ebx
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, (R.edi >>> 0)); // 846a77: mov dword ptr [esp + 0x30], edi
        if (R.zf) { pc = 13; continue; } // 846a7b: je 0x846aba
        pc = 9; continue;
      case 9: // 846a7d
        R.sub(R.m.u32(((R.edi + 0x53) | 0) >>> 0), (R.ebx >>> 0), 32); // 846a7d: cmp dword ptr [edi + 0x53], ebx
        if (!R.zf) { pc = 11; continue; } // 846a80: jne 0x846a9f
        pc = 10; continue;
      default: return pc;
    }
  }
}
function f_846920_2(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 10: // 846a82
        R.fpush(3.5); // 846a82: fld qword ptr [0x968e38]
        R.ecx = (R.m.u32(((R.esp + 0xf0) | 0) >>> 0)) | 0; // 846a88: mov ecx, dword ptr [esp + 0xf0]
        /* fs */ // 846a8f: mov dword ptr fs:[0], ecx
        R.edi = (R.pop()) | 0; // 846a96: pop edi
        R.esi = (R.pop()) | 0; // 846a97: pop esi
        R.ebx = (R.pop()) | 0; // 846a98: pop ebx
        R.esp = ((R.ebp >>> 0)) | 0; // 846a99: mov esp, ebp
        R.ebp = (R.pop()) | 0; // 846a9b: pop ebp
        R.rv = R.st[0]; return -1; // 846a9c: ret 0x18
      case 11: // 846a9f
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 846a9f: mov ecx, dword ptr [0xae1050]
        R.push((R.esi >>> 0)); // 846aa5: push esi
        R.call(0x4cf5a0, { n: 1, thisEcx: false, calleeClean: true }); // 846aa6: call 0x4cf5a0
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.eax + 0x35) | 0) >>> 0)) & 0xff) << 0)) | 0; // 846aab: mov al, byte ptr [eax + 0x35]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) & 0x3f, 8)) & 0xff) << 0)) | 0; // 846aae: and al, 0x3f
        R.sub(((R.eax >>> 0) & 0xff), 0x5, 8); // 846ab0: cmp al, 5
        if (!R.zf) { pc = 13; continue; } // 846ab2: jne 0x846aba
        pc = 12; continue;
      case 12: // 846ab4
        R.edi = (R.logic((R.edi >>> 0) ^ (R.edi >>> 0), 32)) | 0; // 846ab4: xor edi, edi
        R.m.w32(((R.esp + 0x30) | 0) >>> 0, (R.edi >>> 0)); // 846ab6: mov dword ptr [esp + 0x30], edi
        pc = 13; continue;
      case 13: // 846aba
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 846aba: mov ecx, dword ptr [0xae1050]
        R.push((R.edi >>> 0)); // 846ac0: push edi
        R.push((R.esi >>> 0)); // 846ac1: push esi
        R.call(0x4cf5f0, { n: 2, thisEcx: true, calleeClean: true }); // 846ac2: call 0x4cf5f0
        R.sub((R.eax >>> 0), (R.ebx >>> 0), 32); // 846ac7: cmp eax, ebx
        R.m.w32(((R.esp + 0x3c) | 0) >>> 0, (R.eax >>> 0)); // 846ac9: mov dword ptr [esp + 0x3c], eax
        if (R.zf) { pc = 15; continue; } // 846acd: je 0x846ad8
        pc = 14; continue;
      case 14: // 846acf
        R.ecx = (R.m.u32(((R.eax + 0x45) | 0) >>> 0)) | 0; // 846acf: mov ecx, dword ptr [eax + 0x45]
        R.m.w32(((R.esp + 0x64) | 0) >>> 0, (R.ecx >>> 0)); // 846ad2: mov dword ptr [esp + 0x64], ecx
        pc = 16; continue; // 846ad6: jmp 0x846adc
      case 15: // 846ad8
        R.m.w32(((R.esp + 0x64) | 0) >>> 0, (R.ebx >>> 0)); // 846ad8: mov dword ptr [esp + 0x64], ebx
        pc = 16; continue;
      case 16: // 846adc
        R.eax = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 846adc: mov eax, dword ptr [ebp + 0xc]
        R.sub((R.eax >>> 0), (R.ebx >>> 0), 32); // 846adf: cmp eax, ebx
        if (R.zf) { pc = 30; continue; } // 846ae1: je 0x846c0f
        pc = 17; continue;
      case 17: // 846ae7
        R.edx = (R.m.u32(((R.esp + 0x30) | 0) >>> 0)) | 0; // 846ae7: mov edx, dword ptr [esp + 0x30]
        R.sub((R.eax >>> 0), (R.edx >>> 0), 32); // 846aeb: cmp eax, edx
        if (!R.zf) { pc = 31; continue; } // 846aed: jne 0x846c1e
        pc = 18; continue;
      case 18: // 846af3
        R.eax = (R.m.u32(((R.esp + 0x3c) | 0) >>> 0)) | 0; // 846af3: mov eax, dword ptr [esp + 0x3c]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 846af7: test eax, eax
        if (R.zf) { pc = 30; continue; } // 846af9: je 0x846c0f
        pc = 19; continue;
      default: return pc;
    }
  }
}
function f_846920_3(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 19: // 846aff
        R.eax = (R.m.u32(((0xae2c94) | 0) >>> 0)) | 0; // 846aff: mov eax, dword ptr [0xae2c94]
        R.ecx = (R.m.u32(((0xae2c90) | 0) >>> 0)) | 0; // 846b04: mov ecx, dword ptr [0xae2c90]
        R.edx = (R.m.u32(((R.esp + 0x3c) | 0) >>> 0)) | 0; // 846b0a: mov edx, dword ptr [esp + 0x3c]
        R.push((R.eax >>> 0)); // 846b0e: push eax
        R.push((R.ecx >>> 0)); // 846b0f: push ecx
        R.ecx = (((R.edx + 0x2d) | 0)) | 0; // 846b10: lea ecx, [edx + 0x2d]
        R.call(0x54cdb0, { n: 2, thisEcx: true, calleeClean: true }); // 846b13: call 0x54cdb0
        R.esi = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 846b18: mov esi, dword ptr [ebp + 8]
        R.ecx = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 846b1b: mov ecx, dword ptr [ebp + 0xc]
        R.m.w32(((R.esp + 0x44) | 0) >>> 0, (R.eax >>> 0)); // 846b1e: mov dword ptr [esp + 0x44], eax
        R.eax = (R.m.u32(((R.esi + 0x61) | 0) >>> 0)) | 0; // 846b22: mov eax, dword ptr [esi + 0x61]
        R.edx = (((R.m.u16(((R.ecx + 0x80) | 0) >>> 0)) << 16 >> 16)) | 0; // 846b25: movsx edx, word ptr [ecx + 0x80]
        R.edi = (((R.m.u16(((R.eax + 0xb) | 0) >>> 0)) << 16 >> 16)) | 0; // 846b2c: movsx edi, word ptr [eax + 0xb]
        R.edx = (R.sub((R.edx >>> 0), (R.edi >>> 0), 32)) | 0; // 846b30: sub edx, edi
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.edx >>> 0)); // 846b32: mov dword ptr [esp + 0x1c], edx
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 846b36: fild dword ptr [esp + 0x1c]
        R.st[0] = R.st[0] * 0.5; // 846b3a: fmul qword ptr [0x968968]
        R.ftol(); // 846b40: call 0x945640
        R.ebx = (R.m.u32(((R.esp + 0x64) | 0) >>> 0)) | 0; // 846b45: mov ebx, dword ptr [esp + 0x64]
        R.ecx = ((R.eax >>> 0)) | 0; // 846b49: mov ecx, eax
        R.logic(((R.ebx >>> 0) & 0xff) & 0x10, 8); // 846b4b: test bl, 0x10
        if (R.zf) { pc = 21; continue; } // 846b4e: je 0x846b68
        pc = 20; continue;
      case 20: // 846b50
        R.eax = (((((R.ecx >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 846b50: movsx eax, cx
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.eax >>> 0)); // 846b53: mov dword ptr [esp + 0x1c], eax
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 846b57: fild dword ptr [esp + 0x1c]
        R.st[0] = R.st[0] * 0.5; // 846b5b: fmul qword ptr [0x968968]
        R.ftol(); // 846b61: call 0x945640
        R.ecx = ((R.eax >>> 0)) | 0; // 846b66: mov ecx, eax
        pc = 21; continue;
      case 21: // 846b68
        R.logic(((R.ecx >>> 0) & 0xffff) & ((R.ecx >>> 0) & 0xffff), 16); // 846b68: test cx, cx
        if (!R.cL) { pc = 23; continue; } // 846b6b: jge 0x846b71
        pc = 22; continue;
      case 22: // 846b6d
        R.ecx = (R.logic((R.ecx >>> 0) ^ (R.ecx >>> 0), 32)) | 0; // 846b6d: xor ecx, ecx
        pc = 25; continue; // 846b6f: jmp 0x846b96
      case 23: // 846b71
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.esi + 0x59) | 0) >>> 0)) & 0xff) << 0)) | 0; // 846b71: mov dl, byte ptr [esi + 0x59]
        R.eax = (((((R.edx >>> 0) & 0xff)) << 24 >> 24)) | 0; // 846b74: movsx eax, dl
        R.esi = (((((R.ecx >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 846b77: movsx esi, cx
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 846b7a: lea eax, [eax + eax*4]
        R.eax = (((R.eax + R.eax + 0x465) | 0)) | 0; // 846b7d: lea eax, [eax + eax + 0x465]
        R.sub((R.esi >>> 0), (R.eax >>> 0), 32); // 846b84: cmp esi, eax
        if (R.cLE) { pc = 25; continue; } // 846b86: jle 0x846b96
        pc = 24; continue;
      case 24: // 846b88
        R.eax = ((R.eax & 0xffff0000) | (((((((R.edx >>> 0) & 0xff)) << 24 >> 24)) & 0xffff) << 0)) | 0; // 846b88: movsx ax, dl
        R.ecx = (((R.eax + R.eax * 4) | 0)) | 0; // 846b8c: lea ecx, [eax + eax*4]
        R.ecx = (((R.ecx + R.ecx + 0x465) | 0)) | 0; // 846b8f: lea ecx, [ecx + ecx + 0x465]
        pc = 25; continue;
      case 25: // 846b96
        R.logic((R.ebx >>> 0) & 0x161a8, 32); // 846b96: test ebx, 0x161a8
        if (!R.zf) { pc = 30; continue; } // 846b9c: jne 0x846c0f
        pc = 26; continue;
      default: return pc;
    }
  }
}
function f_846920_4(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 26: // 846b9e
        R.edx = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 846b9e: mov edx, dword ptr [ebp + 8]
        R.ebx = (0x23) | 0; // 846ba1: mov ebx, 0x23
        R.esi = (R.m.u32(((R.edx) | 0) >>> 0)) | 0; // 846ba6: mov esi, dword ptr [edx]
        R.eax = ((R.esi >>> 0)) | 0; // 846ba8: mov eax, esi
        R.edx = R.eax < 0 ? -1 : 0; // 846baa: cdq 
        { const n = (BigInt(R.edx | 0) << 32n) | BigInt(R.eax >>> 0); const d = BigInt((((R.ebx >>> 0)) | 0)); const q = n / d, r = n % d; R.eax = Number(BigInt.asIntN(32, q)); R.edx = Number(BigInt.asIntN(32, r)); } // 846bab: idiv ebx
        R.eax = (R.m.u32(((R.esp + 0x44) | 0) >>> 0)) | 0; // 846bad: mov eax, dword ptr [esp + 0x44]
        R.edx = (R.add((R.edx >>> 0), 0x14, 32)) | 0; // 846bb1: add edx, 0x14
        R.sub((R.eax >>> 0), (R.edx >>> 0), 32); // 846bb4: cmp eax, edx
        if (!R.cL) { pc = 30; continue; } // 846bb6: jge 0x846c0f
        pc = 27; continue;
      case 27: // 846bb8
        R.edx = (R.m.u32(((0xae2d0c) | 0) >>> 0)) | 0; // 846bb8: mov edx, dword ptr [0xae2d0c]
        R.eax = (((R.esi + R.esi * 4) | 0)) | 0; // 846bbe: lea eax, [esi + esi*4]
        R.eax = (R.shl((R.eax >>> 0), 0x4, 32)) | 0; // 846bc1: shl eax, 4
        R.eax = (R.sub((R.eax >>> 0), (R.esi >>> 0), 32)) | 0; // 846bc4: sub eax, esi
        R.logic(R.m.u8(((R.eax + R.edx + 0xb) | 0) >>> 0) & 0xf, 8); // 846bc6: test byte ptr [eax + edx + 0xb], 0xf
        if (!R.zf) { pc = 30; continue; } // 846bcb: jne 0x846c0f
        pc = 28; continue;
      case 28: // 846bcd
        R.edx = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 846bcd: mov edx, dword ptr [ebp + 8]
        R.eax = (((R.m.u8(((R.edx + 0x59) | 0) >>> 0)) << 24 >> 24)) | 0; // 846bd0: movsx eax, byte ptr [edx + 0x59]
        R.eax = (R.add((R.eax >>> 0), 0xaa, 32)) | 0; // 846bd4: add eax, 0xaa
        R.esi = (((R.eax + R.eax * 2) | 0)) | 0; // 846bd9: lea esi, [eax + eax*2]
        R.esi = (((R.eax + R.esi * 8) | 0)) | 0; // 846bdc: lea esi, [eax + esi*8]
        R.eax = (((((R.ecx >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 846bdf: movsx eax, cx
        R.esi = (R.add((R.esi >>> 0), (R.eax >>> 0), 32)) | 0; // 846be2: add esi, eax
        R.eax = (((R.m.u8(((R.edx + 0x57) | 0) >>> 0)) << 24 >> 24)) | 0; // 846be4: movsx eax, byte ptr [edx + 0x57]
        R.ecx = (((R.eax + R.eax * 4) | 0)) | 0; // 846be8: lea ecx, [eax + eax*4]
        R.edx = (((R.edi + R.ecx * 4) | 0)) | 0; // 846beb: lea edx, [edi + ecx*4]
        R.sub((R.edx >>> 0), (R.esi >>> 0), 32); // 846bee: cmp edx, esi
        if (!R.cL) { pc = 30; continue; } // 846bf0: jge 0x846c0f
        pc = 29; continue;
      case 29: // 846bf2
        R.fpush(3.5); // 846bf2: fld qword ptr [0x968e38]
        R.ecx = (R.m.u32(((R.esp + 0xf0) | 0) >>> 0)) | 0; // 846bf8: mov ecx, dword ptr [esp + 0xf0]
        /* fs */ // 846bff: mov dword ptr fs:[0], ecx
        R.edi = (R.pop()) | 0; // 846c06: pop edi
        R.esi = (R.pop()) | 0; // 846c07: pop esi
        R.ebx = (R.pop()) | 0; // 846c08: pop ebx
        R.esp = ((R.ebp >>> 0)) | 0; // 846c09: mov esp, ebp
        R.ebp = (R.pop()) | 0; // 846c0b: pop ebp
        R.rv = R.st[0]; return -1; // 846c0c: ret 0x18
      case 30: // 846c0f
        R.eax = (R.m.u32(((R.esp + 0x30) | 0) >>> 0)) | 0; // 846c0f: mov eax, dword ptr [esp + 0x30]
        R.ecx = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 846c13: mov ecx, dword ptr [ebp + 0xc]
        R.sub((R.ecx >>> 0), (R.eax >>> 0), 32); // 846c16: cmp ecx, eax
        if (R.zf) { pc = 65; continue; } // 846c18: je 0x846e34
        pc = 31; continue;
      case 31: // 846c1e
        R.esi = (R.m.u32(((R.esp + 0x3c) | 0) >>> 0)) | 0; // 846c1e: mov esi, dword ptr [esp + 0x3c]
        R.edi = (R.m.u32(((R.esp + 0x30) | 0) >>> 0)) | 0; // 846c22: mov edi, dword ptr [esp + 0x30]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 846c26: test esi, esi
        if (R.zf) { pc = 37; continue; } // 846c28: je 0x846c50
        pc = 32; continue;
      case 32: // 846c2a
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 846c2a: test edi, edi
        if (R.zf) { pc = 37; continue; } // 846c2c: je 0x846c50
        pc = 33; continue;
      default: return pc;
    }
  }
}
function f_846920_5(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 33: // 846c2e
        R.ecx = (R.m.u32(((R.edi + 0x53) | 0) >>> 0)) | 0; // 846c2e: mov ecx, dword ptr [edi + 0x53]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 846c31: test ecx, ecx
        if (R.zf) { pc = 37; continue; } // 846c33: je 0x846c50
        pc = 34; continue;
      case 34: // 846c35
        R.edx = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 846c35: mov edx, dword ptr [ebp + 0xc]
        R.eax = (R.m.u32(((R.edx + 0x53) | 0) >>> 0)) | 0; // 846c38: mov eax, dword ptr [edx + 0x53]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 846c3b: test eax, eax
        if (R.zf) { pc = 37; continue; } // 846c3d: je 0x846c50
        pc = 35; continue;
      case 35: // 846c3f
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.eax + 0x77) | 0) >>> 0)) & 0xff) << 0)) | 0; // 846c3f: mov al, byte ptr [eax + 0x77]
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.ecx + 0x77) | 0) >>> 0)) & 0xff) << 0)) | 0; // 846c42: mov dl, byte ptr [ecx + 0x77]
        R.sub(((R.eax >>> 0) & 0xff), ((R.edx >>> 0) & 0xff), 8); // 846c45: cmp al, dl
        if (!R.zf) { pc = 37; continue; } // 846c47: jne 0x846c50
        pc = 36; continue;
      case 36: // 846c49
        R.logic(R.m.u8(((R.esp + 0x64) | 0) >>> 0) & 0x20, 8); // 846c49: test byte ptr [esp + 0x64], 0x20
        if (!R.zf) { pc = 39; continue; } // 846c4e: jne 0x846c70
        pc = 37; continue;
      case 37: // 846c50
        R.sub(R.m.u8(((R.esp + 0x1b) | 0) >>> 0), 0x10, 8); // 846c50: cmp byte ptr [esp + 0x1b], 0x10
        if (!R.cL) { pc = 40; continue; } // 846c55: jge 0x846c8d
        pc = 38; continue;
      case 38: // 846c57
        R.ecx = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 846c57: mov ecx, dword ptr [ebp + 0xc]
        R.ebx = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 846c5a: mov ebx, dword ptr [ebp + 8]
        R.push(0x1); // 846c5d: push 1
        R.edx = (R.m.u32(((R.ecx + 0x53) | 0) >>> 0)) | 0; // 846c5f: mov edx, dword ptr [ecx + 0x53]
        R.push((R.edx >>> 0)); // 846c62: push edx
        R.push((R.ebx >>> 0)); // 846c63: push ebx
        R.call(0x53d980, { n: 3, thisEcx: false, calleeClean: false }); // 846c64: call 0x53d980
        R.esp = (R.add((R.esp >>> 0), 0xc, 32)) | 0; // 846c69: add esp, 0xc
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 846c6c: test eax, eax
        if (R.zf) { pc = 41; continue; } // 846c6e: je 0x846c90
        pc = 39; continue;
      case 39: // 846c70
        R.fpush(0.0); // 846c70: fld qword ptr [0x9689a0]
        R.ecx = (R.m.u32(((R.esp + 0xf0) | 0) >>> 0)) | 0; // 846c76: mov ecx, dword ptr [esp + 0xf0]
        /* fs */ // 846c7d: mov dword ptr fs:[0], ecx
        R.edi = (R.pop()) | 0; // 846c84: pop edi
        R.esi = (R.pop()) | 0; // 846c85: pop esi
        R.ebx = (R.pop()) | 0; // 846c86: pop ebx
        R.esp = ((R.ebp >>> 0)) | 0; // 846c87: mov esp, ebp
        R.ebp = (R.pop()) | 0; // 846c89: pop ebp
        R.rv = R.st[0]; return -1; // 846c8a: ret 0x18
      case 40: // 846c8d
        R.ebx = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 846c8d: mov ebx, dword ptr [ebp + 8]
        pc = 41; continue;
      case 41: // 846c90
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 846c90: test esi, esi
        R.m.w32(((R.esp + 0xc) | 0) >>> 0, 0x0); // 846c92: mov dword ptr [esp + 0xc], 0
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, 0x40060000); // 846c9a: mov dword ptr [esp + 0x10], 0x40060000
        if (R.zf) { pc = 47; continue; } // 846ca2: je 0x846d36
        pc = 42; continue;
      default: return pc;
    }
  }
}
function f_846920_6(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 42: // 846ca8
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi + 0x49) | 0) >>> 0)) & 0xff) << 0)) | 0; // 846ca8: mov al, byte ptr [esi + 0x49]
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 846cab: test al, al
        if (R.zf) { pc = 47; continue; } // 846cad: je 0x846d36
        pc = 43; continue;
      case 43: // 846cb3
        R.ecx = (R.m.u32(((R.esp + 0x3c) | 0) >>> 0)) | 0; // 846cb3: mov ecx, dword ptr [esp + 0x3c]
        R.edx = (R.logic((R.edx >>> 0) ^ (R.edx >>> 0), 32)) | 0; // 846cb7: xor edx, edx
        R.edx = ((R.edx & 0xffff0000) | (((R.m.u16(((0xae2c92) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 846cb9: mov dx, word ptr [0xae2c92]
        R.esi = (R.m.u32(((R.ebp + 0x1c) | 0) >>> 0)) | 0; // 846cc0: mov esi, dword ptr [ebp + 0x1c]
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.ecx + 0x2f) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 846cc3: mov ax, word ptr [ecx + 0x2f]
        R.ecx = ((R.ecx & 0xffff0000) | (((R.m.u16(((R.ecx + 0x2d) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 846cc7: mov cx, word ptr [ecx + 0x2d]
        R.eax = (R.logic((R.eax >>> 0) & 0xffff, 32)) | 0; // 846ccb: and eax, 0xffff
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 846cd0: sub eax, edx
        R.ecx = (((((R.ecx >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 846cd2: movsx ecx, cx
        R.edx = (((R.eax + R.eax * 8) | 0)) | 0; // 846cd5: lea edx, [eax + eax*8]
        R.eax = (((R.eax + R.edx * 8) | 0)) | 0; // 846cd8: lea eax, [eax + edx*8]
        R.edx = (((R.m.u16(((0xae2c90) | 0) >>> 0)) << 16 >> 16)) | 0; // 846cdb: movsx edx, word ptr [0xae2c90]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 846ce2: lea eax, [eax + eax*4]
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 846ce5: sub eax, edx
        R.eax = (R.add((R.eax >>> 0), (R.ecx >>> 0), 32)) | 0; // 846ce7: add eax, ecx
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.eax >>> 0)); // 846ce9: mov dword ptr [esp + 0x1c], eax
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 846ced: fild dword ptr [esp + 0x1c]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 846cf1: test esi, esi
        R.st[0] = R.st[0] * 0.002; // 846cf3: fmul qword ptr [0x969048]
        R.st[0] = 1.1 - R.st[0]; // 846cf9: fsubr qword ptr [0x9689c0]
        if (R.zf) { pc = 46; continue; } // 846cff: je 0x846d2a
        pc = 44; continue;
      case 44: // 846d01
        R.edx = (((R.m.u8(((R.ebx + 0x5a) | 0) >>> 0)) << 24 >> 24)) | 0; // 846d01: movsx edx, byte ptr [ebx + 0x5a]
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.edx >>> 0)); // 846d05: mov dword ptr [esp + 0x1c], edx
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 846d09: fild dword ptr [esp + 0x1c]
        R.st[0] = R.st[0] * 0.02; // 846d0d: fmul qword ptr [0x968a98]
        R.st[0] = R.st[0] + 0.6; // 846d13: fadd qword ptr [0x968e48]
        R.fpush(R.st[1]); // 846d19: fld st(1)
        R.fcom(R.st[0], R.st[1]); R.fpop(); R.fpop(); // 846d1b: fcompp 
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 846d1d: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 846d1f: test ah, 1
        if (R.zf) { pc = 46; continue; } // 846d22: je 0x846d2a
        pc = 45; continue;
      case 45: // 846d24
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 846d24: mov eax, dword ptr [esi]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) | 0x1, 8)) & 0xff) << 0)) | 0; // 846d26: or al, 1
        R.m.w32(((R.esi) | 0) >>> 0, (R.eax >>> 0)); // 846d28: mov dword ptr [esi], eax
        pc = 46; continue;
      case 46: // 846d2a
        R.st[0] = R.st[0] * 2.75; // 846d2a: fmul qword ptr [0x9690a8]
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 846d30: fstp qword ptr [esp + 0xc]
        pc = 52; continue; // 846d34: jmp 0x846da0
      case 47: // 846d36
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 846d36: test edi, edi
        if (!R.zf) { pc = 51; continue; } // 846d38: jne 0x846d9d
        pc = 48; continue;
      default: return pc;
    }
  }
}
function f_846920_7(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 48: // 846d3a
        R.ecx = ((R.ecx & 0xffff0000) | (((R.m.u16(((R.ebx + 0x40) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 846d3a: mov cx, word ptr [ebx + 0x40]
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 846d3e: xor eax, eax
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((0xae2c92) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 846d40: mov ax, word ptr [0xae2c92]
        R.edx = ((R.edx & 0xffff0000) | (((R.m.u16(((R.ebx + 0x3e) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 846d46: mov dx, word ptr [ebx + 0x3e]
        R.ecx = (R.logic((R.ecx >>> 0) & 0xffff, 32)) | 0; // 846d4a: and ecx, 0xffff
        R.eax = (R.sub((R.eax >>> 0), (R.ecx >>> 0), 32)) | 0; // 846d50: sub eax, ecx
        R.edx = (((((R.edx >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 846d52: movsx edx, dx
        R.ecx = (((R.eax + R.eax * 8) | 0)) | 0; // 846d55: lea ecx, [eax + eax*8]
        R.eax = (((R.eax + R.ecx * 8) | 0)) | 0; // 846d58: lea eax, [eax + ecx*8]
        R.ecx = (((R.m.u16(((0xae2c90) | 0) >>> 0)) << 16 >> 16)) | 0; // 846d5b: movsx ecx, word ptr [0xae2c90]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 846d62: lea eax, [eax + eax*4]
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 846d65: sub eax, edx
        R.eax = (R.add((R.eax >>> 0), (R.ecx >>> 0), 32)) | 0; // 846d67: add eax, ecx
        R.edx = ((R.eax >>> 0)) | 0; // 846d69: mov edx, eax
        { const p = BigInt((((R.eax >>> 0)) | 0)) * BigInt((((R.edx >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.edx = (Number(BigInt.asIntN(32, p))) | 0; } // 846d6b: imul edx, eax
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.edx >>> 0)); // 846d6e: mov dword ptr [esp + 0x1c], edx
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 846d72: fild dword ptr [esp + 0x1c]
        R.st[0] = R.st[0] * 0.0011111111111111111; // 846d76: fmul qword ptr [0x96f9b8]
        R.fpush(12.0); // 846d7c: fld qword ptr [0x96d6a0]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 846d82: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 846d84: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 846d86: test ah, 1
        if (R.zf) { pc = 50; continue; } // 846d89: je 0x846d93
        pc = 49; continue;
      case 49: // 846d8b
        R.fpop(); // 846d8b: fstp st(0)
        R.fpush(12.0); // 846d8d: fld qword ptr [0x96d6a0]
        pc = 50; continue;
      case 50: // 846d93
        R.st[0] = R.st[0] + 2.75; // 846d93: fadd qword ptr [0x9690a8]
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 846d99: fstp qword ptr [esp + 0xc]
        pc = 51; continue;
      case 51: // 846d9d
        R.esi = (R.m.u32(((R.ebp + 0x1c) | 0) >>> 0)) | 0; // 846d9d: mov esi, dword ptr [ebp + 0x1c]
        pc = 52; continue;
      case 52: // 846da0
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ebp + 0x14) | 0) >>> 0)) & 0xff) << 0)) | 0; // 846da0: mov al, byte ptr [ebp + 0x14]
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 846da3: test al, al
        if (R.zf) { pc = 89; continue; } // 846da5: je 0x846f18
        pc = 53; continue;
      case 53: // 846dab
        R.edx = (R.m.u32(((R.ebx + 0x61) | 0) >>> 0)) | 0; // 846dab: mov edx, dword ptr [ebx + 0x61]
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 846dae: test edx, edx
        if (R.zf) { pc = 89; continue; } // 846db0: je 0x846f18
        pc = 54; continue;
      case 54: // 846db6
        R.sub(R.m.u16(((R.edx + 0xd) | 0) >>> 0), 0x128e, 16); // 846db6: cmp word ptr [edx + 0xd], 0x128e
        if (!R.cL) { pc = 89; continue; } // 846dbc: jge 0x846f18
        pc = 55; continue;
      case 55: // 846dc2
        R.ecx = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 846dc2: mov ecx, dword ptr [ebp + 0xc]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 846dc5: test ecx, ecx
        if (R.zf) { pc = 89; continue; } // 846dc7: je 0x846f18
        pc = 56; continue;
      case 56: // 846dcd
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 846dcd: test edi, edi
        if (R.zf) { pc = 89; continue; } // 846dcf: je 0x846f18
        pc = 57; continue;
      default: return pc;
    }
  }
}
function f_846920_8(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 57: // 846dd5
        R.sub((R.ecx >>> 0), (R.edi >>> 0), 32); // 846dd5: cmp ecx, edi
        if (R.zf) { pc = 89; continue; } // 846dd7: je 0x846f18
        pc = 58; continue;
      case 58: // 846ddd
        R.logic(R.m.u8(((R.esp + 0x64) | 0) >>> 0) & 0x10, 8); // 846ddd: test byte ptr [esp + 0x64], 0x10
        if (R.zf) { pc = 89; continue; } // 846de2: je 0x846f18
        pc = 59; continue;
      case 59: // 846de8
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.ecx + 0x80) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 846de8: mov ax, word ptr [ecx + 0x80]
        R.sub(((R.eax >>> 0) & 0xffff), R.m.u16(((R.edi + 0x80) | 0) >>> 0), 16); // 846def: cmp ax, word ptr [edi + 0x80]
        if (R.cLE) { pc = 70; continue; } // 846df6: jle 0x846e6f
        pc = 60; continue;
      case 60: // 846df8
        R.ecx = (R.m.u32(((R.ecx + 0x53) | 0) >>> 0)) | 0; // 846df8: mov ecx, dword ptr [ecx + 0x53]
        R.sub((R.ecx >>> 0), R.m.u32(((R.edi + 0x53) | 0) >>> 0), 32); // 846dfb: cmp ecx, dword ptr [edi + 0x53]
        if (R.zf) { pc = 62; continue; } // 846dfe: je 0x846e06
        pc = 61; continue;
      case 61: // 846e00
        R.sub(((R.eax >>> 0) & 0xffff), 0x1676, 16); // 846e00: cmp ax, 0x1676
        if (R.cLE) { pc = 69; continue; } // 846e04: jle 0x846e6c
        pc = 62; continue;
      case 62: // 846e06
        R.sub(R.m.u16(((R.edx + 0xb) | 0) >>> 0), 0x1c52, 16); // 846e06: cmp word ptr [edx + 0xb], 0x1c52
        if (!R.cLE) { pc = 86; continue; } // 846e0c: jg 0x846efe
        pc = 63; continue;
      case 63: // 846e12
        R.push(0x0); // 846e12: push 0
        R.push((R.ebx >>> 0)); // 846e14: push ebx
        R.call(0x544590, { n: 2, thisEcx: false, calleeClean: false }); // 846e15: call 0x544590
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 846e1a: add esp, 8
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 846e1d: test eax, eax
        if (R.zf) { pc = 86; continue; } // 846e1f: je 0x846efe
        pc = 64; continue;
      case 64: // 846e25
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 846e25: fld qword ptr [esp + 0xc]
        R.st[0] = R.st[0] * 1.5; // 846e29: fmul qword ptr [0x968940]
        pc = 88; continue; // 846e2f: jmp 0x846f14
      case 65: // 846e34
        R.eax = (R.m.u32(((R.esp + 0x3c) | 0) >>> 0)) | 0; // 846e34: mov eax, dword ptr [esp + 0x3c]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 846e38: test eax, eax
        if (R.zf) { pc = 68; continue; } // 846e3a: je 0x846e4d
        pc = 66; continue;
      case 66: // 846e3c
        R.eax = (R.m.u32(((R.esp + 0x64) | 0) >>> 0)) | 0; // 846e3c: mov eax, dword ptr [esp + 0x64]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 846e40: test eax, eax
        if (R.zf) { pc = 68; continue; } // 846e42: je 0x846e4d
        pc = 67; continue;
      case 67: // 846e44
        R.sub((R.eax >>> 0), 0x2, 32); // 846e44: cmp eax, 2
        if (!R.zf) { pc = 39; continue; } // 846e47: jne 0x846c70
        pc = 68; continue;
      case 68: // 846e4d
        R.edi = (R.m.u32(((R.esp + 0x30) | 0) >>> 0)) | 0; // 846e4d: mov edi, dword ptr [esp + 0x30]
        R.esi = (R.m.u32(((R.ebp + 0x1c) | 0) >>> 0)) | 0; // 846e51: mov esi, dword ptr [ebp + 0x1c]
        R.ebx = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 846e54: mov ebx, dword ptr [ebp + 8]
        R.m.w32(((R.esp + 0xc) | 0) >>> 0, 0x0); // 846e57: mov dword ptr [esp + 0xc], 0
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, 0x400c0000); // 846e5f: mov dword ptr [esp + 0x10], 0x400c0000
        pc = 52; continue; // 846e67: jmp 0x846da0
      default: return pc;
    }
  }
}
function f_846920_9(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 69: // 846e6c
        R.ecx = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 846e6c: mov ecx, dword ptr [ebp + 0xc]
        pc = 70; continue;
      case 70: // 846e6f
        R.sub(((R.eax >>> 0) & 0xffff), 0xabe, 16); // 846e6f: cmp ax, 0xabe
        if (R.cLE) { pc = 79; continue; } // 846e73: jle 0x846ebd
        pc = 71; continue;
      case 71: // 846e75
        R.ecx = (R.m.u32(((R.ecx + 0x53) | 0) >>> 0)) | 0; // 846e75: mov ecx, dword ptr [ecx + 0x53]
        R.sub((R.ecx >>> 0), R.m.u32(((R.edi + 0x53) | 0) >>> 0), 32); // 846e78: cmp ecx, dword ptr [edi + 0x53]
        if (R.zf) { pc = 73; continue; } // 846e7b: je 0x846e83
        pc = 72; continue;
      case 72: // 846e7d
        R.sub(((R.eax >>> 0) & 0xffff), 0x1676, 16); // 846e7d: cmp ax, 0x1676
        if (R.cLE) { pc = 78; continue; } // 846e81: jle 0x846eba
        pc = 73; continue;
      case 73: // 846e83
        R.ecx = ((R.ecx & 0xffff0000) | (((R.m.u16(((R.edx + 0xb) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 846e83: mov cx, word ptr [edx + 0xb]
        R.sub(((R.eax >>> 0) & 0xffff), ((R.ecx >>> 0) & 0xffff), 16); // 846e87: cmp ax, cx
        if (R.cLE) { pc = 78; continue; } // 846e8a: jle 0x846eba
        pc = 74; continue;
      case 74: // 846e8c
        R.sub(((R.ecx >>> 0) & 0xffff), 0x1c52, 16); // 846e8c: cmp cx, 0x1c52
        if (!R.cLE) { pc = 77; continue; } // 846e91: jg 0x846eae
        pc = 75; continue;
      case 75: // 846e93
        R.push(0x0); // 846e93: push 0
        R.push((R.ebx >>> 0)); // 846e95: push ebx
        R.call(0x544590, { n: 2, thisEcx: false, calleeClean: false }); // 846e96: call 0x544590
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 846e9b: add esp, 8
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 846e9e: test eax, eax
        if (R.zf) { pc = 77; continue; } // 846ea0: je 0x846eae
        pc = 76; continue;
      case 76: // 846ea2
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 846ea2: fld qword ptr [esp + 0xc]
        R.st[0] = R.st[0] * 1.35; // 846ea6: fmul qword ptr [0x969588]
        pc = 88; continue; // 846eac: jmp 0x846f14
      case 77: // 846eae
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 846eae: fld qword ptr [esp + 0xc]
        R.st[0] = R.st[0] * 1.15; // 846eb2: fmul qword ptr [0x968980]
        pc = 88; continue; // 846eb8: jmp 0x846f14
      case 78: // 846eba
        R.ecx = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 846eba: mov ecx, dword ptr [ebp + 0xc]
        pc = 79; continue;
      case 79: // 846ebd
        R.sub(((R.eax >>> 0) & 0xffff), 0x109a, 16); // 846ebd: cmp ax, 0x109a
        if (R.cLE) { pc = 89; continue; } // 846ec1: jle 0x846f18
        pc = 80; continue;
      case 80: // 846ec3
        R.ecx = (R.m.u32(((R.ecx + 0x53) | 0) >>> 0)) | 0; // 846ec3: mov ecx, dword ptr [ecx + 0x53]
        R.sub((R.ecx >>> 0), R.m.u32(((R.edi + 0x53) | 0) >>> 0), 32); // 846ec6: cmp ecx, dword ptr [edi + 0x53]
        if (!R.zf) { pc = 89; continue; } // 846ec9: jne 0x846f18
        pc = 81; continue;
      case 81: // 846ecb
        R.ecx = ((R.ecx & 0xffff0000) | (((R.m.u16(((R.edx + 0xb) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 846ecb: mov cx, word ptr [edx + 0xb]
        R.sub(((R.ecx >>> 0) & 0xffff), 0x186a, 16); // 846ecf: cmp cx, 0x186a
        if (R.cLE) { pc = 84; continue; } // 846ed4: jle 0x846ee8
        pc = 82; continue;
      default: return pc;
    }
  }
}
function f_846920_10(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 82: // 846ed6
        R.sub(((R.eax >>> 0) & 0xffff), 0x1482, 16); // 846ed6: cmp ax, 0x1482
        if (!R.cL) { pc = 84; continue; } // 846eda: jge 0x846ee8
        pc = 83; continue;
      case 83: // 846edc
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 846edc: fld qword ptr [esp + 0xc]
        R.st[0] = R.st[0] * 1.025; // 846ee0: fmul qword ptr [0x968fa0]
        pc = 88; continue; // 846ee6: jmp 0x846f14
      case 84: // 846ee8
        R.sub(((R.ecx >>> 0) & 0xffff), 0x1c52, 16); // 846ee8: cmp cx, 0x1c52
        if (!R.cLE) { pc = 87; continue; } // 846eed: jg 0x846f0a
        pc = 85; continue;
      case 85: // 846eef
        R.push(0x0); // 846eef: push 0
        R.push((R.ebx >>> 0)); // 846ef1: push ebx
        R.call(0x544590, { n: 2, thisEcx: false, calleeClean: false }); // 846ef2: call 0x544590
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 846ef7: add esp, 8
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 846efa: test eax, eax
        if (R.zf) { pc = 87; continue; } // 846efc: je 0x846f0a
        pc = 86; continue;
      case 86: // 846efe
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 846efe: fld qword ptr [esp + 0xc]
        R.st[0] = R.st[0] * 1.25; // 846f02: fmul qword ptr [0x968928]
        pc = 88; continue; // 846f08: jmp 0x846f14
      case 87: // 846f0a
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 846f0a: fld qword ptr [esp + 0xc]
        R.st[0] = R.st[0] * 1.1; // 846f0e: fmul qword ptr [0x9689c0]
        pc = 88; continue;
      case 88: // 846f14
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 846f14: fstp qword ptr [esp + 0xc]
        pc = 89; continue;
      case 89: // 846f18
        R.edx = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 846f18: mov edx, dword ptr [ebp + 0xc]
        R.push((R.edx >>> 0)); // 846f1b: push edx
        R.push((R.ebx >>> 0)); // 846f1c: push ebx
        R.call(0x547d30, { n: 2, thisEcx: false, calleeClean: false }); // 846f1d: call 0x547d30
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 846f22: add esp, 8
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 846f25: test eax, eax
        if (R.zf) { pc = 92; continue; } // 846f27: je 0x846f41
        pc = 90; continue;
      case 90: // 846f29
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 846f29: fld qword ptr [esp + 0xc]
        R.st[0] = R.st[0] * 0.33; // 846f2d: fmul qword ptr [0x968f78]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 846f33: test esi, esi
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 846f35: fstp qword ptr [esp + 0xc]
        if (R.zf) { pc = 92; continue; } // 846f39: je 0x846f41
        pc = 91; continue;
      case 91: // 846f3b
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 846f3b: mov eax, dword ptr [esi]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) | 0x2, 8)) & 0xff) << 0)) | 0; // 846f3d: or al, 2
        R.m.w32(((R.esi) | 0) >>> 0, (R.eax >>> 0)); // 846f3f: mov dword ptr [esi], eax
        pc = 92; continue;
      case 92: // 846f41
        R.push((R.edi >>> 0)); // 846f41: push edi
        R.push((R.ebx >>> 0)); // 846f42: push ebx
        R.call(0x547d30, { n: 2, thisEcx: false, calleeClean: false }); // 846f43: call 0x547d30
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 846f48: add esp, 8
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 846f4b: test eax, eax
        if (R.zf) { pc = 100; continue; } // 846f4d: je 0x846f8c
        pc = 93; continue;
      default: return pc;
    }
  }
}
function f_846920_11(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 93: // 846f4f
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ebx + 0x5a) | 0) >>> 0)) & 0xff) << 0)) | 0; // 846f4f: mov al, byte ptr [ebx + 0x5a]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.ebx + 0x59) | 0) >>> 0)) & 0xff) << 0)) | 0; // 846f52: mov cl, byte ptr [ebx + 0x59]
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.ebx + 0x5b) | 0) >>> 0)) & 0xff) << 0)) | 0; // 846f55: mov dl, byte ptr [ebx + 0x5b]
        R.eax = ((R.eax & 0xffffff00) | (((R.add(((R.eax >>> 0) & 0xff), ((R.ecx >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 846f58: add al, cl
        R.eax = ((R.eax & 0xffffff00) | (((R.add(((R.eax >>> 0) & 0xff), ((R.edx >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 846f5a: add al, dl
        R.sub(((R.eax >>> 0) & 0xff), 0x2d, 8); // 846f5c: cmp al, 0x2d
        if (R.cLE) { pc = 95; continue; } // 846f5e: jle 0x846f6c
        pc = 94; continue;
      case 94: // 846f60
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 846f60: fld qword ptr [esp + 0xc]
        R.st[0] = R.st[0] * 1.25; // 846f64: fmul qword ptr [0x968928]
        pc = 98; continue; // 846f6a: jmp 0x846f7e
      case 95: // 846f6c
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 846f6c: fld qword ptr [esp + 0xc]
        R.sub(((R.eax >>> 0) & 0xff), 0x19, 8); // 846f70: cmp al, 0x19
        if (R.cLE) { pc = 97; continue; } // 846f72: jle 0x846f7c
        pc = 96; continue;
      case 96: // 846f74
        R.st[0] = R.st[0] * 1.5; // 846f74: fmul qword ptr [0x968940]
        pc = 98; continue; // 846f7a: jmp 0x846f7e
      case 97: // 846f7c
        R.st[0] = R.st[0] + R.st[0]; // 846f7c: fadd st(0), st(0)
        pc = 98; continue;
      case 98: // 846f7e
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 846f7e: fstp qword ptr [esp + 0xc]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 846f82: test esi, esi
        if (R.zf) { pc = 100; continue; } // 846f84: je 0x846f8c
        pc = 99; continue;
      case 99: // 846f86
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 846f86: mov eax, dword ptr [esi]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) | 0x4, 8)) & 0xff) << 0)) | 0; // 846f88: or al, 4
        R.m.w32(((R.esi) | 0) >>> 0, (R.eax >>> 0)); // 846f8a: mov dword ptr [esi], eax
        pc = 100; continue;
      case 100: // 846f8c
        R.push((R.edi >>> 0)); // 846f8c: push edi
        R.push((R.ebx >>> 0)); // 846f8d: push ebx
        R.call(0x547d60, { n: 2, thisEcx: false, calleeClean: false }); // 846f8e: call 0x547d60
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 846f93: add esp, 8
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 846f96: test eax, eax
        if (R.zf) { pc = 105; continue; } // 846f98: je 0x846fcb
        pc = 101; continue;
      case 101: // 846f9a
        R.push((R.edi >>> 0)); // 846f9a: push edi
        R.push((R.ebx >>> 0)); // 846f9b: push ebx
        R.call(0x544520, { n: 2, thisEcx: false, calleeClean: false }); // 846f9c: call 0x544520
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 846fa1: add esp, 8
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 846fa4: test eax, eax
        if (!R.zf) { pc = 105; continue; } // 846fa6: jne 0x846fcb
        pc = 102; continue;
      case 102: // 846fa8
        R.eax = (R.m.u32(((R.esp + 0x3c) | 0) >>> 0)) | 0; // 846fa8: mov eax, dword ptr [esp + 0x3c]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.eax + 0x49) | 0) >>> 0)) & 0xff) << 0)) | 0; // 846fac: mov cl, byte ptr [eax + 0x49]
        R.logic(((R.ecx >>> 0) & 0xff) & ((R.ecx >>> 0) & 0xff), 8); // 846faf: test cl, cl
        if (!R.zf) { pc = 105; continue; } // 846fb1: jne 0x846fcb
        pc = 103; continue;
      default: return pc;
    }
  }
}
function f_846920_12(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 103: // 846fb3
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 846fb3: fld qword ptr [esp + 0xc]
        R.st[0] = R.st[0] * 0.5; // 846fb7: fmul qword ptr [0x968968]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 846fbd: test esi, esi
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 846fbf: fstp qword ptr [esp + 0xc]
        if (R.zf) { pc = 105; continue; } // 846fc3: je 0x846fcb
        pc = 104; continue;
      case 104: // 846fc5
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 846fc5: mov eax, dword ptr [esi]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) | 0x8, 8)) & 0xff) << 0)) | 0; // 846fc7: or al, 8
        R.m.w32(((R.esi) | 0) >>> 0, (R.eax >>> 0)); // 846fc9: mov dword ptr [esi], eax
        pc = 105; continue;
      case 105: // 846fcb
        R.ecx = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 846fcb: mov ecx, dword ptr [ebp + 0xc]
        R.push((R.ecx >>> 0)); // 846fce: push ecx
        R.push((R.ebx >>> 0)); // 846fcf: push ebx
        R.call(0x547d60, { n: 2, thisEcx: false, calleeClean: false }); // 846fd0: call 0x547d60
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 846fd5: add esp, 8
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 846fd8: test eax, eax
        if (R.zf) { pc = 109; continue; } // 846fda: je 0x846ff4
        pc = 106; continue;
      case 106: // 846fdc
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 846fdc: test esi, esi
        if (R.zf) { pc = 108; continue; } // 846fde: je 0x846fe6
        pc = 107; continue;
      case 107: // 846fe0
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 846fe0: mov eax, dword ptr [esi]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) | 0x10, 8)) & 0xff) << 0)) | 0; // 846fe2: or al, 0x10
        R.m.w32(((R.esi) | 0) >>> 0, (R.eax >>> 0)); // 846fe4: mov dword ptr [esi], eax
        pc = 108; continue;
      case 108: // 846fe6
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 846fe6: fld qword ptr [esp + 0xc]
        R.st[0] = R.st[0] * 3.0; // 846fea: fmul qword ptr [0x968930]
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 846ff0: fstp qword ptr [esp + 0xc]
        pc = 109; continue;
      case 109: // 846ff4
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esp + 0x1b) | 0) >>> 0)) & 0xff) << 0)) | 0; // 846ff4: mov al, byte ptr [esp + 0x1b]
        R.sub(((R.eax >>> 0) & 0xff), 0x22, 8); // 846ff8: cmp al, 0x22
        R.eax = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 846ffa: mov eax, dword ptr [ebp + 0xc]
        if (R.cLE) { pc = 113; continue; } // 846ffd: jle 0x84701b
        pc = 110; continue;
      case 110: // 846fff
        R.sub((R.edi >>> 0), (R.eax >>> 0), 32); // 846fff: cmp edi, eax
        if (R.zf) { pc = 113; continue; } // 847001: je 0x84701b
        pc = 111; continue;
      case 111: // 847003
        R.edx = (R.m.u32(((R.eax + 0x53) | 0) >>> 0)) | 0; // 847003: mov edx, dword ptr [eax + 0x53]
        R.ecx = (R.m.u32(((R.ebx + 0x1a) | 0) >>> 0)) | 0; // 847006: mov ecx, dword ptr [ebx + 0x1a]
        R.sub((R.edx >>> 0), (R.ecx >>> 0), 32); // 847009: cmp edx, ecx
        if (R.zf) { pc = 113; continue; } // 84700b: je 0x84701b
        pc = 112; continue;
      case 112: // 84700d
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 84700d: fld qword ptr [esp + 0xc]
        R.st[0] = R.st[0] * 0.75; // 847011: fmul qword ptr [0x969040]
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 847017: fstp qword ptr [esp + 0xc]
        pc = 113; continue;
      case 113: // 84701b
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 84701b: test edi, edi
        if (R.zf) { pc = 125; continue; } // 84701d: je 0x84709d
        pc = 114; continue;
      default: return pc;
    }
  }
}
function f_846920_13(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 114: // 84701f
        R.sub((R.edi >>> 0), (R.eax >>> 0), 32); // 84701f: cmp edi, eax
        if (R.zf) { pc = 125; continue; } // 847021: je 0x84709d
        pc = 115; continue;
      case 115: // 847023
        R.eax = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 847023: mov eax, dword ptr [ebp + 0xc]
        R.ecx = (R.m.u32(((0x9d0118) | 0) >>> 0)) | 0; // 847026: mov ecx, dword ptr [0x9d0118]
        R.edx = (R.m.u32(((0x9d011c) | 0) >>> 0)) | 0; // 84702c: mov edx, dword ptr [0x9d011c]
        R.eax = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 847032: mov eax, dword ptr [eax]
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 847034: cmp eax, ecx
        if (R.zf) { pc = 117; continue; } // 847036: je 0x84703c
        pc = 116; continue;
      case 116: // 847038
        R.sub((R.eax >>> 0), (R.edx >>> 0), 32); // 847038: cmp eax, edx
        if (!R.zf) { pc = 119; continue; } // 84703a: jne 0x84704e
        pc = 117; continue;
      case 117: // 84703c
        R.eax = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 84703c: mov eax, dword ptr [edi]
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 84703e: cmp eax, ecx
        if (R.zf) { pc = 171; continue; } // 847040: je 0x8472cc
        pc = 118; continue;
      case 118: // 847046
        R.sub((R.eax >>> 0), (R.edx >>> 0), 32); // 847046: cmp eax, edx
        if (R.zf) { pc = 171; continue; } // 847048: je 0x8472cc
        pc = 119; continue;
      case 119: // 84704e
        R.ecx = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 84704e: mov ecx, dword ptr [ebp + 0xc]
        R.eax = (R.m.u32(((0x9cf2ac) | 0) >>> 0)) | 0; // 847051: mov eax, dword ptr [0x9cf2ac]
        R.edx = (R.m.u32(((R.ecx + 0x53) | 0) >>> 0)) | 0; // 847056: mov edx, dword ptr [ecx + 0x53]
        R.ecx = (R.m.u32(((0x9cf51c) | 0) >>> 0)) | 0; // 847059: mov ecx, dword ptr [0x9cf51c]
        R.edx = (R.m.u32(((R.edx) | 0) >>> 0)) | 0; // 84705f: mov edx, dword ptr [edx]
        R.sub((R.edx >>> 0), (R.ecx >>> 0), 32); // 847061: cmp edx, ecx
        if (!R.zf) { pc = 143; continue; } // 847063: jne 0x847186
        pc = 120; continue;
      case 120: // 847069
        R.ebx = (R.m.u32(((R.edi + 0x53) | 0) >>> 0)) | 0; // 847069: mov ebx, dword ptr [edi + 0x53]
        R.sub(R.m.u32(((R.ebx) | 0) >>> 0), (R.eax >>> 0), 32); // 84706c: cmp dword ptr [ebx], eax
        if (!R.zf) { pc = 142; continue; } // 84706e: jne 0x847183
        pc = 121; continue;
      case 121: // 847074
        R.ebx = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 847074: mov ebx, dword ptr [ebp + 8]
        R.ebx = (R.m.u32(((R.ebx + 0x1a) | 0) >>> 0)) | 0; // 847077: mov ebx, dword ptr [ebx + 0x1a]
        R.sub(R.m.u32(((R.ebx) | 0) >>> 0), (R.eax >>> 0), 32); // 84707a: cmp dword ptr [ebx], eax
        if (!R.zf) { pc = 142; continue; } // 84707c: jne 0x847183
        pc = 122; continue;
      case 122: // 847082
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 847082: fld qword ptr [esp + 0xc]
        R.st[0] = R.st[0] * 0.05; // 847086: fmul qword ptr [0x967888]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 84708c: test esi, esi
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 84708e: fstp qword ptr [esp + 0xc]
        if (R.zf) { pc = 124; continue; } // 847092: je 0x84709a
        pc = 123; continue;
      case 123: // 847094
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 847094: mov eax, dword ptr [esi]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) | 0x2, 8)) & 0xff) << 0)) | 0; // 847096: or al, 2
        R.m.w32(((R.esi) | 0) >>> 0, (R.eax >>> 0)); // 847098: mov dword ptr [esi], eax
        pc = 124; continue;
      case 124: // 84709a
        R.ebx = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 84709a: mov ebx, dword ptr [ebp + 8]
        pc = 125; continue;
      default: return pc;
    }
  }
}
function f_846920_14(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 125: // 84709d
        R.ecx = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 84709d: mov ecx, dword ptr [ebp + 0xc]
        R.push((R.ebx >>> 0)); // 8470a0: push ebx
        R.edx = (R.m.u32(((R.ecx + 0xcf) | 0) >>> 0)) | 0; // 8470a1: mov edx, dword ptr [ecx + 0xcf]
        R.push((R.edx >>> 0)); // 8470a7: push edx
        R.call(0x547810, { n: 2, thisEcx: false, calleeClean: false }); // 8470a8: call 0x547810
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 8470ad: add esp, 8
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8470b0: test eax, eax
        if (R.zf) { pc = 128; continue; } // 8470b2: je 0x8470c8
        pc = 126; continue;
      case 126: // 8470b4
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 8470b4: fld qword ptr [esp + 0xc]
        R.st[0] = R.st[0] + R.st[0]; // 8470b8: fadd st(0), st(0)
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 8470ba: test esi, esi
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 8470bc: fstp qword ptr [esp + 0xc]
        if (R.zf) { pc = 128; continue; } // 8470c0: je 0x8470c8
        pc = 127; continue;
      case 127: // 8470c2
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 8470c2: mov eax, dword ptr [esi]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) | 0x40, 8)) & 0xff) << 0)) | 0; // 8470c4: or al, 0x40
        R.m.w32(((R.esi) | 0) >>> 0, (R.eax >>> 0)); // 8470c6: mov dword ptr [esi], eax
        pc = 128; continue;
      case 128: // 8470c8
        R.eax = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 8470c8: mov eax, dword ptr [ebp + 0xc]
        R.push((R.ebx >>> 0)); // 8470cb: push ebx
        R.ecx = (R.m.u32(((R.eax + 0xcf) | 0) >>> 0)) | 0; // 8470cc: mov ecx, dword ptr [eax + 0xcf]
        R.push((R.ecx >>> 0)); // 8470d2: push ecx
        R.call(0x547840, { n: 2, thisEcx: false, calleeClean: false }); // 8470d3: call 0x547840
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 8470d8: add esp, 8
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8470db: test eax, eax
        if (R.zf) { pc = 131; continue; } // 8470dd: je 0x8470f7
        pc = 129; continue;
      case 129: // 8470df
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 8470df: fld qword ptr [esp + 0xc]
        R.st[0] = R.st[0] * 0.33; // 8470e3: fmul qword ptr [0x968f78]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 8470e9: test esi, esi
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 8470eb: fstp qword ptr [esp + 0xc]
        if (R.zf) { pc = 131; continue; } // 8470ef: je 0x8470f7
        pc = 130; continue;
      case 130: // 8470f1
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 8470f1: mov eax, dword ptr [esi]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) | 0x80, 8)) & 0xff) << 0)) | 0; // 8470f3: or al, 0x80
        R.m.w32(((R.esi) | 0) >>> 0, (R.eax >>> 0)); // 8470f5: mov dword ptr [esi], eax
        pc = 131; continue;
      case 131: // 8470f7
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 8470f7: test edi, edi
        if (R.zf) { pc = 139; continue; } // 8470f9: je 0x84715b
        pc = 132; continue;
      case 132: // 8470fb
        R.edx = (R.m.u32(((R.edi + 0xcf) | 0) >>> 0)) | 0; // 8470fb: mov edx, dword ptr [edi + 0xcf]
        R.push((R.ebx >>> 0)); // 847101: push ebx
        R.push((R.edx >>> 0)); // 847102: push edx
        R.call(0x547840, { n: 2, thisEcx: false, calleeClean: false }); // 847103: call 0x547840
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 847108: add esp, 8
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84710b: test eax, eax
        if (R.zf) { pc = 135; continue; } // 84710d: je 0x847124
        pc = 133; continue;
      default: return pc;
    }
  }
}
function f_846920_15(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 133: // 84710f
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 84710f: fld qword ptr [esp + 0xc]
        R.st[0] = R.st[0] + R.st[0]; // 847113: fadd st(0), st(0)
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 847115: test esi, esi
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 847117: fstp qword ptr [esp + 0xc]
        if (R.zf) { pc = 135; continue; } // 84711b: je 0x847124
        pc = 134; continue;
      case 134: // 84711d
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 84711d: mov eax, dword ptr [esi]
        R.eax = ((R.eax & 0xffff00ff) | (((R.logic(((R.eax >>> 8) & 0xff) | 0x1, 8)) & 0xff) << 8)) | 0; // 84711f: or ah, 1
        R.m.w32(((R.esi) | 0) >>> 0, (R.eax >>> 0)); // 847122: mov dword ptr [esi], eax
        pc = 135; continue;
      case 135: // 847124
        R.eax = (R.m.u32(((R.edi + 0xcf) | 0) >>> 0)) | 0; // 847124: mov eax, dword ptr [edi + 0xcf]
        R.push((R.ebx >>> 0)); // 84712a: push ebx
        R.push((R.eax >>> 0)); // 84712b: push eax
        R.call(0x547810, { n: 2, thisEcx: false, calleeClean: false }); // 84712c: call 0x547810
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 847131: add esp, 8
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 847134: test eax, eax
        if (R.zf) { pc = 139; continue; } // 847136: je 0x84715b
        pc = 136; continue;
      case 136: // 847138
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 847138: fld qword ptr [esp + 0xc]
        R.st[0] = R.st[0] * 0.5; // 84713c: fmul qword ptr [0x968968]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 847142: test esi, esi
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 847144: fstp qword ptr [esp + 0xc]
        if (R.zf) { pc = 139; continue; } // 847148: je 0x84715b
        pc = 137; continue;
      case 137: // 84714a
        R.ecx = (R.m.u32(((R.esp + 0x3c) | 0) >>> 0)) | 0; // 84714a: mov ecx, dword ptr [esp + 0x3c]
        R.logic(R.m.u8(((R.ecx + 0x4e) | 0) >>> 0) & 0x8, 8); // 84714e: test byte ptr [ecx + 0x4e], 8
        if (!R.zf) { pc = 139; continue; } // 847152: jne 0x84715b
        pc = 138; continue;
      case 138: // 847154
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 847154: mov eax, dword ptr [esi]
        R.eax = ((R.eax & 0xffff00ff) | (((R.logic(((R.eax >>> 8) & 0xff) | 0x2, 8)) & 0xff) << 8)) | 0; // 847156: or ah, 2
        R.m.w32(((R.esi) | 0) >>> 0, (R.eax >>> 0)); // 847159: mov dword ptr [esi], eax
        pc = 139; continue;
      case 139: // 84715b
        R.ecx = (R.m.u32(((R.esp + 0x3c) | 0) >>> 0)) | 0; // 84715b: mov ecx, dword ptr [esp + 0x3c]
        R.eax = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 84715f: mov eax, dword ptr [ebp + 0xc]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 847162: test ecx, ecx
        if (!R.zf) { pc = 178; continue; } // 847164: jne 0x847320
        pc = 140; continue;
      case 140: // 84716a
        R.sub((R.eax >>> 0), (R.edi >>> 0), 32); // 84716a: cmp eax, edi
        if (!R.zf) { pc = 177; continue; } // 84716c: jne 0x847310
        pc = 141; continue;
      case 141: // 847172
        R.ebx = ((R.ebx & 0xffffff00) | (((R.m.u8(((R.ebp + 0x18) | 0) >>> 0)) & 0xff) << 0)) | 0; // 847172: mov bl, byte ptr [ebp + 0x18]
        R.m.w8(((R.esp + 0x43) | 0) >>> 0, 0x0); // 847175: mov byte ptr [esp + 0x43], 0
        R.m.w8(((R.esp + 0x1a) | 0) >>> 0, ((R.ebx >>> 0) & 0xff)); // 84717a: mov byte ptr [esp + 0x1a], bl
        pc = 216; continue; // 84717e: jmp 0x847520
      case 142: // 847183
        R.ebx = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 847183: mov ebx, dword ptr [ebp + 8]
        pc = 143; continue;
      case 143: // 847186
        R.sub((R.edx >>> 0), (R.eax >>> 0), 32); // 847186: cmp edx, eax
        if (!R.zf) { pc = 148; continue; } // 847188: jne 0x8471b9
        pc = 144; continue;
      default: return pc;
    }
  }
}
function f_846920_16(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 144: // 84718a
        R.eax = (R.m.u32(((R.edi + 0x53) | 0) >>> 0)) | 0; // 84718a: mov eax, dword ptr [edi + 0x53]
        R.sub(R.m.u32(((R.eax) | 0) >>> 0), (R.ecx >>> 0), 32); // 84718d: cmp dword ptr [eax], ecx
        if (!R.zf) { pc = 148; continue; } // 84718f: jne 0x8471b9
        pc = 145; continue;
      case 145: // 847191
        R.eax = (R.m.u32(((R.ebx + 0x1a) | 0) >>> 0)) | 0; // 847191: mov eax, dword ptr [ebx + 0x1a]
        R.sub(R.m.u32(((R.eax) | 0) >>> 0), (R.ecx >>> 0), 32); // 847194: cmp dword ptr [eax], ecx
        if (!R.zf) { pc = 148; continue; } // 847196: jne 0x8471b9
        pc = 146; continue;
      case 146: // 847198
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 847198: fld qword ptr [esp + 0xc]
        R.st[0] = R.st[0] * 0.1; // 84719c: fmul qword ptr [0x967880]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 8471a2: test esi, esi
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 8471a4: fstp qword ptr [esp + 0xc]
        if (R.zf) { pc = 125; continue; } // 8471a8: je 0x84709d
        pc = 147; continue;
      case 147: // 8471ae
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 8471ae: mov eax, dword ptr [esi]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) | 0x2, 8)) & 0xff) << 0)) | 0; // 8471b0: or al, 2
        R.m.w32(((R.esi) | 0) >>> 0, (R.eax >>> 0)); // 8471b2: mov dword ptr [esi], eax
        pc = 125; continue; // 8471b4: jmp 0x84709d
      case 148: // 8471b9
        R.eax = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 8471b9: mov eax, dword ptr [ebp + 0xc]
        R.ecx = (R.m.u32(((R.edi + 0xb3) | 0) >>> 0)) | 0; // 8471bc: mov ecx, dword ptr [edi + 0xb3]
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 8471c2: cmp eax, ecx
        if (R.zf) { pc = 151; continue; } // 8471c4: je 0x8471d6
        pc = 149; continue;
      case 149: // 8471c6
        R.sub((R.eax >>> 0), R.m.u32(((R.edi + 0xb7) | 0) >>> 0), 32); // 8471c6: cmp eax, dword ptr [edi + 0xb7]
        if (R.zf) { pc = 151; continue; } // 8471cc: je 0x8471d6
        pc = 150; continue;
      case 150: // 8471ce
        R.sub((R.eax >>> 0), R.m.u32(((R.edi + 0xbb) | 0) >>> 0), 32); // 8471ce: cmp eax, dword ptr [edi + 0xbb]
        if (!R.zf) { pc = 161; continue; } // 8471d4: jne 0x84723f
        pc = 151; continue;
      case 151: // 8471d6
        R.sub((R.edx >>> 0), R.m.u32(((0x9cf360) | 0) >>> 0), 32); // 8471d6: cmp edx, dword ptr [0x9cf360]
        if (!R.zf) { pc = 153; continue; } // 8471dc: jne 0x8471f8
        pc = 152; continue;
      case 152: // 8471de
        R.ecx = (((R.m.u8(((R.ebx + 0x59) | 0) >>> 0)) << 24 >> 24)) | 0; // 8471de: movsx ecx, byte ptr [ebx + 0x59]
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.ecx >>> 0)); // 8471e2: mov dword ptr [esp + 0x1c], ecx
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 8471e6: fild dword ptr [esp + 0x1c]
        R.st[0] = R.st[0] * 0.02; // 8471ea: fmul qword ptr [0x968a98]
        R.st[0] = 1.0 - R.st[0]; // 8471f0: fsubr qword ptr [0x967890]
        pc = 157; continue; // 8471f6: jmp 0x84721a
      case 153: // 8471f8
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ebx + 0x59) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8471f8: mov al, byte ptr [ebx + 0x59]
        R.sub(((R.eax >>> 0) & 0xff), 0x1, 8); // 8471fb: cmp al, 1
        if (!R.cL) { pc = 155; continue; } // 8471fd: jge 0x847209
        pc = 154; continue;
      case 154: // 8471ff
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, 0x1); // 8471ff: mov dword ptr [esp + 0x1c], 1
        pc = 156; continue; // 847207: jmp 0x847210
      case 155: // 847209
        R.edx = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 847209: movsx edx, al
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.edx >>> 0)); // 84720c: mov dword ptr [esp + 0x1c], edx
        pc = 156; continue;
      default: return pc;
    }
  }
}
function f_846920_17(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 156: // 847210
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 847210: fild dword ptr [esp + 0x1c]
        R.st[0] = 0.2 / R.st[0]; // 847214: fdivr qword ptr [0x968918]
        pc = 157; continue;
      case 157: // 84721a
        R.fpush(R.st[0]); // 84721a: fld st(0)
        R.st[0] = R.st[0] * R.f64(((R.esp + 0xc) | 0)); // 84721c: fmul qword ptr [esp + 0xc]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 847220: test esi, esi
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 847222: fstp qword ptr [esp + 0xc]
        if (R.zf) { pc = 160; continue; } // 847226: je 0x84723d
        pc = 158; continue;
      case 158: // 847228
        R.fcom(R.st[0], 0.7); R.fpop(); // 847228: fcomp qword ptr [0x968e40]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 84722e: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 847230: test ah, 1
        if (R.zf) { pc = 161; continue; } // 847233: je 0x84723f
        pc = 159; continue;
      case 159: // 847235
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 847235: mov eax, dword ptr [esi]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) | 0x20, 8)) & 0xff) << 0)) | 0; // 847237: or al, 0x20
        R.m.w32(((R.esi) | 0) >>> 0, (R.eax >>> 0)); // 847239: mov dword ptr [esi], eax
        pc = 161; continue; // 84723b: jmp 0x84723f
      case 160: // 84723d
        R.fpop(); // 84723d: fstp st(0)
        pc = 161; continue;
      case 161: // 84723f
        R.eax = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 84723f: mov eax, dword ptr [ebp + 0xc]
        R.push((R.edi >>> 0)); // 847242: push edi
        R.push((R.eax >>> 0)); // 847243: push eax
        R.call(0x4b02e0, { n: 2, thisEcx: false, calleeClean: false }); // 847244: call 0x4b02e0
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 847249: add esp, 8
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 84724c: test al, al
        if (R.zf) { pc = 125; continue; } // 84724e: je 0x84709d
        pc = 162; continue;
      case 162: // 847254
        R.ecx = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 847254: mov ecx, dword ptr [ebp + 0xc]
        R.edx = (R.m.u32(((R.ecx + 0x53) | 0) >>> 0)) | 0; // 847257: mov edx, dword ptr [ecx + 0x53]
        R.ecx = (R.m.u32(((0x9cf360) | 0) >>> 0)) | 0; // 84725a: mov ecx, dword ptr [0x9cf360]
        R.eax = (R.m.u32(((R.edx) | 0) >>> 0)) | 0; // 847260: mov eax, dword ptr [edx]
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 847262: cmp eax, ecx
        if (!R.zf) { pc = 164; continue; } // 847264: jne 0x847280
        pc = 163; continue;
      case 163: // 847266
        R.ecx = (((R.m.u8(((R.ebx + 0x59) | 0) >>> 0)) << 24 >> 24)) | 0; // 847266: movsx ecx, byte ptr [ebx + 0x59]
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.ecx >>> 0)); // 84726a: mov dword ptr [esp + 0x1c], ecx
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 84726e: fild dword ptr [esp + 0x1c]
        R.st[0] = R.st[0] * 0.02; // 847272: fmul qword ptr [0x968a98]
        R.st[0] = 1.0 - R.st[0]; // 847278: fsubr qword ptr [0x967890]
        pc = 168; continue; // 84727e: jmp 0x8472a2
      case 164: // 847280
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ebx + 0x59) | 0) >>> 0)) & 0xff) << 0)) | 0; // 847280: mov al, byte ptr [ebx + 0x59]
        R.sub(((R.eax >>> 0) & 0xff), 0x1, 8); // 847283: cmp al, 1
        if (!R.cL) { pc = 166; continue; } // 847285: jge 0x847291
        pc = 165; continue;
      case 165: // 847287
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, 0x1); // 847287: mov dword ptr [esp + 0x1c], 1
        pc = 167; continue; // 84728f: jmp 0x847298
      default: return pc;
    }
  }
}
function f_846920_18(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 166: // 847291
        R.edx = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 847291: movsx edx, al
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.edx >>> 0)); // 847294: mov dword ptr [esp + 0x1c], edx
        pc = 167; continue;
      case 167: // 847298
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 847298: fild dword ptr [esp + 0x1c]
        R.st[0] = 0.75 / R.st[0]; // 84729c: fdivr qword ptr [0x969040]
        pc = 168; continue;
      case 168: // 8472a2
        R.fpush(R.st[0]); // 8472a2: fld st(0)
        R.st[0] = R.st[0] * R.f64(((R.esp + 0xc) | 0)); // 8472a4: fmul qword ptr [esp + 0xc]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 8472a8: test esi, esi
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 8472aa: fstp qword ptr [esp + 0xc]
        if (R.zf) { pc = 176; continue; } // 8472ae: je 0x847309
        pc = 169; continue;
      case 169: // 8472b0
        R.fcom(R.st[0], 0.7); R.fpop(); // 8472b0: fcomp qword ptr [0x968e40]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8472b6: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 8472b8: test ah, 1
        if (R.zf) { pc = 125; continue; } // 8472bb: je 0x84709d
        pc = 170; continue;
      case 170: // 8472c1
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 8472c1: mov eax, dword ptr [esi]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) | 0x20, 8)) & 0xff) << 0)) | 0; // 8472c3: or al, 0x20
        R.m.w32(((R.esi) | 0) >>> 0, (R.eax >>> 0)); // 8472c5: mov dword ptr [esi], eax
        pc = 125; continue; // 8472c7: jmp 0x84709d
      case 171: // 8472cc
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ebx + 0x59) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8472cc: mov al, byte ptr [ebx + 0x59]
        R.sub(((R.eax >>> 0) & 0xff), 0x1, 8); // 8472cf: cmp al, 1
        if (!R.cL) { pc = 173; continue; } // 8472d1: jge 0x8472dd
        pc = 172; continue;
      case 172: // 8472d3
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, 0x1); // 8472d3: mov dword ptr [esp + 0x1c], 1
        pc = 174; continue; // 8472db: jmp 0x8472e4
      case 173: // 8472dd
        R.eax = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 8472dd: movsx eax, al
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.eax >>> 0)); // 8472e0: mov dword ptr [esp + 0x1c], eax
        pc = 174; continue;
      case 174: // 8472e4
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 8472e4: fild dword ptr [esp + 0x1c]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 8472e8: test esi, esi
        R.st[0] = 0.025 / R.st[0]; // 8472ea: fdivr qword ptr [0x967878]
        R.st[0] = R.st[0] * R.f64(((R.esp + 0xc) | 0)); // 8472f0: fmul qword ptr [esp + 0xc]
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 8472f4: fstp qword ptr [esp + 0xc]
        if (R.zf) { pc = 125; continue; } // 8472f8: je 0x84709d
        pc = 175; continue;
      case 175: // 8472fe
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 8472fe: mov eax, dword ptr [esi]
        R.eax = ((R.eax & 0xffffff00) | (((R.logic(((R.eax >>> 0) & 0xff) | 0x20, 8)) & 0xff) << 0)) | 0; // 847300: or al, 0x20
        R.m.w32(((R.esi) | 0) >>> 0, (R.eax >>> 0)); // 847302: mov dword ptr [esi], eax
        pc = 125; continue; // 847304: jmp 0x84709d
      case 176: // 847309
        R.fpop(); // 847309: fstp st(0)
        pc = 125; continue; // 84730b: jmp 0x84709d
      case 177: // 847310
        R.ebx = ((R.ebx & 0xffffff00) | (((0x7) & 0xff) << 0)) | 0; // 847310: mov bl, 7
        R.m.w8(((R.esp + 0x43) | 0) >>> 0, 0x9c); // 847312: mov byte ptr [esp + 0x43], 0x9c
        R.m.w8(((R.esp + 0x1a) | 0) >>> 0, ((R.ebx >>> 0) & 0xff)); // 847317: mov byte ptr [esp + 0x1a], bl
        pc = 216; continue; // 84731b: jmp 0x847520
      default: return pc;
    }
  }
}
function f_846920_19(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 178: // 847320
        R.edx = (((R.m.u8(((R.ecx + 0x44) | 0) >>> 0)) << 24 >> 24)) | 0; // 847320: movsx edx, byte ptr [ecx + 0x44]
        R.sub((R.eax >>> 0), (R.edi >>> 0), 32); // 847324: cmp eax, edi
        if (!R.zf) { pc = 185; continue; } // 847326: jne 0x8473c0
        pc = 179; continue;
      case 179: // 84732c
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.edx >>> 0)); // 84732c: mov dword ptr [esp + 0x1c], edx
        R.ecx = (R.m.u32(((R.eax + 0xcf) | 0) >>> 0)) | 0; // 847330: mov ecx, dword ptr [eax + 0xcf]
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 847336: fild dword ptr [esp + 0x1c]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 84733a: test ecx, ecx
        R.st[0] = R.st[0] * 0.0025; // 84733c: fmul qword ptr [0x969028]
        R.st[0] = R.st[0] + 1.0; // 847342: fadd qword ptr [0x967890]
        R.st[0] = R.st[0] * R.f64(((R.esp + 0xc) | 0)); // 847348: fmul qword ptr [esp + 0xc]
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 84734c: fstp qword ptr [esp + 0xc]
        if (R.zf) { pc = 184; continue; } // 847350: je 0x8473b8
        pc = 180; continue;
      case 180: // 847352
        R.eax = (((R.esp + 0x44) | 0)) | 0; // 847352: lea eax, [esp + 0x44]
        R.push(0x96); // 847356: push 0x96
        R.push((R.eax >>> 0)); // 84735b: push eax
        R.ecx = (0xae2c90) | 0; // 84735c: mov ecx, 0xae2c90
        R.call(0x54c8e0, { n: 2, thisEcx: true, calleeClean: true }); // 847361: call 0x54c8e0
        R.edx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 847366: mov edx, dword ptr [eax]
        R.ecx = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 847368: mov ecx, dword ptr [eax + 4]
        R.eax = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 84736b: mov eax, dword ptr [ebp + 0xc]
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.edx >>> 0)); // 84736e: mov dword ptr [esp + 0x1c], edx
        R.esi = ((R.esi & 0xffff0000) | (((R.m.u16(((R.esp + 0x1e) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 847372: mov si, word ptr [esp + 0x1e]
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, (R.ecx >>> 0)); // 847377: mov dword ptr [esp + 0x20], ecx
        R.eax = (R.m.u32(((R.eax + 0xcf) | 0) >>> 0)) | 0; // 84737b: mov eax, dword ptr [eax + 0xcf]
        R.eax = (R.add((R.eax >>> 0), 0x3e, 32)) | 0; // 847381: add eax, 0x3e
        R.ecx = ((R.ecx & 0xffff0000) | (((R.m.u16(((R.eax + 0x2) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 847384: mov cx, word ptr [eax + 2]
        R.sub(((R.esi >>> 0) & 0xffff), ((R.ecx >>> 0) & 0xffff), 16); // 847388: cmp si, cx
        if (!R.cBE) { pc = 183; continue; } // 84738b: ja 0x84739d
        pc = 181; continue;
      case 181: // 84738d
        if (R.cf) { pc = 184; continue; } // 84738d: jb 0x8473b8
        pc = 182; continue;
      case 182: // 84738f
        R.ecx = (R.logic((R.ecx >>> 0) ^ (R.ecx >>> 0), 32)) | 0; // 84738f: xor ecx, ecx
        R.sub(((R.edx >>> 0) & 0xffff), R.m.u16(((R.eax) | 0) >>> 0), 16); // 847391: cmp dx, word ptr [eax]
        R.ecx = ((R.ecx & 0xffffff00) | (((!R.cLE ? 1 : 0) & 0xff) << 0)) | 0; // 847394: setg cl
        R.eax = ((R.ecx >>> 0)) | 0; // 847397: mov eax, ecx
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 847399: test eax, eax
        if (R.zf) { pc = 184; continue; } // 84739b: je 0x8473b8
        pc = 183; continue;
      case 183: // 84739d
        R.edx = (R.m.u32(((R.esp + 0x3c) | 0) >>> 0)) | 0; // 84739d: mov edx, dword ptr [esp + 0x3c]
        R.eax = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 8473a1: mov eax, dword ptr [ebp + 8]
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 8473a4: mov ecx, dword ptr [0xae1050]
        R.push((R.edx >>> 0)); // 8473aa: push edx
        R.push((R.eax >>> 0)); // 8473ab: push eax
        R.call(0x4ca470, { n: 2, thisEcx: false, calleeClean: true }); // 8473ac: call 0x4ca470
        R.ebx = ((R.ebx & 0xffffff00) | (((((R.eax >>> 0) & 0xff)) & 0xff) << 0)) | 0; // 8473b1: mov bl, al
        pc = 214; continue; // 8473b3: jmp 0x84750a
      case 184: // 8473b8
        R.ebx = ((R.ebx & 0xffffff00) | (((R.m.u8(((R.ebp + 0x18) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8473b8: mov bl, byte ptr [ebp + 0x18]
        pc = 214; continue; // 8473bb: jmp 0x84750a
      default: return pc;
    }
  }
}
function f_846920_20(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 185: // 8473c0
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.edx >>> 0)); // 8473c0: mov dword ptr [esp + 0x1c], edx
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 8473c4: fild dword ptr [esp + 0x1c]
        R.st[0] = R.st[0] * 0.0025; // 8473c8: fmul qword ptr [0x969028]
        R.st[0] = 1.0 - R.st[0]; // 8473ce: fsubr qword ptr [0x967890]
        R.fpush(R.st[0]); // 8473d4: fld st(0)
        R.st[0] = R.st[0] * R.f64(((R.esp + 0xc) | 0)); // 8473d6: fmul qword ptr [esp + 0xc]
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 8473da: fstp qword ptr [esp + 0xc]
        R.fcom(R.st[0], 1.01); // 8473de: fcom qword ptr [0x96afa8]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8473e4: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 8473e6: test ah, 0x41
        if (!R.zf) { pc = 187; continue; } // 8473e9: jne 0x8473f5
        pc = 186; continue;
      case 186: // 8473eb
        R.fpush(R.st[0]); // 8473eb: fld st(0)
        R.st[0] = R.st[0] * R.f64(((R.esp + 0xc) | 0)); // 8473ed: fmul qword ptr [esp + 0xc]
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 8473f1: fstp qword ptr [esp + 0xc]
        pc = 187; continue;
      case 187: // 8473f5
        R.eax = (R.m.u32(((R.esp + 0x64) | 0) >>> 0)) | 0; // 8473f5: mov eax, dword ptr [esp + 0x64]
        R.logic(((R.eax >>> 0) & 0xff) & 0x10, 8); // 8473f9: test al, 0x10
        if (R.zf) { pc = 189; continue; } // 8473fb: je 0x84740b
        pc = 188; continue;
      case 188: // 8473fd
        R.fpush(R.f32(((R.esp + 0x7c) | 0))); // 8473fd: fld dword ptr [esp + 0x7c]
        R.st[0] = R.st[0] * 1.5; // 847401: fmul qword ptr [0x968940]
        R.m.wf32(((R.esp + 0x7c) | 0) >>> 0, R.st[0]); R.fpop(); // 847407: fstp dword ptr [esp + 0x7c]
        pc = 189; continue;
      case 189: // 84740b
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 84740b: test ah, 1
        if (R.zf) { pc = 191; continue; } // 84740e: je 0x84741e
        pc = 190; continue;
      case 190: // 847410
        R.fpush(R.f32(((R.esp + 0x7c) | 0))); // 847410: fld dword ptr [esp + 0x7c]
        R.st[0] = R.st[0] * 1.5; // 847414: fmul qword ptr [0x968940]
        R.m.wf32(((R.esp + 0x7c) | 0) >>> 0, R.st[0]); R.fpop(); // 84741a: fstp dword ptr [esp + 0x7c]
        pc = 191; continue;
      case 191: // 84741e
        R.logic(((R.eax >>> 0) & 0xff) & 0x1, 8); // 84741e: test al, 1
        if (R.zf) { pc = 193; continue; } // 847420: je 0x847430
        pc = 192; continue;
      case 192: // 847422
        R.fpush(R.f32(((R.esp + 0x50) | 0))); // 847422: fld dword ptr [esp + 0x50]
        R.st[0] = R.st[0] * 1.5; // 847426: fmul qword ptr [0x968940]
        R.m.wf32(((R.esp + 0x50) | 0) >>> 0, R.st[0]); R.fpop(); // 84742c: fstp dword ptr [esp + 0x50]
        pc = 193; continue;
      case 193: // 847430
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 847430: test esi, esi
        if (R.zf) { pc = 199; continue; } // 847432: je 0x847468
        pc = 194; continue;
      case 194: // 847434
        R.fcom(R.st[0], 1.5); // 847434: fcom qword ptr [0x968940]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 84743a: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 84743c: test ah, 0x41
        if (!R.zf) { pc = 197; continue; } // 84743f: jne 0x847452
        pc = 195; continue;
      case 195: // 847441
        R.logic(R.m.u8(((R.ecx + 0x4e) | 0) >>> 0) & 0x8, 8); // 847441: test byte ptr [ecx + 0x4e], 8
        if (!R.zf) { pc = 197; continue; } // 847445: jne 0x847452
        pc = 196; continue;
      default: return pc;
    }
  }
}
function f_846920_21(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 196: // 847447
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 847447: mov eax, dword ptr [esi]
        R.eax = ((R.eax & 0xffff00ff) | (((R.logic(((R.eax >>> 8) & 0xff) | 0x4, 8)) & 0xff) << 8)) | 0; // 847449: or ah, 4
        R.fpop(); // 84744c: fstp st(0)
        R.m.w32(((R.esi) | 0) >>> 0, (R.eax >>> 0)); // 84744e: mov dword ptr [esi], eax
        pc = 200; continue; // 847450: jmp 0x84746a
      case 197: // 847452
        R.fcom(R.st[0], 0.5); R.fpop(); // 847452: fcomp qword ptr [0x968968]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 847458: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 84745a: test ah, 1
        if (R.zf) { pc = 200; continue; } // 84745d: je 0x84746a
        pc = 198; continue;
      case 198: // 84745f
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 84745f: mov eax, dword ptr [esi]
        R.eax = ((R.eax & 0xffff00ff) | (((R.logic(((R.eax >>> 8) & 0xff) | 0x8, 8)) & 0xff) << 8)) | 0; // 847461: or ah, 8
        R.m.w32(((R.esi) | 0) >>> 0, (R.eax >>> 0)); // 847464: mov dword ptr [esi], eax
        pc = 200; continue; // 847466: jmp 0x84746a
      case 199: // 847468
        R.fpop(); // 847468: fstp st(0)
        pc = 200; continue;
      case 200: // 84746a
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 84746a: test edi, edi
        if (R.zf) { pc = 206; continue; } // 84746c: je 0x8474dc
        pc = 201; continue;
      case 201: // 84746e
        R.eax = (R.m.u32(((R.edi + 0xcf) | 0) >>> 0)) | 0; // 84746e: mov eax, dword ptr [edi + 0xcf]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 847474: test eax, eax
        if (R.zf) { pc = 206; continue; } // 847476: je 0x8474dc
        pc = 202; continue;
      case 202: // 847478
        R.eax = (((R.esp + 0x44) | 0)) | 0; // 847478: lea eax, [esp + 0x44]
        R.push(0x96); // 84747c: push 0x96
        R.push((R.eax >>> 0)); // 847481: push eax
        R.ecx = (0xae2c90) | 0; // 847482: mov ecx, 0xae2c90
        R.call(0x54c8e0, { n: 2, thisEcx: true, calleeClean: true }); // 847487: call 0x54c8e0
        R.edx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 84748c: mov edx, dword ptr [eax]
        R.ecx = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 84748e: mov ecx, dword ptr [eax + 4]
        R.eax = (R.m.u32(((R.esp + 0x30) | 0) >>> 0)) | 0; // 847491: mov eax, dword ptr [esp + 0x30]
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.edx >>> 0)); // 847495: mov dword ptr [esp + 0x1c], edx
        R.esi = ((R.esi & 0xffff0000) | (((R.m.u16(((R.esp + 0x1e) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 847499: mov si, word ptr [esp + 0x1e]
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, (R.ecx >>> 0)); // 84749e: mov dword ptr [esp + 0x20], ecx
        R.eax = (R.m.u32(((R.eax + 0xcf) | 0) >>> 0)) | 0; // 8474a2: mov eax, dword ptr [eax + 0xcf]
        R.eax = (R.add((R.eax >>> 0), 0x3e, 32)) | 0; // 8474a8: add eax, 0x3e
        R.ecx = ((R.ecx & 0xffff0000) | (((R.m.u16(((R.eax + 0x2) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 8474ab: mov cx, word ptr [eax + 2]
        R.sub(((R.esi >>> 0) & 0xffff), ((R.ecx >>> 0) & 0xffff), 16); // 8474af: cmp si, cx
        if (!R.cBE) { pc = 205; continue; } // 8474b2: ja 0x8474c4
        pc = 203; continue;
      case 203: // 8474b4
        if (R.cf) { pc = 206; continue; } // 8474b4: jb 0x8474dc
        pc = 204; continue;
      case 204: // 8474b6
        R.ecx = (R.logic((R.ecx >>> 0) ^ (R.ecx >>> 0), 32)) | 0; // 8474b6: xor ecx, ecx
        R.sub(((R.edx >>> 0) & 0xffff), R.m.u16(((R.eax) | 0) >>> 0), 16); // 8474b8: cmp dx, word ptr [eax]
        R.ecx = ((R.ecx & 0xffffff00) | (((!R.cLE ? 1 : 0) & 0xff) << 0)) | 0; // 8474bb: setg cl
        R.eax = ((R.ecx >>> 0)) | 0; // 8474be: mov eax, ecx
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8474c0: test eax, eax
        if (R.zf) { pc = 206; continue; } // 8474c2: je 0x8474dc
        pc = 205; continue;
      default: return pc;
    }
  }
}
function f_846920_22(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 205: // 8474c4
        R.edx = (R.m.u32(((R.esp + 0x3c) | 0) >>> 0)) | 0; // 8474c4: mov edx, dword ptr [esp + 0x3c]
        R.eax = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 8474c8: mov eax, dword ptr [ebp + 8]
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 8474cb: mov ecx, dword ptr [0xae1050]
        R.push((R.edx >>> 0)); // 8474d1: push edx
        R.push((R.eax >>> 0)); // 8474d2: push eax
        R.call(0x4ca470, { n: 2, thisEcx: false, calleeClean: true }); // 8474d3: call 0x4ca470
        R.ebx = ((R.ebx & 0xffffff00) | (((((R.eax >>> 0) & 0xff)) & 0xff) << 0)) | 0; // 8474d8: mov bl, al
        pc = 207; continue; // 8474da: jmp 0x8474e6
      case 206: // 8474dc
        R.ecx = (R.m.u32(((R.esp + 0x3c) | 0) >>> 0)) | 0; // 8474dc: mov ecx, dword ptr [esp + 0x3c]
        R.ebx = ((R.ebx & 0xffffff00) | (((R.m.u8(((R.ecx + 0x4f) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8474e0: mov bl, byte ptr [ecx + 0x4f]
        R.ebx = ((R.ebx & 0xffffff00) | (((R.shr(((R.ebx >>> 0) & 0xff), 0x4, 8)) & 0xff) << 0)) | 0; // 8474e3: shr bl, 4
        pc = 207; continue;
      case 207: // 8474e6
        R.edx = (R.m.u32(((R.esp + 0x3c) | 0) >>> 0)) | 0; // 8474e6: mov edx, dword ptr [esp + 0x3c]
        R.m.w8(((R.esp + 0x1a) | 0) >>> 0, ((R.ebx >>> 0) & 0xff)); // 8474ea: mov byte ptr [esp + 0x1a], bl
        R.logic(R.m.u8(((R.edx + 0x4e) | 0) >>> 0) & 0x8, 8); // 8474ee: test byte ptr [edx + 0x4e], 8
        if (R.zf) { pc = 215; continue; } // 8474f2: je 0x84750e
        pc = 208; continue;
      case 208: // 8474f4
        R.sub(((R.ebx >>> 0) & 0xff), 0x1, 8); // 8474f4: cmp bl, 1
        if (R.zf) { pc = 213; continue; } // 8474f7: je 0x847508
        pc = 209; continue;
      case 209: // 8474f9
        if (R.cLE) { pc = 212; continue; } // 8474f9: jle 0x847504
        pc = 210; continue;
      case 210: // 8474fb
        R.sub(((R.ebx >>> 0) & 0xff), 0x3, 8); // 8474fb: cmp bl, 3
        if (!R.cLE) { pc = 212; continue; } // 8474fe: jg 0x847504
        pc = 211; continue;
      case 211: // 847500
        R.ebx = ((R.ebx & 0xffffff00) | (((0x4) & 0xff) << 0)) | 0; // 847500: mov bl, 4
        pc = 214; continue; // 847502: jmp 0x84750a
      case 212: // 847504
        R.ebx = ((R.ebx & 0xffffff00) | (((0x7) & 0xff) << 0)) | 0; // 847504: mov bl, 7
        pc = 214; continue; // 847506: jmp 0x84750a
      case 213: // 847508
        R.ebx = ((R.ebx & 0xffffff00) | (((0x3) & 0xff) << 0)) | 0; // 847508: mov bl, 3
        pc = 214; continue;
      case 214: // 84750a
        R.m.w8(((R.esp + 0x1a) | 0) >>> 0, ((R.ebx >>> 0) & 0xff)); // 84750a: mov byte ptr [esp + 0x1a], bl
        pc = 215; continue;
      case 215: // 84750e
        R.eax = (R.m.u32(((R.esp + 0x3c) | 0) >>> 0)) | 0; // 84750e: mov eax, dword ptr [esp + 0x3c]
        R.edi = (R.m.u32(((R.esp + 0x30) | 0) >>> 0)) | 0; // 847512: mov edi, dword ptr [esp + 0x30]
        R.esi = (R.m.u32(((R.ebp + 0x1c) | 0) >>> 0)) | 0; // 847516: mov esi, dword ptr [ebp + 0x1c]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.eax + 0x3d) | 0) >>> 0)) & 0xff) << 0)) | 0; // 847519: mov cl, byte ptr [eax + 0x3d]
        R.m.w8(((R.esp + 0x43) | 0) >>> 0, ((R.ecx >>> 0) & 0xff)); // 84751c: mov byte ptr [esp + 0x43], cl
        pc = 216; continue;
      case 216: // 847520
        R.eax = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 847520: mov eax, dword ptr [ebp + 0xc]
        R.push(0x0); // 847523: push 0
        R.push(0x0); // 847525: push 0
        R.sub((R.eax >>> 0), (R.edi >>> 0), 32); // 847527: cmp eax, edi
        R.push(0x1); // 847529: push 1
        R.push(0x0); // 84752b: push 0
        if (R.zf) { pc = 529; continue; } // 84752d: je 0x84875a
        pc = 217; continue;
      default: return pc;
    }
  }
}
function f_846920_23(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 217: // 847533
        R.edi = ((R.eax >>> 0)) | 0; // 847533: mov edi, eax
        R.push((R.edi >>> 0)); // 847535: push edi
        R.call(0x600a50, { n: 5, thisEcx: false, calleeClean: false }); // 847536: call 0x600a50
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 84753b: add esp, 0x14
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84753e: test eax, eax
        if (R.zf) { pc = 222; continue; } // 847540: je 0x847585
        pc = 218; continue;
      case 218: // 847542
        R.edx = (R.m.u32(((R.edi + 0xcf) | 0) >>> 0)) | 0; // 847542: mov edx, dword ptr [edi + 0xcf]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 847548: test esi, esi
        R.eax = (((R.m.u8(((R.edx + 0x59) | 0) >>> 0)) << 24 >> 24)) | 0; // 84754a: movsx eax, byte ptr [edx + 0x59]
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.eax >>> 0)); // 84754e: mov dword ptr [esp + 0x1c], eax
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 847552: fild dword ptr [esp + 0x1c]
        R.st[0] = R.st[0] * 0.025; // 847556: fmul qword ptr [0x967878]
        R.st[0] = R.st[0] + 0.5; // 84755c: fadd qword ptr [0x968968]
        R.fpush(R.st[0]); // 847562: fld st(0)
        R.st[0] = R.st[0] * R.f64(((R.esp + 0xc) | 0)); // 847564: fmul qword ptr [esp + 0xc]
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 847568: fstp qword ptr [esp + 0xc]
        if (R.zf) { pc = 221; continue; } // 84756c: je 0x847583
        pc = 219; continue;
      case 219: // 84756e
        R.fcom(R.st[0], 0.675); R.fpop(); // 84756e: fcomp qword ptr [0x96a698]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 847574: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 847576: test ah, 1
        if (R.zf) { pc = 222; continue; } // 847579: je 0x847585
        pc = 220; continue;
      case 220: // 84757b
        R.m.w32(((R.esi) | 0) >>> 0, R.logic(R.m.u32(((R.esi) | 0) >>> 0) | 0x20000000, 32)); // 84757b: or dword ptr [esi], 0x20000000
        pc = 222; continue; // 847581: jmp 0x847585
      case 221: // 847583
        R.fpop(); // 847583: fstp st(0)
        pc = 222; continue;
      case 222: // 847585
        R.eax = (((((R.ebx >>> 0) & 0xff)) << 24 >> 24)) | 0; // 847585: movsx eax, bl
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 847588: dec eax
        R.sub((R.eax >>> 0), 0x6, 32); // 847589: cmp eax, 6
        if (!R.cBE) { pc = 250; continue; } // 84758c: ja 0x8476cd
        pc = 223; continue;
      case 223: // 847592
        pc = [224, 227, 243, 230, 237, 244, 247][R.eax >>> 0] ?? -2; continue; // 847592: jmp dword ptr [eax*4 + 0x849c58]
      case 224: // 847599
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 847599: fld qword ptr [esp + 0xc]
        R.st[0] = R.st[0] * 0.65; // 84759d: fmul qword ptr [0x96a5d0]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 8475a3: test esi, esi
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 8475a5: fstp qword ptr [esp + 0xc]
        if (R.zf) { pc = 250; continue; } // 8475a9: je 0x8476cd
        pc = 225; continue;
      case 225: // 8475af
        R.ecx = (R.m.u32(((R.esp + 0x3c) | 0) >>> 0)) | 0; // 8475af: mov ecx, dword ptr [esp + 0x3c]
        R.eax = (R.m.u32(((R.ecx + 0x45) | 0) >>> 0)) | 0; // 8475b3: mov eax, dword ptr [ecx + 0x45]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8475b6: test eax, eax
        if (!R.zf) { pc = 250; continue; } // 8475b8: jne 0x8476cd
        pc = 226; continue;
      case 226: // 8475be
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 8475be: mov eax, dword ptr [esi]
        R.eax = ((R.eax & 0xffff00ff) | (((R.logic(((R.eax >>> 8) & 0xff) | 0x10, 8)) & 0xff) << 8)) | 0; // 8475c0: or ah, 0x10
        pc = 249; continue; // 8475c3: jmp 0x8476cb
      default: return pc;
    }
  }
}
function f_846920_24(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 227: // 8475c8
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 8475c8: fld qword ptr [esp + 0xc]
        R.st[0] = R.st[0] * 0.75; // 8475cc: fmul qword ptr [0x969040]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 8475d2: test esi, esi
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 8475d4: fstp qword ptr [esp + 0xc]
        if (R.zf) { pc = 250; continue; } // 8475d8: je 0x8476cd
        pc = 228; continue;
      case 228: // 8475de
        R.edx = (R.m.u32(((R.esp + 0x3c) | 0) >>> 0)) | 0; // 8475de: mov edx, dword ptr [esp + 0x3c]
        R.eax = (R.m.u32(((R.edx + 0x45) | 0) >>> 0)) | 0; // 8475e2: mov eax, dword ptr [edx + 0x45]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8475e5: test eax, eax
        if (!R.zf) { pc = 250; continue; } // 8475e7: jne 0x8476cd
        pc = 229; continue;
      case 229: // 8475ed
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 8475ed: mov eax, dword ptr [esi]
        R.eax = ((R.eax & 0xffff00ff) | (((R.logic(((R.eax >>> 8) & 0xff) | 0x10, 8)) & 0xff) << 8)) | 0; // 8475ef: or ah, 0x10
        pc = 249; continue; // 8475f2: jmp 0x8476cb
      case 230: // 8475f7
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 8475f7: fld qword ptr [esp + 0xc]
        R.st[0] = R.st[0] * 1.8; // 8475fb: fmul qword ptr [0x96d640]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 847601: test esi, esi
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 847603: fstp qword ptr [esp + 0xc]
        if (R.zf) { pc = 232; continue; } // 847607: je 0x847610
        pc = 231; continue;
      case 231: // 847609
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 847609: mov eax, dword ptr [esi]
        R.eax = ((R.eax & 0xffff00ff) | (((R.logic(((R.eax >>> 8) & 0xff) | 0x20, 8)) & 0xff) << 8)) | 0; // 84760b: or ah, 0x20
        R.m.w32(((R.esi) | 0) >>> 0, (R.eax >>> 0)); // 84760e: mov dword ptr [esi], eax
        pc = 232; continue;
      case 232: // 847610
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.esp + 0x1b) | 0) >>> 0)) & 0xff) << 0)) | 0; // 847610: mov cl, byte ptr [esp + 0x1b]
        R.sub(((R.ecx >>> 0) & 0xff), 0x17, 8); // 847614: cmp cl, 0x17
        if (R.cLE) { pc = 235; continue; } // 847617: jle 0x84762c
        pc = 233; continue;
      case 233: // 847619
        R.sub(((R.ecx >>> 0) & 0xff), 0x20, 8); // 847619: cmp cl, 0x20
        if (!R.cL) { pc = 251; continue; } // 84761c: jge 0x8476d1
        pc = 234; continue;
      case 234: // 847622
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 847622: fld qword ptr [esp + 0xc]
        R.st[0] = R.st[0] + R.st[0]; // 847626: fadd st(0), st(0)
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 847628: fstp qword ptr [esp + 0xc]
        pc = 235; continue;
      case 235: // 84762c
        R.sub(((R.ecx >>> 0) & 0xff), 0x20, 8); // 84762c: cmp cl, 0x20
        if (!R.cL) { pc = 251; continue; } // 84762f: jge 0x8476d1
        pc = 236; continue;
      case 236: // 847635
        R.eax = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 847635: mov eax, dword ptr [ebp + 8]
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.eax + 0x22) | 0) >>> 0)) & 0xff) << 0)) | 0; // 847638: mov dl, byte ptr [eax + 0x22]
        R.logic(((R.edx >>> 0) & 0xff) & ((R.edx >>> 0) & 0xff), 8); // 84763b: test dl, dl
        pc = 241; continue; // 84763d: jmp 0x847665
      case 237: // 84763f
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ebp + 0x14) | 0) >>> 0)) & 0xff) << 0)) | 0; // 84763f: mov al, byte ptr [ebp + 0x14]
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 847642: test al, al
        if (!R.zf) { pc = 239; continue; } // 847644: jne 0x847654
        pc = 238; continue;
      default: return pc;
    }
  }
}
function f_846920_25(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 238: // 847646
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 847646: fld qword ptr [esp + 0xc]
        R.st[0] = R.st[0] * 0.75; // 84764a: fmul qword ptr [0x969040]
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 847650: fstp qword ptr [esp + 0xc]
        pc = 239; continue;
      case 239: // 847654
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.esp + 0x1b) | 0) >>> 0)) & 0xff) << 0)) | 0; // 847654: mov cl, byte ptr [esp + 0x1b]
        R.sub(((R.ecx >>> 0) & 0xff), 0x20, 8); // 847658: cmp cl, 0x20
        if (!R.cL) { pc = 251; continue; } // 84765b: jge 0x8476d1
        pc = 240; continue;
      case 240: // 84765d
        R.edx = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 84765d: mov edx, dword ptr [ebp + 8]
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.edx + 0x22) | 0) >>> 0)) & 0xff) << 0)) | 0; // 847660: mov al, byte ptr [edx + 0x22]
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 847663: test al, al
        pc = 241; continue;
      case 241: // 847665
        if (R.zf) { pc = 251; continue; } // 847665: je 0x8476d1
        pc = 242; continue;
      case 242: // 847667
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 847667: fld qword ptr [esp + 0xc]
        R.st[0] = R.st[0] + R.st[0]; // 84766b: fadd st(0), st(0)
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 84766d: fstp qword ptr [esp + 0xc]
        pc = 251; continue; // 847671: jmp 0x8476d1
      case 243: // 847673
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 847673: fld qword ptr [esp + 0xc]
        R.st[0] = R.st[0] * 0.9; // 847677: fmul qword ptr [0x9689d8]
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 84767d: fstp qword ptr [esp + 0xc]
        pc = 250; continue; // 847681: jmp 0x8476cd
      case 244: // 847683
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 847683: fld qword ptr [esp + 0xc]
        R.st[0] = R.st[0] * 1.1; // 847687: fmul qword ptr [0x9689c0]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.esp + 0x1b) | 0) >>> 0)) & 0xff) << 0)) | 0; // 84768d: mov cl, byte ptr [esp + 0x1b]
        R.sub(((R.ecx >>> 0) & 0xff), 0x20, 8); // 847691: cmp cl, 0x20
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 847694: fstp qword ptr [esp + 0xc]
        if (!R.cL) { pc = 251; continue; } // 847698: jge 0x8476d1
        pc = 245; continue;
      case 245: // 84769a
        R.eax = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 84769a: mov eax, dword ptr [ebp + 8]
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.eax + 0x22) | 0) >>> 0)) & 0xff) << 0)) | 0; // 84769d: mov dl, byte ptr [eax + 0x22]
        R.logic(((R.edx >>> 0) & 0xff) & ((R.edx >>> 0) & 0xff), 8); // 8476a0: test dl, dl
        if (R.zf) { pc = 251; continue; } // 8476a2: je 0x8476d1
        pc = 246; continue;
      case 246: // 8476a4
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 8476a4: fld qword ptr [esp + 0xc]
        R.st[0] = R.st[0] * 4.0; // 8476a8: fmul qword ptr [0x968938]
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 8476ae: fstp qword ptr [esp + 0xc]
        pc = 251; continue; // 8476b2: jmp 0x8476d1
      case 247: // 8476b4
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 8476b4: fld qword ptr [esp + 0xc]
        R.st[0] = R.st[0] * 7.0; // 8476b8: fmul qword ptr [0x968988]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 8476be: test esi, esi
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 8476c0: fstp qword ptr [esp + 0xc]
        if (R.zf) { pc = 250; continue; } // 8476c4: je 0x8476cd
        pc = 248; continue;
      case 248: // 8476c6
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 8476c6: mov eax, dword ptr [esi]
        R.eax = ((R.eax & 0xffff00ff) | (((R.logic(((R.eax >>> 8) & 0xff) | 0x20, 8)) & 0xff) << 8)) | 0; // 8476c8: or ah, 0x20
        pc = 249; continue;
      default: return pc;
    }
  }
}
function f_846920_26(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 249: // 8476cb
        R.m.w32(((R.esi) | 0) >>> 0, (R.eax >>> 0)); // 8476cb: mov dword ptr [esi], eax
        pc = 250; continue;
      case 250: // 8476cd
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.esp + 0x1b) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8476cd: mov cl, byte ptr [esp + 0x1b]
        pc = 251; continue;
      case 251: // 8476d1
        R.eax = (((R.m.u8(((R.ebp + 0x18) | 0) >>> 0)) << 24 >> 24)) | 0; // 8476d1: movsx eax, byte ptr [ebp + 0x18]
        R.m.w32(((R.esp + 0x44) | 0) >>> 0, (R.eax >>> 0)); // 8476d5: mov dword ptr [esp + 0x44], eax
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 8476d9: dec eax
        R.sub((R.eax >>> 0), 0x6, 32); // 8476da: cmp eax, 6
        if (!R.cBE) { pc = 310; continue; } // 8476dd: ja 0x847966
        pc = 252; continue;
      case 252: // 8476e3
        pc = [253, 259, 265, 270, 286, 297, 308][R.eax >>> 0] ?? -2; continue; // 8476e3: jmp dword ptr [eax*4 + 0x849c74]
      case 253: // 8476ea
        R.eax = (R.m.u32(((R.esp + 0x3c) | 0) >>> 0)) | 0; // 8476ea: mov eax, dword ptr [esp + 0x3c]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8476ee: test eax, eax
        if (R.zf) { pc = 257; continue; } // 8476f0: je 0x847720
        pc = 254; continue;
      case 254: // 8476f2
        R.logic(R.m.u8(((R.eax + 0x45) | 0) >>> 0) & 0x10, 8); // 8476f2: test byte ptr [eax + 0x45], 0x10
        if (R.zf) { pc = 257; continue; } // 8476f6: je 0x847720
        pc = 255; continue;
      case 255: // 8476f8
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 8476f8: fld qword ptr [esp + 0xc]
        R.st[0] = R.st[0] + R.st[0]; // 8476fc: fadd st(0), st(0)
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 8476fe: test esi, esi
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 847700: fstp qword ptr [esp + 0xc]
        if (R.zf) { pc = 258; continue; } // 847704: je 0x84772e
        pc = 256; continue;
      case 256: // 847706
        R.fpush(R.f32(((R.esp + 0x50) | 0))); // 847706: fld dword ptr [esp + 0x50]
        R.st[0] = R.st[0] * 1.100000023841858; // 84770a: fmul dword ptr [0x96a33c]
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 847710: mov eax, dword ptr [esi]
        R.eax = ((R.eax & 0xffff00ff) | (((R.logic(((R.eax >>> 8) & 0xff) | 0x40, 8)) & 0xff) << 8)) | 0; // 847712: or ah, 0x40
        R.m.w32(((R.esi) | 0) >>> 0, (R.eax >>> 0)); // 847715: mov dword ptr [esi], eax
        R.m.wf32(((R.esp + 0x50) | 0) >>> 0, R.st[0]); R.fpop(); // 847717: fstp dword ptr [esp + 0x50]
        pc = 310; continue; // 84771b: jmp 0x847966
      case 257: // 847720
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 847720: fld qword ptr [esp + 0xc]
        R.st[0] = R.st[0] * 1.5384615384615383; // 847724: fmul qword ptr [0x96f9b0]
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 84772a: fstp qword ptr [esp + 0xc]
        pc = 258; continue;
      case 258: // 84772e
        R.fpush(R.f32(((R.esp + 0x50) | 0))); // 84772e: fld dword ptr [esp + 0x50]
        R.st[0] = R.st[0] * 1.100000023841858; // 847732: fmul dword ptr [0x96a33c]
        R.m.wf32(((R.esp + 0x50) | 0) >>> 0, R.st[0]); R.fpop(); // 847738: fstp dword ptr [esp + 0x50]
        pc = 310; continue; // 84773c: jmp 0x847966
      case 259: // 847741
        R.eax = (R.m.u32(((R.esp + 0x3c) | 0) >>> 0)) | 0; // 847741: mov eax, dword ptr [esp + 0x3c]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 847745: test eax, eax
        if (R.zf) { pc = 263; continue; } // 847747: je 0x84777b
        pc = 260; continue;
      case 260: // 847749
        R.logic(R.m.u8(((R.eax + 0x45) | 0) >>> 0) & 0x10, 8); // 847749: test byte ptr [eax + 0x45], 0x10
        if (R.zf) { pc = 263; continue; } // 84774d: je 0x84777b
        pc = 261; continue;
      default: return pc;
    }
  }
}
function f_846920_27(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 261: // 84774f
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 84774f: fld qword ptr [esp + 0xc]
        R.st[0] = R.st[0] * 1.6666666666666667; // 847753: fmul qword ptr [0x96f9a8]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 847759: test esi, esi
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 84775b: fstp qword ptr [esp + 0xc]
        if (R.zf) { pc = 264; continue; } // 84775f: je 0x847789
        pc = 262; continue;
      case 262: // 847761
        R.fpush(R.f32(((R.esp + 0x50) | 0))); // 847761: fld dword ptr [esp + 0x50]
        R.st[0] = R.st[0] * 1.0499999523162842; // 847765: fmul dword ptr [0x96d3b8]
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 84776b: mov eax, dword ptr [esi]
        R.eax = ((R.eax & 0xffff00ff) | (((R.logic(((R.eax >>> 8) & 0xff) | 0x40, 8)) & 0xff) << 8)) | 0; // 84776d: or ah, 0x40
        R.m.w32(((R.esi) | 0) >>> 0, (R.eax >>> 0)); // 847770: mov dword ptr [esi], eax
        R.m.wf32(((R.esp + 0x50) | 0) >>> 0, R.st[0]); R.fpop(); // 847772: fstp dword ptr [esp + 0x50]
        pc = 310; continue; // 847776: jmp 0x847966
      case 263: // 84777b
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 84777b: fld qword ptr [esp + 0xc]
        R.st[0] = R.st[0] * 1.3333333333333333; // 84777f: fmul qword ptr [0x96f9a0]
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 847785: fstp qword ptr [esp + 0xc]
        pc = 264; continue;
      case 264: // 847789
        R.fpush(R.f32(((R.esp + 0x50) | 0))); // 847789: fld dword ptr [esp + 0x50]
        R.st[0] = R.st[0] * 1.0499999523162842; // 84778d: fmul dword ptr [0x96d3b8]
        R.m.wf32(((R.esp + 0x50) | 0) >>> 0, R.st[0]); R.fpop(); // 847793: fstp dword ptr [esp + 0x50]
        pc = 310; continue; // 847797: jmp 0x847966
      case 265: // 84779c
        R.eax = (R.m.u32(((R.esp + 0x3c) | 0) >>> 0)) | 0; // 84779c: mov eax, dword ptr [esp + 0x3c]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8477a0: test eax, eax
        if (R.zf) { pc = 267; continue; } // 8477a2: je 0x8477aa
        pc = 266; continue;
      case 266: // 8477a4
        R.logic(R.m.u8(((R.eax + 0x45) | 0) >>> 0) & 0x10, 8); // 8477a4: test byte ptr [eax + 0x45], 0x10
        if (!R.zf) { pc = 268; continue; } // 8477a8: jne 0x8477b8
        pc = 267; continue;
      case 267: // 8477aa
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 8477aa: fld qword ptr [esp + 0xc]
        R.st[0] = R.st[0] * 1.1111111111111112; // 8477ae: fmul qword ptr [0x96f998]
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 8477b4: fstp qword ptr [esp + 0xc]
        pc = 268; continue;
      case 268: // 8477b8
        R.ecx = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 8477b8: mov ecx, dword ptr [ebp + 8]
        R.edx = (R.m.u32(((R.ecx + 0x61) | 0) >>> 0)) | 0; // 8477bb: mov edx, dword ptr [ecx + 0x61]
        R.sub(R.m.u8(((R.edx + 0xf) | 0) >>> 0), 0x14, 8); // 8477be: cmp byte ptr [edx + 0xf], 0x14
        if (!R.zf) { pc = 310; continue; } // 8477c2: jne 0x847966
        pc = 269; continue;
      case 269: // 8477c8
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 8477c8: fld qword ptr [esp + 0xc]
        R.st[0] = R.st[0] * 0.8; // 8477cc: fmul qword ptr [0x9689b0]
        pc = 309; continue; // 8477d2: jmp 0x847962
      case 270: // 8477d7
        R.logic(R.m.u8(((R.esp + 0x64) | 0) >>> 0) & 0x10, 8); // 8477d7: test byte ptr [esp + 0x64], 0x10
        if (R.zf) { pc = 275; continue; } // 8477dc: je 0x84780f
        pc = 271; continue;
      default: return pc;
    }
  }
}
function f_846920_28(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 271: // 8477de
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 8477de: fld qword ptr [esp + 0xc]
        R.eax = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 8477e2: mov eax, dword ptr [ebp + 8]
        R.st[0] = R.st[0] * 0.175; // 8477e5: fmul qword ptr [0x96f990]
        R.edx = (R.m.u32(((R.eax + 0x69) | 0) >>> 0)) | 0; // 8477eb: mov edx, dword ptr [eax + 0x69]
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 8477ee: test edx, edx
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 8477f0: fstp qword ptr [esp + 0xc]
        if (R.zf) { pc = 273; continue; } // 8477f4: je 0x847802
        pc = 272; continue;
      case 272: // 8477f6
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 8477f6: fld qword ptr [esp + 0xc]
        R.st[0] = R.st[0] * 2.6666666666666665; // 8477fa: fmul qword ptr [0x96f988]
        pc = 278; continue; // 847800: jmp 0x84782d
      case 273: // 847802
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 847802: test esi, esi
        if (R.zf) { pc = 279; continue; } // 847804: je 0x847831
        pc = 274; continue;
      case 274: // 847806
        R.edx = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 847806: mov edx, dword ptr [esi]
        R.edx = ((R.edx & 0xffff00ff) | (((R.logic(((R.edx >>> 8) & 0xff) | 0x80, 8)) & 0xff) << 8)) | 0; // 847808: or dh, 0x80
        R.m.w32(((R.esi) | 0) >>> 0, (R.edx >>> 0)); // 84780b: mov dword ptr [esi], edx
        pc = 279; continue; // 84780d: jmp 0x847831
      case 275: // 84780f
        R.eax = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 84780f: mov eax, dword ptr [ebp + 8]
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 847812: fld qword ptr [esp + 0xc]
        R.edx = (R.m.u32(((R.eax + 0x61) | 0) >>> 0)) | 0; // 847816: mov edx, dword ptr [eax + 0x61]
        R.sub(R.m.u8(((R.edx + 0xf) | 0) >>> 0), 0x14, 8); // 847819: cmp byte ptr [edx + 0xf], 0x14
        if (!R.zf) { pc = 277; continue; } // 84781d: jne 0x847827
        pc = 276; continue;
      case 276: // 84781f
        R.st[0] = R.st[0] * 0.15; // 84781f: fmul qword ptr [0x968f20]
        pc = 278; continue; // 847825: jmp 0x84782d
      case 277: // 847827
        R.st[0] = R.st[0] * 0.375; // 847827: fmul qword ptr [0x968fb0]
        pc = 278; continue;
      case 278: // 84782d
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 84782d: fstp qword ptr [esp + 0xc]
        pc = 279; continue;
      case 279: // 847831
        R.sub(((R.ecx >>> 0) & 0xff), 0x17, 8); // 847831: cmp cl, 0x17
        if (R.cLE) { pc = 282; continue; } // 847834: jle 0x847849
        pc = 280; continue;
      case 280: // 847836
        R.sub(((R.ecx >>> 0) & 0xff), 0x20, 8); // 847836: cmp cl, 0x20
        if (!R.cL) { pc = 285; continue; } // 847839: jge 0x847863
        pc = 281; continue;
      case 281: // 84783b
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 84783b: fld qword ptr [esp + 0xc]
        R.st[0] = R.st[0] * 0.5; // 84783f: fmul qword ptr [0x968968]
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 847845: fstp qword ptr [esp + 0xc]
        pc = 282; continue;
      case 282: // 847849
        R.sub(((R.ecx >>> 0) & 0xff), 0x20, 8); // 847849: cmp cl, 0x20
        if (!R.cL) { pc = 285; continue; } // 84784c: jge 0x847863
        pc = 283; continue;
      case 283: // 84784e
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.eax + 0x22) | 0) >>> 0)) & 0xff) << 0)) | 0; // 84784e: mov cl, byte ptr [eax + 0x22]
        R.logic(((R.ecx >>> 0) & 0xff) & ((R.ecx >>> 0) & 0xff), 8); // 847851: test cl, cl
        if (R.zf) { pc = 285; continue; } // 847853: je 0x847863
        pc = 284; continue;
      default: return pc;
    }
  }
}
function f_846920_29(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 284: // 847855
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 847855: fld qword ptr [esp + 0xc]
        R.st[0] = R.st[0] * 0.5; // 847859: fmul qword ptr [0x968968]
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 84785f: fstp qword ptr [esp + 0xc]
        pc = 285; continue;
      case 285: // 847863
        R.fpush(R.f32(((R.esp + 0x50) | 0))); // 847863: fld dword ptr [esp + 0x50]
        R.st[0] = R.st[0] * 0.800000011920929; // 847867: fmul dword ptr [0x96d38c]
        R.m.wf32(((R.esp + 0x50) | 0) >>> 0, R.st[0]); R.fpop(); // 84786d: fstp dword ptr [esp + 0x50]
        pc = 310; continue; // 847871: jmp 0x847966
      case 286: // 847876
        R.logic(R.m.u8(((R.esp + 0x64) | 0) >>> 0) & 0x10, 8); // 847876: test byte ptr [esp + 0x64], 0x10
        if (R.zf) { pc = 289; continue; } // 84787b: je 0x847898
        pc = 287; continue;
      case 287: // 84787d
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 84787d: fld qword ptr [esp + 0xc]
        R.st[0] = R.st[0] * 0.03333333333333333; // 847881: fmul qword ptr [0x969020]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 847887: test esi, esi
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 847889: fstp qword ptr [esp + 0xc]
        if (R.zf) { pc = 293; continue; } // 84788d: je 0x8478ba
        pc = 288; continue;
      case 288: // 84788f
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 84788f: mov eax, dword ptr [esi]
        R.eax = ((R.eax & 0xffff00ff) | (((R.logic(((R.eax >>> 8) & 0xff) | 0x80, 8)) & 0xff) << 8)) | 0; // 847891: or ah, 0x80
        R.m.w32(((R.esi) | 0) >>> 0, (R.eax >>> 0)); // 847894: mov dword ptr [esi], eax
        pc = 293; continue; // 847896: jmp 0x8478ba
      case 289: // 847898
        R.eax = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 847898: mov eax, dword ptr [ebp + 8]
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 84789b: fld qword ptr [esp + 0xc]
        R.edx = (R.m.u32(((R.eax + 0x61) | 0) >>> 0)) | 0; // 84789f: mov edx, dword ptr [eax + 0x61]
        R.sub(R.m.u8(((R.edx + 0xf) | 0) >>> 0), 0x14, 8); // 8478a2: cmp byte ptr [edx + 0xf], 0x14
        if (!R.zf) { pc = 291; continue; } // 8478a6: jne 0x8478b0
        pc = 290; continue;
      case 290: // 8478a8
        R.st[0] = R.st[0] * 0.2; // 8478a8: fmul qword ptr [0x968918]
        pc = 292; continue; // 8478ae: jmp 0x8478b6
      case 291: // 8478b0
        R.st[0] = R.st[0] * 0.4; // 8478b0: fmul qword ptr [0x968e00]
        pc = 292; continue;
      case 292: // 8478b6
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 8478b6: fstp qword ptr [esp + 0xc]
        pc = 293; continue;
      case 293: // 8478ba
        R.sub(((R.ecx >>> 0) & 0xff), 0x20, 8); // 8478ba: cmp cl, 0x20
        if (!R.cL) { pc = 296; continue; } // 8478bd: jge 0x8478d7
        pc = 294; continue;
      case 294: // 8478bf
        R.eax = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 8478bf: mov eax, dword ptr [ebp + 8]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.eax + 0x22) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8478c2: mov cl, byte ptr [eax + 0x22]
        R.logic(((R.ecx >>> 0) & 0xff) & ((R.ecx >>> 0) & 0xff), 8); // 8478c5: test cl, cl
        if (R.zf) { pc = 296; continue; } // 8478c7: je 0x8478d7
        pc = 295; continue;
      case 295: // 8478c9
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 8478c9: fld qword ptr [esp + 0xc]
        R.st[0] = R.st[0] * 0.5; // 8478cd: fmul qword ptr [0x968968]
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 8478d3: fstp qword ptr [esp + 0xc]
        pc = 296; continue;
      default: return pc;
    }
  }
}
function f_846920_30(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 296: // 8478d7
        R.fpush(R.f32(((R.esp + 0x50) | 0))); // 8478d7: fld dword ptr [esp + 0x50]
        R.st[0] = R.st[0] * 0.6700000166893005; // 8478db: fmul dword ptr [0x96f980]
        R.m.wf32(((R.esp + 0x50) | 0) >>> 0, R.st[0]); R.fpop(); // 8478e1: fstp dword ptr [esp + 0x50]
        pc = 310; continue; // 8478e5: jmp 0x847966
      case 297: // 8478e7
        R.logic(R.m.u8(((R.esp + 0x64) | 0) >>> 0) & 0x10, 8); // 8478e7: test byte ptr [esp + 0x64], 0x10
        if (R.zf) { pc = 300; continue; } // 8478ec: je 0x847909
        pc = 298; continue;
      case 298: // 8478ee
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 8478ee: fld qword ptr [esp + 0xc]
        R.st[0] = R.st[0] * 0.02; // 8478f2: fmul qword ptr [0x968a98]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 8478f8: test esi, esi
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 8478fa: fstp qword ptr [esp + 0xc]
        if (R.zf) { pc = 304; continue; } // 8478fe: je 0x84792b
        pc = 299; continue;
      case 299: // 847900
        R.eax = (R.m.u32(((R.esi) | 0) >>> 0)) | 0; // 847900: mov eax, dword ptr [esi]
        R.eax = ((R.eax & 0xffff00ff) | (((R.logic(((R.eax >>> 8) & 0xff) | 0x80, 8)) & 0xff) << 8)) | 0; // 847902: or ah, 0x80
        R.m.w32(((R.esi) | 0) >>> 0, (R.eax >>> 0)); // 847905: mov dword ptr [esi], eax
        pc = 304; continue; // 847907: jmp 0x84792b
      case 300: // 847909
        R.edx = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 847909: mov edx, dword ptr [ebp + 8]
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 84790c: fld qword ptr [esp + 0xc]
        R.eax = (R.m.u32(((R.edx + 0x61) | 0) >>> 0)) | 0; // 847910: mov eax, dword ptr [edx + 0x61]
        R.sub(R.m.u8(((R.eax + 0xf) | 0) >>> 0), 0x14, 8); // 847913: cmp byte ptr [eax + 0xf], 0x14
        if (!R.zf) { pc = 302; continue; } // 847917: jne 0x847921
        pc = 301; continue;
      case 301: // 847919
        R.st[0] = R.st[0] * 0.1; // 847919: fmul qword ptr [0x967880]
        pc = 303; continue; // 84791f: jmp 0x847927
      case 302: // 847921
        R.st[0] = R.st[0] * 0.15; // 847921: fmul qword ptr [0x968f20]
        pc = 303; continue;
      case 303: // 847927
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 847927: fstp qword ptr [esp + 0xc]
        pc = 304; continue;
      case 304: // 84792b
        R.sub(((R.ecx >>> 0) & 0xff), 0x20, 8); // 84792b: cmp cl, 0x20
        if (!R.cL) { pc = 307; continue; } // 84792e: jge 0x847948
        pc = 305; continue;
      case 305: // 847930
        R.ecx = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 847930: mov ecx, dword ptr [ebp + 8]
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ecx + 0x22) | 0) >>> 0)) & 0xff) << 0)) | 0; // 847933: mov al, byte ptr [ecx + 0x22]
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 847936: test al, al
        if (R.zf) { pc = 307; continue; } // 847938: je 0x847948
        pc = 306; continue;
      case 306: // 84793a
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 84793a: fld qword ptr [esp + 0xc]
        R.st[0] = R.st[0] * 0.25; // 84793e: fmul qword ptr [0x9689e0]
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 847944: fstp qword ptr [esp + 0xc]
        pc = 307; continue;
      case 307: // 847948
        R.fpush(R.f32(((R.esp + 0x50) | 0))); // 847948: fld dword ptr [esp + 0x50]
        R.st[0] = R.st[0] * 0.5; // 84794c: fmul dword ptr [0x968f18]
        R.m.wf32(((R.esp + 0x50) | 0) >>> 0, R.st[0]); R.fpop(); // 847952: fstp dword ptr [esp + 0x50]
        pc = 310; continue; // 847956: jmp 0x847966
      default: return pc;
    }
  }
}
function f_846920_31(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 308: // 847958
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 847958: fld qword ptr [esp + 0xc]
        R.st[0] = R.st[0] * 0.002; // 84795c: fmul qword ptr [0x969048]
        pc = 309; continue;
      case 309: // 847962
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 847962: fstp qword ptr [esp + 0xc]
        pc = 310; continue;
      case 310: // 847966
        R.edx = (R.m.u32(((R.edi + 0x53) | 0) >>> 0)) | 0; // 847966: mov edx, dword ptr [edi + 0x53]
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.edx + 0x7e) | 0) >>> 0)) & 0xff) << 0)) | 0; // 847969: mov al, byte ptr [edx + 0x7e]
        R.sub(((R.eax >>> 0) & 0xff), 0x1, 8); // 84796c: cmp al, 1
        if (R.cL) { pc = 312; continue; } // 84796e: jl 0x847974
        pc = 311; continue;
      case 311: // 847970
        R.sub(((R.eax >>> 0) & 0xff), 0x3, 8); // 847970: cmp al, 3
        if (R.cLE) { pc = 313; continue; } // 847972: jle 0x847976
        pc = 312; continue;
      case 312: // 847974
        R.eax = ((R.eax & 0xffffff00) | (((0x3) & 0xff) << 0)) | 0; // 847974: mov al, 3
        pc = 313; continue;
      case 313: // 847976
        { const p = ((R.eax << 24) >> 24) * ((((R.eax >>> 0) & 0xff)) << 24 >> 24); R.eax = ((R.eax & 0xffff0000) | (p & 0xffff)) | 0; R.cf = R.of = ((p << 24) >> 24) !== p; } // 847976: imul al
        R.m.w8(((R.esp + 0x57) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 847978: mov byte ptr [esp + 0x57], al
        R.eax = (R.m.u32(((R.edi + 0x69) | 0) >>> 0)) | 0; // 84797c: mov eax, dword ptr [edi + 0x69]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84797f: test eax, eax
        if (R.zf) { pc = 320; continue; } // 847981: je 0x847a07
        pc = 314; continue;
      case 314: // 847987
        R.eax = (R.m.u32(((R.eax + 0x38) | 0) >>> 0)) | 0; // 847987: mov eax, dword ptr [eax + 0x38]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84798a: test eax, eax
        if (R.zf) { pc = 320; continue; } // 84798c: je 0x847a07
        pc = 315; continue;
      case 315: // 84798e
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.eax + 0x33) | 0) >>> 0)) & 0xff) << 0)) | 0; // 84798e: mov al, byte ptr [eax + 0x33]
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 847991: test al, al
        if (!R.zf) { pc = 317; continue; } // 847993: jne 0x8479ab
        pc = 316; continue;
      case 316: // 847995
        R.eax = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 847995: mov eax, dword ptr [ebp + 0xc]
        R.edi = ((R.edi & 0xffff0000) | (((R.m.u16(((R.eax + 0x80) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 847998: mov di, word ptr [eax + 0x80]
        R.esi = (((((R.edi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 84799f: movsx esi, di
        R.eax = ((R.esi >>> 0)) | 0; // 8479a2: mov eax, esi
        R.edx = R.eax < 0 ? -1 : 0; // 8479a4: cdq 
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 8479a5: sub eax, edx
        R.eax = (R.sar((R.eax >>> 0), 0x1, 32)) | 0; // 8479a7: sar eax, 1
        pc = 321; continue; // 8479a9: jmp 0x847a27
      default: return pc;
    }
  }
}
function f_846920_32(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 317: // 8479ab
        R.ebx = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 8479ab: mov ebx, dword ptr [ebp + 0xc]
        R.ecx = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 8479ae: movsx ecx, al
        R.edi = ((R.edi & 0xffff0000) | (((R.m.u16(((R.ebx + 0x80) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 8479b1: mov di, word ptr [ebx + 0x80]
        R.eax = (0x88888889) | 0; // 8479b8: mov eax, 0x88888889
        R.esi = (((((R.edi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 8479bd: movsx esi, di
        { const p = BigInt((((R.esi >>> 0)) | 0)) * BigInt((((R.ecx >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.ecx = (Number(BigInt.asIntN(32, p))) | 0; } // 8479c0: imul ecx, esi
        { const p = BigInt(R.eax | 0) * BigInt((((R.ecx >>> 0)) | 0)); R.eax = Number(BigInt.asIntN(32, p)); R.edx = Number(BigInt.asIntN(32, p >> 32n)); R.cf = R.of = BigInt.asIntN(32, p) !== p; } // 8479c3: imul ecx
        R.edx = (R.add((R.edx >>> 0), (R.ecx >>> 0), 32)) | 0; // 8479c5: add edx, ecx
        R.m.w32(((R.esp + 0x58) | 0) >>> 0, (R.esi >>> 0)); // 8479c7: mov dword ptr [esp + 0x58], esi
        R.fpush(R.m.s32(((R.esp + 0x58) | 0) >>> 0)); // 8479cb: fild dword ptr [esp + 0x58]
        R.edx = (R.sar((R.edx >>> 0), 0x3, 32)) | 0; // 8479cf: sar edx, 3
        R.ecx = ((R.edx >>> 0)) | 0; // 8479d2: mov ecx, edx
        R.st[0] = R.st[0] * 0.2857142857142857; // 8479d4: fmul qword ptr [0x96d5e0]
        R.ecx = (R.shr((R.ecx >>> 0), 0x1f, 32)) | 0; // 8479da: shr ecx, 0x1f
        R.edx = (R.add((R.edx >>> 0), (R.ecx >>> 0), 32)) | 0; // 8479dd: add edx, ecx
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.edx >>> 0)); // 8479df: mov dword ptr [esp + 0x1c], edx
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 8479e3: fild dword ptr [esp + 0x1c]
        R.m.wf64(((R.esp + 0x1c) | 0) >>> 0, R.st[0]); R.fpop(); // 8479e7: fstp qword ptr [esp + 0x1c]
        R.fcom(R.st[0], R.f64(((R.esp + 0x1c) | 0))); // 8479eb: fcom qword ptr [esp + 0x1c]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8479ef: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 8479f1: test ah, 0x41
        if (R.zf) { pc = 319; continue; } // 8479f4: je 0x8479fc
        pc = 318; continue;
      case 318: // 8479f6
        R.fpop(); // 8479f6: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x1c) | 0))); // 8479f8: fld qword ptr [esp + 0x1c]
        pc = 319; continue;
      case 319: // 8479fc
        R.ftol(); // 8479fc: call 0x945640
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, (R.eax >>> 0)); // 847a01: mov dword ptr [esp + 0x34], eax
        pc = 322; continue; // 847a05: jmp 0x847a2e
      case 320: // 847a07
        R.edx = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 847a07: mov edx, dword ptr [ebp + 0xc]
        R.edi = ((R.edi & 0xffff0000) | (((R.m.u16(((R.edx + 0x80) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 847a0a: mov di, word ptr [edx + 0x80]
        R.esi = (((((R.edi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 847a11: movsx esi, di
        R.m.w32(((R.esp + 0x58) | 0) >>> 0, (R.esi >>> 0)); // 847a14: mov dword ptr [esp + 0x58], esi
        R.fpush(R.m.s32(((R.esp + 0x58) | 0) >>> 0)); // 847a18: fild dword ptr [esp + 0x58]
        R.st[0] = R.st[0] * 0.2857142857142857; // 847a1c: fmul qword ptr [0x96d5e0]
        R.ftol(); // 847a22: call 0x945640
        pc = 321; continue;
      case 321: // 847a27
        R.ebx = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 847a27: mov ebx, dword ptr [ebp + 0xc]
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, (R.eax >>> 0)); // 847a2a: mov dword ptr [esp + 0x34], eax
        pc = 322; continue;
      case 322: // 847a2e
        R.eax = (R.m.u32(((R.ebx + 0x57) | 0) >>> 0)) | 0; // 847a2e: mov eax, dword ptr [ebx + 0x57]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 847a31: test eax, eax
        if (R.zf) { pc = 331; continue; } // 847a33: je 0x847a9a
        pc = 323; continue;
      case 323: // 847a35
        R.sub(((R.edi >>> 0) & 0xffff), 0x1d4c, 16); // 847a35: cmp di, 0x1d4c
        if (R.cL) { pc = 328; continue; } // 847a3a: jl 0x847a65
        pc = 324; continue;
      case 324: // 847a3c
        R.sub(R.m.u32(((R.ebx + 0x73) | 0) >>> 0), 0x88b8, 32); // 847a3c: cmp dword ptr [ebx + 0x73], 0x88b8
        if (R.cLE) { pc = 328; continue; } // 847a43: jle 0x847a65
        pc = 325; continue;
      default: return pc;
    }
  }
}
function f_846920_33(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 325: // 847a45
        R.eax = (((R.m.u16(((R.eax + 0x69) | 0) >>> 0)) << 16 >> 16)) | 0; // 847a45: movsx eax, word ptr [eax + 0x69]
        R.ecx = (((R.eax + R.eax * 2) | 0)) | 0; // 847a49: lea ecx, [eax + eax*2]
        R.eax = (((R.eax + R.ecx * 8) | 0)) | 0; // 847a4c: lea eax, [eax + ecx*8]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 847a4f: lea eax, [eax + eax*4]
        R.eax = (R.shl((R.eax >>> 0), 0x2, 32)) | 0; // 847a52: shl eax, 2
        R.sub((R.eax >>> 0), (R.esi >>> 0), 32); // 847a55: cmp eax, esi
        if (R.cLE) { pc = 327; continue; } // 847a57: jle 0x847a5f
        pc = 326; continue;
      case 326: // 847a59
        R.m.w32(((R.esp + 0x68) | 0) >>> 0, (R.eax >>> 0)); // 847a59: mov dword ptr [esp + 0x68], eax
        pc = 332; continue; // 847a5d: jmp 0x847a9e
      case 327: // 847a5f
        R.m.w32(((R.esp + 0x68) | 0) >>> 0, (R.esi >>> 0)); // 847a5f: mov dword ptr [esp + 0x68], esi
        pc = 332; continue; // 847a63: jmp 0x847a9e
      case 328: // 847a65
        R.ecx = (((R.m.u16(((R.eax + 0x69) | 0) >>> 0)) << 16 >> 16)) | 0; // 847a65: movsx ecx, word ptr [eax + 0x69]
        R.eax = ((R.esi >>> 0)) | 0; // 847a69: mov eax, esi
        R.edx = R.eax < 0 ? -1 : 0; // 847a6b: cdq 
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 847a6c: sub eax, edx
        R.edx = ((R.eax >>> 0)) | 0; // 847a6e: mov edx, eax
        R.eax = (((R.ecx + R.ecx * 2) | 0)) | 0; // 847a70: lea eax, [ecx + ecx*2]
        R.edx = (R.sar((R.edx >>> 0), 0x1, 32)) | 0; // 847a73: sar edx, 1
        R.eax = (((R.ecx + R.eax * 8) | 0)) | 0; // 847a75: lea eax, [ecx + eax*8]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 847a78: lea eax, [eax + eax*4]
        R.edx = (((R.edx + R.eax * 2) | 0)) | 0; // 847a7b: lea edx, [edx + eax*2]
        R.eax = (((R.ecx + R.ecx * 2) | 0)) | 0; // 847a7e: lea eax, [ecx + ecx*2]
        R.eax = (((R.ecx + R.eax * 8) | 0)) | 0; // 847a81: lea eax, [ecx + eax*8]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 847a84: lea eax, [eax + eax*4]
        R.eax = (R.shl((R.eax >>> 0), 0x2, 32)) | 0; // 847a87: shl eax, 2
        R.sub((R.eax >>> 0), (R.edx >>> 0), 32); // 847a8a: cmp eax, edx
        if (R.cLE) { pc = 330; continue; } // 847a8c: jle 0x847a94
        pc = 329; continue;
      case 329: // 847a8e
        R.m.w32(((R.esp + 0x68) | 0) >>> 0, (R.eax >>> 0)); // 847a8e: mov dword ptr [esp + 0x68], eax
        pc = 332; continue; // 847a92: jmp 0x847a9e
      case 330: // 847a94
        R.m.w32(((R.esp + 0x68) | 0) >>> 0, (R.edx >>> 0)); // 847a94: mov dword ptr [esp + 0x68], edx
        pc = 332; continue; // 847a98: jmp 0x847a9e
      case 331: // 847a9a
        R.m.w32(((R.esp + 0x68) | 0) >>> 0, (R.edi >>> 0)); // 847a9a: mov dword ptr [esp + 0x68], edi
        pc = 332; continue;
      case 332: // 847a9e
        R.eax = (R.m.u32(((R.ebx + 0x1db) | 0) >>> 0)) | 0; // 847a9e: mov eax, dword ptr [ebx + 0x1db]
        R.sub((R.eax >>> 0), 0xffffffff, 32); // 847aa4: cmp eax, -1
        if (R.cLE) { pc = 335; continue; } // 847aa7: jle 0x847ab8
        pc = 333; continue;
      case 333: // 847aa9
        R.sub((R.eax >>> 0), R.m.u32(((0x9cf6f8) | 0) >>> 0), 32); // 847aa9: cmp eax, dword ptr [0x9cf6f8]
        if (!R.zf) { pc = 336; continue; } // 847aaf: jne 0x847acf
        pc = 334; continue;
      case 334: // 847ab1
        R.sub(((R.edi >>> 0) & 0xffff), 0x1388, 16); // 847ab1: cmp di, 0x1388
        if (R.cL) { pc = 336; continue; } // 847ab6: jl 0x847acf
        pc = 335; continue;
      default: return pc;
    }
  }
}
function f_846920_34(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 335: // 847ab8
        R.eax = (R.m.u32(((R.ebx) | 0) >>> 0)) | 0; // 847ab8: mov eax, dword ptr [ebx]
        R.edx = (R.m.u32(((0xae2d14) | 0) >>> 0)) | 0; // 847aba: mov edx, dword ptr [0xae2d14]
        R.ecx = (((R.eax + R.eax * 2) | 0)) | 0; // 847ac0: lea ecx, [eax + eax*2]
        R.eax = (R.m.u32(((R.edx + R.ecx * 2) | 0) >>> 0)) | 0; // 847ac3: mov eax, dword ptr [edx + ecx*2]
        R.sub((R.eax >>> 0), 0xffffffff, 32); // 847ac6: cmp eax, -1
        if (R.cLE) { pc = 345; continue; } // 847ac9: jle 0x847b5c
        pc = 336; continue;
      case 336: // 847acf
        R.ecx = (((R.eax + R.eax * 2) | 0)) | 0; // 847acf: lea ecx, [eax + eax*2]
        R.ecx = (((R.ecx + R.ecx * 8) | 0)) | 0; // 847ad2: lea ecx, [ecx + ecx*8]
        R.ecx = (R.shl((R.ecx >>> 0), 0x2, 32)) | 0; // 847ad5: shl ecx, 2
        R.ecx = (R.sub((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 847ad8: sub ecx, eax
        R.eax = (R.m.u32(((0xae23d0) | 0) >>> 0)) | 0; // 847ada: mov eax, dword ptr [0xae23d0]
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 847adf: add ecx, eax
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 847ae1: test ecx, ecx
        R.m.w32(((R.esp + 0x80) | 0) >>> 0, (R.ecx >>> 0)); // 847ae3: mov dword ptr [esp + 0x80], ecx
        if (R.zf) { pc = 345; continue; } // 847aea: je 0x847b5c
        pc = 337; continue;
      case 337: // 847aec
        R.eax = (R.m.u32(((R.ecx) | 0) >>> 0)) | 0; // 847aec: mov eax, dword ptr [ecx]
        R.edx = (R.m.u32(((0x9cf6e8) | 0) >>> 0)) | 0; // 847aee: mov edx, dword ptr [0x9cf6e8]
        R.sub((R.eax >>> 0), (R.edx >>> 0), 32); // 847af4: cmp eax, edx
        if (!R.zf) { pc = 339; continue; } // 847af6: jne 0x847aff
        pc = 338; continue;
      case 338: // 847af8
        R.esi = (0x3a98) | 0; // 847af8: mov esi, 0x3a98
        pc = 340; continue; // 847afd: jmp 0x847b08
      case 339: // 847aff
        R.esi = ((R.esi & 0xffff0000) | (((R.m.u16(((R.ecx + 0x69) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 847aff: mov si, word ptr [ecx + 0x69]
        { const p = BigInt(((((R.esi >>> 0) & 0xffff)) << 16 >> 16)) * BigInt(600); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.esi = ((R.esi & 0xffff0000) | (((Number(BigInt.asIntN(32, p))) & 0xffff) << 0)) | 0; } // 847b03: imul si, si, 0x258
        pc = 340; continue;
      case 340: // 847b08
        R.ecx = (R.m.u32(((0xadadfc) | 0) >>> 0)) | 0; // 847b08: mov ecx, dword ptr [0xadadfc]
        R.push((R.ebx >>> 0)); // 847b0e: push ebx
        R.m.w32(((R.esp + 0x70) | 0) >>> 0, (R.esi >>> 0)); // 847b0f: mov dword ptr [esp + 0x70], esi
        R.edx = (R.m.u32(((R.ecx + R.eax * 4) | 0) >>> 0)) | 0; // 847b13: mov edx, dword ptr [ecx + eax*4]
        R.ecx = (R.m.u32(((R.edx + 0x8) | 0) >>> 0)) | 0; // 847b16: mov ecx, dword ptr [edx + 8]
        R.call(0x4a4850, { n: 1, thisEcx: true, calleeClean: true }); // 847b19: call 0x4a4850
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 847b1e: test eax, eax
        if (R.zf) { pc = 348; continue; } // 847b20: je 0x847b8d
        pc = 341; continue;
      case 341: // 847b22
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.eax + 0x4) | 0) >>> 0)) & 0xff) << 0)) | 0; // 847b22: mov cl, byte ptr [eax + 4]
        R.logic(((R.ecx >>> 0) & 0xff) & ((R.ecx >>> 0) & 0xff), 8); // 847b25: test cl, cl
        if (!R.zf) { pc = 348; continue; } // 847b27: jne 0x847b8d
        pc = 342; continue;
      case 342: // 847b29
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.eax + 0x72) | 0) >>> 0)) & 0xff) << 0)) | 0; // 847b29: mov al, byte ptr [eax + 0x72]
        R.sub(((R.eax >>> 0) & 0xff), 0x1, 8); // 847b2c: cmp al, 1
        if (R.cf) { pc = 348; continue; } // 847b2e: jb 0x847b8d
        pc = 343; continue;
      case 343: // 847b30
        R.sub(((R.eax >>> 0) & 0xff), 0x10, 8); // 847b30: cmp al, 0x10
        if (!R.cBE) { pc = 348; continue; } // 847b32: ja 0x847b8d
        pc = 344; continue;
      default: return pc;
    }
  }
}
function f_846920_35(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 344: // 847b34
        R.eax = (R.logic((R.eax >>> 0) & 0xff, 32)) | 0; // 847b34: and eax, 0xff
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.eax >>> 0)); // 847b39: mov dword ptr [esp + 0x1c], eax
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 847b3d: fild dword ptr [esp + 0x1c]
        R.eax = (((((R.esi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 847b41: movsx eax, si
        R.st[0] = R.st[0] * 0.02; // 847b44: fmul qword ptr [0x968a98]
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.eax >>> 0)); // 847b4a: mov dword ptr [esp + 0x1c], eax
        R.st[0] = 1.32 - R.st[0]; // 847b4e: fsubr qword ptr [0x96af38]
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 847b54: fild dword ptr [esp + 0x1c]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 847b58: fmulp st(1)
        pc = 347; continue; // 847b5a: jmp 0x847b84
      case 345: // 847b5c
        R.ecx = (((R.m.u16(((R.esp + 0x68) | 0) >>> 0)) << 16 >> 16)) | 0; // 847b5c: movsx ecx, word ptr [esp + 0x68]
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.ecx >>> 0)); // 847b61: mov dword ptr [esp + 0x1c], ecx
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 847b65: fild dword ptr [esp + 0x1c]
        R.st[0] = R.st[0] * 0.8; // 847b69: fmul qword ptr [0x9689b0]
        R.fcom(R.st[0], 7000.0); // 847b6f: fcom qword ptr [0x96d470]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 847b75: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 847b77: test ah, 1
        if (!R.zf) { pc = 347; continue; } // 847b7a: jne 0x847b84
        pc = 346; continue;
      case 346: // 847b7c
        R.fpop(); // 847b7c: fstp st(0)
        R.fpush(7000.0); // 847b7e: fld qword ptr [0x96d470]
        pc = 347; continue;
      case 347: // 847b84
        R.ftol(); // 847b84: call 0x945640
        R.m.w32(((R.esp + 0x6c) | 0) >>> 0, (R.eax >>> 0)); // 847b89: mov dword ptr [esp + 0x6c], eax
        pc = 348; continue;
      case 348: // 847b8d
        R.eax = (R.m.u32(((R.ebx + 0xcf) | 0) >>> 0)) | 0; // 847b8d: mov eax, dword ptr [ebx + 0xcf]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 847b93: test eax, eax
        if (!R.zf) { pc = 350; continue; } // 847b95: jne 0x847b9e
        pc = 349; continue;
      case 349: // 847b97
        R.edi = (R.logic((R.edi >>> 0) ^ (R.edi >>> 0), 32)) | 0; // 847b97: xor edi, edi
        pc = 362; continue; // 847b99: jmp 0x847ccb
      case 350: // 847b9e
        R.ecx = (R.m.u32(((R.eax + 0x69) | 0) >>> 0)) | 0; // 847b9e: mov ecx, dword ptr [eax + 0x69]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 847ba1: test ecx, ecx
        if (!R.zf) { pc = 352; continue; } // 847ba3: jne 0x847bac
        pc = 351; continue;
      case 351: // 847ba5
        R.edi = (R.logic((R.edi >>> 0) ^ (R.edi >>> 0), 32)) | 0; // 847ba5: xor edi, edi
        pc = 362; continue; // 847ba7: jmp 0x847ccb
      case 352: // 847bac
        R.edx = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 847bac: mov edx, dword ptr [ebp + 8]
        R.push(0x1); // 847baf: push 1
        R.push((R.edx >>> 0)); // 847bb1: push edx
        R.push((R.eax >>> 0)); // 847bb2: push eax
        R.call(0x5407e0, { n: 3, thisEcx: false, calleeClean: false }); // 847bb3: call 0x5407e0
        R.ecx = (R.m.u32(((0xb67a44) | 0) >>> 0)) | 0; // 847bb8: mov ecx, dword ptr [0xb67a44]
        R.esp = (R.add((R.esp >>> 0), 0xc, 32)) | 0; // 847bbe: add esp, 0xc
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 847bc1: test ecx, ecx
        R.edi = ((R.eax >>> 0)) | 0; // 847bc3: mov edi, eax
        if (R.zf) { pc = 362; continue; } // 847bc5: je 0x847ccb
        pc = 353; continue;
      default: return pc;
    }
  }
}
function f_846920_36(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 353: // 847bcb
        R.logic((R.ebx >>> 0) & (R.ebx >>> 0), 32); // 847bcb: test ebx, ebx
        if (!R.zf) { pc = 355; continue; } // 847bcd: jne 0x847bd7
        pc = 354; continue;
      case 354: // 847bcf
        R.ecx = (R.logic((R.ecx >>> 0) ^ (R.ecx >>> 0), 32)) | 0; // 847bcf: xor ecx, ecx
        R.edx = (R.logic((R.edx >>> 0) ^ (R.edx >>> 0), 32)) | 0; // 847bd1: xor edx, edx
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 847bd3: xor eax, eax
        pc = 356; continue; // 847bd5: jmp 0x847bf0
      case 355: // 847bd7
        R.eax = (R.m.u32(((R.ebx) | 0) >>> 0)) | 0; // 847bd7: mov eax, dword ptr [ebx]
        R.ecx = (R.m.u32(((R.ecx) | 0) >>> 0)) | 0; // 847bd9: mov ecx, dword ptr [ecx]
        R.edx = (((R.eax + R.eax * 8) | 0)) | 0; // 847bdb: lea edx, [eax + eax*8]
        R.eax = (((R.eax + R.edx * 8) | 0)) | 0; // 847bde: lea eax, [eax + edx*8]
        R.edx = ((R.edx & 0xffff0000) | (((R.m.u16(((R.eax + R.ecx + 0x8) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 847be1: mov dx, word ptr [eax + ecx + 8]
        R.eax = (R.add((R.eax >>> 0), (R.ecx >>> 0), 32)) | 0; // 847be6: add eax, ecx
        R.ecx = ((R.ecx & 0xffff0000) | (((R.m.u16(((R.eax + 0x6) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 847be8: mov cx, word ptr [eax + 6]
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.eax + 0xa) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 847bec: mov ax, word ptr [eax + 0xa]
        pc = 356; continue;
      case 356: // 847bf0
        R.eax = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 847bf0: movsx eax, ax
        R.edx = (((((R.edx >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 847bf3: movsx edx, dx
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.eax >>> 0)); // 847bf6: mov dword ptr [esp + 0x1c], eax
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 847bfa: fild dword ptr [esp + 0x1c]
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.edx >>> 0)); // 847bfe: mov dword ptr [esp + 0x1c], edx
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 847c02: fild dword ptr [esp + 0x1c]
        R.eax = (((((R.ecx >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 847c06: movsx eax, cx
        R.st[1] = R.st[1] + R.st[0]; R.fpop(); // 847c09: faddp st(1)
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.eax >>> 0)); // 847c0b: mov dword ptr [esp + 0x1c], eax
        R.st[0] = R.st[0] * 0.25; // 847c0f: fmul qword ptr [0x9689e0]
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 847c15: fild dword ptr [esp + 0x1c]
        R.st[0] = R.st[0] * 0.5; // 847c19: fmul qword ptr [0x968968]
        R.st[1] = R.st[1] + R.st[0]; R.fpop(); // 847c1f: faddp st(1)
        R.ftol(); // 847c21: call 0x945640
        R.sub(((R.eax >>> 0) & 0xffff), 0x1388, 16); // 847c26: cmp ax, 0x1388
        if (!R.cL) { pc = 359; continue; } // 847c2a: jge 0x847c79
        pc = 357; continue;
      case 357: // 847c2c
        R.ecx = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 847c2c: movsx ecx, ax
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.ecx >>> 0)); // 847c2f: mov dword ptr [esp + 0x1c], ecx
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 847c33: fild dword ptr [esp + 0x1c]
        R.edx = (((((R.edi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 847c37: movsx edx, di
        R.st[0] = R.st[0] * 0.0008; // 847c3a: fmul qword ptr [0x96a618]
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.edx >>> 0)); // 847c40: mov dword ptr [esp + 0x1c], edx
        R.st[0] = 5.0 - R.st[0]; // 847c44: fsubr qword ptr [0x9688a0]
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 847c4a: fild dword ptr [esp + 0x1c]
        R.fpush(R.st[0]); // 847c4e: fld st(0)
        R.st[0] = R.st[0] / R.st[2]; // 847c50: fdiv st(2)
        R.m.wf64(((R.esp + 0x1c) | 0) >>> 0, R.st[0]); R.fpop(); // 847c52: fstp qword ptr [esp + 0x1c]
        { const t = R.st[0]; R.st[0] = R.st[1]; R.st[1] = t; } // 847c56: fxch st(1)
        R.st[0] = R.st[0] * 1000.0; // 847c58: fmul qword ptr [0x968908]
        R.st[0] = R.st[1] - R.st[0]; // 847c5e: fsubr st(1)
        { const t = R.st[0]; R.st[0] = R.st[1]; R.st[1] = t; } // 847c60: fxch st(1)
        R.fpop(); // 847c62: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x1c) | 0))); // 847c64: fld qword ptr [esp + 0x1c]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 847c68: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 847c6a: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 847c6c: test ah, 0x41
        if (!R.zf) { pc = 361; continue; } // 847c6f: jne 0x847cc4
        pc = 358; continue;
      default: return pc;
    }
  }
}
function f_846920_37(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 358: // 847c71
        R.fpop(); // 847c71: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x1c) | 0))); // 847c73: fld qword ptr [esp + 0x1c]
        pc = 361; continue; // 847c77: jmp 0x847cc4
      case 359: // 847c79
        R.eax = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 847c79: movsx eax, ax
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.eax >>> 0)); // 847c7c: mov dword ptr [esp + 0x1c], eax
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 847c80: fild dword ptr [esp + 0x1c]
        R.ecx = (((((R.edi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 847c84: movsx ecx, di
        R.st[0] = R.st[0] * 0.0001; // 847c87: fmul qword ptr [0x96a5c0]
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.ecx >>> 0)); // 847c8d: mov dword ptr [esp + 0x1c], ecx
        R.st[0] = R.st[0] + 0.5; // 847c91: fadd qword ptr [0x968968]
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 847c97: fild dword ptr [esp + 0x1c]
        R.fpush(R.st[1]); // 847c9b: fld st(1)
        R.st[0] = R.st[0] * R.st[1]; // 847c9d: fmul st(1)
        R.m.wf64(((R.esp + 0x1c) | 0) >>> 0, R.st[0]); R.fpop(); // 847c9f: fstp qword ptr [esp + 0x1c]
        { const t = R.st[0]; R.st[0] = R.st[1]; R.st[1] = t; } // 847ca3: fxch st(1)
        R.st[0] = R.st[0] * 1000.0; // 847ca5: fmul qword ptr [0x968908]
        R.st[0] = R.st[0] + R.st[1]; // 847cab: fadd st(1)
        { const t = R.st[0]; R.st[0] = R.st[1]; R.st[1] = t; } // 847cad: fxch st(1)
        R.fpop(); // 847caf: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x1c) | 0))); // 847cb1: fld qword ptr [esp + 0x1c]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 847cb5: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 847cb7: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 847cb9: test ah, 1
        if (R.zf) { pc = 361; continue; } // 847cbc: je 0x847cc4
        pc = 360; continue;
      case 360: // 847cbe
        R.fpop(); // 847cbe: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x1c) | 0))); // 847cc0: fld qword ptr [esp + 0x1c]
        pc = 361; continue;
      case 361: // 847cc4
        R.ftol(); // 847cc4: call 0x945640
        R.edi = ((R.eax >>> 0)) | 0; // 847cc9: mov edi, eax
        pc = 362; continue;
      case 362: // 847ccb
        R.ecx = (R.m.u32(((0xae2a38) | 0) >>> 0)) | 0; // 847ccb: mov ecx, dword ptr [0xae2a38]
        R.esi = ((R.esi & 0xffff0000) | (((R.m.u16(((R.ebx + 0x80) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 847cd1: mov si, word ptr [ebx + 0x80]
        R.push((R.ebx >>> 0)); // 847cd8: push ebx
        R.call(0x5a0590, { n: 1, thisEcx: true, calleeClean: true }); // 847cd9: call 0x5a0590
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 847cde: test eax, eax
        if (R.zf) { pc = 371; continue; } // 847ce0: je 0x847d6c
        pc = 363; continue;
      case 363: // 847ce6
        R.sub(R.m.u8(((R.esp + 0x57) | 0) >>> 0), 0x1, 8); // 847ce6: cmp byte ptr [esp + 0x57], 1
        if (!R.zf) { pc = 371; continue; } // 847ceb: jne 0x847d6c
        pc = 364; continue;
      case 364: // 847ced
        R.ecx = ((R.eax >>> 0)) | 0; // 847ced: mov ecx, eax
        R.call(0x5986b0, { n: 0, thisEcx: true, calleeClean: false }); // 847cef: call 0x5986b0
        R.eax = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 847cf4: movsx eax, al
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 847cf7: dec eax
        if (R.zf) { pc = 368; continue; } // 847cf8: je 0x847d32
        pc = 365; continue;
      case 365: // 847cfa
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 847cfa: dec eax
        if (!R.zf) { pc = 371; continue; } // 847cfb: jne 0x847d6c
        pc = 366; continue;
      default: return pc;
    }
  }
}
function f_846920_38(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 366: // 847cfd
        R.eax = (((((R.esi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 847cfd: movsx eax, si
        R.m.w32(((R.esp + 0x58) | 0) >>> 0, (R.eax >>> 0)); // 847d00: mov dword ptr [esp + 0x58], eax
        R.eax = (R.add((R.eax >>> 0), 0x5dc, 32)) | 0; // 847d04: add eax, 0x5dc
        R.fpush(R.m.s32(((R.esp + 0x58) | 0) >>> 0)); // 847d09: fild dword ptr [esp + 0x58]
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.eax >>> 0)); // 847d0d: mov dword ptr [esp + 0x1c], eax
        R.st[0] = R.st[0] * 1.5; // 847d11: fmul qword ptr [0x968940]
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 847d17: fild dword ptr [esp + 0x1c]
        R.m.wf64(((R.esp + 0x1c) | 0) >>> 0, R.st[0]); R.fpop(); // 847d1b: fstp qword ptr [esp + 0x1c]
        R.fcom(R.st[0], R.f64(((R.esp + 0x1c) | 0))); // 847d1f: fcom qword ptr [esp + 0x1c]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 847d23: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 847d25: test ah, 0x41
        if (R.zf) { pc = 370; continue; } // 847d28: je 0x847d65
        pc = 367; continue;
      case 367: // 847d2a
        R.fpop(); // 847d2a: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x1c) | 0))); // 847d2c: fld qword ptr [esp + 0x1c]
        pc = 370; continue; // 847d30: jmp 0x847d65
      case 368: // 847d32
        R.eax = (((((R.esi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 847d32: movsx eax, si
        R.m.w32(((R.esp + 0x58) | 0) >>> 0, (R.eax >>> 0)); // 847d35: mov dword ptr [esp + 0x58], eax
        R.eax = (R.add((R.eax >>> 0), 0x2ee, 32)) | 0; // 847d39: add eax, 0x2ee
        R.fpush(R.m.s32(((R.esp + 0x58) | 0) >>> 0)); // 847d3e: fild dword ptr [esp + 0x58]
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.eax >>> 0)); // 847d42: mov dword ptr [esp + 0x1c], eax
        R.st[0] = R.st[0] * 1.25; // 847d46: fmul qword ptr [0x968928]
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 847d4c: fild dword ptr [esp + 0x1c]
        R.m.wf64(((R.esp + 0x1c) | 0) >>> 0, R.st[0]); R.fpop(); // 847d50: fstp qword ptr [esp + 0x1c]
        R.fcom(R.st[0], R.f64(((R.esp + 0x1c) | 0))); // 847d54: fcom qword ptr [esp + 0x1c]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 847d58: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 847d5a: test ah, 0x41
        if (R.zf) { pc = 370; continue; } // 847d5d: je 0x847d65
        pc = 369; continue;
      case 369: // 847d5f
        R.fpop(); // 847d5f: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x1c) | 0))); // 847d61: fld qword ptr [esp + 0x1c]
        pc = 370; continue;
      case 370: // 847d65
        R.ftol(); // 847d65: call 0x945640
        R.esi = ((R.eax >>> 0)) | 0; // 847d6a: mov esi, eax
        pc = 371; continue;
      case 371: // 847d6c
        R.eax = (R.m.u32(((R.ebx) | 0) >>> 0)) | 0; // 847d6c: mov eax, dword ptr [ebx]
        R.edx = (((R.eax + R.eax * 8) | 0)) | 0; // 847d6e: lea edx, [eax + eax*8]
        R.eax = (R.m.u32(((R.esp + 0x24) | 0) >>> 0)) | 0; // 847d71: mov eax, dword ptr [esp + 0x24]
        R.ecx = (R.m.u32(((R.eax + 0xdc) | 0) >>> 0)) | 0; // 847d75: mov ecx, dword ptr [eax + 0xdc]
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.edx + R.ecx + 0x5) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 847d7b: mov ax, word ptr [edx + ecx + 5]
        R.sub(((R.esi >>> 0) & 0xffff), ((R.eax >>> 0) & 0xffff), 16); // 847d80: cmp si, ax
        if (R.cLE) { pc = 373; continue; } // 847d83: jle 0x847d87
        pc = 372; continue;
      case 372: // 847d85
        R.eax = ((R.esi >>> 0)) | 0; // 847d85: mov eax, esi
        pc = 373; continue;
      default: return pc;
    }
  }
}
function f_846920_39(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 373: // 847d87
        R.edx = (((((R.esi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 847d87: movsx edx, si
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.edx >>> 0)); // 847d8a: mov dword ptr [esp + 0x1c], edx
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 847d8e: fild dword ptr [esp + 0x1c]
        R.eax = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 847d92: movsx eax, ax
        R.st[0] = R.st[0] * 0.65; // 847d95: fmul qword ptr [0x96a5d0]
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.eax >>> 0)); // 847d9b: mov dword ptr [esp + 0x1c], eax
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 847d9f: fild dword ptr [esp + 0x1c]
        R.st[0] = R.st[0] * 0.35; // 847da3: fmul qword ptr [0x969510]
        R.st[1] = R.st[1] + R.st[0]; R.fpop(); // 847da9: faddp st(1)
        R.ftol(); // 847dab: call 0x945640
        R.fpush(R.f32(((R.esp + 0x50) | 0))); // 847db0: fld dword ptr [esp + 0x50]
        R.st[0] = R.st[0] + R.f32(((R.esp + 0x7c) | 0)); // 847db4: fadd dword ptr [esp + 0x7c]
        R.ecx = ((R.eax >>> 0)) | 0; // 847db8: mov ecx, eax
        R.st[0] = R.st[0] + R.f32(((R.esp + 0x5c) | 0)); // 847dba: fadd dword ptr [esp + 0x5c]
        R.st[0] = R.st[0] + 2.0; // 847dbe: fadd dword ptr [0x9689a8]
        R.m.wf32(((R.esp + 0x58) | 0) >>> 0, R.st[0]); // 847dc4: fst dword ptr [esp + 0x58]
        R.fcom(R.st[0], 0.0); R.fpop(); // 847dc8: fcomp qword ptr [0x9689a0]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 847dce: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 847dd0: test ah, 0x41
        if (R.zf) { pc = 375; continue; } // 847dd3: je 0x847ddd
        pc = 374; continue;
      case 374: // 847dd5
        R.m.w32(((R.esp + 0x58) | 0) >>> 0, 0x3f000000); // 847dd5: mov dword ptr [esp + 0x58], 0x3f000000
        pc = 375; continue;
      case 375: // 847ddd
        R.edx = (((R.m.u16(((R.esp + 0x6c) | 0) >>> 0)) << 16 >> 16)) | 0; // 847ddd: movsx edx, word ptr [esp + 0x6c]
        R.eax = (((R.m.u16(((R.esp + 0x68) | 0) >>> 0)) << 16 >> 16)) | 0; // 847de2: movsx eax, word ptr [esp + 0x68]
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.edx >>> 0)); // 847de7: mov dword ptr [esp + 0x1c], edx
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 847deb: fild dword ptr [esp + 0x1c]
        R.edx = (((R.m.u16(((R.esp + 0x34) | 0) >>> 0)) << 16 >> 16)) | 0; // 847def: movsx edx, word ptr [esp + 0x34]
        R.st[0] = R.st[0] * R.f32(((R.esp + 0x50) | 0)); // 847df4: fmul dword ptr [esp + 0x50]
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.eax >>> 0)); // 847df8: mov dword ptr [esp + 0x1c], eax
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 847dfc: fild dword ptr [esp + 0x1c]
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.edx >>> 0)); // 847e00: mov dword ptr [esp + 0x1c], edx
        R.eax = (((((R.ecx >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 847e04: movsx eax, cx
        R.st[0] = R.st[0] * R.f32(((R.esp + 0x7c) | 0)); // 847e07: fmul dword ptr [esp + 0x7c]
        R.ecx = (((((R.edi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 847e0b: movsx ecx, di
        R.st[1] = R.st[1] + R.st[0]; R.fpop(); // 847e0e: faddp st(1)
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 847e10: fild dword ptr [esp + 0x1c]
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.eax >>> 0)); // 847e14: mov dword ptr [esp + 0x1c], eax
        R.st[0] = R.st[0] * R.f32(((R.esp + 0x5c) | 0)); // 847e18: fmul dword ptr [esp + 0x5c]
        R.st[1] = R.st[1] + R.st[0]; R.fpop(); // 847e1c: faddp st(1)
        R.st[0] = R.st[0] + R.m.s32(((R.esp + 0x1c) | 0) >>> 0); // 847e1e: fiadd dword ptr [esp + 0x1c]
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.ecx >>> 0)); // 847e22: mov dword ptr [esp + 0x1c], ecx
        R.st[0] = R.st[0] + R.m.s32(((R.esp + 0x1c) | 0) >>> 0); // 847e26: fiadd dword ptr [esp + 0x1c]
        R.st[0] = R.st[0] / R.f32(((R.esp + 0x58) | 0)); // 847e2a: fdiv dword ptr [esp + 0x58]
        R.ftol(); // 847e2e: call 0x945640
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.ebx + 0x64) | 0) >>> 0)) & 0xff) << 0)) | 0; // 847e33: mov cl, byte ptr [ebx + 0x64]
        R.sub(((R.ecx >>> 0) & 0xff), 0x1, 8); // 847e36: cmp cl, 1
        if (R.zf) { pc = 384; continue; } // 847e39: je 0x847e7f
        pc = 376; continue;
      case 376: // 847e3b
        R.edx = (R.m.u32(((R.esp + 0x3c) | 0) >>> 0)) | 0; // 847e3b: mov edx, dword ptr [esp + 0x3c]
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 847e3f: test edx, edx
        if (R.zf) { pc = 379; continue; } // 847e41: je 0x847e52
        pc = 377; continue;
      default: return pc;
    }
  }
}
function f_846920_40(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 377: // 847e43
        R.logic(R.m.u8(((R.edx + 0x45) | 0) >>> 0) & 0x10, 8); // 847e43: test byte ptr [edx + 0x45], 0x10
        if (R.zf) { pc = 379; continue; } // 847e47: je 0x847e52
        pc = 378; continue;
      case 378: // 847e49
        R.edx = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 847e49: mov edx, dword ptr [ebp + 8]
        R.sub(R.m.u8(((R.edx + 0x22) | 0) >>> 0), 0x0, 8); // 847e4c: cmp byte ptr [edx + 0x22], 0
        if (R.zf) { pc = 381; continue; } // 847e50: je 0x847e66
        pc = 379; continue;
      case 379: // 847e52
        R.eax = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 847e52: movsx eax, ax
        R.esi = (((R.eax + -0x7d0) | 0)) | 0; // 847e55: lea esi, [eax - 0x7d0]
        R.edx = R.eax < 0 ? -1 : 0; // 847e5b: cdq 
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 847e5c: sub eax, edx
        R.eax = (R.sar((R.eax >>> 0), 0x1, 32)) | 0; // 847e5e: sar eax, 1
        R.sub((R.eax >>> 0), (R.esi >>> 0), 32); // 847e60: cmp eax, esi
        if (R.cL) { pc = 381; continue; } // 847e62: jl 0x847e66
        pc = 380; continue;
      case 380: // 847e64
        R.eax = ((R.esi >>> 0)) | 0; // 847e64: mov eax, esi
        pc = 381; continue;
      case 381: // 847e66
        R.sub(((R.ecx >>> 0) & 0xff), 0x3, 8); // 847e66: cmp cl, 3
        if (!R.zf) { pc = 384; continue; } // 847e69: jne 0x847e7f
        pc = 382; continue;
      case 382: // 847e6b
        R.eax = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 847e6b: movsx eax, ax
        R.ecx = (((R.eax + -0x7d0) | 0)) | 0; // 847e6e: lea ecx, [eax - 0x7d0]
        R.edx = R.eax < 0 ? -1 : 0; // 847e74: cdq 
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 847e75: sub eax, edx
        R.eax = (R.sar((R.eax >>> 0), 0x1, 32)) | 0; // 847e77: sar eax, 1
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 847e79: cmp eax, ecx
        if (R.cL) { pc = 384; continue; } // 847e7b: jl 0x847e7f
        pc = 383; continue;
      case 383: // 847e7d
        R.eax = ((R.ecx >>> 0)) | 0; // 847e7d: mov eax, ecx
        pc = 384; continue;
      case 384: // 847e7f
        R.eax = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 847e7f: movsx eax, ax
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.eax >>> 0)); // 847e82: mov dword ptr [esp + 0x1c], eax
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 847e86: fild dword ptr [esp + 0x1c]
        R.st[0] = R.st[0] * 1.5; // 847e8a: fmul qword ptr [0x968940]
        R.st[0] = R.st[0] - 5000.0; // 847e90: fsub qword ptr [0x9688e8]
        R.ftol(); // 847e96: call 0x945640
        R.ecx = ((R.eax >>> 0)) | 0; // 847e9b: mov ecx, eax
        R.eax = (R.m.u32(((R.ebx + 0x53) | 0) >>> 0)) | 0; // 847e9d: mov eax, dword ptr [ebx + 0x53]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 847ea0: test eax, eax
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.ecx >>> 0)); // 847ea2: mov dword ptr [esp + 0x1c], ecx
        if (R.zf) { pc = 394; continue; } // 847ea6: je 0x847f82
        pc = 385; continue;
      default: return pc;
    }
  }
}
function f_846920_41(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 385: // 847eac
        R.ecx = (((((R.ecx >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 847eac: movsx ecx, cx
        R.ecx = (R.add((R.ecx >>> 0), 0x1388, 32)) | 0; // 847eaf: add ecx, 0x1388
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.eax + 0x77) | 0) >>> 0)) & 0xff) << 0)) | 0; // 847eb5: mov dl, byte ptr [eax + 0x77]
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, (R.ecx >>> 0)); // 847eb8: mov dword ptr [esp + 0x34], ecx
        R.esi = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 847ebc: mov esi, dword ptr [ebp + 8]
        R.fpush(R.m.s32(((R.esp + 0x34) | 0) >>> 0)); // 847ebf: fild dword ptr [esp + 0x34]
        R.ecx = (R.m.u32(((0xb74350) | 0) >>> 0)) | 0; // 847ec3: mov ecx, dword ptr [0xb74350]
        R.push(0x1); // 847ec9: push 1
        R.push((R.edx >>> 0)); // 847ecb: push edx
        R.push((R.ebx >>> 0)); // 847ecc: push ebx
        R.fpush(R.st[0]); // 847ecd: fld st(0)
        R.st[0] = R.st[0] * 6.666666666666667e-05; // 847ecf: fmul qword ptr [0x968d78]
        R.push((R.esi >>> 0)); // 847ed5: push esi
        R.st[0] = R.st[0] * R.st[1]; // 847ed6: fmul st(1)
        R.m.wf64(((R.esp + 0x7c) | 0) >>> 0, R.st[0]); R.fpop(); // 847ed8: fstp qword ptr [esp + 0x7c]
        R.fpop(); // 847edc: fstp st(0)
        R.call(0x7c6830, { n: 4, thisEcx: true, calleeClean: true }); // 847ede: call 0x7c6830
        R.eax = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 847ee3: movsx eax, al
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, (R.eax >>> 0)); // 847ee6: mov dword ptr [esp + 0x34], eax
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esp + 0x1b) | 0) >>> 0)) & 0xff) << 0)) | 0; // 847eea: mov al, byte ptr [esp + 0x1b]
        R.fpush(R.m.s32(((R.esp + 0x34) | 0) >>> 0)); // 847eee: fild dword ptr [esp + 0x34]
        R.sub(((R.eax >>> 0) & 0xff), 0x12, 8); // 847ef2: cmp al, 0x12
        R.m.wf64(((R.esp + 0x34) | 0) >>> 0, R.st[0]); R.fpop(); // 847ef4: fstp qword ptr [esp + 0x34]
        if (!R.cL) { pc = 388; continue; } // 847ef8: jge 0x847f1f
        pc = 386; continue;
      case 386: // 847efa
        R.fpush(R.f64(((R.esp + 0x34) | 0))); // 847efa: fld qword ptr [esp + 0x34]
        R.fcom(R.st[0], 5.0); R.fpop(); // 847efe: fcomp qword ptr [0x9688a0]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 847f04: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 847f06: test ah, 1
        if (R.zf) { pc = 388; continue; } // 847f09: je 0x847f1f
        pc = 387; continue;
      case 387: // 847f0b
        R.ecx = (R.m.u32(((R.esi + 0x1a) | 0) >>> 0)) | 0; // 847f0b: mov ecx, dword ptr [esi + 0x1a]
        R.edx = (R.m.u32(((R.ebx + 0x53) | 0) >>> 0)) | 0; // 847f0e: mov edx, dword ptr [ebx + 0x53]
        R.eax = (R.m.u32(((R.ecx + 0x71) | 0) >>> 0)) | 0; // 847f11: mov eax, dword ptr [ecx + 0x71]
        R.ecx = (R.m.u32(((R.edx + 0x71) | 0) >>> 0)) | 0; // 847f14: mov ecx, dword ptr [edx + 0x71]
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 847f17: cmp eax, ecx
        if (!R.zf) { pc = 39; continue; } // 847f19: jne 0x846c70
        pc = 388; continue;
      case 388: // 847f1f
        R.fpush(R.f64(((R.esp + 0x34) | 0))); // 847f1f: fld qword ptr [esp + 0x34]
        R.st[0] = R.st[0] * 0.1; // 847f23: fmul qword ptr [0x967880]
        R.fpush(R.f64(((R.esp + 0x34) | 0))); // 847f29: fld qword ptr [esp + 0x34]
        R.st[0] = R.st[0] * 200.0; // 847f2d: fmul qword ptr [0x96a648]
        R.st[0] = 12000.0 - R.st[0]; // 847f33: fsubr qword ptr [0x96f938]
        R.st[0] = R.f64(((R.esp + 0x6c) | 0)) / R.st[0]; // 847f39: fdivr qword ptr [esp + 0x6c]
        R.m.wf64(((R.esp + 0x34) | 0) >>> 0, R.st[0]); R.fpop(); // 847f3d: fstp qword ptr [esp + 0x34]
        R.fcom(R.st[0], R.f64(((R.esp + 0x34) | 0))); // 847f41: fcom qword ptr [esp + 0x34]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 847f45: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 847f47: test ah, 0x41
        if (R.zf) { pc = 390; continue; } // 847f4a: je 0x847f52
        pc = 389; continue;
      case 389: // 847f4c
        R.fpop(); // 847f4c: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x34) | 0))); // 847f4e: fld qword ptr [esp + 0x34]
        pc = 390; continue;
      default: return pc;
    }
  }
}
function f_846920_42(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 390: // 847f52
        R.st[0] = R.st[0] + 0.2; // 847f52: fadd qword ptr [0x968918]
        R.esi = (R.m.u32(((R.ebp + 0x1c) | 0) >>> 0)) | 0; // 847f58: mov esi, dword ptr [ebp + 0x1c]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 847f5b: test esi, esi
        R.fpush(R.st[0]); // 847f5d: fld st(0)
        R.st[0] = R.st[0] * R.f64(((R.esp + 0xc) | 0)); // 847f5f: fmul qword ptr [esp + 0xc]
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 847f63: fstp qword ptr [esp + 0xc]
        if (R.zf) { pc = 393; continue; } // 847f67: je 0x847f7e
        pc = 391; continue;
      case 391: // 847f69
        R.fcom(R.st[0], 0.6); R.fpop(); // 847f69: fcomp qword ptr [0x968e48]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 847f6f: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 847f71: test ah, 1
        if (R.zf) { pc = 395; continue; } // 847f74: je 0x847f85
        pc = 392; continue;
      case 392: // 847f76
        R.m.w32(((R.esi) | 0) >>> 0, R.logic(R.m.u32(((R.esi) | 0) >>> 0) | 0x10000, 32)); // 847f76: or dword ptr [esi], 0x10000
        pc = 395; continue; // 847f7c: jmp 0x847f85
      case 393: // 847f7e
        R.fpop(); // 847f7e: fstp st(0)
        pc = 395; continue; // 847f80: jmp 0x847f85
      case 394: // 847f82
        R.esi = (R.m.u32(((R.ebp + 0x1c) | 0) >>> 0)) | 0; // 847f82: mov esi, dword ptr [ebp + 0x1c]
        pc = 395; continue;
      case 395: // 847f85
        R.edi = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 847f85: mov edi, dword ptr [ebp + 8]
        R.eax = (R.m.u32(((R.edi + 0x39) | 0) >>> 0)) | 0; // 847f88: mov eax, dword ptr [edi + 0x39]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 847f8b: test eax, eax
        if (R.zf) { pc = 432; continue; } // 847f8d: je 0x848129
        pc = 396; continue;
      case 396: // 847f93
        R.ecx = (R.m.u32(((R.eax + 0x53) | 0) >>> 0)) | 0; // 847f93: mov ecx, dword ptr [eax + 0x53]
        R.eax = (R.m.u32(((R.ebx + 0x53) | 0) >>> 0)) | 0; // 847f96: mov eax, dword ptr [ebx + 0x53]
        R.sub((R.ecx >>> 0), (R.eax >>> 0), 32); // 847f99: cmp ecx, eax
        if (!R.zf) { pc = 432; continue; } // 847f9b: jne 0x848129
        pc = 397; continue;
      case 397: // 847fa1
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ebp + 0x14) | 0) >>> 0)) & 0xff) << 0)) | 0; // 847fa1: mov al, byte ptr [ebp + 0x14]
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 847fa4: test al, al
        if (R.zf) { pc = 485; continue; } // 847fa6: je 0x848498
        pc = 398; continue;
      case 398: // 847fac
        R.push(0x0); // 847fac: push 0
        R.push((R.edi >>> 0)); // 847fae: push edi
        R.call(0x544590, { n: 2, thisEcx: false, calleeClean: false }); // 847faf: call 0x544590
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 847fb4: add esp, 8
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 847fb7: test eax, eax
        if (R.zf) { pc = 410; continue; } // 847fb9: je 0x848004
        pc = 399; continue;
      case 399: // 847fbb
        R.sub(R.m.u8(((R.edi + 0x18) | 0) >>> 0), 0x18, 8); // 847fbb: cmp byte ptr [edi + 0x18], 0x18
        if (!R.cL) { pc = 410; continue; } // 847fbf: jge 0x848004
        pc = 400; continue;
      case 400: // 847fc1
        R.eax = (R.m.u32(((R.edi + 0x61) | 0) >>> 0)) | 0; // 847fc1: mov eax, dword ptr [edi + 0x61]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 847fc4: test eax, eax
        if (R.zf) { pc = 410; continue; } // 847fc6: je 0x848004
        pc = 401; continue;
      default: return pc;
    }
  }
}
function f_846920_43(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 401: // 847fc8
        R.sub(R.m.u16(((R.eax + 0xb) | 0) >>> 0), 0x109a, 16); // 847fc8: cmp word ptr [eax + 0xb], 0x109a
        if (!R.cL) { pc = 410; continue; } // 847fce: jge 0x848004
        pc = 402; continue;
      case 402: // 847fd0
        R.sub(R.m.u8(((R.edi + 0x5b) | 0) >>> 0), 0xf, 8); // 847fd0: cmp byte ptr [edi + 0x5b], 0xf
        if (R.cLE) { pc = 410; continue; } // 847fd4: jle 0x848004
        pc = 403; continue;
      case 403: // 847fd6
        R.sub(R.m.u8(((R.edi + 0x5a) | 0) >>> 0), 0xa, 8); // 847fd6: cmp byte ptr [edi + 0x5a], 0xa
        if (R.cLE) { pc = 410; continue; } // 847fda: jle 0x848004
        pc = 404; continue;
      case 404: // 847fdc
        R.eax = (R.m.u32(((R.esp + 0x3c) | 0) >>> 0)) | 0; // 847fdc: mov eax, dword ptr [esp + 0x3c]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 847fe0: test eax, eax
        if (R.zf) { pc = 410; continue; } // 847fe2: je 0x848004
        pc = 405; continue;
      case 405: // 847fe4
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esp + 0x1a) | 0) >>> 0)) & 0xff) << 0)) | 0; // 847fe4: mov al, byte ptr [esp + 0x1a]
        R.sub(((R.eax >>> 0) & 0xff), 0x4, 8); // 847fe8: cmp al, 4
        if (R.zf) { pc = 410; continue; } // 847fea: je 0x848004
        pc = 406; continue;
      case 406: // 847fec
        R.sub(((R.eax >>> 0) & 0xff), 0x1, 8); // 847fec: cmp al, 1
        if (R.zf) { pc = 410; continue; } // 847fee: je 0x848004
        pc = 407; continue;
      case 407: // 847ff0
        R.sub(((R.eax >>> 0) & 0xff), 0x2, 8); // 847ff0: cmp al, 2
        if (R.zf) { pc = 410; continue; } // 847ff2: je 0x848004
        pc = 408; continue;
      case 408: // 847ff4
        R.sub(((R.eax >>> 0) & 0xff), 0x3, 8); // 847ff4: cmp al, 3
        if (R.zf) { pc = 410; continue; } // 847ff6: je 0x848004
        pc = 409; continue;
      case 409: // 847ff8
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 847ff8: fld qword ptr [esp + 0xc]
        R.st[0] = R.st[0] * 2.5; // 847ffc: fmul qword ptr [0x968e18]
        pc = 411; continue; // 848002: jmp 0x848008
      case 410: // 848004
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 848004: fld qword ptr [esp + 0xc]
        pc = 411; continue;
      case 411: // 848008
        R.edx = (R.m.u32(((R.esp + 0x30) | 0) >>> 0)) | 0; // 848008: mov edx, dword ptr [esp + 0x30]
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 84800c: test edx, edx
        if (R.zf) { pc = 418; continue; } // 84800e: je 0x848041
        pc = 412; continue;
      case 412: // 848010
        R.eax = (R.m.u32(((R.ebx + 0x53) | 0) >>> 0)) | 0; // 848010: mov eax, dword ptr [ebx + 0x53]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 848013: test eax, eax
        if (R.zf) { pc = 418; continue; } // 848015: je 0x848041
        pc = 413; continue;
      case 413: // 848017
        R.eax = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 848017: mov eax, dword ptr [eax]
        R.ecx = (R.m.u32(((0x9cf360) | 0) >>> 0)) | 0; // 848019: mov ecx, dword ptr [0x9cf360]
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 84801f: cmp eax, ecx
        if (!R.zf) { pc = 418; continue; } // 848021: jne 0x848041
        pc = 414; continue;
      default: return pc;
    }
  }
}
function f_846920_44(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 414: // 848023
        R.sub(R.m.u8(((R.edi + 0x18) | 0) >>> 0), 0x18, 8); // 848023: cmp byte ptr [edi + 0x18], 0x18
        if (!R.cL) { pc = 418; continue; } // 848027: jge 0x848041
        pc = 415; continue;
      case 415: // 848029
        R.eax = (R.m.u32(((R.edx + 0x57) | 0) >>> 0)) | 0; // 848029: mov eax, dword ptr [edx + 0x57]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84802c: test eax, eax
        if (R.zf) { pc = 418; continue; } // 84802e: je 0x848041
        pc = 416; continue;
      case 416: // 848030
        R.ecx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 848030: mov ecx, dword ptr [eax]
        R.eax = (R.m.u32(((0x9cf570) | 0) >>> 0)) | 0; // 848032: mov eax, dword ptr [0x9cf570]
        R.sub((R.ecx >>> 0), (R.eax >>> 0), 32); // 848037: cmp ecx, eax
        if (!R.zf) { pc = 418; continue; } // 848039: jne 0x848041
        pc = 417; continue;
      case 417: // 84803b
        R.st[0] = R.st[0] * 3.0; // 84803b: fmul qword ptr [0x968930]
        pc = 418; continue;
      case 418: // 848041
        R.logic((R.ebx >>> 0) & (R.ebx >>> 0), 32); // 848041: test ebx, ebx
        if (R.zf) { pc = 449; continue; } // 848043: je 0x84822a
        pc = 419; continue;
      case 419: // 848049
        R.eax = (R.m.u32(((R.ebx + 0x69) | 0) >>> 0)) | 0; // 848049: mov eax, dword ptr [ebx + 0x69]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84804c: test eax, eax
        if (R.zf) { pc = 449; continue; } // 84804e: je 0x84822a
        pc = 420; continue;
      case 420: // 848054
        R.ecx = (R.m.u32(((R.eax + 0x38) | 0) >>> 0)) | 0; // 848054: mov ecx, dword ptr [eax + 0x38]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 848057: test ecx, ecx
        if (R.zf) { pc = 449; continue; } // 848059: je 0x84822a
        pc = 421; continue;
      case 421: // 84805f
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 84805f: test edx, edx
        if (R.zf) { pc = 449; continue; } // 848061: je 0x84822a
        pc = 422; continue;
      case 422: // 848067
        R.eax = (R.m.u32(((R.edx + 0x69) | 0) >>> 0)) | 0; // 848067: mov eax, dword ptr [edx + 0x69]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84806a: test eax, eax
        if (R.zf) { pc = 449; continue; } // 84806c: je 0x84822a
        pc = 423; continue;
      case 423: // 848072
        R.eax = (R.m.u32(((R.eax + 0x38) | 0) >>> 0)) | 0; // 848072: mov eax, dword ptr [eax + 0x38]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 848075: test eax, eax
        if (R.zf) { pc = 449; continue; } // 848077: je 0x84822a
        pc = 424; continue;
      default: return pc;
    }
  }
}
function f_846920_45(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 424: // 84807d
        R.fpush(R.f64(((R.ecx + 0x2b) | 0))); // 84807d: fld qword ptr [ecx + 0x2b]
        R.st[0] = R.st[0] - R.f64(((R.eax + 0x2b) | 0)); // 848080: fsub qword ptr [eax + 0x2b]
        R.fpush(R.f64(((R.ecx + 0x23) | 0))); // 848083: fld qword ptr [ecx + 0x23]
        R.st[0] = R.st[0] - R.f64(((R.eax + 0x23) | 0)); // 848086: fsub qword ptr [eax + 0x23]
        R.fpush(R.st[0]); // 848089: fld st(0)
        R.st[0] = R.st[0] * R.st[1]; // 84808b: fmul st(1)
        R.fpush(R.st[2]); // 84808d: fld st(2)
        R.st[0] = R.st[0] * R.st[3]; // 84808f: fmul st(3)
        R.st[1] = R.st[1] + R.st[0]; R.fpop(); // 848091: faddp st(1)
        R.st[0] = Math.sqrt(R.st[0]); // 848093: fsqrt 
        R.st[0] = R.st[0] * 55.0; // 848095: fmul qword ptr [0x96d1b8]
        R.st[2] = R.st[0]; R.fpop(); // 84809b: fstp st(2)
        R.fpop(); // 84809d: fstp st(0)
        R.fcom(R.st[0], 40.0); // 84809f: fcom qword ptr [0x968e30]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8480a5: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 8480a7: test ah, 1
        if (R.zf) { pc = 427; continue; } // 8480aa: je 0x8480cb
        pc = 425; continue;
      case 425: // 8480ac
        R.fpop(); // 8480ac: fstp st(0)
        R.st[0] = R.st[0] * 2.9; // 8480ae: fmul qword ptr [0x96f978]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 8480b4: test esi, esi
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 8480b6: fstp qword ptr [esp + 0xc]
        if (R.zf) { pc = 495; continue; } // 8480ba: je 0x848532
        pc = 426; continue;
      case 426: // 8480c0
        R.m.w32(((R.esi) | 0) >>> 0, R.logic(R.m.u32(((R.esi) | 0) >>> 0) | 0x20000, 32)); // 8480c0: or dword ptr [esi], 0x20000
        pc = 495; continue; // 8480c6: jmp 0x848532
      case 427: // 8480cb
        R.fcom(R.st[0], 80.0); // 8480cb: fcom qword ptr [0x96d6e0]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8480d1: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 8480d3: test ah, 1
        if (R.zf) { pc = 431; continue; } // 8480d6: je 0x848118
        pc = 428; continue;
      case 428: // 8480d8
        R.st[0] = R.st[0] * 0.04; // 8480d8: fmul qword ptr [0x968a90]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 8480de: test esi, esi
        R.st[0] = 4.5 - R.st[0]; // 8480e0: fsubr qword ptr [0x96afa0]
        R.m.wf64(((R.esp + 0x44) | 0) >>> 0, R.st[0]); // 8480e6: fst qword ptr [esp + 0x44]
        R.st[0] = R.st[0] * R.st[1]; // 8480ea: fmul st(1)
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 8480ec: fstp qword ptr [esp + 0xc]
        R.fpop(); // 8480f0: fstp st(0)
        if (R.zf) { pc = 495; continue; } // 8480f2: je 0x848532
        pc = 429; continue;
      case 429: // 8480f8
        R.fpush(R.f64(((R.esp + 0x44) | 0))); // 8480f8: fld qword ptr [esp + 0x44]
        R.fcom(R.st[0], 1.6); R.fpop(); // 8480fc: fcomp qword ptr [0x969018]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 848102: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 848104: test ah, 0x41
        if (!R.zf) { pc = 495; continue; } // 848107: jne 0x848532
        pc = 430; continue;
      case 430: // 84810d
        R.m.w32(((R.esi) | 0) >>> 0, R.logic(R.m.u32(((R.esi) | 0) >>> 0) | 0x20000, 32)); // 84810d: or dword ptr [esi], 0x20000
        pc = 495; continue; // 848113: jmp 0x848532
      case 431: // 848118
        R.fpop(); // 848118: fstp st(0)
        R.st[0] = R.st[0] * 1.3; // 84811a: fmul qword ptr [0x968de8]
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 848120: fstp qword ptr [esp + 0xc]
        pc = 495; continue; // 848124: jmp 0x848532
      default: return pc;
    }
  }
}
function f_846920_46(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 432: // 848129
        R.eax = (R.m.u32(((R.ebx + 0x53) | 0) >>> 0)) | 0; // 848129: mov eax, dword ptr [ebx + 0x53]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84812c: test eax, eax
        if (R.zf) { pc = 450; continue; } // 84812e: je 0x848239
        pc = 433; continue;
      case 433: // 848134
        R.push(0x1); // 848134: push 1
        R.push((R.eax >>> 0)); // 848136: push eax
        R.push((R.edi >>> 0)); // 848137: push edi
        R.call(0x53d980, { n: 3, thisEcx: false, calleeClean: false }); // 848138: call 0x53d980
        R.esp = (R.add((R.esp >>> 0), 0xc, 32)) | 0; // 84813d: add esp, 0xc
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 848140: test eax, eax
        if (!R.zf) { pc = 450; continue; } // 848142: jne 0x848239
        pc = 434; continue;
      case 434: // 848148
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ebp + 0x14) | 0) >>> 0)) & 0xff) << 0)) | 0; // 848148: mov al, byte ptr [ebp + 0x14]
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 84814b: test al, al
        if (R.zf) { pc = 485; continue; } // 84814d: je 0x848498
        pc = 435; continue;
      case 435: // 848153
        R.edx = (R.m.u32(((R.esp + 0x30) | 0) >>> 0)) | 0; // 848153: mov edx, dword ptr [esp + 0x30]
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 848157: test edx, edx
        if (R.zf) { pc = 495; continue; } // 848159: je 0x848532
        pc = 436; continue;
      case 436: // 84815f
        R.eax = (R.m.u32(((R.ebx + 0x69) | 0) >>> 0)) | 0; // 84815f: mov eax, dword ptr [ebx + 0x69]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 848162: test eax, eax
        if (R.zf) { pc = 448; continue; } // 848164: je 0x848226
        pc = 437; continue;
      case 437: // 84816a
        R.ecx = (R.m.u32(((R.eax + 0x38) | 0) >>> 0)) | 0; // 84816a: mov ecx, dword ptr [eax + 0x38]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 84816d: test ecx, ecx
        if (R.zf) { pc = 448; continue; } // 84816f: je 0x848226
        pc = 438; continue;
      case 438: // 848175
        R.eax = (R.m.u32(((R.edx + 0x69) | 0) >>> 0)) | 0; // 848175: mov eax, dword ptr [edx + 0x69]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 848178: test eax, eax
        if (R.zf) { pc = 448; continue; } // 84817a: je 0x848226
        pc = 439; continue;
      case 439: // 848180
        R.eax = (R.m.u32(((R.eax + 0x38) | 0) >>> 0)) | 0; // 848180: mov eax, dword ptr [eax + 0x38]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 848183: test eax, eax
        if (R.zf) { pc = 448; continue; } // 848185: je 0x848226
        pc = 440; continue;
      default: return pc;
    }
  }
}
function f_846920_47(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 440: // 84818b
        R.fpush(R.f64(((R.ecx + 0x2b) | 0))); // 84818b: fld qword ptr [ecx + 0x2b]
        R.st[0] = R.st[0] - R.f64(((R.eax + 0x2b) | 0)); // 84818e: fsub qword ptr [eax + 0x2b]
        R.fpush(R.f64(((R.ecx + 0x23) | 0))); // 848191: fld qword ptr [ecx + 0x23]
        R.st[0] = R.st[0] - R.f64(((R.eax + 0x23) | 0)); // 848194: fsub qword ptr [eax + 0x23]
        R.fpush(R.st[0]); // 848197: fld st(0)
        R.st[0] = R.st[0] * R.st[1]; // 848199: fmul st(1)
        R.fpush(R.st[2]); // 84819b: fld st(2)
        R.st[0] = R.st[0] * R.st[3]; // 84819d: fmul st(3)
        R.st[1] = R.st[1] + R.st[0]; R.fpop(); // 84819f: faddp st(1)
        R.st[0] = Math.sqrt(R.st[0]); // 8481a1: fsqrt 
        R.st[0] = R.st[0] * 55.0; // 8481a3: fmul qword ptr [0x96d1b8]
        R.st[2] = R.st[0]; R.fpop(); // 8481a9: fstp st(2)
        R.fpop(); // 8481ab: fstp st(0)
        R.fcom(R.st[0], 40.0); // 8481ad: fcom qword ptr [0x968e30]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8481b3: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 8481b5: test ah, 1
        if (R.zf) { pc = 443; continue; } // 8481b8: je 0x8481dd
        pc = 441; continue;
      case 441: // 8481ba
        R.fpop(); // 8481ba: fstp st(0)
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 8481bc: fld qword ptr [esp + 0xc]
        R.st[0] = R.st[0] * 2.9; // 8481c0: fmul qword ptr [0x96f978]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 8481c6: test esi, esi
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 8481c8: fstp qword ptr [esp + 0xc]
        if (R.zf) { pc = 495; continue; } // 8481cc: je 0x848532
        pc = 442; continue;
      case 442: // 8481d2
        R.m.w32(((R.esi) | 0) >>> 0, R.logic(R.m.u32(((R.esi) | 0) >>> 0) | 0x20000, 32)); // 8481d2: or dword ptr [esi], 0x20000
        pc = 495; continue; // 8481d8: jmp 0x848532
      case 443: // 8481dd
        R.fcom(R.st[0], 80.0); // 8481dd: fcom qword ptr [0x96d6e0]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8481e3: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 8481e5: test ah, 1
        if (R.zf) { pc = 447; continue; } // 8481e8: je 0x848224
        pc = 444; continue;
      case 444: // 8481ea
        R.st[0] = R.st[0] * 0.04; // 8481ea: fmul qword ptr [0x968a90]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 8481f0: test esi, esi
        R.st[0] = 4.5 - R.st[0]; // 8481f2: fsubr qword ptr [0x96afa0]
        R.fpush(R.st[0]); // 8481f8: fld st(0)
        R.st[0] = R.st[0] * R.f64(((R.esp + 0xc) | 0)); // 8481fa: fmul qword ptr [esp + 0xc]
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 8481fe: fstp qword ptr [esp + 0xc]
        if (R.zf) { pc = 494; continue; } // 848202: je 0x848530
        pc = 445; continue;
      case 445: // 848208
        R.fcom(R.st[0], 1.6); R.fpop(); // 848208: fcomp qword ptr [0x969018]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 84820e: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 848210: test ah, 0x41
        if (!R.zf) { pc = 495; continue; } // 848213: jne 0x848532
        pc = 446; continue;
      case 446: // 848219
        R.m.w32(((R.esi) | 0) >>> 0, R.logic(R.m.u32(((R.esi) | 0) >>> 0) | 0x20000, 32)); // 848219: or dword ptr [esi], 0x20000
        pc = 495; continue; // 84821f: jmp 0x848532
      case 447: // 848224
        R.fpop(); // 848224: fstp st(0)
        pc = 448; continue;
      case 448: // 848226
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 848226: fld qword ptr [esp + 0xc]
        pc = 449; continue;
      default: return pc;
    }
  }
}
function f_846920_48(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 449: // 84822a
        R.st[0] = R.st[0] * 1.3; // 84822a: fmul qword ptr [0x968de8]
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 848230: fstp qword ptr [esp + 0xc]
        pc = 495; continue; // 848234: jmp 0x848532
      case 450: // 848239
        R.eax = (R.m.u32(((R.ebx + 0xcf) | 0) >>> 0)) | 0; // 848239: mov eax, dword ptr [ebx + 0xcf]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84823f: test eax, eax
        if (R.zf) { pc = 468; continue; } // 848241: je 0x848376
        pc = 451; continue;
      case 451: // 848247
        R.eax = (R.m.u32(((R.eax + 0x1a) | 0) >>> 0)) | 0; // 848247: mov eax, dword ptr [eax + 0x1a]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84824a: test eax, eax
        if (R.zf) { pc = 468; continue; } // 84824c: je 0x848376
        pc = 452; continue;
      case 452: // 848252
        R.push(0x1); // 848252: push 1
        R.push((R.eax >>> 0)); // 848254: push eax
        R.push((R.edi >>> 0)); // 848255: push edi
        R.call(0x53d980, { n: 3, thisEcx: false, calleeClean: false }); // 848256: call 0x53d980
        R.esp = (R.add((R.esp >>> 0), 0xc, 32)) | 0; // 84825b: add esp, 0xc
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84825e: test eax, eax
        if (!R.zf) { pc = 468; continue; } // 848260: jne 0x848376
        pc = 453; continue;
      case 453: // 848266
        R.eax = (R.m.u32(((R.ebx + 0x53) | 0) >>> 0)) | 0; // 848266: mov eax, dword ptr [ebx + 0x53]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 848269: test eax, eax
        if (R.zf) { pc = 456; continue; } // 84826b: je 0x848286
        pc = 454; continue;
      case 454: // 84826d
        R.edx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 84826d: mov edx, dword ptr [eax]
        R.eax = (R.m.u32(((0x9cf314) | 0) >>> 0)) | 0; // 84826f: mov eax, dword ptr [0x9cf314]
        R.sub((R.edx >>> 0), (R.eax >>> 0), 32); // 848274: cmp edx, eax
        if (!R.zf) { pc = 456; continue; } // 848276: jne 0x848286
        pc = 455; continue;
      case 455: // 848278
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 848278: fld qword ptr [esp + 0xc]
        R.st[0] = R.st[0] * 0.75; // 84827c: fmul qword ptr [0x969040]
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 848282: fstp qword ptr [esp + 0xc]
        pc = 456; continue;
      case 456: // 848286
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ebp + 0x14) | 0) >>> 0)) & 0xff) << 0)) | 0; // 848286: mov al, byte ptr [ebp + 0x14]
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 848289: test al, al
        if (R.zf) { pc = 458; continue; } // 84828b: je 0x84829c
        pc = 457; continue;
      case 457: // 84828d
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 84828d: fld qword ptr [esp + 0xc]
        R.st[0] = R.st[0] * 0.45; // 848291: fmul qword ptr [0x96a6a8]
        pc = 473; continue; // 848297: jmp 0x8483a7
      case 458: // 84829c
        R.eax = (R.m.u32(((R.esp + 0x44) | 0) >>> 0)) | 0; // 84829c: mov eax, dword ptr [esp + 0x44]
        R.eax = (R.add((R.eax >>> 0), 0xfffffffe, 32)) | 0; // 8482a0: add eax, -2
        R.sub((R.eax >>> 0), 0x4, 32); // 8482a3: cmp eax, 4
        if (!R.cBE) { pc = 485; continue; } // 8482a6: ja 0x848498
        pc = 459; continue;
      case 459: // 8482ac
        pc = [464, 465, 460, 462, 466][R.eax >>> 0] ?? -2; continue; // 8482ac: jmp dword ptr [eax*4 + 0x849c90]
      default: return pc;
    }
  }
}
function f_846920_49(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 460: // 8482b3
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 8482b3: fld qword ptr [esp + 0xc]
        R.st[0] = R.st[0] * 0.5; // 8482b7: fmul qword ptr [0x968968]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 8482bd: test esi, esi
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 8482bf: fstp qword ptr [esp + 0xc]
        if (R.zf) { pc = 485; continue; } // 8482c3: je 0x848498
        pc = 461; continue;
      case 461: // 8482c9
        pc = 484; continue; // 8482c9: jmp 0x848492
      case 462: // 8482ce
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 8482ce: fld qword ptr [esp + 0xc]
        R.st[0] = R.st[0] * 0.4; // 8482d2: fmul qword ptr [0x968e00]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 8482d8: test esi, esi
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 8482da: fstp qword ptr [esp + 0xc]
        if (R.zf) { pc = 485; continue; } // 8482de: je 0x848498
        pc = 463; continue;
      case 463: // 8482e4
        pc = 484; continue; // 8482e4: jmp 0x848492
      case 464: // 8482e9
        R.ecx = (((R.m.u8(((R.edi + 0x56) | 0) >>> 0)) << 24 >> 24)) | 0; // 8482e9: movsx ecx, byte ptr [edi + 0x56]
        R.edx = (((R.m.u8(((R.edi + 0x57) | 0) >>> 0)) << 24 >> 24)) | 0; // 8482ed: movsx edx, byte ptr [edi + 0x57]
        R.m.w32(((R.esp + 0x44) | 0) >>> 0, (R.ecx >>> 0)); // 8482f1: mov dword ptr [esp + 0x44], ecx
        R.fpush(R.m.s32(((R.esp + 0x44) | 0) >>> 0)); // 8482f5: fild dword ptr [esp + 0x44]
        R.m.w32(((R.esp + 0x44) | 0) >>> 0, (R.edx >>> 0)); // 8482f9: mov dword ptr [esp + 0x44], edx
        R.st[0] = R.st[0] * 0.005; // 8482fd: fmul qword ptr [0x968ef0]
        R.fpush(R.m.s32(((R.esp + 0x44) | 0) >>> 0)); // 848303: fild dword ptr [esp + 0x44]
        R.st[0] = R.st[0] * 0.02; // 848307: fmul qword ptr [0x968a98]
        R.st[1] = R.st[1] + R.st[0]; R.fpop(); // 84830d: faddp st(1)
        R.st[0] = R.st[0] + 0.8; // 84830f: fadd qword ptr [0x9689b0]
        R.st[0] = R.st[0] * R.f64(((R.esp + 0xc) | 0)); // 848315: fmul qword ptr [esp + 0xc]
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 848319: fstp qword ptr [esp + 0xc]
        pc = 485; continue; // 84831d: jmp 0x848498
      case 465: // 848322
        R.eax = (((R.m.u8(((R.edi + 0x56) | 0) >>> 0)) << 24 >> 24)) | 0; // 848322: movsx eax, byte ptr [edi + 0x56]
        R.ecx = (((R.m.u8(((R.edi + 0x57) | 0) >>> 0)) << 24 >> 24)) | 0; // 848326: movsx ecx, byte ptr [edi + 0x57]
        R.m.w32(((R.esp + 0x44) | 0) >>> 0, (R.eax >>> 0)); // 84832a: mov dword ptr [esp + 0x44], eax
        R.fpush(R.m.s32(((R.esp + 0x44) | 0) >>> 0)); // 84832e: fild dword ptr [esp + 0x44]
        R.m.w32(((R.esp + 0x44) | 0) >>> 0, (R.ecx >>> 0)); // 848332: mov dword ptr [esp + 0x44], ecx
        R.st[0] = R.st[0] * 0.005; // 848336: fmul qword ptr [0x968ef0]
        R.fpush(R.m.s32(((R.esp + 0x44) | 0) >>> 0)); // 84833c: fild dword ptr [esp + 0x44]
        R.st[0] = R.st[0] * 0.02; // 848340: fmul qword ptr [0x968a98]
        R.st[1] = R.st[1] + R.st[0]; R.fpop(); // 848346: faddp st(1)
        R.st[0] = R.st[0] + 0.7; // 848348: fadd qword ptr [0x968e40]
        R.st[0] = R.st[0] * R.f64(((R.esp + 0xc) | 0)); // 84834e: fmul qword ptr [esp + 0xc]
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 848352: fstp qword ptr [esp + 0xc]
        pc = 485; continue; // 848356: jmp 0x848498
      case 466: // 84835b
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 84835b: fld qword ptr [esp + 0xc]
        R.st[0] = R.st[0] * 0.2; // 84835f: fmul qword ptr [0x968918]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 848365: test esi, esi
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 848367: fstp qword ptr [esp + 0xc]
        if (R.zf) { pc = 485; continue; } // 84836b: je 0x848498
        pc = 467; continue;
      case 467: // 848371
        pc = 484; continue; // 848371: jmp 0x848492
      case 468: // 848376
        R.eax = (R.m.u32(((R.ebx + 0x53) | 0) >>> 0)) | 0; // 848376: mov eax, dword ptr [ebx + 0x53]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 848379: test eax, eax
        if (R.zf) { pc = 471; continue; } // 84837b: je 0x848396
        pc = 469; continue;
      default: return pc;
    }
  }
}
function f_846920_50(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 469: // 84837d
        R.edx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 84837d: mov edx, dword ptr [eax]
        R.eax = (R.m.u32(((0x9cf314) | 0) >>> 0)) | 0; // 84837f: mov eax, dword ptr [0x9cf314]
        R.sub((R.edx >>> 0), (R.eax >>> 0), 32); // 848384: cmp edx, eax
        if (!R.zf) { pc = 471; continue; } // 848386: jne 0x848396
        pc = 470; continue;
      case 470: // 848388
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 848388: fld qword ptr [esp + 0xc]
        R.st[0] = R.st[0] * 0.75; // 84838c: fmul qword ptr [0x969040]
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 848392: fstp qword ptr [esp + 0xc]
        pc = 471; continue;
      case 471: // 848396
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ebp + 0x14) | 0) >>> 0)) & 0xff) << 0)) | 0; // 848396: mov al, byte ptr [ebp + 0x14]
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 848399: test al, al
        if (R.zf) { pc = 475; continue; } // 84839b: je 0x8483be
        pc = 472; continue;
      case 472: // 84839d
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 84839d: fld qword ptr [esp + 0xc]
        R.st[0] = R.st[0] * 0.08; // 8483a1: fmul qword ptr [0x968920]
        pc = 473; continue;
      case 473: // 8483a7
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 8483a7: fstp qword ptr [esp + 0xc]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 8483ab: test esi, esi
        if (R.zf) { pc = 495; continue; } // 8483ad: je 0x848532
        pc = 474; continue;
      case 474: // 8483b3
        R.m.w32(((R.esi) | 0) >>> 0, R.logic(R.m.u32(((R.esi) | 0) >>> 0) | 0x40000, 32)); // 8483b3: or dword ptr [esi], 0x40000
        pc = 495; continue; // 8483b9: jmp 0x848532
      case 475: // 8483be
        R.eax = (R.m.u32(((R.esp + 0x44) | 0) >>> 0)) | 0; // 8483be: mov eax, dword ptr [esp + 0x44]
        R.eax = (R.add((R.eax >>> 0), 0xfffffffe, 32)) | 0; // 8483c2: add eax, -2
        R.sub((R.eax >>> 0), 0x4, 32); // 8483c5: cmp eax, 4
        if (!R.cBE) { pc = 485; continue; } // 8483c8: ja 0x848498
        pc = 476; continue;
      case 476: // 8483ce
        pc = [477, 482, 478, 480, 483][R.eax >>> 0] ?? -2; continue; // 8483ce: jmp dword ptr [eax*4 + 0x849ca4]
      case 477: // 8483d5
        R.ecx = (((R.m.u8(((R.edi + 0x56) | 0) >>> 0)) << 24 >> 24)) | 0; // 8483d5: movsx ecx, byte ptr [edi + 0x56]
        R.edx = (((R.m.u8(((R.edi + 0x57) | 0) >>> 0)) << 24 >> 24)) | 0; // 8483d9: movsx edx, byte ptr [edi + 0x57]
        R.m.w32(((R.esp + 0x44) | 0) >>> 0, (R.ecx >>> 0)); // 8483dd: mov dword ptr [esp + 0x44], ecx
        R.fpush(R.m.s32(((R.esp + 0x44) | 0) >>> 0)); // 8483e1: fild dword ptr [esp + 0x44]
        R.m.w32(((R.esp + 0x44) | 0) >>> 0, (R.edx >>> 0)); // 8483e5: mov dword ptr [esp + 0x44], edx
        R.fpush(R.m.s32(((R.esp + 0x44) | 0) >>> 0)); // 8483e9: fild dword ptr [esp + 0x44]
        R.st[1] = R.st[1] + R.st[0]; R.fpop(); // 8483ed: faddp st(1)
        R.st[0] = R.st[0] * 0.01; // 8483ef: fmul qword ptr [0x967898]
        R.st[0] = R.st[0] + 0.7; // 8483f5: fadd qword ptr [0x968e40]
        R.st[0] = R.st[0] * R.f64(((R.esp + 0xc) | 0)); // 8483fb: fmul qword ptr [esp + 0xc]
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 8483ff: fstp qword ptr [esp + 0xc]
        pc = 485; continue; // 848403: jmp 0x848498
      case 478: // 848408
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 848408: fld qword ptr [esp + 0xc]
        R.st[0] = R.st[0] * 0.25; // 84840c: fmul qword ptr [0x9689e0]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 848412: test esi, esi
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 848414: fstp qword ptr [esp + 0xc]
        if (R.zf) { pc = 485; continue; } // 848418: je 0x848498
        pc = 479; continue;
      case 479: // 84841a
        pc = 484; continue; // 84841a: jmp 0x848492
      default: return pc;
    }
  }
}
function f_846920_51(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 480: // 84841c
        R.eax = (((R.m.u8(((R.edi + 0x56) | 0) >>> 0)) << 24 >> 24)) | 0; // 84841c: movsx eax, byte ptr [edi + 0x56]
        R.ecx = (((R.m.u8(((R.edi + 0x57) | 0) >>> 0)) << 24 >> 24)) | 0; // 848420: movsx ecx, byte ptr [edi + 0x57]
        R.m.w32(((R.esp + 0x44) | 0) >>> 0, (R.eax >>> 0)); // 848424: mov dword ptr [esp + 0x44], eax
        R.fpush(R.m.s32(((R.esp + 0x44) | 0) >>> 0)); // 848428: fild dword ptr [esp + 0x44]
        R.m.w32(((R.esp + 0x44) | 0) >>> 0, (R.ecx >>> 0)); // 84842c: mov dword ptr [esp + 0x44], ecx
        R.fpush(R.m.s32(((R.esp + 0x44) | 0) >>> 0)); // 848430: fild dword ptr [esp + 0x44]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 848434: test esi, esi
        R.st[1] = R.st[1] + R.st[0]; R.fpop(); // 848436: faddp st(1)
        R.st[0] = R.st[0] * 0.004; // 848438: fmul qword ptr [0x968d60]
        R.st[0] = R.st[0] + 0.25; // 84843e: fadd qword ptr [0x9689e0]
        R.st[0] = R.st[0] * R.f64(((R.esp + 0xc) | 0)); // 848444: fmul qword ptr [esp + 0xc]
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 848448: fstp qword ptr [esp + 0xc]
        if (R.zf) { pc = 485; continue; } // 84844c: je 0x848498
        pc = 481; continue;
      case 481: // 84844e
        pc = 484; continue; // 84844e: jmp 0x848492
      case 482: // 848450
        R.edx = (((R.m.u8(((R.edi + 0x56) | 0) >>> 0)) << 24 >> 24)) | 0; // 848450: movsx edx, byte ptr [edi + 0x56]
        R.eax = (((R.m.u8(((R.edi + 0x57) | 0) >>> 0)) << 24 >> 24)) | 0; // 848454: movsx eax, byte ptr [edi + 0x57]
        R.m.w32(((R.esp + 0x44) | 0) >>> 0, (R.edx >>> 0)); // 848458: mov dword ptr [esp + 0x44], edx
        R.fpush(R.m.s32(((R.esp + 0x44) | 0) >>> 0)); // 84845c: fild dword ptr [esp + 0x44]
        R.m.w32(((R.esp + 0x44) | 0) >>> 0, (R.eax >>> 0)); // 848460: mov dword ptr [esp + 0x44], eax
        R.fpush(R.m.s32(((R.esp + 0x44) | 0) >>> 0)); // 848464: fild dword ptr [esp + 0x44]
        R.st[1] = R.st[1] + R.st[0]; R.fpop(); // 848468: faddp st(1)
        R.st[0] = R.st[0] * 0.01; // 84846a: fmul qword ptr [0x967898]
        R.st[0] = R.st[0] + 0.6; // 848470: fadd qword ptr [0x968e48]
        R.st[0] = R.st[0] * R.f64(((R.esp + 0xc) | 0)); // 848476: fmul qword ptr [esp + 0xc]
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 84847a: fstp qword ptr [esp + 0xc]
        pc = 485; continue; // 84847e: jmp 0x848498
      case 483: // 848480
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 848480: fld qword ptr [esp + 0xc]
        R.st[0] = R.st[0] * 0.025; // 848484: fmul qword ptr [0x967878]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 84848a: test esi, esi
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 84848c: fstp qword ptr [esp + 0xc]
        if (R.zf) { pc = 485; continue; } // 848490: je 0x848498
        pc = 484; continue;
      case 484: // 848492
        R.m.w32(((R.esi) | 0) >>> 0, R.logic(R.m.u32(((R.esi) | 0) >>> 0) | 0x80000, 32)); // 848492: or dword ptr [esi], 0x80000
        pc = 485; continue;
      case 485: // 848498
        R.eax = (R.m.u32(((R.esp + 0x3c) | 0) >>> 0)) | 0; // 848498: mov eax, dword ptr [esp + 0x3c]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84849c: test eax, eax
        if (R.zf) { pc = 487; continue; } // 84849e: je 0x8484a7
        pc = 486; continue;
      case 486: // 8484a0
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.eax + 0x49) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8484a0: mov cl, byte ptr [eax + 0x49]
        R.logic(((R.ecx >>> 0) & 0xff) & ((R.ecx >>> 0) & 0xff), 8); // 8484a3: test cl, cl
        if (!R.zf) { pc = 488; continue; } // 8484a5: jne 0x8484ba
        pc = 487; continue;
      case 487: // 8484a7
        R.push(0x0); // 8484a7: push 0
        R.push((R.edi >>> 0)); // 8484a9: push edi
        R.call(0x5444a0, { n: 2, thisEcx: false, calleeClean: false }); // 8484aa: call 0x5444a0
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 8484af: add esp, 8
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8484b2: test eax, eax
        if (R.zf) { pc = 511; continue; } // 8484b4: je 0x84862e
        pc = 488; continue;
      default: return pc;
    }
  }
}
function f_846920_52(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 488: // 8484ba
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 8484ba: fld qword ptr [esp + 0xc]
        R.st[0] = R.st[0] * 2.5; // 8484be: fmul qword ptr [0x968e18]
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); // 8484c4: fst qword ptr [esp + 0xc]
        R.fcom(R.st[0], 2.0); R.fpop(); // 8484c8: fcomp qword ptr [0x968950]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8484ce: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 8484d0: test ah, 1
        if (R.zf) { pc = 511; continue; } // 8484d3: je 0x84862e
        pc = 489; continue;
      case 489: // 8484d9
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.ebx + 0x80) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 8484d9: mov ax, word ptr [ebx + 0x80]
        R.sub(((R.eax >>> 0) & 0xffff), 0x1a5e, 16); // 8484e0: cmp ax, 0x1a5e
        if (!R.cLE) { pc = 491; continue; } // 8484e4: jg 0x8484f7
        pc = 490; continue;
      case 490: // 8484e6
        R.ecx = (R.m.u32(((R.esp + 0x30) | 0) >>> 0)) | 0; // 8484e6: mov ecx, dword ptr [esp + 0x30]
        R.sub(((R.eax >>> 0) & 0xffff), R.m.u16(((R.ecx + 0x80) | 0) >>> 0), 16); // 8484ea: cmp ax, word ptr [ecx + 0x80]
        if (R.cLE) { pc = 511; continue; } // 8484f1: jle 0x84862e
        pc = 491; continue;
      case 491: // 8484f7
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 8484f7: fld qword ptr [esp + 0xc]
        R.st[0] = R.st[0] + 1.0; // 8484fb: fadd qword ptr [0x967890]
        R.fpush(2.0); // 848501: fld qword ptr [0x968950]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 848507: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 848509: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 84850b: test ah, 1
        if (R.zf) { pc = 493; continue; } // 84850e: je 0x848527
        pc = 492; continue;
      case 492: // 848510
        R.fpop(); // 848510: fstp st(0)
        R.m.w32(((R.esp + 0xc) | 0) >>> 0, 0x0); // 848512: mov dword ptr [esp + 0xc], 0
        R.m.w32(((R.esp + 0x10) | 0) >>> 0, 0x40000000); // 84851a: mov dword ptr [esp + 0x10], 0x40000000
        pc = 511; continue; // 848522: jmp 0x84862e
      case 493: // 848527
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 848527: fstp qword ptr [esp + 0xc]
        pc = 511; continue; // 84852b: jmp 0x84862e
      case 494: // 848530
        R.fpop(); // 848530: fstp st(0)
        pc = 495; continue;
      case 495: // 848532
        R.push(0x0); // 848532: push 0
        R.push((R.edi >>> 0)); // 848534: push edi
        R.call(0x544590, { n: 2, thisEcx: false, calleeClean: false }); // 848535: call 0x544590
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 84853a: add esp, 8
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84853d: test eax, eax
        if (R.zf) { pc = 497; continue; } // 84853f: je 0x848562
        pc = 496; continue;
      case 496: // 848541
        R.edx = (((R.m.u8(((R.esp + 0x43) | 0) >>> 0)) << 24 >> 24)) | 0; // 848541: movsx edx, byte ptr [esp + 0x43]
        R.m.w32(((R.esp + 0x44) | 0) >>> 0, (R.edx >>> 0)); // 848546: mov dword ptr [esp + 0x44], edx
        R.fpush(R.m.s32(((R.esp + 0x44) | 0) >>> 0)); // 84854a: fild dword ptr [esp + 0x44]
        R.st[0] = R.st[0] * 0.01; // 84854e: fmul qword ptr [0x967898]
        R.st[0] = 1.5 - R.st[0]; // 848554: fsubr qword ptr [0x968940]
        R.st[0] = R.st[0] * R.f64(((R.esp + 0xc) | 0)); // 84855a: fmul qword ptr [esp + 0xc]
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 84855e: fstp qword ptr [esp + 0xc]
        pc = 497; continue;
      default: return pc;
    }
  }
}
function f_846920_53(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 497: // 848562
        R.eax = (((R.m.u8(((R.esp + 0x43) | 0) >>> 0)) << 24 >> 24)) | 0; // 848562: movsx eax, byte ptr [esp + 0x43]
        R.m.w32(((R.esp + 0x44) | 0) >>> 0, (R.eax >>> 0)); // 848567: mov dword ptr [esp + 0x44], eax
        R.fpush(R.m.s32(((R.esp + 0x44) | 0) >>> 0)); // 84856b: fild dword ptr [esp + 0x44]
        R.st[0] = R.st[0] * 0.015; // 84856f: fmul qword ptr [0x96d370]
        R.st[0] = 1.0 - R.st[0]; // 848575: fsubr qword ptr [0x967890]
        R.fcom(R.st[0], 0.1); // 84857b: fcom qword ptr [0x967880]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 848581: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 848583: test ah, 1
        if (R.zf) { pc = 499; continue; } // 848586: je 0x848590
        pc = 498; continue;
      case 498: // 848588
        R.fpop(); // 848588: fstp st(0)
        R.fpush(0.1); // 84858a: fld qword ptr [0x967880]
        pc = 499; continue;
      case 499: // 848590
        R.fpush(R.st[0]); // 848590: fld st(0)
        R.st[0] = R.st[0] * R.f64(((R.esp + 0xc) | 0)); // 848592: fmul qword ptr [esp + 0xc]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 848596: test esi, esi
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 848598: fstp qword ptr [esp + 0xc]
        if (R.zf) { pc = 502; continue; } // 84859c: je 0x8485b3
        pc = 500; continue;
      case 500: // 84859e
        R.fcom(R.st[0], 0.6); R.fpop(); // 84859e: fcomp qword ptr [0x968e48]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8485a4: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 8485a6: test ah, 1
        if (R.zf) { pc = 503; continue; } // 8485a9: je 0x8485b5
        pc = 501; continue;
      case 501: // 8485ab
        R.m.w32(((R.esi) | 0) >>> 0, R.logic(R.m.u32(((R.esi) | 0) >>> 0) | 0x40000, 32)); // 8485ab: or dword ptr [esi], 0x40000
        pc = 503; continue; // 8485b1: jmp 0x8485b5
      case 502: // 8485b3
        R.fpop(); // 8485b3: fstp st(0)
        pc = 503; continue;
      case 503: // 8485b5
        R.ecx = (R.m.u32(((R.edi + 0x61) | 0) >>> 0)) | 0; // 8485b5: mov ecx, dword ptr [edi + 0x61]
        R.sub(R.m.u8(((R.ecx + 0xf) | 0) >>> 0), 0x14, 8); // 8485b8: cmp byte ptr [ecx + 0xf], 0x14
        if (!R.zf) { pc = 505; continue; } // 8485bc: jne 0x8485d4
        pc = 504; continue;
      case 504: // 8485be
        R.edx = (((R.m.u8(((R.esp + 0x1b) | 0) >>> 0)) << 24 >> 24)) | 0; // 8485be: movsx edx, byte ptr [esp + 0x1b]
        R.eax = (0x21) | 0; // 8485c3: mov eax, 0x21
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 8485c8: sub eax, edx
        R.m.w32(((R.esp + 0x44) | 0) >>> 0, (R.eax >>> 0)); // 8485ca: mov dword ptr [esp + 0x44], eax
        R.fpush(R.m.s32(((R.esp + 0x44) | 0) >>> 0)); // 8485ce: fild dword ptr [esp + 0x44]
        pc = 507; continue; // 8485d2: jmp 0x8485fb
      case 505: // 8485d4
        R.ecx = (((R.m.u8(((R.esp + 0x1b) | 0) >>> 0)) << 24 >> 24)) | 0; // 8485d4: movsx ecx, byte ptr [esp + 0x1b]
        R.edx = (0x1c) | 0; // 8485d9: mov edx, 0x1c
        R.edx = (R.sub((R.edx >>> 0), (R.ecx >>> 0), 32)) | 0; // 8485de: sub edx, ecx
        R.m.w32(((R.esp + 0x44) | 0) >>> 0, (R.edx >>> 0)); // 8485e0: mov dword ptr [esp + 0x44], edx
        R.fpush(R.m.s32(((R.esp + 0x44) | 0) >>> 0)); // 8485e4: fild dword ptr [esp + 0x44]
        R.fcom(R.st[0], 0.0); // 8485e8: fcom qword ptr [0x9689a0]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8485ee: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 8485f0: test ah, 1
        if (R.zf) { pc = 507; continue; } // 8485f3: je 0x8485fb
        pc = 506; continue;
      case 506: // 8485f5
        R.st[0] = R.st[0] * 0.4; // 8485f5: fmul qword ptr [0x968e00]
        pc = 507; continue;
      default: return pc;
    }
  }
}
function f_846920_54(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 507: // 8485fb
        R.st[0] = Math.abs(R.st[0]); // 8485fb: fabs 
        R.st[0] = R.st[0] * 0.08333333333333333; // 8485fd: fmul qword ptr [0x968f00]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 848603: test esi, esi
        R.st[0] = R.st[0] + 0.25; // 848605: fadd qword ptr [0x9689e0]
        R.fpush(R.st[0]); // 84860b: fld st(0)
        R.st[0] = R.st[0] * R.f64(((R.esp + 0xc) | 0)); // 84860d: fmul qword ptr [esp + 0xc]
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 848611: fstp qword ptr [esp + 0xc]
        if (R.zf) { pc = 510; continue; } // 848615: je 0x84862c
        pc = 508; continue;
      case 508: // 848617
        R.fcom(R.st[0], 0.6); R.fpop(); // 848617: fcomp qword ptr [0x968e48]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 84861d: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 84861f: test ah, 1
        if (R.zf) { pc = 511; continue; } // 848622: je 0x84862e
        pc = 509; continue;
      case 509: // 848624
        R.m.w32(((R.esi) | 0) >>> 0, R.logic(R.m.u32(((R.esi) | 0) >>> 0) | 0x40000, 32)); // 848624: or dword ptr [esi], 0x40000
        pc = 511; continue; // 84862a: jmp 0x84862e
      case 510: // 84862c
        R.fpop(); // 84862c: fstp st(0)
        pc = 511; continue;
      case 511: // 84862e
        R.eax = (R.m.u32(((R.esp + 0x30) | 0) >>> 0)) | 0; // 84862e: mov eax, dword ptr [esp + 0x30]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 848632: test eax, eax
        if (!R.zf) { pc = 513; continue; } // 848634: jne 0x848649
        pc = 512; continue;
      case 512: // 848636
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 848636: fld qword ptr [esp + 0xc]
        R.st[0] = R.st[0] * 1.75; // 84863a: fmul qword ptr [0x968f98]
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 848640: fstp qword ptr [esp + 0xc]
        pc = 568; continue; // 848644: jmp 0x8488eb
      case 513: // 848649
        R.push(0x0); // 848649: push 0
        R.push((R.edi >>> 0)); // 84864b: push edi
        R.call(0x544520, { n: 2, thisEcx: false, calleeClean: false }); // 84864c: call 0x544520
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 848651: add esp, 8
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 848654: test eax, eax
        if (!R.zf) { pc = 567; continue; } // 848656: jne 0x8488df
        pc = 514; continue;
      case 514: // 84865c
        R.push((R.eax >>> 0)); // 84865c: push eax
        R.push((R.edi >>> 0)); // 84865d: push edi
        R.call(0x544590, { n: 2, thisEcx: false, calleeClean: false }); // 84865e: call 0x544590
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 848663: add esp, 8
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 848666: test eax, eax
        if (!R.zf) { pc = 567; continue; } // 848668: jne 0x8488df
        pc = 515; continue;
      case 515: // 84866e
        R.esi = (R.m.u32(((R.esp + 0x3c) | 0) >>> 0)) | 0; // 84866e: mov esi, dword ptr [esp + 0x3c]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 848672: test esi, esi
        if (R.zf) { pc = 517; continue; } // 848674: je 0x848681
        pc = 516; continue;
      case 516: // 848676
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi + 0x49) | 0) >>> 0)) & 0xff) << 0)) | 0; // 848676: mov al, byte ptr [esi + 0x49]
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 848679: test al, al
        if (!R.zf) { pc = 567; continue; } // 84867b: jne 0x8488df
        pc = 517; continue;
      default: return pc;
    }
  }
}
function f_846920_55(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 517: // 848681
        R.ecx = ((R.ecx & 0xffff0000) | (((R.m.u16(((R.edi + 0x40) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 848681: mov cx, word ptr [edi + 0x40]
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 848685: xor eax, eax
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((0xae2c92) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 848687: mov ax, word ptr [0xae2c92]
        R.edx = ((R.edx & 0xffff0000) | (((R.m.u16(((R.edi + 0x3e) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 84868d: mov dx, word ptr [edi + 0x3e]
        R.ecx = (R.logic((R.ecx >>> 0) & 0xffff, 32)) | 0; // 848691: and ecx, 0xffff
        R.eax = (R.sub((R.eax >>> 0), (R.ecx >>> 0), 32)) | 0; // 848697: sub eax, ecx
        R.edx = (((((R.edx >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 848699: movsx edx, dx
        R.ecx = (((R.eax + R.eax * 8) | 0)) | 0; // 84869c: lea ecx, [eax + eax*8]
        R.eax = (((R.eax + R.ecx * 8) | 0)) | 0; // 84869f: lea eax, [eax + ecx*8]
        R.ecx = (((R.eax + R.eax * 4) | 0)) | 0; // 8486a2: lea ecx, [eax + eax*4]
        R.eax = (((R.m.u16(((0xae2c90) | 0) >>> 0)) << 16 >> 16)) | 0; // 8486a5: movsx eax, word ptr [0xae2c90]
        R.ecx = (R.sub((R.ecx >>> 0), (R.edx >>> 0), 32)) | 0; // 8486ac: sub ecx, edx
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 8486ae: add ecx, eax
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ebp + 0x14) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8486b0: mov al, byte ptr [ebp + 0x14]
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 8486b3: test al, al
        if (R.zf) { pc = 519; continue; } // 8486b5: je 0x8486d8
        pc = 518; continue;
      case 518: // 8486b7
        R.edx = (((R.m.u8(((R.esp + 0x43) | 0) >>> 0)) << 24 >> 24)) | 0; // 8486b7: movsx edx, byte ptr [esp + 0x43]
        R.eax = (0x66666667) | 0; // 8486bc: mov eax, 0x66666667
        { const p = BigInt(R.eax | 0) * BigInt((((R.edx >>> 0)) | 0)); R.eax = Number(BigInt.asIntN(32, p)); R.edx = Number(BigInt.asIntN(32, p >> 32n)); R.cf = R.of = BigInt.asIntN(32, p) !== p; } // 8486c1: imul edx
        R.edx = (R.sar((R.edx >>> 0), 0x1, 32)) | 0; // 8486c3: sar edx, 1
        R.eax = ((R.edx >>> 0)) | 0; // 8486c5: mov eax, edx
        R.eax = (R.shr((R.eax >>> 0), 0x1f, 32)) | 0; // 8486c7: shr eax, 0x1f
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 8486ca: add edx, eax
        R.eax = (0x14) | 0; // 8486cc: mov eax, 0x14
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 8486d1: sub eax, edx
        { const p = BigInt((((R.ecx >>> 0)) | 0)) * BigInt((((R.eax >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.eax = (Number(BigInt.asIntN(32, p))) | 0; } // 8486d3: imul eax, ecx
        pc = 524; continue; // 8486d6: jmp 0x84870b
      case 519: // 8486d8
        R.eax = (R.m.u32(((R.esi + 0x45) | 0) >>> 0)) | 0; // 8486d8: mov eax, dword ptr [esi + 0x45]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8486db: test eax, eax
        if (!R.zf) { pc = 521; continue; } // 8486dd: jne 0x8486f1
        pc = 520; continue;
      case 520: // 8486df
        R.edx = (((R.m.u8(((R.edi + 0x59) | 0) >>> 0)) << 24 >> 24)) | 0; // 8486df: movsx edx, byte ptr [edi + 0x59]
        R.edx = (R.add((R.edx >>> 0), 0x8, 32)) | 0; // 8486e3: add edx, 8
        { const p = BigInt((((R.edx >>> 0)) | 0)) * BigInt(15); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.edx = (Number(BigInt.asIntN(32, p))) | 0; } // 8486e6: imul edx, edx, 0xf
        R.sub((R.ecx >>> 0), (R.edx >>> 0), 32); // 8486e9: cmp ecx, edx
        if (R.cL) { pc = 39; continue; } // 8486eb: jl 0x846c70
        pc = 521; continue;
      case 521: // 8486f1
        R.eax = (((R.ecx + R.ecx * 4) | 0)) | 0; // 8486f1: lea eax, [ecx + ecx*4]
        R.ecx = (((R.m.u8(((R.edi + 0x59) | 0) >>> 0)) << 24 >> 24)) | 0; // 8486f4: movsx ecx, byte ptr [edi + 0x59]
        R.ecx = (R.add((R.ecx >>> 0), 0xa, 32)) | 0; // 8486f8: add ecx, 0xa
        R.eax = (R.shl((R.eax >>> 0), 0x2, 32)) | 0; // 8486fb: shl eax, 2
        R.sub((R.ecx >>> 0), 0x1, 32); // 8486fe: cmp ecx, 1
        if (!R.cL) { pc = 523; continue; } // 848701: jge 0x848708
        pc = 522; continue;
      case 522: // 848703
        R.ecx = (0x1) | 0; // 848703: mov ecx, 1
        pc = 523; continue;
      case 523: // 848708
        R.edx = R.eax < 0 ? -1 : 0; // 848708: cdq 
        { const n = (BigInt(R.edx | 0) << 32n) | BigInt(R.eax >>> 0); const d = BigInt((((R.ecx >>> 0)) | 0)); const q = n / d, r = n % d; R.eax = Number(BigInt.asIntN(32, q)); R.edx = Number(BigInt.asIntN(32, r)); } // 848709: idiv ecx
        pc = 524; continue;
      default: return pc;
    }
  }
}
function f_846920_56(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 524: // 84870b
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84870b: test eax, eax
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, (R.eax >>> 0)); // 84870d: mov dword ptr [esp + 0x34], eax
        if (R.cL) { pc = 39; continue; } // 848711: jl 0x846c70
        pc = 525; continue;
      case 525: // 848717
        R.sub((R.eax >>> 0), 0x190, 32); // 848717: cmp eax, 0x190
        if (R.cLE) { pc = 527; continue; } // 84871c: jle 0x84873c
        pc = 526; continue;
      case 526: // 84871e
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, 0x190); // 84871e: mov dword ptr [esp + 0x34], 0x190
        R.fpush(R.m.s32(((R.esp + 0x34) | 0) >>> 0)); // 848726: fild dword ptr [esp + 0x34]
        R.st[0] = R.st[0] * 0.0025; // 84872a: fmul qword ptr [0x969028]
        R.m.wf64(((R.esp + 0x84) | 0) >>> 0, R.st[0]); R.fpop(); // 848730: fstp qword ptr [esp + 0x84]
        pc = 567; continue; // 848737: jmp 0x8488df
      case 527: // 84873c
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84873c: test eax, eax
        if (R.zf) { pc = 39; continue; } // 84873e: je 0x846c70
        pc = 528; continue;
      case 528: // 848744
        R.fpush(R.m.s32(((R.esp + 0x34) | 0) >>> 0)); // 848744: fild dword ptr [esp + 0x34]
        R.st[0] = R.st[0] * 0.0025; // 848748: fmul qword ptr [0x969028]
        R.m.wf64(((R.esp + 0x84) | 0) >>> 0, R.st[0]); R.fpop(); // 84874e: fstp qword ptr [esp + 0x84]
        pc = 567; continue; // 848755: jmp 0x8488df
      case 529: // 84875a
        R.eax = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 84875a: mov eax, dword ptr [ebp + 0xc]
        R.push((R.eax >>> 0)); // 84875d: push eax
        R.call(0x600a50, { n: 5, thisEcx: false, calleeClean: false }); // 84875e: call 0x600a50
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 848763: add esp, 0x14
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 848766: test eax, eax
        if (R.zf) { pc = 549; continue; } // 848768: je 0x848821
        pc = 530; continue;
      case 530: // 84876e
        R.ecx = (((R.esp + 0x44) | 0)) | 0; // 84876e: lea ecx, [esp + 0x44]
        R.push(0x96); // 848772: push 0x96
        R.push((R.ecx >>> 0)); // 848777: push ecx
        R.ecx = (0xae2c90) | 0; // 848778: mov ecx, 0xae2c90
        R.call(0x54c8e0, { n: 2, thisEcx: true, calleeClean: true }); // 84877d: call 0x54c8e0
        R.edx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 848782: mov edx, dword ptr [eax]
        R.eax = (R.m.u32(((R.eax + 0x4) | 0) >>> 0)) | 0; // 848784: mov eax, dword ptr [eax + 4]
        R.ecx = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 848787: mov ecx, dword ptr [ebp + 0xc]
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, (R.eax >>> 0)); // 84878a: mov dword ptr [esp + 0x20], eax
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.edx >>> 0)); // 84878e: mov dword ptr [esp + 0x1c], edx
        R.esi = ((R.esi & 0xffff0000) | (((R.m.u16(((R.esp + 0x1e) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 848792: mov si, word ptr [esp + 0x1e]
        R.eax = (R.m.u32(((R.ecx + 0xcf) | 0) >>> 0)) | 0; // 848797: mov eax, dword ptr [ecx + 0xcf]
        R.ecx = ((R.ecx & 0xffff0000) | (((R.m.u16(((R.eax + 0x40) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 84879d: mov cx, word ptr [eax + 0x40]
        R.eax = (R.add((R.eax >>> 0), 0x3e, 32)) | 0; // 8487a1: add eax, 0x3e
        R.sub(((R.esi >>> 0) & 0xffff), ((R.ecx >>> 0) & 0xffff), 16); // 8487a4: cmp si, cx
        if (!R.cBE) { pc = 533; continue; } // 8487a7: ja 0x8487b9
        pc = 531; continue;
      case 531: // 8487a9
        if (R.cf) { pc = 549; continue; } // 8487a9: jb 0x848821
        pc = 532; continue;
      default: return pc;
    }
  }
}
function f_846920_57(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 532: // 8487ab
        R.ecx = (R.logic((R.ecx >>> 0) ^ (R.ecx >>> 0), 32)) | 0; // 8487ab: xor ecx, ecx
        R.sub(((R.edx >>> 0) & 0xffff), R.m.u16(((R.eax) | 0) >>> 0), 16); // 8487ad: cmp dx, word ptr [eax]
        R.ecx = ((R.ecx & 0xffffff00) | (((!R.cLE ? 1 : 0) & 0xff) << 0)) | 0; // 8487b0: setg cl
        R.eax = ((R.ecx >>> 0)) | 0; // 8487b3: mov eax, ecx
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8487b5: test eax, eax
        if (R.zf) { pc = 549; continue; } // 8487b7: je 0x848821
        pc = 533; continue;
      case 533: // 8487b9
        R.ecx = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 8487b9: mov ecx, dword ptr [ebp + 8]
        R.edx = ((R.edx & 0xffffff00) | (((0xce) & 0xff) << 0)) | 0; // 8487bc: mov dl, 0xce
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ecx + 0x59) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8487be: mov al, byte ptr [ecx + 0x59]
        R.edx = ((R.edx & 0xffffff00) | (((R.sub(((R.edx >>> 0) & 0xff), ((R.eax >>> 0) & 0xff), 8)) & 0xff) << 0)) | 0; // 8487c1: sub dl, al
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esp + 0x43) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8487c3: mov al, byte ptr [esp + 0x43]
        R.sub(((R.eax >>> 0) & 0xff), ((R.edx >>> 0) & 0xff), 8); // 8487c7: cmp al, dl
        if (!R.cL) { pc = 537; continue; } // 8487c9: jge 0x8487dd
        pc = 534; continue;
      case 534: // 8487cb
        R.sub(((R.ebx >>> 0) & 0xff), 0x5, 8); // 8487cb: cmp bl, 5
        if (R.zf) { pc = 537; continue; } // 8487ce: je 0x8487dd
        pc = 535; continue;
      case 535: // 8487d0
        R.sub(((R.ebx >>> 0) & 0xff), 0x6, 8); // 8487d0: cmp bl, 6
        if (R.zf) { pc = 537; continue; } // 8487d3: je 0x8487dd
        pc = 536; continue;
      case 536: // 8487d5
        R.ebx = ((R.ebx & 0xffffff00) | (((0x7) & 0xff) << 0)) | 0; // 8487d5: mov bl, 7
        R.m.w8(((R.esp + 0x1a) | 0) >>> 0, ((R.ebx >>> 0) & 0xff)); // 8487d7: mov byte ptr [esp + 0x1a], bl
        pc = 550; continue; // 8487db: jmp 0x848824
      case 537: // 8487dd
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esp + 0x43) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8487dd: mov al, byte ptr [esp + 0x43]
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 8487e1: test al, al
        if (!R.cL) { pc = 540; continue; } // 8487e3: jge 0x8487f2
        pc = 538; continue;
      case 538: // 8487e5
        R.sub(((R.ebx >>> 0) & 0xff), 0x4, 8); // 8487e5: cmp bl, 4
        if (!R.cL) { pc = 546; continue; } // 8487e8: jge 0x84880e
        pc = 539; continue;
      case 539: // 8487ea
        R.ebx = ((R.ebx & 0xffffff00) | (((0x4) & 0xff) << 0)) | 0; // 8487ea: mov bl, 4
        R.m.w8(((R.esp + 0x1a) | 0) >>> 0, ((R.ebx >>> 0) & 0xff)); // 8487ec: mov byte ptr [esp + 0x1a], bl
        pc = 550; continue; // 8487f0: jmp 0x848824
      case 540: // 8487f2
        R.sub(((R.eax >>> 0) & 0xff), 0x32, 8); // 8487f2: cmp al, 0x32
        if (!R.cL) { pc = 543; continue; } // 8487f4: jge 0x848803
        pc = 541; continue;
      case 541: // 8487f6
        R.sub(((R.ebx >>> 0) & 0xff), 0x3, 8); // 8487f6: cmp bl, 3
        if (!R.cL) { pc = 546; continue; } // 8487f9: jge 0x84880e
        pc = 542; continue;
      case 542: // 8487fb
        R.ebx = ((R.ebx & 0xffffff00) | (((0x3) & 0xff) << 0)) | 0; // 8487fb: mov bl, 3
        R.m.w8(((R.esp + 0x1a) | 0) >>> 0, ((R.ebx >>> 0) & 0xff)); // 8487fd: mov byte ptr [esp + 0x1a], bl
        pc = 550; continue; // 848801: jmp 0x848824
      case 543: // 848803
        R.sub(((R.eax >>> 0) & 0xff), 0x4b, 8); // 848803: cmp al, 0x4b
        if (!R.cL) { pc = 547; continue; } // 848805: jge 0x848814
        pc = 544; continue;
      default: return pc;
    }
  }
}
function f_846920_58(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 544: // 848807
        R.sub(((R.ebx >>> 0) & 0xff), 0x2, 8); // 848807: cmp bl, 2
        if (!R.cL) { pc = 546; continue; } // 84880a: jge 0x84880e
        pc = 545; continue;
      case 545: // 84880c
        R.ebx = ((R.ebx & 0xffffff00) | (((0x2) & 0xff) << 0)) | 0; // 84880c: mov bl, 2
        pc = 546; continue;
      case 546: // 84880e
        R.m.w8(((R.esp + 0x1a) | 0) >>> 0, ((R.ebx >>> 0) & 0xff)); // 84880e: mov byte ptr [esp + 0x1a], bl
        pc = 550; continue; // 848812: jmp 0x848824
      case 547: // 848814
        R.sub(((R.ebx >>> 0) & 0xff), 0x1, 8); // 848814: cmp bl, 1
        if (!R.cL) { pc = 546; continue; } // 848817: jge 0x84880e
        pc = 548; continue;
      case 548: // 848819
        R.ebx = ((R.ebx & 0xffffff00) | (((0x1) & 0xff) << 0)) | 0; // 848819: mov bl, 1
        R.m.w8(((R.esp + 0x1a) | 0) >>> 0, ((R.ebx >>> 0) & 0xff)); // 84881b: mov byte ptr [esp + 0x1a], bl
        pc = 550; continue; // 84881f: jmp 0x848824
      case 549: // 848821
        R.ecx = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 848821: mov ecx, dword ptr [ebp + 8]
        pc = 550; continue;
      case 550: // 848824
        R.eax = (((((R.ebx >>> 0) & 0xff)) << 24 >> 24)) | 0; // 848824: movsx eax, bl
        R.eax = (R.incdec((R.eax >>> 0), -1, 32)) | 0; // 848827: dec eax
        R.sub((R.eax >>> 0), 0x6, 32); // 848828: cmp eax, 6
        if (!R.cBE) { pc = 566; continue; } // 84882b: ja 0x8488dc
        pc = 551; continue;
      case 551: // 848831
        pc = [552, 566, 560, 553, 556, 561, 564][R.eax >>> 0] ?? -2; continue; // 848831: jmp dword ptr [eax*4 + 0x849cb8]
      case 552: // 848838
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 848838: fld qword ptr [esp + 0xc]
        R.st[0] = R.st[0] * 1.2; // 84883c: fmul qword ptr [0x968978]
        pc = 565; continue; // 848842: jmp 0x8488d8
      case 553: // 848847
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 848847: fld qword ptr [esp + 0xc]
        R.st[0] = R.st[0] * 0.85; // 84884b: fmul qword ptr [0x969520]
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esp + 0x1b) | 0) >>> 0)) & 0xff) << 0)) | 0; // 848851: mov al, byte ptr [esp + 0x1b]
        R.sub(((R.eax >>> 0) & 0xff), 0x17, 8); // 848855: cmp al, 0x17
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 848857: fstp qword ptr [esp + 0xc]
        if (R.cLE) { pc = 557; continue; } // 84885b: jle 0x848883
        pc = 554; continue;
      case 554: // 84885d
        R.sub(((R.eax >>> 0) & 0xff), 0x20, 8); // 84885d: cmp al, 0x20
        if (!R.cL) { pc = 566; continue; } // 84885f: jge 0x8488dc
        pc = 555; continue;
      case 555: // 848861
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 848861: fld qword ptr [esp + 0xc]
        R.st[0] = R.st[0] * 0.5; // 848865: fmul qword ptr [0x968968]
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 84886b: fstp qword ptr [esp + 0xc]
        pc = 557; continue; // 84886f: jmp 0x848883
      case 556: // 848871
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 848871: fld qword ptr [esp + 0xc]
        R.st[0] = R.st[0] * 0.75; // 848875: fmul qword ptr [0x969040]
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esp + 0x1b) | 0) >>> 0)) & 0xff) << 0)) | 0; // 84887b: mov al, byte ptr [esp + 0x1b]
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 84887f: fstp qword ptr [esp + 0xc]
        pc = 557; continue;
      case 557: // 848883
        R.sub(((R.eax >>> 0) & 0xff), 0x20, 8); // 848883: cmp al, 0x20
        if (!R.cL) { pc = 566; continue; } // 848885: jge 0x8488dc
        pc = 558; continue;
      default: return pc;
    }
  }
}
function f_846920_59(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 558: // 848887
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ecx + 0x22) | 0) >>> 0)) & 0xff) << 0)) | 0; // 848887: mov al, byte ptr [ecx + 0x22]
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 84888a: test al, al
        if (R.zf) { pc = 566; continue; } // 84888c: je 0x8488dc
        pc = 559; continue;
      case 559: // 84888e
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 84888e: fld qword ptr [esp + 0xc]
        R.st[0] = R.st[0] * 0.5; // 848892: fmul qword ptr [0x968968]
        pc = 565; continue; // 848898: jmp 0x8488d8
      case 560: // 84889a
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 84889a: fld qword ptr [esp + 0xc]
        R.st[0] = R.st[0] * 0.9; // 84889e: fmul qword ptr [0x9689d8]
        pc = 565; continue; // 8488a4: jmp 0x8488d8
      case 561: // 8488a6
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 8488a6: fld qword ptr [esp + 0xc]
        R.st[0] = R.st[0] * 0.7; // 8488aa: fmul qword ptr [0x968e40]
        R.sub(R.m.u8(((R.esp + 0x1b) | 0) >>> 0), 0x20, 8); // 8488b0: cmp byte ptr [esp + 0x1b], 0x20
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 8488b5: fstp qword ptr [esp + 0xc]
        if (!R.cL) { pc = 566; continue; } // 8488b9: jge 0x8488dc
        pc = 562; continue;
      case 562: // 8488bb
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ecx + 0x22) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8488bb: mov al, byte ptr [ecx + 0x22]
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 8488be: test al, al
        if (R.zf) { pc = 566; continue; } // 8488c0: je 0x8488dc
        pc = 563; continue;
      case 563: // 8488c2
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 8488c2: fld qword ptr [esp + 0xc]
        R.st[0] = R.st[0] * 0.25; // 8488c6: fmul qword ptr [0x9689e0]
        pc = 565; continue; // 8488cc: jmp 0x8488d8
      case 564: // 8488ce
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 8488ce: fld qword ptr [esp + 0xc]
        R.st[0] = R.st[0] * 0.01; // 8488d2: fmul qword ptr [0x967898]
        pc = 565; continue;
      case 565: // 8488d8
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 8488d8: fstp qword ptr [esp + 0xc]
        pc = 566; continue;
      case 566: // 8488dc
        R.edi = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 8488dc: mov edi, dword ptr [ebp + 8]
        pc = 567; continue;
      case 567: // 8488df
        R.ecx = (R.m.u32(((R.esp + 0x30) | 0) >>> 0)) | 0; // 8488df: mov ecx, dword ptr [esp + 0x30]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 8488e3: test ecx, ecx
        if (!R.zf) { pc = 580; continue; } // 8488e5: jne 0x84899d
        pc = 568; continue;
      case 568: // 8488eb
        R.eax = (R.m.u32(((R.edi + 0x1a) | 0) >>> 0)) | 0; // 8488eb: mov eax, dword ptr [edi + 0x1a]
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.eax + 0x7e) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8488ee: mov al, byte ptr [eax + 0x7e]
        R.sub(((R.eax >>> 0) & 0xff), 0x1, 8); // 8488f1: cmp al, 1
        if (R.cL) { pc = 570; continue; } // 8488f3: jl 0x8488f9
        pc = 569; continue;
      case 569: // 8488f5
        R.sub(((R.eax >>> 0) & 0xff), 0x3, 8); // 8488f5: cmp al, 3
        if (R.cLE) { pc = 571; continue; } // 8488f7: jle 0x8488fb
        pc = 570; continue;
      case 570: // 8488f9
        R.eax = ((R.eax & 0xffffff00) | (((0x3) & 0xff) << 0)) | 0; // 8488f9: mov al, 3
        pc = 571; continue;
      default: return pc;
    }
  }
}
function f_846920_60(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 571: // 8488fb
        { const p = ((R.eax << 24) >> 24) * ((((R.eax >>> 0) & 0xff)) << 24 >> 24); R.eax = ((R.eax & 0xffff0000) | (p & 0xffff)) | 0; R.cf = R.of = ((p << 24) >> 24) !== p; } // 8488fb: imul al
        R.m.w8(((R.esp + 0x56) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 8488fd: mov byte ptr [esp + 0x56], al
        R.eax = (R.m.u32(((R.edi + 0x61) | 0) >>> 0)) | 0; // 848901: mov eax, dword ptr [edi + 0x61]
        R.ecx = (((R.m.u16(((R.eax + 0xd) | 0) >>> 0)) << 16 >> 16)) | 0; // 848904: movsx ecx, word ptr [eax + 0xd]
        R.edx = (((R.m.u16(((R.eax + 0xb) | 0) >>> 0)) << 16 >> 16)) | 0; // 848908: movsx edx, word ptr [eax + 0xb]
        R.eax = (((R.m.u16(((R.eax + 0x9) | 0) >>> 0)) << 16 >> 16)) | 0; // 84890c: movsx eax, word ptr [eax + 9]
        R.ecx = (R.add((R.ecx >>> 0), (R.edx >>> 0), 32)) | 0; // 848910: add ecx, edx
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 848912: add ecx, eax
        R.eax = (0x55555556) | 0; // 848914: mov eax, 0x55555556
        { const p = BigInt(R.eax | 0) * BigInt((((R.ecx >>> 0)) | 0)); R.eax = Number(BigInt.asIntN(32, p)); R.edx = Number(BigInt.asIntN(32, p >> 32n)); R.cf = R.of = BigInt.asIntN(32, p) !== p; } // 848919: imul ecx
        R.ecx = ((R.edx >>> 0)) | 0; // 84891b: mov ecx, edx
        R.ecx = (R.shr((R.ecx >>> 0), 0x1f, 32)) | 0; // 84891d: shr ecx, 0x1f
        R.edx = (R.add((R.edx >>> 0), (R.ecx >>> 0), 32)) | 0; // 848920: add edx, ecx
        R.edx = (((((R.edx >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 848922: movsx edx, dx
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.edx >>> 0)); // 848925: mov dword ptr [esp + 0x24], edx
        R.fpush(R.m.s32(((R.esp + 0x24) | 0) >>> 0)); // 848929: fild dword ptr [esp + 0x24]
        R.st[0] = R.st[0] * 1.5; // 84892d: fmul qword ptr [0x968940]
        R.st[0] = R.st[0] - 5000.0; // 848933: fsub qword ptr [0x9688e8]
        R.ftol(); // 848939: call 0x945640
        R.esi = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 84893e: mov esi, dword ptr [ebp + 8]
        R.ebx = ((R.eax >>> 0)) | 0; // 848941: mov ebx, eax
        pc = 572; continue;
      case 572: // 848943
        R.edi = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 848943: mov edi, dword ptr [ebp + 0xc]
        pc = 573; continue;
      case 573: // 848946
        R.sub((R.edi >>> 0), R.m.u32(((R.esp + 0x30) | 0) >>> 0), 32); // 848946: cmp edi, dword ptr [esp + 0x30]
        if (R.zf) { pc = 818; continue; } // 84894a: je 0x8497c2
        pc = 574; continue;
      case 574: // 848950
        R.eax = (R.m.u32(((R.edi + 0x57) | 0) >>> 0)) | 0; // 848950: mov eax, dword ptr [edi + 0x57]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 848953: test eax, eax
        if (R.zf) { pc = 668; continue; } // 848955: je 0x84900c
        pc = 575; continue;
      case 575: // 84895b
        R.edx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 84895b: mov edx, dword ptr [eax]
        R.eax = (R.m.u32(((0x9cf764) | 0) >>> 0)) | 0; // 84895d: mov eax, dword ptr [0x9cf764]
        R.sub((R.edx >>> 0), (R.eax >>> 0), 32); // 848962: cmp edx, eax
        if (R.zf) { pc = 668; continue; } // 848964: je 0x84900c
        pc = 576; continue;
      case 576: // 84896a
        R.sub(R.m.u32(((R.esi + 0x39) | 0) >>> 0), (R.edi >>> 0), 32); // 84896a: cmp dword ptr [esi + 0x39], edi
        if (!R.zf) { pc = 670; continue; } // 84896d: jne 0x84901a
        pc = 577; continue;
      case 577: // 848973
        R.eax = (R.m.u32(((R.esi + 0x61) | 0) >>> 0)) | 0; // 848973: mov eax, dword ptr [esi + 0x61]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 848976: test eax, eax
        if (R.zf) { pc = 670; continue; } // 848978: je 0x84901a
        pc = 578; continue;
      case 578: // 84897e
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.eax + 0x45) | 0) >>> 0)) & 0xff) << 0)) | 0; // 84897e: mov al, byte ptr [eax + 0x45]
        R.sub(((R.eax >>> 0) & 0xff), 0xa, 8); // 848981: cmp al, 0xa
        if (R.cLE) { pc = 670; continue; } // 848983: jle 0x84901a
        pc = 579; continue;
      default: return pc;
    }
  }
}
function f_846920_61(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 579: // 848989
        R.eax = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 848989: movsx eax, al
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.eax >>> 0)); // 84898c: mov dword ptr [esp + 0x24], eax
        R.fpush(R.m.s32(((R.esp + 0x24) | 0) >>> 0)); // 848990: fild dword ptr [esp + 0x24]
        R.st[0] = R.st[0] * R.f64(((R.esp + 0xc) | 0)); // 848994: fmul qword ptr [esp + 0xc]
        pc = 669; continue; // 848998: jmp 0x849010
      case 580: // 84899d
        R.eax = (R.m.u32(((R.ecx + 0x53) | 0) >>> 0)) | 0; // 84899d: mov eax, dword ptr [ecx + 0x53]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8489a0: test eax, eax
        if (R.zf) { pc = 583; continue; } // 8489a2: je 0x8489af
        pc = 581; continue;
      case 581: // 8489a4
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.eax + 0x7e) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8489a4: mov al, byte ptr [eax + 0x7e]
        R.sub(((R.eax >>> 0) & 0xff), 0x1, 8); // 8489a7: cmp al, 1
        if (R.cL) { pc = 583; continue; } // 8489a9: jl 0x8489af
        pc = 582; continue;
      case 582: // 8489ab
        R.sub(((R.eax >>> 0) & 0xff), 0x3, 8); // 8489ab: cmp al, 3
        if (R.cLE) { pc = 584; continue; } // 8489ad: jle 0x8489b1
        pc = 583; continue;
      case 583: // 8489af
        R.eax = ((R.eax & 0xffffff00) | (((0x3) & 0xff) << 0)) | 0; // 8489af: mov al, 3
        pc = 584; continue;
      case 584: // 8489b1
        { const p = ((R.eax << 24) >> 24) * ((((R.eax >>> 0) & 0xff)) << 24 >> 24); R.eax = ((R.eax & 0xffff0000) | (p & 0xffff)) | 0; R.cf = R.of = ((p << 24) >> 24) !== p; } // 8489b1: imul al
        R.m.w8(((R.esp + 0x56) | 0) >>> 0, ((R.eax >>> 0) & 0xff)); // 8489b3: mov byte ptr [esp + 0x56], al
        R.eax = (R.m.u32(((R.ecx + 0x69) | 0) >>> 0)) | 0; // 8489b7: mov eax, dword ptr [ecx + 0x69]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8489ba: test eax, eax
        if (R.zf) { pc = 591; continue; } // 8489bc: je 0x848a44
        pc = 585; continue;
      case 585: // 8489c2
        R.eax = (R.m.u32(((R.eax + 0x38) | 0) >>> 0)) | 0; // 8489c2: mov eax, dword ptr [eax + 0x38]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8489c5: test eax, eax
        if (R.zf) { pc = 591; continue; } // 8489c7: je 0x848a44
        pc = 586; continue;
      case 586: // 8489c9
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.eax + 0x33) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8489c9: mov al, byte ptr [eax + 0x33]
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 8489cc: test al, al
        if (!R.zf) { pc = 588; continue; } // 8489ce: jne 0x8489e7
        pc = 587; continue;
      case 587: // 8489d0
        R.eax = (R.m.u32(((R.esp + 0x30) | 0) >>> 0)) | 0; // 8489d0: mov eax, dword ptr [esp + 0x30]
        R.edi = ((R.edi & 0xffff0000) | (((R.m.u16(((R.eax + 0x80) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 8489d4: mov di, word ptr [eax + 0x80]
        R.esi = (((((R.edi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 8489db: movsx esi, di
        R.eax = ((R.esi >>> 0)) | 0; // 8489de: mov eax, esi
        R.edx = R.eax < 0 ? -1 : 0; // 8489e0: cdq 
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 8489e1: sub eax, edx
        R.eax = (R.sar((R.eax >>> 0), 0x1, 32)) | 0; // 8489e3: sar eax, 1
        pc = 592; continue; // 8489e5: jmp 0x848a65
      default: return pc;
    }
  }
}
function f_846920_62(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 588: // 8489e7
        R.ebx = (R.m.u32(((R.esp + 0x30) | 0) >>> 0)) | 0; // 8489e7: mov ebx, dword ptr [esp + 0x30]
        R.ecx = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 8489eb: movsx ecx, al
        R.edi = ((R.edi & 0xffff0000) | (((R.m.u16(((R.ebx + 0x80) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 8489ee: mov di, word ptr [ebx + 0x80]
        R.eax = (0x88888889) | 0; // 8489f5: mov eax, 0x88888889
        R.esi = (((((R.edi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 8489fa: movsx esi, di
        { const p = BigInt((((R.esi >>> 0)) | 0)) * BigInt((((R.ecx >>> 0)) | 0)); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.ecx = (Number(BigInt.asIntN(32, p))) | 0; } // 8489fd: imul ecx, esi
        { const p = BigInt(R.eax | 0) * BigInt((((R.ecx >>> 0)) | 0)); R.eax = Number(BigInt.asIntN(32, p)); R.edx = Number(BigInt.asIntN(32, p >> 32n)); R.cf = R.of = BigInt.asIntN(32, p) !== p; } // 848a00: imul ecx
        R.edx = (R.add((R.edx >>> 0), (R.ecx >>> 0), 32)) | 0; // 848a02: add edx, ecx
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, (R.esi >>> 0)); // 848a04: mov dword ptr [esp + 0x34], esi
        R.fpush(R.m.s32(((R.esp + 0x34) | 0) >>> 0)); // 848a08: fild dword ptr [esp + 0x34]
        R.edx = (R.sar((R.edx >>> 0), 0x3, 32)) | 0; // 848a0c: sar edx, 3
        R.ecx = ((R.edx >>> 0)) | 0; // 848a0f: mov ecx, edx
        R.st[0] = R.st[0] * 0.2857142857142857; // 848a11: fmul qword ptr [0x96d5e0]
        R.ecx = (R.shr((R.ecx >>> 0), 0x1f, 32)) | 0; // 848a17: shr ecx, 0x1f
        R.edx = (R.add((R.edx >>> 0), (R.ecx >>> 0), 32)) | 0; // 848a1a: add edx, ecx
        R.m.w32(((R.esp + 0x44) | 0) >>> 0, (R.edx >>> 0)); // 848a1c: mov dword ptr [esp + 0x44], edx
        R.fpush(R.m.s32(((R.esp + 0x44) | 0) >>> 0)); // 848a20: fild dword ptr [esp + 0x44]
        R.m.wf64(((R.esp + 0x44) | 0) >>> 0, R.st[0]); R.fpop(); // 848a24: fstp qword ptr [esp + 0x44]
        R.fcom(R.st[0], R.f64(((R.esp + 0x44) | 0))); // 848a28: fcom qword ptr [esp + 0x44]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 848a2c: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 848a2e: test ah, 0x41
        if (R.zf) { pc = 590; continue; } // 848a31: je 0x848a39
        pc = 589; continue;
      case 589: // 848a33
        R.fpop(); // 848a33: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x44) | 0))); // 848a35: fld qword ptr [esp + 0x44]
        pc = 590; continue;
      case 590: // 848a39
        R.ftol(); // 848a39: call 0x945640
        R.m.w32(((R.esp + 0x44) | 0) >>> 0, (R.eax >>> 0)); // 848a3e: mov dword ptr [esp + 0x44], eax
        pc = 593; continue; // 848a42: jmp 0x848a6d
      case 591: // 848a44
        R.edx = (R.m.u32(((R.esp + 0x30) | 0) >>> 0)) | 0; // 848a44: mov edx, dword ptr [esp + 0x30]
        R.edi = ((R.edi & 0xffff0000) | (((R.m.u16(((R.edx + 0x80) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 848a48: mov di, word ptr [edx + 0x80]
        R.esi = (((((R.edi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 848a4f: movsx esi, di
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, (R.esi >>> 0)); // 848a52: mov dword ptr [esp + 0x34], esi
        R.fpush(R.m.s32(((R.esp + 0x34) | 0) >>> 0)); // 848a56: fild dword ptr [esp + 0x34]
        R.st[0] = R.st[0] * 0.2857142857142857; // 848a5a: fmul qword ptr [0x96d5e0]
        R.ftol(); // 848a60: call 0x945640
        pc = 592; continue;
      case 592: // 848a65
        R.ebx = (R.m.u32(((R.esp + 0x30) | 0) >>> 0)) | 0; // 848a65: mov ebx, dword ptr [esp + 0x30]
        R.m.w32(((R.esp + 0x44) | 0) >>> 0, (R.eax >>> 0)); // 848a69: mov dword ptr [esp + 0x44], eax
        pc = 593; continue;
      case 593: // 848a6d
        R.eax = (R.m.u32(((R.ebx + 0x57) | 0) >>> 0)) | 0; // 848a6d: mov eax, dword ptr [ebx + 0x57]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 848a70: test eax, eax
        if (R.zf) { pc = 601; continue; } // 848a72: je 0x848ad3
        pc = 594; continue;
      case 594: // 848a74
        R.sub(((R.edi >>> 0) & 0xffff), 0x1d4c, 16); // 848a74: cmp di, 0x1d4c
        if (R.cL) { pc = 599; continue; } // 848a79: jl 0x848aa0
        pc = 595; continue;
      case 595: // 848a7b
        R.sub(R.m.u32(((R.ebx + 0x73) | 0) >>> 0), 0x88b8, 32); // 848a7b: cmp dword ptr [ebx + 0x73], 0x88b8
        if (R.cLE) { pc = 599; continue; } // 848a82: jle 0x848aa0
        pc = 596; continue;
      default: return pc;
    }
  }
}
function f_846920_63(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 596: // 848a84
        R.eax = (((R.m.u16(((R.eax + 0x69) | 0) >>> 0)) << 16 >> 16)) | 0; // 848a84: movsx eax, word ptr [eax + 0x69]
        R.ecx = (((R.eax + R.eax * 2) | 0)) | 0; // 848a88: lea ecx, [eax + eax*2]
        R.eax = (((R.eax + R.ecx * 8) | 0)) | 0; // 848a8b: lea eax, [eax + ecx*8]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 848a8e: lea eax, [eax + eax*4]
        R.eax = (R.shl((R.eax >>> 0), 0x2, 32)) | 0; // 848a91: shl eax, 2
        R.sub((R.eax >>> 0), (R.esi >>> 0), 32); // 848a94: cmp eax, esi
        if (R.cLE) { pc = 598; continue; } // 848a96: jle 0x848a9c
        pc = 597; continue;
      case 597: // 848a98
        R.edx = ((R.eax >>> 0)) | 0; // 848a98: mov edx, eax
        pc = 602; continue; // 848a9a: jmp 0x848ad5
      case 598: // 848a9c
        R.edx = ((R.esi >>> 0)) | 0; // 848a9c: mov edx, esi
        pc = 602; continue; // 848a9e: jmp 0x848ad5
      case 599: // 848aa0
        R.ecx = (((R.m.u16(((R.eax + 0x69) | 0) >>> 0)) << 16 >> 16)) | 0; // 848aa0: movsx ecx, word ptr [eax + 0x69]
        R.edx = (((R.ecx + R.ecx * 2) | 0)) | 0; // 848aa4: lea edx, [ecx + ecx*2]
        R.eax = (((R.ecx + R.edx * 8) | 0)) | 0; // 848aa7: lea eax, [ecx + edx*8]
        R.edx = (((R.eax + R.eax * 4) | 0)) | 0; // 848aaa: lea edx, [eax + eax*4]
        R.eax = ((R.esi >>> 0)) | 0; // 848aad: mov eax, esi
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, (R.edx >>> 0)); // 848aaf: mov dword ptr [esp + 0x34], edx
        R.edx = R.eax < 0 ? -1 : 0; // 848ab3: cdq 
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 848ab4: sub eax, edx
        R.edx = (R.m.u32(((R.esp + 0x34) | 0) >>> 0)) | 0; // 848ab6: mov edx, dword ptr [esp + 0x34]
        R.eax = (R.sar((R.eax >>> 0), 0x1, 32)) | 0; // 848aba: sar eax, 1
        R.edx = (((R.eax + R.edx * 2) | 0)) | 0; // 848abc: lea edx, [eax + edx*2]
        R.eax = (((R.ecx + R.ecx * 2) | 0)) | 0; // 848abf: lea eax, [ecx + ecx*2]
        R.eax = (((R.ecx + R.eax * 8) | 0)) | 0; // 848ac2: lea eax, [ecx + eax*8]
        R.eax = (((R.eax + R.eax * 4) | 0)) | 0; // 848ac5: lea eax, [eax + eax*4]
        R.eax = (R.shl((R.eax >>> 0), 0x2, 32)) | 0; // 848ac8: shl eax, 2
        R.sub((R.eax >>> 0), (R.edx >>> 0), 32); // 848acb: cmp eax, edx
        if (R.cLE) { pc = 602; continue; } // 848acd: jle 0x848ad5
        pc = 600; continue;
      case 600: // 848acf
        R.edx = ((R.eax >>> 0)) | 0; // 848acf: mov edx, eax
        pc = 602; continue; // 848ad1: jmp 0x848ad5
      case 601: // 848ad3
        R.edx = ((R.edi >>> 0)) | 0; // 848ad3: mov edx, edi
        pc = 602; continue;
      case 602: // 848ad5
        R.eax = (R.m.u32(((R.ebx + 0x1db) | 0) >>> 0)) | 0; // 848ad5: mov eax, dword ptr [ebx + 0x1db]
        R.m.w32(((R.esp + 0x6c) | 0) >>> 0, (R.edx >>> 0)); // 848adb: mov dword ptr [esp + 0x6c], edx
        R.sub((R.eax >>> 0), 0xffffffff, 32); // 848adf: cmp eax, -1
        if (R.cLE) { pc = 605; continue; } // 848ae2: jle 0x848af3
        pc = 603; continue;
      case 603: // 848ae4
        R.sub((R.eax >>> 0), R.m.u32(((0x9cf6f8) | 0) >>> 0), 32); // 848ae4: cmp eax, dword ptr [0x9cf6f8]
        if (!R.zf) { pc = 606; continue; } // 848aea: jne 0x848b09
        pc = 604; continue;
      case 604: // 848aec
        R.sub(((R.edi >>> 0) & 0xffff), 0x1388, 16); // 848aec: cmp di, 0x1388
        if (R.cL) { pc = 606; continue; } // 848af1: jl 0x848b09
        pc = 605; continue;
      default: return pc;
    }
  }
}
function f_846920_64(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 605: // 848af3
        R.eax = (R.m.u32(((R.ebx) | 0) >>> 0)) | 0; // 848af3: mov eax, dword ptr [ebx]
        R.ecx = (((R.eax + R.eax * 2) | 0)) | 0; // 848af5: lea ecx, [eax + eax*2]
        R.eax = (R.m.u32(((0xae2d14) | 0) >>> 0)) | 0; // 848af8: mov eax, dword ptr [0xae2d14]
        R.eax = (R.m.u32(((R.eax + R.ecx * 2) | 0) >>> 0)) | 0; // 848afd: mov eax, dword ptr [eax + ecx*2]
        R.sub((R.eax >>> 0), 0xffffffff, 32); // 848b00: cmp eax, -1
        if (R.cLE) { pc = 615; continue; } // 848b03: jle 0x848b9e
        pc = 606; continue;
      case 606: // 848b09
        R.ecx = (((R.eax + R.eax * 2) | 0)) | 0; // 848b09: lea ecx, [eax + eax*2]
        R.ecx = (((R.ecx + R.ecx * 8) | 0)) | 0; // 848b0c: lea ecx, [ecx + ecx*8]
        R.ecx = (R.shl((R.ecx >>> 0), 0x2, 32)) | 0; // 848b0f: shl ecx, 2
        R.ecx = (R.sub((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 848b12: sub ecx, eax
        R.eax = (R.m.u32(((0xae23d0) | 0) >>> 0)) | 0; // 848b14: mov eax, dword ptr [0xae23d0]
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 848b19: add ecx, eax
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 848b1b: test ecx, ecx
        R.m.w32(((R.esp + 0x78) | 0) >>> 0, (R.ecx >>> 0)); // 848b1d: mov dword ptr [esp + 0x78], ecx
        if (R.zf) { pc = 615; continue; } // 848b21: je 0x848b9e
        pc = 607; continue;
      case 607: // 848b23
        R.eax = (R.m.u32(((R.ecx) | 0) >>> 0)) | 0; // 848b23: mov eax, dword ptr [ecx]
        R.ecx = (R.m.u32(((0x9cf6e8) | 0) >>> 0)) | 0; // 848b25: mov ecx, dword ptr [0x9cf6e8]
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 848b2b: cmp eax, ecx
        if (!R.zf) { pc = 609; continue; } // 848b2d: jne 0x848b36
        pc = 608; continue;
      case 608: // 848b2f
        R.ebx = (0x3a98) | 0; // 848b2f: mov ebx, 0x3a98
        pc = 610; continue; // 848b34: jmp 0x848b43
      case 609: // 848b36
        R.ecx = (R.m.u32(((R.esp + 0x78) | 0) >>> 0)) | 0; // 848b36: mov ecx, dword ptr [esp + 0x78]
        R.ebx = ((R.ebx & 0xffff0000) | (((R.m.u16(((R.ecx + 0x69) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 848b3a: mov bx, word ptr [ecx + 0x69]
        { const p = BigInt(((((R.ebx >>> 0) & 0xffff)) << 16 >> 16)) * BigInt(600); R.cf = R.of = BigInt.asIntN(32, p) !== p; R.ebx = ((R.ebx & 0xffff0000) | (((Number(BigInt.asIntN(32, p))) & 0xffff) << 0)) | 0; } // 848b3e: imul bx, bx, 0x258
        pc = 610; continue;
      case 610: // 848b43
        R.edx = (R.m.u32(((0xadadfc) | 0) >>> 0)) | 0; // 848b43: mov edx, dword ptr [0xadadfc]
        R.edi = (R.m.u32(((R.esp + 0x30) | 0) >>> 0)) | 0; // 848b49: mov edi, dword ptr [esp + 0x30]
        R.push((R.edi >>> 0)); // 848b4d: push edi
        R.eax = (R.m.u32(((R.edx + R.eax * 4) | 0) >>> 0)) | 0; // 848b4e: mov eax, dword ptr [edx + eax*4]
        R.ecx = (R.m.u32(((R.eax + 0x8) | 0) >>> 0)) | 0; // 848b51: mov ecx, dword ptr [eax + 8]
        R.call(0x4a4850, { n: 1, thisEcx: true, calleeClean: true }); // 848b54: call 0x4a4850
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 848b59: test eax, eax
        if (R.zf) { pc = 618; continue; } // 848b5b: je 0x848bcf
        pc = 611; continue;
      case 611: // 848b5d
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.eax + 0x4) | 0) >>> 0)) & 0xff) << 0)) | 0; // 848b5d: mov cl, byte ptr [eax + 4]
        R.logic(((R.ecx >>> 0) & 0xff) & ((R.ecx >>> 0) & 0xff), 8); // 848b60: test cl, cl
        if (!R.zf) { pc = 618; continue; } // 848b62: jne 0x848bcf
        pc = 612; continue;
      case 612: // 848b64
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.eax + 0x72) | 0) >>> 0)) & 0xff) << 0)) | 0; // 848b64: mov al, byte ptr [eax + 0x72]
        R.sub(((R.eax >>> 0) & 0xff), 0x1, 8); // 848b67: cmp al, 1
        if (R.cf) { pc = 618; continue; } // 848b69: jb 0x848bcf
        pc = 613; continue;
      case 613: // 848b6b
        R.sub(((R.eax >>> 0) & 0xff), 0x10, 8); // 848b6b: cmp al, 0x10
        if (!R.cBE) { pc = 618; continue; } // 848b6d: ja 0x848bcf
        pc = 614; continue;
      default: return pc;
    }
  }
}
function f_846920_65(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 614: // 848b6f
        R.eax = (R.logic((R.eax >>> 0) & 0xff, 32)) | 0; // 848b6f: and eax, 0xff
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, (R.eax >>> 0)); // 848b74: mov dword ptr [esp + 0x34], eax
        R.fpush(R.m.s32(((R.esp + 0x34) | 0) >>> 0)); // 848b78: fild dword ptr [esp + 0x34]
        R.ecx = (((((R.ebx >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 848b7c: movsx ecx, bx
        R.st[0] = R.st[0] * 0.02; // 848b7f: fmul qword ptr [0x968a98]
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, (R.ecx >>> 0)); // 848b85: mov dword ptr [esp + 0x34], ecx
        R.st[0] = 1.32 - R.st[0]; // 848b89: fsubr qword ptr [0x96af38]
        R.fpush(R.m.s32(((R.esp + 0x34) | 0) >>> 0)); // 848b8f: fild dword ptr [esp + 0x34]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 848b93: fmulp st(1)
        R.ftol(); // 848b95: call 0x945640
        R.ebx = ((R.eax >>> 0)) | 0; // 848b9a: mov ebx, eax
        pc = 618; continue; // 848b9c: jmp 0x848bcf
      case 615: // 848b9e
        R.edx = (((((R.edx >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 848b9e: movsx edx, dx
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, (R.edx >>> 0)); // 848ba1: mov dword ptr [esp + 0x34], edx
        R.fpush(R.m.s32(((R.esp + 0x34) | 0) >>> 0)); // 848ba5: fild dword ptr [esp + 0x34]
        R.st[0] = R.st[0] * 0.8; // 848ba9: fmul qword ptr [0x9689b0]
        R.fcom(R.st[0], 7000.0); // 848baf: fcom qword ptr [0x96d470]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 848bb5: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 848bb7: test ah, 1
        if (!R.zf) { pc = 617; continue; } // 848bba: jne 0x848bc4
        pc = 616; continue;
      case 616: // 848bbc
        R.fpop(); // 848bbc: fstp st(0)
        R.fpush(7000.0); // 848bbe: fld qword ptr [0x96d470]
        pc = 617; continue;
      case 617: // 848bc4
        R.ftol(); // 848bc4: call 0x945640
        R.edi = (R.m.u32(((R.esp + 0x30) | 0) >>> 0)) | 0; // 848bc9: mov edi, dword ptr [esp + 0x30]
        R.ebx = ((R.eax >>> 0)) | 0; // 848bcd: mov ebx, eax
        pc = 618; continue;
      case 618: // 848bcf
        R.eax = (R.m.u32(((R.edi + 0xcf) | 0) >>> 0)) | 0; // 848bcf: mov eax, dword ptr [edi + 0xcf]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 848bd5: test eax, eax
        if (!R.zf) { pc = 620; continue; } // 848bd7: jne 0x848bf1
        pc = 619; continue;
      case 619: // 848bd9
        R.eax = (((R.m.u16(((R.esp + 0x6c) | 0) >>> 0)) << 16 >> 16)) | 0; // 848bd9: movsx eax, word ptr [esp + 0x6c]
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, (R.eax >>> 0)); // 848bde: mov dword ptr [esp + 0x34], eax
        R.fpush(R.m.s32(((R.esp + 0x34) | 0) >>> 0)); // 848be2: fild dword ptr [esp + 0x34]
        R.st[0] = R.st[0] * 0.75; // 848be6: fmul qword ptr [0x969040]
        pc = 628; continue; // 848bec: jmp 0x848d0c
      case 620: // 848bf1
        R.eax = (R.m.u32(((R.eax + 0x69) | 0) >>> 0)) | 0; // 848bf1: mov eax, dword ptr [eax + 0x69]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 848bf4: test eax, eax
        if (!R.zf) { pc = 622; continue; } // 848bf6: jne 0x848c10
        pc = 621; continue;
      case 621: // 848bf8
        R.ecx = (((R.m.u16(((R.esp + 0x6c) | 0) >>> 0)) << 16 >> 16)) | 0; // 848bf8: movsx ecx, word ptr [esp + 0x6c]
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, (R.ecx >>> 0)); // 848bfd: mov dword ptr [esp + 0x34], ecx
        R.fpush(R.m.s32(((R.esp + 0x34) | 0) >>> 0)); // 848c01: fild dword ptr [esp + 0x34]
        R.st[0] = R.st[0] * 0.75; // 848c05: fmul qword ptr [0x969040]
        pc = 628; continue; // 848c0b: jmp 0x848d0c
      case 622: // 848c10
        R.ecx = (R.m.u32(((0xb67a44) | 0) >>> 0)) | 0; // 848c10: mov ecx, dword ptr [0xb67a44]
        R.esi = ((R.esi & 0xffff0000) | (((R.m.u16(((R.eax + 0xa) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 848c16: mov si, word ptr [eax + 0xa]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 848c1a: test ecx, ecx
        if (R.zf) { pc = 629; continue; } // 848c1c: je 0x848d13
        pc = 623; continue;
      default: return pc;
    }
  }
}
function f_846920_66(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 623: // 848c22
        R.eax = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 848c22: mov eax, dword ptr [edi]
        R.ecx = (R.m.u32(((R.ecx) | 0) >>> 0)) | 0; // 848c24: mov ecx, dword ptr [ecx]
        R.edx = (((R.eax + R.eax * 8) | 0)) | 0; // 848c26: lea edx, [eax + eax*8]
        R.eax = (((R.eax + R.edx * 8) | 0)) | 0; // 848c29: lea eax, [eax + edx*8]
        R.edx = ((R.edx & 0xffff0000) | (((R.m.u16(((R.eax + R.ecx + 0x8) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 848c2c: mov dx, word ptr [eax + ecx + 8]
        R.eax = (R.add((R.eax >>> 0), (R.ecx >>> 0), 32)) | 0; // 848c31: add eax, ecx
        R.edx = (((((R.edx >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 848c33: movsx edx, dx
        R.ecx = ((R.ecx & 0xffff0000) | (((R.m.u16(((R.eax + 0x6) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 848c36: mov cx, word ptr [eax + 6]
        R.eax = (((R.m.u16(((R.eax + 0xa) | 0) >>> 0)) << 16 >> 16)) | 0; // 848c3a: movsx eax, word ptr [eax + 0xa]
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, (R.eax >>> 0)); // 848c3e: mov dword ptr [esp + 0x34], eax
        R.fpush(R.m.s32(((R.esp + 0x34) | 0) >>> 0)); // 848c42: fild dword ptr [esp + 0x34]
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, (R.edx >>> 0)); // 848c46: mov dword ptr [esp + 0x34], edx
        R.fpush(R.m.s32(((R.esp + 0x34) | 0) >>> 0)); // 848c4a: fild dword ptr [esp + 0x34]
        R.eax = (((((R.ecx >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 848c4e: movsx eax, cx
        R.st[1] = R.st[1] + R.st[0]; R.fpop(); // 848c51: faddp st(1)
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, (R.eax >>> 0)); // 848c53: mov dword ptr [esp + 0x34], eax
        R.st[0] = R.st[0] * 0.25; // 848c57: fmul qword ptr [0x9689e0]
        R.fpush(R.m.s32(((R.esp + 0x34) | 0) >>> 0)); // 848c5d: fild dword ptr [esp + 0x34]
        R.st[0] = R.st[0] * 0.5; // 848c61: fmul qword ptr [0x968968]
        R.st[1] = R.st[1] + R.st[0]; R.fpop(); // 848c67: faddp st(1)
        R.ftol(); // 848c69: call 0x945640
        R.sub(((R.eax >>> 0) & 0xffff), 0x1388, 16); // 848c6e: cmp ax, 0x1388
        if (!R.cL) { pc = 626; continue; } // 848c72: jge 0x848cc1
        pc = 624; continue;
      case 624: // 848c74
        R.ecx = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 848c74: movsx ecx, ax
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, (R.ecx >>> 0)); // 848c77: mov dword ptr [esp + 0x34], ecx
        R.fpush(R.m.s32(((R.esp + 0x34) | 0) >>> 0)); // 848c7b: fild dword ptr [esp + 0x34]
        R.edx = (((((R.esi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 848c7f: movsx edx, si
        R.st[0] = R.st[0] * 0.0008; // 848c82: fmul qword ptr [0x96a618]
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, (R.edx >>> 0)); // 848c88: mov dword ptr [esp + 0x34], edx
        R.st[0] = 5.0 - R.st[0]; // 848c8c: fsubr qword ptr [0x9688a0]
        R.fpush(R.m.s32(((R.esp + 0x34) | 0) >>> 0)); // 848c92: fild dword ptr [esp + 0x34]
        R.fpush(R.st[0]); // 848c96: fld st(0)
        R.st[0] = R.st[0] / R.st[2]; // 848c98: fdiv st(2)
        R.m.wf64(((R.esp + 0x34) | 0) >>> 0, R.st[0]); R.fpop(); // 848c9a: fstp qword ptr [esp + 0x34]
        { const t = R.st[0]; R.st[0] = R.st[1]; R.st[1] = t; } // 848c9e: fxch st(1)
        R.st[0] = R.st[0] * 1000.0; // 848ca0: fmul qword ptr [0x968908]
        R.st[0] = R.st[1] - R.st[0]; // 848ca6: fsubr st(1)
        { const t = R.st[0]; R.st[0] = R.st[1]; R.st[1] = t; } // 848ca8: fxch st(1)
        R.fpop(); // 848caa: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x34) | 0))); // 848cac: fld qword ptr [esp + 0x34]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 848cb0: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 848cb2: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 848cb4: test ah, 0x41
        if (!R.zf) { pc = 628; continue; } // 848cb7: jne 0x848d0c
        pc = 625; continue;
      case 625: // 848cb9
        R.fpop(); // 848cb9: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x34) | 0))); // 848cbb: fld qword ptr [esp + 0x34]
        pc = 628; continue; // 848cbf: jmp 0x848d0c
      default: return pc;
    }
  }
}
function f_846920_67(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 626: // 848cc1
        R.eax = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 848cc1: movsx eax, ax
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, (R.eax >>> 0)); // 848cc4: mov dword ptr [esp + 0x34], eax
        R.fpush(R.m.s32(((R.esp + 0x34) | 0) >>> 0)); // 848cc8: fild dword ptr [esp + 0x34]
        R.ecx = (((((R.esi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 848ccc: movsx ecx, si
        R.st[0] = R.st[0] * 0.0001; // 848ccf: fmul qword ptr [0x96a5c0]
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, (R.ecx >>> 0)); // 848cd5: mov dword ptr [esp + 0x34], ecx
        R.st[0] = R.st[0] + 0.5; // 848cd9: fadd qword ptr [0x968968]
        R.fpush(R.m.s32(((R.esp + 0x34) | 0) >>> 0)); // 848cdf: fild dword ptr [esp + 0x34]
        R.fpush(R.st[0]); // 848ce3: fld st(0)
        R.st[0] = R.st[0] * R.st[2]; // 848ce5: fmul st(2)
        R.m.wf64(((R.esp + 0x34) | 0) >>> 0, R.st[0]); R.fpop(); // 848ce7: fstp qword ptr [esp + 0x34]
        { const t = R.st[0]; R.st[0] = R.st[1]; R.st[1] = t; } // 848ceb: fxch st(1)
        R.st[0] = R.st[0] * 1000.0; // 848ced: fmul qword ptr [0x968908]
        R.st[0] = R.st[0] + R.st[1]; // 848cf3: fadd st(1)
        { const t = R.st[0]; R.st[0] = R.st[1]; R.st[1] = t; } // 848cf5: fxch st(1)
        R.fpop(); // 848cf7: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x34) | 0))); // 848cf9: fld qword ptr [esp + 0x34]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 848cfd: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 848cff: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 848d01: test ah, 1
        if (R.zf) { pc = 628; continue; } // 848d04: je 0x848d0c
        pc = 627; continue;
      case 627: // 848d06
        R.fpop(); // 848d06: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x34) | 0))); // 848d08: fld qword ptr [esp + 0x34]
        pc = 628; continue;
      case 628: // 848d0c
        R.ftol(); // 848d0c: call 0x945640
        R.esi = ((R.eax >>> 0)) | 0; // 848d11: mov esi, eax
        pc = 629; continue;
      case 629: // 848d13
        R.eax = (R.m.u32(((R.esp + 0x30) | 0) >>> 0)) | 0; // 848d13: mov eax, dword ptr [esp + 0x30]
        R.ecx = (R.m.u32(((0xae2a38) | 0) >>> 0)) | 0; // 848d17: mov ecx, dword ptr [0xae2a38]
        R.push((R.eax >>> 0)); // 848d1d: push eax
        R.edi = ((R.edi & 0xffff0000) | (((R.m.u16(((R.eax + 0x80) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 848d1e: mov di, word ptr [eax + 0x80]
        R.call(0x5a0590, { n: 1, thisEcx: true, calleeClean: true }); // 848d25: call 0x5a0590
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 848d2a: test eax, eax
        if (R.zf) { pc = 644; continue; } // 848d2c: je 0x848df6
        pc = 630; continue;
      case 630: // 848d32
        R.sub(R.m.u8(((R.esp + 0x56) | 0) >>> 0), 0x1, 8); // 848d32: cmp byte ptr [esp + 0x56], 1
        if (!R.zf) { pc = 644; continue; } // 848d37: jne 0x848df6
        pc = 631; continue;
      case 631: // 848d3d
        R.ecx = (R.m.u32(((R.esp + 0x3c) | 0) >>> 0)) | 0; // 848d3d: mov ecx, dword ptr [esp + 0x3c]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 848d41: test ecx, ecx
        if (R.zf) { pc = 644; continue; } // 848d43: je 0x848df6
        pc = 632; continue;
      case 632: // 848d49
        R.edx = ((R.ecx >>> 0)) | 0; // 848d49: mov edx, ecx
        R.ecx = (R.m.u32(((R.edx + 0x45) | 0) >>> 0)) | 0; // 848d4b: mov ecx, dword ptr [edx + 0x45]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 848d4e: test ecx, ecx
        if (!R.zf) { pc = 644; continue; } // 848d50: jne 0x848df6
        pc = 633; continue;
      default: return pc;
    }
  }
}
function f_846920_68(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 633: // 848d56
        R.ecx = ((R.eax >>> 0)) | 0; // 848d56: mov ecx, eax
        R.call(0x5986b0, { n: 0, thisEcx: true, calleeClean: false }); // 848d58: call 0x5986b0
        R.sub(((R.eax >>> 0) & 0xff), 0xfe, 8); // 848d5d: cmp al, 0xfe
        if (R.zf) { pc = 642; continue; } // 848d5f: je 0x848de9
        pc = 634; continue;
      case 634: // 848d65
        R.sub(((R.eax >>> 0) & 0xff), 0x1, 8); // 848d65: cmp al, 1
        if (R.zf) { pc = 639; continue; } // 848d67: je 0x848dad
        pc = 635; continue;
      case 635: // 848d69
        R.sub(((R.eax >>> 0) & 0xff), 0x2, 8); // 848d69: cmp al, 2
        if (!R.zf) { pc = 644; continue; } // 848d6b: jne 0x848df6
        pc = 636; continue;
      case 636: // 848d71
        R.eax = (((((R.edi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 848d71: movsx eax, di
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, (R.eax >>> 0)); // 848d74: mov dword ptr [esp + 0x34], eax
        R.eax = (R.add((R.eax >>> 0), 0x5dc, 32)) | 0; // 848d78: add eax, 0x5dc
        R.fpush(R.m.s32(((R.esp + 0x34) | 0) >>> 0)); // 848d7d: fild dword ptr [esp + 0x34]
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, (R.eax >>> 0)); // 848d81: mov dword ptr [esp + 0x34], eax
        R.st[0] = R.st[0] * 1.5; // 848d85: fmul qword ptr [0x968940]
        R.fpush(R.m.s32(((R.esp + 0x34) | 0) >>> 0)); // 848d8b: fild dword ptr [esp + 0x34]
        R.m.wf64(((R.esp + 0x34) | 0) >>> 0, R.st[0]); R.fpop(); // 848d8f: fstp qword ptr [esp + 0x34]
        R.fcom(R.st[0], R.f64(((R.esp + 0x34) | 0))); // 848d93: fcom qword ptr [esp + 0x34]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 848d97: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 848d99: test ah, 0x41
        if (R.zf) { pc = 638; continue; } // 848d9c: je 0x848da4
        pc = 637; continue;
      case 637: // 848d9e
        R.fpop(); // 848d9e: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x34) | 0))); // 848da0: fld qword ptr [esp + 0x34]
        pc = 638; continue;
      case 638: // 848da4
        R.ftol(); // 848da4: call 0x945640
        R.edi = ((R.eax >>> 0)) | 0; // 848da9: mov edi, eax
        pc = 644; continue; // 848dab: jmp 0x848df6
      case 639: // 848dad
        R.eax = (((((R.edi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 848dad: movsx eax, di
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, (R.eax >>> 0)); // 848db0: mov dword ptr [esp + 0x34], eax
        R.eax = (R.add((R.eax >>> 0), 0x2ee, 32)) | 0; // 848db4: add eax, 0x2ee
        R.fpush(R.m.s32(((R.esp + 0x34) | 0) >>> 0)); // 848db9: fild dword ptr [esp + 0x34]
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, (R.eax >>> 0)); // 848dbd: mov dword ptr [esp + 0x34], eax
        R.st[0] = R.st[0] * 1.25; // 848dc1: fmul qword ptr [0x968928]
        R.fpush(R.m.s32(((R.esp + 0x34) | 0) >>> 0)); // 848dc7: fild dword ptr [esp + 0x34]
        R.m.wf64(((R.esp + 0x34) | 0) >>> 0, R.st[0]); R.fpop(); // 848dcb: fstp qword ptr [esp + 0x34]
        R.fcom(R.st[0], R.f64(((R.esp + 0x34) | 0))); // 848dcf: fcom qword ptr [esp + 0x34]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 848dd3: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 848dd5: test ah, 0x41
        if (R.zf) { pc = 641; continue; } // 848dd8: je 0x848de0
        pc = 640; continue;
      case 640: // 848dda
        R.fpop(); // 848dda: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x34) | 0))); // 848ddc: fld qword ptr [esp + 0x34]
        pc = 641; continue;
      case 641: // 848de0
        R.ftol(); // 848de0: call 0x945640
        R.edi = ((R.eax >>> 0)) | 0; // 848de5: mov edi, eax
        pc = 644; continue; // 848de7: jmp 0x848df6
      default: return pc;
    }
  }
}
function f_846920_69(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 642: // 848de9
        R.eax = (R.m.u32(((R.ebp + 0x1c) | 0) >>> 0)) | 0; // 848de9: mov eax, dword ptr [ebp + 0x1c]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 848dec: test eax, eax
        if (R.zf) { pc = 644; continue; } // 848dee: je 0x848df6
        pc = 643; continue;
      case 643: // 848df0
        R.m.w32(((R.eax) | 0) >>> 0, R.logic(R.m.u32(((R.eax) | 0) >>> 0) | 0x40000000, 32)); // 848df0: or dword ptr [eax], 0x40000000
        pc = 644; continue;
      case 644: // 848df6
        R.eax = (R.m.u32(((R.esp + 0x30) | 0) >>> 0)) | 0; // 848df6: mov eax, dword ptr [esp + 0x30]
        R.edx = (R.m.u32(((R.esp + 0x24) | 0) >>> 0)) | 0; // 848dfa: mov edx, dword ptr [esp + 0x24]
        R.eax = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 848dfe: mov eax, dword ptr [eax]
        R.ecx = (((R.eax + R.eax * 8) | 0)) | 0; // 848e00: lea ecx, [eax + eax*8]
        R.eax = (R.m.u32(((R.edx + 0xdc) | 0) >>> 0)) | 0; // 848e03: mov eax, dword ptr [edx + 0xdc]
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.ecx + R.eax + 0x5) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 848e09: mov ax, word ptr [ecx + eax + 5]
        R.sub(((R.edi >>> 0) & 0xffff), ((R.eax >>> 0) & 0xffff), 16); // 848e0e: cmp di, ax
        if (R.cLE) { pc = 646; continue; } // 848e11: jle 0x848e15
        pc = 645; continue;
      case 645: // 848e13
        R.eax = ((R.edi >>> 0)) | 0; // 848e13: mov eax, edi
        pc = 646; continue;
      case 646: // 848e15
        R.ecx = (((((R.edi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 848e15: movsx ecx, di
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.ecx >>> 0)); // 848e18: mov dword ptr [esp + 0x24], ecx
        R.fpush(R.m.s32(((R.esp + 0x24) | 0) >>> 0)); // 848e1c: fild dword ptr [esp + 0x24]
        R.edx = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 848e20: movsx edx, ax
        R.st[0] = R.st[0] * 0.65; // 848e23: fmul qword ptr [0x96a5d0]
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.edx >>> 0)); // 848e29: mov dword ptr [esp + 0x24], edx
        R.fpush(R.m.s32(((R.esp + 0x24) | 0) >>> 0)); // 848e2d: fild dword ptr [esp + 0x24]
        R.st[0] = R.st[0] * 0.35; // 848e31: fmul qword ptr [0x969510]
        R.st[1] = R.st[1] + R.st[0]; R.fpop(); // 848e37: faddp st(1)
        R.ftol(); // 848e39: call 0x945640
        R.edx = (((R.m.u16(((R.esp + 0x6c) | 0) >>> 0)) << 16 >> 16)) | 0; // 848e3e: movsx edx, word ptr [esp + 0x6c]
        R.ecx = (((((R.ebx >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 848e43: movsx ecx, bx
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.ecx >>> 0)); // 848e46: mov dword ptr [esp + 0x24], ecx
        R.fpush(R.m.s32(((R.esp + 0x24) | 0) >>> 0)); // 848e4a: fild dword ptr [esp + 0x24]
        R.ecx = (((R.m.u16(((R.esp + 0x44) | 0) >>> 0)) << 16 >> 16)) | 0; // 848e4e: movsx ecx, word ptr [esp + 0x44]
        R.st[0] = R.st[0] * R.f32(((R.esp + 0x50) | 0)); // 848e53: fmul dword ptr [esp + 0x50]
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.edx >>> 0)); // 848e57: mov dword ptr [esp + 0x24], edx
        R.fpush(R.m.s32(((R.esp + 0x24) | 0) >>> 0)); // 848e5b: fild dword ptr [esp + 0x24]
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.ecx >>> 0)); // 848e5f: mov dword ptr [esp + 0x24], ecx
        R.edx = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 848e63: movsx edx, ax
        R.st[0] = R.st[0] * R.f32(((R.esp + 0x7c) | 0)); // 848e66: fmul dword ptr [esp + 0x7c]
        R.eax = (((((R.esi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 848e6a: movsx eax, si
        R.st[1] = R.st[1] + R.st[0]; R.fpop(); // 848e6d: faddp st(1)
        R.fpush(R.m.s32(((R.esp + 0x24) | 0) >>> 0)); // 848e6f: fild dword ptr [esp + 0x24]
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.edx >>> 0)); // 848e73: mov dword ptr [esp + 0x24], edx
        R.st[0] = R.st[0] * R.f32(((R.esp + 0x5c) | 0)); // 848e77: fmul dword ptr [esp + 0x5c]
        R.st[1] = R.st[1] + R.st[0]; R.fpop(); // 848e7b: faddp st(1)
        R.st[0] = R.st[0] + R.m.s32(((R.esp + 0x24) | 0) >>> 0); // 848e7d: fiadd dword ptr [esp + 0x24]
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.eax >>> 0)); // 848e81: mov dword ptr [esp + 0x24], eax
        R.st[0] = R.st[0] + R.m.s32(((R.esp + 0x24) | 0) >>> 0); // 848e85: fiadd dword ptr [esp + 0x24]
        R.st[0] = R.st[0] / R.f32(((R.esp + 0x58) | 0)); // 848e89: fdiv dword ptr [esp + 0x58]
        R.ftol(); // 848e8d: call 0x945640
        R.edi = ((R.eax >>> 0)) | 0; // 848e92: mov edi, eax
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ebp + 0x14) | 0) >>> 0)) & 0xff) << 0)) | 0; // 848e94: mov al, byte ptr [ebp + 0x14]
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 848e97: test al, al
        if (!R.zf) { pc = 649; continue; } // 848e99: jne 0x848ec5
        pc = 647; continue;
      default: return pc;
    }
  }
}
function f_846920_70(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 647: // 848e9b
        R.ecx = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 848e9b: mov ecx, dword ptr [ebp + 8]
        R.push(0x0); // 848e9e: push 0
        R.push((R.ecx >>> 0)); // 848ea0: push ecx
        R.call(0x5444a0, { n: 2, thisEcx: false, calleeClean: false }); // 848ea1: call 0x5444a0
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 848ea6: add esp, 8
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 848ea9: test eax, eax
        if (R.zf) { pc = 649; continue; } // 848eab: je 0x848ec5
        pc = 648; continue;
      case 648: // 848ead
        R.edx = (((((R.edi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 848ead: movsx edx, di
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.edx >>> 0)); // 848eb0: mov dword ptr [esp + 0x24], edx
        R.fpush(R.m.s32(((R.esp + 0x24) | 0) >>> 0)); // 848eb4: fild dword ptr [esp + 0x24]
        R.st[0] = R.st[0] * 0.9; // 848eb8: fmul qword ptr [0x9689d8]
        R.ftol(); // 848ebe: call 0x945640
        R.edi = ((R.eax >>> 0)) | 0; // 848ec3: mov edi, eax
        pc = 649; continue;
      case 649: // 848ec5
        R.ebx = (R.m.u32(((R.esp + 0x30) | 0) >>> 0)) | 0; // 848ec5: mov ebx, dword ptr [esp + 0x30]
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.ebx + 0x64) | 0) >>> 0)) & 0xff) << 0)) | 0; // 848ec9: mov cl, byte ptr [ebx + 0x64]
        R.sub(((R.ecx >>> 0) & 0xff), 0x1, 8); // 848ecc: cmp cl, 1
        if (R.zf) { pc = 660; continue; } // 848ecf: je 0x848f1d
        pc = 650; continue;
      case 650: // 848ed1
        R.eax = (R.m.u32(((R.esp + 0x3c) | 0) >>> 0)) | 0; // 848ed1: mov eax, dword ptr [esp + 0x3c]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 848ed5: test eax, eax
        if (R.zf) { pc = 654; continue; } // 848ed7: je 0x848eeb
        pc = 651; continue;
      case 651: // 848ed9
        R.logic(R.m.u8(((R.eax + 0x45) | 0) >>> 0) & 0x10, 8); // 848ed9: test byte ptr [eax + 0x45], 0x10
        if (R.zf) { pc = 654; continue; } // 848edd: je 0x848eeb
        pc = 652; continue;
      case 652: // 848edf
        R.esi = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 848edf: mov esi, dword ptr [ebp + 8]
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi + 0x22) | 0) >>> 0)) & 0xff) << 0)) | 0; // 848ee2: mov al, byte ptr [esi + 0x22]
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 848ee5: test al, al
        if (R.zf) { pc = 657; continue; } // 848ee7: je 0x848f02
        pc = 653; continue;
      case 653: // 848ee9
        pc = 655; continue; // 848ee9: jmp 0x848eee
      case 654: // 848eeb
        R.esi = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 848eeb: mov esi, dword ptr [ebp + 8]
        pc = 655; continue;
      case 655: // 848eee
        R.eax = (((((R.edi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 848eee: movsx eax, di
        R.edi = (((R.eax + -0x7d0) | 0)) | 0; // 848ef1: lea edi, [eax - 0x7d0]
        R.edx = R.eax < 0 ? -1 : 0; // 848ef7: cdq 
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 848ef8: sub eax, edx
        R.eax = (R.sar((R.eax >>> 0), 0x1, 32)) | 0; // 848efa: sar eax, 1
        R.sub((R.eax >>> 0), (R.edi >>> 0), 32); // 848efc: cmp eax, edi
        if (!R.cL) { pc = 657; continue; } // 848efe: jge 0x848f02
        pc = 656; continue;
      case 656: // 848f00
        R.edi = ((R.eax >>> 0)) | 0; // 848f00: mov edi, eax
        pc = 657; continue;
      case 657: // 848f02
        R.sub(((R.ecx >>> 0) & 0xff), 0x3, 8); // 848f02: cmp cl, 3
        if (!R.zf) { pc = 661; continue; } // 848f05: jne 0x848f20
        pc = 658; continue;
      default: return pc;
    }
  }
}
function f_846920_71(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 658: // 848f07
        R.eax = (((((R.edi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 848f07: movsx eax, di
        R.edi = (((R.eax + -0x7d0) | 0)) | 0; // 848f0a: lea edi, [eax - 0x7d0]
        R.edx = R.eax < 0 ? -1 : 0; // 848f10: cdq 
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 848f11: sub eax, edx
        R.eax = (R.sar((R.eax >>> 0), 0x1, 32)) | 0; // 848f13: sar eax, 1
        R.sub((R.eax >>> 0), (R.edi >>> 0), 32); // 848f15: cmp eax, edi
        if (!R.cL) { pc = 661; continue; } // 848f17: jge 0x848f20
        pc = 659; continue;
      case 659: // 848f19
        R.edi = ((R.eax >>> 0)) | 0; // 848f19: mov edi, eax
        pc = 661; continue; // 848f1b: jmp 0x848f20
      case 660: // 848f1d
        R.esi = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 848f1d: mov esi, dword ptr [ebp + 8]
        pc = 661; continue;
      case 661: // 848f20
        R.ecx = (R.m.u32(((0xae1050) | 0) >>> 0)) | 0; // 848f20: mov ecx, dword ptr [0xae1050]
        R.push((R.ebx >>> 0)); // 848f26: push ebx
        R.push((R.esi >>> 0)); // 848f27: push esi
        R.call(0x4cbb60, { n: 2, thisEcx: true, calleeClean: true }); // 848f28: call 0x4cbb60
        R.sub(((R.eax >>> 0) & 0xff), 0x3, 8); // 848f2d: cmp al, 3
        if (!R.zf) { pc = 663; continue; } // 848f2f: jne 0x848f49
        pc = 662; continue;
      case 662: // 848f31
        R.eax = (((((R.edi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 848f31: movsx eax, di
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.eax >>> 0)); // 848f34: mov dword ptr [esp + 0x24], eax
        R.fpush(R.m.s32(((R.esp + 0x24) | 0) >>> 0)); // 848f38: fild dword ptr [esp + 0x24]
        R.st[0] = R.st[0] * 0.7; // 848f3c: fmul qword ptr [0x968e40]
        R.ftol(); // 848f42: call 0x945640
        R.edi = ((R.eax >>> 0)) | 0; // 848f47: mov edi, eax
        pc = 663; continue;
      case 663: // 848f49
        R.ecx = (((((R.edi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 848f49: movsx ecx, di
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.ecx >>> 0)); // 848f4c: mov dword ptr [esp + 0x24], ecx
        R.fpush(R.m.s32(((R.esp + 0x24) | 0) >>> 0)); // 848f50: fild dword ptr [esp + 0x24]
        R.st[0] = R.st[0] * 1.5; // 848f54: fmul qword ptr [0x968940]
        R.st[0] = R.st[0] - 5000.0; // 848f5a: fsub qword ptr [0x9688e8]
        R.ftol(); // 848f60: call 0x945640
        R.edx = (R.m.u32(((R.esp + 0x30) | 0) >>> 0)) | 0; // 848f65: mov edx, dword ptr [esp + 0x30]
        R.ebx = ((R.eax >>> 0)) | 0; // 848f69: mov ebx, eax
        R.eax = (R.m.u32(((R.edx + 0x53) | 0) >>> 0)) | 0; // 848f6b: mov eax, dword ptr [edx + 0x53]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 848f6e: test eax, eax
        if (R.zf) { pc = 572; continue; } // 848f70: je 0x848943
        pc = 664; continue;
      case 664: // 848f76
        R.edi = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 848f76: mov edi, dword ptr [ebp + 0xc]
        R.ecx = ((R.edx >>> 0)) | 0; // 848f79: mov ecx, edx
        R.sub((R.edi >>> 0), (R.ecx >>> 0), 32); // 848f7b: cmp edi, ecx
        if (R.zf) { pc = 818; continue; } // 848f7d: je 0x8497c2
        pc = 665; continue;
      default: return pc;
    }
  }
}
function f_846920_72(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 665: // 848f83
        R.ecx = (((((R.ebx >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 848f83: movsx ecx, bx
        R.ecx = (R.add((R.ecx >>> 0), 0x1388, 32)) | 0; // 848f86: add ecx, 0x1388
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.eax + 0x77) | 0) >>> 0)) & 0xff) << 0)) | 0; // 848f8c: mov dl, byte ptr [eax + 0x77]
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.ecx >>> 0)); // 848f8f: mov dword ptr [esp + 0x24], ecx
        R.eax = (R.m.u32(((R.esp + 0x30) | 0) >>> 0)) | 0; // 848f93: mov eax, dword ptr [esp + 0x30]
        R.fpush(R.m.s32(((R.esp + 0x24) | 0) >>> 0)); // 848f97: fild dword ptr [esp + 0x24]
        R.ecx = (R.m.u32(((0xb74350) | 0) >>> 0)) | 0; // 848f9b: mov ecx, dword ptr [0xb74350]
        R.push(0x1); // 848fa1: push 1
        R.push((R.edx >>> 0)); // 848fa3: push edx
        R.push((R.eax >>> 0)); // 848fa4: push eax
        R.fpush(R.st[0]); // 848fa5: fld st(0)
        R.st[0] = R.st[0] * 6.666666666666667e-05; // 848fa7: fmul qword ptr [0x968d78]
        R.push((R.esi >>> 0)); // 848fad: push esi
        R.st[0] = R.st[0] * R.st[1]; // 848fae: fmul st(1)
        R.m.wf64(((R.esp + 0x6c) | 0) >>> 0, R.st[0]); R.fpop(); // 848fb0: fstp qword ptr [esp + 0x6c]
        R.fpop(); // 848fb4: fstp st(0)
        R.call(0x7c6830, { n: 4, thisEcx: true, calleeClean: true }); // 848fb6: call 0x7c6830
        R.ecx = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 848fbb: movsx ecx, al
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.ecx >>> 0)); // 848fbe: mov dword ptr [esp + 0x24], ecx
        R.fpush(R.m.s32(((R.esp + 0x24) | 0) >>> 0)); // 848fc2: fild dword ptr [esp + 0x24]
        R.m.wf64(((R.esp + 0x24) | 0) >>> 0, R.st[0]); // 848fc6: fst qword ptr [esp + 0x24]
        R.st[0] = R.st[0] * 0.1; // 848fca: fmul qword ptr [0x967880]
        R.fpush(R.f64(((R.esp + 0x24) | 0))); // 848fd0: fld qword ptr [esp + 0x24]
        R.st[0] = R.st[0] * 200.0; // 848fd4: fmul qword ptr [0x96a648]
        R.st[0] = 12000.0 - R.st[0]; // 848fda: fsubr qword ptr [0x96f938]
        R.st[0] = R.f64(((R.esp + 0x5c) | 0)) / R.st[0]; // 848fe0: fdivr qword ptr [esp + 0x5c]
        R.m.wf64(((R.esp + 0x24) | 0) >>> 0, R.st[0]); R.fpop(); // 848fe4: fstp qword ptr [esp + 0x24]
        R.fcom(R.st[0], R.f64(((R.esp + 0x24) | 0))); // 848fe8: fcom qword ptr [esp + 0x24]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 848fec: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 848fee: test ah, 0x41
        if (R.zf) { pc = 667; continue; } // 848ff1: je 0x848ff9
        pc = 666; continue;
      case 666: // 848ff3
        R.fpop(); // 848ff3: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x24) | 0))); // 848ff5: fld qword ptr [esp + 0x24]
        pc = 667; continue;
      case 667: // 848ff9
        R.st[0] = R.st[0] + 0.2; // 848ff9: fadd qword ptr [0x968918]
        R.st[0] = R.f64(((R.esp + 0xc) | 0)) / R.st[0]; // 848fff: fdivr qword ptr [esp + 0xc]
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 849003: fstp qword ptr [esp + 0xc]
        pc = 573; continue; // 849007: jmp 0x848946
      case 668: // 84900c
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 84900c: fld qword ptr [esp + 0xc]
        pc = 669; continue;
      case 669: // 849010
        R.st[0] = R.st[0] * 0.1; // 849010: fmul qword ptr [0x967880]
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 849016: fstp qword ptr [esp + 0xc]
        pc = 670; continue;
      default: return pc;
    }
  }
}
function f_846920_73(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 670: // 84901a
        R.eax = (R.m.u32(((R.esi + 0x61) | 0) >>> 0)) | 0; // 84901a: mov eax, dword ptr [esi + 0x61]
        R.ecx = (((R.m.u16(((R.eax + 0xd) | 0) >>> 0)) << 16 >> 16)) | 0; // 84901d: movsx ecx, word ptr [eax + 0xd]
        R.edx = (((R.m.u16(((R.eax + 0xb) | 0) >>> 0)) << 16 >> 16)) | 0; // 849021: movsx edx, word ptr [eax + 0xb]
        R.eax = (((R.m.u16(((R.eax + 0x9) | 0) >>> 0)) << 16 >> 16)) | 0; // 849025: movsx eax, word ptr [eax + 9]
        R.ecx = (R.add((R.ecx >>> 0), (R.edx >>> 0), 32)) | 0; // 849029: add ecx, edx
        R.ecx = (R.add((R.ecx >>> 0), (R.eax >>> 0), 32)) | 0; // 84902b: add ecx, eax
        R.eax = (0x55555556) | 0; // 84902d: mov eax, 0x55555556
        { const p = BigInt(R.eax | 0) * BigInt((((R.ecx >>> 0)) | 0)); R.eax = Number(BigInt.asIntN(32, p)); R.edx = Number(BigInt.asIntN(32, p >> 32n)); R.cf = R.of = BigInt.asIntN(32, p) !== p; } // 849032: imul ecx
        R.eax = (((R.m.u16(((R.edi + 0x80) | 0) >>> 0)) << 16 >> 16)) | 0; // 849034: movsx eax, word ptr [edi + 0x80]
        R.ecx = ((R.edx >>> 0)) | 0; // 84903b: mov ecx, edx
        R.ecx = (R.shr((R.ecx >>> 0), 0x1f, 32)) | 0; // 84903d: shr ecx, 0x1f
        R.edx = (R.add((R.edx >>> 0), (R.ecx >>> 0), 32)) | 0; // 849040: add edx, ecx
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 849042: sub eax, edx
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.eax >>> 0)); // 849044: mov dword ptr [esp + 0x24], eax
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ebp + 0x14) | 0) >>> 0)) & 0xff) << 0)) | 0; // 849048: mov al, byte ptr [ebp + 0x14]
        R.fpush(R.m.s32(((R.esp + 0x24) | 0) >>> 0)); // 84904b: fild dword ptr [esp + 0x24]
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 84904f: test al, al
        R.st[0] = R.st[0] * 0.000125; // 849051: fmul qword ptr [0x96a6b8]
        R.st[0] = R.st[0] + 1.0; // 849057: fadd qword ptr [0x967890]
        R.m.wf64(((R.esp + 0x5c) | 0) >>> 0, R.st[0]); R.fpop(); // 84905d: fstp qword ptr [esp + 0x5c]
        if (R.zf) { pc = 689; continue; } // 849061: je 0x849147
        pc = 671; continue;
      case 671: // 849067
        R.eax = (R.m.u32(((R.esp + 0x3c) | 0) >>> 0)) | 0; // 849067: mov eax, dword ptr [esp + 0x3c]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84906b: test eax, eax
        if (R.zf) { pc = 673; continue; } // 84906d: je 0x849075
        pc = 672; continue;
      case 672: // 84906f
        R.logic(R.m.u8(((R.eax + 0x45) | 0) >>> 0) & 0x10, 8); // 84906f: test byte ptr [eax + 0x45], 0x10
        if (!R.zf) { pc = 674; continue; } // 849073: jne 0x849088
        pc = 673; continue;
      case 673: // 849075
        R.push(0x0); // 849075: push 0
        R.push((R.esi >>> 0)); // 849077: push esi
        R.call(0x544590, { n: 2, thisEcx: false, calleeClean: false }); // 849078: call 0x544590
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 84907d: add esp, 8
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 849080: test eax, eax
        if (R.zf) { pc = 689; continue; } // 849082: je 0x849147
        pc = 674; continue;
      case 674: // 849088
        R.ecx = (R.m.u32(((R.esi + 0x61) | 0) >>> 0)) | 0; // 849088: mov ecx, dword ptr [esi + 0x61]
        R.eax = (((R.m.u16(((R.ecx + 0x5) | 0) >>> 0)) << 16 >> 16)) | 0; // 84908b: movsx eax, word ptr [ecx + 5]
        R.edx = (((R.eax + R.eax * 2) | 0)) | 0; // 84908f: lea edx, [eax + eax*2]
        R.eax = (((R.eax + R.edx * 8) | 0)) | 0; // 849092: lea eax, [eax + edx*8]
        R.edx = (R.m.u32(((R.esp + 0x30) | 0) >>> 0)) | 0; // 849095: mov edx, dword ptr [esp + 0x30]
        R.eax = (R.shl((R.eax >>> 0), 0x1, 32)) | 0; // 849099: shl eax, 1
        R.edx = (((R.m.u16(((R.edx + 0x80) | 0) >>> 0)) << 16 >> 16)) | 0; // 84909b: movsx edx, word ptr [edx + 0x80]
        R.sub((R.eax >>> 0), (R.edx >>> 0), 32); // 8490a2: cmp eax, edx
        if (!R.cL) { pc = 689; continue; } // 8490a4: jge 0x849147
        pc = 675; continue;
      case 675: // 8490aa
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esi + 0x22) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8490aa: mov al, byte ptr [esi + 0x22]
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 8490ad: test al, al
        if (!R.zf) { pc = 689; continue; } // 8490af: jne 0x849147
        pc = 676; continue;
      default: return pc;
    }
  }
}
function f_846920_74(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 676: // 8490b5
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esp + 0x1b) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8490b5: mov al, byte ptr [esp + 0x1b]
        R.sub(((R.eax >>> 0) & 0xff), 0x18, 8); // 8490b9: cmp al, 0x18
        if (R.cL) { pc = 678; continue; } // 8490bb: jl 0x8490c5
        pc = 677; continue;
      case 677: // 8490bd
        R.sub(((R.eax >>> 0) & 0xff), 0x20, 8); // 8490bd: cmp al, 0x20
        if (R.cLE) { pc = 689; continue; } // 8490bf: jle 0x849147
        pc = 678; continue;
      case 678: // 8490c5
        R.sub(R.m.u16(((R.edi + 0x80) | 0) >>> 0), 0xdac, 16); // 8490c5: cmp word ptr [edi + 0x80], 0xdac
        if (R.cLE) { pc = 689; continue; } // 8490ce: jle 0x849147
        pc = 679; continue;
      case 679: // 8490d0
        R.sub(R.m.u16(((R.ecx + 0xb) | 0) >>> 0), 0x157c, 16); // 8490d0: cmp word ptr [ecx + 0xb], 0x157c
        if (!R.cL) { pc = 689; continue; } // 8490d6: jge 0x849147
        pc = 680; continue;
      case 680: // 8490d8
        R.edx = (R.m.u32(((R.edi + 0x53) | 0) >>> 0)) | 0; // 8490d8: mov edx, dword ptr [edi + 0x53]
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 8490db: test edx, edx
        if (R.zf) { pc = 689; continue; } // 8490dd: je 0x849147
        pc = 681; continue;
      case 681: // 8490df
        R.eax = (R.m.u32(((R.edi + 0x57) | 0) >>> 0)) | 0; // 8490df: mov eax, dword ptr [edi + 0x57]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8490e2: test eax, eax
        if (R.zf) { pc = 689; continue; } // 8490e4: je 0x849147
        pc = 682; continue;
      case 682: // 8490e6
        R.ecx = (R.m.u32(((R.esp + 0x30) | 0) >>> 0)) | 0; // 8490e6: mov ecx, dword ptr [esp + 0x30]
        R.ecx = (R.m.u32(((R.ecx + 0x57) | 0) >>> 0)) | 0; // 8490ea: mov ecx, dword ptr [ecx + 0x57]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 8490ed: test ecx, ecx
        if (R.zf) { pc = 689; continue; } // 8490ef: je 0x849147
        pc = 683; continue;
      case 683: // 8490f1
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.eax + 0x69) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 8490f1: mov ax, word ptr [eax + 0x69]
        R.sub(((R.eax >>> 0) & 0xffff), 0x6, 16); // 8490f5: cmp ax, 6
        if (!R.cLE) { pc = 685; continue; } // 8490f9: jg 0x849109
        pc = 684; continue;
      case 684: // 8490fb
        R.ecx = (((R.m.u16(((R.ecx + 0x69) | 0) >>> 0)) << 16 >> 16)) | 0; // 8490fb: movsx ecx, word ptr [ecx + 0x69]
        R.eax = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 8490ff: movsx eax, ax
        R.ecx = (R.sub((R.ecx >>> 0), 0x3, 32)) | 0; // 849102: sub ecx, 3
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 849105: cmp eax, ecx
        if (R.cLE) { pc = 689; continue; } // 849107: jle 0x849147
        pc = 685; continue;
      case 685: // 849109
        R.ecx = (R.m.u32(((R.esp + 0x30) | 0) >>> 0)) | 0; // 849109: mov ecx, dword ptr [esp + 0x30]
        R.ecx = (R.m.u32(((R.ecx + 0x53) | 0) >>> 0)) | 0; // 84910d: mov ecx, dword ptr [ecx + 0x53]
        R.logic((R.ecx >>> 0) & (R.ecx >>> 0), 32); // 849110: test ecx, ecx
        if (R.zf) { pc = 689; continue; } // 849112: je 0x849147
        pc = 686; continue;
      case 686: // 849114
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.edx + 0x85) | 0) >>> 0)) & 0xff) << 0)) | 0; // 849114: mov al, byte ptr [edx + 0x85]
        R.sub(((R.eax >>> 0) & 0xff), 0xa, 8); // 84911a: cmp al, 0xa
        if (!R.cL) { pc = 688; continue; } // 84911c: jge 0x849126
        pc = 687; continue;
      case 687: // 84911e
        R.sub(((R.eax >>> 0) & 0xff), R.m.u8(((R.ecx + 0x85) | 0) >>> 0), 8); // 84911e: cmp al, byte ptr [ecx + 0x85]
        if (R.cL) { pc = 689; continue; } // 849124: jl 0x849147
        pc = 688; continue;
      default: return pc;
    }
  }
}
function f_846920_75(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 688: // 849126
        R.esi = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 849126: mov esi, dword ptr [esp + 0x1c]
        R.ecx = (((((R.esi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 84912a: movsx ecx, si
        R.edx = (((((R.ebx >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 84912d: movsx edx, bx
        R.eax = ((R.ecx >>> 0)) | 0; // 849130: mov eax, ecx
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 849132: sub eax, edx
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.eax >>> 0)); // 849134: mov dword ptr [esp + 0x24], eax
        R.fpush(R.m.s32(((R.esp + 0x24) | 0) >>> 0)); // 849138: fild dword ptr [esp + 0x24]
        R.st[0] = R.st[0] * 0.5; // 84913c: fmul qword ptr [0x968968]
        pc = 722; continue; // 849142: jmp 0x849346
      case 689: // 849147
        R.eax = (R.m.u32(((R.esp + 0x3c) | 0) >>> 0)) | 0; // 849147: mov eax, dword ptr [esp + 0x3c]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84914b: test eax, eax
        if (R.zf) { pc = 694; continue; } // 84914d: je 0x849186
        pc = 690; continue;
      case 690: // 84914f
        R.logic(R.m.u8(((R.eax + 0x45) | 0) >>> 0) & 0x10, 8); // 84914f: test byte ptr [eax + 0x45], 0x10
        if (R.zf) { pc = 694; continue; } // 849153: je 0x849186
        pc = 691; continue;
      case 691: // 849155
        R.esi = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 849155: mov esi, dword ptr [esp + 0x1c]
        R.sub(((R.esi >>> 0) & 0xffff), ((R.ebx >>> 0) & 0xffff), 16); // 849159: cmp si, bx
        if (!R.cL) { pc = 696; continue; } // 84915c: jge 0x84918d
        pc = 692; continue;
      case 692: // 84915e
        R.edx = (((((R.ebx >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 84915e: movsx edx, bx
        R.ecx = (((((R.esi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 849161: movsx ecx, si
        R.eax = ((R.edx >>> 0)) | 0; // 849164: mov eax, edx
        R.eax = (R.sub((R.eax >>> 0), (R.ecx >>> 0), 32)) | 0; // 849166: sub eax, ecx
        R.sub((R.eax >>> 0), 0x1388, 32); // 849168: cmp eax, 0x1388
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.eax >>> 0)); // 84916d: mov dword ptr [esp + 0x24], eax
        if (!R.cL) { pc = 695; continue; } // 849171: jge 0x84918a
        pc = 693; continue;
      case 693: // 849173
        R.fpush(R.m.s32(((R.esp + 0x24) | 0) >>> 0)); // 849173: fild dword ptr [esp + 0x24]
        R.fpush(R.st[0]); // 849177: fld st(0)
        R.st[0] = R.st[0] * -0.0002; // 849179: fmul qword ptr [0x96f970]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 84917f: fmulp st(1)
        pc = 722; continue; // 849181: jmp 0x849346
      case 694: // 849186
        R.esi = (R.m.u32(((R.esp + 0x1c) | 0) >>> 0)) | 0; // 849186: mov esi, dword ptr [esp + 0x1c]
        pc = 695; continue;
      case 695: // 84918a
        R.sub(((R.esi >>> 0) & 0xffff), ((R.ebx >>> 0) & 0xffff), 16); // 84918a: cmp si, bx
        pc = 696; continue;
      case 696: // 84918d
        if (R.cLE) { pc = 701; continue; } // 84918d: jle 0x8491ee
        pc = 697; continue;
      case 697: // 84918f
        R.eax = (R.m.u32(((R.esp + 0x3c) | 0) >>> 0)) | 0; // 84918f: mov eax, dword ptr [esp + 0x3c]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 849193: test eax, eax
        if (R.zf) { pc = 700; continue; } // 849195: je 0x8491ba
        pc = 698; continue;
      case 698: // 849197
        R.logic(R.m.u8(((R.eax + 0x45) | 0) >>> 0) & 0x1, 8); // 849197: test byte ptr [eax + 0x45], 1
        if (R.zf) { pc = 700; continue; } // 84919b: je 0x8491ba
        pc = 699; continue;
      default: return pc;
    }
  }
}
function f_846920_76(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 699: // 84919d
        R.ecx = (((((R.esi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 84919d: movsx ecx, si
        R.edx = (((((R.ebx >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 8491a0: movsx edx, bx
        R.eax = ((R.ecx >>> 0)) | 0; // 8491a3: mov eax, ecx
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 8491a5: sub eax, edx
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.eax >>> 0)); // 8491a7: mov dword ptr [esp + 0x24], eax
        R.fpush(R.m.s32(((R.esp + 0x24) | 0) >>> 0)); // 8491ab: fild dword ptr [esp + 0x24]
        R.st[0] = R.st[0] * 2.5; // 8491af: fmul qword ptr [0x968e18]
        pc = 722; continue; // 8491b5: jmp 0x849346
      case 700: // 8491ba
        R.eax = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 8491ba: mov eax, dword ptr [ebp + 8]
        R.ecx = (((((R.esi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 8491bd: movsx ecx, si
        R.eax = (((R.m.u8(((R.eax + 0x57) | 0) >>> 0)) << 24 >> 24)) | 0; // 8491c0: movsx eax, byte ptr [eax + 0x57]
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.eax >>> 0)); // 8491c4: mov dword ptr [esp + 0x24], eax
        R.eax = ((R.ecx >>> 0)) | 0; // 8491c8: mov eax, ecx
        R.fpush(R.m.s32(((R.esp + 0x24) | 0) >>> 0)); // 8491ca: fild dword ptr [esp + 0x24]
        R.edx = (((((R.ebx >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 8491ce: movsx edx, bx
        R.st[0] = R.st[0] * 0.08771929824561403; // 8491d1: fmul qword ptr [0x96f930]
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 8491d7: sub eax, edx
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.eax >>> 0)); // 8491d9: mov dword ptr [esp + 0x24], eax
        R.st[0] = R.st[0] + 0.75; // 8491dd: fadd qword ptr [0x969040]
        R.fpush(R.m.s32(((R.esp + 0x24) | 0) >>> 0)); // 8491e3: fild dword ptr [esp + 0x24]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 8491e7: fmulp st(1)
        pc = 722; continue; // 8491e9: jmp 0x849346
      case 701: // 8491ee
        R.sub(R.m.u8(((R.ebp + 0x18) | 0) >>> 0), 0x3, 8); // 8491ee: cmp byte ptr [ebp + 0x18], 3
        if (R.cLE) { pc = 703; continue; } // 8491f2: jle 0x849211
        pc = 702; continue;
      case 702: // 8491f4
        R.ecx = (((((R.esi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 8491f4: movsx ecx, si
        R.edx = (((((R.ebx >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 8491f7: movsx edx, bx
        R.eax = ((R.ecx >>> 0)) | 0; // 8491fa: mov eax, ecx
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 8491fc: sub eax, edx
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.eax >>> 0)); // 8491fe: mov dword ptr [esp + 0x24], eax
        R.fpush(R.m.s32(((R.esp + 0x24) | 0) >>> 0)); // 849202: fild dword ptr [esp + 0x24]
        R.st[0] = R.st[0] * 1.5; // 849206: fmul qword ptr [0x968940]
        pc = 722; continue; // 84920c: jmp 0x849346
      case 703: // 849211
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 849211: fld qword ptr [esp + 0xc]
        R.fcom(R.st[0], 10.0); R.fpop(); // 849215: fcomp qword ptr [0x9688b0]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 84921b: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 84921d: test ah, 0x41
        if (!R.zf) { pc = 721; continue; } // 849220: jne 0x849334
        pc = 704; continue;
      case 704: // 849226
        R.sub(((R.ebx >>> 0) & 0xffff), 0x1b58, 16); // 849226: cmp bx, 0x1b58
        if (R.cLE) { pc = 715; continue; } // 84922b: jle 0x8492e0
        pc = 705; continue;
      case 705: // 849231
        R.sub(((R.esi >>> 0) & 0xffff), 0x7d0, 16); // 849231: cmp si, 0x7d0
        if (!R.cL) { pc = 715; continue; } // 849236: jge 0x8492e0
        pc = 706; continue;
      case 706: // 84923c
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ebp + 0x14) | 0) >>> 0)) & 0xff) << 0)) | 0; // 84923c: mov al, byte ptr [ebp + 0x14]
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 84923f: test al, al
        if (R.zf) { pc = 715; continue; } // 849241: je 0x8492e0
        pc = 707; continue;
      default: return pc;
    }
  }
}
function f_846920_77(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 707: // 849247
        R.ecx = (((((R.ebx >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 849247: movsx ecx, bx
        R.edx = (((((R.esi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 84924a: movsx edx, si
        R.ecx = (R.sub((R.ecx >>> 0), (R.edx >>> 0), 32)) | 0; // 84924d: sub ecx, edx
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.ecx >>> 0)); // 84924f: mov dword ptr [esp + 0x24], ecx
        R.fpush(R.m.s32(((R.esp + 0x24) | 0) >>> 0)); // 849253: fild dword ptr [esp + 0x24]
        R.st[0] = R.st[0] * 0.00019999999494757503; // 849257: fmul dword ptr [0x96f968]
        R.st[0] = 2.0 - R.st[0]; // 84925d: fsubr dword ptr [0x9689a8]
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 849263: fld qword ptr [esp + 0xc]
        R.fcom(R.st[0], 50.0); R.fpop(); // 849267: fcomp qword ptr [0x968ff8]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 84926d: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 84926f: test ah, 1
        if (R.zf) { pc = 709; continue; } // 849272: je 0x84927a
        pc = 708; continue;
      case 708: // 849274
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 849274: fld qword ptr [esp + 0xc]
        pc = 710; continue; // 849278: jmp 0x849280
      case 709: // 84927a
        R.fpush(50.0); // 84927a: fld qword ptr [0x968ff8]
        pc = 710; continue;
      case 710: // 849280
        R.fpush(R.st[1]); // 849280: fld st(1)
        R.st[0] = R.st[0] * R.st[1]; // 849282: fmul st(1)
        R.fpush(10.0); // 849284: fld qword ptr [0x9688b0]
        R.fcom(R.st[0], R.st[1]); R.fpop(); R.fpop(); // 84928a: fcompp 
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 84928c: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 84928e: test ah, 0x41
        R.fpop(); // 849291: fstp st(0)
        if (!R.zf) { pc = 712; continue; } // 849293: jne 0x8492a5
        pc = 711; continue;
      case 711: // 849295
        R.fpop(); // 849295: fstp st(0)
        R.fpush(10.0); // 849297: fld qword ptr [0x9688b0]
        R.st[0] = R.st[0] * 0.01; // 84929d: fmul qword ptr [0x967898]
        pc = 716; continue; // 8492a3: jmp 0x8492ea
      case 712: // 8492a5
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 8492a5: fld qword ptr [esp + 0xc]
        R.fcom(R.st[0], 50.0); R.fpop(); // 8492a9: fcomp qword ptr [0x968ff8]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8492af: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 8492b1: test ah, 1
        if (R.zf) { pc = 714; continue; } // 8492b4: je 0x8492ca
        pc = 713; continue;
      case 713: // 8492b6
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 8492b6: fld qword ptr [esp + 0xc]
        { const t = R.st[0]; R.st[0] = R.st[1]; R.st[1] = t; } // 8492ba: fxch st(1)
        R.st[0] = R.st[0] * R.st[1]; // 8492bc: fmul st(1)
        { const t = R.st[0]; R.st[0] = R.st[1]; R.st[1] = t; } // 8492be: fxch st(1)
        R.fpop(); // 8492c0: fstp st(0)
        R.st[0] = R.st[0] * 0.01; // 8492c2: fmul qword ptr [0x967898]
        pc = 716; continue; // 8492c8: jmp 0x8492ea
      case 714: // 8492ca
        R.fpush(50.0); // 8492ca: fld qword ptr [0x968ff8]
        { const t = R.st[0]; R.st[0] = R.st[1]; R.st[1] = t; } // 8492d0: fxch st(1)
        R.st[0] = R.st[0] * R.st[1]; // 8492d2: fmul st(1)
        { const t = R.st[0]; R.st[0] = R.st[1]; R.st[1] = t; } // 8492d4: fxch st(1)
        R.fpop(); // 8492d6: fstp st(0)
        R.st[0] = R.st[0] * 0.01; // 8492d8: fmul qword ptr [0x967898]
        pc = 716; continue; // 8492de: jmp 0x8492ea
      default: return pc;
    }
  }
}
function f_846920_78(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 715: // 8492e0
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 8492e0: fld qword ptr [esp + 0xc]
        R.st[0] = R.st[0] * 0.01; // 8492e4: fmul qword ptr [0x967898]
        pc = 716; continue;
      case 716: // 8492ea
        R.st[0] = 1.1 - R.st[0]; // 8492ea: fsubr qword ptr [0x9689c0]
        R.fpush(R.st[0]); // 8492f0: fld st(0)
        R.fcom(R.st[0], 0.1); R.fpop(); // 8492f2: fcomp qword ptr [0x967880]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8492f8: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 8492fa: test ah, 1
        if (R.zf) { pc = 718; continue; } // 8492fd: je 0x849309
        pc = 717; continue;
      case 717: // 8492ff
        R.fpop(); // 8492ff: fstp st(0)
        R.fpush(0.1); // 849301: fld qword ptr [0x967880]
        pc = 720; continue; // 849307: jmp 0x849320
      case 718: // 849309
        R.fpush(R.st[0]); // 849309: fld st(0)
        R.fcom(R.st[0], 1.0); R.fpop(); // 84930b: fcomp qword ptr [0x967890]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 849311: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 849313: test ah, 0x41
        if (!R.zf) { pc = 720; continue; } // 849316: jne 0x849320
        pc = 719; continue;
      case 719: // 849318
        R.fpop(); // 849318: fstp st(0)
        R.fpush(1.0); // 84931a: fld qword ptr [0x967890]
        pc = 720; continue;
      case 720: // 849320
        R.ecx = (((((R.esi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 849320: movsx ecx, si
        R.edx = (((((R.ebx >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 849323: movsx edx, bx
        R.eax = ((R.ecx >>> 0)) | 0; // 849326: mov eax, ecx
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 849328: sub eax, edx
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.eax >>> 0)); // 84932a: mov dword ptr [esp + 0x24], eax
        R.st[0] = R.st[0] * R.m.s32(((R.esp + 0x24) | 0) >>> 0); // 84932e: fimul dword ptr [esp + 0x24]
        pc = 722; continue; // 849332: jmp 0x849346
      case 721: // 849334
        R.ecx = (((((R.esi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 849334: movsx ecx, si
        R.edx = (((((R.ebx >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 849337: movsx edx, bx
        R.eax = ((R.ecx >>> 0)) | 0; // 84933a: mov eax, ecx
        R.eax = (R.sub((R.eax >>> 0), (R.edx >>> 0), 32)) | 0; // 84933c: sub eax, edx
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.eax >>> 0)); // 84933e: mov dword ptr [esp + 0x24], eax
        R.fpush(R.m.s32(((R.esp + 0x24) | 0) >>> 0)); // 849342: fild dword ptr [esp + 0x24]
        pc = 722; continue;
      case 722: // 849346
        R.fcom(R.st[0], 0.0); // 849346: fcom qword ptr [0x9689a0]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 84934c: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 84934e: test ah, 0x41
        if (!R.zf) { pc = 730; continue; } // 849351: jne 0x8493c7
        pc = 723; continue;
      case 723: // 849353
        R.fpush(R.f64(((R.esp + 0x84) | 0))); // 849353: fld qword ptr [esp + 0x84]
        R.fcom(R.st[0], 1.0); R.fpop(); // 84935a: fcomp qword ptr [0x967890]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 849360: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 849362: test ah, 1
        if (R.zf) { pc = 730; continue; } // 849365: je 0x8493c7
        pc = 724; continue;
      default: return pc;
    }
  }
}
function f_846920_79(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 724: // 849367
        R.fpush(R.st[0]); // 849367: fld st(0)
        R.st[0] = R.st[0] * 0.02; // 849369: fmul qword ptr [0x968a98]
        R.fpush(100.0); // 84936f: fld qword ptr [0x9688a8]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 849375: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 849377: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 849379: test ah, 1
        if (R.zf) { pc = 726; continue; } // 84937c: je 0x849386
        pc = 725; continue;
      case 725: // 84937e
        R.fpop(); // 84937e: fstp st(0)
        R.fpush(100.0); // 849380: fld qword ptr [0x9688a8]
        pc = 726; continue;
      case 726: // 849386
        R.fpush(100.0); // 849386: fld qword ptr [0x9688a8]
        R.st[0] = R.st[0] - R.st[1]; // 84938c: fsub st(1)
        R.edi = (R.m.u32(((R.ebp + 0x1c) | 0) >>> 0)) | 0; // 84938e: mov edi, dword ptr [ebp + 0x1c]
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 849391: test edi, edi
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x84) | 0)); // 849393: fmul qword ptr [esp + 0x84]
        R.st[1] = R.st[1] + R.st[0]; R.fpop(); // 84939a: faddp st(1)
        R.st[0] = R.st[0] * 0.01; // 84939c: fmul qword ptr [0x967898]
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 8493a2: fld qword ptr [esp + 0xc]
        R.st[0] = R.st[0] * R.st[1]; // 8493a6: fmul st(1)
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 8493a8: fstp qword ptr [esp + 0xc]
        if (R.zf) { pc = 729; continue; } // 8493ac: je 0x8493c3
        pc = 727; continue;
      case 727: // 8493ae
        R.fcom(R.st[0], 0.6); R.fpop(); // 8493ae: fcomp qword ptr [0x968e48]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8493b4: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 8493b6: test ah, 1
        if (R.zf) { pc = 731; continue; } // 8493b9: je 0x8493ca
        pc = 728; continue;
      case 728: // 8493bb
        R.m.w32(((R.edi) | 0) >>> 0, R.logic(R.m.u32(((R.edi) | 0) >>> 0) | 0x100000, 32)); // 8493bb: or dword ptr [edi], 0x100000
        pc = 731; continue; // 8493c1: jmp 0x8493ca
      case 729: // 8493c3
        R.fpop(); // 8493c3: fstp st(0)
        pc = 731; continue; // 8493c5: jmp 0x8493ca
      case 730: // 8493c7
        R.edi = (R.m.u32(((R.ebp + 0x1c) | 0) >>> 0)) | 0; // 8493c7: mov edi, dword ptr [ebp + 0x1c]
        pc = 731; continue;
      case 731: // 8493ca
        R.st[0] = R.st[0] * 0.00016129032258064516; // 8493ca: fmul qword ptr [0x96f960]
        R.st[0] = R.st[0] + 1.0; // 8493d0: fadd qword ptr [0x967890]
        R.m.wf64(((R.esp + 0x24) | 0) >>> 0, R.st[0]); // 8493d6: fst qword ptr [esp + 0x24]
        R.fcom(R.st[0], 0.001); R.fpop(); // 8493da: fcomp qword ptr [0x96a350]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8493e0: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 8493e2: test ah, 1
        if (R.zf) { pc = 733; continue; } // 8493e5: je 0x8493f7
        pc = 732; continue;
      case 732: // 8493e7
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, 0xd2f1a9fc); // 8493e7: mov dword ptr [esp + 0x24], 0xd2f1a9fc
        R.m.w32(((R.esp + 0x28) | 0) >>> 0, 0x3f50624d); // 8493ef: mov dword ptr [esp + 0x28], 0x3f50624d
        pc = 733; continue;
      case 733: // 8493f7
        R.eax = (R.m.u32(((R.esp + 0x3c) | 0) >>> 0)) | 0; // 8493f7: mov eax, dword ptr [esp + 0x3c]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8493fb: test eax, eax
        if (R.zf) { pc = 736; continue; } // 8493fd: je 0x849413
        pc = 734; continue;
      default: return pc;
    }
  }
}
function f_846920_80(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 734: // 8493ff
        R.logic(R.m.u8(((R.eax + 0x46) | 0) >>> 0) & 0x1, 8); // 8493ff: test byte ptr [eax + 0x46], 1
        if (R.zf) { pc = 736; continue; } // 849403: je 0x849413
        pc = 735; continue;
      case 735: // 849405
        R.fpush(R.f64(((R.esp + 0x24) | 0))); // 849405: fld qword ptr [esp + 0x24]
        R.st[0] = R.st[0] * 1.5; // 849409: fmul qword ptr [0x968940]
        R.m.wf64(((R.esp + 0x24) | 0) >>> 0, R.st[0]); R.fpop(); // 84940f: fstp qword ptr [esp + 0x24]
        pc = 736; continue;
      case 736: // 849413
        R.fpush(R.f64(((R.esp + 0x24) | 0))); // 849413: fld qword ptr [esp + 0x24]
        R.st[0] = R.st[0] * R.f64(((R.esp + 0xc) | 0)); // 849417: fmul qword ptr [esp + 0xc]
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 84941b: test edi, edi
        if (R.zf) { pc = 760; continue; } // 84941d: je 0x8494fb
        pc = 737; continue;
      case 737: // 849423
        R.fpush(R.f64(((R.esp + 0x24) | 0))); // 849423: fld qword ptr [esp + 0x24]
        R.fcom(R.st[0], 0.6); R.fpop(); // 849427: fcomp qword ptr [0x968e48]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 84942d: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 84942f: test ah, 1
        if (R.zf) { pc = 748; continue; } // 849432: je 0x849491
        pc = 738; continue;
      case 738: // 849434
        R.fpush(R.f32(((R.esp + 0x50) | 0))); // 849434: fld dword ptr [esp + 0x50]
        R.fcom(R.st[0], 1.2); R.fpop(); // 849438: fcomp qword ptr [0x968978]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 84943e: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 849440: test ah, 0x41
        if (!R.zf) { pc = 747; continue; } // 849443: jne 0x849488
        pc = 739; continue;
      case 739: // 849445
        R.eax = (R.m.u32(((R.esp + 0x78) | 0) >>> 0)) | 0; // 849445: mov eax, dword ptr [esp + 0x78]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 849449: test eax, eax
        if (R.zf) { pc = 747; continue; } // 84944b: je 0x849488
        pc = 740; continue;
      case 740: // 84944d
        R.eax = (R.m.u32(((R.esp + 0x80) | 0) >>> 0)) | 0; // 84944d: mov eax, dword ptr [esp + 0x80]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 849454: test eax, eax
        if (!R.zf) { pc = 747; continue; } // 849456: jne 0x849488
        pc = 741; continue;
      case 741: // 849458
        R.fcom(R.st[0], 1.25); // 849458: fcom qword ptr [0x968928]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 84945e: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 849460: test ah, 0x41
        if (!R.zf) { pc = 747; continue; } // 849463: jne 0x849488
        pc = 742; continue;
      case 742: // 849465
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esp + 0x1a) | 0) >>> 0)) & 0xff) << 0)) | 0; // 849465: mov al, byte ptr [esp + 0x1a]
        R.sub(((R.eax >>> 0) & 0xff), 0x4, 8); // 849469: cmp al, 4
        if (!R.cL) { pc = 747; continue; } // 84946b: jge 0x849488
        pc = 743; continue;
      case 743: // 84946d
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 84946d: test al, al
        if (R.cLE) { pc = 747; continue; } // 84946f: jle 0x849488
        pc = 744; continue;
      case 744: // 849471
        R.eax = (R.m.u32(((R.esp + 0x3c) | 0) >>> 0)) | 0; // 849471: mov eax, dword ptr [esp + 0x3c]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 849475: test eax, eax
        if (R.zf) { pc = 746; continue; } // 849477: je 0x84947f
        pc = 745; continue;
      default: return pc;
    }
  }
}
function f_846920_81(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 745: // 849479
        R.sub(R.m.u8(((R.eax + 0x49) | 0) >>> 0), 0x0, 8); // 849479: cmp byte ptr [eax + 0x49], 0
        if (!R.zf) { pc = 747; continue; } // 84947d: jne 0x849488
        pc = 746; continue;
      case 746: // 84947f
        R.eax = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 84947f: mov eax, dword ptr [edi]
        R.eax = (R.logic((R.eax >>> 0) | 0x400000, 32)) | 0; // 849481: or eax, 0x400000
        pc = 759; continue; // 849486: jmp 0x8494f9
      case 747: // 849488
        R.eax = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 849488: mov eax, dword ptr [edi]
        R.eax = (R.logic((R.eax >>> 0) | 0x800000, 32)) | 0; // 84948a: or eax, 0x800000
        pc = 759; continue; // 84948f: jmp 0x8494f9
      case 748: // 849491
        R.fpush(R.f64(((R.esp + 0x24) | 0))); // 849491: fld qword ptr [esp + 0x24]
        R.fcom(R.st[0], 1.5); R.fpop(); // 849495: fcomp qword ptr [0x968940]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 84949b: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 84949d: test ah, 0x41
        if (!R.zf) { pc = 760; continue; } // 8494a0: jne 0x8494fb
        pc = 749; continue;
      case 749: // 8494a2
        R.fpush(R.f32(((R.esp + 0x50) | 0))); // 8494a2: fld dword ptr [esp + 0x50]
        R.fcom(R.st[0], 1.2); R.fpop(); // 8494a6: fcomp qword ptr [0x968978]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8494ac: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 8494ae: test ah, 0x41
        if (!R.zf) { pc = 760; continue; } // 8494b1: jne 0x8494fb
        pc = 750; continue;
      case 750: // 8494b3
        R.eax = (R.m.u32(((R.esp + 0x78) | 0) >>> 0)) | 0; // 8494b3: mov eax, dword ptr [esp + 0x78]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8494b7: test eax, eax
        if (!R.zf) { pc = 760; continue; } // 8494b9: jne 0x8494fb
        pc = 751; continue;
      case 751: // 8494bb
        R.eax = (R.m.u32(((R.esp + 0x80) | 0) >>> 0)) | 0; // 8494bb: mov eax, dword ptr [esp + 0x80]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8494c2: test eax, eax
        if (R.zf) { pc = 760; continue; } // 8494c4: je 0x8494fb
        pc = 752; continue;
      case 752: // 8494c6
        R.eax = (R.m.u32(((R.esp + 0x30) | 0) >>> 0)) | 0; // 8494c6: mov eax, dword ptr [esp + 0x30]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8494ca: test eax, eax
        if (R.zf) { pc = 754; continue; } // 8494cc: je 0x8494d9
        pc = 753; continue;
      case 753: // 8494ce
        R.sub(R.m.u16(((R.eax + 0x80) | 0) >>> 0), 0x1d4c, 16); // 8494ce: cmp word ptr [eax + 0x80], 0x1d4c
        if (!R.cL) { pc = 760; continue; } // 8494d7: jge 0x8494fb
        pc = 754; continue;
      case 754: // 8494d9
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ebp + 0x18) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8494d9: mov al, byte ptr [ebp + 0x18]
        R.sub(((R.eax >>> 0) & 0xff), 0x4, 8); // 8494dc: cmp al, 4
        if (!R.cL) { pc = 760; continue; } // 8494de: jge 0x8494fb
        pc = 755; continue;
      case 755: // 8494e0
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 8494e0: test al, al
        if (R.cLE) { pc = 760; continue; } // 8494e2: jle 0x8494fb
        pc = 756; continue;
      case 756: // 8494e4
        R.eax = (R.m.u32(((R.esp + 0x3c) | 0) >>> 0)) | 0; // 8494e4: mov eax, dword ptr [esp + 0x3c]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8494e8: test eax, eax
        if (R.zf) { pc = 758; continue; } // 8494ea: je 0x8494f2
        pc = 757; continue;
      default: return pc;
    }
  }
}
function f_846920_82(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 757: // 8494ec
        R.sub(R.m.u8(((R.eax + 0x49) | 0) >>> 0), 0x0, 8); // 8494ec: cmp byte ptr [eax + 0x49], 0
        if (!R.zf) { pc = 760; continue; } // 8494f0: jne 0x8494fb
        pc = 758; continue;
      case 758: // 8494f2
        R.eax = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 8494f2: mov eax, dword ptr [edi]
        R.eax = (R.logic((R.eax >>> 0) | 0x200000, 32)) | 0; // 8494f4: or eax, 0x200000
        pc = 759; continue;
      case 759: // 8494f9
        R.m.w32(((R.edi) | 0) >>> 0, (R.eax >>> 0)); // 8494f9: mov dword ptr [edi], eax
        pc = 760; continue;
      case 760: // 8494fb
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ebp + 0x14) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8494fb: mov al, byte ptr [ebp + 0x14]
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 8494fe: test al, al
        if (!R.zf) { pc = 762; continue; } // 849500: jne 0x849506
        pc = 761; continue;
      case 761: // 849502
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x24) | 0)); // 849502: fmul qword ptr [esp + 0x24]
        pc = 762; continue;
      case 762: // 849506
        R.eax = (R.m.u32(((R.esp + 0x3c) | 0) >>> 0)) | 0; // 849506: mov eax, dword ptr [esp + 0x3c]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84950a: test eax, eax
        if (R.zf) { pc = 786; continue; } // 84950c: je 0x8495f8
        pc = 763; continue;
      case 763: // 849512
        R.logic(R.m.u8(((R.eax + 0x45) | 0) >>> 0) & 0x1, 8); // 849512: test byte ptr [eax + 0x45], 1
        if (R.zf) { pc = 786; continue; } // 849516: je 0x8495f8
        pc = 764; continue;
      case 764: // 84951c
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x24) | 0)); // 84951c: fmul qword ptr [esp + 0x24]
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 849520: test edi, edi
        if (R.zf) { pc = 786; continue; } // 849522: je 0x8495f8
        pc = 765; continue;
      case 765: // 849528
        R.fpush(R.f64(((R.esp + 0x24) | 0))); // 849528: fld qword ptr [esp + 0x24]
        R.fcom(R.st[0], 0.8); R.fpop(); // 84952c: fcomp qword ptr [0x9689b0]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 849532: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 849534: test ah, 1
        if (R.zf) { pc = 775; continue; } // 849537: je 0x849592
        pc = 766; continue;
      case 766: // 849539
        R.fpush(R.f32(((R.esp + 0x50) | 0))); // 849539: fld dword ptr [esp + 0x50]
        R.fcom(R.st[0], 1.2); R.fpop(); // 84953d: fcomp qword ptr [0x968978]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 849543: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 849545: test ah, 0x41
        if (!R.zf) { pc = 774; continue; } // 849548: jne 0x849589
        pc = 767; continue;
      case 767: // 84954a
        R.eax = (R.m.u32(((R.esp + 0x78) | 0) >>> 0)) | 0; // 84954a: mov eax, dword ptr [esp + 0x78]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84954e: test eax, eax
        if (R.zf) { pc = 774; continue; } // 849550: je 0x849589
        pc = 768; continue;
      case 768: // 849552
        R.eax = (R.m.u32(((R.esp + 0x80) | 0) >>> 0)) | 0; // 849552: mov eax, dword ptr [esp + 0x80]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 849559: test eax, eax
        if (!R.zf) { pc = 774; continue; } // 84955b: jne 0x849589
        pc = 769; continue;
      default: return pc;
    }
  }
}
function f_846920_83(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 769: // 84955d
        R.fcom(R.st[0], 1.25); // 84955d: fcom qword ptr [0x968928]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 849563: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 849565: test ah, 0x41
        if (!R.zf) { pc = 774; continue; } // 849568: jne 0x849589
        pc = 770; continue;
      case 770: // 84956a
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esp + 0x1a) | 0) >>> 0)) & 0xff) << 0)) | 0; // 84956a: mov al, byte ptr [esp + 0x1a]
        R.sub(((R.eax >>> 0) & 0xff), 0x4, 8); // 84956e: cmp al, 4
        if (!R.cL) { pc = 774; continue; } // 849570: jge 0x849589
        pc = 771; continue;
      case 771: // 849572
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 849572: test al, al
        if (R.cLE) { pc = 774; continue; } // 849574: jle 0x849589
        pc = 772; continue;
      case 772: // 849576
        R.eax = (R.m.u32(((R.esp + 0x3c) | 0) >>> 0)) | 0; // 849576: mov eax, dword ptr [esp + 0x3c]
        R.sub(R.m.u8(((R.eax + 0x49) | 0) >>> 0), 0x0, 8); // 84957a: cmp byte ptr [eax + 0x49], 0
        if (!R.zf) { pc = 774; continue; } // 84957e: jne 0x849589
        pc = 773; continue;
      case 773: // 849580
        R.eax = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 849580: mov eax, dword ptr [edi]
        R.eax = (R.logic((R.eax >>> 0) | 0x400000, 32)) | 0; // 849582: or eax, 0x400000
        pc = 785; continue; // 849587: jmp 0x8495f6
      case 774: // 849589
        R.eax = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 849589: mov eax, dword ptr [edi]
        R.eax = (R.logic((R.eax >>> 0) | 0x800000, 32)) | 0; // 84958b: or eax, 0x800000
        pc = 785; continue; // 849590: jmp 0x8495f6
      case 775: // 849592
        R.fpush(R.f64(((R.esp + 0x24) | 0))); // 849592: fld qword ptr [esp + 0x24]
        R.fcom(R.st[0], 2.0); R.fpop(); // 849596: fcomp qword ptr [0x968950]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 84959c: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 84959e: test ah, 0x41
        if (!R.zf) { pc = 786; continue; } // 8495a1: jne 0x8495f8
        pc = 776; continue;
      case 776: // 8495a3
        R.fpush(R.f32(((R.esp + 0x50) | 0))); // 8495a3: fld dword ptr [esp + 0x50]
        R.fcom(R.st[0], 1.2); R.fpop(); // 8495a7: fcomp qword ptr [0x968978]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8495ad: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 8495af: test ah, 0x41
        if (!R.zf) { pc = 786; continue; } // 8495b2: jne 0x8495f8
        pc = 777; continue;
      case 777: // 8495b4
        R.eax = (R.m.u32(((R.esp + 0x78) | 0) >>> 0)) | 0; // 8495b4: mov eax, dword ptr [esp + 0x78]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8495b8: test eax, eax
        if (!R.zf) { pc = 786; continue; } // 8495ba: jne 0x8495f8
        pc = 778; continue;
      case 778: // 8495bc
        R.eax = (R.m.u32(((R.esp + 0x80) | 0) >>> 0)) | 0; // 8495bc: mov eax, dword ptr [esp + 0x80]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8495c3: test eax, eax
        if (R.zf) { pc = 786; continue; } // 8495c5: je 0x8495f8
        pc = 779; continue;
      case 779: // 8495c7
        R.eax = (R.m.u32(((R.esp + 0x30) | 0) >>> 0)) | 0; // 8495c7: mov eax, dword ptr [esp + 0x30]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8495cb: test eax, eax
        if (R.zf) { pc = 781; continue; } // 8495cd: je 0x8495da
        pc = 780; continue;
      default: return pc;
    }
  }
}
function f_846920_84(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 780: // 8495cf
        R.sub(R.m.u16(((R.eax + 0x80) | 0) >>> 0), 0x1d4c, 16); // 8495cf: cmp word ptr [eax + 0x80], 0x1d4c
        if (!R.cL) { pc = 786; continue; } // 8495d8: jge 0x8495f8
        pc = 781; continue;
      case 781: // 8495da
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ebp + 0x18) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8495da: mov al, byte ptr [ebp + 0x18]
        R.sub(((R.eax >>> 0) & 0xff), 0x4, 8); // 8495dd: cmp al, 4
        if (!R.cL) { pc = 786; continue; } // 8495df: jge 0x8495f8
        pc = 782; continue;
      case 782: // 8495e1
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 8495e1: test al, al
        if (R.cLE) { pc = 786; continue; } // 8495e3: jle 0x8495f8
        pc = 783; continue;
      case 783: // 8495e5
        R.eax = (R.m.u32(((R.esp + 0x3c) | 0) >>> 0)) | 0; // 8495e5: mov eax, dword ptr [esp + 0x3c]
        R.sub(R.m.u8(((R.eax + 0x49) | 0) >>> 0), 0x0, 8); // 8495e9: cmp byte ptr [eax + 0x49], 0
        if (!R.zf) { pc = 786; continue; } // 8495ed: jne 0x8495f8
        pc = 784; continue;
      case 784: // 8495ef
        R.eax = (R.m.u32(((R.edi) | 0) >>> 0)) | 0; // 8495ef: mov eax, dword ptr [edi]
        R.eax = (R.logic((R.eax >>> 0) | 0x200000, 32)) | 0; // 8495f1: or eax, 0x200000
        pc = 785; continue;
      case 785: // 8495f6
        R.m.w32(((R.edi) | 0) >>> 0, (R.eax >>> 0)); // 8495f6: mov dword ptr [edi], eax
        pc = 786; continue;
      case 786: // 8495f8
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ebp + 0x14) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8495f8: mov al, byte ptr [ebp + 0x14]
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 8495fb: test al, al
        if (R.zf) { pc = 794; continue; } // 8495fd: je 0x849693
        pc = 787; continue;
      case 787: // 849603
        R.eax = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 849603: mov eax, dword ptr [ebp + 8]
        R.eax = (R.m.u32(((R.eax + 0x61) | 0) >>> 0)) | 0; // 849606: mov eax, dword ptr [eax + 0x61]
        R.sub(R.m.u16(((R.eax + 0xb) | 0) >>> 0), ((R.ebx >>> 0) & 0xffff), 16); // 849609: cmp word ptr [eax + 0xb], bx
        if (R.cLE) { pc = 791; continue; } // 84960d: jle 0x84964f
        pc = 788; continue;
      case 788: // 84960f
        R.sub(((R.ebx >>> 0) & 0xffff), ((R.esi >>> 0) & 0xffff), 16); // 84960f: cmp bx, si
        if (R.cLE) { pc = 791; continue; } // 849612: jle 0x84964f
        pc = 789; continue;
      case 789: // 849614
        R.ecx = (R.sub((R.ecx >>> 0), (R.edx >>> 0), 32)) | 0; // 849614: sub ecx, edx
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.ecx >>> 0)); // 849616: mov dword ptr [esp + 0x24], ecx
        R.fpush(R.m.s32(((R.esp + 0x24) | 0) >>> 0)); // 84961a: fild dword ptr [esp + 0x24]
        R.st[0] = R.st[0] * 0.0002; // 84961e: fmul qword ptr [0x96a600]
        R.st[0] = R.st[0] + 1.0; // 849624: fadd qword ptr [0x967890]
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x5c) | 0)); // 84962a: fmul qword ptr [esp + 0x5c]
        R.m.wf64(((R.esp + 0x5c) | 0) >>> 0, R.st[0]); // 84962e: fst qword ptr [esp + 0x5c]
        R.fcom(R.st[0], 0.1); R.fpop(); // 849632: fcomp qword ptr [0x967880]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 849638: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 84963a: test ah, 1
        if (R.zf) { pc = 791; continue; } // 84963d: je 0x84964f
        pc = 790; continue;
      case 790: // 84963f
        R.m.w32(((R.esp + 0x5c) | 0) >>> 0, 0x9999999a); // 84963f: mov dword ptr [esp + 0x5c], 0x9999999a
        R.m.w32(((R.esp + 0x60) | 0) >>> 0, 0x3fb99999); // 849647: mov dword ptr [esp + 0x60], 0x3fb99999
        pc = 791; continue;
      default: return pc;
    }
  }
}
function f_846920_85(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 791: // 84964f
        R.ecx = (((R.m.u8(((R.esp + 0x56) | 0) >>> 0)) << 24 >> 24)) | 0; // 84964f: movsx ecx, byte ptr [esp + 0x56]
        R.edx = (((R.m.u8(((R.esp + 0x57) | 0) >>> 0)) << 24 >> 24)) | 0; // 849654: movsx edx, byte ptr [esp + 0x57]
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.ecx >>> 0)); // 849659: mov dword ptr [esp + 0x24], ecx
        R.fpush(R.m.s32(((R.esp + 0x24) | 0) >>> 0)); // 84965d: fild dword ptr [esp + 0x24]
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.edx >>> 0)); // 849661: mov dword ptr [esp + 0x24], edx
        R.fpush(R.m.s32(((R.esp + 0x24) | 0) >>> 0)); // 849665: fild dword ptr [esp + 0x24]
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 849669: test edi, edi
        R.st[1] = R.st[1] / R.st[0]; R.fpop(); // 84966b: fdivp st(1)
        R.fpush(R.st[0]); // 84966d: fld st(0)
        R.st[2] = R.st[2] * R.st[0]; R.fpop(); // 84966f: fmulp st(2)
        if (R.zf) { pc = 814; continue; } // 849671: je 0x849797
        pc = 792; continue;
      case 792: // 849677
        R.fcom(R.st[0], 0.6); R.fpop(); // 849677: fcomp qword ptr [0x968e48]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 84967d: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 84967f: test ah, 1
        if (R.zf) { pc = 815; continue; } // 849682: je 0x849799
        pc = 793; continue;
      case 793: // 849688
        R.m.w32(((R.edi) | 0) >>> 0, R.logic(R.m.u32(((R.edi) | 0) >>> 0) | 0x1000000, 32)); // 849688: or dword ptr [edi], 0x1000000
        pc = 815; continue; // 84968e: jmp 0x849799
      case 794: // 849693
        R.esi = (R.m.u32(((R.esp + 0x30) | 0) >>> 0)) | 0; // 849693: mov esi, dword ptr [esp + 0x30]
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 849697: test esi, esi
        if (R.zf) { pc = 815; continue; } // 849699: je 0x849799
        pc = 795; continue;
      case 795: // 84969f
        R.ecx = ((R.ecx & 0xffffff00) | (((R.m.u8(((R.esp + 0x56) | 0) >>> 0)) & 0xff) << 0)) | 0; // 84969f: mov cl, byte ptr [esp + 0x56]
        R.edx = ((R.edx & 0xffffff00) | (((R.m.u8(((R.esp + 0x57) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8496a3: mov dl, byte ptr [esp + 0x57]
        R.sub(((R.ecx >>> 0) & 0xff), ((R.edx >>> 0) & 0xff), 8); // 8496a7: cmp cl, dl
        if (R.zf) { pc = 806; continue; } // 8496a9: je 0x849753
        pc = 796; continue;
      case 796: // 8496af
        R.eax = (R.m.u32(((R.esp + 0x6c) | 0) >>> 0)) | 0; // 8496af: mov eax, dword ptr [esp + 0x6c]
        R.sub(((R.eax >>> 0) & 0xffff), 0x1f4, 16); // 8496b3: cmp ax, 0x1f4
        if (R.cLE) { pc = 798; continue; } // 8496b7: jle 0x8496c2
        pc = 797; continue;
      case 797: // 8496b9
        R.eax = (((((R.eax >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 8496b9: movsx eax, ax
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.eax >>> 0)); // 8496bc: mov dword ptr [esp + 0x24], eax
        pc = 799; continue; // 8496c0: jmp 0x8496ca
      case 798: // 8496c2
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, 0x1f4); // 8496c2: mov dword ptr [esp + 0x24], 0x1f4
        pc = 799; continue;
      default: return pc;
    }
  }
}
function f_846920_86(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 799: // 8496ca
        R.eax = (((R.m.u16(((R.esp + 0x68) | 0) >>> 0)) << 16 >> 16)) | 0; // 8496ca: movsx eax, word ptr [esp + 0x68]
        R.ecx = (((((R.ecx >>> 0) & 0xff)) << 24 >> 24)) | 0; // 8496cf: movsx ecx, cl
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.ecx >>> 0)); // 8496d2: mov dword ptr [esp + 0x1c], ecx
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 8496d6: fild dword ptr [esp + 0x1c]
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, (R.eax >>> 0)); // 8496da: mov dword ptr [esp + 0x1c], eax
        R.fpush(R.m.s32(((R.esp + 0x1c) | 0) >>> 0)); // 8496de: fild dword ptr [esp + 0x1c]
        R.ecx = (((((R.edx >>> 0) & 0xff)) << 24 >> 24)) | 0; // 8496e2: movsx ecx, dl
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 8496e5: fmulp st(1)
        R.fpush(R.m.s32(((R.esp + 0x24) | 0) >>> 0)); // 8496e7: fild dword ptr [esp + 0x24]
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.ecx >>> 0)); // 8496eb: mov dword ptr [esp + 0x24], ecx
        R.fpush(R.m.s32(((R.esp + 0x24) | 0) >>> 0)); // 8496ef: fild dword ptr [esp + 0x24]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 8496f3: fmulp st(1)
        R.st[1] = R.st[1] / R.st[0]; R.fpop(); // 8496f5: fdivp st(1)
        R.fpush(0.01); // 8496f7: fld qword ptr [0x967898]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 8496fd: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8496ff: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 849701: test ah, 0x41
        if (!R.zf) { pc = 801; continue; } // 849704: jne 0x849710
        pc = 800; continue;
      case 800: // 849706
        R.fpop(); // 849706: fstp st(0)
        R.fpush(0.01); // 849708: fld qword ptr [0x967898]
        pc = 803; continue; // 84970e: jmp 0x849727
      case 801: // 849710
        R.fpush(10.0); // 849710: fld qword ptr [0x9688b0]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 849716: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 849718: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 84971a: test ah, 1
        if (R.zf) { pc = 803; continue; } // 84971d: je 0x849727
        pc = 802; continue;
      case 802: // 84971f
        R.fpop(); // 84971f: fstp st(0)
        R.fpush(10.0); // 849721: fld qword ptr [0x9688b0]
        pc = 803; continue;
      case 803: // 849727
        R.eax = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 849727: mov eax, dword ptr [ebp + 0xc]
        R.edx = (R.m.u32(((R.esi + 0x53) | 0) >>> 0)) | 0; // 84972a: mov edx, dword ptr [esi + 0x53]
        R.fpush(R.st[0]); // 84972d: fld st(0)
        R.ecx = (R.m.u32(((R.eax + 0x53) | 0) >>> 0)) | 0; // 84972f: mov ecx, dword ptr [eax + 0x53]
        R.st[2] = R.st[2] * R.st[0]; R.fpop(); // 849732: fmulp st(2)
        R.eax = (R.m.u32(((R.ecx + 0x71) | 0) >>> 0)) | 0; // 849734: mov eax, dword ptr [ecx + 0x71]
        R.ecx = (R.m.u32(((R.edx + 0x71) | 0) >>> 0)) | 0; // 849737: mov ecx, dword ptr [edx + 0x71]
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 84973a: cmp eax, ecx
        if (R.zf) { pc = 814; continue; } // 84973c: je 0x849797
        pc = 804; continue;
      case 804: // 84973e
        R.fcom(R.st[0], 1.0); R.fpop(); // 84973e: fcomp qword ptr [0x967890]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 849744: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 849746: test ah, 1
        if (R.zf) { pc = 815; continue; } // 849749: je 0x849799
        pc = 805; continue;
      case 805: // 84974b
        R.st[0] = R.st[0] * 0.2; // 84974b: fmul qword ptr [0x968918]
        pc = 812; continue; // 849751: jmp 0x84978b
      default: return pc;
    }
  }
}
function f_846920_87(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 806: // 849753
        R.ecx = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 849753: mov ecx, dword ptr [ebp + 8]
        R.edx = (R.m.u32(((R.ecx + 0x1a) | 0) >>> 0)) | 0; // 849756: mov edx, dword ptr [ecx + 0x1a]
        R.eax = (R.m.u32(((R.edx + 0x71) | 0) >>> 0)) | 0; // 849759: mov eax, dword ptr [edx + 0x71]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84975c: test eax, eax
        if (R.zf) { pc = 815; continue; } // 84975e: je 0x849799
        pc = 807; continue;
      case 807: // 849760
        R.ecx = (R.m.u32(((0x9cfa10) | 0) >>> 0)) | 0; // 849760: mov ecx, dword ptr [0x9cfa10]
        R.edx = (R.m.u32(((R.eax) | 0) >>> 0)) | 0; // 849766: mov edx, dword ptr [eax]
        R.sub((R.edx >>> 0), (R.ecx >>> 0), 32); // 849768: cmp edx, ecx
        if (!R.zf) { pc = 815; continue; } // 84976a: jne 0x849799
        pc = 808; continue;
      case 808: // 84976c
        R.eax = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 84976c: mov eax, dword ptr [ebp + 0xc]
        R.edx = (R.m.u32(((R.eax + 0x53) | 0) >>> 0)) | 0; // 84976f: mov edx, dword ptr [eax + 0x53]
        R.eax = (R.m.u32(((R.edx + 0x71) | 0) >>> 0)) | 0; // 849772: mov eax, dword ptr [edx + 0x71]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 849775: test eax, eax
        if (R.zf) { pc = 815; continue; } // 849777: je 0x849799
        pc = 809; continue;
      case 809: // 849779
        R.sub(R.m.u32(((R.eax) | 0) >>> 0), (R.ecx >>> 0), 32); // 849779: cmp dword ptr [eax], ecx
        if (R.zf) { pc = 815; continue; } // 84977b: je 0x849799
        pc = 810; continue;
      case 810: // 84977d
        R.ecx = (R.m.u32(((R.esi + 0x53) | 0) >>> 0)) | 0; // 84977d: mov ecx, dword ptr [esi + 0x53]
        R.sub((R.eax >>> 0), R.m.u32(((R.ecx + 0x71) | 0) >>> 0), 32); // 849780: cmp eax, dword ptr [ecx + 0x71]
        if (R.zf) { pc = 815; continue; } // 849783: je 0x849799
        pc = 811; continue;
      case 811: // 849785
        R.st[0] = R.st[0] * 0.4; // 849785: fmul qword ptr [0x968e00]
        pc = 812; continue;
      case 812: // 84978b
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 84978b: test edi, edi
        if (R.zf) { pc = 815; continue; } // 84978d: je 0x849799
        pc = 813; continue;
      case 813: // 84978f
        R.m.w32(((R.edi) | 0) >>> 0, R.logic(R.m.u32(((R.edi) | 0) >>> 0) | 0x2000000, 32)); // 84978f: or dword ptr [edi], 0x2000000
        pc = 815; continue; // 849795: jmp 0x849799
      case 814: // 849797
        R.fpop(); // 849797: fstp st(0)
        pc = 815; continue;
      case 815: // 849799
        R.fpush(R.f64(((R.esp + 0x5c) | 0))); // 849799: fld qword ptr [esp + 0x5c]
        R.st[0] = R.st[0] * R.st[1]; // 84979d: fmul st(1)
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 84979f: test edi, edi
        R.m.wf64(((R.esp + 0xc) | 0) >>> 0, R.st[0]); R.fpop(); // 8497a1: fstp qword ptr [esp + 0xc]
        R.fpop(); // 8497a5: fstp st(0)
        if (R.zf) { pc = 819; continue; } // 8497a7: je 0x8497c5
        pc = 816; continue;
      case 816: // 8497a9
        R.fpush(R.f64(((R.esp + 0x5c) | 0))); // 8497a9: fld qword ptr [esp + 0x5c]
        R.fcom(R.st[0], 0.6); R.fpop(); // 8497ad: fcomp qword ptr [0x968e48]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8497b3: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 8497b5: test ah, 1
        if (R.zf) { pc = 819; continue; } // 8497b8: je 0x8497c5
        pc = 817; continue;
      case 817: // 8497ba
        R.m.w32(((R.edi) | 0) >>> 0, R.logic(R.m.u32(((R.edi) | 0) >>> 0) | 0x800000, 32)); // 8497ba: or dword ptr [edi], 0x800000
        pc = 819; continue; // 8497c0: jmp 0x8497c5
      default: return pc;
    }
  }
}
function f_846920_88(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 818: // 8497c2
        R.edi = (R.m.u32(((R.ebp + 0x1c) | 0) >>> 0)) | 0; // 8497c2: mov edi, dword ptr [ebp + 0x1c]
        pc = 819; continue;
      case 819: // 8497c5
        R.eax = (R.m.u32(((R.esp + 0x30) | 0) >>> 0)) | 0; // 8497c5: mov eax, dword ptr [esp + 0x30]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8497c9: test eax, eax
        if (R.zf) { pc = 837; continue; } // 8497cb: je 0x8498e9
        pc = 820; continue;
      case 820: // 8497d1
        R.edx = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 8497d1: mov edx, dword ptr [ebp + 0xc]
        R.sub((R.eax >>> 0), (R.edx >>> 0), 32); // 8497d4: cmp eax, edx
        if (R.zf) { pc = 837; continue; } // 8497d6: je 0x8498e9
        pc = 821; continue;
      case 821: // 8497dc
        R.eax = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 8497dc: mov eax, dword ptr [ebp + 8]
        R.ecx = (R.m.u32(((R.eax + 0x61) | 0) >>> 0)) | 0; // 8497df: mov ecx, dword ptr [eax + 0x61]
        R.esi = ((R.esi & 0xffff0000) | (((R.m.u16(((R.ecx + 0x7) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 8497e2: mov si, word ptr [ecx + 7]
        R.sub(((R.esi >>> 0) & 0xffff), 0x82, 16); // 8497e6: cmp si, 0x82
        if (R.cLE) { pc = 837; continue; } // 8497eb: jle 0x8498e9
        pc = 822; continue;
      case 822: // 8497f1
        R.ebx = (R.m.u32(((R.esp + 0x30) | 0) >>> 0)) | 0; // 8497f1: mov ebx, dword ptr [esp + 0x30]
        R.eax = (0x88888889) | 0; // 8497f5: mov eax, 0x88888889
        R.ecx = (((R.m.u16(((R.ebx + 0x80) | 0) >>> 0)) << 16 >> 16)) | 0; // 8497fa: movsx ecx, word ptr [ebx + 0x80]
        { const p = BigInt(R.eax | 0) * BigInt((((R.ecx >>> 0)) | 0)); R.eax = Number(BigInt.asIntN(32, p)); R.edx = Number(BigInt.asIntN(32, p >> 32n)); R.cf = R.of = BigInt.asIntN(32, p) !== p; } // 849801: imul ecx
        R.edx = (R.add((R.edx >>> 0), (R.ecx >>> 0), 32)) | 0; // 849803: add edx, ecx
        R.edx = (R.sar((R.edx >>> 0), 0x5, 32)) | 0; // 849805: sar edx, 5
        R.eax = ((R.edx >>> 0)) | 0; // 849808: mov eax, edx
        R.eax = (R.shr((R.eax >>> 0), 0x1f, 32)) | 0; // 84980a: shr eax, 0x1f
        R.ecx = (((((R.esi >>> 0) & 0xffff)) << 16 >> 16)) | 0; // 84980d: movsx ecx, si
        R.edx = (R.add((R.edx >>> 0), (R.eax >>> 0), 32)) | 0; // 849810: add edx, eax
        R.sub((R.ecx >>> 0), (R.edx >>> 0), 32); // 849812: cmp ecx, edx
        if (R.cLE) { pc = 837; continue; } // 849814: jle 0x8498e9
        pc = 823; continue;
      case 823: // 84981a
        R.sub(R.m.u8(((R.esp + 0x1b) | 0) >>> 0), 0x1a, 8); // 84981a: cmp byte ptr [esp + 0x1b], 0x1a
        if (!R.cL) { pc = 837; continue; } // 84981f: jge 0x8498e9
        pc = 824; continue;
      case 824: // 849825
        R.edx = (((R.esp + 0x90) | 0)) | 0; // 849825: lea edx, [esp + 0x90]
        R.eax = (((R.esp + 0x98) | 0)) | 0; // 84982c: lea eax, [esp + 0x98]
        R.push((R.edx >>> 0)); // 849833: push edx
        R.push((R.eax >>> 0)); // 849834: push eax
        R.push((R.ebx >>> 0)); // 849835: push ebx
        R.call(0x669bd0, { n: 3, thisEcx: false, calleeClean: false }); // 849836: call 0x669bd0
        R.esp = (R.add((R.esp >>> 0), 0xc, 32)) | 0; // 84983b: add esp, 0xc
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 84983e: test eax, eax
        if (R.zf) { pc = 837; continue; } // 849840: je 0x8498e9
        pc = 825; continue;
      case 825: // 849846
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.esp + 0x43) | 0) >>> 0)) & 0xff) << 0)) | 0; // 849846: mov al, byte ptr [esp + 0x43]
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 84984a: test al, al
        if (R.cLE) { pc = 837; continue; } // 84984c: jle 0x8498e9
        pc = 826; continue;
      case 826: // 849852
        R.edx = (R.m.u32(((R.esp + 0x3c) | 0) >>> 0)) | 0; // 849852: mov edx, dword ptr [esp + 0x3c]
        R.logic((R.edx >>> 0) & (R.edx >>> 0), 32); // 849856: test edx, edx
        if (R.zf) { pc = 837; continue; } // 849858: je 0x8498e9
        pc = 827; continue;
      default: return pc;
    }
  }
}
function f_846920_89(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 827: // 84985e
        R.eax = ((R.eax & 0xffff0000) | (((R.m.u16(((R.edx + 0x2f) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 84985e: mov ax, word ptr [edx + 0x2f]
        R.ecx = ((R.ecx & 0xffff0000) | (((R.m.u16(((R.esp + 0x92) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 849862: mov cx, word ptr [esp + 0x92]
        R.sub(((R.ecx >>> 0) & 0xffff), ((R.eax >>> 0) & 0xffff), 16); // 84986a: cmp cx, ax
        if (R.cf) { pc = 830; continue; } // 84986d: jb 0x849886
        pc = 828; continue;
      case 828: // 84986f
        if (!R.cBE) { pc = 837; continue; } // 84986f: ja 0x8498e9
        pc = 829; continue;
      case 829: // 849871
        R.ecx = ((R.ecx & 0xffff0000) | (((R.m.u16(((R.esp + 0x90) | 0) >>> 0)) & 0xffff) << 0)) | 0; // 849871: mov cx, word ptr [esp + 0x90]
        R.eax = (R.logic((R.eax >>> 0) ^ (R.eax >>> 0), 32)) | 0; // 849879: xor eax, eax
        R.sub(((R.ecx >>> 0) & 0xffff), R.m.u16(((R.edx + 0x2d) | 0) >>> 0), 16); // 84987b: cmp cx, word ptr [edx + 0x2d]
        R.eax = ((R.eax & 0xffffff00) | (((R.cL ? 1 : 0) & 0xff) << 0)) | 0; // 84987f: setl al
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 849882: test eax, eax
        if (R.zf) { pc = 837; continue; } // 849884: je 0x8498e9
        pc = 830; continue;
      case 830: // 849886
        R.eax = (R.m.u32(((R.edx + 0x45) | 0) >>> 0)) | 0; // 849886: mov eax, dword ptr [edx + 0x45]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 849889: test eax, eax
        if (!R.zf) { pc = 837; continue; } // 84988b: jne 0x8498e9
        pc = 831; continue;
      case 831: // 84988d
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.edx + 0x49) | 0) >>> 0)) & 0xff) << 0)) | 0; // 84988d: mov al, byte ptr [edx + 0x49]
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 849890: test al, al
        if (!R.zf) { pc = 837; continue; } // 849892: jne 0x8498e9
        pc = 832; continue;
      case 832: // 849894
        R.edx = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 849894: mov edx, dword ptr [ebp + 0xc]
        R.push(0x0); // 849897: push 0
        R.push(0x0); // 849899: push 0
        R.push(0x1); // 84989b: push 1
        R.push(0x1); // 84989d: push 1
        R.push((R.edx >>> 0)); // 84989f: push edx
        R.call(0x600a50, { n: 5, thisEcx: false, calleeClean: false }); // 8498a0: call 0x600a50
        R.esp = (R.add((R.esp >>> 0), 0x14, 32)) | 0; // 8498a5: add esp, 0x14
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8498a8: test eax, eax
        if (R.zf) { pc = 834; continue; } // 8498aa: je 0x8498b5
        pc = 833; continue;
      case 833: // 8498ac
        R.eax = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 8498ac: mov eax, dword ptr [ebp + 8]
        R.sub(R.m.u8(((R.eax + 0x5a) | 0) >>> 0), 0xf, 8); // 8498af: cmp byte ptr [eax + 0x5a], 0xf
        if (R.cLE) { pc = 837; continue; } // 8498b3: jle 0x8498e9
        pc = 834; continue;
      case 834: // 8498b5
        R.ecx = (R.m.u32(((0xae2c94) | 0) >>> 0)) | 0; // 8498b5: mov ecx, dword ptr [0xae2c94]
        R.edx = (R.m.u32(((0xae2c90) | 0) >>> 0)) | 0; // 8498bb: mov edx, dword ptr [0xae2c90]
        R.push((R.ecx >>> 0)); // 8498c1: push ecx
        R.push((R.edx >>> 0)); // 8498c2: push edx
        R.ecx = (((R.esp + 0x98) | 0)) | 0; // 8498c3: lea ecx, [esp + 0x98]
        R.call(0x54cdb0, { n: 2, thisEcx: true, calleeClean: true }); // 8498ca: call 0x54cdb0
        R.sub((R.eax >>> 0), 0x96, 32); // 8498cf: cmp eax, 0x96
        if (!R.cL) { pc = 837; continue; } // 8498d4: jge 0x8498e9
        pc = 835; continue;
      case 835: // 8498d6
        R.logic((R.edi >>> 0) & (R.edi >>> 0), 32); // 8498d6: test edi, edi
        if (R.zf) { pc = 39; continue; } // 8498d8: je 0x846c70
        pc = 836; continue;
      default: return pc;
    }
  }
}
function f_846920_90(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 836: // 8498de
        R.m.w32(((R.edi) | 0) >>> 0, R.logic(R.m.u32(((R.edi) | 0) >>> 0) | 0x80000000, 32)); // 8498de: or dword ptr [edi], 0x80000000
        pc = 39; continue; // 8498e4: jmp 0x846c70
      case 837: // 8498e9
        R.eax = (R.m.u32(((R.ebp + 0x10) | 0) >>> 0)) | 0; // 8498e9: mov eax, dword ptr [ebp + 0x10]
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 8498ec: test eax, eax
        if (R.zf) { pc = 885; continue; } // 8498ee: je 0x849c3a
        pc = 838; continue;
      case 838: // 8498f4
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ebp + 0x14) | 0) >>> 0)) & 0xff) << 0)) | 0; // 8498f4: mov al, byte ptr [ebp + 0x14]
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 8498f7: test al, al
        if (!R.zf) { pc = 885; continue; } // 8498f9: jne 0x849c3a
        pc = 839; continue;
      case 839: // 8498ff
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 8498ff: fld qword ptr [esp + 0xc]
        R.fcom(R.st[0], 1.75); R.fpop(); // 849903: fcomp qword ptr [0x968f98]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 849909: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 84990b: test ah, 1
        if (!R.zf) { pc = 885; continue; } // 84990e: jne 0x849c3a
        pc = 840; continue;
      case 840: // 849914
        R.ecx = (((R.esp + 0xa0) | 0)) | 0; // 849914: lea ecx, [esp + 0xa0]
        R.call(0x85e410, { n: 0, thisEcx: true, calleeClean: false }); // 84991b: call 0x85e410
        R.edi = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 849920: mov edi, dword ptr [ebp + 0xc]
        R.ecx = (R.m.u32(((0xae2a38) | 0) >>> 0)) | 0; // 849923: mov ecx, dword ptr [0xae2a38]
        R.push((R.edi >>> 0)); // 849929: push edi
        R.m.w8(((R.esp + 0xfc) | 0) >>> 0, 0x2); // 84992a: mov byte ptr [esp + 0xfc], 2
        R.call(0x5a0590, { n: 1, thisEcx: true, calleeClean: true }); // 849932: call 0x5a0590
        R.esi = ((R.eax >>> 0)) | 0; // 849937: mov esi, eax
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 849939: test esi, esi
        if (R.zf) { pc = 39; continue; } // 84993b: je 0x846c70
        pc = 841; continue;
      case 841: // 849941
        R.ebx = (R.m.u32(((R.ebp + 0x18) | 0) >>> 0)) | 0; // 849941: mov ebx, dword ptr [ebp + 0x18]
        R.push(0x0); // 849944: push 0
        R.push(0xb); // 849946: push 0xb
        R.push((R.ebx >>> 0)); // 849948: push ebx
        R.push(0x0); // 849949: push 0
        R.push((R.edi >>> 0)); // 84994b: push edi
        R.edi = (R.m.u32(((R.ebp + 0x8) | 0) >>> 0)) | 0; // 84994c: mov edi, dword ptr [ebp + 8]
        R.ecx = (((R.esp + 0xb4) | 0)) | 0; // 84994f: lea ecx, [esp + 0xb4]
        R.push((R.edi >>> 0)); // 849956: push edi
        R.call(0x864550, { n: 6, thisEcx: false, calleeClean: true, float: true }); // 849957: call 0x864550
        R.m.wf64(((R.esp + 0x44) | 0) >>> 0, R.st[0]); R.fpop(); // 84995c: fstp qword ptr [esp + 0x44]
        R.push((R.ebx >>> 0)); // 849960: push ebx
        R.push((R.edi >>> 0)); // 849961: push edi
        R.ecx = ((R.esi >>> 0)) | 0; // 849962: mov ecx, esi
        R.call(0x5968d0, { n: 2, thisEcx: true, calleeClean: true }); // 849964: call 0x5968d0
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.eax >>> 0)); // 849969: mov dword ptr [esp + 0x24], eax
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, 0x0); // 84996d: mov dword ptr [esp + 0x1c], 0
        R.fpush(R.m.s32(((R.esp + 0x24) | 0) >>> 0)); // 849975: fild dword ptr [esp + 0x24]
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, 0x0); // 849979: mov dword ptr [esp + 0x20], 0
        R.m.wf64(((R.esp + 0x5c) | 0) >>> 0, R.st[0]); R.fpop(); // 849981: fstp qword ptr [esp + 0x5c]
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 849985: fld qword ptr [esp + 0xc]
        R.fpush(0.1); // 849989: fld qword ptr [0x967880]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 84998f: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 849991: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 849993: test ah, 0x41
        if (!R.zf) { pc = 843; continue; } // 849996: jne 0x8499a0
        pc = 842; continue;
      default: return pc;
    }
  }
}
function f_846920_91(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 842: // 849998
        R.fpush(0.1); // 849998: fld qword ptr [0x967880]
        pc = 844; continue; // 84999e: jmp 0x8499a2
      case 843: // 8499a0
        R.fpush(R.st[0]); // 8499a0: fld st(0)
        pc = 844; continue;
      case 844: // 8499a2
        R.fpush(3.5); // 8499a2: fld qword ptr [0x968e38]
        R.st[0] = R.st[0] / R.st[1]; // 8499a8: fdiv st(1)
        R.m.wf64(((R.esp + 0x34) | 0) >>> 0, R.st[0]); R.fpop(); // 8499aa: fstp qword ptr [esp + 0x34]
        R.fpop(); // 8499ae: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x34) | 0))); // 8499b0: fld qword ptr [esp + 0x34]
        R.fcom(R.st[0], 0.9); R.fpop(); // 8499b4: fcomp qword ptr [0x9689d8]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 8499ba: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 8499bc: test ah, 1
        if (R.zf) { pc = 846; continue; } // 8499bf: je 0x8499d1
        pc = 845; continue;
      case 845: // 8499c1
        R.m.w32(((R.esp + 0x34) | 0) >>> 0, 0xcccccccd); // 8499c1: mov dword ptr [esp + 0x34], 0xcccccccd
        R.m.w32(((R.esp + 0x38) | 0) >>> 0, 0x3feccccc); // 8499c9: mov dword ptr [esp + 0x38], 0x3feccccc
        pc = 846; continue;
      case 846: // 8499d1
        R.fpush(R.f64(((R.esp + 0x34) | 0))); // 8499d1: fld qword ptr [esp + 0x34]
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x44) | 0)); // 8499d5: fmul qword ptr [esp + 0x44]
        R.ebx = (R.m.u32(((R.esp + 0x3c) | 0) >>> 0)) | 0; // 8499d9: mov ebx, dword ptr [esp + 0x3c]
        R.logic((R.ebx >>> 0) & (R.ebx >>> 0), 32); // 8499dd: test ebx, ebx
        R.m.wf64(((R.esp + 0x44) | 0) >>> 0, R.st[0]); // 8499df: fst qword ptr [esp + 0x44]
        if (R.zf) { pc = 860; continue; } // 8499e3: je 0x849ab3
        pc = 847; continue;
      case 847: // 8499e9
        R.esi = (R.m.u32(((R.esp + 0x64) | 0) >>> 0)) | 0; // 8499e9: mov esi, dword ptr [esp + 0x64]
        R.fpop(); // 8499ed: fstp st(0)
        R.logic((R.esi >>> 0) & 0x100, 32); // 8499ef: test esi, 0x100
        R.fpop(); // 8499f5: fstp st(0)
        if (R.zf) { pc = 849; continue; } // 8499f7: je 0x849a09
        pc = 848; continue;
      case 848: // 8499f9
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, 0x0); // 8499f9: mov dword ptr [esp + 0x1c], 0
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, 0x40240000); // 849a01: mov dword ptr [esp + 0x20], 0x40240000
        pc = 849; continue;
      case 849: // 849a09
        R.eax = (R.m.u32(((R.esp + 0x30) | 0) >>> 0)) | 0; // 849a09: mov eax, dword ptr [esp + 0x30]
        R.push((R.eax >>> 0)); // 849a0d: push eax
        R.push((R.edi >>> 0)); // 849a0e: push edi
        R.call(0x544520, { n: 2, thisEcx: false, calleeClean: false }); // 849a0f: call 0x544520
        R.esp = (R.add((R.esp >>> 0), 0x8, 32)) | 0; // 849a14: add esp, 8
        R.logic((R.eax >>> 0) & (R.eax >>> 0), 32); // 849a17: test eax, eax
        if (R.zf) { pc = 851; continue; } // 849a19: je 0x849a29
        pc = 850; continue;
      case 850: // 849a1b
        R.fpush(R.f64(((R.esp + 0x1c) | 0))); // 849a1b: fld qword ptr [esp + 0x1c]
        R.st[0] = R.st[0] + 10.0; // 849a1f: fadd qword ptr [0x9688b0]
        R.m.wf64(((R.esp + 0x1c) | 0) >>> 0, R.st[0]); R.fpop(); // 849a25: fstp qword ptr [esp + 0x1c]
        pc = 851; continue;
      case 851: // 849a29
        R.eax = ((R.eax & 0xffffff00) | (((R.m.u8(((R.ebx + 0x3d) | 0) >>> 0)) & 0xff) << 0)) | 0; // 849a29: mov al, byte ptr [ebx + 0x3d]
        R.logic(((R.eax >>> 0) & 0xff) & ((R.eax >>> 0) & 0xff), 8); // 849a2c: test al, al
        if (!R.cL) { pc = 853; continue; } // 849a2e: jge 0x849a49
        pc = 852; continue;
      default: return pc;
    }
  }
}
function f_846920_92(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 852: // 849a30
        R.ecx = (((((R.eax >>> 0) & 0xff)) << 24 >> 24)) | 0; // 849a30: movsx ecx, al
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.ecx >>> 0)); // 849a33: mov dword ptr [esp + 0x24], ecx
        R.fpush(R.m.s32(((R.esp + 0x24) | 0) >>> 0)); // 849a37: fild dword ptr [esp + 0x24]
        R.st[0] = R.st[0] * 0.2; // 849a3b: fmul qword ptr [0x968918]
        R.st[0] = R.f64(((R.esp + 0x1c) | 0)) - R.st[0]; // 849a41: fsubr qword ptr [esp + 0x1c]
        R.m.wf64(((R.esp + 0x1c) | 0) >>> 0, R.st[0]); R.fpop(); // 849a45: fstp qword ptr [esp + 0x1c]
        pc = 853; continue;
      case 853: // 849a49
        R.logic((R.esi >>> 0) & (R.esi >>> 0), 32); // 849a49: test esi, esi
        if (R.zf) { pc = 855; continue; } // 849a4b: je 0x849a67
        pc = 854; continue;
      case 854: // 849a4d
        R.edx = (((R.m.u8(((R.ebx + 0x44) | 0) >>> 0)) << 24 >> 24)) | 0; // 849a4d: movsx edx, byte ptr [ebx + 0x44]
        R.m.w32(((R.esp + 0x24) | 0) >>> 0, (R.edx >>> 0)); // 849a51: mov dword ptr [esp + 0x24], edx
        R.fpush(R.m.s32(((R.esp + 0x24) | 0) >>> 0)); // 849a55: fild dword ptr [esp + 0x24]
        R.st[0] = R.st[0] * 0.2; // 849a59: fmul qword ptr [0x968918]
        R.st[0] = R.f64(((R.esp + 0x1c) | 0)) - R.st[0]; // 849a5f: fsubr qword ptr [esp + 0x1c]
        R.m.wf64(((R.esp + 0x1c) | 0) >>> 0, R.st[0]); R.fpop(); // 849a63: fstp qword ptr [esp + 0x1c]
        pc = 855; continue;
      case 855: // 849a67
        R.fpush(0.0); // 849a67: fld qword ptr [0x9689a0]
        R.fcom(R.st[0], R.f64(((R.esp + 0x1c) | 0))); R.fpop(); // 849a6d: fcomp qword ptr [esp + 0x1c]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 849a71: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 849a73: test ah, 0x41
        if (!R.zf) { pc = 857; continue; } // 849a76: jne 0x849a8a
        pc = 856; continue;
      case 856: // 849a78
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, 0x0); // 849a78: mov dword ptr [esp + 0x1c], 0
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, 0x0); // 849a80: mov dword ptr [esp + 0x20], 0
        pc = 859; continue; // 849a88: jmp 0x849aab
      case 857: // 849a8a
        R.fpush(20.0); // 849a8a: fld qword ptr [0x968ea8]
        R.fcom(R.st[0], R.f64(((R.esp + 0x1c) | 0))); R.fpop(); // 849a90: fcomp qword ptr [esp + 0x1c]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 849a94: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 849a96: test ah, 1
        if (R.zf) { pc = 859; continue; } // 849a99: je 0x849aab
        pc = 858; continue;
      case 858: // 849a9b
        R.m.w32(((R.esp + 0x1c) | 0) >>> 0, 0x0); // 849a9b: mov dword ptr [esp + 0x1c], 0
        R.m.w32(((R.esp + 0x20) | 0) >>> 0, 0x40340000); // 849aa3: mov dword ptr [esp + 0x20], 0x40340000
        pc = 859; continue;
      case 859: // 849aab
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 849aab: fld qword ptr [esp + 0xc]
        R.fpush(R.f64(((R.esp + 0x44) | 0))); // 849aaf: fld qword ptr [esp + 0x44]
        pc = 860; continue;
      case 860: // 849ab3
        R.fpush(R.st[0]); // 849ab3: fld st(0)
        R.st[0] = R.st[0] * 0.65; // 849ab5: fmul qword ptr [0x96a5d0]
        R.fcom(R.st[0], R.f64(((R.esp + 0x5c) | 0))); R.fpop(); // 849abb: fcomp qword ptr [esp + 0x5c]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 849abf: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 849ac1: test ah, 0x41
        if (!R.zf) { pc = 862; continue; } // 849ac4: jne 0x849acf
        pc = 861; continue;
      case 861: // 849ac6
        R.fpop(); // 849ac6: fstp st(0)
        R.fpop(); // 849ac8: fstp st(0)
        pc = 39; continue; // 849aca: jmp 0x846c70
      default: return pc;
    }
  }
}
function f_846920_93(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 862: // 849acf
        R.fcom(R.st[0], R.f64(((R.esp + 0x5c) | 0))); // 849acf: fcom qword ptr [esp + 0x5c]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 849ad3: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 849ad5: test ah, 0x41
        if (!R.zf) { pc = 866; continue; } // 849ad8: jne 0x849b15
        pc = 863; continue;
      case 863: // 849ada
        R.fpush(R.st[0]); // 849ada: fld st(0)
        R.st[0] = R.st[0] * 0.5; // 849adc: fmul qword ptr [0x968968]
        R.fpush(R.f64(((R.esp + 0x5c) | 0))); // 849ae2: fld qword ptr [esp + 0x5c]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 849ae6: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 849ae8: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 849aea: test ah, 0x41
        if (!R.zf) { pc = 865; continue; } // 849aed: jne 0x849af5
        pc = 864; continue;
      case 864: // 849aef
        R.fpop(); // 849aef: fstp st(0)
        R.fpush(R.f64(((R.esp + 0x5c) | 0))); // 849af1: fld qword ptr [esp + 0x5c]
        pc = 865; continue;
      case 865: // 849af5
        R.fpush(20.0); // 849af5: fld qword ptr [0x968ea8]
        R.st[0] = R.st[0] - R.f64(((R.esp + 0x1c) | 0)); // 849afb: fsub qword ptr [esp + 0x1c]
        R.st[2] = R.st[2] * R.st[0]; R.fpop(); // 849aff: fmulp st(2)
        R.fpush(R.st[0]); // 849b01: fld st(0)
        R.st[0] = R.st[0] * R.f64(((R.esp + 0x1c) | 0)); // 849b03: fmul qword ptr [esp + 0x1c]
        R.st[2] = R.st[2] + R.st[0]; R.fpop(); // 849b07: faddp st(2)
        { const t = R.st[0]; R.st[0] = R.st[1]; R.st[1] = t; } // 849b09: fxch st(1)
        R.st[0] = R.st[0] * 0.05; // 849b0b: fmul qword ptr [0x967888]
        { const t = R.st[0]; R.st[0] = R.st[1]; R.st[1] = t; } // 849b11: fxch st(1)
        R.fpop(); // 849b13: fstp st(0)
        pc = 866; continue;
      case 866: // 849b15
        R.fcom(R.st[0], R.f64(((R.esp + 0x5c) | 0))); // 849b15: fcom qword ptr [esp + 0x5c]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 849b19: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 849b1b: test ah, 0x41
        if (!R.zf) { pc = 871; continue; } // 849b1e: jne 0x849b65
        pc = 867; continue;
      case 867: // 849b20
        R.fcom(R.st[0], 0.0); // 849b20: fcom qword ptr [0x9689a0]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 849b26: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 849b28: test ah, 0x41
        if (!R.zf) { pc = 871; continue; } // 849b2b: jne 0x849b65
        pc = 868; continue;
      case 868: // 849b2d
        R.st[0] = R.f64(((R.esp + 0x5c) | 0)) / R.st[0]; // 849b2d: fdivr qword ptr [esp + 0x5c]
        R.fcom(R.st[0], 0.7); // 849b31: fcom qword ptr [0x968e40]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 849b37: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 849b39: test ah, 1
        if (R.zf) { pc = 870; continue; } // 849b3c: je 0x849b5f
        pc = 869; continue;
      default: return pc;
    }
  }
}
function f_846920_94(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 869: // 849b3e
        R.fpop(); // 849b3e: fstp st(0)
        R.fpop(); // 849b40: fstp st(0)
        R.fpush(0.1); // 849b42: fld qword ptr [0x967880]
        R.ecx = (R.m.u32(((R.esp + 0xf0) | 0) >>> 0)) | 0; // 849b48: mov ecx, dword ptr [esp + 0xf0]
        /* fs */ // 849b4f: mov dword ptr fs:[0], ecx
        R.edi = (R.pop()) | 0; // 849b56: pop edi
        R.esi = (R.pop()) | 0; // 849b57: pop esi
        R.ebx = (R.pop()) | 0; // 849b58: pop ebx
        R.esp = ((R.ebp >>> 0)) | 0; // 849b59: mov esp, ebp
        R.ebp = (R.pop()) | 0; // 849b5b: pop ebp
        R.rv = R.st[0]; return -1; // 849b5c: ret 0x18
      case 870: // 849b5f
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 849b5f: fmulp st(1)
        R.fpush(R.f64(((R.esp + 0x5c) | 0))); // 849b61: fld qword ptr [esp + 0x5c]
        pc = 871; continue;
      case 871: // 849b65
        R.logic((R.ebx >>> 0) & (R.ebx >>> 0), 32); // 849b65: test ebx, ebx
        if (R.zf) { pc = 880; continue; } // 849b67: je 0x849bcb
        pc = 872; continue;
      case 872: // 849b69
        R.fpush(R.m.s32(((R.ebx + 0xc) | 0) >>> 0)); // 849b69: fild dword ptr [ebx + 0xc]
        R.fcom(R.st[0], 10.0); // 849b6c: fcom qword ptr [0x9688b0]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 849b72: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 849b74: test ah, 1
        if (R.zf) { pc = 874; continue; } // 849b77: je 0x849b81
        pc = 873; continue;
      case 873: // 849b79
        R.fpop(); // 849b79: fstp st(0)
        R.fpush(10.0); // 849b7b: fld qword ptr [0x9688b0]
        pc = 874; continue;
      case 874: // 849b81
        R.eax = (R.m.u32(((R.esp + 0x30) | 0) >>> 0)) | 0; // 849b81: mov eax, dword ptr [esp + 0x30]
        R.ecx = (R.m.u32(((R.ebp + 0xc) | 0) >>> 0)) | 0; // 849b85: mov ecx, dword ptr [ebp + 0xc]
        R.sub((R.eax >>> 0), (R.ecx >>> 0), 32); // 849b88: cmp eax, ecx
        if (!R.zf) { pc = 876; continue; } // 849b8a: jne 0x849b90
        pc = 875; continue;
      case 875: // 849b8c
        R.st[1] = R.st[0] / R.st[1]; R.fpop(); // 849b8c: fdivrp st(1)
        pc = 877; continue; // 849b8e: jmp 0x849b98
      case 876: // 849b90
        { const t = R.st[0]; R.st[0] = R.st[1]; R.st[1] = t; } // 849b90: fxch st(1)
        R.st[0] = R.st[0] / R.st[1]; // 849b92: fdiv st(1)
        { const t = R.st[0]; R.st[0] = R.st[1]; R.st[1] = t; } // 849b94: fxch st(1)
        R.fpop(); // 849b96: fstp st(0)
        pc = 877; continue;
      case 877: // 849b98
        R.fpush(0.1); // 849b98: fld qword ptr [0x967880]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 849b9e: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 849ba0: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x41, 8); // 849ba2: test ah, 0x41
        if (!R.zf) { pc = 881; continue; } // 849ba5: jne 0x849be4
        pc = 878; continue;
      case 878: // 849ba7
        R.fpop(); // 849ba7: fstp st(0)
        R.fpush(0.1); // 849ba9: fld qword ptr [0x967880]
        pc = 879; continue;
      default: return pc;
    }
  }
}
function f_846920_95(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 879: // 849baf
        R.fpush(20.0); // 849baf: fld qword ptr [0x968ea8]
        R.st[0] = R.st[0] - R.f64(((R.esp + 0x1c) | 0)); // 849bb5: fsub qword ptr [esp + 0x1c]
        R.st[0] = R.st[0] * R.st[1]; // 849bb9: fmul st(1)
        R.st[0] = R.st[0] + R.f64(((R.esp + 0x1c) | 0)); // 849bbb: fadd qword ptr [esp + 0x1c]
        R.st[0] = R.st[0] * 0.05; // 849bbf: fmul qword ptr [0x967888]
        R.st[0] = R.st[0] / R.f64(((R.esp + 0x34) | 0)); // 849bc5: fdiv qword ptr [esp + 0x34]
        R.st[2] = R.st[2] * R.st[0]; R.fpop(); // 849bc9: fmulp st(2)
        pc = 880; continue;
      case 880: // 849bcb
        R.fpop(); // 849bcb: fstp st(0)
        R.ecx = (R.m.u32(((R.esp + 0xf0) | 0) >>> 0)) | 0; // 849bcd: mov ecx, dword ptr [esp + 0xf0]
        /* fs */ // 849bd4: mov dword ptr fs:[0], ecx
        R.edi = (R.pop()) | 0; // 849bdb: pop edi
        R.esi = (R.pop()) | 0; // 849bdc: pop esi
        R.ebx = (R.pop()) | 0; // 849bdd: pop ebx
        R.esp = ((R.ebp >>> 0)) | 0; // 849bde: mov esp, ebp
        R.ebp = (R.pop()) | 0; // 849be0: pop ebp
        R.rv = R.st[0]; return -1; // 849be1: ret 0x18
      case 881: // 849be4
        R.fpush(10.0); // 849be4: fld qword ptr [0x9688b0]
        R.fcom(R.st[0], R.st[1]); R.fpop(); // 849bea: fcomp st(1)
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 849bec: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 849bee: test ah, 1
        if (R.zf) { pc = 883; continue; } // 849bf1: je 0x849c14
        pc = 882; continue;
      case 882: // 849bf3
        R.fpop(); // 849bf3: fstp st(0)
        R.fpush(10.0); // 849bf5: fld qword ptr [0x9688b0]
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 849bfb: fmulp st(1)
        R.ecx = (R.m.u32(((R.esp + 0xf0) | 0) >>> 0)) | 0; // 849bfd: mov ecx, dword ptr [esp + 0xf0]
        /* fs */ // 849c04: mov dword ptr fs:[0], ecx
        R.edi = (R.pop()) | 0; // 849c0b: pop edi
        R.esi = (R.pop()) | 0; // 849c0c: pop esi
        R.ebx = (R.pop()) | 0; // 849c0d: pop ebx
        R.esp = ((R.ebp >>> 0)) | 0; // 849c0e: mov esp, ebp
        R.ebp = (R.pop()) | 0; // 849c10: pop ebp
        R.rv = R.st[0]; return -1; // 849c11: ret 0x18
      case 883: // 849c14
        R.fcom(R.st[0], 1.0); // 849c14: fcom qword ptr [0x967890]
        R.eax = ((R.eax & 0xffff0000) | R.sw()) | 0; // 849c1a: fnstsw ax
        R.logic(((R.eax >>> 8) & 0xff) & 0x1, 8); // 849c1c: test ah, 1
        if (!R.zf) { pc = 879; continue; } // 849c1f: jne 0x849baf
        pc = 884; continue;
      case 884: // 849c21
        R.st[1] = R.st[1] * R.st[0]; R.fpop(); // 849c21: fmulp st(1)
        R.ecx = (R.m.u32(((R.esp + 0xf0) | 0) >>> 0)) | 0; // 849c23: mov ecx, dword ptr [esp + 0xf0]
        /* fs */ // 849c2a: mov dword ptr fs:[0], ecx
        R.edi = (R.pop()) | 0; // 849c31: pop edi
        R.esi = (R.pop()) | 0; // 849c32: pop esi
        R.ebx = (R.pop()) | 0; // 849c33: pop ebx
        R.esp = ((R.ebp >>> 0)) | 0; // 849c34: mov esp, ebp
        R.ebp = (R.pop()) | 0; // 849c36: pop ebp
        R.rv = R.st[0]; return -1; // 849c37: ret 0x18
      default: return pc;
    }
  }
}
function f_846920_96(R: X86, pc: number): number {
  for (;;) {
    if (TRACE.on) TRACE.f!(AD[pc], R);
    switch (pc) {
      case 885: // 849c3a
        R.fpush(R.f64(((R.esp + 0xc) | 0))); // 849c3a: fld qword ptr [esp + 0xc]
        R.ecx = (R.m.u32(((R.esp + 0xf0) | 0) >>> 0)) | 0; // 849c3e: mov ecx, dword ptr [esp + 0xf0]
        R.edi = (R.pop()) | 0; // 849c45: pop edi
        R.esi = (R.pop()) | 0; // 849c46: pop esi
        /* fs */ // 849c47: mov dword ptr fs:[0], ecx
        R.ebx = (R.pop()) | 0; // 849c4e: pop ebx
        R.esp = ((R.ebp >>> 0)) | 0; // 849c4f: mov esp, ebp
        R.ebp = (R.pop()) | 0; // 849c51: pop ebp
        R.rv = R.st[0]; return -1; // 849c52: ret 0x18
      default: return pc;
    }
  }
}
export function f_846920(c: CmCtx, ecx: number, args: number[]): number {
  const R = enter(c, ecx, args);
  let pc = 0;
  for (;;) {
    let np: number;
    if (pc < 0 || pc >= 886) throw new Error(`f_846920: ukendt adresse (spring nr. ${pc})`);
    switch (CH[pc]) {
      case 0: np = f_846920_0(R, pc); break;
      case 1: np = f_846920_1(R, pc); break;
      case 2: np = f_846920_2(R, pc); break;
      case 3: np = f_846920_3(R, pc); break;
      case 4: np = f_846920_4(R, pc); break;
      case 5: np = f_846920_5(R, pc); break;
      case 6: np = f_846920_6(R, pc); break;
      case 7: np = f_846920_7(R, pc); break;
      case 8: np = f_846920_8(R, pc); break;
      case 9: np = f_846920_9(R, pc); break;
      case 10: np = f_846920_10(R, pc); break;
      case 11: np = f_846920_11(R, pc); break;
      case 12: np = f_846920_12(R, pc); break;
      case 13: np = f_846920_13(R, pc); break;
      case 14: np = f_846920_14(R, pc); break;
      case 15: np = f_846920_15(R, pc); break;
      case 16: np = f_846920_16(R, pc); break;
      case 17: np = f_846920_17(R, pc); break;
      case 18: np = f_846920_18(R, pc); break;
      case 19: np = f_846920_19(R, pc); break;
      case 20: np = f_846920_20(R, pc); break;
      case 21: np = f_846920_21(R, pc); break;
      case 22: np = f_846920_22(R, pc); break;
      case 23: np = f_846920_23(R, pc); break;
      case 24: np = f_846920_24(R, pc); break;
      case 25: np = f_846920_25(R, pc); break;
      case 26: np = f_846920_26(R, pc); break;
      case 27: np = f_846920_27(R, pc); break;
      case 28: np = f_846920_28(R, pc); break;
      case 29: np = f_846920_29(R, pc); break;
      case 30: np = f_846920_30(R, pc); break;
      case 31: np = f_846920_31(R, pc); break;
      case 32: np = f_846920_32(R, pc); break;
      case 33: np = f_846920_33(R, pc); break;
      case 34: np = f_846920_34(R, pc); break;
      case 35: np = f_846920_35(R, pc); break;
      case 36: np = f_846920_36(R, pc); break;
      case 37: np = f_846920_37(R, pc); break;
      case 38: np = f_846920_38(R, pc); break;
      case 39: np = f_846920_39(R, pc); break;
      case 40: np = f_846920_40(R, pc); break;
      case 41: np = f_846920_41(R, pc); break;
      case 42: np = f_846920_42(R, pc); break;
      case 43: np = f_846920_43(R, pc); break;
      case 44: np = f_846920_44(R, pc); break;
      case 45: np = f_846920_45(R, pc); break;
      case 46: np = f_846920_46(R, pc); break;
      case 47: np = f_846920_47(R, pc); break;
      case 48: np = f_846920_48(R, pc); break;
      case 49: np = f_846920_49(R, pc); break;
      case 50: np = f_846920_50(R, pc); break;
      case 51: np = f_846920_51(R, pc); break;
      case 52: np = f_846920_52(R, pc); break;
      case 53: np = f_846920_53(R, pc); break;
      case 54: np = f_846920_54(R, pc); break;
      case 55: np = f_846920_55(R, pc); break;
      case 56: np = f_846920_56(R, pc); break;
      case 57: np = f_846920_57(R, pc); break;
      case 58: np = f_846920_58(R, pc); break;
      case 59: np = f_846920_59(R, pc); break;
      case 60: np = f_846920_60(R, pc); break;
      case 61: np = f_846920_61(R, pc); break;
      case 62: np = f_846920_62(R, pc); break;
      case 63: np = f_846920_63(R, pc); break;
      case 64: np = f_846920_64(R, pc); break;
      case 65: np = f_846920_65(R, pc); break;
      case 66: np = f_846920_66(R, pc); break;
      case 67: np = f_846920_67(R, pc); break;
      case 68: np = f_846920_68(R, pc); break;
      case 69: np = f_846920_69(R, pc); break;
      case 70: np = f_846920_70(R, pc); break;
      case 71: np = f_846920_71(R, pc); break;
      case 72: np = f_846920_72(R, pc); break;
      case 73: np = f_846920_73(R, pc); break;
      case 74: np = f_846920_74(R, pc); break;
      case 75: np = f_846920_75(R, pc); break;
      case 76: np = f_846920_76(R, pc); break;
      case 77: np = f_846920_77(R, pc); break;
      case 78: np = f_846920_78(R, pc); break;
      case 79: np = f_846920_79(R, pc); break;
      case 80: np = f_846920_80(R, pc); break;
      case 81: np = f_846920_81(R, pc); break;
      case 82: np = f_846920_82(R, pc); break;
      case 83: np = f_846920_83(R, pc); break;
      case 84: np = f_846920_84(R, pc); break;
      case 85: np = f_846920_85(R, pc); break;
      case 86: np = f_846920_86(R, pc); break;
      case 87: np = f_846920_87(R, pc); break;
      case 88: np = f_846920_88(R, pc); break;
      case 89: np = f_846920_89(R, pc); break;
      case 90: np = f_846920_90(R, pc); break;
      case 91: np = f_846920_91(R, pc); break;
      case 92: np = f_846920_92(R, pc); break;
      case 93: np = f_846920_93(R, pc); break;
      case 94: np = f_846920_94(R, pc); break;
      case 95: np = f_846920_95(R, pc); break;
      case 96: np = f_846920_96(R, pc); break;
      default: throw new Error(`f_846920: ukendt stykke`);
    }
    if (np === -1) return R.rv;
    if (CH[np] === CH[pc]) throw new Error(`f_846920: ukendt adresse ${AD[np].toString(16)}`);
    pc = np;
  }
}
f_846920.shared = false;
