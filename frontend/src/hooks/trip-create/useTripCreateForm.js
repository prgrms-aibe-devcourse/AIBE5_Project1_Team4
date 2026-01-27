import { useCallback, useEffect, useMemo, useState } from 'react';
import { formatLocalDate, getTodayString } from '@/utils/date';
import { getTripMembers, updateTripMemberRole } from '@/services/trip-members.service';
import { getTripDetail } from '@/services/trips.detail.service';
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

const mapScheduleToDays = (scheduleDays, fallbackStartDate) => {
  if (!Array.isArray(scheduleDays) || scheduleDays.length === 0) {
    return createInitialDays(fallbackStartDate);
  }

  return scheduleDays.map((day, index) => ({
    id: day.dayId ?? `day-${index + 1}`,
    label: `${index + 1}일차`,
    date: day.date ?? fallbackStartDate,
    items: Array.isArray(day.items)
      ? day.items.map((item, itemIndex) => ({
          id: item.itemId ?? `item-${index + 1}-${itemIndex + 1}`,
          time: item.time ?? '09:00',
          place: item.place?.name ?? '장소 미정',
        }))
      : [],
  }));
};

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

export const useTripCreateForm = ({ tripId } = {}) => {
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
    {
      id: 'member-a',
      name: '참여자 A',
      selected: true,
      isOwner: true,
      isSelf: true,
    },
    { id: 'member-b', name: '참여자 B', selected: false, isOwner: false },
    { id: 'member-c', name: '참여자 C', selected: true, isOwner: false },
  ]);

  const currentDay = days[currentDayIndex];
  const todayString = today;

  useEffect(() => {
    if (!tripId) return;
    let isMounted = true;

    const loadTrip = async () => {
      try {
        const { summary, schedule } = await getTripDetail(tripId);
        if (!isMounted) return;

        const trip = summary?.trip;
        if (trip) {
          setForm((prev) => ({
            ...prev,
            title: trip.title ?? prev.title,
            startDate: trip.startDate ?? prev.startDate,
            endDate: trip.endDate ?? prev.endDate,
            isPublic: trip.visibility === 'public',
          }));
        }

        const nextDays = mapScheduleToDays(
          schedule?.days,
          trip?.startDate ?? today,
        );
        setDays(nextDays);
        setCurrentDayIndex(0);
      } catch (error) {
        console.error('Failed to load trip detail:', error);
      }
    };

    void loadTrip();

    return () => {
      isMounted = false;
    };
  }, [tripId, today]);

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

  useEffect(() => {
    if (!tripId) return;
    let isMounted = true;

    const loadMembers = async () => {
      try {
        const result = await getTripMembers({ tripId });
        const list = result?.data?.members ?? [];
        if (!isMounted || list.length === 0) return;

        setMembers(
          list.map((member) => ({
            id: member.userId,
            name: member.displayName ?? 'Member',
            selected: true,
            isOwner: member.role === 'owner',
            isSelf: Boolean(member.isSelf),
            avatarUrl: member.avatarUrl ?? null,
          })),
        );
      } catch (error) {
        console.error('Failed to load members:', error);
      }
    };

    void loadMembers();

    return () => {
      isMounted = false;
    };
  }, [tripId]);

  const currentMember = useMemo(
    () => members.find((member) => member.isSelf) ?? null,
    [members],
  );
  const currentUserRole = currentMember?.isOwner ? 'owner' : 'editor';
  const canManageMembers = currentUserRole === 'owner';

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

  const applyOwnerLocally = useCallback((memberId) => {
    setMembers((prev) =>
      prev.map((member) => ({
        ...member,
        isOwner: member.id === memberId,
      })),
    );
  }, []);

  const applyRolesFromApi = useCallback((roles) => {
    if (!Array.isArray(roles) || roles.length === 0) {
      return false;
    }

    setMembers((prev) =>
      prev.map((member) => {
        const match = roles.find((item) => item.userId === member.id);
        if (!match) return member;
        return { ...member, isOwner: match.role === 'owner' };
      }),
    );

    return true;
  }, []);

  const transferOwner = useCallback(
    (memberId) => {
      if (!canManageMembers) {
        return;
      }

      if (!tripId) {
        applyOwnerLocally(memberId);
        return;
      }

      const doTransfer = async () => {
        try {
          const result = await updateTripMemberRole({
            tripId,
            memberId,
            role: 'owner',
          });
          const updated = applyRolesFromApi(result?.data?.members);
          if (!updated) {
            applyOwnerLocally(memberId);
          }
        } catch (error) {
          console.error('Failed to transfer owner:', error);
        }
      };

      void doTransfer();
    },
    [applyOwnerLocally, applyRolesFromApi, canManageMembers, tripId],
  );

  const removeMember = useCallback((memberId) => {
    setMembers((prev) => prev.filter((member) => member.id !== memberId));
  }, []);

  const summary = computeSummary(currentDay.items);

  //지도 변수 계산
  //현재 요일의 일정 좌표 리스트
  const mapCurrentDayPos = useMemo(() => {
    return (currentDay?.items || [])
      .map(item => ({
        ...item,
        lat: Number(item.lat), // 강제 숫자 변환
        lng: Number(item.lng)
      }))
      .filter(item => !isNaN(item.lat) && !isNaN(item.lng)); // 유효한 좌표만 추출
  }, [currentDay?.items]);
  //검색 결과 좌표 리스트
  const mapSearchPlacePos = useMemo(() => {
    return (searchResults || [])
      .map(place => ({
        ...place,
        lat: Number(place.lat),
        lng: Number(place.lng)
      }))
      .filter(place => !isNaN(place.lat) && !isNaN(place.lng));
  }, [searchResults]);


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
    currentUserRole,
    canManageMembers,

    //지도 관련 변수
    mapCurrentDayPos,
    mapSearchPlacePos
  };
};
