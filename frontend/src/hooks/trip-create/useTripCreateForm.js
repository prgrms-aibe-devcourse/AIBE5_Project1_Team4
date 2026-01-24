import { useCallback, useMemo, useState } from 'react';
import { formatLocalDate, getTodayString } from '@/utils/date';
// Consolidated trip-create state and actions.

const addDays = (value, days) => {
  const normalized = value.includes('.') ? value.replace(/\./g, '-') : value;
  const [year, month, day] = normalized.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return formatLocalDate(date);
};

const addMinutes = (value, minutes) => {
  const [hours, mins] = value.split(':').map(Number);
  const date = new Date(2000, 0, 1, hours, mins, 0, 0);
  date.setMinutes(date.getMinutes() + minutes);
  return `${String(date.getHours()).padStart(2, '0')}:${String(
    date.getMinutes(),
  ).padStart(2, '0')}`;
};

const defaultPlaces = [
  '서울역',
  '경복궁',
  '북촌한옥마을',
  '한강공원',
  '인사동',
  '홍대거리',
  '남산타워',
];

const createInitialDays = (startDate) => [
  {
    id: 'day-1',
    label: '1일차',
    date: startDate,
    items: [
      { id: 'item-1', time: '09:00', place: '서울역' },
      { id: 'item-2', time: '10:30', place: '익선동 카페' },
      { id: 'item-3', time: '13:00', place: '인사동' },
    ],
  },
  {
    id: 'day-2',
    label: '2일차',
    date: addDays(startDate, 1),
    items: [
      { id: 'item-4', time: '09:30', place: '성수동 거리' },
      { id: 'item-5', time: '11:00', place: '북촌한옥마을' },
      { id: 'item-6', time: '14:00', place: '광장시장' },
    ],
  },
  {
    id: 'day-3',
    label: '3일차',
    date: addDays(startDate, 2),
    items: [
      { id: 'item-7', time: '10:00', place: '서울숲' },
      { id: 'item-8', time: '12:30', place: '홍대거리' },
    ],
  },
];

const computeSummary = (items) => {
  const stops = items.length;
  const travelMinutes = Math.max(0, stops - 1) * 40;
  const hours = Math.floor(travelMinutes / 60);
  const minutes = travelMinutes % 60;
  const travelParts = [];
  if (hours > 0) {
    travelParts.push(`${hours}시간`);
  }
  if (minutes > 0 || travelParts.length === 0) {
    travelParts.push(`${minutes}분`);
  }
  return {
    countText: `총 ${stops}곳`,
    travelText: `이동 예상 시간 ${travelParts.join(' ')}`,
  };
};

export const useTripCreateForm = () => {
  const today = getTodayString();
  const [form, setForm] = useState({
    title: '서울 2박 3일 맛집 여행',
    startDate: today,
    endDate: addDays(today, 2),
    region: '서울',
    isPublic: true,
  });
  const [days, setDays] = useState(() => createInitialDays(today));
  const [currentDayIndex, setCurrentDayIndex] = useState(0);

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activePanelTab, setActivePanelTab] = useState('schedule');
  const [isDayMenuOpen, setIsDayMenuOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(null);
  const [isRangeCalendarOpen, setIsRangeCalendarOpen] = useState(false);
  const [rangeCalendarMonth, setRangeCalendarMonth] = useState(null);
  const [rangeSelection, setRangeSelection] = useState('start');

  const [searchQuery, setSearchQuery] = useState('');
  const [members, setMembers] = useState([
    { id: 'member-a', name: '참여자 A', selected: true, isOwner: true },
    { id: 'member-b', name: '참여자 B', selected: false, isOwner: false },
    { id: 'member-c', name: '참여자 C', selected: true, isOwner: false },
  ]);

  const currentDay = days[currentDayIndex];
  const todayString = today;

  const calendarInfo = useMemo(() => {
    const baseDate = calendarMonth ?? currentDay.date;
    const [year, month] = baseDate.split('-').map(Number);
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const blanks = Array.from({ length: firstDay.getDay() }, () => null);
    const dayNumbers = Array.from({ length: lastDay.getDate() }, (_, i) => i + 1);
    return { year, month, cells: [...blanks, ...dayNumbers] };
  }, [calendarMonth, currentDay.date]);

  const rangeCalendarInfo = useMemo(() => {
    const baseDate = rangeCalendarMonth ?? form.startDate;
    const [year, month] = baseDate.split('-').map(Number);
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const blanks = Array.from({ length: firstDay.getDay() }, () => null);
    const dayNumbers = Array.from({ length: lastDay.getDate() }, (_, i) => i + 1);
    return { year, month, cells: [...blanks, ...dayNumbers] };
  }, [form.startDate, rangeCalendarMonth]);

  const searchResults = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    const base = normalized
      ? defaultPlaces.filter((place) =>
          place.toLowerCase().includes(normalized),
        )
      : defaultPlaces;
    const selectedPlaces = new Set(currentDay.items.map((item) => item.place));
    return base.map((place) => ({ name: place, selected: selectedPlaces.has(place) }));
  }, [currentDay.items, searchQuery]);

  const setFormField = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const updateDayDates = useCallback(
    (startDateValue) => {
      setDays((prev) =>
        prev.map((day, index) => ({
          ...day,
          date: addDays(startDateValue, index),
        })),
      );
      setForm((prev) => ({
        ...prev,
        startDate: startDateValue,
        endDate: addDays(startDateValue, days.length - 1),
      }));
    },
    [days.length],
  );

  const updateCurrentDayDate = useCallback(
    (value) => {
      setDays((prev) =>
        prev.map((day, index) =>
          index === currentDayIndex ? { ...day, date: value } : day,
        ),
      );
    },
    [currentDayIndex],
  );

  const updateDateRange = useCallback((startDateValue, endDateValue) => {
    setForm((prev) => ({
      ...prev,
      startDate: startDateValue,
      endDate: endDateValue,
    }));
    setDays((prev) =>
      prev.map((day, index) => ({
        ...day,
        date: addDays(startDateValue, index),
      })),
    );
  }, []);

  const addDay = useCallback(() => {
    setDays((prev) => {
      const last = prev[prev.length - 1];
      const nextDate = addDays(last.date, 1);
      const nextDay = {
        id: `day-${prev.length + 1}`,
        label: `${prev.length + 1}일차`,
        date: nextDate,
        items: [],
      };
      setCurrentDayIndex(prev.length);
      setForm((formPrev) => ({ ...formPrev, endDate: nextDate }));
      return [...prev, nextDay];
    });
  }, []);

  const goPrevDay = useCallback(() => {
    setCurrentDayIndex((prev) => (prev === 0 ? days.length - 1 : prev - 1));
  }, [days.length]);

  const goNextDay = useCallback(() => {
    setCurrentDayIndex((prev) => (prev === days.length - 1 ? 0 : prev + 1));
  }, [days.length]);

  const addScheduleItem = useCallback(
    (place) => {
      setDays((prev) =>
        prev.map((day, index) => {
          if (index !== currentDayIndex) {
            return day;
          }
          const last = day.items[day.items.length - 1];
          const nextTime = last ? addMinutes(last.time, 90) : '09:00';
          const nextItem = {
            id: `item-${Date.now()}`,
            time: nextTime,
            place: place || '새 장소',
          };
          return { ...day, items: [...day.items, nextItem] };
        }),
      );
    },
    [currentDayIndex],
  );

  const updateScheduleItem = useCallback(
    (itemId, patch) => {
      setDays((prev) =>
        prev.map((day, index) => {
          if (index !== currentDayIndex) {
            return day;
          }
          return {
            ...day,
            items: day.items.map((item) =>
              item.id === itemId ? { ...item, ...patch } : item,
            ),
          };
        }),
      );
    },
    [currentDayIndex],
  );

  const removeScheduleItem = useCallback(
    (itemId) => {
      setDays((prev) =>
        prev.map((day, index) => {
          if (index !== currentDayIndex) {
            return day;
          }
          return { ...day, items: day.items.filter((item) => item.id !== itemId) };
        }),
      );
    },
    [currentDayIndex],
  );

  const shiftCalendarMonth = useCallback(
    (delta) => {
      const base = (calendarMonth ?? currentDay.date).split('-').map(Number);
      const date = new Date(base[0], base[1] - 1, 1);
      date.setMonth(date.getMonth() + delta);
      setCalendarMonth(formatLocalDate(date));
    },
    [calendarMonth, currentDay.date],
  );

  const shiftRangeCalendarMonth = useCallback(
    (delta) => {
      const base = (rangeCalendarMonth ?? form.startDate)
        .split('-')
        .map(Number);
      const date = new Date(base[0], base[1] - 1, 1);
      date.setMonth(date.getMonth() + delta);
      setRangeCalendarMonth(formatLocalDate(date));
    },
    [form.startDate, rangeCalendarMonth],
  );

  const openRangeCalendar = useCallback(() => {
    setRangeSelection('start');
    setRangeCalendarMonth(form.startDate);
    setIsRangeCalendarOpen(true);
  }, [form.startDate]);

  const closeRangeCalendar = useCallback(() => {
    setIsRangeCalendarOpen(false);
    setRangeSelection('start');
  }, []);

  const selectRangeDate = useCallback(
    (value) => {
      if (rangeSelection === 'start') {
        const nextStart = value;
        const nextEnd = form.endDate < nextStart ? nextStart : form.endDate;
        updateDateRange(nextStart, nextEnd);
        setRangeSelection('end');
        return;
      }

      let nextStart = form.startDate;
      let nextEnd = value;
      if (nextEnd < nextStart) {
        [nextStart, nextEnd] = [nextEnd, nextStart];
      }
      updateDateRange(nextStart, nextEnd);
      closeRangeCalendar();
    },
    [closeRangeCalendar, form.endDate, form.startDate, rangeSelection, updateDateRange],
  );

  const toggleMember = useCallback((memberId) => {
    setMembers((prev) =>
      prev.map((member) =>
        member.id === memberId
          ? { ...member, selected: !member.selected }
          : member,
      ),
    );
  }, []);

  const transferOwner = useCallback((memberId) => {
    setMembers((prev) =>
      prev.map((member) => ({
        ...member,
        isOwner: member.id === memberId,
      })),
    );
  }, []);

  const removeMember = useCallback((memberId) => {
    setMembers((prev) => prev.filter((member) => member.id !== memberId));
  }, []);

  const summary = computeSummary(currentDay.items);

  return {
    form,
    setFormField,
    days,
    currentDayIndex,
    setCurrentDayIndex,
    currentDay,
    todayString,
    summary,
    updateDayDates,
    updateCurrentDayDate,
    addDay,
    goPrevDay,
    goNextDay,
    isPanelOpen,
    setIsPanelOpen,
    isSearchOpen,
    setIsSearchOpen,
    activePanelTab,
    setActivePanelTab,
    isDayMenuOpen,
    setIsDayMenuOpen,
    isCalendarOpen,
    setIsCalendarOpen,
    calendarInfo,
    shiftCalendarMonth,
    setCalendarMonth,
    isRangeCalendarOpen,
    openRangeCalendar,
    closeRangeCalendar,
    rangeCalendarInfo,
    shiftRangeCalendarMonth,
    selectRangeDate,
    updateDateRange,
    searchQuery,
    setSearchQuery,
    searchResults,
    addScheduleItem,
    updateScheduleItem,
    removeScheduleItem,
    members,
    toggleMember,
    transferOwner,
    removeMember,
  };
};
