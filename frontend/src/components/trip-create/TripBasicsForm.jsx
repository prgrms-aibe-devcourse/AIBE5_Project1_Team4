// Trip basics form for title/region/date/public flags.
const TripBasicsForm = ({ form, onChange }) => {
  return (
    <div className="trip-basics">
      <div className="trip-basics-grid">
        <label className="trip-basics-field">
          <span>제목</span>
          <input
            type="text"
            value={form.title}
            onChange={(event) => onChange('title', event.target.value)}
          />
        </label>
        <label className="trip-basics-field">
          <span>지역</span>
          <input
            type="text"
            value={form.region}
            onChange={(event) => onChange('region', event.target.value)}
          />
        </label>
        <label className="trip-basics-field">
          <span>시작일</span>
          <input
            type="date"
            value={form.startDate}
            onChange={(event) => onChange('startDate', event.target.value)}
          />
        </label>
        <label className="trip-basics-field">
          <span>종료일</span>
          <input
            type="date"
            value={form.endDate}
            onChange={(event) => onChange('endDate', event.target.value)}
          />
        </label>
        <label className="trip-basics-field trip-basics-toggle">
          <span>공개</span>
          <input
            type="checkbox"
            checked={form.isPublic}
            onChange={(event) => onChange('isPublic', event.target.checked)}
          />
        </label>
      </div>
    </div>
  );
};

export default TripBasicsForm;
