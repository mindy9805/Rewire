/** 依習慣渲染對應的互動工具 */
import type { H7Id } from '../../types';
import CirclesTool from './CirclesTool';
import LifeCompassTool from './LifeCompassTool';
import QuadrantTool from './QuadrantTool';
import NegotiationTool from './NegotiationTool';
import EmpathyTool from './EmpathyTool';
import TeamBoardTool from './TeamBoardTool';
import RenewalTool from './RenewalTool';

export default function H7Tool({ id }: { id: H7Id }) {
  switch (id) {
    case 'proactive': return <CirclesTool />;
    case 'end': return <LifeCompassTool />;
    case 'first': return <QuadrantTool />;
    case 'winwin': return <NegotiationTool />;
    case 'understand': return <EmpathyTool />;
    case 'synergize': return <TeamBoardTool />;
    case 'renew': return <RenewalTool />;
  }
}
