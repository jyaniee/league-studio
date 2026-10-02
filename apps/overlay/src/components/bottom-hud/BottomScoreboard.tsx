import React from "react";
import type { GameState, PlayerState, WardType } from "@league-studio/shared-types";

type BottomScoreboardProps = {
    gameState: GameState;
};
const EDGE =12;
const GAP = {
    wardToItems: 30,
    itemsToStats: 18,
    kdaToCs: 16,
    csToChampion: 6,
    center : 40,
};
const spacer = (width: number) : React.CSSProperties => ({width, flexShrink: 0 });

const DDRAGON_VERSION = "14.24.1";
const DDRAGON_IMG =`https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img`;
const championIcon = (name: string) => `${DDRAGON_IMG}/champion/${name}.png`;
const itemIcon = (id: number) => `${DDRAGON_IMG}/item/${id}.png`;

const WARD_ITEM_ID: Record<WardType, number> = {
    stealth: 3340,
    oracle: 3364,
    farsight: 3363,
};
    const ROW_COUNT = 5;
    const ITEM_SLOT_COUNT = 6;

const toSixSlots = (items: PlayerState["items"] = []) =>
    Array.from({ length: ITEM_SLOT_COUNT }, (_, i) => items[i] ?? null);

const kdaText = (p?: PlayerState) => (p ? `${p.kills}/${p.deaths}/${p.assists}` : "-");
const csText = (p?: PlayerState) => (p ? `${p.cs}` : "-");

function WardSlot({ ward }:{ ward?: WardType | null }) {
    return (
        <div style={styles.wardSlot}>
            {ward && <img src={itemIcon(WARD_ITEM_ID[ward])} alt={ward} style={styles.icon} />}
        </div>
    );
}
function ItemSlots({ items }: {items?: PlayerState["items"] }) {
    return ( 
        <div style={styles.itemContainer}>
            {toSixSlots(items).map ((id, i) => (
                <div key={i} style={styles.itemSlot}>
                    {id !== null && <img src={itemIcon(id)} alt="" style={styles.icon} />}
                    </div>
                 ))}
            </div>
    );
}

function ChampionPortrait({ name }: {name?: string}) {
    return (
        <div style={styles.championPortrait}>
            {name && <img src={championIcon(name)} alt={name} style={styles.icon} />}
         </div>
    );
}
    export default function BottomScoreboard({gameState}: BottomScoreboardProps) {
    const blueplayers = gameState.blueTeam.players ?? [];
    const redplayers = gameState.redTeam.players ??[];
    const rows = Array.from({ length: ROW_COUNT }, (_, i) => i);

    return (
        <div style={styles.container}>
            <div style={styles.header}>League Studio <div style={styles.divider}></div></div>

        {rows.map ((index) => {
            const blue = blueplayers [index];
            const red = redplayers[index];
            
            return (
                <div key={index} style={styles.rowWrapper}>


                   {/* [좌측 Anchor]: 블루 팀 영역 ( flex: 1) */}
                    <div style={styles.blueSide}>
                    <WardSlot ward={blue?.ward} />
                    <div style={spacer(GAP.wardToItems)}></div>

                    <ItemSlots items={blue?.items} />

                    <div style={spacer(GAP.itemsToStats)}></div>

                    <div style={styles.statsGroup}>
                        <span style={styles.kdaText}>{kdaText(blue)}</span>
                        <span style={styles.csTest}>{csText(blue)}</span>
                    </div>

                    <ChampionPortrait name={blue?.championName} />
                    </div>

                       {/* [전체 중앙축]: 양 팀을 가르는 절대 기준점*/}
                        <div style={styles.centerAxis}></div>


                       {/*[우측 Anchor]: 레드 팀 영역 (flex : 1) */}
                       <div style= {styles.redSide}>
                        <ChampionPortrait name={red?.championName} />
                        <div style={spacer (GAP.csToChampion)}></div>

                        <div style={styles.statsGroup}>
                            <span style={styles.csTest}>{csText(red)}</span>
                            <span style={styles.kdaText}>{kdaText(red)}</span>
                        </div>
                        <div style={spacer(GAP.itemsToStats)}></div>

                        <ItemSlots items={red?.items} />

                        <div style={spacer(GAP.wardToItems)}></div>

                        <WardSlot ward={red?.ward} />

                        {index < 4 && <div style={styles.divider}></div>}
                     </div>
                    </div>
                  );
                 })}
                  </div>
                );
            }

       const styles: { [key : string]: React.CSSProperties } = {
        container: {
             width: '834px',
             height: '250px',
             backgroundColor: '#17112B',
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
                position: 'relative',
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
                justifyContent: 'flex-end',
             },

        redSide: {
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
             },

        centerAxis: {
                width: GAP.center,
                flexShrink: 0,
             },

        championPortrait: {
                width: '35px',
                height: '35px',
                border: '1px solid #ffffff',
                backgroundColor: 'transparent',
                boxSizing: 'border-box',
                flexShrink: 0,
             },

        wardSlot: {
                width: '30px',
                height: '30px',
                backgroundColor: '#000000',
                flexShrink: 0,
             },

        itemContainer: {
                display: 'flex',
                flexShrink : 0,
            },

        itemSlot: {
                width: '30px',
                height: '30px',
                backgroundColor: '#000000',
                flexShrink : 0,
        },
                icon: {
                    width: '100%',
                    height: '100%',
                    display: 'block',
                },

        statsGroup: {
                display: 'flex',
                alignItems: 'center',
                gap: GAP .kdaToCs,
               flexShrink: 0,
            },
        kdaText: {
                fontSize: '18px',
                fontWeight: 400,
                minWidth: '44px',
                textAlign: 'center',
                fontVariantNumeric: 'tabular-nums',
                whiteSpace: 'nowrap',
            },

        csTest: {
                fontSize: '15px',
                fontWeight: 400,
                color: '#ffffff',
                minWidth: '26px',
                textAlign: 'center',
                fontVariantNumeric: 'tabular-nums',
            },

        divider: {
                position: 'absolute',
                bottom: 0,
                left: EDGE,
                right: EDGE,
                height: '1px',
                backgroundColor: '#FFFFFF',
            },
        };