import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { formatLocalDate, getTodayString } from '@/utils/date';
import { getTripMembers, updateTripMemberRole, upsertTripMember } from '@/services/trip-members.service';
import { updateTripMeta, deleteTrip, adjustTripDates } from '@/services/trips.service';
import { getTripDetail } from '@/services/trips.detail.service';
import { usePlaceSearch } from '@/hooks/usePlaceSearch';
import { useAddScheduleItem } from '@/hooks/useAddScheduleItem';
import { upsertScheduleItem, deleteScheduleItem } from '@/services/scheduleItems.service';
import { updatePlaceName } from '@/services/places.service';
import { toast } from '@/shared/ui/overlay';
import { useAuth } from '@/features/auth/hooks/useAuth';
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
          lat: item.place?.lat,
          lng: item.place?.lng,
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

const daysBetweenInclusive = (startDate, endDate) => {
  const [sy, sm, sd] = startDate.split('-').map(Number);
  const [ey, em, ed] = endDate.split('-').map(Number);
  const start = new Date(sy, sm - 1, sd);
  const end = new Date(ey, em - 1, ed);
  const diff = end.getTime() - start.getTime();
  if (Number.isNaN(diff)) return 1;
  return Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24)) + 1);
};

const buildDaysFromRange = (startDate, endDate, prevDays = []) => {
  const totalDays = daysBetweenInclusive(startDate, endDate);
  return Array.from({ length: totalDays }, (_, index) => {
    const prev = prevDays[index];
    return {
      id: prev?.id ?? `day-${index + 1}`,
      label: `${index + 1}일차`,
      date: addDays(startDate, index),
      items: Array.isArray(prev?.items) ? prev.items : [],
    };
  });
};

export const useTripCreateForm = ({ tripId } = {}) => {
  const { user } = useAuth();
  const today = getTodayString();
  const [form, setForm] = useState({
    title: '',
    startDate: today,
    endDate: addDays(today, 2),
    region: '서울',
    isPublic: true,
  });
  const [days, setDays] = useState([]);
  const [currentDayIndex, setCurrentDayIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(!tripId);

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
  const [viewerRole, setViewerRole] = useState(null);
  const originalDatesRef = useRef({ startDate: null, endDate: null });

  const currentDay =
    days[currentDayIndex] ??
    {
      id: null,
      label: '1??',
      date: form.startDate || today,
      items: [],
    };
  const todayString = today;

  const loadTripDetail = useCallback(async ({ resetDayIndex = true } = {}) => {
    if (!tripId) return;
    const { summary, schedule } = await getTripDetail(tripId);

    const trip = summary?.trip;
    if (trip) {
      setForm((prev) => {
        const nextStart = trip.startDate ?? prev.startDate;
        const nextEnd = trip.endDate ?? prev.endDate;
        originalDatesRef.current = { startDate: nextStart, endDate: nextEnd };
        return {
          ...prev,
          title: trip.title ?? prev.title,
          startDate: nextStart,
          endDate: nextEnd,
          isPublic: trip.visibility === 'public',
        };
      });
    }

    const nextDays = mapScheduleToDays(
      schedule?.days,
      trip?.startDate ?? today,
    );
    setDays(nextDays);
    if (resetDayIndex) {
      setCurrentDayIndex(0);
    }
    if (summary?.viewer?.role) {
      setViewerRole(summary.viewer.role);
    }
    return { summary, schedule };
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
      } finally {
        if (isMounted) {
          setIsLoaded(true);
        }
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

  // 장소 검색
  const {
    places: searchResults,
    isLoading: isSearchLoading,
    canLoadMore: canSearchLoadMore,
    loadMore: searchLoadMore,
  } = usePlaceSearch(searchQuery, { enabled: isSearchOpen });

  // 일정에 장소 추가
  // 전략: optimistic insert (즉시 로컬 반영) + server reload (데이터 일관성)
  const {
    add: addPlaceToServer,
    isAdding: isAddingPlace,
    addingPlaceId,
  } = useAddScheduleItem(currentDay.id, {
    onSuccess: (_result, place) => {
      // 1) 로컬 상태에 즉시 반영 (optimistic)
      addScheduleItem(place);
      toast(`${place.name} 추가됨`, { icon: 'success' });
      // 2) 서버에서 최신 데이터 갱신 (현재 day 유지)
      loadTripDetail({ resetDayIndex: false }).catch(() => {});
    },
    onError: (error, place) => {
      const kind = error?.kind ?? 'unknown';
      const messages = {
        auth: '로그인이 필요합니다.',
        forbidden: '편집 권한이 없습니다.',
        validation: '잘못된 요청입니다.',
      };
      toast(messages[kind] ?? `${place.name} 추가에 실패했습니다.`, { icon: 'error' });
    },
  });

  // tripDayId 유효성 검증을 포함한 래퍼
  const isValidUuid = (value) =>
    typeof value === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

  const addPlaceToSchedule = useCallback(
    (place, options) => {
      if (!isValidUuid(currentDay.id)) {
        console.warn('[addPlaceToSchedule] invalid tripDayId:', currentDay.id);
        toast('일정을 먼저 저장해주세요.', { icon: 'error' });
        return null;
      }
      return addPlaceToServer(place, options);
    },
    [currentDay.id, addPlaceToServer],
  );

  const getUserDisplayName = useCallback((currentUser) => {
    if (!currentUser) return 'Member';
    const meta = currentUser.user_metadata ?? {};
    return (
      meta.full_name ||
      meta.name ||
      meta.username ||
      currentUser.email ||
      'Member'
    );
  }, []);

  useEffect(() => {
    if (!tripId) return;
    let isMounted = true;

    const loadMembers = async () => {
      try {
        const result = await getTripMembers({ tripId });
        const list = result?.members || result?.data?.members || [];
        if (!isMounted) return;

        if (list.length === 0 && user) {
          const role = viewerRole ?? 'owner';
          setMembers([
            {
              id: user.id,
              name: getUserDisplayName(user),
              selected: true,
              isOwner: role === 'owner',
              isSelf: true,
              avatarUrl: user.user_metadata?.avatar_url ?? null,
            },
          ]);
          if (viewerRole) {
            try {
              await upsertTripMember({
                tripId,
                userId: user.id,
                role,
              });
            } catch (error) {
              console.error('Failed to upsert trip member:', error);
            }
          }
          return;


          
        }
        if (list.length === 0) return;

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
  }, [getUserDisplayName, tripId, user, viewerRole]);

  const currentMember = useMemo(
    () => members.find((member) => member.isSelf) ?? null,
    [members],
  );
  const currentUserRole = currentMember
    ? currentMember.isOwner
      ? 'owner'
      : 'editor'
    : viewerRole ?? null;
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
      setDays((prev) => {
        if (prev.length === 0) {
          return prev;
        }

        const nextStart = addDays(value, -currentDayIndex);
        const nextDays = prev.map((day, index) => ({
          ...day,
          date: addDays(nextStart, index),
        }));

        setForm((prevForm) => ({
          ...prevForm,
          startDate: nextStart,
          endDate: addDays(nextStart, prev.length - 1),
        }));

        return nextDays;
      });
    },
    [currentDayIndex],
  );

  const updateDateRange = useCallback((startDateValue, endDateValue) => {
    setForm((prev) => ({
      ...prev,
      startDate: startDateValue,
      endDate: endDateValue,
    }));
    setDays((prev) => buildDaysFromRange(startDateValue, endDateValue, prev));
    setCurrentDayIndex((prev) => {
      const totalDays = daysBetweenInclusive(startDateValue, endDateValue);
      return Math.min(prev, totalDays - 1);
    });
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
    async (itemId, patch) => {
      const target = currentDay.items.find((item) => item.id === itemId);
      if (!target) return;

      const nextPlaceName = patch.placeName ?? patch.place ?? target.placeName;
      const nextTime = patch.time ?? target.time;
      const timeChanged =
        typeof patch.time !== 'undefined' && patch.time !== target.time;
      const placeChanged =
        typeof patch.placeName !== 'undefined' &&
        patch.placeName !== target.placeName;

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
                placeName: nextPlaceName,
                time: nextTime,
              };
            }),
          };
        }),
      );

      const tasks = [];
      const isItemIdValid = isValidUuid(itemId);
      const dayId = target.tripDayId ?? currentDay.id ?? null;
      const isDayIdValid = isValidUuid(dayId);

      if (timeChanged && isItemIdValid) {
        tasks.push(
          upsertScheduleItem({
            id: itemId,
            tripDayId: isDayIdValid ? dayId : null,
            placeId: target.placeId ?? null,
            time: nextTime,
          }),
        );
      }

      if (placeChanged && target.placeId && isValidUuid(target.placeId)) {
        tasks.push(updatePlaceName({ placeId: target.placeId, name: nextPlaceName }));
      }

      if (tasks.length === 0) return;

      try {
        await Promise.all(tasks);
        await loadTripDetail({ resetDayIndex: false });
      } catch (error) {
        console.error('Failed to update schedule item:', error);
        toast('저장에 실패했습니다.', { icon: 'error' });
        await loadTripDetail({ resetDayIndex: false });
      }
    },
    [currentDay.id, currentDay.items, currentDayIndex, loadTripDetail],
  );

  const removeScheduleItem = useCallback(
    async (itemId) => {
      setDays((prev) =>
        prev.map((day, index) => {
          if (index !== currentDayIndex) {
            return day;
          }
          return { ...day, items: day.items.filter((item) => item.id !== itemId) };
        }),
      );

      if (!isValidUuid(itemId)) return;

      try {
        await deleteScheduleItem(itemId);
        await loadTripDetail({ resetDayIndex: false });
      } catch (error) {
        console.error('Failed to delete schedule item:', error);
        toast('저장에 실패했습니다.', { icon: 'error' });
        await loadTripDetail({ resetDayIndex: false });
      }
    },
    [currentDayIndex, loadTripDetail],
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

    const originalDates = originalDatesRef.current;
    const dateChanged =
      Boolean(originalDates.startDate) &&
      (form.startDate !== originalDates.startDate ||
        form.endDate !== originalDates.endDate);
    const hasScheduleItems = days.some((day) => (day.items || []).length > 0);

    try {
      await adjustTripDates({
        tripId,
        startDate: form.startDate,
        endDate: form.endDate,
      });
    } catch (error) {
      const errorCode = error?.detail?.code ?? error?.code ?? null;
      if (errorCode === '42702') {
        const detail = await loadTripDetail();
        const trip = detail?.summary?.trip;
        if (trip?.startDate === form.startDate && trip?.endDate === form.endDate) {
          return true;
        }
      }
      throw error;
    }

    if (dateChanged && hasScheduleItems) {
      const snapshot = days.map((day) => ({
        items: (day.items || []).map((item) => ({
          placeId: item.placeId ?? null,
          time: item.time ?? null,
        })),
      }));

      const detail = await loadTripDetail({ resetDayIndex: false });
      const targetDays = detail?.schedule?.days ?? [];

      const existingItemIds = targetDays
        .flatMap((day) => day.items || [])
        .map((item) => item.itemId ?? item.id)
        .filter((id) => isValidUuid(id));

      if (existingItemIds.length > 0) {
        await Promise.all(existingItemIds.map((id) => deleteScheduleItem(id)));
      }

      const insertTasks = [];
      let skipped = 0;

      snapshot.forEach((daySnapshot, index) => {
        const tripDayId = targetDays[index]?.dayId ?? null;
        if (!isValidUuid(tripDayId)) {
          skipped += daySnapshot.items.length;
          return;
        }
        daySnapshot.items.forEach((item) => {
          if (!isValidUuid(item.placeId)) {
            skipped += 1;
            return;
          }
          insertTasks.push(
            upsertScheduleItem({
              tripDayId,
              placeId: item.placeId,
              time: item.time ?? null,
            }),
          );
        });
      });

      if (insertTasks.length > 0) {
        await Promise.all(insertTasks);
      }

      if (skipped > 0) {
        toast(`장소 정보가 없는 일정 ${skipped}개는 복원되지 않았어요.`, {
          icon: 'error',
        });
      }

      await loadTripDetail({ resetDayIndex: false });
      return true;
    }

    await loadTripDetail();
    return true;
  }, [
    days,
    deleteScheduleItem,
    form.endDate,
    form.isPublic,
    form.startDate,
    form.title,
    loadTripDetail,
    tripId,
  ]);

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
        id: item.id,
        name: item.placeName,
        lat: Number(item.lat),
        lng: Number(item.lng)
      }))
      .filter(item => !isNaN(item.lat) && !isNaN(item.lng)); // 유효한 좌표만 추출
  }, [currentDay?.items]);
  //검색 결과 좌표 리스트
  const mapSearchPlacePos = useMemo(() => {
    return (searchResults || [])
      .map(place => ({
        ...place,
        lat: Number(place.latitude ?? place.lat),
        lng: Number(place.longitude ?? place.lng),
      }))
      .filter(place => !isNaN(place.lat) && !isNaN(place.lng));
  }, [searchResults]);


  return {
    form,
    isLoaded,
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
    isSearchLoading,
    canSearchLoadMore,
    searchLoadMore,
    addScheduleItem,
    addPlaceToSchedule,
    isAddingPlace,
    addingPlaceId,
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

