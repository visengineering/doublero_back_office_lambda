import { v4 as uuid } from 'uuid';
import latinize from 'latinize';
import crypto from 'crypto';

export class DataUtil {

  public static generateId(): string {
    return uuid();
  }

  public static getTimestamp(): string {
    return new Date().getTime().toString();
  }

  /**
   * Returns a random number between min (inclusive) and max (exclusive)
   */
  public static getRandomArbitrary(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  /**
   * Returns a random integer between min (inclusive) and max (inclusive).
   * The value is no lower than min (or the next integer greater than min
   * if min isn't an integer) and no greater than max (or the next integer
   * lower than max if max isn't an integer).
   * Using Math.round() will give you a non-uniform distribution!
   */
  public static getRandomInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  public static getUrlHandle(title = '') {
    return latinize(title)
      .replace(/["'.]/g, '')
      .replace(/\s+/g, '-')
      .replace(/\W+/g, '-')
      .replace(/^-*/, '')
      .replace(/-*$/, '')
      .replace(/-+/, '-')
      .toLowerCase();
  }

  public static capitalizeFirstLetter(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  }

  public static capitalizeFirstLettersForSentence(value = ''): string {
    return value.split(' ').map((c: string) => DataUtil.capitalizeFirstLetter(c)).join(' ');
  }

  public static regExpEscape(string: string) {
    return string.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  }

  public static htmlDecode(str = '') {
    return String(str)
      .replace(/<p>/g, '')
      .replace(/<b>/g, '')
      .replace(/<\/p>/g, ' ')
      .replace(/<\/b>/g, ' ')
      .replace(/' {2}'/g, ' ')
      .replace(/(\r\n\t|\n|\r\t)/gm, '');
  }

  public static getHash(data = '') {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

}
