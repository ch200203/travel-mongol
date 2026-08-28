import { afterEach, describe, expect, it, vi } from 'vitest'
import { buildNightSky, clearestRun, fetchNightSkies, gradeFor, nightHourKeys, nightNote, scoreNight } from './stargazing'
import { buildSkySchedule, type SkyDay } from './astronomy'

const hoursOf = (...values: number[]) => values.map((cloudCover, index) => ({ hour: (21 + index) % 24, cloudCover }))

describe('stargazing score', () => {
  it('구름이 없고 달이 없으면 만점이다', () => {
    expect(scoreNight(0, 0)).toBe(100)
  })

  it('보름달은 맑아도 만점을 주지 않는다', () => {
    expect(scoreNight(0, 1)).toBe(50)
    expect(gradeFor(scoreNight(0, 1))).toBe('보통')
  })

  it('구름이 많으면 달이 없어도 나쁨이다', () => {
    expect(gradeFor(scoreNight(80, 0))).toBe('나쁨')
  })

  it('점수는 0~100을 벗어나지 않는다', () => {
    expect(scoreNight(100, 1)).toBe(0)
    expect(scoreNight(-20, 0)).toBe(100)
  })

  it('등급 경계를 지킨다', () => {
    expect(gradeFor(75)).toBe('아주 좋음')
    expect(gradeFor(74)).toBe('좋음')
    expect(gradeFor(55)).toBe('좋음')
    expect(gradeFor(54)).toBe('보통')
    expect(gradeFor(35)).toBe('보통')
    expect(gradeFor(34)).toBe('나쁨')
  })
})

describe('night hours', () => {
  it('박명 창에 완전히 들어오는 정시만 자정을 넘겨 모은다', () => {
    expect(nightHourKeys('2026-09-11', '20:47', '05:12')).toEqual([
      '2026-09-11T21:00', '2026-09-11T22:00', '2026-09-11T23:00',
      '2026-09-12T00:00', '2026-09-12T01:00', '2026-09-12T02:00', '2026-09-12T03:00', '2026-09-12T04:00', '2026-09-12T05:00',
    ])
  })

  it('월말에도 다음 달로 넘어간다', () => {
    expect(nightHourKeys('2026-09-30', '21:00', '01:30')[3]).toBe('2026-10-01T00:00')
  })

  it('가장 길게 맑은 구간을 찾는다', () => {
    expect(clearestRun(hoursOf(10, 80, 5, 5, 5, 90))).toEqual({ from: 23, to: 1 })
  })

  it('맑은 구간이 없으면 null이다', () => {
    expect(clearestRun(hoursOf(90, 80, 70))).toBeNull()
  })

  it('구름 낀 밤에는 맑은 시간대를 알려준다', () => {
    expect(nightNote(hoursOf(90, 90, 10, 10, 90), 58)).toBe('23시–0시가 가장 맑아요.')
    expect(nightNote(hoursOf(5, 5, 5), 5)).toBe('밤새 맑을 것으로 보여요.')
    expect(nightNote(hoursOf(95, 95), 95)).toBe('구름이 많아 별을 보기 어려울 수 있어요.')
  })
})

describe('buildNightSky', () => {
  const sky: SkyDay = {
    day: 1, date: '2026-09-11', location: '홍고린엘스', sunrise: '06:00', sunset: '19:00',
    dusk: '20:47', dawn: '05:12', starWindow: '20:47–05:12',
    moonIllumination: 0, moonLabel: '삭 무렵', viewingNote: '',
  }

  it('창 안의 시간만 평균 낸다', () => {
    const hourly = new Map([
      ['2026-09-11T20:00', 100], // 창 밖이라 무시
      ['2026-09-11T21:00', 10], ['2026-09-11T22:00', 20], ['2026-09-12T00:00', 30],
    ])
    const night = buildNightSky(sky, hourly)
    expect(night?.cloudCover).toBe(20)
    expect(night?.hours.map((entry) => entry.hour)).toEqual([21, 22, 0])
    expect(night?.grade).toBe('아주 좋음')
  })

  it('예보 범위 밖이면 null을 돌려준다', () => {
    expect(buildNightSky(sky, new Map())).toBeNull()
  })
})

describe('fetchNightSkies', () => {
  afterEach(() => { vi.unstubAllGlobals() })

  it('범위 안 일차만 돌려주고 나머지는 건너뛴다', async () => {
    const schedule = buildSkySchedule('2026-09-09')
    const first = schedule[0]
    const payload = schedule.map((sky, index) => index > 0 ? { hourly: { time: [], cloud_cover: [] } } : {
      hourly: {
        time: nightHourKeys(first.date, first.dusk, first.dawn),
        cloud_cover: nightHourKeys(first.date, first.dusk, first.dawn).map(() => 8),
      },
    })
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => payload })
    vi.stubGlobal('fetch', fetchMock)

    const nights = await fetchNightSkies(schedule)
    expect(nights.map((night) => night.day)).toEqual([1])
    expect(nights[0].cloudCover).toBe(8)
    const url = new URL(fetchMock.mock.calls[0][0] as string)
    expect(url.searchParams.get('hourly')).toBe('cloud_cover')
    expect(url.searchParams.get('timezone')).toBe('Asia/Ulaanbaatar')
  })

  it('응답이 실패하면 알린다', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))
    await expect(fetchNightSkies(buildSkySchedule('2026-09-09'))).rejects.toThrow('구름 예보를 불러오지 못했습니다.')
  })
})
