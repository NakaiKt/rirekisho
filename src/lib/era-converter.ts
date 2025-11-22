// 和暦変換ユーティリティ

export interface EraDate {
  era: string;
  year: number;
  displayName: string;
}

// 元号の定義
const eras = [
  { name: "令和", startYear: 2019, startMonth: 5, startDay: 1 },
  { name: "平成", startYear: 1989, startMonth: 1, startDay: 8 },
  { name: "昭和", startYear: 1926, startMonth: 12, startDay: 25 },
  { name: "大正", startYear: 1912, startMonth: 7, startDay: 30 },
  { name: "明治", startYear: 1868, startMonth: 1, startDay: 1 },
];

export function convertToEra(year: number, month: number, day: number): EraDate | null {
  for (const era of eras) {
    const eraStart = new Date(era.startYear, era.startMonth - 1, era.startDay);
    const targetDate = new Date(year, month - 1, day);

    if (targetDate >= eraStart) {
      const eraYear = year - era.startYear + 1;
      const displayName = eraYear === 1 ? `${era.name}元年` : `${era.name}${eraYear}年`;
      return {
        era: era.name,
        year: eraYear,
        displayName,
      };
    }
  }
  return null;
}

// 学歴の自動計算
export interface SchoolSchedule {
  elementary: { entry: string; graduation: string };
  juniorHigh: { entry: string; graduation: string };
  high: { entry: string; graduation: string };
  university: { entry: string; graduation: string };
}

export function calculateSchoolSchedule(birthYear: number, birthMonth: number, birthDay: number): SchoolSchedule {
  // 小学校入学: 6歳の4月
  const elementaryEntry = birthMonth <= 4 ? birthYear + 6 : birthYear + 7;
  const elementaryGraduation = elementaryEntry + 6;

  // 中学校: 小学校卒業後
  const juniorHighEntry = elementaryGraduation;
  const juniorHighGraduation = juniorHighEntry + 3;

  // 高校: 中学校卒業後
  const highEntry = juniorHighGraduation;
  const highGraduation = highEntry + 3;

  // 大学: 高校卒業後
  const universityEntry = highGraduation;
  const universityGraduation = universityEntry + 4;

  return {
    elementary: {
      entry: `${elementaryEntry}年4月`,
      graduation: `${elementaryGraduation}年3月`,
    },
    juniorHigh: {
      entry: `${juniorHighEntry}年4月`,
      graduation: `${juniorHighGraduation}年3月`,
    },
    high: {
      entry: `${highEntry}年4月`,
      graduation: `${highGraduation}年3月`,
    },
    university: {
      entry: `${universityEntry}年4月`,
      graduation: `${universityGraduation}年3月`,
    },
  };
}
