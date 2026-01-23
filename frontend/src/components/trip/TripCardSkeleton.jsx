import { Card } from 'react-bootstrap';

export default function TripCardSkeleton() {
  return (
    <Card className="h-100 shadow-sm">
      <div style={{ height: 180 }} className="bg-light" />
      <Card.Body>
        <div className="placeholder-glow">
          <div className="placeholder col-7 mb-2" />
          <div className="placeholder col-10 mb-1" />
          <div className="placeholder col-9 mb-3" />
          <div className="d-flex gap-2">
            <span className="placeholder col-3" />
            <span className="placeholder col-4" />
            <span className="placeholder col-3" />
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}
