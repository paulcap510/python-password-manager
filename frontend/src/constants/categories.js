export const CATEGORIES = [
  {
    name: 'Work',
    icon: '💼',
    colorVar: '--work',
    bgVar: '--work-bg',
  },
  {
    name: 'Personal',
    icon: '👤',
    colorVar: '--personal',
    bgVar: '--personal-bg',
  },
  {
    name: 'Finance',
    icon: '💳',
    colorVar: '--finance',
    bgVar: '--finance-bg',
  },
  {
    name: 'Other',
    icon: '🏷️',
    colorVar: '--notes',
    bgVar: '--notes-bg',
  },
];

export function getCategoryInfo(categoryName) {
  return CATEGORIES.find((category) => category.name === categoryName);
}
