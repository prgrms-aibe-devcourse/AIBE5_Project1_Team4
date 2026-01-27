import '../../pages/trip-create.css';
import TripCreateFrame from './TripCreateFrame';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { alert, confirm, toast } from '@/shared/ui/overlay';
import TripSearchPanel from './TripSearchPanel';
import TripSidePanel from './TripSidePanel';
import TripCreateTitle from './TripCreateTitle';
import TripTopActions from './TripTopActions';
import TripOwnerTransferModal from './TripOwnerTransferModal';
import { useTripCreateForm } from '../../hooks/trip-create/useTripCreateForm';

// ✅ [수정] 부모(TripCreate)에게서 onInvite를 받아옵니다.
const TripCreateView = ({ tripId, onInvite }) => {
  const {
    form,
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
    canManageMembers,
    isOwner,
    toggleVisibility,
    deleteTripPlan,
    saveTripChanges,
    mapCurrentDayPos,
    mapSearchPlacePos,
  } = useTripCreateForm({ tripId });

  const navigate = useNavigate();
  const [transferTarget, setTransferTarget] = useState(null);
  const [removeTarget, setRemoveTarget] = useState(null);
  const [saveState, setSaveState] = useState('idle');
  const transferMember = members.find((member) => member.id === transferTarget);
  const removeMemberTarget = members.find((member) => member.id === removeTarget);

  useEffect(() => {
    if (saveState !== 'saved') return;
    const timer = setTimeout(() => setSaveState('idle'), 2000);
    return () => clearTimeout(timer);
  }, [saveState]);

  const handleSave = useCallback(async () => {
    try {
      setSaveState('saving');
      await saveTripChanges();
      setSaveState('saved');
      toast('저장되었습니다.', { icon: 'success' });
    } catch (error) {
      console.error('Failed to save trip:', error);
      setSaveState('idle');
      toast('저장에 실패했습니다.', { icon: 'error' });
    }
  }, [saveTripChanges]);

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

  const handleToggleVisibility = async () => {
    try {
      const nextVisibility = await toggleVisibility();
      toast(
        nextVisibility === 'public'
          ? '공개로 변경되었습니다.'
          : '비공개로 변경되었습니다.',
        { icon: 'success' },
      );
    } catch (error) {
      console.error('Failed to update visibility:', error);
      toast('공개 설정 변경에 실패했습니다.', { icon: 'error' });
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast('링크가 복사되었습니다.', { icon: 'success' });
    } catch (error) {
      console.error('Failed to copy link:', error);
      await alert({
        text: '링크 복사에 실패했습니다.',
        icon: 'error',
      });
    }
  };

  const handleDeleteTrip = async () => {
    if (!isOwner) {
      await alert({
        text: '그룹장만 삭제가 가능합니다',
        icon: 'error',
      });
      return;
    }

    const tripTitle = form.title?.trim() || '이';
    const ok = await confirm({
      title: '여행 계획 삭제',
      text: `${tripTitle} 여행 계획을 삭제하시겠습니까?`,
      confirmText: '예',
      cancelText: '아니요',
      danger: true,
    });

    if (!ok) return;

    try {
      await deleteTripPlan();
      toast('여행 계획이 삭제되었습니다.', { icon: 'success' });
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Failed to delete trip:', error);
      await alert({
        text: '여행 계획 삭제 중 오류가 발생했습니다.',
        icon: 'error',
      });
    }
  };

  const closeMenus = () => {
    setIsDayMenuOpen(false);
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
    setIsDayMenuOpen(false);
    setCalendarMonth(currentDay.date);
    setIsCalendarOpen((prev) => !prev);
  };

  const scheduleProps = {
    items: currentDay.items,
    summary,
    onAddItem: () => addScheduleItem(),
    onRemoveItem: removeScheduleItem,
    onUpdateItem: updateScheduleItem,
  };

  const dayNavProps = {
    currentDay,
    todayString,
    onPrevDay: handlePrevDay,
    onNextDay: handleNextDay,
    onAddDay: handleAddDay,
    isDayMenuOpen,
    onToggleDayMenu: (event) => {
      event.stopPropagation();
      setIsCalendarOpen(false);
      setIsDayMenuOpen((prev) => !prev);
    },
    onCloseDayMenu: () => {
      setIsDayMenuOpen(false);
      setIsCalendarOpen(false);
    },
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
                  onShare={handleShare}
                  onOpenMembers={() => {
                    setActivePanelTab('members');
                    setIsPanelOpen(true);
                  }}
                  onToggleVisibility={handleToggleVisibility}
                  isPublic={form.isPublic}
                  onSave={handleSave}
                  saveLabel={
                    saveState === 'saving'
                      ? '저장 중...'
                      : saveState === 'saved'
                        ? '저장됨'
                        : '저장'
                  }
                  onDelete={handleDeleteTrip}
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
              
              // ✅ [추가] 여기가 핵심! 드롭다운 값을 폼 상태(visibility)에 저장합니다.
              onVisibilityChange={(nextVis) => setFormField('visibility', nextVis)}
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

          //지도에 마킹할 데이터 전달
          mapCurrentDayPos={mapCurrentDayPos} //검색 장소들
          mapSearchPlacePos={mapSearchPlacePos} //일정 장소들

          searchPanel={
            <TripSearchPanel
              isOpen={isSearchOpen}
              onClose={() => setIsSearchOpen(false)}
              query={searchQuery}
              results={searchResults}
              dayLabel={currentDay.label}
              onQueryChange={setSearchQuery}
              onSelectPlace={(place) => addScheduleItem(place)}
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
              
              // ✅ [유지] memberProps에 onInvite가 잘 들어가 있습니다.
              memberProps={{
                members,
                onToggleMember: toggleMember,
                canManageMembers,
                onInvite, 
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