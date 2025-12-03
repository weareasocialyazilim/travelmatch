#!/bin/bash

# Replace more color literals

cd /Users/kemalteksal/Documents/travelmatch-new

# Replace specific color codes
find src -name "*.tsx" -type f -exec sed -i '' "s/'#EF444410'/COLORS.errorTransparent10/g" {} \;
find src -name "*.tsx" -type f -exec sed -i '' "s/'#EF444420'/COLORS.errorTransparent20/g" {} \;
find src -name "*.tsx" -type f -exec sed -i '' "s/'#00808020'/COLORS.tealTransparent20/g" {} \;
find src -name "*.tsx" -type f -exec sed -i '' "s/'#F59E0B20'/COLORS.warningTransparent20/g" {} \;
find src -name "*.tsx" -type f -exec sed -i '' "s/'#F59E0B'/COLORS.warning/g" {} \;
find src -name "*.tsx" -type f -exec sed -i '' "s/'#D4F4DD'/COLORS.successTransparent/g" {} \;
find src -name "*.tsx" -type f -exec sed -i '' "s/'#22C55E'/COLORS.greenBright/g" {} \;
find src -name "*.tsx" -type f -exec sed -i '' "s/'#15803D'/COLORS.greenDark/g" {} \;
find src -name "*.tsx" -type f -exec sed -i '' "s/'#FFAB00'/COLORS.amberBright/g" {} \;
find src -name "*.tsx" -type f -exec sed -i '' "s/'#221710'/COLORS.brownDark/g" {} \;
find src -name "*.tsx" -type f -exec sed -i '' "s/'#A8A29E'/COLORS.brownGray/g" {} \;
find src -name "*.tsx" -type f -exec sed -i '' "s/'#FB923C'/COLORS.orangeBright/g" {} \;
find src -name "*.tsx" -type f -exec sed -i '' "s/'#28A745'/COLORS.success/g" {} \;

echo "Replaced remaining color literals"
