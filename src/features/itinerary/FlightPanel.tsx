const flights = [
  { direction: '가는 편', date: '9월 9일 수요일', number: 'OM 310', from: 'ICN', fromCity: '서울 · 터미널 1', departure: '01:50', to: 'UBN', toCity: '울란바토르', arrival: '04:30', duration: '3시간 40분' },
  { direction: '오는 편', date: '9월 14일 월요일', number: 'OM 307', from: 'UBN', fromCity: '울란바토르', departure: '18:15', to: 'ICN', toCity: '서울 · 터미널 1', arrival: '22:25', duration: '3시간 10분' },
]

export function FlightPanel() {
  return <section className="flight-panel" aria-labelledby="flight-title">
    <div className="subheading"><div><span className="eyebrow">CONFIRMED FLIGHTS</span><h3 id="flight-title">항공편</h3><p>MIAT 몽골항공 · Economy Saver · 직항</p></div></div>
    <div className="flight-grid">{flights.map((flight) => <article key={flight.number}>
      <header><span>{flight.direction} · {flight.date}</span><strong>{flight.number}</strong><i>확정</i></header>
      <div className="flight-route"><div><strong>{flight.departure}</strong><b>{flight.from}</b><small>{flight.fromCity}</small></div><div className="flight-line"><span>직항</span><i /><small>{flight.duration}</small></div><div><strong>{flight.arrival}</strong><b>{flight.to}</b><small>{flight.toCity}</small></div></div>
    </article>)}</div>
  </section>
}
