import React from "react";
import type { GameState } from "@league-studio/shared-types";

type BottomScoreboardProps = {
    gameState: GameState;
};

export default function BottomScoreboard({gameState}: BottomScoreboardProps) { 
    const players = [0,1,2,3,4];

    return (
        <div style={styles.container}>
            <div style={styles.header}>League Studio </div>

        {players.map((index) => (
            <div key={index} style={styles.rowWrapper}>

                   {/* [좌측 Anchor]: 블루 팀 영역 ( flex: 1) */}
                    <div style={styles.blueSide}>
                    <div style={styles.spellBox}></div>

                    {/* 아이템 그룹 (내부 Anchor)*/}
                    <div style = {styles.itemContainer}>
                        {[1,2,3,4,5,6].map((i) => <div key={i} style={styles.itemSlot}></div>)}
                        </div>

                       {/*스탯 그룹 (KDA, CS를 하나의 덩어리로 묶음) */}     
                       <div style={styles.statsGroup}>
                        <span style={styles.kdaText}>0/1/2</span>
                        <span style={styles.csTest}>123</span>
                       </div>

                       <div style={styles.championPortrait}></div>
                       </div>

                       {/* [전체 중앙축]: 양 팀을 가르는 절대 기준점*/}
                        <div style={styles.centerAxis}></div>

                       {/*[우측 Anchor]: 레드 팀 영역 (flex : 1) */}
                       <div style= {styles.redSide}>
                        <div style={styles.championPortrait}></div>

                        <div style={styles.statsGroup}>
                            <span style={styles.csTest}>123</span>
                            <span style={styles. kdaText}>0/1/2</span>
                        </div>

                        <div style={styles.itemContainer}>
                        {[1,2,3,4,5,6].map((i)=> (
                            <div key={i} style={styles.itemSlot}></div>
                            ))}
                        </div>

                        <div style={styles.spellBox}></div>

                        {index < 4 && <div style={styles.divider}></div>}
                     </div>
                    </div>
                  ))}
                  </div>
                );
            }             

       const styles: { [key : string]: React.CSSProperties } = {
        container: {
             width: '834px',
             height: '250px',
             backgroundColor: '#0a0a0c',
             display: 'flex',
             flexDirection: 'column',
             position: 'absolute',
             bottom: '0',
             left: '50%',
             transform: 'translateX(-50%)',
             color: '#ffffff',
             fontFamily: 'sans-serif',
        },

        header: {
                height:'22px',
                display:'flex',
                justifyContent:'center',
                alignItems: 'center',
                fontSize: '12px',
                fontWeight: 'bold',
            },

        rowWrapper: {
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
                padding: '0 12px',
             },

        blueSide: {
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingRight: '12px',
             },

        redSide: {
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingLeft: '12px',
             },
        
        redstats: {
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                minwidth: '80px',
                justifyContent: 'center',
             },

        centerAxis: {
                width: '16px',
             },

        championPortrait: {
                width: '35px',
                height: '35px',
                border: '1px solid #ffffff',
                backgroundColor: '#333',
                flexShrink: 0,
             },

             spellBox: {
                width: '30px',
                height: '30px',
                backgroundColor: '#2ecc71',
                flexShrink: 0,
             },

        itemContainer: {
                display: 'flex',
                gap: '2px',
            },

        itemSlot: {
                width: '30px',
                height: '30px',
                backgroundColor: '#000000',
            },

        statsGroup: {
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                minWidth: '80px',
                justifyContent: 'center',
            },
        kdaText: {
                fontSize: '14px',
                fontWeight: 'bold',
            },

        csTest: {
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#bdc3c7',
            },

        divider: {
                position: 'absolute',
                bottom: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '808px',
                height: '1px',
                backgroundColor: 'rgba(108, 92, 231, 0.5)',
            },
        };