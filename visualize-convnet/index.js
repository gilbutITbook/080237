/**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */

/**
 * visualize-convnet 예제의 프론트 엔드 스크립트.
 *
 * 이미지 파일과 Node.js에서 main.js으로 생성한 메타 정보를 출력합니다.
 */

const vizSection = document.getElementById('viz-section');
const vizTypeSelect = document.getElementById('viz-type');
const imageResultSection = document.getElementById('image-result');

function normalizePath(path) {
  return path.startsWith('dist/') ? path.slice(5) : path;
}

async function run() {
  //  입력-결과 섹션을 비웁니다.
  while (imageResultSection.firstChild) {
    imageResultSection.removeChild(imageResultSection.firstChild);
  }
  // 시각화 섹션을 비웁니다.
  while (vizSection.firstChild) {
    vizSection.removeChild(vizSection.firstChild);
  }

  const activationManifest =
      await (await fetch('activation/activation-manifest.json')).json();
  const filterManifest =
      await (await fetch('filters/filters-manifest.json')).json();

  // 이미지-결과 섹션에 이미지를 렌더링합니다.
  const inputImage = document.createElement('img');
  inputImage.classList.add('input-image');
  inputImage.src = normalizePath(activationManifest.origImagePath);
  imageResultSection.appendChild(inputImage);

  // 최상위 3개 분류 결과를 렌더링합니다.
  for (let i = 0; i < 3; ++i) {
    const outputClassDiv = document.createElement('div');
    outputClassDiv.textContent = `${activationManifest.classNames[i]} ` +
        `(p=${activationManifest.probScores[i].toFixed(4)})`;
    imageResultSection.appendChild(outputClassDiv);
  }

  const vizType = vizTypeSelect.value;

  if (vizType === 'activation') {
    const layerNames = Object.keys(activationManifest.layerName2FilePaths);
    layerNames.sort();
    for (let i = 0; i < layerNames.length; ++i) {
      const layerName = layerNames[i];
      const filePaths = activationManifest.layerName2FilePaths[layerName];

      const layerDiv = document.createElement('div');
      layerDiv.classList.add('layer-div');
      const layerNameSpan = document.createElement('div');
      const height = activationManifest.layerName2ImageDims[layerName][0];
      const width = activationManifest.layerName2ImageDims[layerName][1];
      layerNameSpan.textContent = `Layer "${layerName}" (${height}x${width})`;
      layerDiv.appendChild(layerNameSpan);

      const layerFiltersDiv = document.createElement('div');
      layerFiltersDiv.classList.add('layer-filters');
      for (let j = 0; j < filePaths.length; ++j) {
        const filterDiv = document.createElement('div');
        filterDiv.classList.add('filter-div');
        const activationImg = document.createElement('img');
        activationImg.classList.add('activation-image');
        activationImg.src = normalizePath(filePaths[j]);
        filterDiv.appendChild(activationImg);
        layerFiltersDiv.appendChild(filterDiv);
      }
      layerDiv.appendChild(layerFiltersDiv);
      vizSection.appendChild(layerDiv);
    }
  } else if (vizType === 'filters') {
    for (let i = 0; i < filterManifest.layers.length; ++i) {
      const layerName = filterManifest.layers[i].layerName;
      const filePaths = filterManifest.layers[i].filePaths;

      const layerDiv = document.createElement('div');
      layerDiv.classList.add('layer-div');
      const layerNameSpan = document.createElement('div');
      layerNameSpan.textContent = `Layer "${layerName}"`;
      layerDiv.appendChild(layerNameSpan);

      const layerFiltersDiv = document.createElement('div');
      layerFiltersDiv.classList.add('layer-filters');
      for (let j = 0; j < filePaths.length; ++j) {
        const filterDiv = document.createElement('div');
        filterDiv.classList.add('filter-div');
        if (vizType === 'filters') {
          const filterImg = document.createElement('img');
          filterImg.classList.add('filter-image');
          filterImg.src = normalizePath(filePaths[j]);
          filterDiv.appendChild(filterImg);
        }
        layerFiltersDiv.appendChild(filterDiv);
      }
      layerDiv.appendChild(layerFiltersDiv);
      vizSection.appendChild(layerDiv);
    }
  } else if (vizType === 'cam') {
    const imgDiv = document.createElement('div');
    imgDiv.classList.add('cam-image');
    const img = document.createElement('img');
    img.src = normalizePath(activationManifest.camImagePath);
    imgDiv.appendChild(img);

    vizSection.appendChild(imgDiv);
  }
};

vizTypeSelect.addEventListener('change', run);

run();
