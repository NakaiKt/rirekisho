FROM node:20-alpine

WORKDIR /app

# パッケージマネージャーとしてpnpmを使用
RUN npm install -g pnpm

# 依存関係のインストール用にpackage.jsonをコピー
COPY package*.json ./

# 依存関係をインストール
RUN pnpm install

# アプリケーションのソースコードをコピー
COPY . .

# 開発サーバーを起動
EXPOSE 3000

CMD ["pnpm", "dev"]
