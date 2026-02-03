import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from '@react-pdf/renderer';
import { ResumeFormData } from '@/lib/validation';
import { convertToEra } from '@/lib/era-converter';

// フォント登録
Font.register({
  family: 'NotoSansJP',
  src: '/fonts/NotoSansJP-Regular.ttf',
});

// スタイル定義
const styles = StyleSheet.create({
  page: {
    fontFamily: 'NotoSansJP',
    fontSize: 10,
    padding: 30,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 15,
    letterSpacing: 8,
  },
  dateText: {
    fontSize: 10,
    textAlign: 'right',
    marginBottom: 10,
  },
  // テーブルスタイル
  table: {
    display: 'flex',
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1.5,
    borderColor: '#000000',
    marginBottom: 15,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    borderBottomStyle: 'solid',
  },
  tableRowLast: {
    flexDirection: 'row',
  },
  tableHeader: {
    backgroundColor: '#f3f4f6',
    padding: 5,
    fontSize: 9,
    borderRightWidth: 1,
    borderRightColor: '#000000',
    borderRightStyle: 'solid',
  },
  tableCell: {
    padding: 6,
    fontSize: 10,
    borderRightWidth: 1,
    borderRightColor: '#000000',
    borderRightStyle: 'solid',
  },
  tableCellLast: {
    padding: 6,
    fontSize: 10,
  },
  // 基本情報用
  labelCell: {
    width: 70,
    backgroundColor: '#f3f4f6',
    padding: 5,
    fontSize: 9,
    borderRightWidth: 1,
    borderRightColor: '#000000',
  },
  valueCell: {
    flex: 1,
    padding: 6,
    fontSize: 10,
    borderRightWidth: 1,
    borderRightColor: '#000000',
  },
  valueCellLast: {
    flex: 1,
    padding: 6,
    fontSize: 10,
  },
  nameCell: {
    flex: 1,
    padding: 6,
    fontSize: 16,
    fontWeight: 'bold',
    borderRightWidth: 1,
    borderRightColor: '#000000',
  },
  // 写真セル
  photoCell: {
    width: 90,
    height: 120,
    borderLeftWidth: 1,
    borderLeftColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoImage: {
    width: 88,
    height: 118,
    objectFit: 'cover',
  },
  photoPlaceholder: {
    fontSize: 8,
    color: '#9ca3af',
  },
  // 学歴・職歴用
  historyYearCell: {
    width: 70,
    padding: 6,
    fontSize: 10,
    textAlign: 'center',
    borderRightWidth: 1,
    borderRightColor: '#000000',
  },
  historyMonthCell: {
    width: 40,
    padding: 6,
    fontSize: 10,
    textAlign: 'center',
    borderRightWidth: 1,
    borderRightColor: '#000000',
  },
  historyContentCell: {
    flex: 1,
    padding: 6,
    fontSize: 10,
  },
  sectionTitle: {
    textAlign: 'center',
    padding: 6,
    fontSize: 10,
  },
  // 志望動機・自己PR用
  textAreaCell: {
    flex: 1,
    padding: 8,
    fontSize: 10,
    lineHeight: 1.5,
  },
});

interface ResumePDFDocumentProps {
  data: ResumeFormData;
}

export const ResumePDFDocument: React.FC<ResumePDFDocumentProps> = ({ data }) => {
  // 生年月日パース
  const parseBirthDate = () => {
    if (!data.birthDate) return null;
    const [year, month, day] = data.birthDate.split('/').map(Number);
    if (!year || !month || !day) return null;
    return { year, month, day };
  };

  const parsedBirthDate = parseBirthDate();
  const birthEra = parsedBirthDate
    ? convertToEra(parsedBirthDate.year, parsedBirthDate.month, parsedBirthDate.day)
    : null;

  // 年齢計算
  const calculateAge = () => {
    if (!parsedBirthDate) return '';
    const today = new Date();
    const birthDate = new Date(
      parsedBirthDate.year,
      parsedBirthDate.month - 1,
      parsedBirthDate.day
    );
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // 現在の日付
  const today = new Date();
  const todayEra = convertToEra(today.getFullYear(), today.getMonth() + 1, today.getDate());

  // 学歴行データ
  const educationRows = (data.education ?? []).flatMap((edu) => {
    const rows: { id: string; year: string; month: string; text: string }[] = [];
    if (typeof edu.entryYear !== 'number' || typeof edu.entryMonth !== 'number') {
      return rows;
    }

    const entryEra = convertToEra(edu.entryYear, edu.entryMonth, 1);
    rows.push({
      id: `${edu.id}-entry`,
      year: entryEra?.displayName || String(edu.entryYear),
      month: String(edu.entryMonth),
      text: `${edu.schoolName} 入学`,
    });

    if (edu.status === 'enrolled') {
      rows.push({ id: `${edu.id}-status`, year: '', month: '', text: `${edu.schoolName} 在学中` });
    } else if (edu.status === 'on_leave') {
      rows.push({ id: `${edu.id}-status`, year: '', month: '', text: `${edu.schoolName} 休学中` });
    } else {
      const completionEra =
        edu.completionYear && edu.completionMonth
          ? convertToEra(edu.completionYear, edu.completionMonth, 1)
          : null;
      const statusLabel =
        edu.status === 'graduated' ? '卒業' : edu.status === 'withdrawn' ? '中退' : '修了';
      rows.push({
        id: `${edu.id}-complete`,
        year: completionEra?.displayName || String(edu.completionYear || ''),
        month: String(edu.completionMonth || ''),
        text: `${edu.schoolName} ${statusLabel}`,
      });
    }

    return rows;
  });

  // 職歴行データ
  const workHistoryRows = (data.workHistory ?? []).flatMap((work) => {
    const rows: { id: string; year: string; month: string; text: string }[] = [];
    if (typeof work.entryYear !== 'number' || typeof work.entryMonth !== 'number') {
      return rows;
    }

    const entryEra = convertToEra(work.entryYear, work.entryMonth, 1);
    rows.push({
      id: `${work.id}-entry`,
      year: entryEra?.displayName || String(work.entryYear),
      month: String(work.entryMonth),
      text: `${work.companyName} 入社`,
    });

    if (work.status === 'resigned') {
      const exitEra =
        work.exitYear && work.exitMonth ? convertToEra(work.exitYear, work.exitMonth, 1) : null;
      rows.push({
        id: `${work.id}-exit`,
        year: exitEra?.displayName || String(work.exitYear || ''),
        month: String(work.exitMonth || ''),
        text: `${work.companyName} 退社`,
      });
    } else {
      rows.push({
        id: `${work.id}-status`,
        year: '',
        month: '',
        text: `${work.companyName} 在職中`,
      });
    }

    return rows;
  });

  // 資格行データ
  const qualificationRows = (data.qualifications ?? []).map((qual) => {
    const qualEra =
      qual.year !== undefined && qual.month !== undefined
        ? convertToEra(qual.year, qual.month, 1)
        : undefined;
    return {
      id: qual.id,
      year: qualEra?.displayName || String(qual.year || ''),
      month: String(qual.month || ''),
      text: qual.name,
    };
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* タイトル */}
        <Text style={styles.title}>履 歴 書</Text>

        {/* 日付 */}
        <Text style={styles.dateText}>
          {todayEra?.displayName}
          {today.getMonth() + 1}月{today.getDate()}日 現在
        </Text>

        {/* 基本情報テーブル */}
        <View style={styles.table} wrap={false}>
          {/* 上部：左側に基本情報、右側に写真 */}
          <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#000000', borderBottomStyle: 'solid' }}>
            {/* 左側：ふりがな〜性別 */}
            <View style={{ flex: 1 }}>
              {/* ふりがな行 */}
              <View style={styles.tableRow}>
                <View style={styles.labelCell}>
                  <Text>ふりがな</Text>
                </View>
                <View style={styles.valueCellLast}>
                  <Text>{data.furigana}</Text>
                </View>
              </View>

              {/* 氏名行 */}
              <View style={styles.tableRow}>
                <View style={styles.labelCell}>
                  <Text>氏名</Text>
                </View>
                <View style={{ ...styles.valueCellLast, fontSize: 16 }}>
                  <Text>{data.name}</Text>
                </View>
              </View>

              {/* 生年月日行 */}
              <View style={styles.tableRow}>
                <View style={styles.labelCell}>
                  <Text>生年月日</Text>
                </View>
                <View style={styles.valueCellLast}>
                  <Text>
                    {parsedBirthDate && birthEra
                      ? `${birthEra.displayName}${parsedBirthDate.month}月${parsedBirthDate.day}日生（満${calculateAge()}歳）`
                      : ''}
                  </Text>
                </View>
              </View>

              {/* 性別行 */}
              <View style={styles.tableRowLast}>
                <View style={styles.labelCell}>
                  <Text>性別</Text>
                </View>
                <View style={styles.valueCellLast}>
                  <Text>{data.gender === 'male' ? '男' : data.gender === 'female' ? '女' : ''}</Text>
                </View>
              </View>
            </View>

            {/* 右側：写真 */}
            <View style={styles.photoCell}>
              {data.photo ? (
                // eslint-disable-next-line jsx-a11y/alt-text
                <Image src={data.photo} style={styles.photoImage} />
              ) : (
                <Text style={styles.photoPlaceholder}>写真</Text>
              )}
            </View>
          </View>

          {/* 住所（郵便番号） */}
          <View style={styles.tableRow}>
            <View style={{ ...styles.labelCell, height: 20 }}>
              <Text>現住所</Text>
            </View>
            <View style={{ ...styles.valueCellLast, flex: 4, backgroundColor: '#fafafa', padding: 3 }}>
              <Text style={{ fontSize: 9 }}>〒{data.postalCode || ''}</Text>
            </View>
          </View>

          {/* 住所（詳細） */}
          <View style={styles.tableRow}>
            <View style={styles.labelCell}>
              <Text></Text>
            </View>
            <View style={{ ...styles.valueCellLast, flex: 4 }}>
              <Text>
                {[data.prefecture, data.city, data.address, data.building].filter(Boolean).join(' ')}
              </Text>
            </View>
          </View>

          {/* 連絡先 */}
          <View style={styles.tableRowLast}>
            <View style={styles.labelCell}>
              <Text>電話番号</Text>
            </View>
            <View style={styles.valueCell}>
              <Text>{data.phone || ''}</Text>
            </View>
            <View style={{ ...styles.labelCell, width: 50 }}>
              <Text>メール</Text>
            </View>
            <View style={{ ...styles.valueCellLast, flex: 2 }}>
              <Text style={{ fontSize: 9 }}>{data.email || ''}</Text>
            </View>
          </View>
        </View>

        {/* 学歴・職歴テーブル */}
        {(educationRows.length > 0 || workHistoryRows.length > 0) && (
          <View style={styles.table} wrap={false}>
            {/* ヘッダー */}
            <View style={styles.tableRow}>
              <View style={{ ...styles.tableHeader, width: 70 }}>
                <Text style={{ textAlign: 'center' }}>年</Text>
              </View>
              <View style={{ ...styles.tableHeader, width: 40 }}>
                <Text style={{ textAlign: 'center' }}>月</Text>
              </View>
              <View style={{ ...styles.tableHeader, flex: 1, borderRightWidth: 0 }}>
                <Text style={{ textAlign: 'center' }}>学歴・職歴</Text>
              </View>
            </View>

            {/* 学歴 */}
            {educationRows.length > 0 && (
              <>
                <View style={styles.tableRow}>
                  <Text style={{ ...styles.sectionTitle, flex: 1 }}>学　歴</Text>
                </View>
                {educationRows.map((row, idx) => (
                  <View
                    key={row.id}
                    style={
                      idx === educationRows.length - 1 && workHistoryRows.length === 0
                        ? styles.tableRowLast
                        : styles.tableRow
                    }
                  >
                    <View style={styles.historyYearCell}>
                      <Text>{row.year}</Text>
                    </View>
                    <View style={styles.historyMonthCell}>
                      <Text>{row.month}</Text>
                    </View>
                    <View style={styles.historyContentCell}>
                      <Text>{row.text}</Text>
                    </View>
                  </View>
                ))}
              </>
            )}

            {/* 職歴 */}
            {workHistoryRows.length > 0 && (
              <>
                <View style={styles.tableRow}>
                  <Text style={{ ...styles.sectionTitle, flex: 1 }}>職　歴</Text>
                </View>
                {workHistoryRows.map((row, idx) => (
                  <View
                    key={row.id}
                    style={idx === workHistoryRows.length - 1 ? styles.tableRowLast : styles.tableRow}
                  >
                    <View style={styles.historyYearCell}>
                      <Text>{row.year}</Text>
                    </View>
                    <View style={styles.historyMonthCell}>
                      <Text>{row.month}</Text>
                    </View>
                    <View style={styles.historyContentCell}>
                      <Text>{row.text}</Text>
                    </View>
                  </View>
                ))}
              </>
            )}

            {/* 以上 */}
            <View style={styles.tableRowLast}>
              <View style={styles.historyYearCell}>
                <Text></Text>
              </View>
              <View style={styles.historyMonthCell}>
                <Text></Text>
              </View>
              <View style={styles.historyContentCell}>
                <Text style={{ textAlign: 'right' }}>以上</Text>
              </View>
            </View>
          </View>
        )}

        {/* 資格・免許 */}
        {qualificationRows.length > 0 && (
          <View style={styles.table} wrap={false}>
            <View style={styles.tableRow}>
              <View style={{ ...styles.tableHeader, width: 70 }}>
                <Text style={{ textAlign: 'center' }}>年</Text>
              </View>
              <View style={{ ...styles.tableHeader, width: 40 }}>
                <Text style={{ textAlign: 'center' }}>月</Text>
              </View>
              <View style={{ ...styles.tableHeader, flex: 1, borderRightWidth: 0 }}>
                <Text style={{ textAlign: 'center' }}>資格・免許</Text>
              </View>
            </View>
            {qualificationRows.map((row, idx) => (
              <View
                key={row.id}
                style={idx === qualificationRows.length - 1 ? styles.tableRowLast : styles.tableRow}
              >
                <View style={styles.historyYearCell}>
                  <Text>{row.year}</Text>
                </View>
                <View style={styles.historyMonthCell}>
                  <Text>{row.month}</Text>
                </View>
                <View style={styles.historyContentCell}>
                  <Text>{row.text}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* 志望動機・自己PR */}
        {(data.motivation || data.selfPR) && (
          <View style={styles.table} wrap={false}>
            {data.motivation && (
              <View style={data.selfPR ? styles.tableRow : styles.tableRowLast}>
                <View style={{ ...styles.labelCell, width: 80 }}>
                  <Text>志望動機</Text>
                </View>
                <View style={styles.textAreaCell}>
                  <Text>{data.motivation}</Text>
                </View>
              </View>
            )}
            {data.selfPR && (
              <View style={styles.tableRowLast}>
                <View style={{ ...styles.labelCell, width: 80 }}>
                  <Text>自己PR</Text>
                </View>
                <View style={styles.textAreaCell}>
                  <Text>{data.selfPR}</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* 本人希望欄 */}
        {data.remarks && (
          <View style={styles.table} wrap={false}>
            <View style={styles.tableRowLast}>
              <View style={{ ...styles.labelCell, width: 80 }}>
                <Text>本人希望欄</Text>
              </View>
              <View style={styles.textAreaCell}>
                <Text>{data.remarks}</Text>
              </View>
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
};
