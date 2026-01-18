#!/bin/bash

echo "🔍 验证项目完整性..."
echo ""

# 检查必要文件
FILES=(
  "package.json"
  "tsconfig.json"
  "vite.config.ts"
  "tailwind.config.js"
  ".env"
  "prisma/schema.prisma"
  "prisma/seed.ts"
  "src/server/index.ts"
  "src/client/main.tsx"
  "index.html"
)

echo "📋 检查必要文件..."
MISSING=0
for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file"
  else
    echo "❌ $file - 缺失"
    MISSING=$((MISSING + 1))
  fi
done

echo ""
if [ $MISSING -eq 0 ]; then
  echo "✅ 所有必要文件都已创建！"
else
  echo "❌ 有 $MISSING 个文件缺失"
  exit 1
fi

echo ""
echo "📊 项目统计:"
echo "- 总文件数: $(find . -type f -not -path '*/node_modules/*' | wc -l)"
echo "- TypeScript 文件: $(find . -name '*.ts' -o -name '*.tsx' -not -path '*/node_modules/*' | wc -l)"
echo "- 文档文件: $(find . -name '*.md' | wc -l)"

echo ""
echo "🎉 项目验证通过！"
echo ""
echo "📝 下一步操作:"
echo "1. npm install              # 安装依赖"
echo "2. npm run db:generate      # 生成 Prisma Client"
echo "3. npm run db:push          # 创建数据库表"
echo "4. npm run db:seed          # 运行种子数据"
echo "5. npm run dev              # 启动项目"
