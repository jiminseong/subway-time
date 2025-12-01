import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const origin = searchParams.get('origin');
    const destination = searchParams.get('destination');
    const mode = searchParams.get('mode') || 'transit'; // transit, driving, walking

    if (!origin || !destination) {
      return NextResponse.json(
        { error: 'Origin and destination are required' },
        { status: 400 }
      );
    }

    // Google Maps API 키 확인
    const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    if (!googleMapsApiKey) {
      // API 키가 없으면 더미 데이터 반환
      return NextResponse.json(getDummyRouteData(origin, destination, mode));
    }

    // Google Directions API 호출
    const directionsUrl = new URL('https://maps.googleapis.com/maps/api/directions/json');
    directionsUrl.searchParams.append('origin', origin);
    directionsUrl.searchParams.append('destination', destination);
    directionsUrl.searchParams.append('mode', mode);
    directionsUrl.searchParams.append('key', googleMapsApiKey);
    directionsUrl.searchParams.append('language', 'ko');
    directionsUrl.searchParams.append('region', 'KR');

    const response = await fetch(directionsUrl.toString());
    
    if (!response.ok) {
      throw new Error(`Google Maps API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== 'OK' || !data.routes || data.routes.length === 0) {
      return NextResponse.json(
        { error: 'No routes found between the specified locations' },
        { status: 404 }
      );
    }

    const route = data.routes[0];
    const leg = route.legs[0];

    // 한국 대중교통 정보 추가 처리
    const transitInfo = extractTransitInfo(leg);

    const result = {
      origin: leg.start_address,
      destination: leg.end_address,
      duration: {
        minutes: Math.ceil(leg.duration.value / 60),
        text: leg.duration.text
      },
      distance: {
        meters: leg.distance.value,
        text: leg.distance.text
      },
      mode: mode,
      steps: leg.steps.map((step: any) => ({
        instruction: step.html_instructions.replace(/<[^>]*>/g, ''),
        duration: Math.ceil(step.duration.value / 60),
        distance: step.distance.text,
        travelMode: step.travel_mode,
        transitDetails: step.transit_details ? {
          line: step.transit_details.line?.name || step.transit_details.line?.short_name,
          vehicle: step.transit_details.line?.vehicle?.name,
          departure: step.transit_details.departure_stop?.name,
          arrival: step.transit_details.arrival_stop?.name,
          stops: step.transit_details.num_stops
        } : null
      })),
      transitInfo,
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error fetching route data:', error);
    
    // 에러 발생 시 더미 데이터 반환
    const { searchParams } = new URL(request.url);
    const origin = searchParams.get('origin') || '출발지';
    const destination = searchParams.get('destination') || '도착지';
    const mode = searchParams.get('mode') || 'transit';

    return NextResponse.json(getDummyRouteData(origin, destination, mode));
  }
}

function getDummyRouteData(origin: string, destination: string, mode: string) {
  // 한국의 주요 지하철역 기반 더미 데이터
  const commonRoutes = {
    '강남': { '잠실': 15, '홍대': 35, '건대': 25, '신촌': 30 },
    '홍대': { '강남': 35, '잠실': 45, '건대': 20, '신촌': 10 },
    '잠실': { '강남': 15, '홍대': 45, '건대': 30, '신촌': 40 },
    '건대': { '강남': 25, '홍대': 20, '잠실': 30, '신촌': 25 }
  };

  // 기본 예상 시간 계산 (30-50분 사이)
  let estimatedMinutes = 35;
  
  // 더미 데이터에서 시간 찾기
  Object.entries(commonRoutes).forEach(([start, destinations]) => {
    if (origin.includes(start)) {
      Object.entries(destinations as Record<string, number>).forEach(([end, minutes]) => {
        if (destination.includes(end)) {
          estimatedMinutes = minutes;
        }
      });
    }
  });

  // 랜덤 변동 추가 (±5분)
  const variation = Math.floor(Math.random() * 11) - 5;
  estimatedMinutes = Math.max(10, estimatedMinutes + variation);

  return {
    origin,
    destination,
    duration: {
      minutes: estimatedMinutes,
      text: `약 ${estimatedMinutes}분`
    },
    distance: {
      meters: estimatedMinutes * 500, // 대략적인 거리
      text: `${(estimatedMinutes * 0.5).toFixed(1)}km`
    },
    mode,
    steps: [
      {
        instruction: `${origin}에서 지하철 탑승`,
        duration: 2,
        distance: '0.1km',
        travelMode: 'WALKING',
        transitDetails: null
      },
      {
        instruction: `지하철로 ${destination} 방면 이동`,
        duration: estimatedMinutes - 4,
        distance: `${(estimatedMinutes * 0.45).toFixed(1)}km`,
        travelMode: 'TRANSIT',
        transitDetails: {
          line: getRandomSubwayLine(),
          vehicle: '지하철',
          departure: `${origin}역`,
          arrival: `${destination}역`,
          stops: Math.floor(estimatedMinutes / 3)
        }
      },
      {
        instruction: `${destination}역에서 하차 후 도보`,
        duration: 2,
        distance: '0.1km',
        travelMode: 'WALKING',
        transitDetails: null
      }
    ],
    transitInfo: {
      totalStops: Math.floor(estimatedMinutes / 3),
      transfers: estimatedMinutes > 30 ? 1 : 0,
      mainLine: getRandomSubwayLine()
    },
    lastUpdated: new Date().toISOString(),
    isDummy: true
  };
}

function getRandomSubwayLine(): string {
  const lines = [
    '1호선', '2호선', '3호선', '4호선', '5호선', '6호선', '7호선', '8호선', '9호선',
    '분당선', '신분당선', '경의중앙선', '공항철도'
  ];
  return lines[Math.floor(Math.random() * lines.length)];
}

function extractTransitInfo(leg: any) {
  const transitSteps = leg.steps.filter((step: any) => step.travel_mode === 'TRANSIT');
  const totalStops = transitSteps.reduce((total: number, step: any) => 
    total + (step.transit_details?.num_stops || 0), 0);
  
  return {
    totalStops,
    transfers: transitSteps.length - 1,
    mainLine: transitSteps[0]?.transit_details?.line?.name || 'Unknown'
  };
}