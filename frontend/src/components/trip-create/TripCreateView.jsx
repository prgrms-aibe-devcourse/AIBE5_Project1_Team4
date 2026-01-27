import '../../pages/trip-create.css';
import TripCreateFrame from './TripCreateFrame';
import { useState } from 'react';
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
  } = useTripCreateForm({ tripId });

  const [transferTarget, setTransferTarget] = useState(null);
  const [removeTarget, setRemoveTarget] = useState(null);
  const transferMember = members.find((member) => member.id === transferTarget);
  const removeMemberTarget = members.find((member) => member.id === removeTarget);

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
                  onShare={() => {}}
                  onOpenMembers={() => {
                    setActivePanelTab('members');
                    setIsPanelOpen(true);
                  }}
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