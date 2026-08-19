import airportMeetingImage from '../../../docs/탐앤탐스.jpg'

const safetyRules = [
  '승마·낙타 체험은 걷는 속도로 진행하고 가이드와 현지 마부의 안내를 따라주세요.',
  '체험 중 휴대폰 사용은 피하고, 소지품은 탑승 전에 안전하게 보관해주세요.',
  '모래썰매는 피부가 쓸릴 수 있으므로 긴 바지를 착용하고 무리하게 속도를 내지 마세요.',
  '비포장도로 이동 중에는 안전벨트를 착용하고 차량 안에서 이동하지 마세요.',
  '차강소브라가 절벽 끝이나 안전선 밖으로 접근하지 마세요.',
  '밤에는 손전등을 사용하고 혼자 숙소에서 멀리 이동하지 마세요.',
]

const packingEssentials = ['여권', '여행자보험', '운동화', '슬리퍼', '선글라스·모자', '상비약', '얇은 외투', '선크림·보습제', '개인 세면도구', '수건', '보조배터리']

export function GuidePage() {
  return <section>
    <div className="section-heading"><div><span className="eyebrow">BEFORE YOU GO</span><h2>별고비팀 여행 안내</h2><p>출발 전과 현지에서 빠르게 확인할 핵심 안내를 모았어요.</p></div><span className="guide-updated">8월 19일 기준</span></div>

    <div className="guide-alert" role="note">
      <strong>출발 전 필수 확인</strong>
      <ul><li>여행자보험 가입</li><li>투어 계약서·면책동의서 확인</li><li>현지 지불 금액은 원화 현금으로 준비</li><li>첫날 아침 식사는 개별 준비</li></ul>
    </div>

    <div className="guide-contact-grid">
      <article><span>현지 투어 연락</span><strong>고비썬트래블</strong><p>카카오톡 ID <b>GobiSuntravel</b><br />대소문자를 구분해 검색해주세요.</p></article>
      <article><span>영사안전콜센터 · 24시간</span><strong><a href="tel:+82232100404">+82-2-3210-0404</a></strong><p>주몽골 대한민국 대사관 업무시간 외 긴급전화 <a href="tel:+97699114119">+976-9911-4119</a></p></article>
    </div>

    <div className="guide-sections">
      <details open><summary><span>01</span>입국과 공항 미팅</summary><div className="guide-detail">
        <ul><li>입국심사는 <b>Foreign Passport</b> 라인으로 이동하고 방문 목적은 <b>Tour / Travel</b>로 답하면 됩니다.</li><li>수하물 수령과 세관 통과 후 입국장으로 이동하세요.</li><li>종이 입국신고서를 받으면 국적 KOREA, 목적 TOUR/TRAVEL, 숙소 HOTEL로 적을 수 있어요.</li></ul>
        <div className="guide-callout"><b>9월 9일 05:00</b><p>울란바토르 국제공항 내 <b>탐앤탐스 카페 앞</b>에서 여나투어 피켓을 든 가이드와 만나요.</p></div>
        <figure className="meeting-location-photo">
          <a href={airportMeetingImage} target="_blank" rel="noreferrer" aria-label="공항 미팅 장소 사진 크게 보기">
            <img src={airportMeetingImage} alt="울란바토르 국제공항 국제선 도착장 옆 탐앤탐스 카페 미팅 장소" />
          </a>
          <figcaption><b>미팅 장소 사진</b><span>국제선 도착장 옆의 큰 <b>TOM N TOMS COFFEE</b> 간판을 찾아주세요. 사진을 누르면 크게 볼 수 있어요.</span></figcaption>
        </figure>
        <p className="guide-muted">첫날 아침은 불포함입니다. 입국장 밖 탐앤탐스와 24시간 편의점에서 물·커피·빵·컵라면 등 간단한 식사를 준비할 수 있어요.</p>
      </div></details>

      <details><summary><span>02</span>현지 결제와 환전</summary><div className="guide-detail">
        <ul><li>현지 잔금과 확정된 숙소 추가금은 최종 안내 금액을 확인해 <b>원화 현금</b>으로 준비하세요.</li><li>수표와 계좌이체는 사용할 수 없고, 현장에서 생기는 추가금은 원화 또는 투그릭으로 결제할 수 있어요.</li><li>시내 식당·마트·호텔은 카드 결제가 가능한 곳이 많지만 작은 상점과 플리마켓용 투그릭을 조금 준비하면 편해요.</li><li>낙타 인형 등 기념품은 환율과 거스름돈 문제를 줄이기 위해 투그릭 결제를 권장해요.</li><li>개인 경비는 하루 약 1만원을 기준으로 준비하고 공동 간식·주류 비용은 별도 공금으로 관리하는 것을 권장해요.</li><li>가이드·드라이버 매너팁은 필수가 아니며 서비스 만족도에 따라 자율적으로 결정하면 됩니다.</li></ul>
      </div></details>

      <details><summary><span>03</span>숙소 이용</summary><div className="guide-detail">
        <div className="camp-compare"><div><b>여행자 캠프</b><p>샤워실·화장실 외부 공용</p></div><div><b>고급 캠프</b><p>샤워실·화장실 객실 내부 개별 이용</p></div></div>
        <ul><li>수건과 세면도구가 제공되지 않으므로 반드시 챙겨주세요.</li><li>남녀 또는 일행별 분리를 원하면 사전 요청 시 최대 게르 2개까지 이용할 수 있으나 성수기에는 확보가 어려울 수 있어요.</li><li>온수는 사용량에 따라 부족할 수 있고, 전기 공급 시간이나 객실 내 콘센트가 제한될 수 있어요.</li><li>게르 난로는 화상 위험이 있으니 직접 만지지 말고 가이드에게 요청하세요.</li><li>여권·지갑·휴대폰 등 귀중품은 직접 소지하고, 정전·단수·온수 문제가 생기면 바로 가이드에게 알려주세요.</li></ul>
      </div></details>

      <details><summary><span>04</span>액티비티와 안전</summary><div className="guide-detail"><ul>{safetyRules.map((rule) => <li key={rule}>{rule}</li>)}</ul><p className="guide-muted">은하수 헌팅은 별도 이동 프로그램이 아니라 숙소 주변에서 자유롭게 감상하는 일정이며 날씨와 달빛에 따라 관측이 어려울 수 있어요. 몸이 불편하거나 다치면 작은 증상이라도 즉시 가이드에게 알려주세요.</p></div></details>

      <details><summary><span>05</span>짐과 무료 제공 물품</summary><div className="guide-detail">
        <div className="packing-tags">{packingEssentials.map((item) => <span key={item}>✓ {item}</span>)}</div>
        <ul><li>일교차가 커서 반팔·긴팔·얇은 외투를 함께 준비하세요.</li><li>차량 적재 공간을 고려해 가능하면 24인치 이하 캐리어를 권장해요.</li><li>식수 무제한, 전통 망토 3개, 에어베드 3개, 라면용 버너·냄비가 제공돼요.</li><li>장거리 이동 중 들을 음악은 미리 내려받아 두면 좋아요.</li></ul>
      </div></details>

      <details><summary><span>06</span>마지막 날 점심</summary><div className="guide-detail">
        <p>기본 현지 식당을 이용하거나 샤브샤브로 업그레이드할 수 있어요. 업그레이드는 총 식사비의 50%를 여행자가 부담하며 메뉴에 따라 1인 약 2~3만원이 예상돼요.</p>
        <div className="guide-links"><a href="https://maps.app.goo.gl/xfTUFPVipBzsBh5D9?g_st=akt" target="_blank" rel="noreferrer">기본 현지 식당 지도 ↗</a><a href="https://maps.app.goo.gl/1Rvi6XKooiWbH3HNA?g_st=akt" target="_blank" rel="noreferrer">샤브샤브 식당 지도 ↗</a></div>
      </div></details>

      <details><summary><span>07</span>일정 변동과 차량</summary><div className="guide-detail">
        <ul><li>오지의 도로·날씨·현지 운영 상황에 따라 이동 시간, 식사 시간과 방문 순서가 달라질 수 있어요.</li><li>비포장도로 장거리 운행 중 차량 문제가 발생하면 현지에서 수리 또는 교체 후 일정을 이어갈 수 있어요.</li><li>캠프파이어는 강풍 등 기상 상황에 따라 안전을 위해 취소될 수 있어요.</li><li>항공편이 다른 팀원의 추가 공항 샌딩 차량은 별도 비용이 발생할 수 있으므로 현지 가이드와 미리 확인하세요.</li></ul>
      </div></details>
    </div>

    <p className="guide-footer">이 페이지는 여나투어 안내사항을 별고비팀용으로 요약한 참고 자료입니다. 계약·안전 관련 상세 내용과 최종 금액은 출발 전 전달받은 원문을 다시 확인해주세요.</p>
  </section>
}
