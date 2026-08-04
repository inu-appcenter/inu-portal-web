import type { NearbyMemberResponseDto } from "@/types/friends";

// 실제 백엔드(inu-appcenter/inu-portal-server#302)가 없는 동안 프론트를 개발/테스트하기 위한 목.
// 후보 좌표를 절대 좌표(캠퍼스 등)로 고정하면 테스터의 실제 위치가 그 근처가 아닐 때
// 항상 결과가 0개로 보여 "안 되는 것"처럼 보인다 - 대신 호출 시점의 내 좌표를 기준으로 한
// 상대 오프셋(미터)으로 후보를 생성해 어디서 테스트하든 항상 재현 가능하게 한다.
const MOCK_CANDIDATES: {
  memberId: number;
  nickname: string;
  studentId: string;
  fireId: number;
  offsetNorthMeters: number;
  offsetEastMeters: number;
}[] = [
  { memberId: 501, nickname: "김유니", studentId: "202301234", fireId: 2, offsetNorthMeters: 40, offsetEastMeters: 30 },
  { memberId: 502, nickname: "박민서", studentId: "202201122", fireId: 4, offsetNorthMeters: -90, offsetEastMeters: 120 },
  { memberId: 503, nickname: "이지원", studentId: "202401987", fireId: 1, offsetNorthMeters: 150, offsetEastMeters: -60 },
  { memberId: 504, nickname: "최유리", studentId: "202101456", fireId: 5, offsetNorthMeters: -180, offsetEastMeters: -140 },
  // 기본 반경(200m) 밖: 반경 필터링이 실제로 동작하는지 확인용
  { memberId: 505, nickname: "홍길동", studentId: "202301789", fireId: 3, offsetNorthMeters: 300, offsetEastMeters: 250 },
];

const EARTH_RADIUS_METERS = 6371000;
const toRadians = (deg: number) => (deg * Math.PI) / 180;

function offsetLatLng(
  latitude: number,
  longitude: number,
  northMeters: number,
  eastMeters: number,
): { latitude: number; longitude: number } {
  const deltaLat = northMeters / 111320;
  const deltaLng = eastMeters / (111320 * Math.cos(toRadians(latitude)));
  return { latitude: latitude + deltaLat, longitude: longitude + deltaLng };
}

function haversineDistanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_METERS * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getMockNearbyFriends(
  latitude: number,
  longitude: number,
  radiusMeters: number,
): NearbyMemberResponseDto[] {
  return MOCK_CANDIDATES.map((candidate) => {
    const { latitude: candLat, longitude: candLng } = offsetLatLng(
      latitude,
      longitude,
      candidate.offsetNorthMeters,
      candidate.offsetEastMeters,
    );
    return {
      memberId: candidate.memberId,
      nickname: candidate.nickname,
      studentId: candidate.studentId,
      fireId: candidate.fireId,
      distanceMeters: Math.round(
        haversineDistanceMeters(latitude, longitude, candLat, candLng),
      ),
    };
  })
    .filter((candidate) => candidate.distanceMeters <= radiusMeters)
    .sort((a, b) => a.distanceMeters - b.distanceMeters);
}
