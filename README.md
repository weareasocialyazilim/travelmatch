# travelmatch

Seyahat-Gifting App

## Getting Started

To get a local copy up and running follow these simple example steps.

### Prerequisites

- Node.js
- npm

### Installation

1.  Clone the repo
    ```sh
    git clone https://github.com/your_username_/travelmatch.git
    ```
2.  Install NPM packages
    ```sh
    npm install
    ```

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.

### `npm run ios`

Runs the app on the iOS simulator.

### `npm run lint`

Lints the code to catch errors and enforce code style.

### `npm run format`

Formats the code with Prettier.

## Reusable Components

### Button

A general-purpose button component.

**Props**

- `title`: The text to display inside the button.
- `onPress`: The function to call when the button is pressed.
- `variant`: The button style. Can be `primary` or `secondary`.
- `disabled`: Whether the button is disabled.

**Usage**

```jsx
<Button
  title="Press Me"
  onPress={() => console.log('Button pressed')}
  variant="primary"
/>
```

### MomentCard

A card component for displaying a moment.

**Props**

- `moment`: The moment object to display.
- `onPress`: The function to call when the card is pressed.
- `onGiftPress`: The function to call when the gift button is pressed.

**Usage**

```jsx
<MomentCard
  moment={moment}
  onPress={() => console.log('Card pressed')}
  onGiftPress={() => console.log('Gift button pressed')}
/>
```

## Architecture

- **Components:** Reusable UI components are located in `src/components`.
- **Constants:** Global constants such as colors, spacing, and typography are located in `src/constants`.
- **Navigation:** The app's navigation logic is defined in `src/navigation`.
- **Screens:** The app's screens are located in `src/screens`.
- **Services:** The app's API services are located in `src/services`.
- **Types:** The app's TypeScript types are located in `src/types`.
