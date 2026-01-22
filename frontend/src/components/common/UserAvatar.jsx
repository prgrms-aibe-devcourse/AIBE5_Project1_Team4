// src/components/common/UserAvatar.jsx
import React from 'react';
import { Image } from 'react-bootstrap';

const UserAvatar = ({ src, name = "User", size = 40 }) => {
  // 이미지가 있으면 이미지 보여주고, 없으면 색깔 원에 글자
  if (src) {
    return (
      <Image 
        src={src} 
        roundedCircle 
        width={size} 
        height={size} 
        style={{ objectFit: 'cover', border: '2px solid white', cursor: 'pointer' }}
        title={name} // 마우스 올리면 이름 나옴
      />
    );
  }

  return (
    <div 
      className="d-flex align-items-center justify-content-center rounded-circle bg-primary text-white fw-bold"
      style={{ width: size, height: size, fontSize: size * 0.4, border: '2px solid white', cursor: 'pointer' }}
      title={name}
    >
      {name.charAt(0)}
    </div>
  );
};

export default UserAvatar;