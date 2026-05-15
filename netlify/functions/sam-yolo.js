/**
 * Netlify Function: SAM3 / YOLO 호출 시작
 * 
 * 변경 (2026-05-15): 타임아웃 회피를 위해 폴링 안 함
 * - 함수는 Replicate 호출 시작만 → prediction ID 반환 (1초)
 * - 프론트엔드가 직접 결과 폴링 (백그라운드)
 * 
 * 호출:
 *   POST /.netlify/functions/sam-yolo
 *   Body: { mode: "sam3" | "yolo" | "poll", image, prompt, predictionId }
 * 
 * 응답:
 *   - 시작: { success: true, predictionId, getUrl }
 *   - 폴링: { success: true, status, output }
 * 
 * 환경변수: REPLICATE_API_TOKEN
 */

const REPLICATE_MODELS = {
  sam3: {
    version: '753fe4dbdd890a55e176f19b0603ae1b43c9e7fbd916070df53ffdb2451c7a57',
    owner: 'yodagg/sam3-image-seg'
  },
  yolo: {
    version: 'fd1305d3fc19e81540542f51c2530cf8f393e28cc6ff4976337c3e2b75c7c292',
    owner: 'franz-biz/yolo-world-xl'
  }
};

exports.handler = async function(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const apiToken = process.env.REPLICATE_API_TOKEN;
  if (!apiToken) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'REPLICATE_API_TOKEN 환경변수 없음' 
      })
    };
  }

  try {
    const body = JSON.parse(event.body);
    const { mode, image, prompt, points, point_labels, class_names, predictionId } = body;

    // === 폴링 모드: prediction ID로 상태 조회 ===
    if (mode === 'poll') {
      if (!predictionId) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'predictionId 필요' }) };
      }
      
      const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: { 'Authorization': `Bearer ${apiToken}` }
      });
      
      if (!pollRes.ok) {
        const errText = await pollRes.text();
        return {
          statusCode: pollRes.status,
          headers,
          body: JSON.stringify({ error: `폴링 실패 (${pollRes.status})`, detail: errText })
        };
      }
      
      const result = await pollRes.json();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          status: result.status,
          output: result.output,
          error: result.error,
          predict_time: result.metrics?.predict_time
        })
      };
    }

    // === 시작 모드: SAM3 또는 YOLO 호출 ===
    if (!image) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'image 필수' }) };
    }

    let modelInfo, input;

    if (mode === 'sam3' || !mode) {
      modelInfo = REPLICATE_MODELS.sam3;
      input = {
        image: image,
        prompt: prompt || 'apple',
        max_masks: 50,
        return_polygons: true,
        multimask_output: true,
        confidence_threshold: 0.3,
        visualize_output: false
      };
      if (points && points.length > 0) {
        input.points = JSON.stringify(points);
        if (point_labels) input.point_labels = JSON.stringify(point_labels);
      }
    } else if (mode === 'yolo') {
      modelInfo = REPLICATE_MODELS.yolo;
      input = {
        input_media: image,
        class_names: class_names || 'apple, red apple, fuji apple',
        score_thr: 0.15,
        nms_thr: 0.5,
        max_num_boxes: 50,
        return_json: true
      };
    } else {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'mode는 sam3, yolo, poll 중 하나' }) };
    }

    // Replicate prediction 시작 — 결과 안 기다림
    const startRes = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ version: modelInfo.version, input: input })
    });

    if (!startRes.ok) {
      const errorText = await startRes.text();
      console.error('[Replicate Start] 오류:', errorText);
      return {
        statusCode: startRes.status,
        headers,
        body: JSON.stringify({ 
          error: `Replicate API 시작 실패 (${startRes.status})`,
          detail: errorText
        })
      };
    }

    const prediction = await startRes.json();
    
    // 즉시 ID만 반환 (폴링 없음 → 타임아웃 회피)
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        predictionId: prediction.id,
        status: prediction.status,
        mode: mode || 'sam3'
      })
    };

  } catch (error) {
    console.error('[sam-yolo] 오류:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || '알 수 없는 오류' })
    };
  }
};
