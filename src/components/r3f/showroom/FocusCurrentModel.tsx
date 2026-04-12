import { useBounds } from '@react-three/drei';
import { useEffect, type RefObject } from 'react';
import type { Group } from 'three';
import type { ShowroomModelId } from '../../../types/showroom';

interface FocusCurrentModelProps {
  targetRef: RefObject<Group | null>;
  selectedId: ShowroomModelId;
  focusVersion: number;
}

export function FocusCurrentModel({
  targetRef,
  selectedId,
  focusVersion,
}: FocusCurrentModelProps) {
  const bounds = useBounds();

  useEffect(() => {
    if (!targetRef.current) return;

    // 放到下一帧再执行，可以确保当前模型已经完成本轮挂载/替换
    const currentModel = targetRef.current;
    const rafId = requestAnimationFrame(() => {
      bounds.refresh(currentModel).clip().fit();
    });

    return () => cancelAnimationFrame(rafId);
  }, [bounds, targetRef, selectedId, focusVersion]);

  return null;
}