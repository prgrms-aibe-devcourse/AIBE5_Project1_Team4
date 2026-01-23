import TripFilterPanel from '../../components/TripFilterPanel';
import { useState } from 'react';

export default function TripFilterPanelPreview() {
  // 프리뷰에서 작동을 확인하기 위한 임시 상태값들
  const [region, setRegion] = useState("전체");
  const [theme, setTheme] = useState("미식");
  const [date, setDate] = useState("전체");

  return (
    <div className="p-5 bg-dark" style={{ minHeight: '100vh' }}>
      <h2 className="text-white mb-4">Filter Panel Preview (T-4012~4014)</h2>
      
      {/* 마스터가 만든 컴포넌트 호출 */}
      <TripFilterPanel 
        selectedRegion={region}
        onRegionChange={setRegion}
        selectedTheme={theme}
        onThemeChange={setTheme}
        dateFilter={date}
        onDateChange={setDate}
      />

      {/* 상태 변화 확인용 디버깅 텍스트 */}
      <div className="mt-4 text-white-50 small">
        <p>현재 선택된 지역: {region}</p>
        <p>현재 선택된 테마: {theme}</p>
        <p>현재 선택된 기간: {date}</p>
      </div>
    </div>
  );
}