import chalk from 'chalk';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';
import { glob } from 'glob';
import path from 'path';
import { replaceInFile } from 'replace-in-file';
const __dirname = fileURLToPath(new URL('.', import.meta.url));

const include3D = false;

const language = 'en';

// any @arcgis/core/widgets or associated view model that will be loaded
// Attribution and Zoom are required b/c the api loads them
// const widgets = ['Attribution', 'Feature', 'Features', 'LayerList', 'Legend', 'Locate', 'Popup', 'Search', 'Zoom'];
const widgets = ['Attribution', 'Zoom'];

// any @arcgis/core/widgets files which are required
const files = ['esri/widgets/support/t9n/uriUtils.json', `esri/widgets/support/t9n/uriUtils_${language}.json`];

const dependencies = [
  '@arcgis/core',
  '@arcgis/lumina',
  '@arcgis/toolkit',
  '@esri/arcgis-html-sanitizer',
  '@esri/calcite-components',
  '@esri/calcite-ui-icons',
];

let readmeLines;

const findLine = (text) => {
  if (!readmeLines) readmeLines = fs.readFileSync('README.md', 'utf8').split(/\r?\n/);

  for (const readmeLine of readmeLines) {
    if (readmeLine.startsWith(text)) {
      return readmeLine;
    }
  }
  return null;
};

(async () => {
  try {
    console.log(chalk.green('Copying @argis/core...'));

    const arcgisSrc = path.resolve(__dirname, './../node_modules/@arcgis/core/assets');

    const arcgisDest = path.resolve(__dirname, './../src/public/arcgis');

    if (!arcgisSrc) {
      console.log(chalk.red.bold('@argis/core must be installed'));

      return;
    }

    if (arcgisDest) {
      await fs.remove(arcgisDest);
    }

    await fs.ensureDir(arcgisDest);

    await fs.copy(arcgisSrc, arcgisDest);

    await fs.remove(`${arcgisDest}/esri/css`);

    await fs.remove(`${arcgisDest}/esri/images`);

    await fs.remove(`${arcgisDest}/esri/symbols`);

    await fs.remove(`${arcgisDest}/esri/themes`);

    if (include3D === false) {
      await fs.remove(`${arcgisDest}/esri/views/3d`);

      await fs.remove(`${arcgisDest}/esri/webscene`);
    }

    const arcGisComponentJson = await glob(`${arcgisDest}/components/assets/**/*.json`);

    for (const file of arcGisComponentJson) {
      if (!file.includes(`${language}.`) && !file.includes('icon')) await fs.remove(file);
    }

    await fs.remove(`${arcgisDest}/esri/widgets`);

    await fs.ensureDir(`${arcgisDest}/esri/widgets`);

    for (const widget of widgets) {
      await fs.copy(`${arcgisSrc}/esri/widgets/${widget}`, `${arcgisDest}/esri/widgets/${widget}`);
    }

    const t9nJson = await glob(`${arcgisDest}/esri/**/t9n/**/*.json`);

    for (const file of t9nJson) {
      if (file.split('_').length > 1 && !file.includes(`_${language}`)) await fs.remove(file);
    }

    for (const file of files) {
      const parts = file.split('/');

      parts.splice(parts.length - 1, 1);

      await fs.ensureDir(`${arcgisDest}/${parts.join('/')}`);

      await fs.copy(`${arcgisSrc}/${file}`, `${arcgisDest}/${file}`);
    }

    console.log(chalk.green('@argis/core assets copied'));

    // dependencies versions
    for (const dependency of dependencies) {
      await replaceInFile({
        files: 'README.md',
        from: findLine('`' + dependency + '`'),
        to:
          '`' +
          dependency +
          '` - ' +
          JSON.parse(fs.readFileSync(`node_modules/${dependency}/package.json`, 'utf8')).version,
      });
    }

    console.log(chalk.green('dependencies versions updated'));
  } catch (error) {
    console.log(error);
  }
}).call();
