import React from "react";
import type { GameState } from "@league-studio/shared-types";

export default function BottomScoreboard({gameState}: any) {
    //임시 선수들 5명을 그리기 위한 배열 
    const mockPlayers = [1,2,3,4,5];

    return (
        <div style=
        {StyleSheet.wrapper}>
            {mockPlayers.map((player, index)=>( 
                <div key={index} style={Styles.playerRow}>
                    {/*가이드에 맞춰 초상화, 아이템 등이 들어갈 공간 */}
                    <div>Player {player} Info</div>
                    <div> Items & Wards </div>
                     </div>
            ))}
            </div>
    );
}
    const style = {
        wrapper: {
            width: '834px',
            height: '250px',
            backgroundColor: '0a0a0c',
            display: 'flex',
            flexDirection: 'column' as const,
            justifyContent: 'space-evenly',

            //화면 하단 중앙 정령
            position:'absolute' as const,
            bottom: '20px',
            


        }
    }