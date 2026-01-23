//카카오 맵 불러오는 로더
import { useKakaoLoader } from "react-kakao-maps-sdk";

export const useKakaoMap = () => {
  const result = useKakaoLoader({
    appkey: import.meta.env.VITE_KAKAO_MAP_JS_KEY,
    libraries: ["services", "clusterer"],
  });

  return result;
};