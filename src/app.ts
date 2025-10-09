import './main.scss';

import esriConfig from '@arcgis/core/config';
import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import { defineCustomElements } from '@esri/calcite-components/dist/loader';

const load = () => {
  // arcgis config
  esriConfig.portalUrl = 'https://gis.vernonia-or.gov/portal';
  esriConfig.assetsPath = './arcgis';

  // calcite assets
  defineCustomElements(window, { resourcesUrl: './arcgis/components/assets' });

  const view = new MapView({
    center: [-123.18, 45.86],
    container: document.getElementById('map') as HTMLDivElement,
    map: new Map({
      basemap: 'topo-vector',
    }),
    zoom: 15,
  });

  view.ui.remove(['attribution', 'zoom']);
};

load();
