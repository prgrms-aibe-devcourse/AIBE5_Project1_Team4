import React from 'react';

// Member list with separate sections for Owner and Crew
const TripMemberPicker = ({
  members,
  onOpenTransfer,
  onRemoveMember,
  canManageMembers,
  onInvite,
}) => {
  // [1단계] 데이터 분리하기 (filter 사용)
  const safeMembers = members || [];
  const owners = safeMembers.filter((m) => m.isOwner); // 방장 그룹
  const crew = safeMembers.filter((m) => !m.isOwner);  // 일반 팀원 그룹

  return (
    <div className="trip-member-picker">
      
      {/* --- [섹션 1] 👑 방장 (Owner) --- */}
      <div className="trip-member-section">
        <div className="trip-member-header">
          <span className="trip-member-header-icon">👑</span>
          그룹장
        </div>
        <ul className="trip-group-list">
          {owners.map((member) => (
            <li key={member.id} className="trip-member-item">
              <span className="trip-member-name owner-highlight">
                {member.name}
              </span>
              {/* 방장은 내보내기 버튼 없음 */}
            </li>
          ))}
        </ul>
      </div>

      <div className="trip-member-divider" /> {/* 구분선 (CSS 필요 시) */}

      {/* --- [섹션 2] 👥 팀원 (Crew) --- */}
      <div className="trip-member-section">
        <div className="trip-member-header">
          <span className="trip-member-header-icon">👥</span>
          참여자 ({crew.length})
        </div>
        
        {crew.length === 0 ? (
          <div className="trip-member-empty">
            아직 참여자가 없습니다.
          </div>
        ) : (
          <ul className="trip-group-list">
            {crew.map((member) => (
              <li key={member.id} className="trip-member-item">
                <span className="trip-member-name">
                  {member.name}
                </span>
                
                {/* 관리 권한이 있을 때만 버튼 표시 */}
                {canManageMembers && (
                  <span className="trip-member-actions">
                    <button
                      className="trip-member-icon-btn"
                      type="button"
                      title="그룹장 위임"
                      onClick={() => onOpenTransfer?.(member.id)}
                    >
                      ⇄
                    </button>
                    <button
                      className="trip-member-icon-btn remove-btn"
                      type="button"
                      title="내보내기"
                      onClick={() => onRemoveMember?.(member.id)}
                    >
                      ✕
                    </button>
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 초대 버튼 */}
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