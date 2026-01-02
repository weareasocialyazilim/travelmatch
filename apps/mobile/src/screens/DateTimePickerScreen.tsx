import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { COLORS } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@/hooks/useNavigationHelpers';
import type { RootStackParamList } from '@/navigation/routeParams';

type DateTimePickerRouteProp = RouteProp<RootStackParamList, 'DateTimePicker'>;

export const DateTimePickerScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<DateTimePickerRouteProp>();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const { initialDate, initialTime, onSelect } = route.params || {};
  const [selectedDate, setSelectedDate] = useState(initialDate || '');
  const [selectedTime, setSelectedTime] = useState(initialTime || '20:00');

  const TIMES = ['18:00', '19:00', '20:00', '21:00', '22:00', '23:00'];

  // Get today's date in YYYY-MM-DD format for minDate
  const today = new Date().toISOString().split('T')[0];

  const handleConfirm = () => {
    if (onSelect) {
      onSelect(selectedDate, selectedTime);
    }
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('screens.dateTimePicker.title')}</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>{t('screens.dateTimePicker.date')}</Text>
        <Calendar
          style={styles.calendar}
          minDate={today}
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
          onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
          markedDates={{
            [selectedDate]: { selected: true, disableTouchEvent: true },
          }}
        />

        <Text style={styles.label}>{t('screens.dateTimePicker.time')}</Text>
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
          <Text style={styles.confirmText}>{t('screens.dateTimePicker.setSchedule')}</Text>
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
  spacer: { width: 24 },
});
