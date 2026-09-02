import airportMeetingImage from '../../../docs/탐앤탐스.jpg'
import { dayGuides, hasUtilityLimit } from '../itinerary/dayGuide'

/**
 * 여나투어가 보낸 안전 수칙 원문을 항목별로 정리했다.
 * 이번 고비+테를지 일정에 없는 항목(모터보트 탑승)은 혼선을 줄이려고 제외했다.
 */
const safetyGroups = [
  {
    title: '승마 · 낙타 체험',
    rules: [
      '두 체험 모두 선택 사항이며, 참여하지 않으면 1인 2만원을 환불받을 수 있어요.',
      '낙마 사고를 막기 위해 반드시 걷는 속도로만 진행해주세요.',
      '타고 내리는 과정에서 발목을 삐거나 넘어지는 경우가 많으니 특히 주의해주세요.',
      '가이드와 현지 마부의 안내를 따라 안전하게 체험해주세요.',
    ],
  },
  {
    title: '모래썰매',
    rules: [
      '모래와의 마찰로 팔·다리가 쓸릴 수 있어요. 긴 바지를 입고 맨다리 노출은 피해주세요.',
      '속도를 내려고 무리하게 자세를 바꾸지 마세요.',
    ],
  },
  {
    title: '은하수 · 별 관측',
    rules: [
      '별도 프로그램이 아니라 게르 주변에서 자연스럽게 별을 감상하는 시간이에요.',
      '밤에는 주변이 매우 어두우니 휴대폰 조명이나 손전등을 사용해주세요.',
      '혼자 멀리 이동하지 말아주세요.',
    ],
  },
  {
    title: '차량 이동',
    rules: [
      '탑승 시에는 반드시 안전벨트를 착용해주세요.',
      '비포장도로가 많아 흔들림이 큰 편이라 이동 중에는 가능한 자리를 옮기지 않아요.',
      '창문 밖으로 손이나 몸을 내밀지 마세요.',
    ],
  },
  {
    title: '절벽 및 전망 포인트',
    rules: [
      '사진 촬영을 위해 절벽 끝으로 무리하게 접근하지 마세요.',
      '차강소브라가는 미끄러운 구간이 있어 더욱 주의가 필요해요.',
      '안전선과 가이드의 안내 범위를 벗어나지 말아주세요.',
    ],
  },
  {
    title: '신발과 복장',
    rules: [
      '관광지에서는 슬리퍼 착용을 권장하지 않아요.',
      '바위길·모래길·비포장도로가 많아 운동화나 발목을 잡아주는 신발이 좋아요.',
      '일교차가 매우 크니 얇은 겉옷을 꼭 준비해주세요.',
      '강한 바람이 부는 날에는 모자나 소지품이 날아가지 않도록 주의해주세요.',
    ],
  },
  {
    title: '건강과 응급상황',
    rules: [
      '고비사막은 매우 건조해요. 물을 자주 마시고 립밤·보습제·선크림을 사용해주세요.',
      '평소 복용 중인 약이 있다면 반드시 개인적으로 지참해주세요.',
      '몸이 불편하거나 다쳤다면 참지 말고 즉시 가이드에게 말씀해주세요. 작은 증상이라도 초기 대처가 가장 중요해요.',
    ],
  },
  {
    title: '숙소에서의 소지품',
    rules: [
      '여권·지갑·휴대폰 등 귀중품은 항상 직접 소지해주세요.',
      '개인 소지품 분실과 도난에 각별히 유의해주세요.',
      '밤늦은 시간에는 혼자 숙소 밖을 다니지 말고, 이동이 필요하면 가이드에게 말씀해주세요.',
    ],
  },
]

const packingEssentials = ['여권', '여행자보험', '운동화', '슬리퍼', '선글라스·모자', '상비약', '얇은 외투', '긴 바지', '선크림·보습제', '개인 세면도구', '수건', '보조배터리', '손전등']

const notionGuideUrl = 'https://www.notion.so/c50e7b8eb90842128bf367bec9b8f696'

/** 일차별 숙소의 전기·샤워 운영 시간. 일정 데이터를 그대로 읽어 두 화면이 어긋나지 않게 한다. */
const campUtilities = dayGuides.flatMap((guide) => guide.lodging ? [{ day: guide.day, destination: guide.destination, lodging: guide.lodging }] : [])

export function GuidePage() {
  return <section>
    <div className="section-heading"><div><span className="eyebrow">BEFORE YOU GO</span><h2>별고비팀 여행 안내</h2><p>출발 전과 현지에서 빠르게 확인할 핵심 안내를 모았어요.</p></div><span className="guide-updated">9월 2일 기준</span></div>

    <div className="guide-alert" role="note">
      <strong>출발 전 필수 확인</strong>
      <ul><li>노션 여행 안내 정독</li><li>투어 계약서·면책동의서 확인</li><li>여행자보험 가입</li><li>현지 지불 금액은 원화 현금으로 준비</li><li>첫날 아침 식사는 개별 준비</li></ul>
      <div className="guide-links"><a href={notionGuideUrl} target="_blank" rel="noreferrer">여나투어 출발 전 안내 (노션) ↗</a></div>
    </div>

    <div className="guide-contact-grid">
      <article><span>현지 투어 연락</span><strong>고비썬트래블</strong><p>카카오톡 ID <b>GobiSuntravel</b><br />대소문자를 구분해 검색해주세요.</p></article>
      <article><span>영사안전콜센터 · 24시간</span><strong><a href="tel:+82232100404">+82-2-3210-0404</a></strong><p>주몽골 대한민국 대사관 업무시간 외 긴급전화 <a href="tel:+97699114119">+976-9911-4119</a></p></article>
    </div>

    <div className="guide-sections">
      <details open><summary><span>01</span>입국과 공항 미팅</summary><div className="guide-detail">
        <ul><li>입국심사는 <b>Foreign Passport</b> 라인으로 이동하고 방문 목적은 <b>Tour / Travel</b>로 답하면 됩니다.</li><li>수하물 수령과 세관 통과 후 입국장으로 이동하세요.</li><li>종이 입국신고서를 받으면 국적 KOREA, 목적 TOUR/TRAVEL, 숙소 HOTEL로 적을 수 있어요.</li></ul>
        <div className="guide-callout"><b>9월 9일 05:00</b><p>울란바토르 국제공항 게이트 옆 <b>탐앤탐스 카페 앞</b>에서 현지 매니저 또는 가이드·기사님이 피켓을 들고 기다려요.</p></div>
        <figure className="meeting-location-photo">
          <a href={airportMeetingImage} target="_blank" rel="noreferrer" aria-label="공항 미팅 장소 사진 크게 보기">
            <img src={airportMeetingImage} alt="울란바토르 국제공항 국제선 도착장 옆 탐앤탐스 카페 미팅 장소" />
          </a>
          <figcaption><b>미팅 장소 사진</b><span>국제선 도착장 옆의 큰 <b>TOM N TOMS COFFEE</b> 간판을 찾아주세요. 사진을 누르면 크게 볼 수 있어요.</span></figcaption>
        </figure>
        <p className="guide-muted">비행기가 연착되거나 서로 만나지 못하면 당황하지 말고 <b>현지 매니저 연락처</b>로 바로 연락하세요. 연락처는 출발 전 여나투어에서 별도로 안내합니다.</p>
        <p className="guide-muted">첫날 아침은 불포함입니다. 입국장 밖 탐앤탐스와 24시간 편의점에서 물·커피·빵·컵라면 등 간단한 식사를 준비할 수 있어요.</p>
      </div></details>

      <details><summary><span>02</span>현지 결제와 환전</summary><div className="guide-detail">
        <ul><li>현지 잔금과 확정된 숙소 추가금은 최종 안내 금액을 확인해 <b>원화 현금</b>으로 준비하세요.</li><li>수표와 계좌이체는 사용할 수 없고, 현장에서 생기는 추가금은 원화 또는 투그릭으로 결제할 수 있어요.</li><li>시내 식당·마트·호텔은 카드 결제가 가능한 곳이 많지만 작은 상점과 플리마켓용 투그릭을 조금 준비하면 편해요.</li><li>낙타 인형 등 기념품은 환율과 거스름돈 문제를 줄이기 위해 투그릭 결제를 권장해요.</li><li>승마·낙타 체험에 참여하지 않으면 1인 2만원을 환불받을 수 있어요.</li><li>개인 경비는 하루 약 1만원을 기준으로 준비하고 공동 간식·주류 비용은 별도 공금으로 관리하는 것을 권장해요.</li><li>가이드·드라이버 매너팁은 필수가 아니며 서비스 만족도에 따라 자율적으로 결정하면 됩니다.</li></ul>
      </div></details>

      <details><summary><span>03</span>숙소 전기와 샤워 시간</summary><div className="guide-detail">
        <div className="camp-compare"><div><b>여행자 캠프</b><p>샤워실·화장실 외부 공용</p></div><div><b>고급 캠프</b><p>샤워실·화장실 객실 내부 개별 이용</p></div></div>
        <ul className="camp-utility-list">{campUtilities.map((guide) => <li className={hasUtilityLimit(guide.lodging) ? 'limited' : ''} key={guide.day}>
          <b>Day {guide.day} · {guide.destination}</b>
          <span>{guide.lodging.name}</span>
          <p>🔌 전기 {guide.lodging.utilities.power} · 🚿 샤워 {guide.lodging.utilities.shower}</p>
        </li>)}</ul>
        <ul><li>전기가 <b>23:00까지</b>인 홍고린엘스에서는 밤에 충전이 끊기니 보조배터리를 미리 채워두세요.</li><li>샤워 가능 시간이 정해진 날은 저녁 식사 전후로 시간을 나눠 쓰는 편이 좋아요.</li><li>수건과 세면도구가 제공되지 않으므로 반드시 챙겨주세요.</li><li>남녀 또는 일행별 분리를 원하면 사전 요청 시 최대 게르 2개까지 이용할 수 있으나 성수기에는 확보가 어려울 수 있어요.</li><li>온수는 사용량에 따라 부족할 수 있어요.</li><li>게르 난로는 화상 위험이 있으니 직접 만지지 말고 가이드에게 요청하세요.</li><li>정전·단수·온수 문제가 생기면 바로 가이드에게 알려주세요.</li></ul>
      </div></details>

      <details><summary><span>04</span>액티비티와 안전</summary><div className="guide-detail">
        {safetyGroups.map((group) => <div className="safety-group" key={group.title}><h4>{group.title}</h4><ul>{group.rules.map((rule) => <li key={rule}>{rule}</li>)}</ul></div>)}
        <p className="guide-muted">위 내용은 함께 여행하는 팀원 모두가 확인해야 해요. 갑작스러운 비나 강풍 등 기상 상황에 따라 일정이 일부 변경될 수 있습니다.</p>
      </div></details>

      <details><summary><span>05</span>짐과 무료 제공 물품</summary><div className="guide-detail">
        <div className="packing-tags">{packingEssentials.map((item) => <span key={item}>✓ {item}</span>)}</div>
        <ul><li>일교차가 커서 반팔·긴팔·얇은 외투를 함께 준비하세요.</li><li>차량 적재 공간을 고려해 가능하면 24인치 이하 캐리어를 권장해요.</li><li>식수 무제한, 전통 망토 3개, 에어베드 3개, 라면용 버너·냄비가 제공돼요.</li><li>장거리 이동 중 들을 음악은 미리 내려받아 두면 좋아요.</li></ul>
      </div></details>

      <details><summary><span>06</span>식사와 마지막 날 점심</summary><div className="guide-detail">
        <p>조식은 가이드가 준비하는 식사 대신 숙소 식당에서 제공되는 캠프식으로 변경할 수 있어요. 변경을 원하면 상담 시 미리 말씀해주세요.</p>
        <p>마지막 날 점심은 기본 현지 식당을 이용하거나 샤브샤브로 업그레이드할 수 있어요. 업그레이드는 총 식사비의 50%를 여행자가 부담하며 메뉴에 따라 1인 약 2~3만원이 예상돼요.</p>
        <div className="guide-links"><a href="https://maps.app.goo.gl/xfTUFPVipBzsBh5D9?g_st=akt" target="_blank" rel="noreferrer">기본 현지 식당 지도 ↗</a><a href="https://maps.app.goo.gl/1Rvi6XKooiWbH3HNA?g_st=akt" target="_blank" rel="noreferrer">샤브샤브 식당 지도 ↗</a></div>
      </div></details>

      <details><summary><span>07</span>일정 변동과 차량</summary><div className="guide-detail">
        <ul><li>현지 기상·도로·운영 상황과 항공편 시간에 따라 세부 일정이 유동적으로 조정될 수 있어요.</li><li>비포장도로 장거리 운행 중 차량 문제가 발생하면 현지에서 수리 또는 교체 후 일정을 이어갈 수 있어요.</li><li>캠프파이어는 강풍 등 기상 상황에 따라 안전을 위해 취소될 수 있어요.</li><li>항공편이 다른 팀원의 추가 공항 샌딩 차량은 별도 비용이 발생할 수 있으므로 현지 가이드와 미리 확인하세요.</li></ul>
      </div></details>
    </div>

    <p className="guide-footer">이 페이지는 여나투어 안내사항을 별고비팀용으로 요약한 참고 자료입니다. 계약·안전 관련 상세 내용과 최종 금액은 출발 전 전달받은 <a href={notionGuideUrl} target="_blank" rel="noreferrer">노션 원문</a>을 다시 확인해주세요.</p>
  </section>
}
