import '../../pages/trip-create.css';
import TripCreateFrame from './TripCreateFrame';
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import TripSearchPanel from './TripSearchPanel';
import TripSidePanel from './TripSidePanel';
import TripCreateTitle from './TripCreateTitle';
import TripTopActions from './TripTopActions';
import TripOwnerTransferModal from './TripOwnerTransferModal';
import { useTripCreateForm } from '../../hooks/trip-create/useTripCreateForm';
import { alert, confirm, toast } from '@/shared/ui/overlay';


// ✅ [수정 1] 부모(TripCreate)에게서 onInvite를 받아옵니다.
const TripCreateView = ({ tripId, onInvite }) => {
  const navigate = useNavigate();
  const {
    form,
    isLoaded,
    days,
    setFormField,
    currentDay,
    currentDayIndex,
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
    deleteCurrentDay,
    members,
    toggleMember,
    transferOwner,
    removeMember,
    canManageMembers,
    isOwner,
    saveTripChanges,
    toggleVisibility,
    deleteTripPlan,
    mapCurrentDayPos,
    mapSearchPlacePos,
  } = useTripCreateForm({ tripId });

  const [transferTarget, setTransferTarget] = useState(null);
  const [removeTarget, setRemoveTarget] = useState(null);
  const [selectedScheduleId, setSelectedScheduleId] = useState(null);
  const [saveState, setSaveState] = useState(tripId ? 'saved' : 'dirty');
  const lastSavedSignature = useRef('');
  const pendingSaveRef = useRef(false);
  const hasInitialized = useRef(false);
  const transferMember = members.find((member) => member.id === transferTarget);
  const removeMemberTarget = members.find((member) => member.id === removeTarget);

  // 선택된 일정 항목의 좌표 계산
  const selectedLocation = useMemo(() => {
    if (!selectedScheduleId || !currentDay.items) return null;
    const selectedItem = currentDay.items.find((item) => item.id === selectedScheduleId);
    if (!selectedItem || !selectedItem.lat || !selectedItem.lng) return null;
    return {
      lat: Number(selectedItem.lat),
      lng: Number(selectedItem.lng),
    };
  }, [selectedScheduleId, currentDay.items]);

  const signature = useMemo(
    () => JSON.stringify({ form, days }),
    [form, days],
  );

  useEffect(() => {
    if (!hasInitialized.current) {
      if (!isLoaded) return;
      lastSavedSignature.current = signature;
      setSaveState(tripId ? 'saved' : 'dirty');
      hasInitialized.current = true;
      return;
    }

    if (pendingSaveRef.current) {
      lastSavedSignature.current = signature;
      pendingSaveRef.current = false;
      setSaveState('saved');
      return;
    }

    if (signature !== lastSavedSignature.current) {
      setSaveState('dirty');
    }
  }, [signature, tripId, isLoaded]);

  const closeMenus = () => {
    setIsCalendarOpen(false);
  };

  const handleAddDay = () => {
    addDay();
    closeMenus();
  };

  const handlePrevDay = () => {
    goPrevDay();
    closeMenus();
  };

  const handleNextDay = () => {
    goNextDay();
    closeMenus();
  };

  const handleSelectDate = (nextDate) => {
    if (currentDayIndex === 0) {
      updateDayDates(nextDate);
    } else {
      updateCurrentDayDate(nextDate);
    }
    setIsCalendarOpen(false);
  };

  const handleToggleCalendar = () => {
    setCalendarMonth(currentDay.date);
    setIsCalendarOpen((prev) => !prev);
  };

  const [isDeletingDay, setIsDeletingDay] = useState(false);

  const handleDeleteDay = useCallback(async () => {
    const isConfirmed = await confirm({
      title: '일차 삭제',
      text: '이 Day의 모든 일정이 함께 삭제됩니다. 정말 삭제할까요?',
      confirmText: '삭제',
      cancelText: '취소',
      danger: true,
    });
    if (!isConfirmed) return;

    setIsDeletingDay(true);
    try {
      await deleteCurrentDay();
      pendingSaveRef.current = true;
    } finally {
      setIsDeletingDay(false);
    }
  }, [deleteCurrentDay]);

  const handleSave = useCallback(async () => {
    if (!tripId) return;
    setSaveState('saving');
    try {
      const result = await saveTripChanges();
      if (result) {
        pendingSaveRef.current = true;
        toast('저장되었습니다.', { icon: 'success' });
      } else {
        setSaveState('dirty');
      }
    } catch (error) {
      console.error('Failed to save trip:', error);
      setSaveState('dirty');
      toast('저장에 실패했습니다.', { icon: 'error' });
    }
  }, [saveTripChanges, tripId]);

  const handleToggleVisibility = useCallback(async () => {
    try {
      const nextVisibility = await toggleVisibility();
      pendingSaveRef.current = true;
      toast(
        nextVisibility === 'public' ? '공개로 전환했습니다.' : '비공개로 전환했습니다.',
        { icon: 'success' },
      );
    } catch (error) {
      console.error('Failed to toggle visibility:', error);
      toast('공개 설정 변경에 실패했습니다.', { icon: 'error' });
    }
  }, [toggleVisibility]);

  const handleDelete = useCallback(async () => {
    if (!tripId) return;
    if (!isOwner) {
      await alert({
        title: '삭제 권한이 없습니다',
        text: '그룹장만 삭제할 수 있습니다.',
        icon: 'error',
      });
      return;
    }

    const isConfirmed = await confirm({
      title: '여행을 삭제할까요?',
      text: '삭제하면 되돌릴 수 없습니다.',
      confirmText: '삭제',
      cancelText: '취소',
      danger: true,
    });

    if (!isConfirmed) return;

    try {
      await deleteTripPlan();
      toast('삭제되었습니다.', { icon: 'success' });
      navigate('/');
    } catch (error) {
      console.error('Failed to delete trip:', error);
      await alert({
        title: '삭제에 실패했습니다',
        text: '잠시 후 다시 시도해주세요.',
        icon: 'error',
      });
    }
  }, [deleteTripPlan, isOwner, navigate, tripId]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        void handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  const saveLabel =
    saveState === 'saving' ? '저장중' : saveState === 'saved' ? '저장됨' : '저장';

  const scheduleProps = {
    items: currentDay.items,
    summary,
    onAddItem: () => addScheduleItem(), 
    onRemoveItem: removeScheduleItem,
    onUpdateItem: updateScheduleItem,
    onSelectSchedule: setSelectedScheduleId,
    selectedId: selectedScheduleId,
  };

  const dayNavProps = {
    currentDay,
    todayString,
    onPrevDay: handlePrevDay,
    onNextDay: handleNextDay,
    onAddDay: handleAddDay,
    onDeleteDay: handleDeleteDay,
    isDeletingDay,
    isCalendarOpen,
    onToggleCalendar: handleToggleCalendar,
    calendarInfo,
    onShiftCalendarMonth: shiftCalendarMonth,
    onSelectDate: handleSelectDate,
  };

  return (
    <div className="trip-create">
      <div className="trip-create-frame">
        <section className="trip-create-title">
          <div className="container-fluid">
            <TripCreateTitle
              form={form}
              actions={
                <TripTopActions
                  onShare={onInvite}
                  onOpenMembers={() => {
                    setActivePanelTab('members');
                    setIsPanelOpen(true);
                  }}
                  onToggleVisibility={handleToggleVisibility}
                  isPublic={form.isPublic}
                  onSave={handleSave}
                  saveLabel={saveLabel}
                  onDelete={handleDelete}
                />
              }
              isRangeCalendarOpen={isRangeCalendarOpen}
              rangeCalendarInfo={rangeCalendarInfo}
              onToggleRangeCalendar={() =>
                isRangeCalendarOpen ? closeRangeCalendar() : openRangeCalendar()
              }
              onShiftRangeMonth={shiftRangeCalendarMonth}
              onSelectRangeDate={selectRangeDate}
              onTitleChange={(nextTitle) => setFormField('title', nextTitle)}
            />
          </div>
        </section>
        <TripCreateFrame
          isPanelOpen={isPanelOpen}
          isSearchOpen={isSearchOpen}
          onOpenPanel={() => setIsPanelOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onClosePanel={() => setIsPanelOpen(false)}
          onCloseSearch={() => setIsSearchOpen(false)}
          onMapClick={closeMenus}
          mapCurrentDayPos={mapCurrentDayPos}
          mapSearchPlacePos={mapSearchPlacePos}
          selectedLocation={selectedLocation}
          searchPanel={
            <TripSearchPanel
              isOpen={isSearchOpen}
              onClose={() => setIsSearchOpen(false)}
              query={searchQuery}
              results={searchResults}
              dayLabel={currentDay.label}
              onQueryChange={setSearchQuery}
              onSelectPlace={(place) => addPlaceToSchedule(place)}
              isLoading={isSearchLoading}
              canLoadMore={canSearchLoadMore}
              onLoadMore={searchLoadMore}
              addingPlaceId={addingPlaceId}
            />
          }
          sidePanel={({ isOpen, onClose }) => (
            <TripSidePanel
              isOpen={isOpen}
              onClose={onClose}
              activeTab={activePanelTab}
              onChangeTab={setActivePanelTab}
              dayNavProps={dayNavProps}
              scheduleProps={scheduleProps}
              
              // ✅ [수정 2] memberProps 안에 onInvite를 넣어서 TripSidePanel로 내려줍니다!
              memberProps={{
                members,
                onToggleMember: toggleMember,
                canManageMembers,
                onInvite, // 👈 여기가 핵심입니다!
                onOpenTransfer: (memberId) => {
                  if (canManageMembers) setTransferTarget(memberId);
                },
                onRemoveMember: (memberId) => {
                  if (canManageMembers) setRemoveTarget(memberId);
                },
              }}
            />
          )}
        />
      </div>
      {transferTarget && (
        <TripOwnerTransferModal
          memberName={transferMember?.name ?? ''}
          title="그룹장 양도"
          message={`${transferMember?.name ?? ''}님에게 그룹장을 양도할까요?`}
          confirmLabel="예"
          cancelLabel="아니오"
          onConfirm={() => {
            transferOwner(transferTarget);
            setTransferTarget(null);
          }}
          onCancel={() => setTransferTarget(null)}
        />
      )}
      {removeTarget && (
        <TripOwnerTransferModal
          memberName={removeMemberTarget?.name ?? ''}
          title="참여자 내보내기"
          message={`${removeMemberTarget?.name ?? ''}님을 내보낼까요?`}
          confirmLabel="예"
          cancelLabel="아니오"
          onConfirm={() => {
            removeMember(removeTarget);
            setRemoveTarget(null);
          }}
          onCancel={() => setRemoveTarget(null)}
        />
      )}
    </div>
  );
};

export default TripCreateView;
