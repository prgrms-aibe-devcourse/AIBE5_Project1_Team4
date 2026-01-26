import React from 'react';
import { Modal, ListGroup, Spinner } from 'react-bootstrap';

const StatDetailModal = ({ show, onHide, title, data = [], loading }) => {
  return (
    <Modal show={show} onHide={onHide} centered scrollable>
      <Modal.Header closeButton className="border-0">
        <Modal.Title className="fw-bold fs-5">{title} 목록 (최근 5개)</Modal.Title>
      </Modal.Header>
      <Modal.Body className="pt-0">
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" size="sm" />
            <p className="text-muted small mt-2">불러오는 중...</p>
          </div>
        ) : (
          <ListGroup variant="flush">
            {data.length > 0 ? (
              data.map((item, idx) => (
                <ListGroup.Item key={idx} className="py-3 border-light">
                  <div className="fw-bold text-dark">{item.title || item.name || '제목 없음'}</div>
                  <div className="text-muted small">{item.description || item.location || '상세 정보가 없습니다.'}</div>
                </ListGroup.Item>
              ))
            ) : (
              <div className="text-center py-5 text-muted small">
                아직 등록된 {title} 항목이 없습니다.
              </div>
            )}
          </ListGroup>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default StatDetailModal;