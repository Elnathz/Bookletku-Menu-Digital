#!/bin/bash

# Script to replace all green colors with primary blue colors
# Usage: chmod +x replace-colors.sh && ./replace-colors.sh

echo "🎨 Starting color replacement from green to blue..."

# Files to process
FILES=(
  "src/components/AdminDashboard.jsx"
  "src/components/PublicMenu.jsx"
  "src/components/LoginPage.jsx"
  "src/components/UserProfile.jsx"
  "src/components/MenuCard.jsx"
  "src/components/CustomerView.jsx"
  "src/components/itemForm.jsx"
  "src/components/QRCode.jsx"
  "src/components/Modal.jsx"
  "src/contexts/LanguageContext.jsx"
  "index.html"
  "public/index.html"
)

# Replacement patterns
declare -A replacements=(
  ["green-50"]="primary-50"
  ["green-100"]="primary-100"
  ["green-200"]="primary-200"
  ["green-300"]="primary-300"
  ["green-400"]="primary-400"
  ["green-500"]="primary-500"
  ["green-600"]="primary-600"
  ["green-700"]="primary-700"
  ["green-800"]="primary-800"
  ["green-900"]="primary-900"
  ["emerald-500"]="primary-600"
  ["emerald-600"]="primary-700"
  ["emerald-700"]="primary-800"
  ["emerald-800"]="primary-900"
)

# Process each file
for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "📝 Processing: $file"
    
    # Create backup
    cp "$file" "$file.backup"
    
    # Replace all patterns
    for old in "${!replacements[@]}"; do
      new="${replacements[$old]}"
      sed -i.tmp "s/${old}/${new}/g" "$file"
      rm -f "$file.tmp"
    done
    
    # Special replacements for gradients
    sed -i.tmp "s/from-green-\([0-9]\{3\}\) to-emerald-\([0-9]\{3\}\)/from-primary-\1 to-primary-\2/g" "$file"
    sed -i.tmp "s/from-green-\([0-9]\{3\}\) to-green-\([0-9]\{3\}\)/from-primary-\1 to-primary-\2/g" "$file"
    rm -f "$file.tmp"
    
    echo "✅ Completed: $file"
  else
    echo "⚠️  File not found: $file"
  fi
done

# Update theme color in HTML files
echo "🎨 Updating theme colors..."
sed -i.tmp 's/content="#3b82f6"/content="#666fb8"/g' index.html
sed -i.tmp 's/content="#3b82f6"/content="#666fb8"/g' public/index.html
rm -f index.html.tmp public/index.html.tmp

echo ""
echo "✨ Color replacement complete!"
echo ""
echo "📋 Summary:"
echo "   - Replaced all green-* with primary-*"
echo "   - Replaced all emerald-* with primary-*"
echo "   - Updated gradient colors"
echo "   - Updated theme-color meta tags"
echo ""
echo "💾 Backups saved with .backup extension"
echo ""
echo "🔍 To review changes: git diff"
echo "♻️  To restore backups: for f in src/**/*.backup; do mv \$f \${f%.backup}; done"