import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { COLORS } from '@/theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const DateTimePickerScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('20:00');

  const TIMES = ['18:00', '19:00', '20:00', '21:00', '22:00', '23:00'];

  const handleConfirm = () => {
    navigation.goBack(); // Normalde seçilen tarihi geri döner
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Date & Time</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>DATE</Text>
        <Calendar
          style={styles.calendar}
          theme={{
            backgroundColor: 'transparent',
            calendarBackground: 'transparent',
            textSectionTitleColor: '#b6c1cd',
            selectedDayBackgroundColor: COLORS.brand.primary,
            selectedDayTextColor: '#000',
            todayTextColor: COLORS.brand.primary,
            dayTextColor: '#fff',
            textDisabledColor: '#333',
            arrowColor: 'white',
            monthTextColor: 'white',
            textMonthFontWeight: 'bold',
          }}
          onDayPress={(day: any) => setSelectedDate(day.dateString)}
          markedDates={{
            [selectedDate]: { selected: true, disableTouchEvent: true },
          }}
        />

        <Text style={styles.label}>TIME</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.timeRow}
        >
          {TIMES.map((time) => (
            <TouchableOpacity
              key={time}
              style={[
                styles.timeChip,
                selectedTime === time && styles.timeChipActive,
              ]}
              onPress={() => setSelectedTime(time)}
            >
              <Text
                style={[
                  styles.timeText,
                  selectedTime === time && styles.timeTextActive,
                ]}
              >
                {time}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity
          style={[styles.confirmBtn, !selectedDate && styles.disabledBtn]}
          onPress={handleConfirm}
          disabled={!selectedDate}
        >
          <Text style={styles.confirmText}>Set Schedule</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background.primary },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: 'white' },
  content: { padding: 20 },
  label: {
    color: COLORS.text.secondary,
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 10,
    letterSpacing: 1,
  },
  calendar: {
    marginBottom: 30,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 10,
  },
  timeRow: { flexDirection: 'row', marginBottom: 40 },
  timeChip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  timeChipActive: {
    backgroundColor: COLORS.brand.primary,
    borderColor: COLORS.brand.primary,
  },
  timeText: { color: 'white', fontWeight: '600' },
  timeTextActive: { color: 'black' },
  confirmBtn: {
    backgroundColor: COLORS.brand.primary,
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  disabledBtn: { backgroundColor: '#333', opacity: 0.5 },
  confirmText: { color: 'black', fontWeight: 'bold', fontSize: 16 },
});
