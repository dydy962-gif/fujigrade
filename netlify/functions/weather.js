/* ============================================================
   FujiGrade Weather API Function
   기상청 AWS 일통계 자료 프록시 (sfc_aws_day.php)
============================================================ */

const AWS_STATIONS = [
  {id:42,name:"군산오식도",lat:35.93638,lon:126.59722},
  {id:90,name:"속초",lat:38.25085,lon:128.56473},
  {id:95,name:"철원",lat:38.14787,lon:127.3042},
  {id:98,name:"동두천",lat:37.90188,lon:127.0607},
  {id:99,name:"파주",lat:37.88589,lon:126.76648},
  {id:100,name:"대관령",lat:37.67713,lon:128.71834},
  {id:101,name:"춘천",lat:37.90262,lon:127.7357},
  {id:104,name:"북강릉",lat:37.80456,lon:128.85535},
  {id:105,name:"강릉",lat:37.75147,lon:128.89099},
  {id:106,name:"동해",lat:37.50709,lon:129.12433},
  {id:108,name:"서울",lat:37.57142,lon:126.9658},
  {id:112,name:"인천",lat:37.47772,lon:126.6249},
  {id:114,name:"원주",lat:37.33749,lon:127.94659},
  {id:119,name:"수원",lat:37.25746,lon:126.983},
  {id:121,name:"영월",lat:37.18126,lon:128.45743},
  {id:127,name:"충주",lat:36.97045,lon:127.9525},
  {id:129,name:"서산",lat:36.77658,lon:126.4939},
  {id:130,name:"울진",lat:36.99176,lon:129.41278},
  {id:131,name:"청주",lat:36.63924,lon:127.44066},
  {id:133,name:"대전",lat:36.37199,lon:127.3721},
  {id:135,name:"추풍령",lat:36.22025,lon:127.99458},
  {id:136,name:"안동",lat:36.57293,lon:128.70733},
  {id:137,name:"상주",lat:36.40837,lon:128.15741},
  {id:138,name:"포항",lat:36.03201,lon:129.38002},
  {id:140,name:"군산",lat:36.0053,lon:126.76135},
  {id:143,name:"대구",lat:35.87797,lon:128.65296},
  {id:146,name:"전주",lat:35.84092,lon:127.11718},
  {id:152,name:"울산",lat:35.58237,lon:129.33469},
  {id:155,name:"창원",lat:35.17019,lon:128.57282},
  {id:156,name:"광주",lat:35.17294,lon:126.89156},
  {id:159,name:"부산",lat:35.10468,lon:129.03203},
  {id:162,name:"통영",lat:34.84541,lon:128.43561},
  {id:165,name:"목포",lat:34.81732,lon:126.38151},
  {id:168,name:"여수",lat:34.73929,lon:127.74063},
  {id:170,name:"완도",lat:34.3959,lon:126.70182},
  {id:172,name:"고창",lat:35.34824,lon:126.599},
  {id:174,name:"순천",lat:35.0204,lon:127.3694},
  {id:177,name:"홍성",lat:36.65759,lon:126.68772},
  {id:184,name:"제주",lat:33.51411,lon:126.52969},
  {id:185,name:"고산",lat:33.29382,lon:126.16283},
  {id:188,name:"성산",lat:33.38677,lon:126.8802},
  {id:189,name:"서귀포",lat:33.24616,lon:126.5653},
  {id:192,name:"진주",lat:35.16378,lon:128.04004},
  {id:201,name:"강화",lat:37.70739,lon:126.44634},
  {id:202,name:"양평",lat:37.48863,lon:127.49446},
  {id:203,name:"이천",lat:37.26399,lon:127.48421},
  {id:211,name:"인제",lat:38.05991,lon:128.16811},
  {id:212,name:"홍천",lat:37.6836,lon:127.88043},
  {id:216,name:"태백",lat:37.17038,lon:128.98929},
  {id:217,name:"정선군",lat:37.38071,lon:128.67312},
  {id:221,name:"제천",lat:37.15928,lon:128.19433},
  {id:226,name:"보은",lat:36.48761,lon:127.73415},
  {id:232,name:"천안",lat:36.76217,lon:127.29282},
  {id:235,name:"보령",lat:36.32724,lon:126.55744},
  {id:236,name:"부여",lat:36.27242,lon:126.92079},
  {id:238,name:"금산",lat:36.10563,lon:127.48175},
  {id:239,name:"세종",lat:36.48522,lon:127.24438},
  {id:243,name:"부안",lat:35.72961,lon:126.71657},
  {id:244,name:"임실",lat:35.61203,lon:127.28556},
  {id:245,name:"정읍",lat:35.56337,lon:126.83904},
  {id:247,name:"남원",lat:35.4213,lon:127.39652},
  {id:248,name:"장수",lat:35.65696,lon:127.52031},
  {id:271,name:"봉화",lat:36.94361,lon:128.91449},
  {id:272,name:"영주",lat:36.87183,lon:128.51687},
  {id:273,name:"문경",lat:36.62727,lon:128.14879},
  {id:276,name:"청송",lat:36.4351,lon:129.04005},
  {id:277,name:"영덕",lat:36.53337,lon:129.40926},
  {id:278,name:"의성",lat:36.3561,lon:128.68864},
  {id:279,name:"구미",lat:36.13055,lon:128.32055},
  {id:281,name:"영천",lat:35.97742,lon:128.9514},
  {id:283,name:"경주",lat:35.81747,lon:129.20123},
  {id:284,name:"거창",lat:35.66739,lon:127.9099},
  {id:285,name:"합천",lat:35.56505,lon:128.16994},
  {id:288,name:"밀양",lat:35.49147,lon:128.74412},
  {id:289,name:"산청",lat:35.413,lon:127.8791},
  {id:294,name:"거제",lat:34.88818,lon:128.60459},
  {id:295,name:"남해",lat:34.81662,lon:127.92641},
  {id:701,name:"무주",lat:36.00168,lon:127.66836},
  {id:703,name:"진안",lat:35.76036,lon:127.43743}
];

function distanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function findNearestStation(lat, lon) {
  let nearest = null;
  let minDist = Infinity;
  for (const stn of AWS_STATIONS) {
    const d = distanceKm(lat, lon, stn.lat, stn.lon);
    if (d < minDist) {
      minDist = d;
      nearest = { ...stn, distance_km: Math.round(d * 10) / 10 };
    }
  }
  return nearest;
}

function ymd(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

function parseKmaResponse(text, stationId) {
  const lines = text.split('\n');
  const result = {
    time: [],
    temperature_2m_max: [],
    temperature_2m_min: [],
    temperature_2m_mean: [],
    precipitation_sum: [],
    sunshine_duration: []
  };

  const parseVal = (v) => {
    if (v === undefined || v === null) return null;
    const n = parseFloat(v);
    return (isNaN(n) || n <= -9) ? null : n;
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    if (trimmed.startsWith('7777END')) break;

    const parts = trimmed.split(/\s+/);
    if (parts.length < 10) continue;

    const stn = parseInt(parts[1]);
    if (stn !== stationId) continue;

    const tmRaw = parts[0];
    let date;
    if (tmRaw.length >= 8) {
      date = `${tmRaw.slice(0,4)}-${tmRaw.slice(4,6)}-${tmRaw.slice(6,8)}`;
    } else continue;

    result.time.push(date);
    // 표준 컬럼 위치 (실제 응답 확인 후 조정 가능)
    result.temperature_2m_mean.push(parseVal(parts[5]));
    result.temperature_2m_max.push(parseVal(parts[6]));
    result.temperature_2m_min.push(parseVal(parts[7]));
    result.precipitation_sum.push(parseVal(parts[10]) || 0);
    const ssHr = parseVal(parts[11]);
    result.sunshine_duration.push(ssHr !== null ? ssHr * 3600 : null);
  }

  return result;
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=1800'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  try {
    const params = event.queryStringParameters || {};
    const lat = parseFloat(params.lat);
    const lon = parseFloat(params.lon);
    const days = parseInt(params.days) || 14;

    if (!lat || !lon) {
      return {
        statusCode: 400, headers,
        body: JSON.stringify({ error: 'lat, lon 파라미터 필요' })
      };
    }

    const authKey = process.env.KMA_API_KEY;
    if (!authKey) {
      return {
        statusCode: 500, headers,
        body: JSON.stringify({ error: 'KMA_API_KEY 환경변수 미설정' })
      };
    }

    const station = findNearestStation(lat, lon);
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() - 1);
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - (days - 1));

    const tm1 = ymd(startDate);
    const tm2 = ymd(endDate);
    const url = `https://apihub.kma.go.kr/api/typ01/url/sfc_aws_day.php?tm1=${tm1}&tm2=${tm2}&stn=${station.id}&disp=0&help=0&authKey=${authKey}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error(`KMA HTTP ${response.status}`);
    const text = await response.text();

    if (text.includes('활용신청')) {
      return {
        statusCode: 403, headers,
        body: JSON.stringify({
          error: 'sfc_aws_day.php 활용신청 필요',
          hint: 'https://apihub.kma.go.kr/ 에서 활용신청'
        })
      };
    }

    const daily = parseKmaResponse(text, station.id);

    if (daily.time.length === 0) {
      return {
        statusCode: 200, headers,
        body: JSON.stringify({
          daily: null,
          meta: {
            station, source: 'KMA AWS',
            warning: '해당 기간 데이터 없음',
            raw_preview: text.slice(0, 800)
          }
        })
      };
    }

    return {
      statusCode: 200, headers,
      body: JSON.stringify({
        daily,
        meta: {
          station, source: 'KMA AWS',
          period: `${tm1} ~ ${tm2}`
        }
      })
    };

  } catch (e) {
    return {
      statusCode: 500, headers,
      body: JSON.stringify({ error: e.message || '오류' })
    };
  }
};
