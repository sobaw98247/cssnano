import { list } from 'postcss';
import lowercaseEq from './lowercaseEq';
import { isWidth, isStyle, isColor } from './validateWsc';

const none = /^\s*(none|medium)(\s+none(\s+(none|currentcolor))?)?\s*$/i;

const varRE = /(^.*var)(.*\(.*--.*\))(.*)/i;
const varPreserveCase = (p) =>
  `${p[1].toLowerCase()}${p[2]}${p[3].toLowerCase()}`;
const toLower = (v) => {
  const match = varRE.exec(v);
  return match ? varPreserveCase(match) : v.toLowerCase();
};

export default function parseWsc(value) {
  if (none.test(value)) {
    return ['medium', 'none', 'currentcolor'];
  }

  let width, style, color;

  const values = list.space(value);

  if (
    values.length > 1 &&
    isStyle(values[1]) &&
    lowercaseEq('none', values[0])
  ) {
    values.unshift();
    width = '0';
  }

  const unknown = [];

  values.forEach((v) => {
    if (isStyle(v)) {
      style = toLower(v);
    } else if (isWidth(v)) {
      width = toLower(v);
    } else if (isColor(v)) {
      color = toLower(v);
    } else {
      unknown.push(v);
    }
  });

  if (unknown.length) {
    if (!width && style && color) {
      width = unknown.pop();
    }

    if (width && !style && color) {
      style = unknown.pop();
    }

    if (width && style && !color) {
      color = unknown.pop();
    }
  }

  return [width, style, color];
}
