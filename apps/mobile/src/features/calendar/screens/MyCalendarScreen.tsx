import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import type { RootStackScreenProps } from '@/navigation/types';

const EVENTS: Record<string, { marked: boolean; dotColor: string }> = {
  '2026-01-24': { marked: true, dotColor: COLORS.brand.primary },
  '2026-01-28': { marked: true, dotColor: COLORS.brand.accent },
};

export const MyCalendarScreen = ({
  navigation,
}: RootStackScreenProps<'MyCalendar'>) => {
  const insets = useSafeAreaInsets();
  const [selectedDate, setSelectedDate] = useState('');

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Schedule</Text>
        <View style={styles.headerSpacer} />
      </View>

      <Calendar
        style={styles.calendar}
        theme={{
          backgroundColor: COLORS.background.primary,
          calendarBackground: COLORS.background.primary,
          textSectionTitleColor: '#b6c1cd',
          selectedDayBackgroundColor: COLORS.brand.primary,
          selectedDayTextColor: '#000',
          todayTextColor: COLORS.brand.primary,
          dayTextColor: '#fff',
          textDisabledColor: '#444',
          monthTextColor: '#fff',
          arrowColor: COLORS.brand.primary,
          textMonthFontWeight: 'bold',
          textDayFontWeight: '600',
        }}
        markedDates={{
          ...EVENTS,
          [selectedDate]: {
            selected: true,
            marked: EVENTS[selectedDate]?.marked,
            dotColor: COLORS.brand.primary,
          },
        }}
        onDayPress={(day: DateData) => setSelectedDate(day.dateString)}
      />

      <ScrollView contentContainerStyle={styles.eventsList}>
        <Text style={styles.sectionTitle}>
          {selectedDate ? `Events on ${selectedDate}` : 'Upcoming'}
        </Text>

        {/* Mock Event Card */}
        <View style={styles.eventCard}>
          <View style={styles.dateBox}>
            <Text style={styles.day}>24</Text>
            <Text style={styles.month}>JAN</Text>
          </View>
          <View style={styles.eventInfo}>
            <Text style={styles.eventTitle}>Dinner at Hotel Costes</Text>
            <Text style={styles.eventTime}>20:00 • Paris, FR</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>CONFIRMED</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSpacer: {
    width: 24,
  },
  calendar: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  eventsList: {
    padding: 20,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  dateBox: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 16,
    minWidth: 60,
  },
  day: {
    color: 'white',
    fontWeight: '900',
    fontSize: 20,
  },
  month: {
    color: COLORS.brand.primary,
    fontWeight: 'bold',
    fontSize: 12,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  eventTime: {
    color: '#888',
    fontSize: 12,
    marginBottom: 8,
  },
  statusBadge: {
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: '#00FF00',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default MyCalendarScreen;
