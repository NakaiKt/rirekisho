import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';
import { CareerFormData } from '@/lib/validation';
import { convertToEra } from '@/lib/era-converter';

// フォント登録
Font.register({
  family: 'NotoSansJP',
  src: '/fonts/NotoSansJP-Regular.ttf',
});

const employmentTypeLabels: Record<string, string> = {
  fullTime: '正社員',
  contract: '契約社員',
  partTime: 'アルバイト・パート',
  dispatch: '派遣',
};

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
    letterSpacing: 4,
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
  // セクションヘッダー
  sectionHeader: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1.5,
    borderColor: '#000000',
    padding: 8,
    marginBottom: 0,
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  sectionContent: {
    borderWidth: 1.5,
    borderTopWidth: 0,
    borderColor: '#000000',
    padding: 10,
    marginBottom: 15,
  },
  // 職務経歴用
  careerEntry: {
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
  },
  careerEntryLast: {
    marginBottom: 0,
  },
  companyName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  periodText: {
    fontSize: 9,
    color: '#374151',
    marginBottom: 5,
  },
  departmentText: {
    fontSize: 9,
    marginBottom: 5,
  },
  subSectionTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 2,
  },
  subSectionContent: {
    fontSize: 9,
    marginBottom: 5,
    paddingLeft: 5,
    lineHeight: 1.4,
  },
  // スキルテーブル用
  skillTable: {
    display: 'flex',
    width: '100%',
    borderWidth: 1.5,
    borderTopWidth: 0,
    borderColor: '#000000',
    marginBottom: 15,
  },
  skillHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#fafafa',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
  },
  skillRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
  },
  skillRowLast: {
    flexDirection: 'row',
  },
  skillCategoryCell: {
    width: 100,
    padding: 6,
    fontSize: 9,
    borderRightWidth: 1,
    borderRightColor: '#000000',
  },
  skillNameCell: {
    flex: 1,
    padding: 6,
    fontSize: 9,
    borderRightWidth: 1,
    borderRightColor: '#000000',
  },
  skillExpCell: {
    width: 100,
    padding: 6,
    fontSize: 9,
  },
});

interface CareerPDFDocumentProps {
  data: CareerFormData;
}

export const CareerPDFDocument: React.FC<CareerPDFDocumentProps> = ({ data }) => {
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

  // 職務経歴の期間テキスト生成
  const getPeriodText = (career: CareerFormData['careerHistory'] extends (infer T)[] | undefined ? T : never) => {
    if (!career) return '';

    const startEra =
      career.startYear && career.startMonth
        ? convertToEra(career.startYear, career.startMonth, 1)
        : null;
    const endEra =
      career.endYear && career.endMonth
        ? convertToEra(career.endYear, career.endMonth, 1)
        : null;

    const startText = startEra
      ? `${startEra.displayName}${career.startMonth}月`
      : career.startYear && career.startMonth
      ? `${career.startYear}年${career.startMonth}月`
      : '';
    const endText =
      career.endYear && career.endMonth
        ? endEra
          ? `${endEra.displayName}${career.endMonth}月`
          : `${career.endYear}年${career.endMonth}月`
        : '在職中';

    return startText && endText ? `${startText} 〜 ${endText}` : startText || endText;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* タイトル */}
        <Text style={styles.title}>職務経歴書</Text>

        {/* 日付 */}
        <Text style={styles.dateText}>
          {todayEra?.displayName}
          {today.getMonth() + 1}月{today.getDate()}日 現在
        </Text>

        {/* 基本情報テーブル */}
        <View style={styles.table} wrap={false}>
          {/* ふりがな行 */}
          <View style={styles.tableRow}>
            <View style={styles.labelCell}>
              <Text>ふりがな</Text>
            </View>
            <View style={{ ...styles.valueCellLast, flex: 3 }}>
              <Text>{data.furigana}</Text>
            </View>
          </View>

          {/* 氏名行 */}
          <View style={styles.tableRow}>
            <View style={styles.labelCell}>
              <Text>氏名</Text>
            </View>
            <View style={{ ...styles.valueCellLast, flex: 3, fontSize: 16 }}>
              <Text>{data.name}</Text>
            </View>
          </View>

          {/* 生年月日行 */}
          <View style={styles.tableRow}>
            <View style={styles.labelCell}>
              <Text>生年月日</Text>
            </View>
            <View style={{ ...styles.valueCellLast, flex: 3 }}>
              <Text>
                {parsedBirthDate && birthEra
                  ? `${birthEra.displayName}${parsedBirthDate.month}月${parsedBirthDate.day}日生（満${calculateAge()}歳）`
                  : ''}
              </Text>
            </View>
          </View>

          {/* 性別行 */}
          <View style={styles.tableRow}>
            <View style={styles.labelCell}>
              <Text>性別</Text>
            </View>
            <View style={{ ...styles.valueCellLast, flex: 3 }}>
              <Text>{data.gender === 'male' ? '男' : data.gender === 'female' ? '女' : ''}</Text>
            </View>
          </View>

          {/* 住所 */}
          {(data.prefecture || data.city || data.address) && (
            <>
              <View style={styles.tableRow}>
                <View style={styles.labelCell}>
                  <Text>現住所</Text>
                </View>
                <View style={{ ...styles.valueCellLast, flex: 3, backgroundColor: '#fafafa', padding: 3 }}>
                  <Text style={{ fontSize: 9 }}>〒{data.postalCode || ''}</Text>
                </View>
              </View>
              <View style={styles.tableRow}>
                <View style={styles.labelCell}>
                  <Text></Text>
                </View>
                <View style={{ ...styles.valueCellLast, flex: 3 }}>
                  <Text>
                    {[data.prefecture, data.city, data.address, data.building].filter(Boolean).join(' ')}
                  </Text>
                </View>
              </View>
            </>
          )}

          {/* 連絡先 */}
          {(data.phone || data.email) && (
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
          )}
        </View>

        {/* 職務要約 */}
        {data.summary && (
          <View wrap={false}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>職務要約</Text>
            </View>
            <View style={styles.sectionContent}>
              <Text style={{ lineHeight: 1.5 }}>{data.summary}</Text>
            </View>
          </View>
        )}

        {/* 職務経歴 */}
        {data.careerHistory && data.careerHistory.length > 0 && (
          <>
            <View style={styles.sectionHeader} wrap={false}>
              <Text style={styles.sectionHeaderText}>職務経歴</Text>
            </View>
            <View style={styles.sectionContent}>
              {data.careerHistory.map((career, index) => (
                <View
                  key={career.id}
                  wrap={false}
                  style={
                    index === data.careerHistory!.length - 1
                      ? styles.careerEntryLast
                      : styles.careerEntry
                  }
                >
                  {/* 会社名 */}
                  <Text style={styles.companyName}>{career.companyName}</Text>

                  {/* 期間・雇用形態 */}
                  <Text style={styles.periodText}>
                    {getPeriodText(career)}
                    {career.employmentType && ` （${employmentTypeLabels[career.employmentType] || career.employmentType}）`}
                  </Text>

                  {/* 部署・役職 */}
                  {(career.department || career.position) && (
                    <Text style={styles.departmentText}>
                      {career.department && `部署：${career.department}`}
                      {career.department && career.position && ' | '}
                      {career.position && `役職：${career.position}`}
                    </Text>
                  )}

                  {/* 業務内容 */}
                  {career.jobDescription && (
                    <>
                      <Text style={styles.subSectionTitle}>【業務内容】</Text>
                      <Text style={styles.subSectionContent}>{career.jobDescription}</Text>
                    </>
                  )}

                  {/* 実績・成果 */}
                  {career.achievements && (
                    <>
                      <Text style={styles.subSectionTitle}>【実績・成果】</Text>
                      <Text style={styles.subSectionContent}>{career.achievements}</Text>
                    </>
                  )}

                  {/* 使用技術・スキル */}
                  {career.technologies && (
                    <>
                      <Text style={styles.subSectionTitle}>【使用技術・スキル】</Text>
                      <Text style={styles.subSectionContent}>{career.technologies}</Text>
                    </>
                  )}
                </View>
              ))}
            </View>
          </>
        )}

        {/* 保有スキル */}
        {data.skills && data.skills.length > 0 && (
          <View wrap={false}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionHeaderText}>保有スキル</Text>
            </View>
            <View style={styles.skillTable}>
              {/* ヘッダー */}
              <View style={styles.skillHeaderRow}>
                <View style={styles.skillCategoryCell}>
                  <Text style={{ textAlign: 'center', fontWeight: 'bold' }}>カテゴリ</Text>
                </View>
                <View style={styles.skillNameCell}>
                  <Text style={{ textAlign: 'center', fontWeight: 'bold' }}>スキル名</Text>
                </View>
                <View style={styles.skillExpCell}>
                  <Text style={{ textAlign: 'center', fontWeight: 'bold' }}>経験</Text>
                </View>
              </View>
              {/* データ行 */}
              {data.skills.map((skill, index) => (
                <View
                  key={skill.id}
                  style={index === data.skills!.length - 1 ? styles.skillRowLast : styles.skillRow}
                >
                  <View style={styles.skillCategoryCell}>
                    <Text>{skill.category || '-'}</Text>
                  </View>
                  <View style={styles.skillNameCell}>
                    <Text>{skill.skillName}</Text>
                  </View>
                  <View style={styles.skillExpCell}>
                    <Text>{skill.experience || '-'}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
};
