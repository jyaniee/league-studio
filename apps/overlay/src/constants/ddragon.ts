//Data Dragon(라이엇 정적 리소스) 버전 및 이미지 경로 
//패치 반영 시 이 버전만 바꾸면 됨 
export const DDRAGON_VERSION= "14.24.1";

export const DDRAGON_IMG = `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img`;

export const championIcon = (name: string) => `${DDRAGON_IMG}/champion/${name}.png`;
export const itemIcon = (id: number) => `${DDRAGON_IMG}/item/${id}.png`;