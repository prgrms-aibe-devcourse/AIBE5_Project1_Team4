import React from 'react';

// Member list with owner badge and action buttons.
const TripMemberPicker = ({
  members,
  onOpenTransfer,
  onRemoveMember,
  canManageMembers,
  onInvite, // 👈 [1. 추가] 부모(Page)에서 내려준 함수 받기
}) => {
  const totalCount = members ? members.length : 0;

  return (
    <div className="trip-member-picker">
      <div className="trip-member-header">
        <span className="trip-member-header-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <circle cx="8" cy="8" r="3" />
            <circle cx="16" cy="8" r="3" />
            <path d="M3 20c0-3 3-5 5-5s5 2 5 5" />
            <path d="M11 20c0-2 2-4 5-4s5 2 5 4" />
          </svg>
        </span>
        참여자 ({totalCount})
      </div>
      <ul className="trip-group-list">
        {members && members.map((member) => {
          const isOwner = member.isOwner;
          return (
            <li key={member.id} className="trip-member-item">
              <span className="trip-member-name">
                {isOwner && (
                  <span className="trip-member-role" aria-label="그룹장">
                    <svg viewBox="0 0 24 24" width="16" height="16">
                      <path d="M4 18h16l-2-9-4 4-2-6-2 6-4-4-2 9z" />
                      <path d="M4 18h16v2H4z" />
                    </svg>
                  </span>
                )}
                {member.name}
              </span>
              {canManageMembers && (
                <span
                  className={`trip-member-actions${isOwner ? ' is-hidden' : ''}`}
                >
                  {!isOwner && (
                    <>
                      <button
                        className="trip-member-icon-btn"
                        type="button"
                        aria-label="그룹장 양도"
                        onClick={() => onOpenTransfer?.(member.id)}
                      >
                        ⇄
                      </button>
                      <button
                        className="trip-member-icon-btn"
                        type="button"
                        aria-label="내보내기"
                        onClick={() => onRemoveMember?.(member.id)}
                      >
                        ↗
                      </button>
                    </>
                  )}
                </span>
              )}
            </li>
          );
        })}
      </ul>
      
      {/* 2. [핵심] 버튼 클릭 시 onInvite 실행 연결 */}
      <button 
        className="trip-group-invite" 
        type="button"
        onClick={onInvite} 
      >
        초대하기
      </button>
    </div>
  );
};

export default TripMemberPicker;