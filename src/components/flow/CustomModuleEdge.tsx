import React from 'react';
import { EdgeProps, getBezierPath } from 'reactflow';

export function CustomModuleEdge(props: EdgeProps) {
  const {
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    data,
  } = props;

  const sourceYWithOffset = sourceY + (data?.sourceY || 0);
  const targetYWithOffset = targetY + (data?.targetY || 0);

  const [edgePath] = getBezierPath({
    sourceX,
    sourceY: sourceYWithOffset,
    sourcePosition,
    targetX,
    targetY: targetYWithOffset,
    targetPosition,
  });

  return (
    <path
      style={style}
      className="react-flow__edge-path"
      d={edgePath}
      markerEnd={markerEnd}
    />
  );
}