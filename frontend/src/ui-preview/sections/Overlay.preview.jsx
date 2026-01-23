import { Button } from 'react-bootstrap';
import { alert, confirm, toast } from '../../shared/ui/overlay';

const OverlayPreview = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-around' }}>
      <Button
        variant="outline-dark"
        onClick={() =>
          confirm({
            title: '정말 삭제할까요?',
            text: '되돌릴 수 없습니다.',
            confirmText: '삭제',
            cancelText: '취소',
          })
        }
      >
        확인/취소 모달
      </Button>
      <Button
        variant="outline-dark"
        onClick={() => alert({ title: '저장되었습니다', confirmText: '확인' })}
      >
        단순 알림 모달
      </Button>
      <Button variant="outline-dark" onClick={() => toast('저장되었습니다')}>
        토스트
      </Button>
    </div>
  );
};

export default OverlayPreview;
