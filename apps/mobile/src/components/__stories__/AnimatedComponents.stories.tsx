import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  AnimatedButton,
  FadeInView,
  SlideInView,
  ScaleOnPress,
  PulseView,
} from './AnimatedComponents';

// Reusable button content
const ButtonContent = ({ label }: { label: string }) => (
  <View style={styles.button}>
    <Text style={styles.buttonText}>{label}</Text>
  </View>
);

const meta: Meta = {
  title: 'Components/Animated',
  decorators: [
    (Story) => (
      <View style={{ padding: 20, backgroundColor: '#f5f5f5', minHeight: 400 }}>
        <Story />
      </View>
    ),
  ],
};

export default meta;

// AnimatedButton Stories
export const Button: StoryObj<typeof AnimatedButton> = {
  render: (args) => (
    <AnimatedButton {...args}>
      <ButtonContent label="Press Me" />
    </AnimatedButton>
  ),
  args: {
    onPress: () => console.log('Button pressed'),
    haptic: true,
    disabled: false,
  },
};

export const DisabledButton: StoryObj<typeof AnimatedButton> = {
  render: () => (
    <AnimatedButton onPress={() => {}} disabled={true}>
      <ButtonContent label="Disabled" />
    </AnimatedButton>
  ),
};

export const ButtonWithoutHaptic: StoryObj<typeof AnimatedButton> = {
  render: () => (
    <AnimatedButton onPress={() => console.log('Pressed')} haptic={false}>
      <ButtonContent label="No Haptic Feedback" />
    </AnimatedButton>
  ),
};

export const MultipleButtons: StoryObj = {
  render: () => (
    <View style={{ gap: 12 }}>
      <AnimatedButton onPress={() => console.log('Primary')}>
        <View style={[styles.button, { backgroundColor: '#007AFF' }]}>
          <Text style={styles.buttonText}>Primary</Text>
        </View>
      </AnimatedButton>
      
      <AnimatedButton onPress={() => console.log('Secondary')}>
        <View style={[styles.button, { backgroundColor: '#5856D6' }]}>
          <Text style={styles.buttonText}>Secondary</Text>
        </View>
      </AnimatedButton>
      
      <AnimatedButton onPress={() => console.log('Danger')}>
        <View style={[styles.button, { backgroundColor: '#FF3B30' }]}>
          <Text style={styles.buttonText}>Danger</Text>
        </View>
      </AnimatedButton>
    </View>
  ),
};

// FadeInView Stories
export const FadeIn: StoryObj<typeof FadeInView> = {
  render: () => (
    <FadeInView duration={500}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Fades In</Text>
        <Text style={styles.cardText}>This view animates opacity from 0 to 1</Text>
      </View>
    </FadeInView>
  ),
};

export const FadeInWithDelay: StoryObj<typeof FadeInView> = {
  render: () => (
    <FadeInView delay={1000} duration={500}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Delayed Fade</Text>
        <Text style={styles.cardText}>Waits 1 second before fading in</Text>
      </View>
    </FadeInView>
  ),
};

export const SequentialFadeIn: StoryObj = {
  render: () => (
    <View style={{ gap: 12 }}>
      <FadeInView delay={0} duration={400}>
        <View style={styles.card}>
          <Text>First (0ms delay)</Text>
        </View>
      </FadeInView>
      
      <FadeInView delay={200} duration={400}>
        <View style={styles.card}>
          <Text>Second (200ms delay)</Text>
        </View>
      </FadeInView>
      
      <FadeInView delay={400} duration={400}>
        <View style={styles.card}>
          <Text>Third (400ms delay)</Text>
        </View>
      </FadeInView>
    </View>
  ),
};

// SlideInView Stories
export const SlideInFromLeft: StoryObj<typeof SlideInView> = {
  render: () => (
    <SlideInView direction="left" duration={500}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>← Slides From Left</Text>
      </View>
    </SlideInView>
  ),
};

export const SlideInFromRight: StoryObj<typeof SlideInView> = {
  render: () => (
    <SlideInView direction="right" duration={500}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Slides From Right →</Text>
      </View>
    </SlideInView>
  ),
};

export const SlideInFromTop: StoryObj<typeof SlideInView> = {
  render: () => (
    <SlideInView direction="up" duration={500}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>↑ Slides From Bottom</Text>
      </View>
    </SlideInView>
  ),
};

export const SlideInFromBottom: StoryObj<typeof SlideInView> = {
  render: () => (
    <SlideInView direction="down" duration={500}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>↓ Slides From Top</Text>
      </View>
    </SlideInView>
  ),
};

export const SequentialSlides: StoryObj = {
  render: () => (
    <View style={{ gap: 12 }}>
      <SlideInView direction="left" delay={0} duration={400}>
        <View style={styles.card}><Text>From Left</Text></View>
      </SlideInView>
      
      <SlideInView direction="right" delay={200} duration={400}>
        <View style={styles.card}><Text>From Right</Text></View>
      </SlideInView>
      
      <SlideInView direction="up" delay={400} duration={400}>
        <View style={styles.card}><Text>From Bottom</Text></View>
      </SlideInView>
    </View>
  ),
};

// ScaleOnPress Stories
export const ScalePressable: StoryObj<typeof ScaleOnPress> = {
  render: () => (
    <ScaleOnPress onPress={() => console.log('Pressed')}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Tap Me!</Text>
        <Text style={styles.cardText}>Scales down on press</Text>
      </View>
    </ScaleOnPress>
  ),
};

export const CustomScaleAmount: StoryObj<typeof ScaleOnPress> = {
  render: () => (
    <View style={{ gap: 12 }}>
      <ScaleOnPress scale={0.9} onPress={() => console.log('90%')}>
        <View style={styles.card}><Text>Scale: 0.9</Text></View>
      </ScaleOnPress>
      
      <ScaleOnPress scale={0.95} onPress={() => console.log('95%')}>
        <View style={styles.card}><Text>Scale: 0.95</Text></View>
      </ScaleOnPress>
      
      <ScaleOnPress scale={0.85} onPress={() => console.log('85%')}>
        <View style={styles.card}><Text>Scale: 0.85</Text></View>
      </ScaleOnPress>
    </View>
  ),
};

// PulseView Stories
export const PulseAnimation: StoryObj<typeof PulseView> = {
  render: () => (
    <PulseView>
      <View style={[styles.card, { backgroundColor: '#007AFF' }]}>
        <Text style={[styles.cardTitle, { color: '#fff' }]}>Pulsing</Text>
        <Text style={[styles.cardText, { color: '#fff' }]}>Continuously scales</Text>
      </View>
    </PulseView>
  ),
};

export const CustomPulseScale: StoryObj<typeof PulseView> = {
  render: () => (
    <View style={{ gap: 20 }}>
      <PulseView pulseScale={1.05}>
        <View style={styles.card}>
          <Text>Subtle Pulse (1.05)</Text>
        </View>
      </PulseView>
      
      <PulseView pulseScale={1.15}>
        <View style={styles.card}>
          <Text>Strong Pulse (1.15)</Text>
        </View>
      </PulseView>
    </View>
  ),
};

// Complex Combinations
export const ComplexAnimation: StoryObj = {
  render: () => (
    <View style={{ gap: 12 }}>
      <FadeInView duration={600}>
        <SlideInView direction="left" duration={600}>
          <ScaleOnPress onPress={() => console.log('Combo 1')}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Fade + Slide + Scale</Text>
              <Text style={styles.cardText}>Tap me!</Text>
            </View>
          </ScaleOnPress>
        </SlideInView>
      </FadeInView>
      
      <FadeInView delay={200} duration={600}>
        <SlideInView direction="right" delay={200} duration={600}>
          <ScaleOnPress onPress={() => console.log('Combo 2')}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Delayed Combo</Text>
              <Text style={styles.cardText}>Tap me!</Text>
            </View>
          </ScaleOnPress>
        </SlideInView>
      </FadeInView>
    </View>
  ),
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
    color: '#1a1a1a',
  },
  cardText: {
    fontSize: 14,
    color: '#666',
  },
});
