// 郵便番号から住所を検索（オフライン対応）
// 注: 完全な郵便番号データベースは別途必要ですが、ここでは主要な郵便番号のサンプルを含めます

export interface PostalCodeData {
  postalCode: string;
  prefecture: string;
  city: string;
  address: string;
}

// サンプルデータ（実際の運用では完全なデータベースが必要）
const postalCodeDatabase: PostalCodeData[] = [
  { postalCode: "1000001", prefecture: "東京都", city: "千代田区", address: "千代田" },
  { postalCode: "1000002", prefecture: "東京都", city: "千代田区", address: "皇居外苑" },
  { postalCode: "1000003", prefecture: "東京都", city: "千代田区", address: "一ツ橋" },
  { postalCode: "1000004", prefecture: "東京都", city: "千代田区", address: "大手町" },
  { postalCode: "1000005", prefecture: "東京都", city: "千代田区", address: "丸の内" },
  { postalCode: "1000006", prefecture: "東京都", city: "千代田区", address: "有楽町" },
  { postalCode: "1500001", prefecture: "東京都", city: "渋谷区", address: "神宮前" },
  { postalCode: "1500002", prefecture: "東京都", city: "渋谷区", address: "渋谷" },
  { postalCode: "1600023", prefecture: "東京都", city: "新宿区", address: "西新宿" },
  { postalCode: "5300001", prefecture: "大阪府", city: "大阪市北区", address: "梅田" },
  { postalCode: "6000001", prefecture: "京都府", city: "京都市下京区", address: "四条通" },
  { postalCode: "0600001", prefecture: "北海道", city: "札幌市中央区", address: "北一条西" },
  { postalCode: "8100001", prefecture: "福岡県", city: "福岡市中央区", address: "天神" },
  { postalCode: "9800001", prefecture: "宮城県", city: "仙台市青葉区", address: "一番町" },
  { postalCode: "2310001", prefecture: "神奈川県", city: "横浜市中区", address: "新港" },
  { postalCode: "4600001", prefecture: "愛知県", city: "名古屋市中区", address: "三の丸" },
];

export async function searchPostalCode(postalCode: string): Promise<PostalCodeData | null> {
  // ハイフンを除去
  const cleanCode = postalCode.replace(/-/g, "");

  if (cleanCode.length !== 7) {
    return null;
  }

  try {
    const response = await fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${cleanCode}`);
    const data = await response.json();
    if (data?.status === 200 && Array.isArray(data.results) && data.results.length > 0) {
      const result = data.results[0];
      return {
        postalCode: cleanCode,
        prefecture: result.address1,
        city: result.address2,
        address: result.address3,
      };
    }
  } catch (error) {
    console.error("郵便番号検索に失敗しました", error);
  }

  const found = postalCodeDatabase.find((data) => data.postalCode === cleanCode);
  return found || null;
}

// 郵便番号のフォーマット（XXX-XXXX）
export function formatPostalCode(postalCode: string): string {
  const cleanCode = postalCode.replace(/[^0-9]/g, "");
  if (cleanCode.length >= 4) {
    return `${cleanCode.slice(0, 3)}-${cleanCode.slice(3, 7)}`;
  }
  return cleanCode;
}
