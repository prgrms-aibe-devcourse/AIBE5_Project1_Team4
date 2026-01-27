import { useCallback, useEffect, useMemo, useState } from 'react';
import { formatLocalDate, getTodayString } from '@/utils/date';
import { getTripMembers, updateTripMemberRole } from '@/services/trip-members.service';
import { updateTripMeta, deleteTrip, adjustTripDates } from '@/services/trips.service';
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

const formatTime = (value) => {
  if (!value) return '';
  if (typeof value !== 'string') return value;
  return value.length >= 5 ? value.slice(0, 5) : value;
};

const mapScheduleToDays = (scheduleDays, fallbackStartDate) => {
  if (!Array.isArray(scheduleDays) || scheduleDays.length === 0) {
    return [
      {
        id: null,
        label: '1일차',
        date: fallbackStartDate,
        items: [],
      },
    ];
  }

  return scheduleDays.map((day, index) => ({
    id: day.dayId ?? `day-${index + 1}`,
    label: `${index + 1}일차`,
    date: day.date ?? fallbackStartDate,
    items: Array.isArray(day.items)
      ? day.items.map((item, itemIndex) => ({
          id: item.itemId ?? `item-${index + 1}-${itemIndex + 1}`,
          time: formatTime(item.time),
          placeId: item.place?.id ?? null,
          placeName: item.place?.name ?? '',
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
    title: '',
    startDate: today,
    endDate: today,
    region: '',
    isPublic: false,
  });
  const [days, setDays] = useState([]);
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
  const [members, setMembers] = useState([]);

  const currentDay =
    days[currentDayIndex] ??
    {
      id: null,
      label: '1??',
      date: form.startDate || today,
      items: [],
    };
  const todayString = today;

  const loadTripDetail = useCallback(async () => {
    if (!tripId) return;
    const { summary, schedule } = await getTripDetail(tripId);

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
  }, [tripId, today]);

  useEffect(() => {
    if (!tripId) return;
    let isMounted = true;

    const loadTrip = async () => {
      try {
        await loadTripDetail();
      } catch (error) {
        if (!isMounted) return;
        console.error('Failed to load trip detail:', error);
      }
    };

    void loadTrip();

    return () => {
      isMounted = false;
    };
  }, [loadTripDetail, tripId]);

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

  const searchResults = useMemo(() => [], []);

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
  const currentUserRole = currentMember
    ? currentMember.isOwner
      ? 'owner'
      : 'editor'
    : null;
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
      if (prev.length === 0) {
        const nextDate = form.startDate ?? today;
        const nextDay = {
          id: `day-1`,
          label: '1일차',
          date: nextDate,
          items: [],
        };
        setCurrentDayIndex(0);
        setForm((formPrev) => ({ ...formPrev, endDate: nextDate }));
        return [nextDay];
      }

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
  }, [form.startDate, today]);

  const goPrevDay = useCallback(() => {
    if (days.length == 0) return;
    setCurrentDayIndex((prev) => (prev === 0 ? days.length - 1 : prev - 1));
  }, [days.length]);

  const goNextDay = useCallback(() => {
    if (days.length == 0) return;
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
          const placeName =
            typeof place === 'string' ? place : place?.name ?? '';
          const placeId =
            typeof place === 'string' ? null : place?.id ?? null;
          const nextItem = {
            id: `item-${Date.now()}`,
            time: nextTime,
            placeId,
            placeName,
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
            items: day.items.map((item) => {
              if (item.id !== itemId) return item;
              return {
                ...item,
                ...patch,
                placeName: patch.placeName ?? patch.place ?? item.placeName,
              };
            }),
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

  const saveTripChanges = useCallback(async () => {
    if (!tripId) return null;
    const trimmedTitle = form.title?.trim();
    const safeTitle = trimmedTitle ? trimmedTitle : null;
    await updateTripMeta({
      tripId,
      title: safeTitle,
      visibility: form.isPublic ? 'public' : 'private',
    });
    await adjustTripDates({
      tripId,
      startDate: form.startDate,
      endDate: form.endDate,
    });
    await loadTripDetail();
    return true;
  }, [form.endDate, form.isPublic, form.startDate, form.title, loadTripDetail, tripId]);

  const toggleVisibility = useCallback(async () => {
    const nextVisibility = form.isPublic ? 'private' : 'public';
    if (tripId) {
      await updateTripMeta({ tripId, visibility: nextVisibility });
    }
    setForm((prev) => ({
      ...prev,
      isPublic: nextVisibility === 'public',
    }));
    return nextVisibility;
  }, [form.isPublic, tripId]);

  const deleteTripPlan = useCallback(async () => {
    if (!tripId) return null;
    return deleteTrip({ tripId });
  }, [tripId]);

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
    isOwner: currentUserRole === 'owner',
    saveTripChanges,
    toggleVisibility,
    deleteTripPlan,
    //지도 관련 변수
    mapCurrentDayPos,
    mapSearchPlacePos
  };
};
