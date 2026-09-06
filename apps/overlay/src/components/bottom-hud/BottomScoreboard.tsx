import React  from "react";

export const BottomScoreboard = () => { 
    return (
        <div style={{
            width: '1237px', 
            height: '159px',
            backgroundColor: '#2a2a2a', 
            border: '2px solid red',
            position: 'absolute',
            bottom: '0',
            left: '50%',
            transform: 'translateX(-50%)', 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
        }}>
        하단 스코어보드 뼈대 영역 
        </div>
    );
};