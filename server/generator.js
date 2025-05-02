const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const JavaScriptObfuscator = require('javascript-obfuscator');
const archiver = require('archiver');
const fsSync = require('fs');

const GENERATED_DIR = path.resolve(__dirname, '../generated-scripts');
const LICENSE_PATH = path.resolve(__dirname, 'LICENSE');
const README_PATH = path.resolve(__dirname, 'README.txt');
const TEMP_SCRIPT_NAME = 'snowfall.min.js';

const DEVELOPER_COMMENT = `/*
 * Snowfall script
 * Create your own snowfall at https://snowfall-generator.ru
 * Author: Yuriy Plotnikov (https://yuriyplotnikovv.ru)
 * License: GNU AGPLv3
 * https://www.gnu.org/licenses/agpl-3.0.html
 */
`;

function getShortFileName(params) {
  const timestamp = Date.now();
  const json = JSON.stringify(params);
  const hash = require('crypto').createHash('sha256').update(json).digest('hex').slice(0, 8);
  return `script_${hash}_${timestamp}`;
}

function escapeForTemplateLiteral(str) {
  return str.replace(/\\/g, '\\\\').replace(/`/g, '\\`');
}

async function generateScript(params) {
  await fs.mkdir(GENERATED_DIR, {recursive: true});

  const baseName = getShortFileName(params);
  const zipFileName = `${baseName}.zip`;
  const zipFilePath = path.join(GENERATED_DIR, zipFileName);
  const tempScriptPath = path.join(GENERATED_DIR, TEMP_SCRIPT_NAME);

  try {
    await fs.access(zipFilePath);
    return zipFilePath;
  }
  catch {
  }

  let snowflakeSVG = '';
  if (params.customSnowflakeSVG && params.customSnowflakeSVG.trim() !== '') {
    snowflakeSVG = params.customSnowflakeSVG;
  } else if (
    params.snowflakesType &&
    params.snowflakesSVG &&
    Object.prototype.hasOwnProperty.call(params.snowflakesSVG, params.snowflakesType)
  ) {
    snowflakeSVG = params.snowflakesSVG[params.snowflakesType];
  }
  snowflakeSVG = escapeForTemplateLiteral(snowflakeSVG);

  const code = `
document.addEventListener('DOMContentLoaded', () => {
  const SNOWFLAKE_SVG_PATH = \`${snowflakeSVG}\`;

  const SNOWFLAKES_COUNT_BASE = ${Number(params.snowflakesCount)};
  const SNOWFLAKES_SIZE_MIN = ${params.snowflakesSize[0]};
  const SNOWFLAKES_SIZE_MAX = ${params.snowflakesSize[1]};
  const SNOWFLAKES_OPACITY_MIN = ${params.snowflakesVisibility[0]};
  const SNOWFLAKES_OPACITY_MAX = ${params.snowflakesVisibility[1]};
  const FALL_SPEED_MIN = ${params.snowfallSpeed[0]};
  const FALL_SPEED_MAX = ${params.snowfallSpeed[1]};

  const SWAY_ENABLED = ${params.swayEnabled ? 'true' : 'false'};
  const SWAY_PROBABILITY = 0.5;
  const SWAY_AMPLITUDE_MIN = ${params.swayAmplitude[0]};
  const SWAY_AMPLITUDE_MAX = ${params.swayAmplitude[1]};
  const SWAY_FREQUENCY_MIN = ${params.swayFrequency[0]};
  const SWAY_FREQUENCY_MAX = ${params.swayFrequency[1]};

  const WIND_TYPE_LEFT = 'left';
  const WIND_TYPE_RIGHT = 'right';
  const WIND_ENABLED = ${params.windType ? 'true' : 'false'};
  const WIND_TYPE = '${params.windType}';
  const WIND_SPEED = ${params.windSpeed};

  const ROTATION_ENABLED = ${params.rotationEnabled ? 'true' : 'false'};
  const ROTATION_PROBABILITY = 0.5;
  const ROTATION_SPEED_MIN = ${params.rotationSpeed[0]};
  const ROTATION_SPEED_MAX = ${params.rotationSpeed[1]};

  function getRandomInRange(min, max) {
    return min + Math.random() * (max - min);
  }

  function getSnowflakeCountByWidth(width) {
    let count;
    if (width <= 767) {
      count = Math.floor(SNOWFLAKES_COUNT_BASE / 3);
    } else if (width <= 1325) {
      count = Math.floor((SNOWFLAKES_COUNT_BASE * 2) / 3);
    } else {
      count = SNOWFLAKES_COUNT_BASE;
    }

    return Math.max(count, 30);
  }

  function createSnowflakeElement() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = SNOWFLAKE_SVG_PATH.trim();
    const svgElement = wrapper.firstChild;
    if (!svgElement) return document.createElement('div');
    Object.assign(svgElement.style, {
      width: '100%',
      height: '100%',
      display: 'block',
      pointerEvents: 'none',
      userSelect: 'none',
    });
    return svgElement;
  }

  function generateInitialX(index, segmentWidth) {
    if (!WIND_ENABLED) {
      return segmentWidth * index + getRandomInRange(0, segmentWidth);
    }
    if (WIND_TYPE === WIND_TYPE_LEFT) {
      if ((WIND_SPEED >= 50 && viewportWidth <= 767) || WIND_SPEED >= 100) {
        return getRandomInRange(-viewportWidth, viewportWidth);
      } else {
        return getRandomInRange(-viewportWidth * 0.5, viewportWidth);
      }
    }

    if (WIND_TYPE === WIND_TYPE_RIGHT) {
      if ((WIND_SPEED >= 50 && viewportWidth <= 767) || WIND_SPEED >= 100) {
        return getRandomInRange(0, viewportWidth * 2);
      } else {
        return getRandomInRange(0, viewportWidth * 1.5);
      }
    }

    return segmentWidth * index + getRandomInRange(0, segmentWidth);
  }

  function createSnowflake(index, total) {
    const wrapper = document.createElement('div');
    Object.assign(wrapper.style, {
      position: 'absolute',
      left: '0',
      top: '0',
      willChange: 'transform',
      pointerEvents: 'none',
      userSelect: 'none',
      display: 'block',
    });

    const size = getRandomInRange(SNOWFLAKES_SIZE_MIN, SNOWFLAKES_SIZE_MAX);
    const opacity = getRandomInRange(SNOWFLAKES_OPACITY_MIN, SNOWFLAKES_OPACITY_MAX);
    const fallSpeed = getRandomInRange(FALL_SPEED_MIN, FALL_SPEED_MAX);

    let swayAmplitude = 0;
    let swayFrequency = 0;
    let swayPhase = 0;
    if (SWAY_ENABLED && Math.random() < SWAY_PROBABILITY) {
      swayAmplitude = getRandomInRange(SWAY_AMPLITUDE_MIN, SWAY_AMPLITUDE_MAX);
      swayFrequency = getRandomInRange(SWAY_FREQUENCY_MIN, SWAY_FREQUENCY_MAX);
      swayPhase = Math.random() * 2 * Math.PI;
    }

    const segmentWidth = viewportWidth / total;

    let windVelocity = 0;
    if (WIND_ENABLED) {
      if (WIND_TYPE === WIND_TYPE_LEFT) windVelocity = WIND_SPEED;
      else if (WIND_TYPE === WIND_TYPE_RIGHT) windVelocity = -WIND_SPEED;
    }

    let rotationSpeed = 0;
    if (ROTATION_ENABLED && Math.random() < ROTATION_PROBABILITY) {
      rotationSpeed = getRandomInRange(ROTATION_SPEED_MIN, ROTATION_SPEED_MAX) * (Math.random() < 0.5 ? 1 : -1);
    }

    const initialX = generateInitialX(index, segmentWidth);
    const initialY = getRandomInRange(0, viewportHeight);
    const segmentOffset = (initialX - segmentWidth * index) / segmentWidth;

    const svgElement = createSnowflakeElement();

    wrapper.style.width = size + 'px';
    wrapper.style.height = size + 'px';
    wrapper.style.opacity = opacity.toFixed(2);
    wrapper.style.transform = \`translate(\${initialX}px, \${initialY}px)\`;

    wrapper.appendChild(svgElement);

    return {
      element: wrapper,
      x: initialX,
      y: initialY,
      size,
      opacity,
      fallSpeed,
      windVelocity,
      swayAmplitude,
      swayFrequency,
      swayPhase,
      rotationSpeed,
      rotationAngle: Math.random() * 360,
      initialX,
      segmentIndex: index,
      segmentOffset: segmentOffset,
      segmentWidth,
    };
  }

  function initSnowflakes() {
    snowflakeContainer.innerHTML = '';
    snowflakes = [];
    snowflakeCount = getSnowflakeCountByWidth(viewportWidth);

    for (let i = 0; i < snowflakeCount; i++) {
      const snowflake = createSnowflake(i, snowflakeCount);
      snowflakeContainer.appendChild(snowflake.element);
      snowflakes.push(snowflake);
    }
  }

  function updateSegments() {
    const segmentWidth = viewportWidth / snowflakes.length;

    for (const snowflake of snowflakes) {
      snowflake.segmentWidth = segmentWidth;

      const newInitialX = segmentWidth * snowflake.segmentIndex + segmentWidth * snowflake.segmentOffset;
      const offsetFromInitial = snowflake.x - snowflake.initialX;
      snowflake.initialX = newInitialX;
      snowflake.x = snowflake.initialX + offsetFromInitial;

      if (snowflake.y > viewportHeight) {
        snowflake.y = -snowflake.size;
      }
    }
  }

  function animationStep(currentTimestamp) {
    let deltaTime = (currentTimestamp - previousTimestamp) / 1000;
    if (deltaTime < 0 || deltaTime > 0.1) {
      deltaTime = 0.016;
    }

    previousTimestamp = currentTimestamp;

    for (const snowflake of snowflakes) {
      snowflake.y += snowflake.fallSpeed * deltaTime;

      let swayOffset = 0;
      if (SWAY_ENABLED && snowflake.swayAmplitude !== 0) {
        swayOffset = snowflake.swayAmplitude * Math.sin(2 * Math.PI * snowflake.swayFrequency * currentTimestamp / 1000 + snowflake.swayPhase);
      }

      if (!WIND_ENABLED) {
        snowflake.x = snowflake.initialX + swayOffset;
      } else {
        snowflake.initialX += snowflake.windVelocity * deltaTime;
        snowflake.x = snowflake.initialX + swayOffset;
      }

      if (ROTATION_ENABLED && snowflake.rotationSpeed !== 0) {
        snowflake.rotationAngle = (snowflake.rotationAngle + snowflake.rotationSpeed * deltaTime) % 360;
      }

      if (snowflake.y > viewportHeight) {
        snowflake.y = -snowflake.size;
        snowflake.initialX = generateInitialX(snowflake.segmentIndex, snowflake.segmentWidth);
        snowflake.x = snowflake.initialX;
        snowflake.swayPhase = Math.random() * 2 * Math.PI;
        snowflake.rotationAngle = ROTATION_ENABLED ? Math.random() * 360 : 0;
      }

      const rotationPart = ROTATION_ENABLED ? \` rotate(\${snowflake.rotationAngle.toFixed(2)}deg)\` : '';
      snowflake.element.style.transform = \`translate(\${snowflake.x.toFixed(2)}px, \${snowflake.y.toFixed(2)}px)\${rotationPart}\`;
    }

    requestAnimationFrame(animationStep);
  }

  function handleResize() {
    clearTimeout(handleResize.timeout);
    handleResize.timeout = setTimeout(() => {
      const newViewportWidth = window.visualViewport ? window.visualViewport.width : window.innerWidth;
      const newViewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;

      const widthChanged = newViewportWidth !== previousViewportWidth;
      const heightChanged = newViewportHeight !== viewportHeight;
      viewportHeight = newViewportHeight;

      if (widthChanged) {
        viewportWidth = newViewportWidth;
        previousViewportWidth = newViewportWidth;

        const newCount = getSnowflakeCountByWidth(viewportWidth);
        if (newCount !== snowflakeCount) {
          snowflakeCount = newCount;
          cancelAnimationFrame(animationFrameId);
          initSnowflakes();
          previousTimestamp = performance.now();
          animationFrameId = requestAnimationFrame(animationStep);
        } else {
          updateSegments();
        }
      } else if (heightChanged) {
        for (const snowflake of snowflakes) {
          if (snowflake.y > viewportHeight) {
            snowflake.y = -snowflake.size;
          }
        }
      }
    }, 100);
  }

  let container = document.getElementById('snow-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'snow-container';
    Object.assign(container.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
      pointerEvents: 'none',
      overflow: 'visible',
      zIndex: '9999',
      background: 'transparent',
    });
    document.body.appendChild(container);
  }

  let shadow = container.shadowRoot;
  if (!shadow) {
    shadow = container.attachShadow({ mode: 'closed' });
  }

  const snowflakeContainer = document.createElement('div');
  Object.assign(snowflakeContainer.style, {
    position: 'relative',
    width: '100vw',
    height: '100vh',
    overflow: 'visible',
  });

  shadow.innerHTML = '';
  shadow.appendChild(snowflakeContainer);

  let viewportWidth = window.visualViewport ? window.visualViewport.width : window.innerWidth;
  let viewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
  let previousViewportWidth = viewportWidth;
  let snowflakes = [];
  let previousTimestamp = performance.now();
  let snowflakeCount = getSnowflakeCountByWidth(viewportWidth);
  let animationFrameId;

  initSnowflakes();

   window.addEventListener('resize', handleResize);

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      previousTimestamp = performance.now();
    }
  });

  animationFrameId = requestAnimationFrame(animationStep);
  });
`;

  const obfuscated = JavaScriptObfuscator.obfuscate(code, {
    compact: true,
    identifierNamesGenerator: 'mangled-shuffled',
  });

  let finalCode = DEVELOPER_COMMENT + '\n' + obfuscated.getObfuscatedCode();

  await fs.writeFile(tempScriptPath, finalCode, 'utf8');

  await new Promise((resolve, reject) => {
    const output = fsSync.createWriteStream(zipFilePath);
    const archive = archiver('zip', {zlib: {level: 9}});

    output.on('close', () => {
      fs.unlink(tempScriptPath).catch(() => {
      });
      resolve();
    });

    archive.on('error', err => reject(err));

    archive.pipe(output);

    archive.file(tempScriptPath, {name: TEMP_SCRIPT_NAME});
    archive.file(LICENSE_PATH, {name: 'LICENSE'});
    archive.file(README_PATH, {name: 'README.txt'});

    archive.finalize();
  });

  return zipFilePath;
}

module.exports = {generateScript};
