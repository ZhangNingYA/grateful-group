import type { ShowroomModelDefinition } from '../types/showroom';

export const showroomModels: ShowroomModelDefinition[] = [
  {
    id: 'watch',
    name: '智能手表',
    summary: '一个偏小的模型，用来测试切换后相机不会离得过远。',
    sizeHint: '小尺寸',
  },
  {
    id: 'speaker',
    name: '蓝牙音箱',
    summary: '一个更宽更厚的模型，用来测试 Bounds 对大物体的自动适配。',
    sizeHint: '大尺寸',
  },
  {
    id: 'lamp',
    name: '台灯',
    summary: '一个偏高的模型，用来测试高纵向包围盒的 framing。',
    sizeHint: '高尺寸',
  },
];