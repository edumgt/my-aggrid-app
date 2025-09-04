import { useMemo, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry } from "ag-grid-community";
import { AllCommunityModule } from "ag-grid-community";
ModuleRegistry.registerModules([AllCommunityModule]);

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

function App() {
  const columnApiRef = useRef(null);

  // ✅ 컬럼 정의: 도시 + 1월~12월 + 합계
  const columnDefs = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => ({
      headerName: `${i + 1}월`,
      field: `${i + 1}월`,
      type: "numberColumn",
    }));

    return [
      { headerName: "도시", field: "도시", pinned: "left" },
      ...months,
      {
        headerName: "합계",
        field: "합계",
        pinned: "right",
        valueGetter: (params) => {
          let sum = 0;
          for (let i = 1; i <= 12; i++) {
            sum += params.data?.[`${i}월`] || 0;
          }
          return sum;
        },
        cellStyle: { fontWeight: "bold", backgroundColor: "#f0f8ff" },
      },
    ];
  }, []);

  const defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    movable: true,
  };

  // ✅ 50개 도시 + 임의 강우량 데이터 생성
  const rowData = useMemo(() => {
    const cities = [
      "서울", "뉴욕", "런던", "파리", "도쿄", "베를린", "시드니", "케이프타운", "리우데자네이루", "모스크바",
      "방콕", "델리", "베이징", "토론토", "로마", "이스탄불", "멕시코시티", "마드리드", "두바이", "싱가포르",
      "홍콩", "자카르타", "카이로", "부에노스아이레스", "나이로비", "암스테르담", "헬싱키", "오슬로", "스톡홀름", "코펜하겐",
      "프라하", "부다페스트", "바르샤바", "리마", "보고타", "카라치", "테헤란", "하노이", "마닐라", "카트만두",
      "헝가리", "베오그라드", "키예프", "타슈켄트", "알마티", "울란바토르", "호놀룰루", "샌프란시스코", "밴쿠버", "멜버른"
    ];

    return cities.map(city => {
      const monthly = {};
      for (let i = 1; i <= 12; i++) {
        monthly[`${i}월`] = Math.floor(Math.random() * 300); // 0~300mm
      }
      return { 도시: city, ...monthly };
    });
  }, []);

  // ✅ 하단 합계 row 데이터
  const pinnedBottomRowData = useMemo(() => {
    const totals = {};
    for (let i = 1; i <= 12; i++) {
      totals[`${i}월`] = rowData.reduce((sum, row) => sum + row[`${i}월`], 0);
    }
    totals["합계"] = Object.values(totals).reduce((a, b) => a + b, 0);
    totals["도시"] = "총합";
    return [totals];
  }, [rowData]);

  const onGridReady = (params) => {
    columnApiRef.current = params.columnApi;

    const savedState = localStorage.getItem("columnState");
    if (savedState) {
      params.columnApi.applyColumnState({
        state: JSON.parse(savedState),
        applyOrder: true,
      });
    }
  };

  const onColumnMoved = () => {
    if (columnApiRef.current) {
      const columnState = columnApiRef.current.getColumnState();
      if (columnState.length > 0) {
        localStorage.setItem("columnState", JSON.stringify(columnState));
      }
    }
  };

  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <h1 style={{ textAlign: "center" }}>🌧️ 도시별 월별 강우량 데이터 (AG Grid v34)</h1>
      <div
        className="ag-theme-alpine"
        style={{ height: 600, width: "90%", margin: "0 auto" }}
      >
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          theme="legacy"
          onGridReady={onGridReady}
          onColumnMoved={onColumnMoved}
          pinnedBottomRowData={pinnedBottomRowData}
        />
      </div>
    </div>
  );
}

export default App;
