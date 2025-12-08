import type { Meta, StoryObj } from '@storybook/react-native';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Switch, Slider } from 'react-native';
import { AnimatedButton } from './AnimatedComponents';

const meta: Meta = {
  title: 'Testing/Interactions',
  decorators: [
    (Story) => (
      <View style={{ padding: 20, backgroundColor: '#fff', flex: 1 }}>
        <Story />
      </View>
    ),
  ],
};

export default meta;

// Counter example - State management
export const Counter: StoryObj = {
  render: () => {
    const [count, setCount] = useState(0);
    
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Counter Example</Text>
        <Text style={styles.count}>{count}</Text>
        
        <View style={styles.buttonRow}>
          <AnimatedButton onPress={() => setCount(c => c - 1)}>
            <View style={[styles.button, styles.secondaryButton]}>
              <Text style={styles.buttonText}>−</Text>
            </View>
          </AnimatedButton>
          
          <AnimatedButton onPress={() => setCount(0)}>
            <View style={[styles.button, styles.outlineButton]}>
              <Text style={[styles.buttonText, { color: '#007AFF' }]}>Reset</Text>
            </View>
          </AnimatedButton>
          
          <AnimatedButton onPress={() => setCount(c => c + 1)}>
            <View style={styles.button}>
              <Text style={styles.buttonText}>+</Text>
            </View>
          </AnimatedButton>
        </View>
        
        <Text style={styles.hint}>Tap buttons to test interactions</Text>
      </View>
    );
  },
};

// Form example - Input handling
export const FormInputs: StoryObj = {
  render: () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    
    const handleSubmit = () => {
      setSubmitted(true);
      console.log('Form submitted:', { email, password, rememberMe });
      
      // Reset after 2 seconds
      setTimeout(() => setSubmitted(false), 2000);
    };
    
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Login Form</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
        
        <View style={styles.switchRow}>
          <Text style={styles.label}>Remember me</Text>
          <Switch value={rememberMe} onValueChange={setRememberMe} />
        </View>
        
        <AnimatedButton onPress={handleSubmit}>
          <View style={[styles.button, styles.fullWidth]}>
            <Text style={styles.buttonText}>
              {submitted ? '✓ Submitted!' : 'Sign In'}
            </Text>
          </View>
        </AnimatedButton>
        
        {submitted && (
          <Text style={styles.success}>Form submitted successfully!</Text>
        )}
      </View>
    );
  },
};

// Toggle states example
export const ToggleStates: StoryObj = {
  render: () => {
    const [activeTab, setActiveTab] = useState(0);
    const tabs = ['All', 'Adventure', 'Food', 'Culture'];
    
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Tab Navigation</Text>
        
        <View style={styles.tabs}>
          {tabs.map((tab, index) => (
            <AnimatedButton key={tab} onPress={() => setActiveTab(index)}>
              <View style={[
                styles.tab,
                activeTab === index && styles.tabActive
              ]}>
                <Text style={[
                  styles.tabText,
                  activeTab === index && styles.tabTextActive
                ]}>
                  {tab}
                </Text>
              </View>
            </AnimatedButton>
          ))}
        </View>
        
        <View style={styles.tabContent}>
          <Text style={styles.tabContentText}>
            Showing content for: {tabs[activeTab]}
          </Text>
        </View>
      </View>
    );
  },
};

// Range slider example
export const RangeSlider: StoryObj = {
  render: () => {
    const [minPrice, setMinPrice] = useState(50);
    const [maxPrice, setMaxPrice] = useState(200);
    
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Price Range Filter</Text>
        
        <View style={styles.sliderGroup}>
          <Text style={styles.label}>Min Price: ${minPrice}</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={500}
            value={minPrice}
            onValueChange={setMinPrice}
            minimumTrackTintColor="#007AFF"
            maximumTrackTintColor="#ddd"
          />
        </View>
        
        <View style={styles.sliderGroup}>
          <Text style={styles.label}>Max Price: ${maxPrice}</Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={500}
            value={maxPrice}
            onValueChange={setMaxPrice}
            minimumTrackTintColor="#007AFF"
            maximumTrackTintColor="#ddd"
          />
        </View>
        
        <View style={styles.priceDisplay}>
          <Text style={styles.priceRange}>
            ${Math.round(minPrice)} - ${Math.round(maxPrice)}
          </Text>
        </View>
      </View>
    );
  },
};

// Multi-select example
export const MultiSelect: StoryObj = {
  render: () => {
    const [selected, setSelected] = useState<string[]>([]);
    const options = [
      'Adventure',
      'Food & Drink',
      'Culture',
      'Nightlife',
      'Nature',
      'Sports',
    ];
    
    const toggleOption = (option: string) => {
      setSelected(prev =>
        prev.includes(option)
          ? prev.filter(o => o !== option)
          : [...prev, option]
      );
    };
    
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Select Categories</Text>
        <Text style={styles.subtitle}>
          {selected.length} selected
        </Text>
        
        <View style={styles.optionsGrid}>
          {options.map(option => (
            <AnimatedButton key={option} onPress={() => toggleOption(option)}>
              <View style={[
                styles.option,
                selected.includes(option) && styles.optionSelected
              ]}>
                <Text style={[
                  styles.optionText,
                  selected.includes(option) && styles.optionTextSelected
                ]}>
                  {option}
                </Text>
              </View>
            </AnimatedButton>
          ))}
        </View>
        
        {selected.length > 0 && (
          <AnimatedButton onPress={() => setSelected([])}>
            <View style={[styles.button, styles.outlineButton, styles.fullWidth]}>
              <Text style={[styles.buttonText, { color: '#007AFF' }]}>
                Clear Selection
              </Text>
            </View>
          </AnimatedButton>
        )}
      </View>
    );
  },
};

// Complex interaction flow
export const ComplexFlow: StoryObj = {
  render: () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      category: '',
      agree: false,
    });
    
    const canProceed = () => {
      if (step === 1) return formData.name.length > 0;
      if (step === 2) return formData.email.includes('@');
      if (step === 3) return formData.category.length > 0;
      return formData.agree;
    };
    
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Multi-Step Form</Text>
        <Text style={styles.subtitle}>Step {step} of 4</Text>
        
        <View style={styles.progress}>
          {[1, 2, 3, 4].map(s => (
            <View
              key={s}
              style={[
                styles.progressDot,
                s <= step && styles.progressDotActive
              ]}
            />
          ))}
        </View>
        
        {step === 1 && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>What's your name?</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              value={formData.name}
              onChangeText={text => setFormData(prev => ({ ...prev, name: text }))}
            />
          </View>
        )}
        
        {step === 2 && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Your email address?</Text>
            <TextInput
              style={styles.input}
              placeholder="email@example.com"
              value={formData.email}
              onChangeText={text => setFormData(prev => ({ ...prev, email: text }))}
              keyboardType="email-address"
            />
          </View>
        )}
        
        {step === 3 && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Choose a category</Text>
            {['Adventure', 'Food', 'Culture'].map(cat => (
              <AnimatedButton
                key={cat}
                onPress={() => setFormData(prev => ({ ...prev, category: cat }))}
              >
                <View style={[
                  styles.option,
                  formData.category === cat && styles.optionSelected
                ]}>
                  <Text style={[
                    styles.optionText,
                    formData.category === cat && styles.optionTextSelected
                  ]}>
                    {cat}
                  </Text>
                </View>
              </AnimatedButton>
            ))}
          </View>
        )}
        
        {step === 4 && (
          <View style={styles.inputGroup}>
            <View style={styles.switchRow}>
              <Text style={styles.label}>I agree to terms</Text>
              <Switch
                value={formData.agree}
                onValueChange={agree => setFormData(prev => ({ ...prev, agree }))}
              />
            </View>
          </View>
        )}
        
        <View style={styles.buttonRow}>
          {step > 1 && (
            <AnimatedButton onPress={() => setStep(s => s - 1)}>
              <View style={[styles.button, styles.outlineButton]}>
                <Text style={[styles.buttonText, { color: '#007AFF' }]}>Back</Text>
              </View>
            </AnimatedButton>
          )}
          
          <AnimatedButton
            onPress={() => step < 4 ? setStep(s => s + 1) : console.log('Submit:', formData)}
            disabled={!canProceed()}
          >
            <View style={styles.button}>
              <Text style={styles.buttonText}>
                {step < 4 ? 'Next' : 'Submit'}
              </Text>
            </View>
          </AnimatedButton>
        </View>
      </View>
    );
  },
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  count: {
    fontSize: 48,
    fontWeight: '700',
    color: '#007AFF',
    textAlign: 'center',
    marginVertical: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 80,
  },
  secondaryButton: {
    backgroundColor: '#5856D6',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  fullWidth: {
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  hint: {
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
    marginTop: 8,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  success: {
    color: '#34C759',
    textAlign: 'center',
    fontWeight: '600',
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  tabActive: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    color: '#666',
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#fff',
  },
  tabContent: {
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginTop: 8,
  },
  tabContentText: {
    fontSize: 16,
    color: '#666',
  },
  sliderGroup: {
    gap: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  priceDisplay: {
    padding: 20,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    alignItems: 'center',
  },
  priceRange: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  option: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  optionSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF',
  },
  optionText: {
    color: '#666',
    fontWeight: '600',
  },
  optionTextSelected: {
    color: '#fff',
  },
  progress: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 16,
  },
  progressDot: {
    width: 32,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
  },
  progressDotActive: {
    backgroundColor: '#007AFF',
  },
});
