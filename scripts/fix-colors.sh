#!/bin/bash

# Replace color literals with COLORS constants

cd /Users/kemalteksal/Documents/travelmatch-new

# Replace #D1E6DA with COLORS.mintBorder
find src -name "*.tsx" -type f -exec sed -i '' "s/'#D1E6DA'/COLORS.mintBorder/g" {} \;
find src -name "*.tsx" -type f -exec sed -i '' 's/"#D1E6DA"/COLORS.mintBorder/g' {} \;

# Replace #E8F3EC with COLORS.mintBackground
find src -name "*.tsx" -type f -exec sed -i '' "s/'#E8F3EC'/COLORS.mintBackground/g" {} \;
find src -name "*.tsx" -type f -exec sed -i '' 's/"#E8F3EC"/COLORS.mintBackground/g' {} \;

# Replace #50956E with COLORS.mintDark
find src -name "*.tsx" -type f -exec sed -i '' "s/'#50956E'/COLORS.mintDark/g" {} \;
find src -name "*.tsx" -type f -exec sed -i '' 's/"#50956E"/COLORS.mintDark/g' {} \;

# Replace #EF4444 with COLORS.error
find src -name "*.tsx" -type f -exec sed -i '' "s/'#EF4444'/COLORS.error/g" {} \;
find src -name "*.tsx" -type f -exec sed -i '' 's/"#EF4444"/COLORS.error/g' {} \;

# Replace #FF453A with COLORS.error (iOS red)
find src -name "*.tsx" -type f -exec sed -i '' "s/'#FF453A'/COLORS.error/g" {} \;
find src -name "*.tsx" -type f -exec sed -i '' 's/"#FF453A"/COLORS.error/g' {} \;

# Replace #F5F5F5 with COLORS.gray[100]
find src -name "*.tsx" -type f -exec sed -i '' "s/'#F5F5F5'/COLORS.gray[100]/g" {} \;
find src -name "*.tsx" -type f -exec sed -i '' 's/"#F5F5F5"/COLORS.gray[100]/g' {} \;

# Replace #E0E0E0 with COLORS.gray[200]
find src -name "*.tsx" -type f -exec sed -i '' "s/'#E0E0E0'/COLORS.gray[200]/g" {} \;
find src -name "*.tsx" -type f -exec sed -i '' 's/"#E0E0E0"/COLORS.gray[200]/g' {} \;

# Replace rgba(0,0,0,0.1) with COLORS.blackTransparentDark
find src -name "*.tsx" -type f -exec sed -i '' "s/'rgba(0,0,0,0.1)'/COLORS.blackTransparentDark/g" {} \;

# Replace #000 with COLORS.black
find src -name "*.tsx" -type f -exec sed -i '' "s/'#000'/COLORS.black/g" {} \;
find src -name "*.tsx" -type f -exec sed -i '' 's/"#000"/COLORS.black/g' {} \;

# Replace #fff with COLORS.white
find src -name "*.tsx" -type f -exec sed -i '' "s/'#fff'/COLORS.white/g" {} \;
find src -name "*.tsx" -type f -exec sed -i '' 's/"#fff"/COLORS.white/g' {} \;

echo "Replaced color literals with COLORS constants"
