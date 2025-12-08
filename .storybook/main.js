module.exports = {
  stories: [
    '../apps/mobile/src/components/**/*.stories.@(ts|tsx|js|jsx)',
    '../apps/mobile/src/features/**/*.stories.@(ts|tsx|js|jsx)',
    '../packages/design-system/src/**/*.stories.@(ts|tsx|js|jsx)',
  ],
  addons: [
    '@storybook/addon-ondevice-controls',
    '@storybook/addon-ondevice-actions',
    '@storybook/addon-ondevice-backgrounds',
    '@storybook/addon-ondevice-notes',
  ],
};
