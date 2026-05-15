/**
 * Netlify Function: SAM3로 사과 자동 분할
 * 
 * 모델: yodagg/sam3-image-seg
 * Version: 753fe4dbdd890a55e176f19b0603ae1b43c9e7fbd916070df53ffdb2451c7a57
 * 
 * 호출 방법:
 * POST /.netlify/functions/sam-yolo
 * Body: { mode: "sam3", image: "data:...", prompt: "apple" }
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
        error: 'REPLICATE_API_TOKEN 환경변수 없음. Netlify Settings → Environment variables에서 등록하세요.' 
      })
    };
  }

  try {
    const body = JSON.parse(event.body);
    const { mode, image, prompt, points, point_labels, class_names } = body;

    if (!image) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'image는 필수입니다' }) };
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
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'mode는 sam3 또는 yolo' }) };
    }

    // Replicate API 호출
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
    
    // 폴링
    let result = prediction;
    let attempts = 0;
    const MAX_ATTEMPTS = 90;
    
    while (
      result.status !== 'succeeded' && 
      result.status !== 'failed' && 
      result.status !== 'canceled' &&
      attempts < MAX_ATTEMPTS
    ) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const pollRes = await fetch(result.urls.get, {
        headers: { 'Authorization': `Bearer ${apiToken}` }
      });
      if (!pollRes.ok) {
        return { statusCode: 500, headers, body: JSON.stringify({ error: '폴링 실패' }) };
      }
      result = await pollRes.json();
      attempts++;
    }

    if (result.status === 'failed' || result.status === 'canceled') {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: `처리 실패: ${result.status}`,
          detail: result.error || '알 수 없음'
        })
      };
    }

    if (result.status !== 'succeeded') {
      return { statusCode: 504, headers, body: JSON.stringify({ error: '시간 초과 (90초)' }) };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        mode: mode || 'sam3',
        output: result.output,
        predict_time: result.metrics?.predict_time
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
