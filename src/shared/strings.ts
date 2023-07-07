import pinyin from 'tiny-pinyin';
import nzh from 'nzh';

export const stringOrEmpty = (value: string | undefined) => {
  return value ? value : ''
};

export function isValidChineseName(s: string | null): boolean {
  return !!s && s.length >= 2 && pinyin.parse(s).every(token => token.type === 2);
}

export function toPinyin(s: string) {
  return pinyin.convertToPinyin(s, /*separator=*/ '', /*lowerCase=*/ true);
}

export function formatUserName(name: string | null, mood: 'friendly' | 'formal') {
  if (!name) return '无名氏';
  return mood === 'friendly' ? name.substring(Math.max(0, name.length - 2)) : name;
}

export function formatGroupName(name: string | null, userCount: number): string {
  return name ?? (userCount <= 2 ? '一对一通话' : `${nzh.cn.encodeS(userCount)}人通话`);
}

// TODO: Sort out this Date-is-not-actually-string weirdness
function diffInMinutes(from: Date, to: Date): number {
  return Math.floor((new Date(to).getTime() - new Date(from).getTime()) / 1000 / 60)
}

export function prettifyDuration(from: Date, to: Date) {
  return `${diffInMinutes(from, to)} 分钟`;
}

function capitalizeFirstChar(str : string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// TODO: Sort out this Date-is-actually-string thing weirdness
export function prettifyDate(str: Date) {
  const date = new Date(str);
  const now = new Date();
  const dim = diffInMinutes(date, now);
  if (dim < 24 * 60) return `${Math.floor(dim / 60)} 小时前`;
  if (dim < 30 * 24 * 60) return `${Math.floor(dim / 24 / 60)} 天前`;
  if (date.getFullYear() == now.getFullYear()) {
    return date.toLocaleDateString('zh-cn', { day: 'numeric', month: 'short' });
  }
  return date.toLocaleDateString('zh-cn', { day: 'numeric', month: 'short', year: 'numeric' });
}