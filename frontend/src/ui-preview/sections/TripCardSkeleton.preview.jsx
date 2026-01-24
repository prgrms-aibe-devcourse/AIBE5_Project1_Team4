import React from 'react';
import TripCardSkeleton from '../../components/trip/TripCardSkeleton';

const TripCardSkeletonPreview = () => {
  return (
    <div style={{ maxWidth: 400 }}>
      <TripCardSkeleton />
    </div>
  );
};

export default TripCardSkeletonPreview;
